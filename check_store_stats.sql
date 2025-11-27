-- Check what's currently in store_stats for t@gmail.com's store
SELECT 
  'Current Store Stats' as query_type,
  ss.store_id,
  s.name as store_name,
  ss.total_revenue,
  ss.total_orders,
  ss.total_products_sold,
  ss.updated_at
FROM store_stats ss
JOIN stores s ON ss.store_id = s.id
WHERE ss.store_id = '6aab4a51-0d89-47ee-b853-2f29dca2d480';

-- If no results above, the store_stats row doesn't exist for this store!
