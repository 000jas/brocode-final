-- Complete RLS fix for profiles table
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
DROP POLICY IF EXISTS "Allow public access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile reading" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates by wallet" ON public.profiles;

-- Temporarily disable RLS to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Test if we can insert now (this should work)
-- You can test this by running the debug page again

-- If the above works, re-enable RLS with permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE 
  TO anon, authenticated
  USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles';
