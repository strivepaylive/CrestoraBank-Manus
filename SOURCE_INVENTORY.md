# Source Inventory

| Area | Primary files |
|---|---|
| Frontend routing | `client/src/App.tsx` |
| Customer dashboard | `client/src/pages/Dashboard.tsx` |
| Admin dashboard | `client/src/pages/AdminDashboard.tsx`, `client/src/pages/AdminPanel.tsx` |
| Registration | `client/src/pages/Register.tsx`, `server/routers.ts` registration namespace |
| Login/session | `client/src/pages/Login.tsx`, `server/routers.ts` login namespace, `server/_core/context.ts` |
| Password reset | `client/src/pages/ForgotPassword.tsx`, `server/_core/index.ts`, `server/passwordReset.test.ts` |
| Transfers | `client/src/pages/Transfer.tsx`, `server/routers.ts`, `server/currencyService.ts` |
| Deposits | `client/src/pages/Deposit.tsx`, `server/routers.ts`, `drizzle/schema.ts` |
| Cards | `client/src/pages/MyCards.tsx`, `client/src/pages/CreditCard.tsx`, `server/routers.ts` cards namespace |
| Loans | `client/src/pages/MyLoans.tsx`, `server/routers.ts` loans namespace |
| KYC | `client/src/pages/Settings.tsx`, `server/routers.ts` kyc namespace, `drizzle/schema.ts` |
| Statements/history | `client/src/pages/Statements.tsx`, `client/src/pages/TransactionHistory.tsx` |
| Support/chat | `client/src/pages/Support.tsx`, `client/src/components/AIChatBox.tsx`, `server/routers.ts` support/chat namespaces |
| Invoices | `server/routers/invoices.ts`, `server/invoicePdf.ts`, `server/cashappInvoicePdf.ts`, `server/invoiceEmail.ts` |
| Email | `server/emailService.ts`, `server/emailI18n.ts`, `server/emailTemplates.ts` |
| Storage | `server/storage.ts`, `server/_core/storageProxy.ts` |
| Database schema | `drizzle/schema.ts`, `drizzle/relations.ts`, `drizzle/*.sql` |
| Tests | `server/*.test.ts` |
| Configuration | `server/_core/env.ts`, `package.json`, `vite.config.ts`, `drizzle.config.ts` |
