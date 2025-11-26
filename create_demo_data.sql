-- Create demo data for the admin/owner accounts
-- Run this in Supabase SQL Editor after confirming your users

-- First, let's create a store for the first owner we find
DO $$
DECLARE
  owner_user_id uuid;
  admin_user_id uuid;
  store_id uuid;
  store2_id uuid;
BEGIN
  -- Get the first owner user
  SELECT id INTO owner_user_id 
  FROM public.service_users 
  WHERE role = 'owner' 
  LIMIT 1;
  
  -- Get the admin user
  SELECT id INTO admin_user_id 
  FROM public.service_users 
  WHERE role = 'admin' 
  LIMIT 1;
  
  IF owner_user_id IS NOT NULL THEN
    -- Create first store for owner
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Demo Store', 'demo-store', 'https://demo-store.com', owner_user_id, 'General')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store_id;
    
    -- Create second store for the same owner
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Tech Shop', 'tech-shop', 'https://tech-shop.com', owner_user_id, 'Electronics')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store2_id;
    
    -- Create demo orders for first store
    IF store_id IS NOT NULL THEN
      INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
      VALUES 
        (store_id, 'customer1@example.com', 'John Doe', 49.99, 'USD', 'paid'),
        (store_id, 'customer2@example.com', 'Jane Smith', 120.50, 'USD', 'shipped'),
        (store_id, 'customer3@example.com', 'Bob Johnson', 75.25, 'USD', 'paid')
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Create demo orders for second store
    IF store2_id IS NOT NULL THEN
      INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
      VALUES 
        (store2_id, 'tech.buyer@example.com', 'Alice Williams', 299.99, 'USD', 'paid'),
        (store2_id, 'gadget.fan@example.com', 'Charlie Brown', 450.00, 'USD', 'shipped')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RAISE NOTICE 'Demo data created successfully! Owner ID: %, Admin ID: %', owner_user_id, admin_user_id;
END $$;

-- Verify the data was created
SELECT 
  s.name as store_name,
  COUNT(o.id) as order_count,
  SUM(o.total_price) as total_revenue
FROM public.stores s
LEFT JOIN public.orders o ON s.id = o.store_id
GROUP BY s.id, s.name;
