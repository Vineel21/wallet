-- Wallax MVP database schema reference.
-- The deployable, RLS-enabled migration lives at:
-- supabase/migrations/20260528000000_initial_schema.sql

create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  user_agent text,
  ip_address inet,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  source text not null check (source in ('created', 'imported')),
  encrypted_mnemonic_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  chain text not null,
  derivation_path text,
  address text not null,
  created_at timestamptz not null default now(),
  unique(wallet_id, chain, address)
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  name text not null,
  chain text not null,
  contract_address text,
  decimals integer not null default 18,
  icon_url text,
  created_at timestamptz not null default now(),
  unique(chain, symbol, contract_address)
);

create table wallet_asset_balances (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references wallet_accounts(id) on delete cascade,
  asset_id uuid not null references assets(id),
  balance_numeric numeric(38, 18) not null default 0,
  fiat_value_usd numeric(18, 2),
  favorite boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(wallet_account_id, asset_id)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references wallet_accounts(id) on delete cascade,
  asset_id uuid not null references assets(id),
  direction text not null check (direction in ('incoming', 'outgoing')),
  status text not null check (status in ('pending', 'success', 'failed')),
  amount_numeric numeric(38, 18) not null,
  fee_text text,
  from_address text not null,
  to_address text not null,
  tx_hash text,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_type text not null,
  detail text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table connected_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  device_fingerprint text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- Supabase RLS sketch:
-- alter table profiles enable row level security;
-- create policy "profiles are self readable" on profiles for select using (auth.uid() = id);
-- create policy "wallets are owner readable" on wallets for select using (auth.uid() = user_id);
-- create policy "security events are owner readable" on security_events for select using (auth.uid() = user_id);
