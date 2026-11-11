# API and Service Inventory

This file is the handoff map for a developer or AI agent. It identifies where each service is used, whether an API/credential is required, and the source files to inspect.

## Legend

- **Built-in / injected:** supplied by the Manus/WebDev runtime; do not hard-code credentials.
- **Credential required:** configure the named environment variable in the deployment secret manager.
- **Public provider:** the source calls a public endpoint; review availability, rate limits, licensing, and production suitability before relying on it.
- **Optional:** only needed if the related feature is enabled.

## Required or core services

| Service | Label | Configuration | Source locations | Purpose |
|---|---|---|---|---|
| MySQL/TiDB | `DATABASE_API_REQUIRED` | `DATABASE_URL` | `server/db.ts`, `drizzle.config.ts` | Users, registrations, transactions, cards, loans, deposits, invoices, logs |
| Session signing | `SESSION_SECRET_REQUIRED` | `JWT_SECRET` | `server/_core/env.ts`, `server/_core/cookies.ts`, `server/_core/sdk.ts` | Session and cookie security |
| Manus OAuth | `OAUTH_SERVICE_REQUIRED` | `VITE_APP_ID`, `OAUTH_SERVER_URL`, related OAuth environment values | `server/_core/oauth.ts`, `references/manus-oauth.md` | OAuth callback and platform authentication support |
| Resend email | `EMAIL_API_REQUIRED` | `RESEND_API_KEY` | `server/emailService.ts`, `server/invoiceEmail.ts`, `server/routers.ts` | OTP, login alerts, support notices, transfer/deposit/loan messages, invoice email |
| Object storage | `OBJECT_STORAGE_SERVICE_REQUIRED` | `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | `server/storage.ts`, `server/_core/storageProxy.ts` | KYC documents, avatars, generated PDFs, uploaded assets |

## Optional or feature-specific services

| Service | Label | Configuration | Source locations | Purpose |
|---|---|---|---|---|
| Exchange-rate providers | `FX_API_OPTIONAL_PUBLIC` | No key in current implementation | `server/currencyService.ts` | International-transfer quotes with fallback behavior |
| PDFKit | `LOCAL_LIBRARY_NO_API` | None | `server/invoicePdf.ts`, `server/cashappInvoicePdf.ts` | PDF invoice generation |
| QR code / barcode libraries | `LOCAL_LIBRARY_NO_API` | None | `server/invoicePdf.ts`, `server/cashappInvoicePdf.ts`, `package.json` | Invoice visual elements |
| Google Maps proxy | `BUILT_IN_MAP_SERVICE` | Frontend Forge values supplied by runtime | `client/src/components/Map.tsx`, `references/maps-integration.md` | Map/geocoding UI if used |
| Built-in LLM/Forge APIs | `BUILT_IN_AI_SERVICE_OPTIONAL` | `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | `server/_core/llm.ts`, `references/llm-integration.md` | AI features if enabled |
| Nodemailer / SMTP | `SMTP_API_OPTIONAL` | Provider-specific SMTP variables are not committed | `server/emailServiceNodemailer.ts` | Alternative email transport; inspect before enabling |
| SendGrid package | `SENDGRID_API_OPTIONAL` | Provider-specific key not committed | `package.json` | Dependency available for future email integration; not a substitute for configuring the active email path |

## Configuration reference

The runtime maps these values in `server/_core/env.ts`:

- `VITE_APP_ID`
- `JWT_SECRET`
- `DATABASE_URL`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `RESEND_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

Set secrets through the hosting provider’s secret manager. Do not create a committed `.env` file containing real values.

## API boundary notes

- Browser-to-backend feature calls use tRPC under `/api/trpc`.
- OAuth uses the server callback route documented in `references/manus-oauth.md`.
- Password reset uses the HTTP routes implemented in `server/_core/index.ts` and tested in `server/passwordReset.test.ts`.
- Generated documents are uploaded through the storage helper rather than stored as database blobs.
- Scheduled callbacks, if enabled later, must use `/api/scheduled/<name>` and the authentication pattern documented in `references/periodic-updates.md`.

## External-service handoff checklist

Before production use, a new developer should confirm:

- The database URL points to the intended environment.
- Session signing secrets are new and private for the deployment.
- OAuth callback URLs match the deployed hostname.
- Resend domain/sender verification is complete and `RESEND_API_KEY` is configured.
- Storage credentials and bucket/proxy behavior are working.
- Public FX providers have acceptable availability and legal/commercial terms.
- No test inbox, sample recipient, or development sender is enabled in production.
