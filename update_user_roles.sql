-- Simple approach: Update existing user to admin role
-- Run this AFTER you've registered an account through the UI

-- Option 1: If you just registered as admin@example.com, run this to make it an admin:
UPDATE public.service_users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Option 2: If you just registered as owner@example.com, it's already an owner by default
-- But if you want to verify:
SELECT * FROM public.service_users WHERE email = 'owner@example.com';

-- To create a demo store for the owner:
DO $$
DECLARE
  owner_user_id uuid;
  store_id uuid;
BEGIN
  SELECT id INTO owner_user_id FROM public.service_users WHERE email = 'owner@example.com';
  
  IF owner_user_id IS NOT NULL THEN
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Demo Store', 'demo-store', 'https://demo-store.com', owner_user_id, 'General')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store_id;
    
    IF store_id IS NOT NULL THEN
      INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
      VALUES 
        (store_id, 'customer1@example.com', 'John Doe', 49.99, 'USD', 'paid'),
        (store_id, 'customer2@example.com', 'Jane Smith', 120.50, 'USD', 'shipped')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
