-- ============================================
-- INSERT PRODUCTS INTO order_products TABLE
-- Replace ORDER_ID and STORE_ID with your actual IDs
-- ============================================

-- Example: Insert products for a specific order
-- First, you need an order_id. Get it from your orders table:
-- SELECT id, customer_name, total_price FROM orders ORDER BY created_at DESC LIMIT 5;

-- OPTION 1: Insert products for a specific order (replace the IDs)
INSERT INTO order_products (
  order_id, 
  store_id, 
  product_name, 
  sku, 
  quantity, 
  unit_price, 
  currency
)
VALUES 
  -- Replace 'YOUR_ORDER_ID_HERE' and 'YOUR_STORE_ID_HERE' with actual UUIDs
  ('YOUR_ORDER_ID_HERE', 'YOUR_STORE_ID_HERE', 'Badminton Racket Pro', 'RAC-001', 1, 149.99, 'USD'),
  ('YOUR_ORDER_ID_HERE', 'YOUR_STORE_ID_HERE', 'Shuttlecock Pack (12 pcs)', 'SHU-012', 2, 24.99, 'USD'),
  ('YOUR_ORDER_ID_HERE', 'YOUR_STORE_ID_HERE', 'Badminton Net Professional', 'NET-001', 1, 89.99, 'USD'),
  ('YOUR_ORDER_ID_HERE', 'YOUR_STORE_ID_HERE', 'Racket Grip Tape', 'GRIP-001', 3, 5.99, 'USD');

-- OPTION 2: Insert products for t@gmail.com's store (automated)
-- This will get the latest order and add products to it
DO $$
DECLARE
  v_order_id UUID;
  v_store_id UUID;
BEGIN
  -- Get the most recent order for t@gmail.com's store
  SELECT o.id, o.store_id INTO v_order_id, v_store_id
  FROM orders o
  JOIN stores s ON o.store_id = s.id
  JOIN service_users su ON s.owner_id = su.id
  JOIN auth.users au ON su.id = au.id
  WHERE au.email = 't@gmail.com'
  ORDER BY o.created_at DESC
  LIMIT 1;
  
  -- Insert products for this order
  IF v_order_id IS NOT NULL THEN
    INSERT INTO order_products (order_id, store_id, product_name, sku, quantity, unit_price, currency)
    VALUES 
      (v_order_id, v_store_id, 'Badminton Racket Pro', 'RAC-001', 2, 149.99, 'USD'),
      (v_order_id, v_store_id, 'Shuttlecock Pack (12 pcs)', 'SHU-012', 3, 24.99, 'USD'),
      (v_order_id, v_store_id, 'Court Shoes Premium', 'SHOE-001', 1, 89.99, 'USD');
    
    RAISE NOTICE 'Added products to order: %', v_order_id;
  ELSE
    RAISE NOTICE 'No orders found for t@gmail.com';
  END IF;
END $$;

-- OPTION 3: Complete example - Create order AND add products in one go
DO $$
DECLARE
  v_order_id UUID;
  v_store_id UUID := '6aab4a51-0d89-47ee-b853-2f29dca2d480'; -- Replace with your store ID
BEGIN
  -- Create a new order
  INSERT INTO orders (store_id, customer_email, customer_name, total_price, currency, status)
  VALUES (v_store_id, 'customer@example.com', 'John Smith', 459.94, 'USD', 'paid')
  RETURNING id INTO v_order_id;
  
  -- Add products to this order
  INSERT INTO order_products (order_id, store_id, product_name, sku, quantity, unit_price, currency)
  VALUES 
    (v_order_id, v_store_id, 'Badminton Racket Pro', 'RAC-001', 2, 149.99, 'USD'),
    (v_order_id, v_store_id, 'Shuttlecock Pack (12 pcs)', 'SHU-012', 3, 24.99, 'USD'),
    (v_order_id, v_store_id, 'Badminton Net Professional', 'NET-001', 1, 89.99, 'USD');
  
  RAISE NOTICE 'Created order % with products', v_order_id;
END $$;

-- Verify the insertion and check if store_stats updated
SELECT 
  'Order Products' as type,
  op.id,
  op.product_name,
  op.quantity,
  op.unit_price,
  op.line_total,
  o.customer_name,
  o.total_price as order_total
FROM order_products op
JOIN orders o ON op.order_id = o.id
WHERE op.store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480'
ORDER BY op.created_at DESC
LIMIT 10;

-- Check if store_stats was updated by the trigger
SELECT 
  'Updated Store Stats' as type,
  total_revenue,
  total_orders,
  total_products_sold,
  updated_at
FROM store_stats
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';
