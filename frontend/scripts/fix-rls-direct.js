// Direct PostgreSQL connection to fix RLS policies
const { Client } = require('pg');

// Your PostgreSQL connection string
const connectionString = 'postgresql://postgres:micromint@123@db.unyxgduptjnmjwwtatjy.supabase.co:5432/postgres';

async function fixRLSPolicies() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check current RLS status
    console.log('🔍 Checking current RLS status...');
    const rlsResult = await client.query(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `);
    
    console.log('📊 Current RLS status:', rlsResult.rows);

    // Check existing policies
    console.log('🔍 Checking existing policies...');
    const policiesResult = await client.query(`
      SELECT policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies 
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `);
    
    console.log('📋 Existing policies:', policiesResult.rows);

    // Drop all existing policies
    console.log('🗑️ Dropping existing policies...');
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles',
      'DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles',
      'DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles',
      'DROP POLICY IF EXISTS "Allow public access" ON public.profiles',
      'DROP POLICY IF EXISTS "Allow public profile creation" ON public.profiles',
      'DROP POLICY IF EXISTS "Allow public profile reading" ON public.profiles',
      'DROP POLICY IF EXISTS "Allow profile updates by wallet" ON public.profiles'
    ];

    for (const sql of dropPolicies) {
      try {
        await client.query(sql);
        console.log(`✅ Executed: ${sql}`);
      } catch (error) {
        console.log(`⚠️ Policy might not exist: ${sql}`);
      }
    }

    // Disable RLS temporarily
    console.log('🔓 Disabling RLS temporarily...');
    await client.query('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS disabled successfully!');

    // Check table structure first
    console.log('🔍 Checking table structure...');
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Table structure:', structureResult.rows);

    // Fix the table structure to allow NULL user_id
    console.log('🔧 Fixing table structure to allow NULL user_id...');
    
    // Drop the foreign key constraint
    await client.query('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey');
    console.log('✅ Dropped foreign key constraint');
    
    // Make user_id nullable
    await client.query('ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL');
    console.log('✅ Made user_id nullable');

    // Test insert
    console.log('🧪 Testing insert with RLS disabled...');
    const testAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    const insertResult = await client.query(`
      INSERT INTO public.profiles (wallet_address, user_id) 
      VALUES ($1, $2) 
      RETURNING id, wallet_address, user_id, created_at
    `, [testAddress, null]);
    
    console.log('✅ Test insert successful:', insertResult.rows[0]);

    // Clean up test data
    await client.query('DELETE FROM public.profiles WHERE wallet_address = $1', [testAddress]);
    console.log('🧹 Test data cleaned up');

    // Re-enable RLS with permissive policies
    console.log('🔒 Re-enabling RLS with permissive policies...');
    await client.query('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY');

    // Create permissive policies
    const createPolicies = [
      `CREATE POLICY "profiles_select_policy" ON public.profiles
       FOR SELECT TO anon, authenticated USING (true)`,
      
      `CREATE POLICY "profiles_insert_policy" ON public.profiles
       FOR INSERT TO anon, authenticated WITH CHECK (true)`,
      
      `CREATE POLICY "profiles_update_policy" ON public.profiles
       FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)`,
      
      `CREATE POLICY "profiles_delete_policy" ON public.profiles
       FOR DELETE TO anon, authenticated USING (true)`
    ];

    for (const sql of createPolicies) {
      await client.query(sql);
      console.log(`✅ Created policy: ${sql.split('"')[1]}`);
    }

    // Verify final state
    console.log('🔍 Verifying final state...');
    const finalPolicies = await client.query(`
      SELECT policyname, permissive, roles, cmd
      FROM pg_policies 
      WHERE tablename = 'profiles' AND schemaname = 'public'
    `);
    
    console.log('📋 Final policies:', finalPolicies.rows);

    console.log('🎉 RLS policies fixed successfully!');
    console.log('💡 You can now test profile creation in your app.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixRLSPolicies().catch(console.error);
