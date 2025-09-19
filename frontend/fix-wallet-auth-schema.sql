-- Fix schema to support wallet-only authentication
-- This allows profiles to exist without requiring Supabase auth

-- 1) Modify profiles table to allow null user_id for wallet-only profiles
ALTER TABLE public.profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- 2) Update RLS policies to allow wallet-only profiles
-- Drop existing policies
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;

-- Create new policies that support wallet-only profiles
-- Allow public to read profiles by wallet address
CREATE POLICY "Profiles: select by wallet" ON public.profiles
  FOR SELECT TO public USING (true);

-- Allow public to insert profiles with wallet address
CREATE POLICY "Profiles: insert wallet" ON public.profiles
  FOR INSERT TO public WITH CHECK (wallet_address IS NOT NULL);

-- Allow public to update profiles by wallet address
CREATE POLICY "Profiles: update by wallet" ON public.profiles
  FOR UPDATE TO public USING (wallet_address IS NOT NULL) 
  WITH CHECK (wallet_address IS NOT NULL);

-- 3) Create a function to get or create profile by wallet address
CREATE OR REPLACE FUNCTION public.get_or_create_profile_by_wallet(wallet_addr text)
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
GRANT EXECUTE ON FUNCTION public.get_or_create_profile_by_wallet(text) TO public;
