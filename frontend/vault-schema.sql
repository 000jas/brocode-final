-- Vault Creation Schema for Supabase
-- This schema creates a vaults table that matches the requirements:
-- - One vault per user_address (unique constraint)
-- - Unique vault_name globally
-- - Initial deposit validation (>= 5 SHM)

-- Drop existing vaults table if it exists (since we need to restructure)
DROP TABLE IF EXISTS public.vaults CASCADE;

-- Create the new vaults table with the required structure
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL UNIQUE, -- One vault per user
  vault_name TEXT NOT NULL UNIQUE,   -- Unique vault name globally
  description TEXT,                  -- Optional description
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  initial_deposit NUMERIC(18,8) NOT NULL CHECK (initial_deposit >= 5) -- Must be >= 5 SHM
);

-- Create indexes for better performance
CREATE INDEX idx_vaults_user_address ON public.vaults(user_address);
CREATE INDEX idx_vaults_vault_name ON public.vaults(vault_name);
CREATE INDEX idx_vaults_created_at ON public.vaults(created_at);

-- Enable Row Level Security
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vaults table
-- Allow public read access to all vaults (for global visibility)
CREATE POLICY "Vaults: public read access" ON public.vaults
  FOR SELECT TO public USING (true);

-- Allow authenticated users to insert their own vault
CREATE POLICY "Vaults: insert own vault" ON public.vaults
  FOR INSERT TO authenticated WITH CHECK (true); -- We'll validate in the application

-- Allow users to update their own vault (if needed)
CREATE POLICY "Vaults: update own vault" ON public.vaults
  FOR UPDATE TO authenticated USING (true); -- We'll validate in the application

-- Create a function to check if user already has a vault
CREATE OR REPLACE FUNCTION public.user_has_vault(user_addr TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.vaults 
    WHERE user_address = user_addr
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if vault name is unique
CREATE OR REPLACE FUNCTION public.is_vault_name_unique(vault_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.vaults 
    WHERE vault_name = vault_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.user_has_vault(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_vault_name_unique(TEXT) TO authenticated;
