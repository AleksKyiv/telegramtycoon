-- Green Farm / Telegram Tycoon database schema for Supabase Postgres.
-- Run this file in Supabase SQL Editor when you are ready to move away from JSON storage.

create extension if not exists pgcrypto;

create table if not exists public.players (
  id text primary key,
  telegram_id bigint unique,
  username text,
  name text not null default 'Guest',
  verified boolean not null default false,
  score integer not null default 0,
  energy integer not null default 0,
  resonance integer not null default 0,
  sessions integer not null default 0,
  artifact integer not null default 0,
  stars_spent integer not null default 0,
  purchases integer not null default 0,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  payload text not null unique,
  status text not null default 'pending',
  product_id text not null,
  player_id text references public.players(id) on delete set null,
  player_name text,
  telegram_id bigint,
  username text,
  platform text not null default 'unknown',
  stars integer not null default 0,
  reward jsonb not null default '{}'::jsonb,
  paid_by_player_id text references public.players(id) on delete set null,
  paid_by_name text,
  paid_by_telegram_id bigint,
  paid_by_username text,
  telegram_payment_charge_id text,
  provider_payment_charge_id text,
  error text,
  created_at timestamptz not null default now(),
  pre_checkout_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  kind text,
  player_id text references public.players(id) on delete set null,
  name text,
  username text,
  details jsonb not null default '{}'::jsonb,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.players(id) on delete cascade,
  room text not null,
  item_type text not null,
  name text not null,
  rarity text not null default 'common',
  source text,
  level integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_star_transactions (
  id text primary key,
  amount integer not null default 0,
  nano integer not null default 0,
  source_type text,
  receiver_type text,
  source_user jsonb,
  receiver_user jsonb,
  estimated_available_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  transaction_date timestamptz,
  synced_at timestamptz not null default now()
);

create table if not exists public.game_snapshots (
  id uuid primary key default gen_random_uuid(),
  player_id text references public.players(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists players_score_idx on public.players(score desc);
create index if not exists players_updated_at_idx on public.players(updated_at desc);
create index if not exists payment_orders_status_idx on public.payment_orders(status);
create index if not exists payment_orders_platform_idx on public.payment_orders(platform);
create index if not exists payment_orders_created_at_idx on public.payment_orders(created_at desc);
create index if not exists payment_orders_paid_at_idx on public.payment_orders(paid_at desc);
create index if not exists events_type_idx on public.events(type);
create index if not exists events_player_id_idx on public.events(player_id);
create index if not exists events_created_at_idx on public.events(created_at desc);
create index if not exists inventory_player_id_idx on public.inventory_items(player_id);
create index if not exists inventory_rarity_idx on public.inventory_items(rarity);
create index if not exists bot_star_transactions_date_idx on public.bot_star_transactions(transaction_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists inventory_items_set_updated_at on public.inventory_items;
create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

create or replace view public.admin_payment_summary as
select
  status,
  platform,
  count(*) as orders,
  coalesce(sum(stars), 0) as stars
from public.payment_orders
group by status, platform;
