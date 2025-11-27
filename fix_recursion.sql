-- ==========================================
-- FIX INFINITE RECURSION SCRIPT
-- ==========================================

-- The issue is likely circular dependency:
-- 1. service_users policy checks stores (for clients)
-- 2. stores policy checks service_users (for admins)
-- 3. service_users policy checks stores... loop!

-- SOLUTION: Use a SECURITY DEFINER function to check admin status.
-- This bypasses RLS when checking if a user is an admin, breaking the loop.

-- 1. Create a secure function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.service_users 
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Update Service Users Policies
drop policy if exists "Admins can view all profiles" on public.service_users;
create policy "Admins can view all profiles" 
  on public.service_users for select 
  using (public.is_admin());

-- Ensure users can view their own profile (CRITICAL for is_admin to work if not using security definer, but good practice)
drop policy if exists "Users can view own profile" on public.service_users;
create policy "Users can view own profile" 
  on public.service_users for select 
  using (auth.uid() = id);

-- 3. Update Stores Policies to use the function
drop policy if exists "Admins can view all stores" on public.stores;
create policy "Admins can view all stores" 
  on public.stores for select 
  using (public.is_admin());

drop policy if exists "Admins can update all stores" on public.stores;
create policy "Admins can update all stores" 
  on public.stores for update 
  using (public.is_admin());

-- 4. Update Other Tables to use the function (Optimization)
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" 
  on public.orders for select 
  using (public.is_admin());

drop policy if exists "Admins can view all appointments" on public.appointments;
create policy "Admins can view all appointments" 
  on public.appointments for select 
  using (public.is_admin());

drop policy if exists "Admins can view all store stats" on public.store_stats;
create policy "Admins can view all store stats" 
  on public.store_stats for select 
  using (public.is_admin());

drop policy if exists "Admins can view all order products" on public.order_products;
create policy "Admins can view all order products" 
  on public.order_products for select 
  using (public.is_admin());
