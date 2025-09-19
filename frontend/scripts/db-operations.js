// Direct Database Operations Script
// This script can create, modify, and delete tables directly

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const SUPABASE_URL = 'https://unyxgduptjnmjwwtatjy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class DatabaseManager {
  constructor() {
    this.client = supabase;
  }

  async testConnection() {
    try {
      console.log('🔗 Testing connection...');
      const { data, error } = await this.client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      
      if (error) throw error;
      console.log('✅ Connected successfully!');
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
  }

  async listTables() {
    try {
      const { data, error } = await this.client
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (error) throw error;
      
      console.log('📋 Tables in your database:');
      data.forEach(table => {
        console.log(`  - ${table.table_name} (${table.table_type})`);
      });
      return data;
    } catch (error) {
      console.error('❌ Error listing tables:', error.message);
      return [];
    }
  }

  async createProfilesTable() {
    try {
      console.log('👤 Creating profiles table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          wallet_address text UNIQUE,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );
      `;
      
      const { error } = await this.client.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      
      console.log('✅ Profiles table created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error creating profiles table:', error.message);
      return false;
    }
  }

  async createVaultsTable() {
    try {
      console.log('🏦 Creating vaults table...');
      
      const createTableSQL = `
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
      `;
      
      const { error } = await this.client.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      
      console.log('✅ Vaults table created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error creating vaults table:', error.message);
      return false;
    }
  }

  async createVaultMembersTable() {
    try {
      console.log('👥 Creating vault_members table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.vault_members (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          vault_id bigint NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
          profile_id bigint NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          deposit_amount numeric(18,8) DEFAULT 0,
          share_percentage numeric(5,2) DEFAULT 0,
          joined_at timestamp with time zone DEFAULT now(),
          UNIQUE (vault_id, profile_id)
        );
      `;
      
      const { error } = await this.client.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      
      console.log('✅ Vault members table created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error creating vault_members table:', error.message);
      return false;
    }
  }

  async createTransactionsTable() {
    try {
      console.log('💰 Creating transactions table...');
      
      const createTableSQL = `
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
      `;
      
      const { error } = await this.client.rpc('exec_sql', { sql: createTableSQL });
      if (error) throw error;
      
      console.log('✅ Transactions table created successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error creating transactions table:', error.message);
      return false;
    }
  }

  async createAllTables() {
    console.log('🏗️  Creating all tables...');
    
    const results = await Promise.all([
      this.createProfilesTable(),
      this.createVaultsTable(),
      this.createVaultMembersTable(),
      this.createTransactionsTable()
    ]);
    
    const successCount = results.filter(r => r).length;
    console.log(`🎉 Created ${successCount}/4 tables successfully!`);
    
    return successCount === 4;
  }

  async checkProfilesData() {
    try {
      console.log('👤 Checking profiles data...');
      
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      console.log(`📊 Found ${data.length} profiles:`);
      data.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Address: ${profile.wallet_address || 'N/A'}, Created: ${profile.created_at}`);
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error checking profiles:', error.message);
      return [];
    }
  }

  async deleteTable(tableName) {
    try {
      console.log(`🗑️  Deleting table: ${tableName}`);
      
      const { error } = await this.client.rpc('exec_sql', { 
        sql: `DROP TABLE IF EXISTS public.${tableName} CASCADE;` 
      });
      
      if (error) throw error;
      
      console.log(`✅ Table ${tableName} deleted successfully!`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting table ${tableName}:`, error.message);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const db = new DatabaseManager();
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'test':
      await db.testConnection();
      break;
      
    case 'list':
      await db.listTables();
      break;
      
    case 'create':
      if (arg === 'all') {
        await db.createAllTables();
      } else if (arg === 'profiles') {
        await db.createProfilesTable();
      } else if (arg === 'vaults') {
        await db.createVaultsTable();
      } else if (arg === 'members') {
        await db.createVaultMembersTable();
      } else if (arg === 'transactions') {
        await db.createTransactionsTable();
      } else {
        console.log('Usage: node scripts/db-operations.js create [all|profiles|vaults|members|transactions]');
      }
      break;
      
    case 'check':
      if (arg === 'profiles') {
        await db.checkProfilesData();
      } else {
        console.log('Usage: node scripts/db-operations.js check [profiles]');
      }
      break;
      
    case 'delete':
      if (arg) {
        await db.deleteTable(arg);
      } else {
        console.log('Usage: node scripts/db-operations.js delete <table_name>');
      }
      break;
      
    default:
      console.log('🔧 Database Operations Script');
      console.log('');
      console.log('Usage: node scripts/db-operations.js <command> [argument]');
      console.log('');
      console.log('Commands:');
      console.log('  test                    - Test database connection');
      console.log('  list                    - List all tables');
      console.log('  create all              - Create all tables');
      console.log('  create profiles         - Create profiles table only');
      console.log('  create vaults           - Create vaults table only');
      console.log('  create members          - Create vault_members table only');
      console.log('  create transactions     - Create transactions table only');
      console.log('  check profiles          - Check profiles data');
      console.log('  delete <table_name>     - Delete a table');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/db-operations.js test');
      console.log('  node scripts/db-operations.js create all');
      console.log('  node scripts/db-operations.js check profiles');
      console.log('  node scripts/db-operations.js delete profiles');
  }
}

main().catch(console.error);
