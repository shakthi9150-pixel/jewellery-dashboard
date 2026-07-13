-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Migration: Jewellery photo gallery (for rate card images)
-- Run this in Supabase SQL Editor (after schema_business_assets.sql)
-- ============================================

create table if not exists jewellery_gallery (
  id uuid primary key default gen_random_uuid(),
  label text,
  category text default 'other',   -- necklace / ring / bangle / earring / other
  image_url text not null,
  created_at timestamptz default now()
);

alter table jewellery_gallery enable row level security;

create policy "Authenticated full access - jewellery_gallery" on jewellery_gallery for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
