import { decimal } from "drizzle-orm/mysql-core";
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Registration data table for multi-step registration flow
export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  // Step 1: Personal info
  firstName: varchar("firstName", { length: 100 }),
  middleName: varchar("middleName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  username: varchar("username", { length: 100 }).unique(),
  // Step 2: Contact details
  contactMethod: mysqlEnum("contactMethod", ["email", "phone"]),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  nationality: varchar("nationality", { length: 100 }),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  address: text("address"),
  // Step 3: Security
  password: text("password"),
  // Banking
  accountNumber: varchar("accountNumber", { length: 20 }).unique(),
  balance: decimal("balance", { precision: 14, scale: 2 }).default("0.00"),
  // Status
  status: mysqlEnum("status", ["pending", "verified", "approved", "rejected", "frozen", "inactive"]).default("pending"),
  approvedAt: timestamp("approvedAt"),
  rejectionReason: text("rejectionReason"),
  // KYC & Security
  kycStatus: mysqlEnum("kycStatus", ["not_submitted", "pending", "approved", "rejected"]).default("not_submitted"),
  idDocumentUrl: varchar("idDocumentUrl", { length: 500 }),
  proofOfAddressUrl: varchar("proofOfAddressUrl", { length: 500 }),
  selfieUrl: varchar("selfieUrl", { length: 500 }),
  transferPin: varchar("transferPin", { length: 255 }), // Hashed PIN
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  // Multi-Stage Verification Codes
  vatCode: varchar("vatCode", { length: 20 }),
  imfCode: varchar("imfCode", { length: 20 }),
  requireVatCode: boolean("requireVatCode").default(false),
  requireImfCode: boolean("requireImfCode").default(false),
  // Preferred language for all transactional emails (ISO 639-1; en fallback)
  preferredLanguage: varchar("preferredLanguage", { length: 5 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

// OTP verification table
export const otpVerifications = mysqlTable("otpVerifications", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  channel: mysqlEnum("channel", ["email", "sms"]).notNull(),
  isVerified: boolean("isVerified").default(false),
  attempts: int("attempts").default(0),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

// Chat messages table
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adminId: int("adminId"),
  message: text("message").notNull(),
  senderType: mysqlEnum("senderType", ["user", "admin"]).notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  type: mysqlEnum("type", ["user_registered", "approval_requested", "user_approved", "user_rejected"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedUserId: int("relatedUserId"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Admin settings table
export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  signupLink: varchar("signupLink", { length: 500 }),
  enableNotifications: boolean("enableNotifications").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = typeof adminSettings.$inferInsert;

// Support messages table
export const supportMessages = mysqlTable("supportMessages", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "replied", "closed"]).default("open"),
  adminReply: text("adminReply"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;

// Transactions table (transfers, deposits, withdrawals, admin funding)
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  type: mysqlEnum("type", ["transfer", "deposit", "withdrawal", "funding"]).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }),
  recipientName: varchar("recipientName", { length: 200 }),
  recipientAccount: varchar("recipientAccount", { length: 64 }),
  recipientBank: varchar("recipientBank", { length: 200 }),
  transferType: mysqlEnum("transferType", ["local", "international"]),
  // Withdrawal / transfer method (wire, crypto, paypal, wise, cashapp, zelle, venmo, revolut)
  transferMethod: varchar("transferMethod", { length: 32 }),
  methodDetail: varchar("methodDetail", { length: 300 }),
  status: mysqlEnum("txStatus", ["processing", "pending_vat", "pending_imf", "pending", "approved", "completed", "failed", "on-hold", "reversed"]).default("processing"),
  reference: varchar("reference", { length: 64 }).unique(),
  // Currency & conversion (stored at submission time so receipts/emails stay consistent)
  currency: varchar("currency", { length: 8 }).default("USD"),
  recipientCurrency: varchar("recipientCurrency", { length: 8 }),
  exchangeRate: decimal("exchangeRate", { precision: 18, scale: 8 }),
  transferFee: decimal("transferFee", { precision: 14, scale: 2 }),
  recipientAmount: decimal("recipientAmount", { precision: 14, scale: 2 }),
  rateTimestamp: timestamp("rateTimestamp"),
  // Hold / review metadata (ITRT)
  holdReason: varchar("holdReason", { length: 500 }),
  reviewCaseId: varchar("reviewCaseId", { length: 64 }),
  estimatedReviewTime: varchar("estimatedReviewTime", { length: 100 }),
  // Multi-Stage Verification State
  vatCodeAttempts: int("vatCodeAttempts").default(0),
  imfCodeAttempts: int("imfCodeAttempts").default(0),
  // Balance after the transaction (for emails)
  balanceAfter: decimal("balanceAfter", { precision: 14, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Notification Center
export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["transfer", "deposit", "withdrawal", "security", "support", "system"]).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

// Email Center: log of all admin-sent emails
export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 200 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  template: varchar("template", { length: 100 }).default("custom"),
  body: text("body"),
  status: mysqlEnum("emailStatus", ["sent", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  resendId: varchar("resendId", { length: 100 }),
  sentBy: varchar("sentBy", { length: 100 }).default("admin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

// Cards table
export const cards = mysqlTable("cards", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  type: mysqlEnum("cardType", ["debit", "credit"]).notNull(),
  status: mysqlEnum("cardStatus", ["pending", "approved", "rejected", "active", "frozen", "deactivated"]).default("pending"),
  // Generated details (only populated after approval)
  cardNumber: varchar("cardNumber", { length: 20 }),
  expiryDate: varchar("expiryDate", { length: 5 }), // MM/YY
  cvv: varchar("cvv", { length: 4 }),
  cardholderName: varchar("cardholderName", { length: 200 }),
  // Issuance fee charged at request time
  issuanceFee: decimal("issuanceFee", { precision: 14, scale: 2 }).default("0.00"),
  feeReference: varchar("feeReference", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

// Login sessions (device list in Security Settings)
export const loginSessions = mysqlTable("login_sessions", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  sessionKey: varchar("sessionKey", { length: 64 }).unique(),
  deviceLabel: varchar("deviceLabel", { length: 255 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  revoked: boolean("revoked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
});

export type LoginSession = typeof loginSessions.$inferSelect;
export type InsertLoginSession = typeof loginSessions.$inferInsert;

// Deposit requests (funding system: card, bank/ACH/wire, crypto, Skrill)
export const depositRequests = mysqlTable("deposit_requests", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  method: mysqlEnum("depositMethod", ["debit_card", "credit_card", "bank_transfer", "crypto", "skrill"]).notNull(),
  // For crypto: which asset/network was chosen
  cryptoAsset: varchar("cryptoAsset", { length: 30 }),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("USD"),
  reference: varchar("reference", { length: 64 }).unique(),
  // Proof of payment uploaded by the customer (S3 URL)
  proofUrl: varchar("proofUrl", { length: 500 }),
  proofFileName: varchar("proofFileName", { length: 255 }),
  status: mysqlEnum("depositStatus", ["awaiting_payment", "pending_review", "info_requested", "approved", "rejected"]).default("awaiting_payment"),
  adminNote: text("adminNote"),
  // Linked transaction created upon approval
  transactionId: int("transactionId"),
  // Card details stored for manual admin review (when method is debit_card or credit_card)
  cardholderName: varchar("cardholderName", { length: 200 }),
  cardNumber: varchar("cardNumber", { length: 20 }),
  cardExpiry: varchar("cardExpiry", { length: 5 }), // MM/YY
  cardCvv: varchar("cardCvv", { length: 4 }),
  // Stripe session id for card payments
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DepositRequest = typeof depositRequests.$inferSelect;
export type InsertDepositRequest = typeof depositRequests.$inferInsert;

// KYC Documents table
export const kycDocuments = mysqlTable("kyc_documents", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  documentType: mysqlEnum("documentType", ["id_card", "passport", "drivers_license", "utility_bill"]).notNull(),
  documentUrl: varchar("documentUrl", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = typeof kycDocuments.$inferInsert;

export const loanApplications = mysqlTable("loan_applications", {
  id: int("id").autoincrement().primaryKey(),
  registrationId: int("registrationId").notNull(),
  reference: varchar("reference", { length: 64 }).unique(),
  category: varchar("category", { length: 50 }).notNull(), // 'personal' or 'employment'
  employer: varchar("employer", { length: 255 }), // e.g. 'Halifax Public Libraries'
  workEmail: varchar("workEmail", { length: 255 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  purpose: varchar("purpose", { length: 255 }).notNull(),
  termMonths: int("termMonths").notNull(),
  interestRate: decimal("interestRate", { precision: 5, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthlyPayment", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, declined
  adminMessage: text("adminMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 64 }).notNull().unique(),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 64 }).notNull(),
  bankName: varchar("bankName", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("USD").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  customMessage: text("customMessage"),
  topLogoUrl: varchar("topLogoUrl", { length: 500 }),
  bottomLogoUrl: varchar("bottomLogoUrl", { length: 500 }),
  feeAmount: decimal("feeAmount", { precision: 14, scale: 2 }),
  remainingBalance: decimal("remainingBalance", { precision: 14, scale: 2 }),
  bottomCaption: varchar("bottomCaption", { length: 300 }),
  senderName: varchar("senderName", { length: 200 }),
  invoiceTemplate: varchar("invoiceTemplate", { length: 50 }).default("escrow"),
  cashtag: varchar("cashtag", { length: 100 }),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  stampText: varchar("stampText", { length: 300 }),
  invoiceType: varchar("invoiceType", { length: 50 }).default("due"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue"]).default("draft").notNull(),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
