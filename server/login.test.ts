import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hashPassword } from "./passwordUtils";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Login Authentication", () => {
  it("should reject login with invalid credentials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.login.authenticate({
        username: "nonexistent",
        password: "password123",
      });
      expect.fail("Should have rejected invalid credentials");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toContain("Invalid credentials");
    }
  });

  it("should reject login for unapproved accounts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueUsername = `unapproved${Date.now()}`;
    // Create a registration but don't approve it
    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: uniqueUsername,
    });

    await caller.registration.completeRegistration({
      registrationId: reg.registrationId,
      password: "SecurePassword123!",
    });

    try {
      await caller.login.authenticate({
        username: uniqueUsername,
        password: "SecurePassword123!",
      });
      expect.fail("Should have rejected unapproved account");
    } catch (error: any) {
      // Account exists but is not approved
      expect(["FORBIDDEN", "UNAUTHORIZED"]).toContain(error.code);
    }
  });

  it("should reject login with wrong password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.login.authenticate({
        username: "testuser",
        password: "wrongpassword",
      });
      expect.fail("Should have rejected wrong password");
    } catch (error: any) {
      // Either UNAUTHORIZED or FORBIDDEN is acceptable
      expect(["UNAUTHORIZED", "FORBIDDEN"]).toContain(error.code);
    }
  });
});
