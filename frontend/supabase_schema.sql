-- Improvements applied: use a public.profiles table (do not create a new auth.users table), use bigint identity PKs on public tables, reference profiles.id for FKs, enable RLS with clear policies, add indexes for FKs, and make trigger functions secure and explicit.

-- NOTE: pgcrypto is already installed in the project; no need to create the extension here.

-- 1) Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 2) Vaults
CREATE TABLE IF NOT EXISTS public.vaults (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  description text,
  creator_profile_id bigint NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  total_deposits numeric(18,8) DEFAULT 0,
  total_members integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vaults_creator_profile_id ON public.vaults(creator_profile_id);

-- 3) Vault members
CREATE TABLE IF NOT EXISTS public.vault_members (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vault_id bigint NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  profile_id bigint NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deposit_amount numeric(18,8) DEFAULT 0,
  share_percentage numeric(5,2) DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE (vault_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_vault_members_vault_id ON public.vault_members(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_members_profile_id ON public.vault_members(profile_id);

-- 4) Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vault_id bigint REFERENCES public.vaults(id) ON DELETE SET NULL,
  profile_id bigint REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('deposit','withdraw','reward')),
  amount numeric(18,8) NOT NULL,
  tx_hash text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_vault_id ON public.transactions(vault_id);
CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON public.transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON public.transactions(tx_hash);

-- 5) Enable Row Level Security on API tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6) RLS policies
-- Profiles: users can manage their own profile
CREATE POLICY "Profiles: select own" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Profiles: insert own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Profiles: update own" ON public.profiles
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- Vaults: public can read active vaults, creators can manage
CREATE POLICY "Vaults: select active" ON public.vaults
  FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Vaults: insert by creator" ON public.vaults
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = creator_profile_id));
CREATE POLICY "Vaults: update by creator" ON public.vaults
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = creator_profile_id)) WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = creator_profile_id));

-- Vault members: members and vault creators can view; members can insert/update their row
CREATE POLICY "VaultMembers: select member or creator" ON public.vault_members
  FOR SELECT TO authenticated USING (
    (SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id)
    OR (SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = (SELECT creator_profile_id FROM public.vaults WHERE id = vault_id))
  );
CREATE POLICY "VaultMembers: insert self" ON public.vault_members
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "VaultMembers: update self" ON public.vault_members
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id)) WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- Transactions: members and creators can view; members can insert their own
CREATE POLICY "Transactions: select member or creator" ON public.transactions
  FOR SELECT TO authenticated USING (
    (SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id)
    OR (SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = (SELECT creator_profile_id FROM public.vaults WHERE id = vault_id))
  );
CREATE POLICY "Transactions: insert self" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- 7) Trigger: create profile on signup (secure function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
begin
  -- keep search_path empty for security
  PERFORM set_config('search_path', '', false);
  INSERT INTO public.profiles (user_id, wallet_address)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'wallet_address',''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Trigger: keep vault stats updated (use profile-based totals)
CREATE OR REPLACE FUNCTION public.update_vault_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM set_config('search_path', '', false);
  IF TG_OP = 'INSERT' THEN
    UPDATE public.vaults
    SET total_members = total_members + 1,
        total_deposits = total_deposits + NEW.deposit_amount
    WHERE id = NEW.vault_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.vaults
    SET total_deposits = total_deposits - COALESCE(OLD.deposit_amount,0) + COALESCE(NEW.deposit_amount,0)
    WHERE id = NEW.vault_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vaults
    SET total_members = total_members - 1,
        total_deposits = total_deposits - COALESCE(OLD.deposit_amount,0)
    WHERE id = OLD.vault_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public.update_vault_stats() FROM anon, authenticated;

DROP TRIGGER IF EXISTS update_vault_stats_trigger ON public.vault_members;
CREATE TRIGGER update_vault_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vault_members
  FOR EACH ROW EXECUTE FUNCTION public.update_vault_stats();