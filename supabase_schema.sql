-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing objects (in correct order due to foreign keys)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.order_products cascade;
drop table if exists public.store_stats cascade;
drop table if exists public.appointments cascade;
drop table if exists public.orders cascade;
drop table if exists public.website_builder_subscriptions cascade;
drop table if exists public.stores cascade;
drop table if exists public.user_carts cascade;
drop table if exists public.clients cascade;
drop table if exists public.owners cascade;
drop table if exists public.service_users cascade;

-- 1. Create service_users table (Base table for all users)
CREATE TABLE public.service_users (
  id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_users_pkey PRIMARY KEY (id),
  CONSTRAINT service_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Create owners table (Inherits from service_users)
CREATE TABLE public.owners (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  name text,
  role text,
  CONSTRAINT owners_pkey PRIMARY KEY (id),
  CONSTRAINT owners_id_fkey FOREIGN KEY (id) REFERENCES public.service_users(id)
);

-- 3. Create stores table
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text,
  url text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_active timestamp with time zone,
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.service_users(id)
);

-- 4. Create clients table (Inherits from service_users, linked to a store)
CREATE TABLE public.clients (
  id uuid NOT NULL,
  store_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  name text,
  role text,
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_id_fkey FOREIGN KEY (id) REFERENCES public.service_users(id),
  CONSTRAINT clients_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 5. Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  total_price numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 6. Create user_carts table (Linked to clients)
CREATE TABLE public.user_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_carts_pkey PRIMARY KEY (id),
  CONSTRAINT user_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.clients(id)
);

-- 7. Create appointments table (Linked to clients)
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  appointment_date timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL,
  appointment_type text NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  client_id uuid,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT appointments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 8. Create store_stats table
CREATE TABLE public.store_stats (
  store_id uuid NOT NULL,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  total_products_sold integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT store_stats_pkey PRIMARY KEY (store_id),
  CONSTRAINT store_stats_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 9. Create order_products table
CREATE TABLE public.order_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  store_id uuid NOT NULL,
  product_name text NOT NULL,
  sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  currency text NOT NULL,
  line_total numeric DEFAULT ((quantity)::numeric * unit_price),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_products_pkey PRIMARY KEY (id),
  CONSTRAINT order_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 10. Create website_builder_subscriptions table
CREATE TABLE public.website_builder_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  plan_name text NOT NULL,
  plan_interval text NOT NULL DEFAULT 'monthly'::text,
  plan_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  is_active boolean NOT NULL DEFAULT true,
  billing_started_at timestamp with time zone NOT NULL DEFAULT now(),
  billing_ended_at timestamp with time zone,
  total_revenue numeric NOT NULL DEFAULT 0,
  last_payment_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT website_builder_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT website_builder_subscriptions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.service_users(id)
);

-- Enable Row Level Security (RLS)
alter table public.service_users enable row level security;
alter table public.owners enable row level security;
alter table public.clients enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;
alter table public.user_carts enable row level security;
alter table public.appointments enable row level security;
alter table public.store_stats enable row level security;
alter table public.order_products enable row level security;
alter table public.website_builder_subscriptions enable row level security;

-- Function to check if user is admin (Security Definer to bypass RLS recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.service_users
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RLS Policies

-- Service Users:
create policy "Users can view own service_user" 
  on public.service_users for select 
  using (auth.uid() = id);

create policy "Admins can view all service_users" 
  on public.service_users for select 
  using (public.is_admin());

-- Owners:
create policy "Owners can view own profile" 
  on public.owners for select 
  using (auth.uid() = id);

create policy "Admins can view all owners" 
  on public.owners for select 
  using (public.is_admin());

-- Clients:
create policy "Clients can view own profile" 
  on public.clients for select 
  using (auth.uid() = id);

create policy "Owners can view clients in their stores" 
  on public.clients for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = clients.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Stores:
create policy "Owners can view own stores" 
  on public.stores for select 
  using (owner_id = auth.uid());

create policy "Owners can insert own stores" 
  on public.stores for insert 
  with check (owner_id = auth.uid());

create policy "Owners can update own stores" 
  on public.stores for update 
  using (owner_id = auth.uid());

create policy "Admins can view all stores" 
  on public.stores for select 
  using (public.is_admin());
  
create policy "Admins can update all stores" 
  on public.stores for update 
  using (public.is_admin());

-- Orders:
create policy "Owners can view store orders" 
  on public.orders for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = orders.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Admins can view all orders" 
  on public.orders for select 
  using (public.is_admin());

-- User Carts:
create policy "Clients can view own cart" 
  on public.user_carts for select 
  using (
    exists (
      select 1 from public.clients 
      where id = user_carts.user_id 
      and id = auth.uid()
    )
  );

create policy "Clients can insert own cart" 
  on public.user_carts for insert 
  with check (
    exists (
      select 1 from public.clients 
      where id = user_carts.user_id 
      and id = auth.uid()
    )
  );

create policy "Clients can update own cart" 
  on public.user_carts for update 
  using (
    exists (
      select 1 from public.clients 
      where id = user_carts.user_id 
      and id = auth.uid()
    )
  );

create policy "Clients can delete own cart" 
  on public.user_carts for delete 
  using (
    exists (
      select 1 from public.clients 
      where id = user_carts.user_id 
      and id = auth.uid()
    )
  );

-- Appointments:
create policy "Owners can view store appointments" 
  on public.appointments for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Owners can create store appointments" 
  on public.appointments for insert 
  with check (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Owners can update store appointments" 
  on public.appointments for update 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = appointments.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Admins can view all appointments" 
  on public.appointments for select 
  using (public.is_admin());
  
create policy "Clients can view own appointments" 
  on public.appointments for select 
  using (client_id = auth.uid());

-- Store Stats:
create policy "Owners can view own store stats" 
  on public.store_stats for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = store_stats.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Admins can view all store stats" 
  on public.store_stats for select 
  using (public.is_admin());

-- Order Products:
create policy "Owners can view own order products" 
  on public.order_products for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = order_products.store_id 
      and stores.owner_id = auth.uid()
    )
  );

create policy "Admins can view all order products" 
  on public.order_products for select 
  using (public.is_admin());

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'owner');
  
  -- Insert into base table
  insert into public.service_users (id, role)
  values (new.id, user_role);
  
  -- Insert into specific role table
  if user_role = 'owner' then
    insert into public.owners (id, email, name, role)
    values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'name',
      user_role
    );
  elsif user_role = 'client' then
    -- Note: Store ID for client might need to be passed in metadata or updated later
    insert into public.clients (id, email, name, role)
    values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'name',
      user_role
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create service_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
