import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { AuthenticatedUser } from "./_core/sdk";

function createCallerFor(user: Partial<AuthenticatedUser> | null) {
  const res: any = { cookie: () => {}, clearCookie: () => {} };
  const req: any = { headers: {}, protocol: "https", hostname: "test.local" };
  return appRouter.createCaller({ user: user as AuthenticatedUser, req, res } as any);
}

describe("registration + banking flow", () => {
  it("creates a registration, sets password and assigns an account number", async () => {
    const caller = createCallerFor(null);
    const uname = "vitest" + Math.floor(Math.random() * 1000000);
    const start = await caller.registration.startRegistration({
      firstName: "Vi",
      lastName: "Test",
      username: uname,
    });
    expect(start.registrationId).toBeGreaterThan(0);

    const complete = await caller.registration.completeRegistration({
      registrationId: start.registrationId,
      password: "Password123!",
    });
    expect(complete.success).toBe(true);

    // Login should fail while not approved
    await expect(
      caller.login.authenticate({ username: uname, password: "Password123!" })
    ).rejects.toThrow(/not approved/i);
  });

  it("rejects transfers that exceed the balance", async () => {
    const caller = createCallerFor(null);
    const uname = "vitest" + Math.floor(Math.random() * 1000000);
    const start = await caller.registration.startRegistration({
      firstName: "Poor",
      lastName: "User",
      username: uname,
    });
    await caller.registration.completeRegistration({
      registrationId: start.registrationId,
      password: "Password123!",
    });

    const userCaller = createCallerFor({
      id: 999999,
      openId: `reg_${start.registrationId}`,
      name: "Poor User",
      role: "user",
    });

    // A transfer PIN is now required before any transfer
    await userCaller.account.setPin({ pin: "1234" });

    // KYC approval is now required before any transfer
    const { getDb } = await import("./db");
    const { registrations } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    await db!.update(registrations).set({ kycStatus: "approved" }).where(eq(registrations.id, start.registrationId));

    await expect(
      userCaller.account.transfer({
        amount: 100,
        recipientName: "Nobody",
        recipientAccount: "12345",
        recipientBank: "Test Bank",
        transferType: "local",
        pin: "1234",
      })
    ).rejects.toThrow(/insufficient/i);
  });

  it("returns account details for a reg_ session", async () => {
    const caller = createCallerFor(null);
    const uname = "vitest" + Math.floor(Math.random() * 1000000);
    const start = await caller.registration.startRegistration({
      firstName: "Acct",
      lastName: "Holder",
      username: uname,
    });
    await caller.registration.completeRegistration({
      registrationId: start.registrationId,
      password: "Password123!",
    });

    const userCaller = createCallerFor({
      id: 999998,
      openId: `reg_${start.registrationId}`,
      name: "Acct Holder",
      role: "user",
    });
    const account = await userCaller.account.me();
    expect(account).not.toBeNull();
    expect(account!.accountNumber).toMatch(/^\d{10}$/);
    expect(account!.balance).toBe("0.00");
  });
});
