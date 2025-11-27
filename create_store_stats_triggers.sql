-- ============================================
-- AUTOMATED STORE STATS TRIGGERS
-- This creates triggers to automatically update store_stats 
-- whenever orders or order_products are inserted/updated/deleted
-- ============================================

-- Function to recalculate and update store_stats for a given store
CREATE OR REPLACE FUNCTION update_store_stats(target_store_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO store_stats (store_id, total_revenue, total_orders, total_products_sold, updated_at)
  SELECT 
    target_store_id,
    COALESCE(SUM(o.total_price), 0) as total_revenue,
    COALESCE(COUNT(DISTINCT o.id), 0) as total_orders,
    COALESCE(SUM(op.quantity), 0) as total_products_sold,
    NOW() as updated_at
  FROM stores s
  LEFT JOIN orders o ON o.store_id = s.id
  LEFT JOIN order_products op ON op.order_id = o.id
  WHERE s.id = target_store_id
  GROUP BY s.id
  ON CONFLICT (store_id) 
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_orders = EXCLUDED.total_orders,
    total_products_sold = EXCLUDED.total_products_sold,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for orders table
CREATE OR REPLACE FUNCTION trigger_update_store_stats_from_orders()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql;

-- Trigger function for order_products table
CREATE OR REPLACE FUNCTION trigger_update_store_stats_from_order_products()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS orders_update_store_stats ON orders;
DROP TRIGGER IF EXISTS order_products_update_store_stats ON order_products;

-- Create trigger on orders table
CREATE TRIGGER orders_update_store_stats
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_store_stats_from_orders();

-- Create trigger on order_products table
CREATE TRIGGER order_products_update_store_stats
  AFTER INSERT OR UPDATE OR DELETE ON order_products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_store_stats_from_order_products();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Store stats triggers created successfully!';
  RAISE NOTICE 'The store_stats table will now be automatically updated when:';
  RAISE NOTICE '  - Orders are inserted, updated, or deleted';
  RAISE NOTICE '  - Order products are inserted, updated, or deleted';
END $$;

-- Test: Show current triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%store_stats%'
ORDER BY event_object_table, trigger_name;
