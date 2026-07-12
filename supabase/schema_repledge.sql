-- ============================================
-- Senthil Aandavar Jewellery+ Dashboard
-- Migration: Re-pledge tracking on pledges
-- Run this in Supabase SQL Editor (after schema_phase2.sql)
-- ============================================
-- Tracks when a pledged item is, in turn, re-pledged by the shop to a bank
-- or another person to raise funds at a lower interest rate than what the
-- customer is being charged.

alter table pledges add column if not exists is_repledged boolean not null default false;
alter table pledges add column if not exists repledge_party_type text;   -- 'bank' or 'person'
alter table pledges add column if not exists repledge_party_name text;
alter table pledges add column if not exists repledge_amount numeric;
alter table pledges add column if not exists repledge_interest_rate numeric;
alter table pledges add column if not exists repledge_rate_unit text default 'monthly'; -- 'monthly' or 'annual'
alter table pledges add column if not exists repledge_date date;
alter table pledges add column if not exists repledge_notes text;
alter table pledges add column if not exists repledge_returned_date date;  -- when shop got the item back from the bank/person

create index if not exists idx_pledges_is_repledged on pledges(is_repledged);
