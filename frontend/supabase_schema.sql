-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create vaults table
CREATE TABLE public.vaults (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.users(id) NOT NULL,
    total_deposits DECIMAL(18, 8) DEFAULT 0,
    total_members INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create vault_members table (many-to-many relationship)
CREATE TABLE public.vault_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vault_id UUID REFERENCES public.vaults(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    deposit_amount DECIMAL(18, 8) DEFAULT 0,
    share_percentage DECIMAL(5, 2) DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vault_id, user_id)
);
-- Create transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vault_id UUID REFERENCES public.vaults(id),
    user_id UUID REFERENCES public.users(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'reward')),
    amount DECIMAL(18, 8) NOT NULL,
    tx_hash TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX idx_vault_members_vault_id ON public.vault_members(vault_id);
CREATE INDEX idx_vault_members_user_id ON public.vault_members(user_id);
CREATE INDEX idx_transactions_vault_id ON public.transactions(vault_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_tx_hash ON public.transactions(tx_hash);
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR
INSERT WITH CHECK (auth.uid() = id);
-- RLS Policies for vaults table
CREATE POLICY "Anyone can view active vaults" ON public.vaults FOR
SELECT USING (is_active = true);
CREATE POLICY "Users can create vaults" ON public.vaults FOR
INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Vault creators can update their vaults" ON public.vaults FOR
UPDATE USING (auth.uid() = creator_id);
-- RLS Policies for vault_members table
CREATE POLICY "Users can view vault memberships" ON public.vault_members FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT creator_id
            FROM public.vaults
            WHERE id = vault_id
        )
    );
CREATE POLICY "Users can join vaults" ON public.vault_members FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memberships" ON public.vault_members FOR
UPDATE USING (auth.uid() = user_id);
-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT creator_id
            FROM public.vaults
            WHERE id = vault_id
        )
    );
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.users (id, wallet_address)
VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'wallet_address', '')
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Function to update vault member count and total deposits
CREATE OR REPLACE FUNCTION public.update_vault_stats() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN
UPDATE public.vaults
SET total_members = total_members + 1,
    total_deposits = total_deposits + NEW.deposit_amount
WHERE id = NEW.vault_id;
RETURN NEW;
ELSIF TG_OP = 'UPDATE' THEN
UPDATE public.vaults
SET total_deposits = total_deposits - OLD.deposit_amount + NEW.deposit_amount
WHERE id = NEW.vault_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE public.vaults
SET total_members = total_members - 1,
    total_deposits = total_deposits - OLD.deposit_amount
WHERE id = OLD.vault_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Trigger to update vault stats
CREATE TRIGGER update_vault_stats_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON public.vault_members FOR EACH ROW EXECUTE FUNCTION public.update_vault_stats();