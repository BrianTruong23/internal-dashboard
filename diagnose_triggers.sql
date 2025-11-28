-- Diagnostic script to find the problematic trigger
-- Run this in the Supabase SQL Editor

-- 1. List all triggers on the service_users table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_orientation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'service_users';

-- 2. List all triggers on the auth.users table (if accessible)
-- Note: You might not have permission to view auth schema triggers directly via this view depending on your role,
-- but it's worth a try.
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 3. Find functions that reference 'owners' and 'store_id'
SELECT 
  routine_name,
  routine_schema
FROM information_schema.routines
WHERE routine_definition LIKE '%owners%'
AND routine_definition LIKE '%store_id%';

-- 4. Show the definition of any function found in step 3 (replace FUNCTION_NAME manually if found)
-- For example:
-- SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'FUNCTION_NAME';
