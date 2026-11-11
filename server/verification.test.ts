import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { registrations, transactions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { appRouter } from "./routers";
import { hashPassword } from "./passwordUtils";

function createCallerForRegistration(regId: number) {
  return appRouter.createCaller({
    user: {
      id: regId,
      openId: `reg_${regId}`,
      name: "Test User",
      email: null,
      loginMethod: "bank",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any,
    req: { headers: {}, cookies: {} } as any,
    res: { cookie: () => {}, clearCookie: () => {} } as any,
  });
}

async function createTestRegistration(balance = "1000.00", codes: { vatCode?: string; imfCode?: string } = {}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const username = `vitest${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const transferPin = await hashPassword("1234");
  await db.insert(registrations).values({
    firstName: "Verify",
    lastName: "Tester",
    username,
    status: "approved",
    kycStatus: "approved",
    balance,
    accountNumber,
    transferPin,
    ...codes,
  } as any);
  const rows = await db.select().from(registrations).where(eq(registrations.username, username)).limit(1);
  return rows[0];
}

async function createTransferAndGetTx(regId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const caller = createCallerForRegistration(regId);
  await caller.account.transfer({
    amount: 100,
    recipientName: "Verification Test",
    recipientAccount: "99887766",
    recipientBank: "Verify Bank",
    transferType: "international",
    currency: "USD",
    pin: "1234",
  });
  const txRows = await db.select().from(transactions)
    .where(eq(transactions.registrationId, regId))
    .orderBy(desc(transactions.createdAt)).limit(1);
  return txRows[0];
}

describe("verification router (VAT/IMF codes)", () => {
  it("accepts a correct VAT code and moves tx back to processing", async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const reg = await createTestRegistration("500.00", { vatCode: "VAT-TEST01" });
    const tx = await createTransferAndGetTx(reg.id);
    await db.update(transactions).set({ status: "pending_vat" }).where(eq(transactions.id, tx.id));

    const caller = createCallerForRegistration(reg.id);
    const result = await caller.verification.submitVatCode({ transactionId: tx.id, code: "vat-test01" });
    expect(result.success).toBe(true);

    const after = await db.select().from(transactions).where(eq(transactions.id, tx.id)).limit(1);
    expect(after[0].status).toBe("processing");
  });

  it("rejects an incorrect IMF code and keeps tx pending_imf", async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const reg = await createTestRegistration("500.00", { imfCode: "IMF-TEST99" });
    const tx = await createTransferAndGetTx(reg.id);
    await db.update(transactions).set({ status: "pending_imf" }).where(eq(transactions.id, tx.id));

    const caller = createCallerForRegistration(reg.id);
    await expect(
      caller.verification.submitImfCode({ transactionId: tx.id, code: "WRONG-CODE" })
    ).rejects.toThrow();

    const after = await db.select().from(transactions).where(eq(transactions.id, tx.id)).limit(1);
    expect(after[0].status).toBe("pending_imf");
  });

  it("rejects VAT submission when no code is set for the customer", async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const reg = await createTestRegistration("500.00");
    const tx = await createTransferAndGetTx(reg.id);
    await db.update(transactions).set({ status: "pending_vat" }).where(eq(transactions.id, tx.id));

    const caller = createCallerForRegistration(reg.id);
    await expect(
      caller.verification.submitVatCode({ transactionId: tx.id, code: "ANYTHING" })
    ).rejects.toThrow();
  });

  it("rejects code submission for a transaction not awaiting verification", async () => {
    const reg = await createTestRegistration("500.00", { vatCode: "VAT-TEST02" });
    const tx = await createTransferAndGetTx(reg.id);
    // tx is in 'processing' status — not awaiting a code
    const caller = createCallerForRegistration(reg.id);
    await expect(
      caller.verification.submitVatCode({ transactionId: tx.id, code: "VAT-TEST02" })
    ).rejects.toThrow();
  });
});
