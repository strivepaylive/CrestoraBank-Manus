import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

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

describe("Registration Flow", () => {
  it("should start registration with valid personal info", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `johndoe${Date.now()}`,
    });

    expect(result).toHaveProperty("registrationId");
    expect(typeof result.registrationId).toBe("number");
  });

  it("should complete registration with password", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `passwordtest${Date.now()}`,
    });

    const result = await caller.registration.completeRegistration({
      registrationId: reg.registrationId,
      password: "SecurePassword123!",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("submitted for approval");
  });

  it("should reject weak passwords", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `weakpass${Date.now()}`,
    });

    try {
      await caller.registration.completeRegistration({
        registrationId: reg.registrationId,
        password: "weak",
      });
      expect.fail("Should have rejected weak password");
    } catch (error) {
      expect(error instanceof TRPCError).toBe(true);
    }
  });
});
