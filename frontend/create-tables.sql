--  Micro-Mint Database Setup for Supabase
-- Copy and paste this entire content into your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Ethereum wallet address
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  apy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_deposits DECIMAL(18,8) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- User vault investments
CREATE TABLE IF NOT EXISTS user_vaults (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
  amount DECIMAL(18,8) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vault_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
  amount DECIMAL(18,8) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  tx_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_vaults_user_id ON user_vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vaults_vault_id ON user_vaults(vault_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vault_id ON transactions(vault_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_vaults_updated_at ON user_vaults;
CREATE TRIGGER update_user_vaults_updated_at BEFORE UPDATE ON user_vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for easier querying
CREATE OR REPLACE VIEW user_portfolio AS
SELECT 
  u.id as user_id,
  u.wallet_address,
  COALESCE(SUM(uv.amount), 0) as total_invested,
  COUNT(DISTINCT uv.vault_id) as active_vaults,
  COALESCE(AVG(v.apy), 0) as avg_apy
FROM users u
LEFT JOIN user_vaults uv ON u.id = uv.user_id
LEFT JOIN vaults v ON uv.vault_id = v.id
GROUP BY u.id, u.wallet_address;

CREATE OR REPLACE VIEW vault_performance AS
SELECT 
  v.id as vault_id,
  v.name,
  v.apy,
  v.total_deposits,
  COUNT(DISTINCT uv.user_id) as total_users,
  COALESCE(SUM(uv.amount), 0) as user_deposits
FROM vaults v
LEFT JOIN user_vaults uv ON v.id = uv.vault_id
GROUP BY v.id, v.name, v.apy, v.total_deposits;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can view own vaults" ON user_vaults;
CREATE POLICY "Users can view own vaults" ON user_vaults
  FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (auth.uid()::text = user_id);

-- Allow public read access to vaults
DROP POLICY IF EXISTS "Vaults are publicly readable" ON vaults;
CREATE POLICY "Vaults are publicly readable" ON vaults
  FOR SELECT USING (true);

-- Insert sample vault for testing
INSERT INTO vaults (name, description, apy, total_deposits) VALUES
('Shardeum DeFi Vault', 'High-yield DeFi strategies on Shardeum network. Automated yield farming with minimal risk and maximum returns.', 12.50, 0.00),
('Yield Farming Pool', 'Automated yield farming with minimal risk and maximum returns through various DeFi protocols.', 8.20, 0.00),
('Liquidity Mining', 'Provide liquidity to various pools and earn rewards through automated strategies.', 6.80, 0.00)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT ' Micro-Mint database setup completed successfully!' as message;
