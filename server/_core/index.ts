import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { emailShell, sendEmail } from '../emailService';
import multer from "multer";
import { storagePut } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Canonical domain redirect: always show the custom domain instead of *.manus.space
  const CANONICAL_HOST = "www.crestorabank.com";
  app.use((req, res, next) => {
    const forwardedHost = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim();
    const host = (forwardedHost || req.headers.host || "").toLowerCase();
    // Only redirect real production page visits on manus.space domains (never localhost/sandbox previews or API calls)
    if (
      process.env.NODE_ENV === "production" &&
      req.method === "GET" &&
      host.endsWith(".manus.space") &&
      !req.path.startsWith("/api/")
    ) {
      return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
    }
    next();
  });
  // Production hardening: never expose development/debug artifacts publicly
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.path.startsWith("/__manus__")) {
      res.status(404).send("Not Found");
      return;
    }
    next();
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // Admin API endpoints (standalone, no OAuth required)
  app.post('/api/admin/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'Crestora@2026';
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    res.json({ success: true, message: 'Admin login successful' });
  });
  
  app.get('/api/admin/registrations', express.json(), async (req, res) => {
    // Check if admin session is valid
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    try {
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      
      const data = await db.select().from(registrations);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
    }
  });

  // Set / clear VAT & IMF verification codes on a customer registration
  app.post('/api/admin/verification-codes', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) return res.status(401).json({ success: false, message: 'Unauthorized' });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { registrationId, vatCode, imfCode } = req.body;
      if (!registrationId) {
        return res.status(400).json({ success: false, message: 'registrationId is required' });
      }
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const updates: Record<string, unknown> = {};
      if (vatCode !== undefined) updates.vatCode = vatCode ? String(vatCode).trim().slice(0, 20) : null;
      if (imfCode !== undefined) updates.imfCode = imfCode ? String(imfCode).trim().slice(0, 20) : null;
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nothing to update' });
      }
      await db.update(registrations).set(updates).where(eq(registrations.id, registrationId));
      res.json({ success: true, message: 'Verification codes updated' });
    } catch (error) {
      console.error('Error updating verification codes:', error);
      res.status(500).json({ success: false, message: 'Failed to update verification codes' });
    }
  });
  
  app.post('/api/admin/approve', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    try {
      const { registrationId } = req.body;
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      
      await db.update(registrations)
        .set({ status: 'approved', approvedAt: new Date() })
        .where(eq(registrations.id, registrationId));
      
      // Send approval email (non-blocking)
      try {
        const rows = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
        if (rows.length > 0 && rows[0].email) {
          const { sendApprovalEmail } = await import('../emailService');
          sendApprovalEmail(rows[0].email, rows[0].firstName || 'Customer', rows[0].accountNumber || 'N/A', rows[0].preferredLanguage).catch(err =>
            console.error('[EMAIL] Approval email failed:', err));
        }
      } catch (e) {
        console.error('[EMAIL] Approval email error:', e);
      }

      res.json({ success: true, message: 'User approved' });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ success: false, message: 'Failed to approve user' });
    }
  });
  
  app.post('/api/admin/user-status', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) return res.status(401).json({ success: false, message: 'Unauthorized' });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    try {
      const { registrationId, status } = req.body;
      if (!registrationId || !['frozen', 'inactive', 'approved'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid registration or status' });
      }
      const { getDb, createUserNotification } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const rows = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      const reg = rows[0];

      await db.update(registrations).set({ status }).where(eq(registrations.id, registrationId));

      const labels: Record<string, { title: string; msg: string }> = {
        frozen: { title: 'Account Frozen', msg: 'Your account has been frozen by the bank. Transfers and card operations are suspended. Please contact support for assistance.' },
        inactive: { title: 'Account Deactivated', msg: 'Your account has been deactivated by the bank. Please contact support for assistance.' },
        approved: { title: 'Account Reactivated', msg: 'Your account has been reactivated. Full access to your account has been restored.' },
      };
      const info = labels[status];
      createUserNotification(reg.id, info.title, info.msg, 'security').catch(() => {});
      if (reg.email) {
        try {
          const { sendGenericNotificationEmail } = await import('../emailService');
          sendGenericNotificationEmail(reg.email, reg.firstName || 'Customer', info.title, info.msg, reg.preferredLanguage)
            .catch((err: unknown) => console.error('[EMAIL] Account status email failed:', err));
        } catch { /* email helper optional */ }
      }
      res.json({ success: true, message: `Account status updated to ${status}` });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ success: false, message: 'Failed to update account status' });
    }
  });

  app.post('/api/admin/reject', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    try {
      const { registrationId, reason } = req.body;
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      
      await db.update(registrations)
        .set({ status: 'rejected', rejectionReason: reason })
        .where(eq(registrations.id, registrationId));
      
      res.json({ success: true, message: 'User rejected' });
    } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ success: false, message: 'Failed to reject user' });
    }
  });
  
  app.post('/api/admin/delete', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    
    try {
      const { registrationId } = req.body;
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      
      await db.delete(registrations).where(eq(registrations.id, registrationId));
      
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  });

  app.post('/api/admin/bulk-delete-users', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid user IDs' });
      }
      const { getDb } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { inArray } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      await db.delete(registrations).where(inArray(registrations.id, userIds));
      res.json({ success: true, message: `Deleted ${userIds.length} users` });
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      res.status(500).json({ success: false, message: 'Failed to delete users' });
    }
  });
  
  // Fund a user's account (set/add balance)
  app.post('/api/admin/fund', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { registrationId, amount, senderName } = req.body;
      const amt = parseFloat(amount);
      if (!registrationId || isNaN(amt) || amt <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid registration or amount' });
      }
      const { getDb } = await import('../db');
      const { registrations, transactions } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const rows = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const current = parseFloat(rows[0].balance || '0');
      const newBalance = (current + amt).toFixed(2);

      await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, registrationId));
      await db.insert(transactions).values({
        registrationId,
        type: 'funding',
        amount: amt.toFixed(2),
        description: senderName ? `Account funded from ${senderName}` : 'Account credit',
        status: 'completed',
      });

      // Send account funded email
      try {
        if (rows[0].email) {
          const { sendAccountFundedEmail } = await import('../emailService');
          sendAccountFundedEmail(
            rows[0].email,
            rows[0].firstName || 'Customer',
            amt.toFixed(2),
            newBalance,
            senderName,
            rows[0].preferredLanguage
          ).catch(err => console.error('[EMAIL] Account funded email failed:', err));
        }
      } catch (e) {
        console.error('[EMAIL] Account funded email error:', e);
      }

      res.json({ success: true, message: 'Account funded', newBalance });
    } catch (error) {
      console.error('Error funding account:', error);
      res.status(500).json({ success: false, message: 'Failed to fund account' });
    }
  });

  // Impersonate: create a session cookie for the target user
  app.post('/api/admin/impersonate', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { registrationId } = req.body;
      const { getDb, upsertUser } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const { sdk } = await import('./sdk');
      const { getSessionCookieOptions } = await import('./cookies');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const rows = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const r = rows[0];
      const openId = `reg_${r.id}`;
      const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.username || 'Customer';
      await upsertUser({ openId, name, email: r.email || undefined, role: 'user' });
      const sessionToken = await sdk.createSessionToken(openId, { name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie('app_session_id', sessionToken, cookieOptions);

      res.json({ success: true, message: 'Impersonation session created' });
    } catch (error) {
      console.error('Error impersonating user:', error);
      res.status(500).json({ success: false, message: 'Failed to impersonate user' });
    }
  });

  // List all transfers for admin review
  app.get('/api/admin/transfers', async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { getDb } = await import('../db');
      const { transactions, registrations } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const rows = await db.select({
        id: transactions.id,
        registrationId: transactions.registrationId,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        recipientName: transactions.recipientName,
        recipientAccount: transactions.recipientAccount,
        recipientBank: transactions.recipientBank,
        transferType: transactions.transferType,
        status: transactions.status,
        reference: transactions.reference,
        currency: transactions.currency,
        recipientCurrency: transactions.recipientCurrency,
        exchangeRate: transactions.exchangeRate,
        transferFee: transactions.transferFee,
        recipientAmount: transactions.recipientAmount,
        holdReason: transactions.holdReason,
        reviewCaseId: transactions.reviewCaseId,
        estimatedReviewTime: transactions.estimatedReviewTime,
        createdAt: transactions.createdAt,
        customerFirstName: registrations.firstName,
        customerLastName: registrations.lastName,
        customerEmail: registrations.email,
      }).from(transactions)
        .leftJoin(registrations, eq(transactions.registrationId, registrations.id))
        .orderBy(desc(transactions.createdAt))
        .limit(100);

      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error listing transfers:', error);
      res.status(500).json({ success: false, message: 'Failed to list transfers' });
    }
  });

  // Update transfer status: approve / complete / fail / hold / reverse
  app.post('/api/admin/transfer-status', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { transactionId, status, holdReason, estimatedReviewTime, actionRequired, customMessage } = req.body;
      const allowed = ['approved', 'completed', 'failed', 'on-hold', 'reversed', 'pending', 'processing', 'pending_vat', 'pending_imf'];
      if (!transactionId || !allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid transaction or status' });
      }

      const { getDb, createUserNotification } = await import('../db');
      const { transactions, registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const txRows = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
      if (txRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      const tx = txRows[0];
      const prevStatus = tx.status;

      // Refund balance when a transfer is failed or reversed (funds return to customer)
      if ((status === 'failed' || status === 'reversed') && prevStatus !== 'failed' && prevStatus !== 'reversed' && tx.type === 'transfer') {
        const regRows = await db.select().from(registrations).where(eq(registrations.id, tx.registrationId)).limit(1);
        if (regRows.length > 0) {
          const newBalance = (parseFloat(regRows[0].balance || '0') + parseFloat(tx.amount)).toFixed(2);
          await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, tx.registrationId));
        }
      }

      // On-hold review metadata: generate an ITRT case ID once, keep it across re-holds
      let reviewCaseId = tx.reviewCaseId;
      const updates: Record<string, unknown> = { status };
      if (status === 'on-hold') {
        if (!reviewCaseId) {
          const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
          reviewCaseId = `ITRT-${new Date().getFullYear()}-${rand}`;
          updates.reviewCaseId = reviewCaseId;
        }
        if (holdReason) updates.holdReason = String(holdReason).slice(0, 500);
        if (estimatedReviewTime) updates.estimatedReviewTime = String(estimatedReviewTime).slice(0, 100);
      }
      await db.update(transactions).set(updates).where(eq(transactions.id, transactionId));

      // Notify customer: in-app + email (non-blocking)
      const regRows = await db.select().from(registrations).where(eq(registrations.id, tx.registrationId)).limit(1);
      if (regRows.length > 0) {
        const r = regRows[0];
        const statusTitles: Record<string, string> = {
          processing: 'Transfer Processing',
          pending_vat: 'VAT Code Required',
          pending_imf: 'IMF Code Required',
          approved: 'Transfer Approved',
          completed: 'Transfer Completed',
          failed: 'Transfer Failed',
          'on-hold': 'Transfer Under Review',
          reversed: 'Transfer Reversed',
          pending: 'Transfer Pending',
        };
        const txCurrency = tx.currency || 'USD';
        const notifBodies: Record<string, string> = {
          pending_vat: `Your transfer of ${txCurrency} ${tx.amount} to ${tx.recipientName || 'recipient'} requires a VAT Clearance Code to proceed. Please contact Customer Support to obtain your code, then enter it on the transaction page. Ref: ${tx.reference || 'N/A'}`,
          pending_imf: `Your transfer of ${txCurrency} ${tx.amount} to ${tx.recipientName || 'recipient'} requires an IMF Authorization Code to proceed. Please contact Customer Support to obtain your code, then enter it on the transaction page. Ref: ${tx.reference || 'N/A'}`,
          'on-hold': `Your transfer of ${txCurrency} ${tx.amount} to ${tx.recipientName || 'recipient'} is under review by our International Transfer Review Team. Case: ${reviewCaseId || 'N/A'}. Ref: ${tx.reference || 'N/A'}`,
        };
        createUserNotification(
          r.id,
          statusTitles[status] || 'Transfer Update',
          notifBodies[status] || `Your transfer of ${txCurrency} ${tx.amount} to ${tx.recipientName || 'recipient'} is now ${status.replace('_', ' ')}. Ref: ${tx.reference || 'N/A'}`,
          'transfer'
        ).catch(() => {});

        if (r.email) {
          const { sendTransferStatusEmail } = await import('../emailService');
          const customerName = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Customer';
          // Balance after refund (failed/reversed) reflects the credited amount
          const balanceRows = await db.select().from(registrations).where(eq(registrations.id, tx.registrationId)).limit(1);
          const currentBalance = balanceRows.length > 0 ? balanceRows[0].balance : null;
          sendTransferStatusEmail(r.email, r.firstName || 'Customer', status, {
            customerName,
            reference: tx.reference,
            transactionType: tx.transferType === 'international' ? 'International Transfer' : 'Transfer',
            amount: tx.amount,
            currency: txCurrency,
            recipientName: tx.recipientName,
            recipientBank: tx.recipientBank,
            recipientAccount: tx.recipientAccount,
            description: tx.description,
            dateStr: tx.createdAt ? new Date(tx.createdAt).toUTCString() : undefined,
            status,
            balanceAfter: (status === 'failed' || status === 'reversed') ? currentBalance : undefined,
            transferType: tx.transferType,
            customMessage: customMessage ? String(customMessage).slice(0, 2000) : undefined,
            conversion: (tx.recipientCurrency && tx.exchangeRate) ? {
              fromCurrency: txCurrency,
              toCurrency: tx.recipientCurrency,
              amount: tx.amount,
              exchangeRate: parseFloat(tx.exchangeRate),
              transferFee: tx.transferFee || '0.00',
              recipientAmount: tx.recipientAmount || '0.00',
              rateTimestamp: tx.rateTimestamp || tx.createdAt,
            } : null,
            lang: r.preferredLanguage,
          }, status === 'on-hold' ? {
            reviewCaseId,
            holdReason: (holdReason as string) || tx.holdReason,
            estimatedReviewTime: (estimatedReviewTime as string) || tx.estimatedReviewTime || '24-48 hours',
            actionRequired: Boolean(actionRequired),
          } : undefined).catch(err => console.error('[EMAIL] Transfer status email failed:', err));
        }
      }

      res.json({ success: true, message: `Transfer marked as ${status}` });
    } catch (error) {
      console.error('Error updating transfer status:', error);
      res.status(500).json({ success: false, message: 'Failed to update transfer status' });
    }
  });

  // ---- Card Requests (admin) ----
  app.get('/api/admin/card-requests', async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) return res.status(401).json({ success: false, message: 'Unauthorized' });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { getDb } = await import('../db');
      const { cards, registrations } = await import('../../drizzle/schema');
      const { eq, desc } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const rows = await db.select({
        id: cards.id,
        registrationId: cards.registrationId,
        type: cards.type,
        status: cards.status,
        cardNumber: cards.cardNumber,
        expiryDate: cards.expiryDate,
        createdAt: cards.createdAt,
        customerFirstName: registrations.firstName,
        customerLastName: registrations.lastName,
        customerEmail: registrations.email,
        customerAccountNumber: registrations.accountNumber,
      }).from(cards)
        .leftJoin(registrations, eq(cards.registrationId, registrations.id))
        .orderBy(desc(cards.createdAt));
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error listing card requests:', error);
      res.status(500).json({ success: false, message: 'Failed to list card requests' });
    }
  });

  app.post('/api/admin/card-action', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) return res.status(401).json({ success: false, message: 'Unauthorized' });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { cardId, action, reason } = req.body;
      if (!cardId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid card or action' });
      }
      const { getDb, createUserNotification } = await import('../db');
      const { cards, registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const cardRows = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
      if (cardRows.length === 0) return res.status(404).json({ success: false, message: 'Card request not found' });
      const card = cardRows[0];

      const regRows = await db.select().from(registrations).where(eq(registrations.id, card.registrationId)).limit(1);
      const reg = regRows[0];

      if (action === 'approve') {
        const { generateCardDetails } = await import('../cardService');
        const details = generateCardDetails(card.type as 'debit' | 'credit');
        await db.update(cards).set({
          status: 'approved',
          cardNumber: details.cardNumber,
          expiryDate: details.expiryDate,
          cvv: details.cvv,
        }).where(eq(cards.id, cardId));

        if (reg) {
          createUserNotification(reg.id, 'Card Approved',
            `Your ${card.type} card has been approved. View your card details in the Cards section.`, 'system').catch(() => {});
          if (reg.email) {
            const { sendCardApprovedEmail } = await import('../emailService');
            const typeLabel = card.type === 'debit' ? 'Debit' : 'Credit';
            sendCardApprovedEmail(reg.email, reg.firstName || 'Customer', typeLabel, details.cardNumber.slice(-4), reg.preferredLanguage)
              .catch(err => console.error('[EMAIL] Card approval email failed:', err));
          }
        }
        return res.json({ success: true, message: 'Card approved and generated' });
      }

      // reject
      await db.update(cards).set({ status: 'rejected' }).where(eq(cards.id, cardId));
      if (reg) {
        createUserNotification(reg.id, 'Card Request Declined',
          `Your ${card.type} card request was declined.${reason ? ` Reason: ${reason}` : ''}`, 'system').catch(() => {});
      }
      res.json({ success: true, message: 'Card request rejected' });
    } catch (error) {
      console.error('Error processing card action:', error);
      res.status(500).json({ success: false, message: 'Failed to process card action' });
    }
  });

  // ---- KYC review (admin) ----
  app.post('/api/admin/kyc-action', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) return res.status(401).json({ success: false, message: 'Unauthorized' });
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { registrationId, action, reason } = req.body;
      if (!registrationId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid registration or action' });
      }
      const { getDb, createUserNotification } = await import('../db');
      const { registrations } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const regRows = await db.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
      if (regRows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      const reg = regRows[0];

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await db.update(registrations).set({ kycStatus: newStatus }).where(eq(registrations.id, registrationId));

      createUserNotification(reg.id,
        action === 'approve' ? 'Identity Verified' : 'Identity Verification Failed',
        action === 'approve'
          ? 'Your identity documents have been verified successfully.'
          : `Your identity verification was unsuccessful.${reason ? ` Reason: ${reason}` : ''} Please submit new documents.`,
        'security').catch(() => {});

      if (reg.email) {
        const { sendKycStatusEmail } = await import('../emailService');
        sendKycStatusEmail(reg.email, reg.firstName || 'Customer', newStatus as 'approved' | 'rejected', reason ? String(reason) : undefined, reg.preferredLanguage)
          .catch(err => console.error('[EMAIL] KYC status email failed:', err));
      }
      res.json({ success: true, message: `KYC ${newStatus}` });
    } catch (error) {
      console.error('Error processing KYC action:', error);
      res.status(500).json({ success: false, message: 'Failed to process KYC action' });
    }
  });

  // Get all deposit requests
  app.get('/api/admin/deposits', async (req, res) => {
    try {
      const adminSession = req.headers['x-admin-session'];
      if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      try {
        const session = JSON.parse(adminSession as string);
        if (!session.authenticated) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }

      const { getDb } = await import('../db');
      const { depositRequests, registrations } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const deposits = await db
        .select({
          id: depositRequests.id,
          registrationId: depositRequests.registrationId,
          method: depositRequests.method,
          amount: depositRequests.amount,
          currency: depositRequests.currency,
          reference: depositRequests.reference,
          proofUrl: depositRequests.proofUrl,
          status: depositRequests.status,
          adminNote: depositRequests.adminNote,
          cryptoAsset: depositRequests.cryptoAsset,
          cardholderName: depositRequests.cardholderName,
          cardNumber: depositRequests.cardNumber,
          cardExpiry: depositRequests.cardExpiry,
          cardCvv: depositRequests.cardCvv,
          createdAt: depositRequests.createdAt,
          updatedAt: depositRequests.updatedAt,
          registration: {
            firstName: registrations.firstName,
            lastName: registrations.lastName,
            email: registrations.email,
            username: registrations.username,
          }
        })
        .from(depositRequests)
        .leftJoin(registrations, eq(depositRequests.registrationId, registrations.id))
        .orderBy(desc(depositRequests.createdAt));

      res.json({ success: true, data: deposits });
    } catch (error) {
      console.error('Error fetching deposits:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Handle deposit actions (approve/reject)
  app.post('/api/admin/deposit-action', express.json(), async (req, res) => {
    try {
      const adminSession = req.headers['x-admin-session'];
      if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      
      try {
        const session = JSON.parse(adminSession as string);
        if (!session.authenticated) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }

      const { depositId, action } = req.body;
      if (!depositId || !action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid parameters' });
      }

      const { getDb } = await import('../db');
      const { depositRequests, registrations, transactions } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }

      const [deposit] = await db
        .select()
        .from(depositRequests)
        .where(eq(depositRequests.id, depositId));

      if (!deposit) {
        return res.status(404).json({ success: false, message: 'Deposit request not found' });
      }

      if (deposit.status !== 'pending_review' && deposit.status !== 'awaiting_payment') {
        return res.status(400).json({ success: false, message: 'Deposit request is not pending' });
      }

      const [reg] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, deposit.registrationId));

      if (!reg) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (action === 'approve') {
        // 1. Update deposit status
        await db
          .update(depositRequests)
          .set({ status: 'approved', updatedAt: new Date() })
          .where(eq(depositRequests.id, depositId));

        // 2. Update user balance
        const newBalance = (parseFloat(reg.balance || '0') + parseFloat(deposit.amount)).toString();
        await db
          .update(registrations)
          .set({ balance: newBalance })
          .where(eq(registrations.id, reg.id));

        // 3. Create a transaction record for the user's history
        await db.insert(transactions).values({
          registrationId: reg.id,
          type: 'deposit',
          amount: deposit.amount,
          currency: deposit.currency,
          status: 'completed',
          reference: deposit.reference,
          description: `Deposit via ${deposit.method.replace('_', ' ')}`,
        });

        // 4. Send email notification
        if (reg.email) {
          const { getStrings, fill, fmtMoneyIntl } = await import('../emailI18n');
          const T = getStrings(reg.preferredLanguage);
          const amtStr = fmtMoneyIntl(deposit.amount, deposit.currency || 'USD', reg.preferredLanguage);
          sendEmail(
            reg.email,
            `${T.txTypes.deposit} — ${T.status.approved} — Crestora Bank`,
            emailShell(
              `${T.txTypes.deposit} — ${T.status.approved}`,
              `
              <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: reg.firstName || 'Customer' })}</p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">
                ${fill(T.depositRequest.body, { depositId: String(deposit.reference) })} — ${amtStr} — ${T.status.approved}.
              </p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
                The funds have been credited to your account and are now available for use.
              </p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
                ${T.depositRequest.thanks}
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                Crestora Bank<br/>
                120 Wall Street<br/>
                New York, NY 10005<br/>
                United States
              </p>
              `,
              { lang: reg.preferredLanguage }
            ),
            "deposits@crestorabank.com"
          ).catch(console.error);
        }

        res.json({ success: true, message: 'Deposit approved and funds credited' });
      } else {
        // Reject
        await db
          .update(depositRequests)
          .set({ status: 'rejected', updatedAt: new Date() })
          .where(eq(depositRequests.id, depositId));

        // Send email notification
        if (reg.email) {
          const { getStrings, fill, fmtMoneyIntl } = await import('../emailI18n');
          const T = getStrings(reg.preferredLanguage);
          const amtStr = fmtMoneyIntl(deposit.amount, deposit.currency || 'USD', reg.preferredLanguage);
          sendEmail(
            reg.email,
            T.depositRejected.subject,
            emailShell(
              T.depositRejected.headline,
              `
              <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: reg.firstName || 'Customer' })}</p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">
                ${fill(T.depositRejected.body, { reference: String(deposit.reference), amount: amtStr })}
              </p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
                ${T.depositRejected.contactSupport}
              </p>
              <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
                ${T.depositRejected.thanks}
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                Crestora Bank<br/>
                120 Wall Street<br/>
                New York, NY 10005<br/>
                United States
              </p>
              `,
              { lang: reg.preferredLanguage }
            ),
            "deposits@crestorabank.com"
          ).catch(console.error);
        }

        res.json({ success: true, message: 'Deposit rejected' });
      }
    } catch (error) {
      console.error('Error processing deposit action:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get loan applications (admin)
  app.get('/api/admin/loans', async (req, res) => {
    try {
      const adminSession = req.headers['x-admin-session'];
      if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      try {
        const session = JSON.parse(adminSession as string);
        if (!session.authenticated) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }
      const { getDb } = await import('../db');
      const { loanApplications, registrations } = await import('../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      const loans = await db
        .select({
          id: loanApplications.id,
          registrationId: loanApplications.registrationId,
          reference: loanApplications.reference,
          category: loanApplications.category,
          employer: loanApplications.employer,
          workEmail: loanApplications.workEmail,
          amount: loanApplications.amount,
          currency: loanApplications.currency,
          purpose: loanApplications.purpose,
          termMonths: loanApplications.termMonths,
          interestRate: loanApplications.interestRate,
          monthlyPayment: loanApplications.monthlyPayment,
          status: loanApplications.status,
          adminMessage: loanApplications.adminMessage,
          createdAt: loanApplications.createdAt,
          registration: {
            firstName: registrations.firstName,
            lastName: registrations.lastName,
            email: registrations.email,
            username: registrations.username,
            accountNumber: registrations.accountNumber,
            balance: registrations.balance,
          }
        })
        .from(loanApplications)
        .leftJoin(registrations, eq(loanApplications.registrationId, registrations.id))
        .orderBy(desc(loanApplications.createdAt));
      res.json({ success: true, data: loans });
    } catch (error) {
      console.error('Error fetching loans:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Handle loan actions (approve/decline)
  app.post('/api/admin/loan-action', express.json(), async (req, res) => {
    try {
      const adminSession = req.headers['x-admin-session'];
      if (!adminSession) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      try {
        const session = JSON.parse(adminSession as string);
        if (!session.authenticated) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid session' });
      }
      const { loanId, action, adminMessage } = req.body as { loanId: number; action: 'approve' | 'decline'; adminMessage?: string };
      if (!loanId || !['approve', 'decline'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
      }
      const { getDb } = await import('../db');
      const { loanApplications, registrations, transactions, userNotifications } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      const loanRows = await db.select().from(loanApplications).where(eq(loanApplications.id, loanId)).limit(1);
      if (loanRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Loan application not found' });
      }
      const loan = loanRows[0];
      if (loan.status !== 'pending') {
        return res.status(400).json({ success: false, message: `This application has already been ${loan.status}` });
      }
      const regRows = await db.select().from(registrations).where(eq(registrations.id, loan.registrationId)).limit(1);
      if (regRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Applicant account not found' });
      }
      const reg = regRows[0];
      const decision = action === 'approve' ? 'approved' : 'declined';

      await db.update(loanApplications)
        .set({ status: decision, adminMessage: adminMessage || null })
        .where(eq(loanApplications.id, loanId));

      const { sendLoanApprovedEmail, sendLoanDeclinedEmail } = await import('../emailService');
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
        adminMessage: adminMessage || null,
        lang: reg.preferredLanguage,
      };

      if (decision === 'approved') {
        const newBalance = (parseFloat(reg.balance || '0') + parseFloat(loan.amount)).toFixed(2);
        await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, reg.id));
        const d = new Date();
        const datePart = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
        const txReference = `CRB-${datePart}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        await db.insert(transactions).values({
          registrationId: reg.id,
          type: 'deposit',
          amount: loan.amount,
          currency: loan.currency || 'USD',
          status: 'completed',
          reference: txReference,
          description: `Loan disbursement — ${loan.category === 'employment' ? 'Employment' : 'Personal'} Loan (${loan.reference})`,
          balanceAfter: newBalance,
        });
        try {
          await db.insert(userNotifications).values({
            registrationId: reg.id,
            title: 'Loan Approved',
            message: `Congratulations! Your loan ${loan.reference} for $${loan.amount} has been approved and credited to your account. New balance: $${newBalance}. Tx Ref: ${txReference}`,
            type: 'transfer',
          });
        } catch (e) { console.error('Loan notification error:', e); }
        if (reg.email) {
          sendLoanApprovedEmail(reg.email, reg.firstName || 'Customer', { ...loanEmailData, newBalance })
            .catch((err: unknown) => console.error('[EMAIL] Loan approved email failed:', err));
        }
        return res.json({ success: true, message: 'Loan approved — funds credited to customer account', newBalance, txReference });
      } else {
        try {
          await db.insert(userNotifications).values({
            registrationId: reg.id,
            title: 'Loan Application Declined',
            message: `We're sorry — your loan application ${loan.reference} could not be approved at this time.${adminMessage ? ` Message from the bank: ${adminMessage}` : ''}`,
            type: 'system',
          });
        } catch (e) { console.error('Loan notification error:', e); }
        if (reg.email) {
          sendLoanDeclinedEmail(reg.email, reg.firstName || 'Customer', loanEmailData)
            .catch((err: unknown) => console.error('[EMAIL] Loan declined email failed:', err));
        }
        return res.json({ success: true, message: 'Loan declined — customer notified' });
      }
    } catch (error) {
      console.error('Error processing loan action:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get email templates
  app.get('/api/admin/email-templates', async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    const { EMAIL_TEMPLATES } = await import('../emailTemplates');
    res.json({ success: true, data: EMAIL_TEMPLATES });
  });

  // Email Center: send an email via Resend and log it
  app.post('/api/admin/send-email', express.json(), async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { registrationId, recipientEmail, recipientName, subject, body, template, headline } = req.body;
      if (!recipientEmail || !subject || !body) {
        return res.status(400).json({ success: false, message: 'Recipient, subject and message are required' });
      }

      const { getDb } = await import('../db');
      const { emailLogs } = await import('../../drizzle/schema');
      const { sendEmail, emailShell } = await import('../emailService');
      const { bodyToHtml } = await import('../emailTemplates');

      const html = emailShell(headline || 'Crestora Bank', bodyToHtml(body));
      const result = await sendEmail(recipientEmail, subject, html, 'noreply@crestorabank.com');

      const db = await getDb();
      if (db) {
        await db.insert(emailLogs).values({
          registrationId: registrationId || null,
          recipientEmail,
          recipientName: recipientName || null,
          subject,
          template: template || 'custom',
          body,
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.success ? null : 'Resend API error (see server logs)',
          resendId: result.id || null,
          sentBy: 'admin',
        });
      }

      if (!result.success) {
        return res.status(502).json({ success: false, message: 'Email failed to send. It has been logged as failed.' });
      }
      res.json({ success: true, message: 'Email sent successfully', id: result.id });
    } catch (error) {
      console.error('Error sending admin email:', error);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  });

  // Email Center: sent email history
  app.get('/api/admin/email-history', async (req, res) => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
      const session = JSON.parse(adminSession as string);
      if (!session.authenticated) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    try {
      const { getDb } = await import('../db');
      const { emailLogs } = await import('../../drizzle/schema');
      const { desc } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, message: 'Database unavailable' });
      }
      const rows = await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(200);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching email history:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch email history' });
    }
  });

  // ===== Invoice endpoints (admin) =====
  const isAdminAuthed = (req: express.Request): boolean => {
    const adminSession = req.headers['x-admin-session'];
    if (!adminSession) return false;
    try {
      const session = JSON.parse(adminSession as string);
      return !!session.authenticated;
    } catch {
      return false;
    }
  };

  app.get('/api/admin/invoices', async (req, res) => {
    if (!isAdminAuthed(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const { getDb } = await import('../db');
      const { invoices } = await import('../../drizzle/schema');
      const { desc } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });
      const rows = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  });

  app.post('/api/admin/invoices/create-and-send', express.json(), async (req, res) => {
    if (!isAdminAuthed(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const {
        clientName, clientEmail, accountNumber, bankName,
        amount, currency, description, dueDate,
        customMessage, topLogoUrl, bottomLogoUrl,
        feeAmount, remainingBalance, bottomCaption,
        senderName, invoiceType, invoiceTemplate, cashtag, avatarUrl, stampText, paymentMethod, txStatus, previewOnly,
      } = req.body || {};
      // For Cash App invoices, accountNumber and bankName are not required
      if (!clientName || !clientEmail || !amount || !description || !dueDate) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      if (invoiceTemplate !== 'cashapp' && (!accountNumber || !bankName)) {
        return res.status(400).json({ success: false, message: 'Missing required fields (Account Number and Bank Name are required for Escrow invoices)' });
      }
      const { getDb } = await import('../db');
      const { invoices } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const { generateInvoicePdf } = await import('../invoicePdf');
      const { generateCashAppInvoicePdf } = await import('../cashappInvoicePdf');
      const { sendInvoiceEmail } = await import('../invoiceEmail');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const reference = `ESCROW TAX-${Math.floor(Math.random() * 90 + 10)}`;
      // Filename-safe reference (no spaces — spaces in S3 keys break presigned URLs)
      const referenceSlug = reference.replace(/[^A-Za-z0-9._-]+/g, '-');

      // Preview mode: generate the PDF, store it temporarily, return the URL — no DB row, no email
      if (previewOnly) {
        const previewInvoice = {
          reference,
          clientName: String(clientName),
          clientEmail: String(clientEmail),
          accountNumber: String(accountNumber),
          bankName: String(bankName),
          amount: Number(amount).toString(),
          currency: currency || 'USD',
          description: String(description),
          dueDate: new Date(dueDate),
          createdAt: new Date(),
          customMessage: customMessage || null,
          topLogoUrl: topLogoUrl || null,
          bottomLogoUrl: bottomLogoUrl || null,
          feeAmount: feeAmount !== undefined && feeAmount !== null && feeAmount !== '' ? Number(feeAmount).toString() : null,
          remainingBalance: remainingBalance !== undefined && remainingBalance !== null && remainingBalance !== '' ? Number(remainingBalance).toString() : null,
          senderName: senderName || null,
          invoiceType: invoiceType || 'due',
          invoiceTemplate: invoiceTemplate || 'escrow',
          cashtag: cashtag || null,
          avatarUrl: avatarUrl || null,
          stampText: stampText || null,
          paymentMethod: paymentMethod || null,
          txStatus: txStatus || null,
        };
        const previewPdf = (previewInvoice.invoiceTemplate === 'cashapp') ? await generateCashAppInvoicePdf(previewInvoice) : await generateInvoicePdf(previewInvoice);
        const { url: previewPdfUrl } = await storagePut(`invoices/previews/${referenceSlug}.pdf`, previewPdf, 'application/pdf');
        return res.json({ success: true, preview: true, reference, pdfUrl: previewPdfUrl });
      }

      const [result] = await db.insert(invoices).values({
        reference,
        clientName: String(clientName),
        clientEmail: String(clientEmail),
        accountNumber: String(accountNumber),
        bankName: String(bankName),
        amount: Number(amount).toString(),
        currency: currency || 'USD',
        description: String(description),
        dueDate: new Date(dueDate),
        customMessage: customMessage || null,
        topLogoUrl: topLogoUrl || null,
        bottomLogoUrl: bottomLogoUrl || null,
        feeAmount: feeAmount !== undefined && feeAmount !== null && feeAmount !== '' ? Number(feeAmount).toString() : null,
        remainingBalance: remainingBalance !== undefined && remainingBalance !== null && remainingBalance !== '' ? Number(remainingBalance).toString() : null,
        bottomCaption: bottomCaption || null,
        senderName: senderName || null,
        invoiceType: invoiceType || 'due',
        invoiceTemplate: invoiceTemplate || 'escrow',
        cashtag: cashtag || null,
        avatarUrl: avatarUrl || null,
        stampText: stampText || null,
        status: 'draft',
      });
      const invoiceId = result.insertId as number;
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));

      const invoiceForPdf = { ...invoice, paymentMethod: paymentMethod || null, txStatus: txStatus || null };
      const pdfBuffer = (invoiceForPdf.invoiceTemplate === 'cashapp') ? await generateCashAppInvoicePdf(invoiceForPdf) : await generateInvoicePdf(invoiceForPdf);
      const pdfKey = `invoices/${referenceSlug}.pdf`;
      const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, 'application/pdf');
      await db.update(invoices).set({ pdfUrl, status: 'sent' }).where(eq(invoices.id, invoiceId));
      await sendInvoiceEmail(invoice, pdfBuffer, pdfUrl);

      res.json({ success: true, reference, pdfUrl });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ success: false, message: 'Failed to create and send invoice' });
    }
  });

  app.post('/api/admin/invoices/update-status', express.json(), async (req, res) => {
    if (!isAdminAuthed(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
      const { id, status } = req.body || {};
      if (!id || !['draft', 'sent', 'paid', 'overdue'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
      }
      const { getDb } = await import('../db');
      const { invoices } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });
      await db.update(invoices).set({ status }).where(eq(invoices.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      res.status(500).json({ success: false, message: 'Failed to update invoice status' });
    }
  });

  // Upload endpoint for proof of payment
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

  // Password reset: step 1 - send OTP to registered email
  app.post('/api/password-reset/send-otp', express.json(), async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
      const { getDb } = await import('../db');
      const { registrations, otpVerifications } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });
      const rows = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Email not found' });
      const reg = rows[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.insert(otpVerifications).values({
        registrationId: reg.id,
        code: otp,
        channel: 'email',
        expiresAt,
      });
      const { sendPasswordResetEmail } = await import('../emailService');
      const sent = await sendPasswordResetEmail(email, reg.firstName || 'Customer', otp, reg.preferredLanguage);
      if (!sent) return res.status(500).json({ success: false, message: 'Failed to send reset email' });
      res.json({ success: true, message: 'OTP sent' });
    } catch (error) {
      console.error('[PasswordReset] send-otp error:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  });

  // Password reset: step 2 - verify OTP
  app.post('/api/password-reset/verify-otp', express.json(), async (req, res) => {
    try {
      const { email, otp } = req.body || {};
      if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });
      const { getDb } = await import('../db');
      const { registrations, otpVerifications } = await import('../../drizzle/schema');
      const { eq, and, desc } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });
      const rows = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Email not found' });
      const otpRows = await db.select().from(otpVerifications)
        .where(and(eq(otpVerifications.registrationId, rows[0].id), eq(otpVerifications.code, otp)))
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      if (otpRows.length === 0) return res.status(400).json({ success: false, message: 'Invalid OTP' });
      if (new Date() > otpRows[0].expiresAt) return res.status(400).json({ success: false, message: 'OTP expired' });
      await db.update(otpVerifications).set({ isVerified: true })
        .where(eq(otpVerifications.id, otpRows[0].id));
      res.json({ success: true });
    } catch (error) {
      console.error('[PasswordReset] verify-otp error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
  });

  // Password reset: step 3 - set new password (requires previously verified OTP)
  app.post('/api/password-reset/reset', express.json(), async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body || {};
      if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Missing fields' });
      if (String(newPassword).length < 8) return res.status(400).json({ success: false, message: 'Password too short' });
      const { getDb } = await import('../db');
      const { registrations, otpVerifications } = await import('../../drizzle/schema');
      const { eq, and, desc } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return res.status(500).json({ success: false, message: 'Database unavailable' });
      const rows = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Email not found' });
      const otpRows = await db.select().from(otpVerifications)
        .where(and(eq(otpVerifications.registrationId, rows[0].id), eq(otpVerifications.code, otp)))
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      if (otpRows.length === 0 || !otpRows[0].isVerified) {
        return res.status(400).json({ success: false, message: 'OTP not verified' });
      }
      const { hashPassword } = await import('../passwordUtils');
      const hashed = await hashPassword(newPassword);
      await db.update(registrations).set({ password: hashed }).where(eq(registrations.id, rows[0].id));
      // Notify user of the security change (non-blocking)
      try {
        const { sendSecurityChangeEmail } = await import('../emailService');
        sendSecurityChangeEmail(email, rows[0].firstName || 'Customer', 'Password', rows[0].preferredLanguage).catch(() => {});
      } catch {}
      res.json({ success: true });
    } catch (error) {
      console.error('[PasswordReset] reset error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const ext = req.file.originalname.split('.').pop() || 'png';
      const key = `proofs/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const result = await storagePut(key, req.file.buffer, req.file.mimetype);
      
      res.json({ success: true, url: result.url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
