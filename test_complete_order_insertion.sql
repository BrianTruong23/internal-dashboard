-- ============================================
-- COMPLETE TEST: Insert Order with Products
-- This tests that store_stats updates when both orders and order_products are inserted
-- ============================================

-- Step 1: Check current stats BEFORE insertion
SELECT 
  'BEFORE INSERTION' as timing,
  total_revenue,
  total_orders,
  total_products_sold,
  updated_at
FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- Step 2: Insert a new order
INSERT INTO orders (store_id, customer_email, customer_name, total_price, currency, status)
VALUES ('6aab4a51-0d89-47ee-b853-2f29dca2d480', 'testcustomer@example.com', 'Test Customer', 299.99, 'USD', 'paid')
RETURNING id as order_id, store_id, customer_name, total_price;

-- Step 3: Get the order ID (you'll need to note this from the result above)
-- For automation, we'll use a variable
DO $$
DECLARE
  new_order_id UUID;
BEGIN
  -- Get the most recent order for this store
  SELECT id INTO new_order_id 
  FROM orders 
  WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480' 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Insert order products for this order
  INSERT INTO order_products (order_id, store_id, product_name, sku, quantity, unit_price, currency)
  VALUES 
    (new_order_id, '6aab4a51-0d89-47ee-b853-2f29dca2d480', 'Badminton Racket Pro', 'RAC-001', 2, 99.99, 'USD'),
    (new_order_id, '6aab4a51-0d89-47ee-b853-2f29dca2d480', 'Shuttlecocks Pack', 'SHU-001', 3, 33.33, 'USD');
  
  RAISE NOTICE 'Inserted order % with products', new_order_id;
END $$;

-- Step 4: Check stats AFTER insertion  
SELECT 
  'AFTER INSERTION' as timing,
  total_revenue,
  total_orders,
  total_products_sold,
  updated_at
FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- Step 5: Verify the calculation manually
SELECT 
  'MANUAL VERIFICATION' as check_type,
  COUNT(DISTINCT o.id) as orders_count,
  SUM(o.total_price) as total_revenue_sum,
  SUM(op.quantity) as total_products_count
FROM orders o
LEFT JOIN order_products op ON o.id = op.order_id
WHERE o.store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- Step 6: Show the most recent orders with their products
SELECT 
  'RECENT ORDERS' as info,
  o.id as order_id,
  o.customer_name,
  o.total_price as order_total,
  o.created_at,
  COUNT(op.id) as product_count,
  SUM(op.quantity) as total_items
FROM orders o
LEFT JOIN order_products op ON o.id = op.order_id
WHERE o.store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480'
GROUP BY o.id, o.customer_name, o.total_price, o.created_at
ORDER BY o.created_at DESC
LIMIT 5;
