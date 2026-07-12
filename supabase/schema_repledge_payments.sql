-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Migration: Re-pledge interest payment tracking
-- Run this in Supabase SQL Editor (after schema_repledge_cycle.sql)
-- ============================================

create table if not exists repledge_payments (
  id uuid primary key default gen_random_uuid(),
  pledge_id uuid not null references pledges(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric not null,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_repledge_payments_pledge on repledge_payments(pledge_id);

alter table repledge_payments enable row level security;

create policy "Authenticated full access - repledge_payments" on repledge_payments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
