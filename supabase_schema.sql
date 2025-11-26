-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing objects (in correct order due to foreign keys)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.store_stats cascade;
drop table if exists public.appointments cascade;
drop table if exists public.orders cascade;
drop table if exists public.stores cascade;
drop table if exists public.user_carts cascade;
drop table if exists public.service_users cascade;

-- 1. Create service_users table (Platform users: Admins + Store Owners)
create table public.service_users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  role text not null check (role in ('admin', 'owner')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create stores table
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.service_users(id) on delete cascade not null,
  name text not null,
  slug text, -- e.g. "badminton" or domain
  url text, -- Full website URL
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  customer_email text not null,
  customer_name text,
  total_price numeric(10, 2) not null,
  currency text default 'USD',
  status text default 'pending', -- pending, paid, shipped, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create user_carts table (for persistent cart storage)
create table public.user_carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 5. Create appointments table (for booking court time, coaching, etc.)
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  appointment_date timestamp with time zone not null,
  duration_minutes integer not null default 60,
  appointment_type text not null, -- e.g., 'court_booking', 'coaching', 'group_session'
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create store_stats table (for tracking store metrics)
create table public.store_stats (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  total_revenue numeric(10, 2) not null default 0,
  total_orders integer not null default 0,
  total_products_sold integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(store_id)
);

-- Enable Row Level Security (RLS)
alter table public.service_users enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;
alter table public.user_carts enable row level security;
alter table public.appointments enable row level security;
alter table public.store_stats enable row level security;

-- RLS Policies

-- Service Users:
-- Users can read their own data
create policy "Users can view own profile" 
  on public.service_users for select 
  using (auth.uid() = id);

-- Admins can view all users (This requires a recursive check or a secure function, 
-- but for simplicity we'll allow reading if the user claims to be admin in the table. 
-- Note: In a real secure app, use custom claims or a secure definer function)
create policy "Admins can view all profiles" 
  on public.service_users for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Stores:
-- Owners can view/edit their own stores
create policy "Owners can view own stores" 
  on public.stores for select 
  using (owner_id = auth.uid());

create policy "Owners can insert own stores" 
  on public.stores for insert 
  with check (owner_id = auth.uid());

create policy "Owners can update own stores" 
  on public.stores for update 
  using (owner_id = auth.uid());

-- Admins can view all stores
create policy "Admins can view all stores" 
  on public.stores for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );
  
-- Admins can update all stores (e.g. assigning URLs)
create policy "Admins can update all stores" 
  on public.stores for update 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders:
-- Owners can view orders for their stores
create policy "Owners can view store orders" 
  on public.orders for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = orders.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Admins can view all orders
create policy "Admins can view all orders" 
  on public.orders for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- User Carts:
-- Users can only access their own cart
create policy "Users can view own cart" 
  on public.user_carts for select 
  using (auth.uid() = user_id);

create policy "Users can insert own cart" 
  on public.user_carts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own cart" 
  on public.user_carts for update 
  using (auth.uid() = user_id);

create policy "Users can delete own cart" 
  on public.user_carts for delete 
  using (auth.uid() = user_id);

-- Appointments:
-- Owners can view appointments for their stores
create policy "Owners can view store appointments" 
  on public.appointments for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Owners can insert appointments for their stores
create policy "Owners can create store appointments" 
  on public.appointments for insert 
  with check (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Owners can update appointments for their stores
create policy "Owners can update store appointments" 
  on public.appointments for update 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Admins can view all appointments
create policy "Admins can view all appointments" 
  on public.appointments for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Store Stats:
-- Owners can view stats for their stores
create policy "Owners can view own store stats" 
  on public.store_stats for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = store_stats.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Admins can view all store stats
create policy "Admins can view all store stats" 
  on public.store_stats for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.service_users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'owner'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create service_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
