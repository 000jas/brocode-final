-- Fix RLS policies for profiles table
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
DROP POLICY IF EXISTS "Allow public access" ON public.profiles;

-- Create more permissive policies for wallet-based auth
CREATE POLICY "Allow public profile creation" ON public.profiles
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow public profile reading" ON public.profiles
  FOR SELECT TO anon 
  USING (true);

CREATE POLICY "Allow profile updates by wallet" ON public.profiles
  FOR UPDATE TO anon 
  USING (true) 
  WITH CHECK (true);

-- Optional: Create a more secure policy that validates wallet ownership
-- (Uncomment if you want to add signature verification later)
/*
CREATE POLICY "Allow profile creation with wallet proof" ON public.profiles
  FOR INSERT TO anon 
  WITH CHECK (
    wallet_address IS NOT NULL 
    AND length(wallet_address) = 42 
    AND wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  );
*/
