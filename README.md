# Delivery App V4.0 — Unified with Admin Panel Database

Delivery-man mobile app (Expo + React Native + TypeScript + Supabase).

## ⚡ What's New in This Update

The app now uses the **SAME Supabase database** as the admin panel and customer app. Previously it had its own private schema with a `vendors` table; now it uses the admin's `delivery_men` table and reads orders via the admin's `orders` + `order_details` tables.

### Key Changes
- **Auth**: login is now email-based (was phone-based), matching the admin panel's `auth.users` table. Phone-based login still works by looking up the email from the `delivery_men` table.
- **Profile**: stored in `delivery_men` (was `vendors`). The `VendorProfile` type is preserved for backward-compat with screens, with values mapped from `delivery_men` columns.
- **Orders**: filtered by `delivery_man_id` (was `vendor_id`). Joined with `order_details` (was `order_items`) and `stores`.
- **Withdrawals**: written to the admin's `withdraw_requests` table with `delivery_man_id` + `type='delivery_man'`.
- **Loyalty / Wallet**: written to admin's `loyalty_point_transactions` + `wallet_transactions` tables.
- **Signup**: creates a `user_profiles` row with `role='delivery-man'` (the auth trigger auto-creates one with `role='customer'`, which we explicitly update).

### Demo Login (after running `admin_panel/supabase/bootstrap_combined.sql`)
```
Email:    delivery@demo.com
Password: Delivery@1234
```
This delivery man has 2 demo orders assigned (1 delivered + 1 picked_up in-progress).

---

## 🚀 Setup

1. **Run the unified SQL bootstrap first** — see `admin_panel/README.md`:
   - Create a Supabase project at https://supabase.com
   - Open Supabase SQL Editor → New query
   - Paste `admin_panel/supabase/bootstrap_combined.sql` and Run
   - This creates the demo delivery-man (`delivery@demo.com / Delivery@1234`) and 3 demo orders (one of which is assigned to them with `dm_tips=$2.00`)

2. **Set Supabase env vars in this app**:
   - Edit `app.json` → set `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey` to the SAME values as the admin's `.env.local`

3. **Install & run**:
   ```bash
   npm install
   npx expo start
   ```
   Press `i` (iOS), `a` (Android), or `w` (web). Log in with `delivery@demo.com / Delivery@1234`.

---

## 🗄️ Database Tables Used (with RLS)

| Table | Access | RLS Filter |
|---|---|---|
| `auth.users` (built-in) | login via `signInWithPassword({email})` | n/a |
| `user_profiles` | signup updates role to `delivery-man` | own row only |
| `delivery_men` | SELECT own row + UPDATE active status | `email = auth.user.email` |
| `orders` | SELECT + UPDATE (status changes) | `delivery_man_id = current_delivery_man_id()` |
| `order_details` | SELECT (via parent order) | via parent order ownership |
| `stores` | SELECT (read-only) | `status = true` (public) |
| `items` | SELECT (read-only) | `status = true` (public) |
| `users` | SELECT customer info | `is_active = true` |
| `withdraw_requests` | INSERT + SELECT own | `delivery_man_id = current_delivery_man_id()` |
| `wallet_transactions` | INSERT + SELECT own | `user_id = auth.uid()` |
| `loyalty_point_transactions` | INSERT + SELECT own | `user_id = auth.uid()` |

The `current_delivery_man_id()` SQL helper function looks up `delivery_men.id` from the auth user's email — see `admin_panel/supabase/base_schema.sql`.

---

## 📁 File Structure

```
output/
├── app.json               ← set expo.extra.supabaseUrl + supabaseAnonKey
├── supabase/schema.sql    ← pointer (real schema lives in admin_panel/supabase/)
├── src/
│   ├── lib/supabase.ts    ← Supabase client (reads app.json extra)
│   ├── context/AuthContext.tsx  ← delivery_man auth + profile (delivery_men table)
│   ├── services/data.ts        ← orders + profile + transactions (unified DB)
│   ├── services/v40_additions.ts  ← withdraw requests + wallet + loyalty (unified DB)
│   ├── types/index.ts           ← TS interfaces (VendorProfile kept as alias)
│   ├── app/                      ← Expo Router screens (44 screens)
│   └── constants/
├── assets/
└── package.json
```

## 🔒 RLS Notes

- A delivery man can ONLY see orders where `orders.delivery_man_id` matches their `delivery_men.id`.
- A delivery man can UPDATE the `order_status` of those orders (to advance to picked_up / delivered).
- A delivery man can UPDATE their own `delivery_men.active` flag (to go online/offline).
- Withdraw requests and wallet/loyalty transactions are owner-only.

## 📝 Notes

- The legacy "vendor" naming (e.g. `vendorId` parameters, `VendorProfile` type) is kept in the codebase for backward-compatibility with screens — under the hood, these now refer to the delivery_man row.
- Ride-share features (rides, trips, leaderboard, safety_alerts) reference V4.0 tables that don't exist in the unified schema. They will return mock data when Supabase isn't configured, and may throw on real queries. Disable those screens in `AppMode.ride` mode or remove them in a future cleanup.
- The `v40_additions.ts` file's `config`, `delivery_income_statements`, `ride_income_statements`, `wallet_payments` tables are not in the unified schema — those endpoints will fail if Supabase is configured. The screens that call them should fall back to mock data.

## 📦 Related Apps

- `admin_panel/` — Next.js 16 admin panel (manages stores, items, orders, delivery_men)
- `customer_app/customar/` — Expo customer app (places orders)
- `delivery_app/output/` — **this app** — Expo delivery-man app (fulfills orders)
