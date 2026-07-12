-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Phase 4 Schema: Bank Loans + Interest Payment Tracking
-- Run this in Supabase SQL Editor (after schema.sql, schema_phase2.sql, schema_phase3.sql)
-- ============================================

create table if not exists bank_loans (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  branch text,
  loan_account_number text,
  loan_amount numeric not null,
  interest_rate numeric not null,          -- % per annum
  loan_date date not null default current_date,
  interest_cycle_months int not null default 12,  -- e.g. 12 = annual interest payment
  status text not null default 'active',   -- active / closed
  notes text,
  created_at timestamptz default now()
);

create table if not exists bank_loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references bank_loans(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric not null,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_bank_loans_status on bank_loans(status);
create index if not exists idx_bank_loan_payments_loan on bank_loan_payments(loan_id);

-- RLS
alter table bank_loans enable row level security;
alter table bank_loan_payments enable row level security;

create policy "Authenticated full access - bank_loans" on bank_loans for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access - bank_loan_payments" on bank_loan_payments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
