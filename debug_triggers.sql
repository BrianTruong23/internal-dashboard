-- ============================================
-- DEBUG STORE STATS TRIGGERS
-- ============================================

-- 1. Check if triggers exist and are enabled
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement,
  action_orientation
FROM information_schema.triggers
WHERE trigger_name LIKE '%store_stats%'
ORDER BY event_object_table, trigger_name;

-- 2. Check if the function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name LIKE '%store_stats%'
ORDER BY routine_name;

-- 3. Test the function directly with a known store_id
-- Replace with your actual store_id
SELECT update_store_stats('6aab4a51-0d89-47ee-b853-2f29dca2d480');

-- 4. Check the result
SELECT * FROM store_stats WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- 5. Check for any Postgres logs/errors (this might not show in SQL editor)
-- You may need to check Supabase logs in the dashboard

-- 6. Manually insert a test order and see what happens
-- Get the current stats before
SELECT 
  'BEFORE INSERT' as timing,
  total_revenue,
  total_orders,
  total_products_sold,
  updated_at
FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- Insert a test order
INSERT INTO orders (store_id, customer_email, customer_name, total_price, currency, status)
VALUES ('6aab4a51-0d89-47ee-b853-2f29dca2d480', 'debug@test.com', 'Debug Test', 50.00, 'USD', 'paid')
RETURNING id, store_id, total_price;

-- Check stats after
SELECT 
  'AFTER INSERT' as timing,
  total_revenue,
  total_orders,
  total_products_sold,
  updated_at
FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';
