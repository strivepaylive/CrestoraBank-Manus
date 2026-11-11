import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { registrations, otpVerifications } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./passwordUtils";
import { sendPasswordResetEmail } from "./emailService";

const BASE_URL = process.env.PW_RESET_TEST_BASE_URL || "http://localhost:3000";

async function serverAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/password-reset/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return res.status === 400; // endpoint exists and validates input
  } catch {
    return false;
  }
}

describe("Password Reset Flow", () => {
  it("sends a password reset email via Resend", { timeout: 30000 }, async () => {
    const ok = await sendPasswordResetEmail("delivered@resend.dev", "Vitest", "123456");
    expect(ok).toBe(true);
  });

  it("stores and verifies a reset OTP, then updates the password", { timeout: 30000 }, async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;

    // Create a temporary registration
    const username = `pwreset${Date.now()}`;
    const email = `pwreset${Date.now()}@example.com`;
    const insert = await db.insert(registrations).values({
      firstName: "Reset",
      lastName: "Test",
      username,
      email,
      status: "approved",
      password: await hashPassword("OldPassword123!"),
    });
    const regId = insert[0].insertId;

    try {
      // Step 1: create OTP (mirrors /api/password-reset/send-otp logic)
      const otp = "654321";
      await db.insert(otpVerifications).values({
        registrationId: regId,
        code: otp,
        channel: "email",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      // Step 2: verify OTP (mirrors /api/password-reset/verify-otp logic)
      const otpRows = await db.select().from(otpVerifications)
        .where(and(eq(otpVerifications.registrationId, regId), eq(otpVerifications.code, otp)))
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      expect(otpRows.length).toBe(1);
      expect(new Date() <= otpRows[0].expiresAt).toBe(true);
      await db.update(otpVerifications).set({ isVerified: true })
        .where(eq(otpVerifications.id, otpRows[0].id));

      // Step 3: reset password (mirrors /api/password-reset/reset logic)
      const verifiedRows = await db.select().from(otpVerifications)
        .where(and(eq(otpVerifications.registrationId, regId), eq(otpVerifications.code, otp)))
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      expect(verifiedRows[0].isVerified).toBe(true);
      const newHash = await hashPassword("NewPassword456!");
      await db.update(registrations).set({ password: newHash }).where(eq(registrations.id, regId));

      const updated = await db.select().from(registrations).where(eq(registrations.id, regId)).limit(1);
      expect(await verifyPassword("NewPassword456!", updated[0].password!)).toBe(true);
      expect(await verifyPassword("OldPassword123!", updated[0].password!)).toBe(false);
    } finally {
      // Cleanup test data
      await db.delete(otpVerifications).where(eq(otpVerifications.registrationId, regId));
      await db.delete(registrations).where(eq(registrations.id, regId));
    }
  });

  it("end-to-end via REST endpoints: send-otp -> verify-otp -> reset", { timeout: 30000 }, async () => {
    if (!(await serverAvailable())) {
      console.warn("[passwordReset.test] Dev server not reachable, skipping REST E2E test");
      return;
    }
    const db = await getDb();
    expect(db).toBeTruthy();
    if (!db) return;

    const email = "delivered@resend.dev"; // Resend test inbox, always deliverable
    // Ensure a registration exists for this email
    const username = `pwrest${Date.now()}`;
    const insert = await db.insert(registrations).values({
      firstName: "RestE2E",
      lastName: "Test",
      username,
      email,
      status: "approved",
      password: await hashPassword("OldPassword123!"),
    });
    const regId = insert[0].insertId;

    try {
      // Step 1: send-otp
      const sendRes = await fetch(`${BASE_URL}/api/password-reset/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      expect(sendRes.status).toBe(200);

      // The endpoint selects the first registration matching this shared email,
      // which may not be our freshly inserted row. Find the OTP via that registration.
      const chosen = await db.select().from(registrations).where(eq(registrations.email, email)).limit(1);
      const otpRows = await db.select().from(otpVerifications)
        .where(eq(otpVerifications.registrationId, chosen[0].id))
        .orderBy(desc(otpVerifications.createdAt))
        .limit(1);
      expect(otpRows.length).toBe(1);
      const otp = otpRows[0].code;

      // Step 2: verify-otp
      const verifyRes = await fetch(`${BASE_URL}/api/password-reset/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      expect(verifyRes.status).toBe(200);

      // Step 3: reset
      const resetRes = await fetch(`${BASE_URL}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: "BrandNewPass789!" }),
      });
      expect(resetRes.status).toBe(200);

      const updated = await db.select().from(registrations).where(eq(registrations.id, chosen[0].id)).limit(1);
      expect(await verifyPassword("BrandNewPass789!", updated[0].password!)).toBe(true);

      // Wrong OTP must be rejected
      const badRes = await fetch(`${BASE_URL}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: "000000", newPassword: "HackAttempt123!" }),
      });
      expect(badRes.status).toBe(400);
    } finally {
      await db.delete(otpVerifications).where(eq(otpVerifications.registrationId, regId));
      await db.delete(registrations).where(eq(registrations.id, regId));
    }
  });
});
