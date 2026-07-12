-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Phase 2 Schema: Pawn Ledger (Pledges)
-- Run this in Supabase SQL Editor (after Phase 1 schema.sql)
-- ============================================

create table if not exists pledges (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,

  -- Item details
  item_description text not null,      -- e.g. "22K Gold Chain, 15g"
  metal_type text not null default 'gold',   -- gold / silver / other
  weight_grams numeric,
  item_photo_url text,                 -- photo of the item / handwritten note, from Storage

  -- Loan details
  loan_amount numeric not null,
  interest_rate numeric not null,      -- % per month, snapshot at pledge time (from settings)
  pledge_date date not null default current_date,
  redemption_period_months int not null default 12,  -- after this, item eligible for auction if unredeemed

  -- Status tracking
  status text not null default 'active',  -- active / redeemed / auctioned
  redeemed_date date,
  redeemed_amount numeric,             -- total amount collected (principal + interest) at redemption
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_pledges_customer on pledges(customer_id);
create index if not exists idx_pledges_status on pledges(status);
create index if not exists idx_pledges_pledge_date on pledges(pledge_date);

-- RLS
alter table pledges enable row level security;

create policy "Authenticated full access - pledges"
  on pledges for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Auto-update updated_at on change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_pledges_updated_at on pledges;
create trigger trg_pledges_updated_at
  before update on pledges
  for each row execute function set_updated_at();

-- ============================================
-- Public storage bucket for pledge item photos
-- (separate from the private 'documents' bucket used for KYC docs —
-- item photos aren't sensitive personal data, and being public lets
-- them render directly in <img> tags without signed URLs)
-- ============================================
insert into storage.buckets (id, name, public)
values ('pledge-photos', 'pledge-photos', true)
on conflict (id) do nothing;

create policy "Authenticated can upload pledge photos"
  on storage.objects for insert
  with check (bucket_id = 'pledge-photos' and auth.role() = 'authenticated');

create policy "Anyone can view pledge photos"
  on storage.objects for select
  using (bucket_id = 'pledge-photos');
