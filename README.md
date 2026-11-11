# Crestora Bank — Manus Export

This repository is an export of the Crestora Bank application from the restored `ebde8481` checkpoint.

It contains the application source, server procedures, database schema and migrations, frontend pages, authentication flow, transaction handlers, admin interfaces, PDF/invoice source, tests, and dependency lockfiles.

## Important setup notes

Secrets and environment-specific configuration are intentionally not included. Before running the application, configure the required environment variables for the database, session signing, OAuth, email, storage, and other integrations in the deployment environment.

This repository is a source-code export. Live database records, customer data, balances, transactions, external service accounts, domain configuration, and credentials remain outside the repository.

## Handoff documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — runtime layers, entrypoints, data model, and invariants.
- [`API_SERVICES.md`](API_SERVICES.md) — API/service inventory with labels showing where credentials or configuration are required.
- [`TRANSACTION_RULES.md`](TRANSACTION_RULES.md) — transaction lifecycle, status catalog, admin controls, and safety notes.
- [`DEVELOPER_HANDOFF.md`](DEVELOPER_HANDOFF.md) — setup sequence and instructions for another developer or AI agent.
- [`SOURCE_INVENTORY.md`](SOURCE_INVENTORY.md) — feature-to-file map.
