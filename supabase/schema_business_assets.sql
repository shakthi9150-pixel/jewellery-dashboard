-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Migration: Public bucket for business logo (used in rate card image)
-- Run this in Supabase SQL Editor
-- ============================================
-- Public because the logo needs to be canvas-drawable (CORS-friendly) when
-- generating the shareable rate card image. logo_url column on
-- business_settings already exists from Phase 1 schema.

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do nothing;

create policy "Authenticated can upload business assets"
  on storage.objects for insert
  with check (bucket_id = 'business-assets' and auth.role() = 'authenticated');

create policy "Authenticated can update business assets"
  on storage.objects for update
  using (bucket_id = 'business-assets' and auth.role() = 'authenticated');

create policy "Anyone can view business assets"
  on storage.objects for select
  using (bucket_id = 'business-assets');
