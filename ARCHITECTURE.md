# Crestora Bank Architecture Handoff

This repository is a source export of the Crestora Bank application from Manus checkpoint `ebde8481`. It is a React/TypeScript frontend with a Node.js/Express backend, tRPC procedures, Drizzle ORM, and MySQL/TiDB persistence.

## Runtime layers

- **Frontend:** `client/` contains React pages, reusable components, route wiring, styles, authentication hooks, and tRPC client bindings.
- **Backend:** `server/` contains the Express entrypoint, tRPC router, database helpers, authentication/session logic, email services, storage helpers, PDF generation, currency conversion, and feature services.
- **Database:** `drizzle/schema.ts` defines the MySQL/TiDB tables; `drizzle/*.sql` contains generated migrations.
- **Shared contracts:** `shared/` contains shared constants and types used by both sides.
- **Storage:** `server/storage.ts` uploads files through the configured storage/Forge presigning service. Stored file references use the `/manus-storage/` path.
- **Tests:** `server/*.test.ts` covers registration, login, sessions, transfers, deposits, cards, loans, invoices, email, currency conversion, and administrative behavior.

## Main backend entrypoints

- `server/_core/index.ts` — Express server, API mounting, static/Vite handling, OAuth callback, password-reset HTTP endpoints, and infrastructure routes.
- `server/routers.ts` — primary tRPC application router.
- `server/db.ts` — database connection and query helpers.
- `server/_core/context.ts` — request context and current-user resolution.
- `server/_core/trpc.ts` — public/protected procedure setup.
- `server/_core/env.ts` — environment-variable mapping.
- `server/emailService.ts` — Resend-backed notification and transactional email functions.
- `server/currencyService.ts` — exchange-rate lookup, supported currencies, and transfer quote calculation.
- `server/storage.ts` — file upload and storage references.

## Primary tRPC namespaces

The exported router currently includes `auth`, `registration`, `admin`, `chat`, `notifications`, `login`, `account`, `verification`, `cards`, `kyc`, `security`, `deposit`, `support`, and `loans`. Invoice procedures are mounted through `server/routers/invoices.ts`.

## Data model

The principal tables are `users`, `registrations`, `otpVerifications`, `chatMessages`, `notifications`, `adminSettings`, `supportMessages`, `transactions`, `userNotifications`, `emailLogs`, `cards`, `loginSessions`, `depositRequests`, `kycDocuments`, `loanApplications`, and `invoices`.

The `registrations` record is the primary bank-customer record. Customer sessions use the `reg_<registrationId>` open-ID convention. `transactions` stores the amount, currency, recipient details, reference, status, transfer method, balance-after value, and optional currency-conversion details.

## Important invariants

1. Do not bypass `protectedProcedure` or `adminProcedure` for customer or administrative operations.
2. Do not trust client-provided registration IDs, account IDs, roles, balances, or status values; resolve them from the authenticated server context.
3. Store timestamps in UTC-compatible database fields and format them only at the UI boundary.
4. Never commit environment files, API keys, database URLs, session secrets, private storage credentials, or customer data.
5. Preserve transaction references and status history when extending transaction workflows.
6. Run `pnpm check` and `pnpm test` before deployment.

## Build commands

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm start
```

Database migrations are generated/applied with the project script:

```bash
pnpm db:push
```

Review generated SQL before applying it to a production database.
