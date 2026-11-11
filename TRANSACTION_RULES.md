# Transaction and Banking Rules Handoff

This document describes the behavior present in the `ebde8481` source export. It is a code-navigation guide, not a substitute for legal, compliance, fraud-prevention, or payment-provider requirements.

## Customer registration and access

1. A customer begins with `registration.startRegistration`.
2. Contact information, nationality, date of birth, and address are saved through `registration.submitContactDetails`.
3. An OTP is generated and verified through `registration.verifyOTP`; resend behavior is in `registration.resendOTP`.
4. Password creation is completed through `registration.completeRegistration`.
5. Login is handled by `login.authenticate`; only approved registrations can create a customer session.
6. Frozen or inactive registrations are blocked from access according to the server rules.

## Transfer flow

The transfer procedures validate the authenticated customer session, transfer PIN, account status, KYC status, available balance, transfer type, currency, and recipient details before recording a transaction. International or cross-currency transfers request a quote from `server/currencyService.ts`; the resulting exchange-rate and fee details are stored with the transaction when applicable.

Transaction records include a generated reference, amount, currency, recipient fields, transfer method, status, and balance-after value. Email and in-app notifications are sent asynchronously where configured.

## Transaction status catalog

The database status enum in `drizzle/schema.ts` includes:

- `processing`
- `pending_vat`
- `pending_imf`
- `pending`
- `approved`
- `completed`
- `failed`
- `on-hold`
- `reversed`

The administrative UI in `client/src/pages/AdminDashboard.tsx` contains display and update paths for these states. Before rebuilding or exposing any status transition, review the corresponding server procedure and test coverage together.

### Safety and compliance note

Statuses such as `pending_vat` and `pending_imf` are legacy application states in this export. They must not be used to pressure a customer to pay an advance fee, purchase a code, or send money to release an incoming salary or transfer. Any future implementation should use transparent, legally reviewed tax/compliance handling and an independent payment provider—not an administrator-controlled release gate.

## Deposits

Deposit requests are represented in `depositRequests` and use statuses such as awaiting payment, pending review, information requested, approved, and rejected. Review the deposit procedures in `server/routers.ts` and the admin handlers before changing approval behavior.

## Cards

Card records are stored in `cards`. The customer-facing card procedures support requests and card state changes; administrative controls can review and update card status. Card deactivation/freeze behavior should remain server-authorized and auditable.

## Loans

Loan applications are stored in `loanApplications`. Customers submit applications through the `loans` namespace; administrators can approve or decline them. Approval and decline notifications are generated through the email service. Preserve the application status, APR/interest inputs, amount, currency, and notification behavior when rebuilding.

## KYC and documents

KYC status and document metadata are stored in `kycDocuments` and related registration fields. Uploaded document bytes should go through `server/storage.ts`; do not store file bytes in database columns.

## Admin controls

Administrative features include customer registration review, account status updates, funding actions, transaction review/status actions, card review, deposit review, loan decisions, KYC review, support/email tooling, invoice operations, and customer impersonation paths. All admin actions must remain protected by server-side role checks; hiding a button in the frontend is not authorization.

## Audit requirements for future changes

For every transaction-rule change:

1. Identify the tRPC or HTTP procedure.
2. Identify the database tables and status transitions.
3. Identify customer and admin UI callers.
4. Identify notification/email side effects.
5. Add or update tests.
6. Run `pnpm check` and `pnpm test`.
7. Review the change for data integrity, authorization, and consumer-protection risk.
