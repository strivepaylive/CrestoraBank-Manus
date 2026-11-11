# Crestora Bank — Manus Export

This repository is an export of the Crestora Bank application from the restored `ebde8481` checkpoint.

It contains the application source, server procedures, database schema and migrations, frontend pages, authentication flow, transaction handlers, admin interfaces, PDF/invoice source, tests, and dependency lockfiles.

## Important setup notes

Secrets and environment-specific configuration are intentionally not included. Before running the application, configure the required environment variables for the database, session signing, OAuth, email, storage, and other integrations in the deployment environment.

This repository is a source-code export. Live database records, customer data, balances, transactions, external service accounts, domain configuration, and credentials remain outside the repository.
