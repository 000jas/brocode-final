// Supabase Admin Script for Direct Database Operations
// Run with: node scripts/supabase-admin.js

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://unyxgduptjnmjwwtatjy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it in your .env.local file or run:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_key_here node scripts/supabase-admin.js');
  process.exit(1);
}

// Create Supabase client with service role key (full access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test connection by listing tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connected successfully!');
    console.log('📋 Existing tables:', data.map(t => t.table_name));
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function createTables() {
  try {
    console.log('🏗️  Creating tables from schema...');
    
    // Read and execute the schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('❌ Error executing statement:', error.message);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('🎉 Schema creation completed!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

async function listTables() {
  try {
    console.log('📋 Listing all tables...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.error('❌ Error listing tables:', error.message);
      return;
    }
    
    console.log('📊 Tables in your database:');
    data.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkProfilesTable() {
  try {
    console.log('👤 Checking profiles table...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Profiles table error:', error.message);
      return;
    }
    
    console.log('✅ Profiles table exists and accessible');
    console.log(`📊 Found ${data.length} profiles`);
    data.forEach(profile => {
      console.log(`  - ID: ${profile.id}, Address: ${profile.wallet_address}`);
    });
  } catch (error) {
    console.error('❌ Error checking profiles:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testConnection();
      break;
    case 'create':
      await createTables();
      break;
    case 'list':
      await listTables();
      break;
    case 'profiles':
      await checkProfilesTable();
      break;
    default:
      console.log('🔧 Supabase Admin Script');
      console.log('');
      console.log('Usage: node scripts/supabase-admin.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  test     - Test database connection');
      console.log('  create   - Create tables from schema');
      console.log('  list     - List all tables');
      console.log('  profiles - Check profiles table');
      console.log('');
      console.log('Make sure to set SUPABASE_SERVICE_ROLE_KEY in your environment');
  }
}

main().catch(console.error);
