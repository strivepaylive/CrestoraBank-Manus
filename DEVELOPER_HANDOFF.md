# Developer and AI Handoff Guide

## What this repository is

This is the Crestora Bank source export from Manus checkpoint `ebde8481`. It is intended to let a developer or coding agent understand the existing application architecture and continue work without guessing where the business logic lives.

## First-run sequence

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

Configure deployment secrets before expecting database-backed features or real email/storage behavior. The repository intentionally does not contain production secrets, customer data, database dumps, or external account credentials.

## Reading order for a new developer or AI agent

1. Read `README.md`.
2. Read `ARCHITECTURE.md`.
3. Read `API_SERVICES.md` and configure only the services needed for the target environment.
4. Read `drizzle/schema.ts` and the migration files.
5. Read `server/_core/context.ts`, `server/_core/trpc.ts`, `server/db.ts`, and `server/routers.ts`.
6. Read the relevant page in `client/src/pages/` and its tRPC calls.
7. Read the matching tests in `server/*.test.ts` before changing behavior.
8. Read `TRANSACTION_RULES.md` before touching transaction statuses, balances, approvals, fees, KYC, or admin actions.

## Change protocol

- Preserve server-side authorization.
- Keep tRPC input schemas and frontend calls synchronized.
- Use database migrations for schema changes; do not silently edit production tables.
- Keep external API calls server-side when they use secrets.
- Add tests for every new status, validation branch, and notification side effect.
- Do not copy credentials from another environment.
- Do not treat sample data as production data.
- Run typecheck and the full test suite before committing.

## Integration labels used in this repository

Search for these labels when planning deployment:

- `DATABASE_API_REQUIRED`
- `SESSION_SECRET_REQUIRED`
- `OAUTH_SERVICE_REQUIRED`
- `EMAIL_API_REQUIRED`
- `OBJECT_STORAGE_SERVICE_REQUIRED`
- `FX_API_OPTIONAL_PUBLIC`
- `BUILT_IN_MAP_SERVICE`
- `BUILT_IN_AI_SERVICE_OPTIONAL`
- `SMTP_API_OPTIONAL`

## What is not in GitHub

- Database rows and customer records
- Password hashes from the live environment
- Session cookies and signing secrets
- Resend, SMTP, storage, OAuth, or Manus API keys
- Domain/DNS configuration
- External webhook registrations
- Uploaded private documents and private storage objects

## Rebuild warning

A source export can reproduce the application structure, but it cannot recreate a production environment by itself. A new deployment needs a new database, new secrets, carefully reviewed migrations, configured integrations, and a controlled data-import plan if data migration is authorized.
