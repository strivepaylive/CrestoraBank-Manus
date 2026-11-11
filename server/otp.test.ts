import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("OTP Verification Flow", () => {
  it("should submit contact details and trigger OTP generation", { timeout: 20000 }, async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `otptest${Date.now()}`,
    });

    const result = await caller.registration.submitContactDetails({
      registrationId: reg.registrationId,
      contactMethod: "email",
      email: "test@example.com",
      phone: "+15551234567",
      nationality: "American",
      dateOfBirth: "1990-01-15",
      address: "123 Main Street, McLean, VA, United States",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("OTP sent");
  });

  it("should require email when email contact method is selected", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `emailtest${Date.now()}`,
    });

    try {
      await caller.registration.submitContactDetails({
        registrationId: reg.registrationId,
        contactMethod: "email",
        email: undefined,
        phone: "+15551234567",
        nationality: "American",
        dateOfBirth: "1990-01-15",
        address: "123 Main Street, McLean, VA, United States",
      });
      expect.fail("Should have required email");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should require phone when phone contact method is selected", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `phonetest${Date.now()}`,
    });

    try {
      await caller.registration.submitContactDetails({
        registrationId: reg.registrationId,
        contactMethod: "phone",
        phone: "",
        nationality: "American",
        dateOfBirth: "1990-01-15",
        address: "123 Main Street, McLean, VA, United States",
      });
      expect.fail("Should have required phone");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should reject invalid OTP code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const reg = await caller.registration.startRegistration({
      firstName: "John",
      lastName: "Doe",
      username: `invalidotp${Date.now()}`,
    });

    try {
      await caller.registration.verifyOTP({
        registrationId: reg.registrationId,
        code: "000000",
      });
      expect.fail("Should have rejected invalid OTP");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});
