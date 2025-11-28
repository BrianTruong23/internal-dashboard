-- Fetch the definitions of the suspicious functions
-- Run this in the Supabase SQL Editor

SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name IN ('insert_owner_from_service_user', 'handle_new_service_user');
