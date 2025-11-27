-- ==========================================
-- MIGRATION: ADD NAME TO SERVICE_USERS
-- ==========================================

-- 1. Add name column to service_users table
ALTER TABLE public.service_users 
ADD COLUMN IF NOT EXISTS name text;

-- 2. Update the handle_new_user function to capture name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.service_users (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'owner')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. (Optional) Backfill name for existing users from auth.users metadata
-- This requires permissions to read auth.users. If this fails, ignore it.
DO $$
BEGIN
  UPDATE public.service_users su
  SET name = au.raw_user_meta_data->>'name'
  FROM auth.users au
  WHERE su.id = au.id
  AND su.name IS NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not backfill names from auth.users due to permissions. New users will work fine.';
END $$;
