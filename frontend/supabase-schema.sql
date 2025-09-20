-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vaults table
CREATE TABLE IF NOT EXISTS vaults (
    id BIGINT PRIMARY KEY,
    name TEXT,
    description TEXT,
    apy DECIMAL(10,2) DEFAULT 0,
    total_deposits TEXT DEFAULT '0', -- Using TEXT for big numbers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vault_id BIGINT REFERENCES vaults(id) ON DELETE CASCADE,
    amount TEXT NOT NULL, -- Using TEXT for big numbers
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'vault_created', 'authorized_withdrawer_set')),
    tx_hash TEXT UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_vaults table for tracking user balances
CREATE TABLE IF NOT EXISTS user_vaults (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vault_id BIGINT REFERENCES vaults(id) ON DELETE CASCADE,
    amount TEXT DEFAULT '0', -- Using TEXT for big numbers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, vault_id)
);

-- Create contract_events table for tracking all contract events
CREATE TABLE IF NOT EXISTS contract_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_data JSONB NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    block_timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vault_id ON transactions(vault_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_user_vaults_user_id ON user_vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vaults_vault_id ON user_vaults(vault_id);

CREATE INDEX IF NOT EXISTS idx_contract_events_contract_address ON contract_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_contract_events_event_name ON contract_events(event_name);
CREATE INDEX IF NOT EXISTS idx_contract_events_tx_hash ON contract_events(tx_hash);
CREATE INDEX IF NOT EXISTS idx_contract_events_block_number ON contract_events(block_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vaults_updated_at BEFORE UPDATE ON user_vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user if not exists
CREATE OR REPLACE FUNCTION ensure_user_exists(wallet_address_param TEXT)
RETURNS UUID AS $$
DECLARE
    user_id_result UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO user_id_result FROM users WHERE wallet_address = wallet_address_param;
    
    -- If user doesn't exist, create it
    IF user_id_result IS NULL THEN
        INSERT INTO users (wallet_address) VALUES (wallet_address_param) RETURNING id INTO user_id_result;
    END IF;
    
    RETURN user_id_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to record transaction
CREATE OR REPLACE FUNCTION record_transaction(
    wallet_address_param TEXT,
    vault_id_param BIGINT,
    amount_param TEXT,
    type_param TEXT,
    tx_hash_param TEXT,
    block_number_param BIGINT,
    block_timestamp_param BIGINT,
    gas_used_param BIGINT DEFAULT NULL,
    gas_price_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    user_id_result UUID;
    transaction_id_result UUID;
BEGIN
    -- Ensure user exists
    user_id_result := ensure_user_exists(wallet_address_param);
    
    -- Insert transaction
    INSERT INTO transactions (
        user_id, vault_id, amount, type, tx_hash, block_number, 
        block_timestamp, gas_used, gas_price
    ) VALUES (
        user_id_result, vault_id_param, amount_param, type_param, 
        tx_hash_param, block_number_param, block_timestamp_param, 
        gas_used_param, gas_price_param
    ) RETURNING id INTO transaction_id_result;
    
    -- Update user vault balance if it's a deposit or withdrawal
    IF type_param IN ('deposit', 'withdrawal') THEN
        INSERT INTO user_vaults (user_id, vault_id, amount)
        VALUES (user_id_result, vault_id_param, '0')
        ON CONFLICT (user_id, vault_id) DO NOTHING;
        
        IF type_param = 'deposit' THEN
            UPDATE user_vaults 
            SET amount = (amount::NUMERIC + amount_param::NUMERIC)::TEXT,
                updated_at = NOW()
            WHERE user_id = user_id_result AND vault_id = vault_id_param;
        ELSIF type_param = 'withdrawal' THEN
            UPDATE user_vaults 
            SET amount = (amount::NUMERIC - amount_param::NUMERIC)::TEXT,
                updated_at = NOW()
            WHERE user_id = user_id_result AND vault_id = vault_id_param;
        END IF;
    END IF;
    
    RETURN transaction_id_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to record contract event
CREATE OR REPLACE FUNCTION record_contract_event(
    contract_address_param TEXT,
    event_name_param TEXT,
    event_data_param JSONB,
    tx_hash_param TEXT,
    block_number_param BIGINT,
    block_timestamp_param BIGINT
)
RETURNS UUID AS $$
DECLARE
    event_id_result UUID;
BEGIN
    INSERT INTO contract_events (
        contract_address, event_name, event_data, tx_hash, 
        block_number, block_timestamp
    ) VALUES (
        contract_address_param, event_name_param, event_data_param, 
        tx_hash_param, block_number_param, block_timestamp_param
    ) RETURNING id INTO event_id_result;
    
    RETURN event_id_result;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample vaults
INSERT INTO vaults (id, name, description, apy) VALUES 
(1, 'High Yield Vault', 'High yield vault for SHM tokens', 12.5),
(2, 'Stable Vault', 'Stable returns vault', 8.0),
(3, 'Growth Vault', 'Growth focused vault', 15.0)
ON CONFLICT (id) DO NOTHING;