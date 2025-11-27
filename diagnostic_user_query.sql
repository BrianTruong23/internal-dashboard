-- Diagnostic query to check data for t@gmail.com user
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Find the user ID for t@gmail.com
SELECT 
  'User Info' as query_type,
  su.id as user_id,
  su.role,
  au.email
FROM service_users su
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com';

-- 2. Check if user exists in owners table
SELECT 
  'Owner Record' as query_type,
  o.id,
  o.email,
  o.name,
  o.created_at
FROM owners o
WHERE o.email = 't@gmail.com';

-- 3. Find stores owned by this user (using the ID from step 1)
SELECT 
  'Stores Owned' as query_type,
  s.id as store_id,
  s.name as store_name,
  s.owner_id,
  s.created_at,
  au.email as owner_email
FROM stores s
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com';

-- 4. Check store_stats for those stores
SELECT 
  'Store Stats' as query_type,
  ss.store_id,
  s.name as store_name,
  ss.total_revenue,
  ss.total_orders,
  ss.total_products_sold,
  ss.updated_at
FROM store_stats ss
JOIN stores s ON ss.store_id = s.id
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com';

-- 5. Check actual orders for those stores
SELECT 
  'Actual Orders' as query_type,
  o.id as order_id,
  o.store_id,
  s.name as store_name,
  o.customer_email,
  o.customer_name,
  o.total_price,
  o.status,
  o.created_at
FROM orders o
JOIN stores s ON o.store_id = s.id
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com'
ORDER BY o.created_at DESC;

-- 6. Check order products for those stores
SELECT 
  'Order Products' as query_type,
  op.id,
  op.order_id,
  op.store_id,
  s.name as store_name,
  op.product_name,
  op.quantity,
  op.unit_price,
  op.line_total
FROM order_products op
JOIN stores s ON op.store_id = s.id
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
WHERE au.email = 't@gmail.com';

-- 7. Manual calculation of what the stats SHOULD be
SELECT 
  'Expected Stats (Manual Calc)' as query_type,
  s.id as store_id,
  s.name as store_name,
  COALESCE(SUM(o.total_price), 0) as calculated_revenue,
  COUNT(o.id) as calculated_orders,
  COALESCE(SUM(op.quantity), 0) as calculated_products_sold
FROM stores s
JOIN service_users su ON s.owner_id = su.id
JOIN auth.users au ON su.id = au.id
LEFT JOIN orders o ON o.store_id = s.id
LEFT JOIN order_products op ON op.order_id = o.id
WHERE au.email = 't@gmail.com'
GROUP BY s.id, s.name;
