-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Migration: Re-pledge cycle tracking (for due date + advance warning)
-- Run this in Supabase SQL Editor (after schema_repledge.sql)
-- ============================================

alter table pledges add column if not exists repledge_cycle_months int not null default 12;
