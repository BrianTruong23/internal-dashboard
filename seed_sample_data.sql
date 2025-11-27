-- ============================================
-- SEED SAMPLE DATA FOR DASHBOARD
-- Run this AFTER running supabase_schema.sql
-- ============================================

-- Note: Creating users in auth.users requires special handling
-- The trigger will automatically create service_users and owners entries

-- For this demo, we'll assume you already have at least one user created
-- through the UI (like testadmin@gmail.com)

-- First, let's update existing user to admin if needed
-- We need to update both service_users and owners if they exist
UPDATE public.service_users 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM public.owners WHERE email LIKE '%admin%' OR email LIKE '%test%'
);

UPDATE public.owners
SET role = 'admin'
WHERE email LIKE '%admin%' OR email LIKE '%test%';

-- Create additional sample service_users (these would normally come from auth.users)
-- We'll insert them directly for demo purposes
DO $$
DECLARE
  admin_id uuid;
  owner1_id uuid;
  owner2_id uuid;
  owner3_id uuid;
  store1_id uuid;
  store2_id uuid;
  store3_id uuid;
  store4_id uuid;
BEGIN
  -- Get existing users from auth.users if they exist
  SELECT id INTO admin_id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1;
  
  -- If we have an admin, make sure they're in service_users/owners as admin
  IF admin_id IS NOT NULL THEN
    -- Insert into base table
    INSERT INTO public.service_users (id, role)
    SELECT id, 'admin' FROM auth.users WHERE id = admin_id
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
    
    -- Insert into owners table (admins are also in owners table for now, or we could have an admins table)
    -- For simplicity, let's assume admins are also owners
    INSERT INTO public.owners (id, email, role)
    SELECT id, email, 'admin' FROM auth.users WHERE id = admin_id
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
  
  -- Get owner users
  SELECT id INTO owner1_id FROM auth.users WHERE email NOT LIKE '%admin%' LIMIT 1 OFFSET 0;
  SELECT id INTO owner2_id FROM auth.users WHERE email NOT LIKE '%admin%' LIMIT 1 OFFSET 1;
  SELECT id INTO owner3_id FROM auth.users WHERE email NOT LIKE '%admin%' LIMIT 1 OFFSET 2;
  
  -- Create stores for owners
  IF owner1_id IS NOT NULL THEN
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES 
      ('Badminton Pro Shop', 'badminton-pro', 'https://badminton-pro.com', owner1_id, 'Sports'),
      ('Racket Heaven', 'racket-heaven', 'https://racket-heaven.com', owner1_id, 'Sports')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store1_id;
  END IF;
  
  IF owner2_id IS NOT NULL THEN
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Court Essentials', 'court-essentials', 'https://court-essentials.com', owner2_id, 'Equipment')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store2_id;
  END IF;
  
  IF owner3_id IS NOT NULL THEN
    INSERT INTO public.stores (name, slug, url, owner_id, category)
    VALUES ('Shuttle Masters', 'shuttle-masters', 'https://shuttle-masters.com', owner3_id, 'Supplies')
    ON CONFLICT DO NOTHING
    RETURNING id INTO store3_id;
  END IF;
  
  -- Create orders for stores
  IF store1_id IS NOT NULL THEN
    INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
    VALUES 
      (store1_id, 'john.doe@email.com', 'John Doe', 149.99, 'USD', 'paid'),
      (store1_id, 'jane.smith@email.com', 'Jane Smith', 89.50, 'USD', 'shipped'),
      (store1_id, 'bob.wilson@email.com', 'Bob Wilson', 249.99, 'USD', 'paid'),
      (store1_id, 'alice.brown@email.com', 'Alice Brown', 175.00, 'USD', 'shipped'),
      (store1_id, 'charlie.davis@email.com', 'Charlie Davis', 320.50, 'USD', 'paid')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF store2_id IS NOT NULL THEN
    INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
    VALUES 
      (store2_id, 'emily.johnson@email.com', 'Emily Johnson', 199.99, 'USD', 'paid'),
      (store2_id, 'michael.lee@email.com', 'Michael Lee', 125.75, 'USD', 'shipped'),
      (store2_id, 'sarah.martinez@email.com', 'Sarah Martinez', 450.00, 'USD', 'paid')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF store3_id IS NOT NULL THEN
    INSERT INTO public.orders (store_id, customer_email, customer_name, total_price, currency, status)
    VALUES 
      (store3_id, 'david.garcia@email.com', 'David Garcia', 89.99, 'USD', 'shipped'),
      (store3_id, 'lisa.rodriguez@email.com', 'Lisa Rodriguez', 165.50, 'USD', 'paid'),
      (store3_id, 'james.taylor@email.com', 'James Taylor', 210.00, 'USD', 'pending')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create sample cart data
  -- Note: user_carts now references clients, but we don't have explicit clients created here yet.
  -- Skipping user_carts creation for now or we need to create clients first.
  
  -- Create sample appointments
  IF store1_id IS NOT NULL THEN
    INSERT INTO public.appointments (store_id, customer_email, customer_name, customer_phone, appointment_date, duration_minutes, appointment_type, status, notes)
    VALUES 
      (store1_id, 'john.doe@email.com', 'John Doe', '+1-555-0101', NOW() + INTERVAL '2 days', 60, 'court_booking', 'confirmed', 'Court 1 preferred'),
      (store1_id, 'jane.smith@email.com', 'Jane Smith', '+1-555-0102', NOW() + INTERVAL '3 days', 90, 'coaching', 'confirmed', 'Beginner level coaching'),
      (store1_id, 'bob.wilson@email.com', 'Bob Wilson', '+1-555-0103', NOW() + INTERVAL '5 days', 120, 'group_session', 'pending', 'Group of 4 players'),
      (store1_id, 'alice.brown@email.com', 'Alice Brown', '+1-555-0104', NOW() + INTERVAL '1 day', 60, 'court_booking', 'confirmed', NULL),
      (store1_id, 'charlie.davis@email.com', 'Charlie Davis', '+1-555-0105', NOW() - INTERVAL '1 day', 60, 'court_booking', 'completed', 'Court 2')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF store2_id IS NOT NULL THEN
    INSERT INTO public.appointments (store_id, customer_email, customer_name, customer_phone, appointment_date, duration_minutes, appointment_type, status, notes)
    VALUES 
      (store2_id, 'emily.johnson@email.com', 'Emily Johnson', '+1-555-0201', NOW() + INTERVAL '4 days', 60, 'court_booking', 'confirmed', NULL),
      (store2_id, 'michael.lee@email.com', 'Michael Lee', '+1-555-0202', NOW() + INTERVAL '6 days', 90, 'coaching', 'pending', 'Advanced coaching session'),
      (store2_id, 'sarah.martinez@email.com', 'Sarah Martinez', '+1-555-0203', NOW() + INTERVAL '7 days', 60, 'court_booking', 'confirmed', 'Evening slot preferred')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF store3_id IS NOT NULL THEN
    INSERT INTO public.appointments (store_id, customer_email, customer_name, customer_phone, appointment_date, duration_minutes, appointment_type, status, notes)
    VALUES 
      (store3_id, 'david.garcia@email.com', 'David Garcia', '+1-555-0301', NOW() + INTERVAL '2 days', 120, 'group_session', 'confirmed', 'Corporate team building'),
      (store3_id, 'lisa.rodriguez@email.com', 'Lisa Rodriguez', '+1-555-0302', NOW() + INTERVAL '8 days', 60, 'court_booking', 'pending', NULL),
      (store3_id, 'james.taylor@email.com', 'James Taylor', '+1-555-0303', NOW() - INTERVAL '2 days', 60, 'coaching', 'completed', 'Technique improvement')
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Sample data created successfully!';
END $$;

-- Verify the data
SELECT 'Service Users' as table_name, COUNT(*) as count FROM public.service_users
UNION ALL
SELECT 'Owners', COUNT(*) FROM public.owners
UNION ALL
SELECT 'Stores', COUNT(*) FROM public.stores
UNION ALL
SELECT 'Orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'Appointments', COUNT(*) FROM public.appointments;

-- Show summary
SELECT 
  s.name as store_name,
  o_user.email as owner_email,
  COUNT(DISTINCT ord.id) as order_count,
  COALESCE(SUM(ord.total_price), 0) as total_revenue,
  COUNT(DISTINCT a.id) as appointment_count
FROM public.stores s
LEFT JOIN public.owners o_user ON s.owner_id = o_user.id
LEFT JOIN public.orders ord ON s.id = ord.store_id
LEFT JOIN public.appointments a ON s.id = a.store_id
GROUP BY s.id, s.name, o_user.email
ORDER BY total_revenue DESC;

-- Show upcoming appointments
SELECT 
  a.appointment_date,
  a.customer_name,
  a.appointment_type,
  a.duration_minutes,
  a.status,
  s.name as store_name
FROM public.appointments a
JOIN public.stores s ON a.store_id = s.id
WHERE a.appointment_date > NOW()
ORDER BY a.appointment_date;
