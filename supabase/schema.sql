-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Phase 1 Schema: Business Settings + Customers
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Business Settings (single row config table)
create table if not exists business_settings (
  id int primary key default 1,
  business_name text not null default 'Senthil Aandavar Jewellery+',
  gstin text,
  address text,
  phone text,
  gold_gst_rate numeric default 3.0,      -- total % (1.5 CGST + 1.5 SGST)
  pawn_interest_rate numeric default 2.0, -- % per month, simple interest
  logo_url text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into business_settings (id, business_name, gold_gst_rate, pawn_interest_rate)
values (1, 'Senthil Aandavar Jewellery+', 3.0, 2.0)
on conflict (id) do nothing;

-- 2. Customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  alt_phone text,
  address text,
  aadhar_number text,
  pan_number text,
  kyc_doc_url text,          -- Aadhar/PAN photo uploaded to Supabase Storage
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_customers_phone on customers(phone);
create index if not exists idx_customers_name on customers(name);

-- ============================================
-- Row Level Security
-- Single-user app: any authenticated user (you) has full access
-- ============================================
alter table business_settings enable row level security;
alter table customers enable row level security;

create policy "Authenticated full access - business_settings"
  on business_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated full access - customers"
  on customers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================
-- Storage bucket for KYC docs + pawn item photos (Phase 2 will use this too)
-- Run separately if bucket creation via SQL is restricted; can also create
-- via Supabase Dashboard > Storage > New Bucket "documents" (private)
-- ============================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Authenticated can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Authenticated can view documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');
