# Finora Frontend

Clean full-integration frontend for Finora.

## Run locally

```bash
npm install
npm run dev
```

Vite is intentionally locked to `http://localhost:5173` because the local Flask CORS configuration expects that origin.

Backend API defaults to:

```text
http://127.0.0.1:5000/api
```

## Included

- Register / login
- JWT protected routes
- Logout
- Dashboard using live backend data
- Accounts
- Transactions and transfers
- Budgets
- Savings goals and contributions
- Bills and subscriptions
- Analytics
- Notifications
- Profile/settings
- Responsive desktop/mobile UI

## Cleanup performed

- Removed obsolete mock data and the old mock `TransactionList` component.
- Normalized style names used by the full-integration components.
- Repaired Analytics and currency utility files.
- Enabled Vite `strictPort` on 5173 to prevent CORS port drift.
