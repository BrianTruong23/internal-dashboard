-- ==========================================
-- FIX ADMIN PERMISSIONS SCRIPT
-- ==========================================

-- 1. Ensure RLS is enabled on all tables
alter table public.service_users enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;
alter table public.appointments enable row level security;
alter table public.store_stats enable row level security;
alter table public.order_products enable row level security;

-- 2. Drop existing Admin policies to avoid conflicts
drop policy if exists "Admins can view all profiles" on public.service_users;
drop policy if exists "Admins can view all stores" on public.stores;
drop policy if exists "Admins can update all stores" on public.stores;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can view all appointments" on public.appointments;
drop policy if exists "Admins can view all store stats" on public.store_stats;
drop policy if exists "Admins can view all order products" on public.order_products;

-- 3. Re-create Admin policies with explicit logic

-- Service Users: Admins can view ALL users
create policy "Admins can view all profiles" 
  on public.service_users for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Stores: Admins can view ALL stores
create policy "Admins can view all stores" 
  on public.stores for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Stores: Admins can update ALL stores
create policy "Admins can update all stores" 
  on public.stores for update 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders: Admins can view ALL orders
create policy "Admins can view all orders" 
  on public.orders for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Appointments: Admins can view ALL appointments
create policy "Admins can view all appointments" 
  on public.appointments for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Store Stats: Admins can view ALL stats
create policy "Admins can view all store stats" 
  on public.store_stats for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- Order Products: Admins can view ALL order products
create policy "Admins can view all order products" 
  on public.order_products for select 
  using (
    exists (
      select 1 from public.service_users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Verification Query (Run this to check if you are an admin)
-- select id, email, role from public.service_users where id = auth.uid();
