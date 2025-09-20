const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyVaultSchema() {
  try {
    console.log('🚀 Applying vault schema to Supabase...');
    
    // Read the vault schema file
    const schemaPath = path.join(__dirname, '..', 'vault-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Schema file loaded successfully');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('❌ Error applying schema:', error);
      return false;
    }
    
    console.log('✅ Vault schema applied successfully!');
    
    // Test the schema by checking if the vaults table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vaults');
    
    if (tableError) {
      console.error('❌ Error checking table existence:', tableError);
      return false;
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Vaults table created successfully');
    } else {
      console.log('⚠️  Vaults table not found - schema may not have been applied');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

async function testVaultOperations() {
  try {
    console.log('\n🧪 Testing vault operations...');
    
    // Test inserting a vault
    const testVault = {
      user_address: '0x1234567890123456789012345678901234567890',
      vault_name: 'Test Vault',
      description: 'This is a test vault',
      initial_deposit: 10.5
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('vaults')
      .insert(testVault)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test vault:', insertError);
      return false;
    }
    
    console.log('✅ Test vault inserted successfully:', insertData.id);
    
    // Test fetching vaults
    const { data: vaults, error: fetchError } = await supabase
      .from('vaults')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching vaults:', fetchError);
      return false;
    }
    
    console.log('✅ Vaults fetched successfully:', vaults.length, 'vaults found');
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('vaults')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('⚠️  Error cleaning up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing vault operations:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Vault Schema Application Script');
  console.log('=====================================\n');
  
  const schemaApplied = await applyVaultSchema();
  
  if (schemaApplied) {
    const testsPassed = await testVaultOperations();
    
    if (testsPassed) {
      console.log('\n🎉 All operations completed successfully!');
      console.log('   ✅ Schema applied');
      console.log('   ✅ Tests passed');
      console.log('\n📝 Next steps:');
      console.log('   1. Start your Next.js development server: npm run dev');
      console.log('   2. Navigate to /create-vault to test vault creation');
      console.log('   3. Navigate to /vaults to view all vaults');
    } else {
      console.log('\n⚠️  Schema applied but tests failed');
    }
  } else {
    console.log('\n❌ Schema application failed');
    process.exit(1);
  }
}

main().catch(console.error);
