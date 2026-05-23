-- ═══════════════════════════════════════════════════════════════
--  HomeConnect AI — Supabase Database Schema
--  Run this entire file in the Supabase SQL Editor
--  Dashboard → SQL Editor → New Query → paste → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable the UUID extension (usually already enabled in Supabase)
create extension if not exists "uuid-ossp";

-- ─── LEADS ───────────────────────────────────────────────────────
-- Each row represents one prospective buyer/renter/seller
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  phone       text not null,
  email       text,
  interest    text,                          -- buying | renting | selling | investing
  status      text not null default 'new',  -- new | contacted | qualified | booked | lost
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── CONVERSATIONS ───────────────────────────────────────────────
-- Stores the full SMS conversation history as a JSON array
-- Each message: { role: "user"|"assistant", content: "...", timestamp: "..." }
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade not null,
  agent_id    uuid references auth.users(id) on delete cascade not null,
  messages    jsonb not null default '[]',
  status      text not null default 'active',  -- active | completed | failed
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── APPOINTMENTS ────────────────────────────────────────────────
create table if not exists appointments (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid references leads(id) on delete cascade not null,
  agent_id          uuid references auth.users(id) on delete cascade not null,
  scheduled_at      timestamptz not null,
  duration_minutes  integer not null default 30,
  google_event_id   text,                   -- Google Calendar event ID (optional)
  status            text not null default 'confirmed',  -- pending | confirmed | cancelled
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── AGENT SETTINGS ──────────────────────────────────────────────
-- One row per agent — stores their API credentials and preferences
-- NOTE: In production, consider encrypting sensitive fields using Vault
create table if not exists agent_settings (
  id                    uuid primary key default gen_random_uuid(),
  agent_id              uuid references auth.users(id) on delete cascade unique not null,
  openai_api_key        text,
  twilio_account_sid    text,
  twilio_auth_token     text,
  twilio_phone_number   text,
  google_calendar_id    text default 'primary',
  google_refresh_token  text,
  google_connected      boolean default false,
  business_hours        jsonb default '{"start": "09:00", "end": "17:00"}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────
-- Each agent can only see their own data

alter table leads           enable row level security;
alter table conversations   enable row level security;
alter table appointments    enable row level security;
alter table agent_settings  enable row level security;

-- Leads: agent sees only their own
create policy "agents see own leads" on leads
  for all using (agent_id = auth.uid());

-- Conversations: agent sees only their own
create policy "agents see own conversations" on conversations
  for all using (agent_id = auth.uid());

-- Appointments: agent sees only their own
create policy "agents see own appointments" on appointments
  for all using (agent_id = auth.uid());

-- Agent settings: agent sees only their own row
create policy "agents see own settings" on agent_settings
  for all using (agent_id = auth.uid());

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at           before update on leads           for each row execute function update_updated_at();
create trigger conversations_updated_at   before update on conversations   for each row execute function update_updated_at();
create trigger appointments_updated_at    before update on appointments    for each row execute function update_updated_at();
create trigger agent_settings_updated_at  before update on agent_settings  for each row execute function update_updated_at();
