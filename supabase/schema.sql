create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('customer', 'worker', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists tool_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid references tool_categories(id) on delete set null,
  image_url text,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'picked_up', 'maintenance')),
  location text,
  demand_score int not null default 50 check (demand_score between 0 and 100),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  worker_id uuid references profiles(id) on delete set null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'picked_up', 'returned', 'cancelled')),
  qr_code text unique,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists pickup_returns (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  pickup_time timestamptz,
  return_time timestamptz,
  pickup_verified_by uuid references profiles(id) on delete set null,
  return_verified_by uuid references profiles(id) on delete set null,
  status text not null default 'not_picked'
    check (status in ('not_picked', 'picked_up', 'returned')),
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table tool_categories enable row level security;
alter table tools enable row level security;
alter table reservations enable row level security;
alter table pickup_returns enable row level security;
alter table reviews enable row level security;

create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "tool_categories_select_all"
on tool_categories for select
using (true);

create policy "tools_select_all"
on tools for select
using (true);

create policy "reservations_insert_own"
on reservations for insert
with check (auth.uid() = customer_id);

create policy "reservations_select_related"
on reservations for select
using (auth.uid() = customer_id or auth.uid() = worker_id);

create policy "pickup_returns_select_related"
on pickup_returns for select
using (
  exists (
    select 1
    from reservations
    where reservations.id = pickup_returns.reservation_id
      and (reservations.customer_id = auth.uid() or reservations.worker_id = auth.uid())
  )
);

create policy "reviews_insert_own"
on reviews for insert
with check (auth.uid() = customer_id);

insert into tool_categories (name, description)
values
  ('Farming', 'Agriculture and field work tools'),
  ('Construction', 'Building and repair tools'),
  ('Repair', 'Home and community maintenance tools'),
  ('Cleaning', 'Cleaning and sanitation tools')
on conflict (name) do nothing;
