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
  console.error('\n📝 Please create a .env.local file with your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupVaultFeature() {
  try {
    console.log('🚀 Setting up Vault Creation Feature...\n');
    
    // Read the vault schema file
    const schemaPath = path.join(__dirname, '..', 'vault-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Vault schema file not found at:', schemaPath);
      process.exit(1);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   ${i + 1}. Executing statement...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            // Check if it's a "already exists" error (which is okay)
            if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
              console.log(`   ✅ Statement ${i + 1} completed (already exists)`);
            } else {
              console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              // Continue with other statements
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} completed successfully`);
          }
        } catch (err) {
          console.error(`   ❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    // Test the setup
    console.log('\n🧪 Testing vault operations...');
    
    // Test inserting a vault
    const testVault = {
      user_address: '0x1234567890123456789012345678901234567890',
      vault_name: 'Test Vault Setup',
      description: 'This is a test vault for setup verification',
      initial_deposit: 10.5
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from("vaults")
      .insert(testVault)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test vault:', insertError.message);
      return false;
    }
    
    console.log('✅ Test vault inserted successfully:', insertData.id);
    
    // Test fetching vaults
    const { data: vaults, error: fetchError } = await supabase
      .from("vaults")
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching vaults:', fetchError.message);
      return false;
    }
    
    console.log('✅ Vaults fetched successfully:', vaults.length, 'vaults found');
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from("vaults")
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('⚠️  Error cleaning up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('\n🎉 Vault Creation Feature setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your Next.js development server: npm run dev');
    console.log('   2. Navigate to /create-vault to test vault creation');
    console.log('   3. Navigate to /vaults to view all vaults');
    console.log('\n✨ The vault creation feature is now ready to use!');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during setup:', error);
    return false;
  }
}

// Check if we can use exec_sql function
async function checkSupabaseSetup() {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // Try to query a system table to test connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Check your NEXT_PUBLIC_SUPABASE_URL');
      console.log('   2. Check your SUPABASE_SERVICE_ROLE_KEY');
      console.log('   3. Make sure your Supabase project is active');
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Check if exec_sql function exists
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'exec_sql');
    
    if (funcError || !functions || functions.length === 0) {
      console.log('⚠️  exec_sql function not found. Using alternative method...');
      return 'alternative';
    }
    
    console.log('✅ exec_sql function available');
    return true;
  } catch (error) {
    console.error('❌ Error checking Supabase setup:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Vault Creation Feature Setup');
  console.log('================================\n');
  
  const connectionStatus = await checkSupabaseSetup();
  
  if (connectionStatus === false) {
    process.exit(1);
  }
  
  if (connectionStatus === 'alternative') {
    console.log('\n📝 Manual setup required:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of vault-schema.sql');
    console.log('   4. Execute the SQL');
    console.log('   5. Run this script again to test the setup');
    return;
  }
  
  const success = await setupVaultFeature();
  
  if (!success) {
    console.log('\n❌ Setup failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
