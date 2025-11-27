-- ============================================
-- FIXED STORE STATS TRIGGERS (V2)
-- This version uses SECURITY DEFINER to bypass RLS issues
-- ============================================

-- Drop old triggers and function first
DROP TRIGGER IF EXISTS orders_update_store_stats ON orders;
DROP TRIGGER IF EXISTS order_products_update_store_stats ON order_products;
DROP FUNCTION IF EXISTS trigger_update_store_stats_from_orders();
DROP FUNCTION IF EXISTS trigger_update_store_stats_from_order_products();
DROP FUNCTION IF EXISTS update_store_stats(UUID);

-- Create improved function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION update_store_stats(target_store_id UUID)
RETURNS VOID 
SECURITY DEFINER -- This allows the function to bypass RLS policies
SET search_path = public
AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_total_orders INTEGER;
  v_total_products_sold INTEGER;
BEGIN
  -- Calculate stats with explicit NULL handling
  SELECT 
    COALESCE(SUM(o.total_price), 0),
    COALESCE(COUNT(DISTINCT o.id), 0),
    COALESCE(SUM(op.quantity), 0)
  INTO v_total_revenue, v_total_orders, v_total_products_sold
  FROM orders o
  LEFT JOIN order_products op ON op.order_id = o.id
  WHERE o.store_id = target_store_id;

  -- Insert or update the stats
  INSERT INTO store_stats (store_id, total_revenue, total_orders, total_products_sold, updated_at)
  VALUES (target_store_id, v_total_revenue, v_total_orders, v_total_products_sold, NOW())
  ON CONFLICT (store_id) 
  DO UPDATE SET
    total_revenue = v_total_revenue,
    total_orders = v_total_orders,
    total_products_sold = v_total_products_sold,
    updated_at = NOW();

  -- Log the update for debugging
  RAISE NOTICE 'Updated stats for store %: revenue=%, orders=%, products=%', 
    target_store_id, v_total_revenue, v_total_orders, v_total_products_sold;

EXCEPTION
  WHEN others THEN
    -- Log any errors
    RAISE WARNING 'Error updating store stats for store %: %', target_store_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for orders table
CREATE OR REPLACE FUNCTION trigger_update_store_stats_from_orders()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM update_store_stats(NEW.store_id);
    RETURN NEW;
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM update_store_stats(OLD.store_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in orders trigger: %', SQLERRM;
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for order_products table
CREATE OR REPLACE FUNCTION trigger_update_store_stats_from_order_products()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_store_id UUID;
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    affected_store_id := NEW.store_id;
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    affected_store_id := OLD.store_id;
  END IF;
  
  PERFORM update_store_stats(affected_store_id);
  
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in order_products trigger: %', SQLERRM;
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER orders_update_store_stats
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_store_stats_from_orders();

CREATE TRIGGER order_products_update_store_stats
  AFTER INSERT OR UPDATE OR DELETE ON order_products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_store_stats_from_order_products();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_store_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_store_stats_from_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_store_stats_from_order_products() TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Store stats triggers (V2) created successfully with SECURITY DEFINER!';
END $$;

-- Verify triggers are created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%store_stats%'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- COMPLETE TEST EXAMPLE
-- ============================================

/*
-- Uncomment and run this to test the triggers with a complete order + products

-- Check stats before
SELECT 'BEFORE' as timing, * FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- Insert an order
INSERT INTO orders (store_id, customer_email, customer_name, total_price, currency, status)
VALUES ('6aab4a51-0d89-47ee-b853-2f29dca2d480', 'newcustomer@test.com', 'New Customer', 199.97, 'USD', 'paid')
RETURNING id, total_price;

-- Insert products for that order (replace ORDER_ID with the ID from above)
-- INSERT INTO order_products (order_id, store_id, product_name, quantity, unit_price, currency)
-- VALUES 
--   ('ORDER_ID', '6aab4a51-0d89-47ee-b853-2f29dca2d480', 'Premium Racket', 1, 149.99, 'USD'),
--   ('ORDER_ID', '6aab4a51-0d89-47ee-b853-2f29dca2d480', 'Shuttlecock Set', 2, 24.99, 'USD');

-- Check stats after - should show increased revenue, orders, and products
SELECT 'AFTER' as timing, * FROM store_stats 
WHERE store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

*/
