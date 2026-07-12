# Senthil Aandavar Jewellery+ Dashboard

Personal business dashboard for Pawn Broking + Jewellery Sale. Phase 1 of 5.

## All Phases Complete ✅
- Login (Supabase Auth)
- Customer management (add/edit/delete/search, KYC fields)
- Business Settings (name, GSTIN, address, GST rate, pawn interest rate)
- **Pawn Ledger**: pledge entry with item photo upload, weight, loan amount,
  auto interest calculation, active/redeemed/auctioned status, overdue flagging,
  redemption workflow
- **GST Invoices**: financial-year-wise auto numbering (e.g. `2026-27/001`),
  multi-line items with HSN codes, auto CGST/SGST split, printable invoice view
- **Books**: simplified income/expense ledger, monthly summary, auto-includes
  invoice revenue as income
- **Bank Loans**: multi-bank loan tracking, interest due date tracking,
  overdue/due-soon badges, interest payment recording, payment history
- **Rate Sharing**: daily 22K/24K gold + silver rate entry, rate history,
  one-tap WhatsApp share to a single customer or broadcast to all customers
- Dashboard home with live stats (customers, active pledges, bank interest
  due soon) and today's rate + quick action links

## Running the Phase 5 SQL
After schema.sql, schema_phase2.sql, schema_phase3.sql, schema_phase4.sql,
also run `supabase/schema_phase5.sql` in the Supabase SQL Editor. This adds
the `metal_rates` table.

## Possible future additions (not built)
- KYC document viewer/download in Customers page
- Pledge auction workflow (beyond the overdue flag)
- Export Books to Excel/PDF for accountant handoff
- Bulk customer/pledge import from existing paper notes

## Setup

### 1. Create Supabase project
- Go to https://supabase.com → New Project → pick a name (e.g. `senthil-jewellery`), region **Mumbai/ap-south-1** (closest to TN).
- Once created, go to **Project Settings → API** and copy:
  - Project URL
  - `anon public` key

### 2. Run the schema
- Go to **SQL Editor** in Supabase dashboard.
- Paste the contents of `supabase/schema.sql` and run it.
- This creates `business_settings` and `customers` tables + a private `documents` storage bucket, with your GSTIN/business name pre-filled defaults.

### 3. Create your login
- Go to **Authentication → Users → Add User** in Supabase dashboard.
- Add your email + a password. This is the only login (single-user app).
- (Email confirmation: disable "Confirm email" in Authentication → Settings if you don't want to verify via email.)

### 4. Local setup
```bash
npm install
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm run dev
```

### 5. Deploy to Vercel
- Push this repo to a new GitHub repo (e.g. `jewellery-dashboard`).
- Import into Vercel, same as your HR dashboard.
- Add environment variables in Vercel project settings:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Deploy.

## Notes
- GSTIN, address, GST rate, pawn interest rate — edit anytime in **Settings** page inside the app (no code change needed).
- `documents` storage bucket is private, ready for Phase 2 (pawn item photos) and KYC docs.
