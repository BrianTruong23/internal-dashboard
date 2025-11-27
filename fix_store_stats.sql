-- ============================================
-- FIX STORE STATS FOR ALL STORES
-- This will insert or update the store_stats table with correct aggregated data
-- ============================================

-- First, let's see what we have before the fix
SELECT 
  'BEFORE FIX' as status,
  s.id as store_id,
  s.name as store_name,
  COALESCE(ss.total_revenue, 0) as current_total_revenue,
  COALESCE(ss.total_orders, 0) as current_total_orders,
  COALESCE(ss.total_products_sold, 0) as current_total_products_sold
FROM stores s
LEFT JOIN store_stats ss ON s.id = ss.store_id
ORDER BY s.name;

-- Now insert or update the store_stats table with correct data
INSERT INTO store_stats (store_id, total_revenue, total_orders, total_products_sold, updated_at)
SELECT 
  s.id as store_id,
  COALESCE(SUM(o.total_price), 0) as total_revenue,
  COALESCE(COUNT(DISTINCT o.id), 0) as total_orders,
  COALESCE(SUM(op.quantity), 0) as total_products_sold,
  NOW() as updated_at
FROM stores s
LEFT JOIN orders o ON o.store_id = s.id
LEFT JOIN order_products op ON op.order_id = o.id
GROUP BY s.id
ON CONFLICT (store_id) 
DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  total_orders = EXCLUDED.total_orders,
  total_products_sold = EXCLUDED.total_products_sold,
  updated_at = EXCLUDED.updated_at;

-- Verify the fix
SELECT 
  'AFTER FIX' as status,
  s.id as store_id,
  s.name as store_name,
  ss.total_revenue,
  ss.total_orders,
  ss.total_products_sold,
  ss.updated_at
FROM stores s
JOIN store_stats ss ON s.id = ss.store_id
ORDER BY s.name;

-- Specifically check t@gmail.com's store
SELECT 
  'T@GMAIL.COM STORE' as status,
  s.id as store_id,
  s.name as store_name,
  ss.total_revenue,
  ss.total_orders,
  ss.total_products_sold,
  au.email as owner_email
FROM stores s
JOIN store_stats ss ON s.id = ss.store_id
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com';
