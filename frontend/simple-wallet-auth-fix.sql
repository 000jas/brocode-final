-- Simple wallet authentication fix
-- This allows wallet-only profiles without requiring Supabase auth

-- 1) Allow user_id to be null for wallet-only profiles
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- 2) Drop existing restrictive policies
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;

-- 3) Create permissive policies for wallet-only profiles
-- Allow public to read all profiles
CREATE POLICY "Profiles: public read" ON public.profiles
  FOR SELECT TO public USING (true);

-- Allow public to insert profiles with wallet address
CREATE POLICY "Profiles: public insert" ON public.profiles
  FOR INSERT TO public WITH CHECK (wallet_address IS NOT NULL);

-- Allow public to update profiles by wallet address
CREATE POLICY "Profiles: public update" ON public.profiles
  FOR UPDATE TO public USING (wallet_address IS NOT NULL) 
  WITH CHECK (wallet_address IS NOT NULL);

-- 4) Create a simple function to get or create profile
CREATE OR REPLACE FUNCTION public.upsert_profile_by_wallet(wallet_addr text)
RETURNS public.profiles AS $$
DECLARE
  profile_record public.profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE wallet_address = wallet_addr;
  
  -- If not found, create new one
  IF NOT FOUND THEN
    INSERT INTO public.profiles (wallet_address, user_id)
    VALUES (wallet_addr, NULL)
    RETURNING * INTO profile_record;
  END IF;
  
  RETURN profile_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.upsert_profile_by_wallet(text) TO public;
