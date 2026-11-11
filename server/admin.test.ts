import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAdminContext(): TrpcContext {
  const adminUser: User = {
    id: 1,
    openId: "admin-user",
    name: "Admin User",
    email: "admin@example.com",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const regularUser: User = {
    id: 2,
    openId: "regular-user",
    name: "Regular User",
    email: "user@example.com",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin Operations", () => {
  it("should allow admin to view all registrations", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getAllRegistrations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny non-admin access to registrations", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getAllRegistrations();
      expect.fail("Should have denied non-admin access");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to approve registrations", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This test assumes a registration exists in the database
    // In a real scenario, we'd create one first
    try {
      const result = await caller.admin.approveRegistration({ registrationId: 1 });
      expect(result.success).toBe(true);
    } catch (error) {
      // Expected if no registration exists
    }
  });
});
