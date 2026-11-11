import { describe, it, expect, beforeEach, afterAll } from "vitest";

// Capture the HTML/subject passed to Resend's REST API instead of sending
const sent: Array<{ to: string; subject: string; html: string }> = [];
process.env.EMAIL_TEST_CAPTURE = "1"; // bypass test-mode skip so fetch stub captures rendered emails
const realFetch = global.fetch;
global.fetch = (async (url: any, opts: any) => {
  if (String(url).includes("api.resend.com")) {
    const body = JSON.parse(opts.body);
    sent.push({ to: body.to, subject: body.subject, html: body.html });
    return new Response(JSON.stringify({ id: "mock-id" }), { status: 200 });
  }
  return realFetch(url, opts);
}) as any;

import { sendOTPEmail, sendWithdrawalEmail } from "./emailService";

beforeEach(() => { sent.length = 0; });
afterAll(() => { global.fetch = realFetch; });

describe("localized email rendering", () => {
  it("renders Spanish OTP email with localized subject and body", async () => {
    const ok = await sendOTPEmail("test@example.com", "123456", "es");
    expect(ok).toBe(true);
    expect(sent).toHaveLength(1);
    const en = { subject: sent[0].subject, html: sent[0].html };
    sent.length = 0;
    await sendOTPEmail("test@example.com", "123456", "en");
    expect(en.subject).not.toBe(sent[0].subject); // Spanish differs from English
    expect(en.html).toContain("123456");
  });

  it("renders Arabic withdrawal email with RTL markup and localized currency/date", async () => {
    const ok = await sendWithdrawalEmail("test@example.com", "Omar", {
      customerName: "Omar Ali", reference: "FEE-TEST1", transactionType: "Card Issuance Fee",
      amount: "25.00", currency: "USD", status: "completed", balanceAfter: "75.00", lang: "ar",
    });
    expect(ok).toBe(true);
    expect(sent).toHaveLength(1);
    const html = sent[0].html;
    expect(html).toMatch(/dir="rtl"/); // RTL layout applied
    expect(html).toContain("FEE-TEST1");
    // fallback check: unknown language falls back to English subject
    const arSubject = sent[0].subject;
    sent.length = 0;
    await sendWithdrawalEmail("test@example.com", "Omar", {
      customerName: "Omar Ali", amount: "25.00", lang: "xx",
    });
    expect(sent[0].subject).not.toBe(arSubject);
  });
});
