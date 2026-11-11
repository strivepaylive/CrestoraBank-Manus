import { invoicesRouter } from "./routers/invoices";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { registrations, otpVerifications, chatMessages, notifications, transactions, userNotifications, cards, loginSessions, depositRequests, users } from "../drizzle/schema";
import { supportMessages, loanApplications } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "./passwordUtils";
import { bustRevocationCache } from "./sessionRevocation";
import { sdk } from "./_core/sdk";
import { upsertUser, createUserNotification } from "./db";
import {
  sendOTPEmail,
  sendSupportNotificationEmail,
  sendRegistrationReceivedEmail,
  sendLoginNotificationEmail,
  sendTransferPendingEmail,
  sendSecurityChangeEmail,
  sendDepositReceivedEmail,
  sendWithdrawalEmail,
  sendLoanReceivedEmail,
  sendLoanApprovedEmail,
  sendLoanDeclinedEmail,
} from "./emailService";
import { getConversionQuote, SUPPORTED_CURRENCIES } from "./currencyService";
import { storagePut } from "./storage";

// Helper to generate OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate a unique 10-digit account number
function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Helper to generate a transaction reference like CRB-20260706-8F3K2A
function generateTransactionReference(): string {
  const d = new Date();
  const datePart = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CRB-${datePart}-${rand}`;
}

// Helper to generate a loan reference like LN-20260707-8F3K2A
function generateLoanReference(): string {
  const d = new Date();
  const datePart = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LN-${datePart}-${rand}`;
}

// Employers available for Employment Loan applications
const LOAN_EMPLOYERS = [
  "Halifax Public Libraries",
  "Halifax Regional Municipality",
  "Nova Scotia Health Authority",
  "Dalhousie University",
  "Canada Post",
  "Bell Canada",
  "Sobeys Inc.",
  "Irving Shipbuilding",
  "RBC Royal Bank",
  "Government of Canada",
  "Amazon",
  "Walmart",
  "Other",
];

// APR by loan category (employment loans get a preferential rate)
function loanApr(category: 'personal' | 'employment'): number {
  return category === 'employment' ? 8.5 : 12.5;
}

// Standard amortized monthly payment
function calcMonthlyPayment(principal: number, aprPct: number, months: number): number {
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

// Helper to check if user is admin
function adminProcedure(procedure: typeof protectedProcedure) {
  return procedure.use(({ ctx, next }) => {
    if (ctx.user?.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx });
  });
}

// Helper: resolve the bank registration for a logged-in customer session
async function getRegistrationFromCtx(ctx: { user: { openId: string } }) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
  const openId = ctx.user.openId;
  if (!openId.startsWith('reg_')) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a bank customer session' });
  const regId = parseInt(openId.slice(4));
  const rows = await db.select().from(registrations).where(eq(registrations.id, regId)).limit(1);
  if (rows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
  return { db, regId, reg: rows[0] };
}

// Derive a friendly device label from a user-agent string
function deriveDeviceLabel(ua: string): string {
  let os = 'Unknown OS';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  return `${browser} on ${os}`;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  invoices: invoicesRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
      updateAvatar: protectedProcedure
    .input(z.object({ avatarUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) {
        await db.update(users).set({ avatarUrl: input.avatarUrl }).where(eq(users.id, ctx.user.id));
        // Bank customer sessions use openId reg_<registrationId>; persist to registrations too
        const openId = ctx.user.openId || '';
        if (openId.startsWith('reg_')) {
          const regId = parseInt(openId.slice(4));
          if (!isNaN(regId)) {
            await db.update(registrations).set({ avatarUrl: input.avatarUrl }).where(eq(registrations.id, regId));
          }
        }
      }
      return { success: true };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Registration flow
  registration: router({
    startRegistration: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        middleName: z.string().optional(),
        lastName: z.string().min(1),
        username: z.string().min(3).max(50),
        browserLanguage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const uname = input.username.trim();
        const existing = await db.select().from(registrations)
          .where(sql`LOWER(TRIM(${registrations.username})) = LOWER(${uname})`)
          .limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Username already taken' });
        }

        const { normalizeLanguage } = await import('./emailI18n');
        const result = await db.insert(registrations).values({
          firstName: input.firstName.trim(),
          middleName: input.middleName || null,
          lastName: input.lastName.trim(),
          username: uname,
          status: 'pending',
          preferredLanguage: normalizeLanguage(input.browserLanguage),
        });

        return { registrationId: result[0].insertId };
      }),

    submitContactDetails: publicProcedure
      .input(z.object({
        registrationId: z.number(),
        contactMethod: z.enum(['email', 'phone']),
        email: z.string().email().optional(),
        phone: z.string().min(5, "Phone number is required"),
        nationality: z.string().min(1, "Nationality is required"),
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        address: z.string().min(1, "Address is required"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        if (input.contactMethod === 'email' && !input.email) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email required' });
        }
        if (!input.phone) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Phone required' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.update(registrations)
          .set({
            contactMethod: input.contactMethod as 'email' | 'phone',
            email: input.email || null,
            phone: input.phone,
            nationality: input.nationality,
            dateOfBirth: input.dateOfBirth,
            address: input.address,
          })
          .where(eq(registrations.id, input.registrationId));

        await db.insert(otpVerifications).values({
          registrationId: input.registrationId,
          code: otp,
          channel: input.contactMethod as 'email' | 'sms',
          expiresAt,
        });

        // Send real email OTP
        if (input.contactMethod === 'email' && input.email) {
          try {
            const regRow = await db.select().from(registrations).where(eq(registrations.id, input.registrationId)).limit(1);
            const emailSent = await sendOTPEmail(input.email, otp, regRow[0]?.preferredLanguage);
            if (!emailSent) {
              console.error(`[OTP] Failed to send email to ${input.email}`);
              throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'We could not send your verification code right now. Please try again in a few minutes.' });
            }
          } catch (error) {
            console.error(`[OTP] Email error:`, error);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'We could not send your verification code right now. Please try again in a few minutes.' });
          }
        } else if (input.contactMethod === 'phone') {
          console.log(`[SMS] OTP for ${input.phone}: ${otp} (SMS not configured)`);
        }

        return { success: true, message: `OTP sent to ${input.contactMethod}` };
      }),

    verifyOTP: publicProcedure
      .input(z.object({
        registrationId: z.number(),
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const otp = await db.select().from(otpVerifications)
          .where(and(
            eq(otpVerifications.registrationId, input.registrationId),
            eq(otpVerifications.code, input.code)
          ))
          .limit(1);

        if (otp.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid OTP code' });
        }

        const otpRecord = otp[0];
        if (new Date() > otpRecord.expiresAt) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'OTP expired' });
        }

        await db.update(otpVerifications)
          .set({ isVerified: true })
          .where(eq(otpVerifications.id, otpRecord.id));

        await db.update(registrations)
          .set({ status: 'verified' })
          .where(eq(registrations.id, input.registrationId));

        return { success: true };
      }),

    resendOTP: publicProcedure
      .input(z.object({
        registrationId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const reg = await db.select().from(registrations)
          .where(eq(registrations.id, input.registrationId))
          .limit(1);

        if (reg.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Registration not found' });
        }

        const registration = reg[0];
        if (!registration.contactMethod) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Contact method not set' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.insert(otpVerifications).values({
          registrationId: input.registrationId,
          code: otp,
          channel: registration.contactMethod as 'email' | 'sms',
          expiresAt,
        });

        if (registration.contactMethod === 'email' && registration.email) {
          await sendOTPEmail(registration.email, otp, registration.preferredLanguage);
        } else if (registration.contactMethod === 'phone') {
          console.log(`[SMS] OTP resent to ${registration.phone}: ${otp}`);
        }

        return { success: true, message: `OTP resent to ${registration.contactMethod}` };
      }),

    completeRegistration: publicProcedure
      .input(z.object({
        registrationId: z.number(),
        password: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const hashedPassword = await hashPassword(input.password);
        // Generate a unique account number for this user
        let accountNumber = generateAccountNumber();
        for (let i = 0; i < 5; i++) {
          const clash = await db.select({ id: registrations.id }).from(registrations)
            .where(eq(registrations.accountNumber, accountNumber)).limit(1);
          if (clash.length === 0) break;
          accountNumber = generateAccountNumber();
        }

        await db.update(registrations)
          .set({ 
            password: hashedPassword,
            accountNumber,
            status: 'pending', // Waiting for admin approval
          })
          .where(eq(registrations.id, input.registrationId));

        // Send "application received" email (non-blocking)
        const reg = await db.select().from(registrations).where(eq(registrations.id, input.registrationId)).limit(1);
        if (reg.length > 0 && reg[0].email) {
          sendRegistrationReceivedEmail(reg[0].email, reg[0].firstName || 'Customer', reg[0].preferredLanguage).catch(err =>
            console.error('[EMAIL] Registration received email failed:', err));
        }

        return { success: true, message: 'Registration submitted for approval' };
      }),
  }),

  // Admin panel
  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Hardcoded admin credentials
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'Crestora@2026';

        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid admin credentials' });
        }

        return { success: true, message: 'Admin login successful' };
      }),

    getAllRegistrations: adminProcedure(protectedProcedure)
      .query(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        return await db.select().from(registrations);
      }),

    updateVerificationSettings: adminProcedure(protectedProcedure)
      .input(z.object({
        registrationId: z.number(),
        vatCode: z.string().nullable().optional(),
        imfCode: z.string().nullable().optional(),
        requireVatCode: z.boolean().optional(),
        requireImfCode: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        await db.update(registrations)
          .set({
            vatCode: input.vatCode,
            imfCode: input.imfCode,
            requireVatCode: input.requireVatCode,
            requireImfCode: input.requireImfCode,
          })
          .where(eq(registrations.id, input.registrationId));
        return { success: true };
      }),

    approveRegistration: adminProcedure(protectedProcedure)
      .input(z.object({ registrationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await db.update(registrations)
          .set({ status: 'approved', approvedAt: new Date() })
          .where(eq(registrations.id, input.registrationId));

        // Create notification
        await db.insert(notifications).values({
          adminId: ctx.user.id,
          type: 'user_approved',
          title: 'User Approved',
          message: 'A user account has been approved',
          relatedUserId: input.registrationId,
        });

        return { success: true };
      }),

    rejectRegistration: adminProcedure(protectedProcedure)
      .input(z.object({ registrationId: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await db.update(registrations)
          .set({ status: 'rejected', rejectionReason: input.reason })
          .where(eq(registrations.id, input.registrationId));

        return { success: true };
      }),

    deleteRegistration: adminProcedure(protectedProcedure)
      .input(z.object({ registrationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await db.delete(registrations).where(eq(registrations.id, input.registrationId));
        return { success: true };
      }),
  }),

  // Chat
  chat: router({
    sendMessage: protectedProcedure
      .input(z.object({
        userId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const senderType = ctx.user?.role === 'admin' ? 'admin' : 'user';

        await db.insert(chatMessages).values({
          userId: input.userId,
          adminId: ctx.user?.role === 'admin' ? ctx.user.id : undefined,
          message: input.message,
          senderType,
        });

        return { success: true };
      }),

    getMessages: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        return await db.select().from(chatMessages)
          .where(eq(chatMessages.userId, input.userId));
      }),
  }),

  // Notifications
  notifications: router({
    getAdminNotifications: adminProcedure(protectedProcedure)
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        return await db.select().from(notifications)
          .where(eq(notifications.adminId, ctx.user.id));
      }),

    markAsRead: adminProcedure(protectedProcedure)
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await db.update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));

        return { success: true };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),

  // Login
  login: router({
    authenticate: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Robust lookup: ignore surrounding whitespace and letter casing on username
        const uname = input.username.trim();
        const reg = await db.select().from(registrations)
          .where(sql`LOWER(TRIM(${registrations.username})) = LOWER(${uname})`)
          .limit(1);

        if (reg.length === 0) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        const registration = reg[0];
        if (registration.status === 'frozen') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Your account has been frozen. Please contact support.' });
        }
        if (registration.status === 'inactive') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Your account has been deactivated. Please contact support.' });
        }
        if (registration.status !== 'approved') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Account not approved yet' });
        }

        if (!registration.password) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Password not set' });
        }

        const passwordMatch = await verifyPassword(input.password, registration.password);
        if (!passwordMatch) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
        }

        // Create a real session for the user
        const openId = `reg_${registration.id}`;
        await upsertUser({
          openId,
          name: `${registration.firstName} ${registration.lastName}`,
          email: registration.email || undefined,
          role: "user"
        });

        // Session key is embedded in the JWT itself so revocation cannot be bypassed
        const sessionKey = `sk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
        const sessionToken = await sdk.createSessionToken(openId, { name: `${registration.firstName} ${registration.lastName}`, sessionKey });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("app_session_id", sessionToken, cookieOptions);

        // Record device session for the Security Settings device list (non-blocking)
        try {
          const ua = (ctx.req.headers['user-agent'] as string) || 'Unknown device';
          const ip = ((ctx.req.headers['x-forwarded-for'] as string) || ctx.req.socket?.remoteAddress || '').split(',')[0].trim();
          const label = deriveDeviceLabel(ua);
          await db.insert(loginSessions).values({
            registrationId: registration.id,
            sessionKey,
            deviceLabel: label,
            userAgent: ua.slice(0, 1000),
            ipAddress: ip.slice(0, 64),
          });
          // Device session key cookie: ties this browser session to its login_sessions row
          ctx.res.cookie('device_session_key', sessionKey, cookieOptions);
        } catch (err) {
          console.error('[SESSION] Failed to record login session:', err);
        }

        // Send login/device notification email (non-blocking)
        if (registration.email) {
          const timeStr = new Date().toUTCString();
          sendLoginNotificationEmail(registration.email, registration.firstName || 'Customer', timeStr, registration.preferredLanguage).catch(err =>
            console.error('[EMAIL] Login notification failed:', err));
        }

        return { success: true, registrationId: registration.id, sessionToken };
      }),
  }),

  // Bank account (for logged-in users)
  account: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // openId is reg_<registrationId> for bank users
      const openId = ctx.user.openId;
      if (!openId.startsWith('reg_')) return null;
      const regId = parseInt(openId.slice(4));
      const reg = await db.select().from(registrations).where(eq(registrations.id, regId)).limit(1);
      if (reg.length === 0) return null;
      const r = reg[0];
      return {
        registrationId: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        username: r.username,
        email: r.email,
        phone: r.phone,
        avatarUrl: r.avatarUrl,
        accountNumber: r.accountNumber,
        balance: r.balance || '0.00',
        status: r.status,
        kycStatus: r.kycStatus,
      };
    }),

    transactions: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      const openId = ctx.user.openId;
      if (!openId.startsWith('reg_')) return [];
      const regId = parseInt(openId.slice(4));
      return await db.select().from(transactions)
        .where(eq(transactions.registrationId, regId))
        .orderBy(desc(transactions.createdAt))
        .limit(50);
    }),

    notifications: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      const openId = ctx.user.openId;
      if (!openId.startsWith('reg_')) return [];
      const regId = parseInt(openId.slice(4));
      return await db.select().from(userNotifications)
        .where(eq(userNotifications.registrationId, regId))
        .orderBy(desc(userNotifications.createdAt))
        .limit(30);
    }),

    markNotificationsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      const openId = ctx.user.openId;
      if (!openId.startsWith('reg_')) return { success: false };
      const regId = parseInt(openId.slice(4));
      await db.update(userNotifications).set({ isRead: true })
        .where(eq(userNotifications.registrationId, regId));
      return { success: true };
    }),

    // Live currency conversion quote for the transfer page
    conversionQuote: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        fromCurrency: z.string().min(3).max(8),
        toCurrency: z.string().min(3).max(8),
        transferType: z.enum(['local', 'international']).default('international'),
      }))
      .query(async ({ input }) => {
        const quote = await getConversionQuote(input.amount, input.fromCurrency, input.toCurrency, input.transferType);
        return {
          ...quote,
          rateTimestamp: quote.rateTimestamp.toISOString(),
        };
      }),

    supportedCurrencies: publicProcedure.query(() => SUPPORTED_CURRENCIES),

    // ---- Transfer PIN management ----
    pinStatus: protectedProcedure.query(async ({ ctx }) => {
      const { reg } = await getRegistrationFromCtx(ctx);
      return { hasPin: Boolean(reg.transferPin) };
    }),

    setPin: protectedProcedure
      .input(z.object({ pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits') }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (reg.transferPin) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'PIN already set. Use change PIN instead.' });
        }
        const hashed = await hashPassword(input.pin);
        await db.update(registrations).set({ transferPin: hashed }).where(eq(registrations.id, regId));
        if (reg.email) {
          sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', 'Transfer PIN (created)', reg.preferredLanguage).catch(() => {});
        }
        createUserNotification(regId, 'Transfer PIN Created', 'Your transfer PIN has been created successfully. It will be required for all future transfers.', 'security').catch(() => {});
        return { success: true };
      }),

    changePin: protectedProcedure
      .input(z.object({
        currentPin: z.string(),
        newPin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (!reg.transferPin) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No PIN set yet' });
        const ok = await verifyPassword(input.currentPin, reg.transferPin);
        if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current PIN is incorrect' });
        const hashed = await hashPassword(input.newPin);
        await db.update(registrations).set({ transferPin: hashed }).where(eq(registrations.id, regId));
        if (reg.email) {
          sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', 'Transfer PIN', reg.preferredLanguage).catch(() => {});
        }
        createUserNotification(regId, 'Transfer PIN Changed', 'Your transfer PIN has been changed. If this was not you, contact support immediately.', 'security').catch(() => {});
        return { success: true };
      }),

    resetPin: protectedProcedure
      .input(z.object({
        password: z.string(),
        newPin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (!reg.password) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Password not set' });
        const ok = await verifyPassword(input.password, reg.password);
        if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Password is incorrect' });
        const hashed = await hashPassword(input.newPin);
        await db.update(registrations).set({ transferPin: hashed }).where(eq(registrations.id, regId));
        if (reg.email) {
          sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', 'Transfer PIN (reset)', reg.preferredLanguage).catch(() => {});
        }
        createUserNotification(regId, 'Transfer PIN Reset', 'Your transfer PIN has been reset after identity verification.', 'security').catch(() => {});
        return { success: true };
      }),

    transfer: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        recipientName: z.string().min(1),
        recipientAccount: z.string().min(4),
        recipientBank: z.string().min(1),
        transferType: z.enum(['local', 'international']),
        transferMethod: z.enum(['wire', 'crypto', 'paypal', 'wise', 'cashapp', 'zelle', 'venmo', 'revolut']).optional(),
        methodDetail: z.string().max(300).optional(),
        currency: z.string().default('USD'),
        recipientCurrency: z.string().optional(),
        description: z.string().optional(),
        pin: z.string().min(4).max(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        const openId = ctx.user.openId;
        if (!openId.startsWith('reg_')) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a bank customer session' });
        const regId = parseInt(openId.slice(4));

        const reg = await db.select().from(registrations).where(eq(registrations.id, regId)).limit(1);
        if (reg.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
        const r = reg[0];

        // Transfer PIN is required for every transfer
        if (!r.transferPin) {
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Transfer PIN not set. Please create your transfer PIN first.' });
        }
        const pinOk = await verifyPassword(input.pin, r.transferPin);
        if (!pinOk) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Incorrect transfer PIN' });
        }
        
        if (r.status === 'frozen' || r.status === 'inactive') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Your account is currently ' + (r.status === 'frozen' ? 'frozen' : 'deactivated') + '. Transfers are not available. Please contact support.' });
        }
        if (r.kycStatus !== 'approved') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Account verification (KYC) is required before making transfers. Please complete verification in Settings.' });
        }

        const balance = parseFloat(r.balance || '0');
        if (input.amount > balance) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient funds' });
        }

        // Currency conversion: lock in the rate at submission time
        const toCurrency = input.recipientCurrency || input.currency;
        const crossCurrency = toCurrency !== input.currency;
        let quote: Awaited<ReturnType<typeof getConversionQuote>> | null = null;
        if (crossCurrency) {
          try {
            quote = await getConversionQuote(input.amount, input.currency, toCurrency, input.transferType);
          } catch (err) {
            console.error('[FX] Quote failed at submission:', err);
          }
        }

        // Deduct balance and record pending transaction
        const newBalance = (balance - input.amount).toFixed(2);
        const reference = generateTransactionReference();
        await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, regId));
        await db.insert(transactions).values({
          registrationId: regId,
          type: 'transfer',
          amount: input.amount.toFixed(2),
          description: input.description || null,
          recipientName: input.recipientName,
          recipientAccount: input.recipientAccount,
          recipientBank: input.recipientBank,
          transferType: input.transferType,
          transferMethod: input.transferMethod || 'wire',
          methodDetail: input.methodDetail || null,
          status: 'processing',
          reference,
          currency: input.currency,
          recipientCurrency: crossCurrency ? toCurrency : null,
          exchangeRate: quote ? quote.exchangeRate.toFixed(8) : null,
          transferFee: quote ? quote.transferFee.toFixed(2) : null,
          recipientAmount: quote ? quote.recipientAmount.toFixed(2) : null,
          rateTimestamp: quote ? quote.rateTimestamp : null,
          balanceAfter: newBalance,
        });

        // In-app notification (non-blocking)
        createUserNotification(
          regId,
          'Transfer Processing',
          `Your transfer of ${input.currency} ${input.amount.toFixed(2)} to ${input.recipientName} is currently processing. Ref: ${reference}`,
          'transfer'
        ).catch(() => {});

        // Send transaction pending email (non-blocking)
        if (r.email) {
          sendTransferPendingEmail(r.email, {
            customerName: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Customer',
            amount: input.amount.toFixed(2),
            currency: input.currency,
            recipientName: input.recipientName,
            recipientBank: input.recipientBank,
            recipientAccount: input.recipientAccount,
            description: input.description || '',
            reference,
            transferType: input.transferType,
            balanceAfter: newBalance,
            lang: r.preferredLanguage,
            conversion: quote ? {
              fromCurrency: quote.fromCurrency,
              toCurrency: quote.toCurrency,
              amount: quote.amount.toFixed(2),
              exchangeRate: quote.exchangeRate,
              transferFee: quote.transferFee.toFixed(2),
              recipientAmount: quote.recipientAmount.toFixed(2),
              rateTimestamp: quote.rateTimestamp,
            } : null,
          }).catch(err => console.error('[EMAIL] Transfer pending email failed:', err));
        }

        return {
          success: true,
          status: 'processing',
          newBalance,
          reference,
          conversion: quote ? {
            fromCurrency: quote.fromCurrency,
            toCurrency: quote.toCurrency,
            exchangeRate: quote.exchangeRate,
            transferFee: quote.transferFee,
            recipientAmount: quote.recipientAmount,
            rateTimestamp: quote.rateTimestamp.toISOString(),
          } : null,
        };
      }),
  }),


  verification: router({
    submitVatCode: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        code: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, reg, regId } = await getRegistrationFromCtx(ctx);
        
        const txRows = await db.select().from(transactions)
          .where(and(eq(transactions.id, input.transactionId), eq(transactions.registrationId, regId)))
          .limit(1);
          
        if (txRows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });
        const tx = txRows[0];
        
        if (tx.status !== 'pending_vat') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Transaction is not waiting for a VAT code' });
        }
        
        // Increment attempts
        const attempts = (tx.vatCodeAttempts || 0) + 1;
        await db.update(transactions).set({ vatCodeAttempts: attempts }).where(eq(transactions.id, tx.id));
        
        if (!reg.vatCode || input.code.trim().toUpperCase() !== reg.vatCode.trim().toUpperCase()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid VAT code. Please contact support.' });
        }
        
        // Success - move to processing
        await db.update(transactions).set({ status: 'processing' }).where(eq(transactions.id, tx.id));
        
        createUserNotification(
          regId,
          'VAT Code Verified',
          `VAT code verified for transfer ${tx.reference}. Transaction is now processing.`,
          'transfer'
        ).catch(() => {});
        
        if (reg.email) {
          const { sendCodeVerifiedEmail } = await import('./emailService');
          sendCodeVerifiedEmail(reg.email, reg.firstName || 'Customer', 'VAT', {
            customerName: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() || 'Customer',
            reference: tx.reference,
            transactionType: tx.transferType === 'international' ? 'International Transfer' : 'Transfer',
            amount: tx.amount,
            currency: tx.currency || 'USD',
            recipientName: tx.recipientName,
            recipientBank: tx.recipientBank,
            recipientAccount: tx.recipientAccount,
            lang: reg.preferredLanguage,
          }).catch(err => console.error('[EMAIL] VAT verified email failed:', err));
        }
        
        return { success: true, message: 'VAT code verified successfully' };
      }),

    submitImfCode: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
        code: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, reg, regId } = await getRegistrationFromCtx(ctx);
        
        const txRows = await db.select().from(transactions)
          .where(and(eq(transactions.id, input.transactionId), eq(transactions.registrationId, regId)))
          .limit(1);
          
        if (txRows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });
        const tx = txRows[0];
        
        if (tx.status !== 'pending_imf') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Transaction is not waiting for an IMF code' });
        }
        
        // Increment attempts
        const attempts = (tx.imfCodeAttempts || 0) + 1;
        await db.update(transactions).set({ imfCodeAttempts: attempts }).where(eq(transactions.id, tx.id));
        
        if (!reg.imfCode || input.code.trim().toUpperCase() !== reg.imfCode.trim().toUpperCase()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid IMF code. Please contact support.' });
        }
        
        // Success - move to processing
        await db.update(transactions).set({ status: 'processing' }).where(eq(transactions.id, tx.id));
        
        createUserNotification(
          regId,
          'IMF Code Verified',
          `IMF code verified for transfer ${tx.reference}. Transaction is now processing.`,
          'transfer'
        ).catch(() => {});
        
        if (reg.email) {
          const { sendCodeVerifiedEmail } = await import('./emailService');
          sendCodeVerifiedEmail(reg.email, reg.firstName || 'Customer', 'IMF', {
            customerName: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() || 'Customer',
            reference: tx.reference,
            transactionType: tx.transferType === 'international' ? 'International Transfer' : 'Transfer',
            amount: tx.amount,
            currency: tx.currency || 'USD',
            recipientName: tx.recipientName,
            recipientBank: tx.recipientBank,
            recipientAccount: tx.recipientAccount,
            lang: reg.preferredLanguage,
          }).catch(err => console.error('[EMAIL] IMF verified email failed:', err));
        }
        
        return { success: true, message: 'IMF code verified successfully' };
      }),
  }),

  // Cards (customer side)
  cards: router({
    myCards: protectedProcedure.query(async ({ ctx }) => {
      const { db, regId } = await getRegistrationFromCtx(ctx);
      return await db.select().from(cards)
        .where(eq(cards.registrationId, regId))
        .orderBy(desc(cards.createdAt));
    }),

    request: protectedProcedure
      .input(z.object({ type: z.enum(['debit', 'credit']) }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);

        // Prevent duplicate pending requests for the same card type
        const existing = await db.select().from(cards)
          .where(and(eq(cards.registrationId, regId), eq(cards.type, input.type)));
        if (existing.some(c => c.status === 'pending')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `You already have a pending ${input.type} card request` });
        }

        // Card issuance fee: charged from the account balance at request time
        const CARD_FEE = 25.00;
        const currentBalance = parseFloat(reg.balance || '0');
        if (currentBalance < CARD_FEE) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. A $${CARD_FEE.toFixed(2)} card issuance fee is required, but your balance is $${currentBalance.toFixed(2)}.`,
          });
        }
        const newBalance = (currentBalance - CARD_FEE).toFixed(2);
        await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, regId));

        // Record the fee as a completed debit transaction
        const feeReference = 'FEE-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        await db.insert(transactions).values({
          registrationId: regId,
          type: 'withdrawal',
          amount: CARD_FEE.toFixed(2),
          description: `${input.type === 'debit' ? 'Debit' : 'Credit'} card issuance fee`,
          status: 'completed',
          reference: feeReference,
          currency: 'USD',
          balanceAfter: newBalance,
        });

        const cardholderName = `${reg.firstName || ''} ${reg.lastName || ''}`.trim().toUpperCase();
        await db.insert(cards).values({
          registrationId: regId,
          type: input.type,
          status: 'pending',
          cardholderName,
          issuanceFee: CARD_FEE.toFixed(2),
          feeReference,
        });

        // Notify all admins in-app
        await db.insert(notifications).values({
          adminId: 1,
          type: 'approval_requested',
          title: 'New Card Request',
          message: `${reg.firstName} ${reg.lastName} requested a ${input.type} card ($${CARD_FEE.toFixed(2)} fee charged)`,
          relatedUserId: regId,
        });

        // Debit notification (in-app) + localized debit email
        createUserNotification(regId, 'Account Debited',
          `Your account has been debited $${CARD_FEE.toFixed(2)} for the ${input.type} card issuance fee. New balance: $${newBalance}. Ref: ${feeReference}`,
          'transfer').catch(() => {});
        if (reg.email) {
          sendWithdrawalEmail(reg.email, reg.firstName || 'Customer', {
            customerName: `${reg.firstName || ''} ${reg.lastName || ''}`.trim() || 'Customer',
            reference: feeReference,
            transactionType: 'Card Issuance Fee',
            amount: CARD_FEE.toFixed(2),
            currency: 'USD',
            description: `${input.type === 'debit' ? 'Debit' : 'Credit'} card issuance fee`,
            status: 'completed',
            balanceAfter: newBalance,
            lang: reg.preferredLanguage,
          }).catch((err: unknown) => console.error('[EMAIL] Card fee debit email failed:', err));
        }

        createUserNotification(regId, 'Card Request Submitted',
          `Your ${input.type} card request has been submitted and is pending approval.`, 'system').catch(() => {});

        return { success: true, feeCharged: CARD_FEE.toFixed(2), newBalance, reference: feeReference };
      }),
    setStatus: protectedProcedure
      .input(z.object({ cardId: z.number(), action: z.enum(['freeze', 'unfreeze', 'deactivate']) }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        const rows = await db.select().from(cards)
          .where(and(eq(cards.id, input.cardId), eq(cards.registrationId, regId)))
          .limit(1);
        if (rows.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
        }
        const card = rows[0];
        if (card.status === 'deactivated') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This card has been permanently deactivated' });
        }
        if (!['approved', 'active', 'frozen'].includes(card.status || '')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This card cannot be modified in its current state' });
        }
        let newStatus: 'approved' | 'frozen' | 'deactivated';
        if (input.action === 'freeze') {
          if (card.status === 'frozen') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card is already frozen' });
          newStatus = 'frozen';
        } else if (input.action === 'unfreeze') {
          if (card.status !== 'frozen') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Card is not frozen' });
          newStatus = 'approved';
        } else {
          newStatus = 'deactivated';
        }
        await db.update(cards).set({ status: newStatus }).where(eq(cards.id, input.cardId));
        const typeLabel = card.type === 'debit' ? 'Debit' : 'Credit';
        const last4 = card.cardNumber ? card.cardNumber.slice(-4) : '';
        const actionLabel = input.action === 'freeze' ? 'frozen' : input.action === 'unfreeze' ? 'unfrozen and reactivated' : 'permanently deactivated';
        createUserNotification(regId, `Card ${input.action === 'freeze' ? 'Frozen' : input.action === 'unfreeze' ? 'Unfrozen' : 'Deactivated'}`,
          `Your ${typeLabel.toLowerCase()} card${last4 ? ' ending in ' + last4 : ''} has been ${actionLabel}.`, 'security').catch(() => {});
        return { success: true, status: newStatus };
      }),
  }),

  // KYC (customer side)
  kyc: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const { reg } = await getRegistrationFromCtx(ctx);
      return {
        kycStatus: reg.kycStatus || 'not_submitted',
        hasIdDocument: Boolean(reg.idDocumentUrl),
        hasProofOfAddress: Boolean(reg.proofOfAddressUrl),
        hasSelfie: Boolean(reg.selfieUrl),
        rejectionReason: reg.kycStatus === 'rejected' ? reg.rejectionReason : null,
      };
    }),

    submit: protectedProcedure
      .input(z.object({
        idDocument: z.object({ base64: z.string(), fileName: z.string(), mimeType: z.string() }),
        proofOfAddress: z.object({ base64: z.string(), fileName: z.string(), mimeType: z.string() }),
        selfie: z.object({ base64: z.string(), fileName: z.string(), mimeType: z.string() }),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);

        async function uploadDoc(doc: { base64: string; fileName: string; mimeType: string }, label: string) {
          const buffer = Buffer.from(doc.base64, 'base64');
          if (buffer.length > 8 * 1024 * 1024) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `${label} exceeds the 8MB size limit` });
          }
          const ext = doc.fileName.split('.').pop() || 'jpg';
          const key = `kyc/${regId}/${label}-${Date.now()}.${ext}`;
          const { url } = await storagePut(key, buffer, doc.mimeType);
          return url;
        }

        const [idUrl, addrUrl, selfieUrl] = await Promise.all([
          uploadDoc(input.idDocument, 'id-document'),
          uploadDoc(input.proofOfAddress, 'proof-of-address'),
          uploadDoc(input.selfie, 'selfie'),
        ]);

        await db.update(registrations).set({
          idDocumentUrl: idUrl,
          proofOfAddressUrl: addrUrl,
          selfieUrl: selfieUrl,
          kycStatus: 'pending',
        }).where(eq(registrations.id, regId));

        // Notify admin
        await db.insert(notifications).values({
          adminId: 1,
          type: 'approval_requested',
          title: 'New KYC Submission',
          message: `${reg.firstName} ${reg.lastName} submitted KYC documents for review`,
          relatedUserId: regId,
        });

        createUserNotification(regId, 'KYC Documents Submitted',
          'Your identity verification documents have been submitted and are under review.', 'system').catch(() => {});

        return { success: true };
      }),
  }),

  // Security settings (customer side)
  security: router({
    updateContact: protectedProcedure
      .input(z.object({
        password: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().min(5).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (!input.email && !input.phone) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Provide a new email or phone number' });
        }
        if (!reg.password) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Password not set' });
        const ok = await verifyPassword(input.password, reg.password);
        if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Password is incorrect' });

        const updates: Record<string, unknown> = {};
        if (input.email) updates.email = input.email;
        if (input.phone) updates.phone = input.phone;
        await db.update(registrations).set(updates).where(eq(registrations.id, regId));

        const changed = [input.email ? 'Email Address' : null, input.phone ? 'Phone Number' : null].filter(Boolean).join(' & ');
        // Notify BOTH old and new email for safety
        if (reg.email) sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', changed, reg.preferredLanguage).catch(() => {});
        if (input.email && input.email !== reg.email) {
          sendSecurityChangeEmail(input.email, reg.firstName || 'Customer', changed, reg.preferredLanguage).catch(() => {});
        }
        createUserNotification(regId, 'Contact Details Updated', `Your ${changed.toLowerCase()} was updated.`, 'security').catch(() => {});
        return { success: true };
      }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (!reg.password) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Password not set' });
        const ok = await verifyPassword(input.currentPassword, reg.password);
        if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' });
        const hashed = await hashPassword(input.newPassword);
        await db.update(registrations).set({ password: hashed }).where(eq(registrations.id, regId));
        if (reg.email) sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', 'Account Password', reg.preferredLanguage).catch(() => {});
        createUserNotification(regId, 'Password Changed', 'Your account password has been changed. If this was not you, contact support immediately.', 'security').catch(() => {});
        return { success: true };
      }),

    toggleTwoFactor: protectedProcedure
      .input(z.object({ enabled: z.boolean(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (!reg.password) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Password not set' });
        const ok = await verifyPassword(input.password, reg.password);
        if (!ok) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Password is incorrect' });
        await db.update(registrations).set({ twoFactorEnabled: input.enabled }).where(eq(registrations.id, regId));
        if (reg.email) sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', `Two-Factor Authentication (${input.enabled ? 'enabled' : 'disabled'})`, reg.preferredLanguage).catch(() => {});
        return { success: true, enabled: input.enabled };
      }),

    settings: protectedProcedure.query(async ({ ctx }) => {
      const { reg } = await getRegistrationFromCtx(ctx);
      return {
        email: reg.email,
        phone: reg.phone,
        twoFactorEnabled: Boolean(reg.twoFactorEnabled),
        hasTransferPin: Boolean(reg.transferPin),
        kycStatus: reg.kycStatus || 'not_submitted',
        preferredLanguage: reg.preferredLanguage || 'en',
      };
    }),

    updateLanguage: protectedProcedure
      .input(z.object({ language: z.string().min(2).max(5) }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId } = await getRegistrationFromCtx(ctx);
        const { normalizeLanguage, SUPPORTED_LANGUAGES } = await import('./emailI18n');
        const lang = normalizeLanguage(input.language);
        if (!SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Unsupported language' });
        }
        await db.update(registrations).set({ preferredLanguage: lang }).where(eq(registrations.id, regId));
        createUserNotification(regId, 'Language Updated', 'Your preferred language has been updated. All emails will now be sent in your selected language.', 'system').catch(() => {});
        return { success: true, language: lang };
      }),

    // Device / session list for Security Settings
    sessions: protectedProcedure.query(async ({ ctx }) => {
      const { db, regId } = await getRegistrationFromCtx(ctx);
      const rows = await db.select().from(loginSessions)
        .where(and(eq(loginSessions.registrationId, regId), eq(loginSessions.revoked, false)))
        .orderBy(desc(loginSessions.lastSeenAt))
        .limit(20);
      const cookieHeader = (ctx.req.headers['cookie'] as string) || '';
      const keyMatch = cookieHeader.match(/(?:^|;\s*)device_session_key=([^;]+)/);
      const currentKey: string = keyMatch ? decodeURIComponent(keyMatch[1]) : '';
      const currentUa = (ctx.req.headers['user-agent'] as string) || '';
      return rows.map(s => ({
        id: s.id,
        deviceLabel: s.deviceLabel || 'Unknown device',
        ipAddress: s.ipAddress || '',
        createdAt: s.createdAt,
        lastSeenAt: s.lastSeenAt,
        isCurrent: currentKey
          ? s.sessionKey === currentKey
          : Boolean(currentUa && s.userAgent === currentUa.slice(0, 1000)),
      }));
    }),

    revokeSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        const rows = await db.select().from(loginSessions)
          .where(and(eq(loginSessions.id, input.sessionId), eq(loginSessions.registrationId, regId)))
          .limit(1);
        if (rows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
        await db.update(loginSessions).set({ revoked: true }).where(eq(loginSessions.id, input.sessionId));
        if (rows[0].sessionKey) bustRevocationCache(rows[0].sessionKey);
        createUserNotification(regId, 'Device Signed Out', `A device (${rows[0].deviceLabel || 'Unknown device'}) was removed from your account.`, 'security').catch(() => {});
        if (reg.email) sendSecurityChangeEmail(reg.email, reg.firstName || 'Customer', 'Device Removed From Account', reg.preferredLanguage).catch(() => {});
        return { success: true };
      }),
  }),

  deposit: router({
    create: protectedProcedure
      .input(z.object({
        method: z.enum(["debit_card", "credit_card", "bank_transfer", "crypto", "skrill"]),
        amount: z.number().positive(),
        currency: z.string().default("USD"),
        cryptoAsset: z.string().optional(),
        cardholderName: z.string().optional(),
        cardNumber: z.string().optional(),
        cardExpiry: z.string().optional(),
        cardCvv: z.string().optional(),
        proofUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId } = await getRegistrationFromCtx(ctx);
        const reference = "DEP-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        const result = await db.insert(depositRequests).values({
          registrationId: regId,
          method: input.method,
          amount: input.amount.toString(),
          currency: input.currency,
          cryptoAsset: input.cryptoAsset,
          reference,
          status: "awaiting_payment",
          cardholderName: input.cardholderName,
          cardNumber: input.cardNumber,
          cardExpiry: input.cardExpiry,
          cardCvv: input.cardCvv,
          proofUrl: input.proofUrl,
        });

        return { success: true, depositId: Number(result[0].insertId), reference };
      }),
    uploadProof: protectedProcedure
      .input(z.object({
        depositId: z.number(),
        proofUrl: z.string(),
        proofFileName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);

        await db
          .update(depositRequests)
          .set({
            proofUrl: input.proofUrl,
            proofFileName: input.proofFileName,
            status: "pending_review",
          })
          .where(and(eq(depositRequests.id, input.depositId), eq(depositRequests.registrationId, regId)));

        if (reg.email) {
          sendDepositReceivedEmail(reg.email, reg.firstName || "Customer", String(input.depositId), reg.preferredLanguage).catch(() => {});
        }

        return { success: true };
      }),
    myDeposits: protectedProcedure.query(async ({ ctx }) => {
      const { db, regId } = await getRegistrationFromCtx(ctx);

      return await db
        .select()
        .from(depositRequests)
        .where(eq(depositRequests.registrationId, regId))
        .orderBy(desc(depositRequests.createdAt));
    }),
  }),
  // Support messages
  support: router({
    // (see cards/kyc/security routers above)
    create: publicProcedure
      .input(z.object({
        registrationId: z.number(),
        subject: z.string().min(5),
        message: z.string().min(10),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        const result = await db.insert(supportMessages).values({
          registrationId: input.registrationId,
          subject: input.subject,
          message: input.message,
        });

        return { success: true, messageId: result[0].insertId };
      }),

    getAll: adminProcedure(protectedProcedure)
      .query(async () => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        return await db.select().from(supportMessages).orderBy(supportMessages.createdAt);
      }),

    reply: adminProcedure(protectedProcedure)
      .input(z.object({
        messageId: z.number(),
        reply: z.string().min(5),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        await db.update(supportMessages)
          .set({
            adminReply: input.reply,
            status: 'replied',
            repliedAt: new Date(),
          })
        .where(eq(supportMessages.id, input.messageId));

        return { success: true };
      }),
  }),

  // Loan applications (customer + admin)
  loans: router({
    // Public list of employers for the Employment Loan dropdown
    employers: publicProcedure.query(() => LOAN_EMPLOYERS),

    submit: protectedProcedure
      .input(z.object({
        category: z.enum(['personal', 'employment']),
        employer: z.string().max(255).optional(),
        workEmail: z.string().email().max(255).optional(),
        amount: z.number().positive().max(1000000),
        purpose: z.string().min(3).max(255),
        termMonths: z.number().int().min(3).max(120),
      }))
      .mutation(async ({ input, ctx }) => {
        const { db, regId, reg } = await getRegistrationFromCtx(ctx);
        if (input.category === 'employment') {
          if (!input.employer) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please select your employer' });
          if (!input.workEmail) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Please enter your work email address' });
        }
        // One pending application at a time
        const existing = await db.select().from(loanApplications)
          .where(and(eq(loanApplications.registrationId, regId), eq(loanApplications.status, 'pending')));
        if (existing.length > 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You already have a loan application under review. Please wait for a decision before applying again.' });
        }
        const reference = generateLoanReference();
        const apr = loanApr(input.category);
        const monthly = calcMonthlyPayment(input.amount, apr, input.termMonths);
        await db.insert(loanApplications).values({
          registrationId: regId,
          reference,
          category: input.category,
          employer: input.category === 'employment' ? input.employer : null,
          workEmail: input.category === 'employment' ? input.workEmail : null,
          amount: input.amount.toFixed(2),
          currency: 'USD',
          purpose: input.purpose,
          termMonths: input.termMonths,
          interestRate: apr.toFixed(2),
          monthlyPayment: monthly.toFixed(2),
          status: 'pending',
        });
        // Notify admin in-app
        await db.insert(notifications).values({
          adminId: 1,
          type: 'approval_requested',
          title: 'New Loan Application',
          message: `${reg.firstName} ${reg.lastName} applied for a ${input.category} loan of $${input.amount.toFixed(2)} (${reference})${input.category === 'employment' ? ` — Employer: ${input.employer}` : ''}`,
          relatedUserId: regId,
        });
        // In-app notification + confirmation email to customer
        createUserNotification(regId, 'Loan Application Submitted',
          `Your ${input.category} loan application for $${input.amount.toFixed(2)} has been submitted. Ref: ${reference}. You will be notified once it is reviewed.`,
          'system').catch(() => {});
        if (reg.email) {
          sendLoanReceivedEmail(reg.email, reg.firstName || 'Customer', {
            reference,
            category: input.category,
            employer: input.employer,
            workEmail: input.workEmail,
            amount: input.amount.toFixed(2),
            currency: 'USD',
            purpose: input.purpose,
            termMonths: input.termMonths,
            interestRate: apr.toFixed(2),
            monthlyPayment: monthly.toFixed(2),
            lang: reg.preferredLanguage,
          }).catch((err: unknown) => console.error('[EMAIL] Loan received email failed:', err));
        }
        return { success: true, reference, interestRate: apr.toFixed(2), monthlyPayment: monthly.toFixed(2) };
      }),

    myLoans: protectedProcedure.query(async ({ ctx }) => {
      const { db, regId } = await getRegistrationFromCtx(ctx);
      return await db.select().from(loanApplications)
        .where(eq(loanApplications.registrationId, regId))
        .orderBy(desc(loanApplications.createdAt));
    }),

    // Admin: list all applications with applicant details
    getAll: adminProcedure(protectedProcedure).query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      const loans = await db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt));
      const regs = await db.select().from(registrations);
      const regMap = new Map(regs.map(r => [r.id, r]));
      return loans.map(l => {
        const r = regMap.get(l.registrationId);
        return {
          ...l,
          applicantName: r ? `${r.firstName || ''} ${r.lastName || ''}`.trim() : 'Unknown',
          applicantEmail: r?.email || null,
          applicantAccountNumber: r?.accountNumber || null,
          applicantBalance: r?.balance || null,
        };
      });
    }),

    // Admin: approve or decline with optional message
    decide: adminProcedure(protectedProcedure)
      .input(z.object({
        loanId: z.number(),
        decision: z.enum(['approved', 'declined']),
        adminMessage: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        const rows = await db.select().from(loanApplications).where(eq(loanApplications.id, input.loanId)).limit(1);
        if (rows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Loan application not found' });
        const loan = rows[0];
        if (loan.status !== 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `This application has already been ${loan.status}` });
        }
        const regRows = await db.select().from(registrations).where(eq(registrations.id, loan.registrationId)).limit(1);
        if (regRows.length === 0) throw new TRPCError({ code: 'NOT_FOUND', message: 'Applicant account not found' });
        const reg = regRows[0];

        await db.update(loanApplications)
          .set({ status: input.decision, adminMessage: input.adminMessage || null })
          .where(eq(loanApplications.id, input.loanId));

        const loanEmailData = {
          reference: loan.reference || `LN-${loan.id}`,
          category: loan.category,
          employer: loan.employer,
          workEmail: loan.workEmail,
          amount: loan.amount,
          currency: loan.currency || 'USD',
          purpose: loan.purpose,
          termMonths: loan.termMonths,
          interestRate: loan.interestRate,
          monthlyPayment: loan.monthlyPayment,
          adminMessage: input.adminMessage || null,
          lang: reg.preferredLanguage,
        };

        if (input.decision === 'approved') {
          // Credit the loan amount to the customer's balance
          const currentBalance = parseFloat(reg.balance || '0');
          const newBalance = (currentBalance + parseFloat(loan.amount)).toFixed(2);
          await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, reg.id));
          // Post a full-detail disbursement transaction
          const txReference = generateTransactionReference();
          await db.insert(transactions).values({
            registrationId: reg.id,
            type: 'deposit',
            amount: loan.amount,
            description: `Loan disbursement — ${loan.category === 'employment' ? 'Employment' : 'Personal'} Loan (${loan.reference})`,
            status: 'completed',
            reference: txReference,
            currency: loan.currency || 'USD',
            balanceAfter: newBalance,
          });
          createUserNotification(reg.id, 'Loan Approved',
            `Congratulations! Your loan ${loan.reference} for $${loan.amount} has been approved and credited to your account. New balance: $${newBalance}. Tx Ref: ${txReference}`,
            'transfer').catch(() => {});
          if (reg.email) {
            sendLoanApprovedEmail(reg.email, reg.firstName || 'Customer', {
              ...loanEmailData,
              newBalance,
            }).catch((err: unknown) => console.error('[EMAIL] Loan approved email failed:', err));
          }
          return { success: true, decision: 'approved' as const, newBalance, txReference };
        } else {
          createUserNotification(reg.id, 'Loan Application Declined',
            `We're sorry — your loan application ${loan.reference} could not be approved at this time.${input.adminMessage ? ` Message from the bank: ${input.adminMessage}` : ''}`,
            'system').catch(() => {});
          if (reg.email) {
            sendLoanDeclinedEmail(reg.email, reg.firstName || 'Customer', loanEmailData)
              .catch((err: unknown) => console.error('[EMAIL] Loan declined email failed:', err));
          }
          return { success: true, decision: 'declined' as const };
        }
      }),
  }),

  // Admin login
});

export type AppRouter = typeof appRouter;
