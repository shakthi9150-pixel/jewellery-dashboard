-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Phase 5 Schema: Daily Gold/Silver Rates
-- Run this in Supabase SQL Editor (after schema.sql, schema_phase2/3/4.sql)
-- ============================================

create table if not exists metal_rates (
  id uuid primary key default gen_random_uuid(),
  rate_date date not null unique,
  gold_22k_rate numeric,     -- per gram
  gold_24k_rate numeric,     -- per gram
  silver_rate numeric,       -- per gram
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_metal_rates_date on metal_rates(rate_date desc);

alter table metal_rates enable row level security;

create policy "Authenticated full access - metal_rates" on metal_rates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop trigger if exists trg_metal_rates_updated_at on metal_rates;
create trigger trg_metal_rates_updated_at
  before update on metal_rates
  for each row execute function set_updated_at();
