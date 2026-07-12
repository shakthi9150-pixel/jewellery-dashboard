-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Phase 3 Schema: GST Invoices + Simplified Books
-- Run this in Supabase SQL Editor (after schema.sql and schema_phase2.sql)
-- ============================================

-- Tracks the last used sequence number per financial year (Apr-Mar)
create table if not exists invoice_counters (
  financial_year text primary key,   -- e.g. '2026-27'
  last_sequence int not null default 0
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,  -- e.g. '2026-27/001'
  financial_year text not null,
  sequence_number int not null,

  customer_id uuid references customers(id) on delete restrict,
  customer_name_snapshot text,   -- snapshot in case customer is later edited/deleted
  customer_phone_snapshot text,
  customer_address_snapshot text,

  invoice_date date not null default current_date,
  subtotal numeric not null default 0,
  cgst_rate numeric not null default 1.5,
  sgst_rate numeric not null default 1.5,
  cgst_amount numeric not null default 0,
  sgst_amount numeric not null default 0,
  total_amount numeric not null default 0,
  notes text,

  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  hsn_code text not null default '7113',
  quantity numeric not null default 1,
  weight_grams numeric,
  rate numeric not null default 0,   -- rate per unit
  amount numeric not null default 0, -- quantity * rate
  sort_order int not null default 0
);

create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);
create index if not exists idx_invoices_customer on invoices(customer_id);
create index if not exists idx_invoices_date on invoices(invoice_date);

-- Simplified books: manual ledger entries (expenses + any non-invoice income)
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  entry_type text not null,       -- 'income' or 'expense'
  category text not null,          -- e.g. 'Rent', 'Salary', 'Other Income'
  description text,
  amount numeric not null,
  created_at timestamptz default now()
);

create index if not exists idx_ledger_entries_date on ledger_entries(entry_date);

-- Function: atomically get the next invoice number for a financial year
create or replace function next_invoice_number(fy text)
returns table(invoice_number text, seq int) as $$
declare
  new_seq int;
begin
  insert into invoice_counters (financial_year, last_sequence)
  values (fy, 1)
  on conflict (financial_year)
  do update set last_sequence = invoice_counters.last_sequence + 1
  returning last_sequence into new_seq;

  return query select (fy || '/' || lpad(new_seq::text, 3, '0')), new_seq;
end;
$$ language plpgsql;

-- RLS
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table invoice_counters enable row level security;
alter table ledger_entries enable row level security;

create policy "Authenticated full access - invoices" on invoices for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access - invoice_items" on invoice_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access - invoice_counters" on invoice_counters for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated full access - ledger_entries" on ledger_entries for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
