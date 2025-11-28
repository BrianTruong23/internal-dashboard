-- Fix for the registration error
-- Run this in the Supabase SQL Editor

-- 1. Redefine handle_new_service_user to NOT insert store_id into owners
CREATE OR REPLACE FUNCTION handle_new_service_user()
RETURNS TRIGGER AS $$
DECLARE
  v_email     text;
  v_store_id  uuid;
  v_full_name text;
BEGIN
  -- Fetch details from auth.users based on the new service_user id
  SELECT 
    u.email, 
    (u.raw_user_meta_data->>'store_id')::uuid, 
    u.raw_user_meta_data->>'full_name'
  INTO v_email, v_store_id, v_full_name
  FROM auth.users AS u
  WHERE u.id = NEW.id;

  -- If for some reason we can't find the auth user, just skip
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- 1. If role is 'client', insert into public.clients
  IF NEW.role = 'client' THEN
    INSERT INTO public.clients (id, store_id, email, name, created_at)
    VALUES (
      NEW.id,
      v_store_id,
      v_email,
      v_full_name,
      COALESCE(NEW.created_at, now())
    )
    ON CONFLICT (id) DO NOTHING;

  -- 2. If role is 'owner', insert into public.owners
  ELSIF NEW.role = 'owner' THEN
    -- FIXED: Removed store_id from insert as owners table doesn't have it
    INSERT INTO public.owners (id, email, name, created_at)
    VALUES (
      NEW.id,
      v_email,
      v_full_name,
      COALESCE(NEW.created_at, now())
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Drop the problematic insert_owner_from_service_user trigger if it exists
-- We use a DO block to find and drop it dynamically
DO $$
DECLARE
  trig_rec RECORD;
BEGIN
  FOR trig_rec IN 
    SELECT trigger_name 
    FROM information_schema.triggers
    WHERE event_object_table = 'service_users'
    AND action_statement LIKE '%insert_owner_from_service_user%'
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trig_rec.trigger_name) || ' ON public.service_users';
    RAISE NOTICE 'Dropped problematic trigger: %', trig_rec.trigger_name;
  END LOOP;
END $$;

-- 3. Also drop the function itself to avoid confusion
DROP FUNCTION IF EXISTS insert_owner_from_service_user();

DO $$
BEGIN
  RAISE NOTICE 'Fixed handle_new_service_user and cleaned up old triggers.';
END $$;
