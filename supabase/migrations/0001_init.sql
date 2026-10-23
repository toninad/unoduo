-- Listings. Rank is total_cents descending; ranked_at breaks ties so an app
-- that reaches a total first keeps its place.
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  app_store_id bigint not null unique,
  name text not null,
  developer text not null,
  tagline text not null check (char_length(tagline) between 1 and 80),
  icon_url text not null,
  app_store_url text not null,
  status text not null default 'approved'
    check (status in ('pending', 'approved', 'hidden')),
  total_cents bigint not null default 0 check (total_cents >= 0),
  ranked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index apps_rank_idx on public.apps (total_cents desc, ranked_at asc)
  where status = 'approved';

-- One row per paid Stripe Checkout session.
create table public.boosts (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  stripe_session_id text not null unique,
  created_at timestamptz not null default now()
);

create index boosts_app_id_idx on public.boosts (app_id);

-- The site talks to Supabase only from the server with the service role key,
-- so RLS stays on with no policies: the anon key can read or write nothing.
alter table public.apps enable row level security;
alter table public.boosts enable row level security;

-- Records a paid boost once per Checkout session and bumps the app's total in
-- the same transaction. Returns false when the session was already recorded
-- (Stripe retries webhooks).
create function public.record_boost(
  p_session_id text,
  p_app_id uuid,
  p_amount_cents integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into boosts (app_id, amount_cents, stripe_session_id)
  values (p_app_id, p_amount_cents, p_session_id)
  on conflict (stripe_session_id) do nothing;

  if not found then
    return false;
  end if;

  update apps
  set total_cents = total_cents + p_amount_cents,
      ranked_at = now()
  where id = p_app_id;

  return true;
end;
$$;

revoke execute on function public.record_boost(text, uuid, integer)
  from public, anon, authenticated;
