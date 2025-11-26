-- Populate store_stats with aggregated data from orders
-- Run this AFTER creating orders in seed_sample_data.sql

-- Generate daily stats for the last 30 days
DO $$
DECLARE
  store_record RECORD;
  day_offset INTEGER;
  current_date DATE;
BEGIN
  -- For each store, generate stats for the last 30 days
  FOR store_record IN SELECT id FROM public.stores LOOP
    FOR day_offset IN 0..29 LOOP
      current_date := CURRENT_DATE - day_offset;
      
      INSERT INTO public.store_stats (store_id, date, revenue, products_sold, total_orders)
      SELECT 
        store_record.id,
        current_date,
        COALESCE(SUM(o.total_price), 0) + (RANDOM() * 200)::NUMERIC(10,2), -- Base + random variance
        COALESCE(COUNT(o.id), 0) + FLOOR(RANDOM() * 10)::INTEGER, -- Base + random variance
        COALESCE(COUNT(o.id), 0) + FLOOR(RANDOM() * 5)::INTEGER -- Base + random variance
      FROM public.orders o
      WHERE o.store_id = store_record.id
        AND DATE(o.created_at) = current_date
      ON CONFLICT (store_id, date) DO UPDATE
      SET 
        revenue = EXCLUDED.revenue,
        products_sold = EXCLUDED.products_sold,
        total_orders = EXCLUDED.total_orders;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Store stats populated successfully for all stores!';
END $$;

-- Verify store_stats
SELECT 
  s.name as store_name,
  COUNT(ss.id) as days_tracked,
  SUM(ss.revenue) as total_revenue,
  SUM(ss.products_sold) as total_products,
  SUM(ss.total_orders) as total_orders
FROM public.store_stats ss
JOIN public.stores s ON ss.store_id = s.id
GROUP BY s.id, s.name
ORDER BY total_revenue DESC;
