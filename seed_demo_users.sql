-- Seed Demo Users for Internal Dashboard
-- Run this in your Supabase SQL Editor

-- IMPORTANT: This script creates users directly in auth.users, bypassing email confirmation
-- This is for development/demo purposes only

-- 1. Create Admin User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","name":"Admin User"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Create Store Owner User
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'owner@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"owner","name":"Store Owner"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Note: The trigger `on_auth_user_created` will automatically create entries in `service_users` table

-- 3. Create Demo Store for Owner (run after users are created)
-- Get owner user ID first
DO $$
DECLARE
  owner_user_id uuid;
  store_id uuid;
BEGIN
  -- Get the owner's user ID
  SELECT id INTO owner_user_id FROM auth.users WHERE email = 'owner@example.com';
  
  IF owner_user_id IS NOT NULL THEN
    -- Create store
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Demo Store', 'demo-store', 'https://demo-store.com', owner_user_id, 'General')
    RETURNING id INTO store_id;
    
    -- Create sample orders
    INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
    VALUES 
      (store_id, 'customer1@example.com', 'John Doe', 49.99, 'USD', 'paid'),
      (store_id, 'customer2@example.com', 'Jane Smith', 120.50, 'USD', 'shipped');
  END IF;
END $$;
