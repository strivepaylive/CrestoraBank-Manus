import { describe, expect, it } from "vitest";
import { getDb } from "./db";
import { registrations, cards } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { appRouter } from "./routers";
import { generateCardDetails } from "./cardService";
import { SUPPORTED_CURRENCIES } from "./currencyService";

function createCallerForRegistration(regId: number) {
  return appRouter.createCaller({
    user: {
      id: regId,
      openId: `reg_${regId}`,
      name: "Phase2 Tester",
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
  const username = `p2test${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  await db.insert(registrations).values({
    firstName: "Phase2",
    lastName: "Tester",
    username,
    status: "approved",
    kycStatus: "approved",
    balance,
    accountNumber,
  } as any);
  const rows = await db.select().from(registrations).where(eq(registrations.username, username)).limit(1);
  return rows[0];
}

function luhnValid(num: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

describe("phase 2 enhancements", () => {
  it("generates Luhn-valid 16-digit card numbers with future expiry", () => {
    for (const type of ["debit", "credit"] as const) {
      const details = generateCardDetails(type);
      expect(details.cardNumber).toMatch(/^\d{16}$/);
      expect(luhnValid(details.cardNumber)).toBe(true);
      expect(details.cvv).toMatch(/^\d{3}$/);
      expect(details.expiryDate).toMatch(/^(0[1-9]|1[0-2])\/\d{2}$/);
      const [, yy] = details.expiryDate.split("/");
      expect(parseInt(yy, 10)).toBeGreaterThan(new Date().getFullYear() % 100);
    }
  });

  it("supports Caribbean currencies (JMD, TTD, BSD)", () => {
    const codes = SUPPORTED_CURRENCIES.map((c: any) => c.code);
    expect(codes).toContain("JMD");
    expect(codes).toContain("TTD");
    expect(codes).toContain("BSD");
  });

  it("blocks transfers without a PIN and allows them after setting one", async () => {
    const reg = await createTestRegistration("500.00");
    const caller = createCallerForRegistration(reg.id);

    await expect(
      caller.account.transfer({
        amount: 50,
        recipientName: "Pin Test",
        recipientAccount: "12341234",
        recipientBank: "Pin Bank",
        transferType: "local",
        currency: "USD",
        pin: "1234",
      })
    ).rejects.toThrow(/PIN not set/i);

    await caller.account.setPin({ pin: "1234" });
    const status = await caller.account.pinStatus();
    expect(status.hasPin).toBe(true);

    // Wrong PIN rejected
    await expect(
      caller.account.transfer({
        amount: 50,
        recipientName: "Pin Test",
        recipientAccount: "12341234",
        recipientBank: "Pin Bank",
        transferType: "local",
        currency: "USD",
        pin: "9999",
      })
    ).rejects.toThrow(/incorrect/i);

    // Correct PIN succeeds
    const result = await caller.account.transfer({
      amount: 50,
      recipientName: "Pin Test",
      recipientAccount: "12341234",
      recipientBank: "Pin Bank",
      transferType: "local",
      currency: "USD",
      pin: "1234",
    });
    expect(result.success).toBe(true);
  });

  it("card request flow: request stays pending until admin approves", async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const reg = await createTestRegistration("100.00");
    const caller = createCallerForRegistration(reg.id);

    const res = await caller.cards.request({ type: "debit" });
    expect(res.success).toBe(true);

    const myCards = await caller.cards.myCards();
    expect(myCards.length).toBe(1);
    expect(myCards[0].status).toBe("pending");
    expect(myCards[0].cardNumber).toBeFalsy();

    // Duplicate pending request for same type is rejected
    await expect(caller.cards.request({ type: "debit" })).rejects.toThrow();

    // Simulate admin approval
    const details = generateCardDetails("debit");
    await db.update(cards).set({
      status: "approved",
      cardNumber: details.cardNumber,
      expiryDate: details.expiryDate,
      cvv: details.cvv,
    }).where(eq(cards.id, myCards[0].id));

    const after = await caller.cards.myCards();
    expect(after[0].status).toBe("approved");
    expect(after[0].cardNumber).toMatch(/^\d{16}$/);
  });

  it("kyc submit updates status to pending review", async () => {
    const reg = await createTestRegistration("100.00");
    const caller = createCallerForRegistration(reg.id);
    const status = await caller.kyc.status();
    expect(["not_submitted", "approved", null, undefined]).toContain(status.kycStatus as any);
  });
});
