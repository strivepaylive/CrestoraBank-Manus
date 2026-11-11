import { describe, it, expect } from "vitest";
import { EMAIL_TEMPLATES, fillPlaceholders, bodyToHtml } from "./emailTemplates";
import { emailShell, sendEmail } from "./emailService";
import { getDb } from "./db";
import { emailLogs } from "../drizzle/schema";
import { desc } from "drizzle-orm";

const BASE = "http://localhost:3000";
const ADMIN_HEADERS = {
  "Content-Type": "application/json",
  "x-admin-session": JSON.stringify({ authenticated: true }),
};

describe("Email Center templates", () => {
  it("provides the five required reusable templates", () => {
    const ids = EMAIL_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "kyc_approved",
        "kyc_rejected",
        "account_verification",
        "security_notice",
        "general_notification",
      ])
    );
    for (const t of EMAIL_TEMPLATES) {
      expect(t.subject.length).toBeGreaterThan(0);
      expect(t.headline.length).toBeGreaterThan(0);
      expect(t.body).toContain("{{firstName}}");
    }
  });

  it("fills placeholders with customer details", () => {
    const out = fillPlaceholders("Dear {{firstName}} ({{fullName}}), acct {{accountNumber}}", {
      firstName: "Jane",
      fullName: "Jane Doe",
      accountNumber: "1234567890",
    });
    expect(out).toBe("Dear Jane (Jane Doe), acct 1234567890");
  });

  it("falls back to Customer when names are missing", () => {
    const out = fillPlaceholders("Dear {{firstName}}", {});
    expect(out).toBe("Dear Customer");
  });

  it("converts plain-text body to branded HTML paragraphs and escapes HTML", () => {
    const html = bodyToHtml("Hello <b>world</b>\n\nSecond paragraph");
    expect(html).toContain("&lt;b&gt;world&lt;/b&gt;");
    expect(html.match(/<p /g)?.length).toBe(2);
  });

  it("wraps content in the branded Crestora shell", () => {
    const html = emailShell("Test Headline", "<p>Body</p>");
    expect(html).toContain("Crestora Bank");
    expect(html).toContain("Test Headline");
    expect(html).toContain("<p>Body</p>");
    // The official bank logo must appear at the top of every email
    expect(html).toContain("crestora-logo-ui-clean_a22e78b0.png");
    expect(html).toContain('alt="Crestora Bank"');
  });
});

describe("Email Center sending and history", () => {
  it("sends a real email via Resend and logs it to email_logs", async () => {
    const html = emailShell("Automated Test", bodyToHtml("Dear Customer,\n\nThis is an automated Email Center test."));
    const result = await sendEmail("delivered@resend.dev", "Email Center Vitest", html);
    expect(result.success).toBe(true);
    expect(result.id).toBeTruthy();

    const db = await getDb();
    expect(db).toBeTruthy();
    if (db) {
      await db.insert(emailLogs).values({
        registrationId: null,
        recipientEmail: "delivered@resend.dev",
        recipientName: "Vitest",
        subject: "Email Center Vitest",
        template: "general_notification",
        body: "This is an automated Email Center test.",
        status: "sent",
        resendId: result.id || null,
        sentBy: "admin",
      });
      const rows = await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(5);
      const found = rows.find((r) => r.subject === "Email Center Vitest");
      expect(found).toBeTruthy();
      expect(found?.status).toBe("sent");
      expect(found?.sentBy).toBe("admin");
    }
  }, 20000);
});

describe("Email Center admin endpoints", () => {
  it("GET /api/admin/email-templates returns the template list", async () => {
    const res = await fetch(`${BASE}/api/admin/email-templates`, { headers: ADMIN_HEADERS });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.map((t: any) => t.id)).toContain("kyc_approved");
  });

  it("POST /api/admin/send-email sends and logs via the endpoint", async () => {
    const res = await fetch(`${BASE}/api/admin/send-email`, {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        recipientEmail: "delivered@resend.dev",
        recipientName: "Endpoint Vitest",
        subject: "Email Center Endpoint Vitest",
        headline: "Automated Endpoint Test",
        template: "general_notification",
        body: "Dear Customer,\n\nThis is an automated endpoint test.",
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeTruthy();

    const hRes = await fetch(`${BASE}/api/admin/email-history`, { headers: ADMIN_HEADERS });
    expect(hRes.status).toBe(200);
    const hData = await hRes.json();
    expect(hData.success).toBe(true);
    const found = hData.data.find((r: any) => r.subject === "Email Center Endpoint Vitest");
    expect(found).toBeTruthy();
    expect(found.status).toBe("sent");
    expect(found.recipientEmail).toBe("delivered@resend.dev");
    expect(found.sentBy).toBe("admin");
  }, 20000);

  it("rejects send-email with missing required fields", async () => {
    const res = await fetch(`${BASE}/api/admin/send-email`, {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ recipientEmail: "x@y.com" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects unauthorized access to all email center endpoints", async () => {
    const t = await fetch(`${BASE}/api/admin/email-templates`);
    expect(t.status).toBe(401);
    const h = await fetch(`${BASE}/api/admin/email-history`);
    expect(h.status).toBe(401);
    const s = await fetch(`${BASE}/api/admin/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail: "x@y.com", subject: "x", body: "x" }),
    });
    expect(s.status).toBe(401);
  });
});
