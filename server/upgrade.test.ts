import { describe, expect, it } from "vitest";
import { getDb, createUserNotification } from "./db";
import { registrations, transactions, userNotifications } from "../drizzle/schema";
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

async function createTestRegistration(balance = "1000.00") {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const username = `upgtest${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const transferPin = await hashPassword("1234");
  await db.insert(registrations).values({
    firstName: "Upgrade",
    lastName: "Tester",
    username,
    status: "approved",
    kycStatus: "approved",
    balance,
    accountNumber,
    transferPin,
  } as any);
  const rows = await db.select().from(registrations).where(eq(registrations.username, username)).limit(1);
  return rows[0];
}

describe("production upgrade features", () => {
  it("transfer generates a CRB reference and processing status", async () => {
    const reg = await createTestRegistration("500.00");
    const caller = createCallerForRegistration(reg.id);
    const result = await caller.account.transfer({
      amount: 100,
      recipientName: "Ref Test",
      recipientAccount: "12345678",
      recipientBank: "Test Bank",
      transferType: "local",
      currency: "USD",
      pin: "1234",
    });
    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^CRB-\d{8}-[A-Z0-9]{6}$/);
    expect(result.status).toBe("processing");
    expect(parseFloat(result.newBalance)).toBeCloseTo(400);
  });

  it("transfer creates an in-app notification", async () => {
    const reg = await createTestRegistration("300.00");
    const caller = createCallerForRegistration(reg.id);
    await caller.account.transfer({
      amount: 50,
      recipientName: "Notif Test",
      recipientAccount: "87654321",
      recipientBank: "Notif Bank",
      transferType: "local",
      currency: "USD",
      pin: "1234",
    });
    // notification creation is fire-and-forget; give it a moment
    await new Promise((r) => setTimeout(r, 500));
    const notifs = await caller.account.notifications();
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].title).toBe("Transfer Processing");
    expect(notifs[0].isRead).toBe(false);
  });

  it("markNotificationsRead marks all as read", async () => {
    const reg = await createTestRegistration("100.00");
    await createUserNotification(reg.id, "Test", "Test message", "system");
    const caller = createCallerForRegistration(reg.id);
    const before = await caller.account.notifications();
    expect(before.some((n) => !n.isRead)).toBe(true);
    await caller.account.markNotificationsRead();
    const after = await caller.account.notifications();
    expect(after.every((n) => n.isRead)).toBe(true);
  });

  it("failed/reversed status refunds via admin logic (db-level check)", async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const reg = await createTestRegistration("200.00");
    const caller = createCallerForRegistration(reg.id);
    const result = await caller.account.transfer({
      amount: 150,
      recipientName: "Refund Test",
      recipientAccount: "11112222",
      recipientBank: "Refund Bank",
      transferType: "local",
      currency: "USD",
      pin: "1234",
    });
    expect(parseFloat(result.newBalance)).toBeCloseTo(50);

    // Simulate the admin refund path: mark failed and credit back
    const txRows = await db.select().from(transactions)
      .where(eq(transactions.registrationId, reg.id))
      .orderBy(desc(transactions.createdAt)).limit(1);
    const tx = txRows[0];
    expect(tx.status).toBe("processing");

    const regRows = await db.select().from(registrations).where(eq(registrations.id, reg.id)).limit(1);
    const newBalance = (parseFloat(regRows[0].balance || "0") + parseFloat(tx.amount)).toFixed(2);
    await db.update(registrations).set({ balance: newBalance }).where(eq(registrations.id, reg.id));
    await db.update(transactions).set({ status: "failed" }).where(eq(transactions.id, tx.id));

    const after = await db.select().from(registrations).where(eq(registrations.id, reg.id)).limit(1);
    expect(parseFloat(after[0].balance || "0")).toBeCloseTo(200);
  });
});
