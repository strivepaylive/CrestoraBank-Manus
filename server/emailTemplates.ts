/**
 * Reusable Email Center templates.
 * Each template provides a default subject, headline, and body generator.
 * Placeholders supported in body/subject: {{firstName}}, {{fullName}}, {{accountNumber}}
 */

export type EmailTemplateDef = {
  id: string;
  name: string;
  subject: string;
  headline: string;
  body: string; // plain-text body with placeholders; rendered into branded shell
};

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    id: "kyc_approved",
    name: "KYC Approved",
    subject: "Your Identity Verification Has Been Approved",
    headline: "KYC Verification Approved",
    body: `Dear {{firstName}},

We are pleased to inform you that your identity verification (KYC) has been successfully completed and approved.

Your account now has full access to all Crestora Bank services, including transfers, deposits, and card services.

Thank you for banking with Crestora Bank.`,
  },
  {
    id: "kyc_rejected",
    name: "KYC Rejected",
    subject: "Action Required: Identity Verification Update",
    headline: "KYC Verification Update",
    body: `Dear {{firstName}},

Unfortunately, we were unable to verify your identity with the documents provided.

To complete your verification, please submit a clear, valid government-issued ID and a recent proof of address through your online banking dashboard or contact our support team.

We apologize for any inconvenience and look forward to completing your verification.`,
  },
  {
    id: "account_verification",
    name: "Account Verification",
    subject: "Verify Your Crestora Bank Account",
    headline: "Account Verification",
    body: `Dear {{firstName}},

As part of our ongoing commitment to keeping your account secure, we kindly ask you to verify your account details.

Please sign in to your online banking dashboard to review and confirm your information. If any details are outdated, update them at your earliest convenience.

If you have questions, our support team is available via live chat on our website.`,
  },
  {
    id: "security_notice",
    name: "Security Notice",
    subject: "Important Security Notice Regarding Your Account",
    headline: "Security Notice",
    body: `Dear {{firstName}},

We are writing to inform you of an important security notice regarding your Crestora Bank account.

As a precaution, we recommend reviewing your recent account activity and updating your password if you notice anything unusual.

Crestora Bank will never ask for your password or one-time codes by phone or email. If you receive any suspicious communication, please report it to our support team immediately.`,
  },
  {
    id: "general_notification",
    name: "General Notification",
    subject: "A Message From Crestora Bank",
    headline: "Notification",
    body: `Dear {{firstName}},

We have an important update regarding your Crestora Bank account.

[Write your message here]

If you have any questions, please don't hesitate to contact our support team.`,
  },
];

export function fillPlaceholders(
  text: string,
  vars: { firstName?: string | null; fullName?: string | null; accountNumber?: string | null }
): string {
  return text
    .replaceAll("{{firstName}}", vars.firstName || "Customer")
    .replaceAll("{{fullName}}", vars.fullName || vars.firstName || "Customer")
    .replaceAll("{{accountNumber}}", vars.accountNumber || "");
}

/** Convert plain-text body (with newlines) into styled HTML paragraphs */
export function bodyToHtml(body: string): string {
  return body
    .split(/\n\s*\n/)
    .map((p) => `<p style="color: #374151; font-size: 16px; white-space: pre-wrap;">${escapeHtml(p.trim())}</p>`)
    .join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
