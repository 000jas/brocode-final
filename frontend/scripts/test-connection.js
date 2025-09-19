// Simple test to check Supabase connection and profile creation
const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const SUPABASE_URL = 'https://unyxgduptjnmjwwtatjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXhnZHVwdGpubWp3d3RhdGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDI5OTEsImV4cCI6MjA3Mzg3ODk5MX0.yP3yWLkI802kiYvADA8HDuqgQiVdKKQoWDrR9p2hPho';

// Create client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection with anon key...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Connected successfully!');
    console.log('📊 Found profiles:', data.length);
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function testProfileCreation() {
  try {
    console.log('👤 Testing profile creation...');
    
    const testAddress = '0x1234567890123456789012345678901234567890';
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        wallet_address: testAddress
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation failed:', error.message);
      console.error('Error details:', error);
      return false;
    }
    
    console.log('✅ Profile created successfully!');
    console.log('📊 Created profile:', data);
    
    // Clean up - delete the test profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', data.id);
    
    console.log('🧹 Test profile cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Profile creation error:', error.message);
    return false;
  }
}

async function listTables() {
  try {
    console.log('📋 Checking if profiles table exists...');
    
    // Try to select from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Profiles table does not exist!');
        return false;
      } else {
        console.error('❌ Error checking profiles table:', error.message);
        return false;
      }
    }
    
    console.log('✅ Profiles table exists!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Supabase Connection Test');
  console.log('============================');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Basic connection failed. Check your Supabase URL and anon key.');
    return;
  }
  
  const tableExists = await listTables();
  if (!tableExists) {
    console.log('\n❌ Profiles table does not exist. You need to create it first.');
    console.log('💡 Go to your Supabase dashboard and run the SQL schema, or get the service role key to create it programmatically.');
    return;
  }
  
  const creationOk = await testProfileCreation();
  if (creationOk) {
    console.log('\n🎉 Everything is working! Profile creation should work in your app.');
  } else {
    console.log('\n❌ Profile creation failed. Check your table permissions and RLS policies.');
  }
}

main().catch(console.error);
