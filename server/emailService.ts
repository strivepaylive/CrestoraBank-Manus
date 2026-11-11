/**
 * Email service using Resend API
 * Sends OTP codes and support notifications from crestorabank.com domain
 */
import { getStrings, fill, fmtMoneyIntl, fmtDateIntl, isRTL, normalizeLanguage } from "./emailI18n";
import type { EmailStrings } from "./emailTranslations";

/** Test inboxes (Resend sandbox addresses) never consume real quota. */
function isDryRunRecipient(to: string): boolean {
  return /@resend\.dev$/i.test(to);
}

export async function sendEmail(to: string, subject: string, html: string, from = "noreply@crestorabank.com"): Promise<{ success: boolean; id?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[EMAIL] RESEND_API_KEY not configured");
      return { success: false };
    }
    if ((process.env.VITEST || isDryRunRecipient(to)) && !process.env.EMAIL_TEST_CAPTURE) {
      console.log(`[EMAIL] (test mode) skipped real send "${subject}" to ${to}`);
      return { success: true, id: "test-mode" };
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("[EMAIL] Resend API error:", JSON.stringify(error));
      return { success: false };
    }
    const data = await response.json();
    console.log(`[EMAIL] Sent "${subject}" to ${to}. Message ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[EMAIL] Email service error:", error);
    return { success: false };
  }
}

const SITE_URL = "https://www.crestorabank.com";
const ITRT_LOGO_URL = `${SITE_URL}/cdn/media/itrt-logo_f823c1b8.png`;
const BANK_LOGO_URL = `${SITE_URL}/manus-storage/crestora-logo-ui-clean_a22e78b0.png`;

/** Premium responsive email shell with Crestora branding. */
export function emailShell(headline: string, body: string, options?: { badge?: { label: string; color: string; bg: string }; lang?: string | null }): string {
  const lang = normalizeLanguage(options?.lang);
  const T = getStrings(lang);
  const dir = isRTL(lang) ? ' dir="rtl"' : "";
  const align = isRTL(lang) ? "right" : "left";
  const badge = options?.badge
    ? `<div style="margin-top:14px;"><span style="display:inline-block; background:${options.badge.bg}; color:${options.badge.color}; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:6px 14px; border-radius:999px;">${options.badge.label}</span></div>`
    : "";
  return `
  <div${dir} style="background:#eef2f7; padding:24px 12px; font-family:'Segoe UI', Arial, Helvetica, sans-serif; text-align:${align};">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
      <div style="background:#ffffff; padding:20px 32px 16px 32px; text-align:center; border-bottom:1px solid #e2e8f0;">
        <a href="${SITE_URL}" style="text-decoration:none;">
          <img src="${BANK_LOGO_URL}" alt="Crestora Bank" width="180" style="display:inline-block; max-width:180px; height:auto; border:0;" />
        </a>
      </div>
      <div style="background:linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%); padding:36px 32px; text-align:center;">
        <p style="color:#ffffff; margin:0; font-size:20px; font-weight:700; letter-spacing:0.3px;">${headline}</p>
        ${badge}
      </div>
      <div style="padding:32px 28px; background:#ffffff;">
        ${body}
      </div>
      <div style="background:#f8fafc; padding:20px 28px; border-top:1px solid #e2e8f0;">
        <p style="color:#64748b; font-size:12px; margin:0 0 6px 0;">
          ${T.common.footerAutomated}
        </p>
        <p style="color:#94a3b8; font-size:12px; margin:0;">
          © 1994-2026 Crestora Bank. ${T.common.footerRights} &nbsp;|&nbsp; <a href="${SITE_URL}" style="color:#1d4ed8; text-decoration:none;">www.crestorabank.com</a> &nbsp;|&nbsp; <a href="${SITE_URL}/support" style="color:#1d4ed8; text-decoration:none;">${T.common.customerSupport}</a><br/>
          120 Wall Street, New York, NY 10005, United States
        </p>
      </div>
    </div>
  </div>
  `;
}

/** Status badge colors used across transaction emails. */
const BADGE_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#92400e", bg: "#fef3c7" },
  approved: { color: "#1e40af", bg: "#dbeafe" },
  completed: { color: "#065f46", bg: "#d1fae5" },
  failed: { color: "#991b1b", bg: "#fee2e2" },
  "on-hold": { color: "#9a3412", bg: "#ffedd5" },
  reversed: { color: "#5b21b6", bg: "#ede9fe" },
  processing: { color: "#1e40af", bg: "#dbeafe" },
  pending_vat: { color: "#92400e", bg: "#fef3c7" },
  pending_imf: { color: "#92400e", bg: "#fef3c7" },
};

/** Localized status badge for a status key. */
function statusBadge(status: string, lang?: string | null): { label: string; color: string; bg: string } | undefined {
  const colors = BADGE_COLORS[status];
  if (!colors) return undefined;
  const T = getStrings(lang);
  const labels: Record<string, string> = {
    pending: T.status.pending,
    approved: T.status.approved,
    completed: T.status.completed,
    failed: T.status.failed,
    "on-hold": T.status.onHold,
    reversed: T.status.reversed,
    processing: "Processing",
    pending_vat: "VAT Code Required",
    pending_imf: "IMF Code Required",
  };
  return { label: labels[status] || status, ...colors };
}

function fmtMoney(amount: string | number, currency = "USD", lang?: string | null): string {
  return fmtMoneyIntl(amount, currency, lang);
}

function detailRow(label: string, value: string, opts?: { bold?: boolean; mono?: boolean }): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:9px 0; color:#64748b; font-size:13px; vertical-align:top; width:44%;">${label}</td>
      <td style="padding:9px 0; color:#0f172a; font-size:13px; text-align:right; ${opts?.bold ? "font-weight:700;" : ""} ${opts?.mono ? "font-family:'Courier New',monospace; letter-spacing:0.5px;" : ""}">${value}</td>
    </tr>`;
}

function detailsTable(title: string, rows: string): string {
  if (!rows.trim()) return "";
  return `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px 20px; margin:20px 0;">
      <p style="margin:0 0 8px 0; color:#334155; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${title}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
        ${rows}
      </table>
    </div>`;
}

function ctaButtons(lang?: string | null): string {
  const T = getStrings(lang);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 8px 0;">
      <tr>
        <td align="center">
          <a href="${SITE_URL}/login" style="display:inline-block; background:#1d4ed8; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; padding:13px 26px; border-radius:8px; margin:4px 6px;">${T.common.loginButton}</a>
          <a href="${SITE_URL}/support" style="display:inline-block; background:#ffffff; color:#1d4ed8; font-size:14px; font-weight:600; text-decoration:none; padding:12px 26px; border-radius:8px; border:2px solid #1d4ed8; margin:4px 6px;">${T.common.supportButton}</a>
        </td>
      </tr>
    </table>`;
}

export interface ConversionEmailInfo {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  exchangeRate: number;
  transferFee: string;
  recipientAmount: string;
  rateTimestamp: Date | string;
}

/** Currency Conversion Summary block — only rendered when currencies differ. */
function conversionBlock(c?: ConversionEmailInfo | null, lang?: string | null): string {
  if (!c || c.fromCurrency === c.toCurrency) return "";
  const T = getStrings(lang);
  const ts = typeof c.rateTimestamp === "string" ? new Date(c.rateTimestamp) : c.rateTimestamp;
  const rows =
    detailRow(T.labels.senderAmount, fmtMoney(c.amount, c.fromCurrency, lang), { bold: true }) +
    detailRow(T.labels.recipientCurrency, c.toCurrency) +
    detailRow(T.labels.exchangeRate, `1 ${c.fromCurrency} = ${c.exchangeRate.toFixed(4)} ${c.toCurrency}`) +
    (parseFloat(c.transferFee) > 0 ? detailRow(T.labels.transferFee, fmtMoney(c.transferFee, c.fromCurrency, lang)) : "") +
    detailRow(T.labels.estRecipientAmount, fmtMoney(c.recipientAmount, c.toCurrency, lang), { bold: true }) +
    detailRow(T.labels.rateAppliedOn, fmtDateIntl(ts, lang));
  return detailsTable(T.labels.conversionSummary, rows);
}

export interface TransactionEmailData {
  customerName: string;
  reference?: string | null;
  transactionType?: string;
  amount: string;
  currency?: string;
  recipientName?: string | null;
  recipientBank?: string | null;
  recipientAccount?: string | null;
  description?: string | null;
  dateStr?: string;
  status?: string;
  balanceAfter?: string | null;
  transferType?: string | null;
  conversion?: ConversionEmailInfo | null;
  /** Optional custom message written by the bank administrator, shown prominently. */
  customMessage?: string | null;
  /** Preferred language for localization; falls back to English. */
  lang?: string | null;
}

/** Prominent block for a personalised message written by the bank administrator. */
function customMessageBlock(msg?: string | null, lang?: string | null): string {
  if (!msg) return "";
  const T = getStrings(lang);
  const safe = String(msg)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  return `
    <div style="background:#f8fafc; border-left:4px solid #1d4ed8; border-radius:0 10px 10px 0; padding:18px 20px; margin:20px 0;">
      <p style="margin:0 0 8px 0; color:#1e40af; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${T.common.messageFromBank}</p>
      <p style="margin:0; color:#0f172a; font-size:14px; line-height:1.8;">${safe}</p>
    </div>`;
}

/** Full transaction summary table used by every transaction email. */
function transactionSummary(d: TransactionEmailData): string {
  const lang = d.lang;
  const T = getStrings(lang);
  const currency = d.currency || "USD";
  const statusLabel = d.status ? (statusBadge(d.status, lang)?.label || d.status) : "";
  const rows =
    detailRow(T.labels.customer, d.customerName) +
    (d.reference ? detailRow(T.labels.referenceNumber, d.reference, { mono: true, bold: true }) : "") +
    (d.transactionType ? detailRow(T.labels.transactionType, d.transactionType) : "") +
    detailRow(T.labels.amount, fmtMoney(d.amount, currency, lang), { bold: true }) +
    detailRow(T.labels.currency, currency) +
    (d.recipientName ? detailRow(T.labels.recipientName, d.recipientName) : "") +
    (d.recipientBank ? detailRow(T.labels.recipientBank, d.recipientBank) : "") +
    (d.recipientAccount ? detailRow(T.labels.recipientAccount, `••••${d.recipientAccount.slice(-4)}`, { mono: true }) : "") +
    (d.description ? detailRow(T.labels.paymentDescription, d.description) : "") +
    detailRow(T.labels.dateTime, d.dateStr || fmtDateIntl(new Date(), lang)) +
    (statusLabel ? detailRow(T.labels.currentStatus, statusLabel, { bold: true }) : "") +
    (d.balanceAfter != null && d.balanceAfter !== "" ? detailRow(T.labels.availableBalance, fmtMoney(d.balanceAfter, currency, lang), { bold: true }) : "");
  return detailsTable(T.labels.transactionSummary, rows) + conversionBlock(d.conversion, lang);
}

/** ITRT (International Transfer Review Team) hold-review metadata. */
export interface HoldReviewInfo {
  reviewCaseId?: string | null;
  holdReason?: string | null;
  estimatedReviewTime?: string | null;
  actionRequired?: boolean;
}

/** Transfer status change emails (approved / completed / failed / on-hold / reversed) */
export async function sendTransferStatusEmail(
  to: string,
  firstName: string,
  status: string,
  details: TransactionEmailData,
  review?: HoldReviewInfo
): Promise<boolean> {
  if (status === "on-hold") {
    return sendTransferOnHoldEmail(to, details, review);
  }
  const lang = details.lang;
  const T = getStrings(lang);
  const statusCopy: Record<string, { subject: string; headline: string; body: string }> = {
    approved: {
      subject: T.transferStatus.approvedSubject,
      headline: T.transferStatus.approvedHeadline,
      body: T.transferStatus.approvedBody,
    },
    completed: {
      subject: T.transferStatus.completedSubject,
      headline: T.transferStatus.completedHeadline,
      body: T.transferStatus.completedBody,
    },
    failed: {
      subject: T.transferStatus.failedSubject,
      headline: T.transferStatus.failedHeadline,
      body: T.transferStatus.failedBody,
    },
    reversed: {
      subject: T.transferStatus.reversedSubject,
      headline: T.transferStatus.reversedHeadline,
      body: T.transferStatus.reversedBody,
    },
    processing: {
      subject: T.transferStatus.processingSubject,
      headline: T.transferStatus.processingHeadline,
      body: T.transferStatus.processingBody,
    },
    pending_vat: {
      subject: T.transferStatus.vatRequiredSubject,
      headline: T.transferStatus.vatRequiredHeadline,
      body: T.transferStatus.vatRequiredBody,
    },
    pending_imf: {
      subject: T.transferStatus.imfRequiredSubject,
      headline: T.transferStatus.imfRequiredHeadline,
      body: T.transferStatus.imfRequiredBody,
    },
  };
  const copy = statusCopy[status] || {
    subject: T.transferStatus.genericSubject,
    headline: T.transferStatus.genericHeadline,
    body: fill(T.transferStatus.genericBody, { status }),
  };
  const badge = statusBadge(status, lang);
  const res = await sendEmail(to, copy.subject, emailShell(copy.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${copy.body}</p>
    ${customMessageBlock(details.customMessage, lang)}
    ${transactionSummary({ ...details, status: details.status || status })}
    ${ctaButtons(lang)}
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">${T.common.unauthorized}</p>
  `, { badge, lang }), "transactions@crestorabank.com");
  return res.success;
}

/** Email sent when a customer's VAT or IMF code has been verified successfully. */
export async function sendCodeVerifiedEmail(
  to: string,
  firstName: string,
  codeType: "VAT" | "IMF",
  details: TransactionEmailData
): Promise<boolean> {
  const lang = details.lang;
  const T = getStrings(lang);
  const badge = statusBadge("processing", lang);
  const res = await sendEmail(to, T.transferStatus.codeVerifiedSubject, emailShell(T.transferStatus.codeVerifiedHeadline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${fill(T.transferStatus.codeVerifiedBody, { codeType })}</p>
    ${transactionSummary({ ...details, status: "processing" })}
    ${ctaButtons(lang)}
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">${T.common.unauthorized}</p>
  `, { badge, lang }), "transactions@crestorabank.com");
  return res.success;
}

/**
 * Detailed "Transfer On Hold" email from the International Transfer Review Team (ITRT).
 */
export async function sendTransferOnHoldEmail(
  to: string,
  details: TransactionEmailData,
  review?: HoldReviewInfo
): Promise<boolean> {
  const lang = details.lang;
  const T = getStrings(lang);
  const reviewRows =
    detailRow(T.labels.reviewStatus, T.status.inProgressUnderReview, { bold: true }) +
    (review?.reviewCaseId ? detailRow(T.labels.reviewCaseId, review.reviewCaseId, { mono: true, bold: true }) : "") +
    (review?.holdReason ? detailRow(T.labels.holdReason, review.holdReason) : "") +
    (review?.estimatedReviewTime ? detailRow(T.labels.estReviewTime, review.estimatedReviewTime) : "") +
    (details.reference ? detailRow(T.labels.transactionReference, details.reference, { mono: true }) : "");

  const actionSection = review?.actionRequired ? `
    <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:18px 20px; margin:20px 0;">
      <p style="margin:0 0 10px 0; color:#9a3412; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${T.onHold.whatYouNeedToDo}</p>
      <ol style="margin:0; padding-left:18px; color:#431407; font-size:14px; line-height:1.9;">
        <li>${T.onHold.step1}</li>
        <li>${T.onHold.step2}</li>
        <li>${T.onHold.step3}</li>
        <li>${T.onHold.step4}</li>
      </ol>
    </div>` : "";

  const body = `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: details.customerName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0 0 16px 0;">
      ${T.onHold.intro}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px 0;">
      <tr>
        <td style="vertical-align:middle; padding-right:10px;">
          <img src="${ITRT_LOGO_URL}" alt="ITRT emblem" width="42" height="42" style="display:block; border-radius:8px;" />
        </td>
        <td style="vertical-align:middle;">
          <p style="margin:0; color:#1e3a8a; font-size:14px; font-weight:700;">${T.onHold.teamName}</p>
          <p style="margin:2px 0 0 0; color:#64748b; font-size:12px;">${T.onHold.teamDivision}</p>
        </td>
      </tr>
    </table>
    ${detailsTable(T.labels.reviewDetails, reviewRows)}
    ${customMessageBlock(details.customMessage, lang)}
    ${transactionSummary(details)}
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:18px 20px; margin:20px 0;">
      <p style="margin:0 0 10px 0; color:#1e40af; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${T.onHold.whatHappensNext}</p>
      <p style="margin:0; color:#1e3a8a; font-size:14px; line-height:1.7;">
        ${T.onHold.whatHappensNextBody}
      </p>
    </div>
    ${actionSection}
    ${ctaButtons(lang)}
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">
      ${T.common.unauthorized}
    </p>
  `;
  const res = await sendEmail(
    to,
    T.onHold.subject,
    emailShell(T.onHold.headline, body, { badge: statusBadge("on-hold", lang), lang }),
    "transactions@crestorabank.com"
  );
  return res.success;
}

/** Deposit received email */
export async function sendDepositEmail(to: string, firstName: string, details: TransactionEmailData): Promise<boolean> {
  const lang = details.lang;
  const T = getStrings(lang);
  const res = await sendEmail(to, T.deposit.subject, emailShell(T.deposit.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${T.deposit.body}</p>
    ${transactionSummary({ ...details, transactionType: details.transactionType || T.txTypes.deposit, status: details.status || "completed" })}
    ${ctaButtons(lang)}
  `, { badge: statusBadge("completed", lang), lang }), "transactions@crestorabank.com");
  return res.success;
}

/** Withdrawal completed email */
export async function sendWithdrawalEmail(to: string, firstName: string, details: TransactionEmailData): Promise<boolean> {
  const lang = details.lang;
  const T = getStrings(lang);
  const res = await sendEmail(to, T.withdrawal.subject, emailShell(T.withdrawal.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${T.withdrawal.body}</p>
    ${transactionSummary({ ...details, transactionType: details.transactionType || T.txTypes.withdrawal, status: details.status || "completed" })}
    ${ctaButtons(lang)}
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">${T.common.unauthorized}</p>
  `, { badge: statusBadge("completed", lang), lang }), "transactions@crestorabank.com");
  return res.success;
}

/** Sent when a registration is submitted for approval */
export async function sendRegistrationReceivedEmail(to: string, firstName: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, T.registration.receivedSubject, emailShell(T.registration.receivedHeadline, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color: #374151; font-size: 16px;">${T.registration.receivedBody1}</p>
    <p style="color: #374151; font-size: 16px;">${T.registration.receivedBody2}</p>
  `, { lang }));
  return res.success;
}

/** Sent when admin approves an account */
export async function sendApprovalEmail(to: string, firstName: string, accountNumber: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, T.registration.approvedSubject, emailShell(T.registration.approvedHeadline, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color: #374151; font-size: 16px;">${T.registration.approvedBody}</p>
    <div style="background: white; border: 2px solid #1d4ed8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px 0;">${T.registration.approvedAccountLabel}</p>
      <p style="font-size: 24px; font-weight: bold; color: #1d4ed8; margin: 0; letter-spacing: 2px;">${accountNumber}</p>
    </div>
    <p style="color: #374151; font-size: 16px;">${T.registration.approvedFooter}</p>
  `, { lang }));
  return res.success;
}

/** Sent when a user signs in (new device notification) */
export async function sendLoginNotificationEmail(to: string, firstName: string, timeStr: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, T.login.subject, emailShell(T.login.headline, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color: #374151; font-size: 16px;">${T.login.body}</p>
    <div style="background: white; border-left: 4px solid #1d4ed8; padding: 15px; margin: 20px 0;">
      <p style="color: #374151; margin: 0;"><strong>${T.labels.time}:</strong> ${timeStr}</p>
      <p style="color: #374151; margin: 6px 0 0 0;"><strong>${T.labels.device}:</strong> ${T.labels.webBrowser}</p>
    </div>
    <p style="color: #6b7280; font-size: 14px;">${T.login.noAction}</p>
  `, { lang }), "security@crestorabank.com");
  return res.success;
}

/** Sent when a transfer is submitted */
export async function sendTransferPendingEmail(to: string, data: TransactionEmailData): Promise<boolean> {
  const lang = data.lang;
  const T = getStrings(lang);
  const typeLabel = data.transferType === "international" ? T.txTypes.internationalTransfer : T.txTypes.transfer;
  const res = await sendEmail(to, T.transferPending.subject, emailShell(T.transferPending.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name: data.customerName })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${T.transferPending.body}</p>
    ${transactionSummary({ ...data, transactionType: data.transactionType || typeLabel, status: data.status || "pending" })}
    ${ctaButtons(lang)}
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">
      ${T.transferPending.stagesNote}
    </p>
  `, { badge: statusBadge("pending", lang), lang }), "transactions@crestorabank.com");
  return res.success;
}

/** Sent when a card request is approved and generated */
export async function sendCardApprovedEmail(to: string, firstName: string, cardType: string, last4: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, fill(T.card.subject, { cardType }), emailShell(T.card.headline, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color: #374151; font-size: 16px;">${fill(T.card.body, { cardType })}</p>
    <div style="background: white; border: 2px solid #1d4ed8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 6px 0;">${T.labels.cardEndingIn}</p>
      <p style="font-size: 24px; font-weight: bold; color: #1d4ed8; margin: 0; letter-spacing: 2px;">•••• ${last4}</p>
    </div>
    <p style="color: #374151; font-size: 16px;">${T.card.footer}</p>
    ${ctaButtons(lang)}
  `, { lang }));
  return res.success;
}

/** Sent when KYC status changes */
export async function sendKycStatusEmail(to: string, firstName: string, status: "approved" | "rejected", reason?: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const isApproved = status === "approved";
  const headline = isApproved ? T.kyc.approvedHeadline : T.kyc.rejectedHeadline;
  const subject = isApproved ? T.kyc.approvedSubject : T.kyc.rejectedSubject;
  const body = isApproved
    ? `<p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
       <p style="color: #374151; font-size: 16px;">${T.kyc.approvedBody}</p>`
    : `<p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
       <p style="color: #374151; font-size: 16px;">${T.kyc.rejectedBody}</p>
       ${reason ? `<div style="background: #fee2e2; border-left: 4px solid #991b1b; padding: 15px; margin: 20px 0;"><p style="color: #991b1b; margin: 0;"><strong>${T.labels.reason}:</strong> ${reason}</p></div>` : ""}
       <p style="color: #374151; font-size: 16px;">${T.kyc.rejectedFooter}</p>`;
       
  const res = await sendEmail(to, subject, emailShell(headline, body + ctaButtons(lang), { badge: statusBadge(isApproved ? "approved" : "failed", lang), lang }), "security@crestorabank.com");
  return res.success;
}

/** Sent when security settings (password, PIN, 2FA) are changed */
export async function sendSecurityChangeEmail(to: string, firstName: string, changeType: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, fill(T.security.subject, { changeType }), emailShell(T.security.headline, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <p style="color: #374151; font-size: 16px;">${fill(T.security.body, { changeType })}</p>
    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">${T.security.footer}</p>
    ${ctaButtons(lang)}
  `, { lang }), "security@crestorabank.com");
  return res.success;
}

export async function sendOTPEmail(to: string, otp: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  return sendOTPStyledEmail(to, otp, T.otp.subject, T.otp.intro, lang);
}

/** Password reset OTP email used by the forgot-password flow. */
export async function sendPasswordResetEmail(to: string, firstName: string, otp: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  return sendOTPStyledEmail(
    to,
    otp,
    T.passwordReset.subject,
    fill(T.passwordReset.intro, { name: firstName }),
    lang
  );
}

async function sendOTPStyledEmail(to: string, otp: string, subject: string, intro: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const dir = isRTL(lang) ? ' dir="rtl"' : "";
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[OTP] RESEND_API_KEY not configured");
      return false;
    }
    if ((process.env.VITEST || isDryRunRecipient(to)) && !process.env.EMAIL_TEST_CAPTURE) {
      console.log(`[OTP] (test mode) skipped real send to ${to}`);
      return true;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@crestorabank.com",
        to: to,
        subject: subject,
        html: `
          <div${dir} style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Crestora Bank</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${T.otp.secureVerification}</p>
            </div>
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                ${T.common.hello}
              </p>
              <p style="color: #374151; font-size: 16px; margin: 0 0 30px 0;">
                ${intro}
              </p>
              <div style="background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 4px;">
                  ${otp}
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
                ${T.otp.expiry}
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                ${T.otp.ignore}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 1994-2026 Crestora Bank. ${T.common.footerRights}<br/>
                120 Wall Street, New York, NY 10005, United States
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[OTP] Resend API error:", error);
      return false;
    }

    const data = await response.json();
    console.log(`[OTP] Email sent successfully to ${to}. Message ID: ${data.id}`);
    
    return true;
  } catch (error) {
    console.error("[OTP] Email service error:", error);
    return false;
  }
}

/**
 * Send support message notification email to admin
 */
export async function sendSupportNotificationEmail(
  adminEmail: string,
  senderName: string,
  senderEmail: string,
  message: string
): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("[SUPPORT] RESEND_API_KEY not configured");
      return false;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "support@crestorabank.com",
        to: adminEmail,
        subject: `New Support Message from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Crestora Bank</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Support Request</p>
            </div>
            <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                You have a new support message from:
              </p>
              <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="color: #374151; margin: 0 0 5px 0;"><strong>Name:</strong> ${senderName}</p>
                <p style="color: #374151; margin: 0;"><strong>Email:</strong> ${senderEmail}</p>
              </div>
              <p style="color: #374151; font-size: 16px; margin: 20px 0 0 0;"><strong>Message:</strong></p>
              <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p style="color: #374151; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
                Log in to your admin panel to reply to this message.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[SUPPORT] Resend API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[SUPPORT] Email service error:", error);
    return false;
  }
}

export async function sendDepositReceivedEmail(to: string, name: string, depositId: string, lang?: string | null) {
  const T = getStrings(lang);
  return sendEmail(
    to,
    T.depositRequest.subject,
    emailShell(
      T.depositRequest.headline,
      `
      <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
      <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">
        ${fill(T.depositRequest.body, { depositId })}
      </p>
      <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
        ${T.depositRequest.reviewNote}
      </p>
      <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">
        ${T.depositRequest.thanks}
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
        Crestora Bank<br/>
        120 Wall Street<br/>
        New York, NY 10005, United States
      </p>
      `,
      { lang }
    ),
    "deposits@crestorabank.com"
  );
}

export async function sendAccountFundedEmail(
  to: string,
  name: string,
  amount: string,
  newBalance: string,
  senderName?: string,
  lang?: string | null
): Promise<boolean> {
  const T = getStrings(lang);
  const amt = fmtMoney(amount, "USD", lang);
  const message = senderName
    ? fill(T.accountFunded.bodyWithSender, { amount: amt, sender: senderName })
    : fill(T.accountFunded.bodyNoSender, { amount: amt });
  const res = await sendEmail(to, T.accountFunded.subject, emailShell(T.accountFunded.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${message}</p>
    ${detailsTable(T.labels.transactionDetails, detailRow(T.labels.amount, amt, { bold: true }) + detailRow(T.labels.newBalance, fmtMoney(newBalance, "USD", lang), { bold: true }))}
    ${ctaButtons(lang)}
  `, { lang }), "accounts@crestorabank.com");
  return res.success;
}

/** Localized email to a customer when Support replies to their message. */
export async function sendSupportReplyEmail(to: string, name: string, message: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const safe = String(message)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  const res = await sendEmail(to, T.supportReply.subject, emailShell(T.supportReply.headline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${T.supportReply.intro}</p>
    <div style="background:#f8fafc; border-left:4px solid #1d4ed8; border-radius:0 10px 10px 0; padding:18px 20px; margin:20px 0;">
      <p style="margin:0; color:#0f172a; font-size:14px; line-height:1.8;">${safe}</p>
    </div>
    <p style="color:#64748b; font-size:13px; line-height:1.6; margin:16px 0 0 0;">${T.supportReply.footer}</p>
    ${ctaButtons(lang)}
  `, { lang }), "support@crestorabank.com");
  return res.success;
}

// ---------------------------------------------------------------------------
// Loan application emails
// ---------------------------------------------------------------------------

export interface LoanEmailData {
  reference: string;
  category: string; // 'personal' | 'employment'
  employer?: string | null;
  workEmail?: string | null;
  amount: string;
  currency?: string;
  purpose: string;
  termMonths: number;
  interestRate: string;
  monthlyPayment: string;
  adminMessage?: string | null;
  /** Only for approval emails: new balance after the loan credit */
  newBalance?: string;
  lang?: string | null;
}

function loanSummaryTable(d: LoanEmailData): string {
  const lang = d.lang;
  const T = getStrings(lang);
  const L = T.loan.labels;
  const currency = d.currency || "USD";
  const categoryLabel = d.category === "employment" ? L.employment : L.personal;
  const rows =
    detailRow(L.loanReference, d.reference, { mono: true, bold: true }) +
    detailRow(L.category, categoryLabel) +
    (d.category === "employment" && d.employer ? detailRow(L.employer, d.employer) : "") +
    (d.category === "employment" && d.workEmail ? detailRow(L.workEmail, d.workEmail) : "") +
    detailRow(L.loanAmount, fmtMoney(d.amount, currency, lang), { bold: true }) +
    detailRow(L.purpose, d.purpose) +
    detailRow(L.term, `${d.termMonths} ${L.months}`) +
    detailRow(L.interestRate, `${d.interestRate}%`) +
    detailRow(L.estMonthlyPayment, fmtMoney(d.monthlyPayment, currency, lang)) +
    detailRow(T.labels.dateTime, fmtDateIntl(new Date(), lang));
  return detailsTable(L.loanSummary, rows);
}

function loanAdminMessageBlock(msg?: string | null, lang?: string | null): string {
  if (!msg) return "";
  const T = getStrings(lang);
  const safe = String(msg)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  return `
    <div style="background:#f8fafc; border-left:4px solid #1d4ed8; border-radius:0 10px 10px 0; padding:18px 20px; margin:20px 0;">
      <p style="margin:0 0 8px 0; color:#1e40af; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">${T.loan.labels.adminMessage}</p>
      <p style="margin:0; color:#0f172a; font-size:14px; line-height:1.8;">${safe}</p>
    </div>`;
}

/** Sent immediately after a customer submits a loan application. */
export async function sendLoanReceivedEmail(to: string, name: string, d: LoanEmailData): Promise<boolean> {
  const T = getStrings(d.lang);
  const badge = statusBadge("pending", d.lang);
  const res = await sendEmail(to, T.loan.receivedSubject, emailShell(T.loan.receivedHeadline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${fill(T.loan.receivedBody, { reference: d.reference })}</p>
    ${loanSummaryTable(d)}
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${T.loan.receivedReviewNote}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${T.loan.thanks}</p>
    ${ctaButtons(d.lang)}
  `, { badge, lang: d.lang }), "loans@crestorabank.com");
  return res.success;
}

/** Sent when the admin approves a loan; the amount is credited to the account. */
export async function sendLoanApprovedEmail(to: string, name: string, d: LoanEmailData): Promise<boolean> {
  const T = getStrings(d.lang);
  const lang = d.lang;
  const currency = d.currency || "USD";
  const badge = statusBadge("completed", lang);
  const credited = d.newBalance != null && d.newBalance !== ""
    ? `<p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${fill(T.loan.approvedCredited, { amount: fmtMoney(d.amount, currency, lang), balance: fmtMoney(d.newBalance, currency, lang) })}</p>`
    : "";
  const res = await sendEmail(to, T.loan.approvedSubject, emailShell(T.loan.approvedHeadline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${fill(T.loan.approvedBody, { reference: d.reference })}</p>
    ${credited}
    ${loanSummaryTable(d)}
    ${loanAdminMessageBlock(d.adminMessage, lang)}
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${T.loan.thanks}</p>
    ${ctaButtons(lang)}
  `, { badge, lang }), "loans@crestorabank.com");
  return res.success;
}

/** Sent when the admin declines a loan application. */
export async function sendLoanDeclinedEmail(to: string, name: string, d: LoanEmailData): Promise<boolean> {
  const T = getStrings(d.lang);
  const lang = d.lang;
  const badge = statusBadge("failed", lang);
  const res = await sendEmail(to, T.loan.declinedSubject, emailShell(T.loan.declinedHeadline, `
    <p style="color:#0f172a; font-size:15px; margin:0 0 8px 0;">${fill(T.common.dear, { name })}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:0;">${fill(T.loan.declinedBody, { reference: d.reference })}</p>
    ${loanSummaryTable(d)}
    ${loanAdminMessageBlock(d.adminMessage, lang)}
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${T.loan.declinedContact}</p>
    <p style="color:#334155; font-size:14px; line-height:1.7; margin:16px 0 0 0;">${T.loan.thanks}</p>
    ${ctaButtons(lang)}
  `, { badge, lang }), "loans@crestorabank.com");
  return res.success;
}

/** Generic account notification email (e.g. account frozen / deactivated / reactivated) */
export async function sendGenericNotificationEmail(to: string, firstName: string, title: string, message: string, lang?: string | null): Promise<boolean> {
  const T = getStrings(lang);
  const res = await sendEmail(to, `${title} — Crestora Bank`, emailShell(title, `
    <p style="color: #374151; font-size: 16px;">${fill(T.common.dear, { name: firstName })}</p>
    <div style="background: white; border-left: 4px solid #1d4ed8; padding: 15px; margin: 20px 0;">
      <p style="color: #374151; margin: 0;">${message}</p>
    </div>
    <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact our support team.</p>
  `, { lang }), "security@crestorabank.com");
  return res.success;
}
