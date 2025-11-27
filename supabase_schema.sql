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
drop table if exists public.service_users cascade;

-- 1. Create service_users table (Platform users: Admins + Store Owners + Clients)
-- Note: Foreign key to stores added later to avoid circular dependency
CREATE TABLE public.service_users (
  id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  store_id uuid,
  name text,
  CONSTRAINT service_users_pkey PRIMARY KEY (id),
  CONSTRAINT service_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Create stores table
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

-- Add circular foreign key for service_users
ALTER TABLE public.service_users 
ADD CONSTRAINT service_users_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);

-- 3. Create orders table
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

-- 4. Create user_carts table
CREATE TABLE public.user_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_carts_pkey PRIMARY KEY (id),
  CONSTRAINT user_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 5. Create appointments table
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
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 6. Create store_stats table
CREATE TABLE public.store_stats (
  store_id uuid NOT NULL,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_orders integer NOT NULL DEFAULT 0,
  total_products_sold integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT store_stats_pkey PRIMARY KEY (store_id),
  CONSTRAINT store_stats_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

-- 7. Create order_products table
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

-- 8. Create website_builder_subscriptions table
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
alter table public.stores enable row level security;
alter table public.orders enable row level security;
alter table public.user_carts enable row level security;
alter table public.appointments enable row level security;
alter table public.store_stats enable row level security;
alter table public.order_products enable row level security;
alter table public.website_builder_subscriptions enable row level security;

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

-- Owners can view client users linked to their stores
create policy "Owners can view clients in their stores" 
  on public.service_users for select 
  using (
    role = 'client' AND
    exists (
      select 1 from public.stores 
      where stores.id = service_users.store_id 
      and stores.owner_id = auth.uid()
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

-- Order Products:
-- Owners can view order products for their stores
create policy "Owners can view own order products" 
  on public.order_products for select 
  using (
    exists (
      select 1 from public.stores 
      where stores.id = order_products.store_id 
      and stores.owner_id = auth.uid()
    )
  );

-- Admins can view all order products
create policy "Admins can view all order products" 
  on public.order_products for select 
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
  insert into public.service_users (id, email, name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    coalesce(new.raw_user_meta_data->>'role', 'owner')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create service_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
