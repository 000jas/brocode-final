// Test table permissions and structure
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://unyxgduptjnmjwwtatjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXhnZHVwdGpubWp3d3RhdGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDI5OTEsImV4cCI6MjA3Mzg3ODk5MX0.yP3yWLkI802kiYvADA8HDuqgQiVdKKQoWDrR9p2hPho';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTableStructure() {
  try {
    console.log('🔍 Testing table structure...');
    
    // Check if table exists and get its structure
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Error checking table structure:', error);
      return;
    }
    
    console.log('✅ Table structure:');
    data.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testRLSPolicies() {
  try {
    console.log('🔍 Testing RLS policies...');
    
    // Try to check RLS status
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, is_insertable_into')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .single();
    
    if (error) {
      console.error('❌ Error checking RLS:', error);
      return;
    }
    
    console.log('✅ Table info:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testDirectInsert() {
  try {
    console.log('🔍 Testing direct insert...');
    
    const testData = {
      wallet_address: `0x${Math.random().toString(16).substr(2, 40)}`,
      user_id: null
    };
    
    console.log('Inserting:', testData);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Insert failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error);
    } else {
      console.log('✅ Insert successful:', data);
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('id', data.id);
      console.log('🧹 Test data cleaned up');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🧪 Table Permissions Test');
  console.log('========================');
  
  await testTableStructure();
  console.log('');
  
  await testRLSPolicies();
  console.log('');
  
  await testDirectInsert();
}

main().catch(console.error);
