create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_agent text,
  ip_address inet,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  source text not null check (source in ('created', 'imported')),
  encrypted_mnemonic_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  chain text not null,
  derivation_path text,
  address text not null,
  created_at timestamptz not null default now(),
  unique(wallet_id, chain, address)
);

create table if not exists public.assets (
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

create table if not exists public.wallet_asset_balances (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  balance_numeric numeric(38, 18) not null default 0,
  fiat_value_usd numeric(18, 2),
  favorite boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(wallet_account_id, asset_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_account_id uuid not null references public.wallet_accounts(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
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

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  detail text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.connected_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  device_fingerprint text,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, email_verified)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', 'Wallet User'),
    new.email_confirmed_at is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    email_verified = excluded.email_verified,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, email_confirmed_at, raw_user_meta_data
  on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.assets enable row level security;
alter table public.wallet_asset_balances enable row level security;
alter table public.transactions enable row level security;
alter table public.security_events enable row level security;
alter table public.password_resets enable row level security;
alter table public.connected_sessions enable row level security;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists sessions_self_select on public.sessions;
create policy sessions_self_select on public.sessions
  for select using (auth.uid() = user_id);

drop policy if exists wallets_owner_all on public.wallets;
create policy wallets_owner_all on public.wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists wallet_accounts_owner_all on public.wallet_accounts;
create policy wallet_accounts_owner_all on public.wallet_accounts
  for all using (
    exists (
      select 1 from public.wallets
      where public.wallets.id = wallet_accounts.wallet_id
        and public.wallets.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.wallets
      where public.wallets.id = wallet_accounts.wallet_id
        and public.wallets.user_id = auth.uid()
    )
  );

drop policy if exists assets_authenticated_select on public.assets;
create policy assets_authenticated_select on public.assets
  for select using (auth.role() = 'authenticated');

drop policy if exists balances_owner_select on public.wallet_asset_balances;
create policy balances_owner_select on public.wallet_asset_balances
  for select using (
    exists (
      select 1
      from public.wallet_accounts
      join public.wallets on public.wallets.id = public.wallet_accounts.wallet_id
      where public.wallet_accounts.id = wallet_asset_balances.wallet_account_id
        and public.wallets.user_id = auth.uid()
    )
  );

drop policy if exists transactions_owner_select on public.transactions;
create policy transactions_owner_select on public.transactions
  for select using (
    exists (
      select 1
      from public.wallet_accounts
      join public.wallets on public.wallets.id = public.wallet_accounts.wallet_id
      where public.wallet_accounts.id = transactions.wallet_account_id
        and public.wallets.user_id = auth.uid()
    )
  );

drop policy if exists security_events_self_select on public.security_events;
create policy security_events_self_select on public.security_events
  for select using (auth.uid() = user_id);

drop policy if exists connected_sessions_self_select on public.connected_sessions;
create policy connected_sessions_self_select on public.connected_sessions
  for select using (auth.uid() = user_id);
