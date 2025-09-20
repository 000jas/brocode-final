const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Your Supabase connection details
const supabaseUrl = 'https://ynesrhvclnchnequcrjb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key'

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Supabase database...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            console.warn(`⚠️  Warning for statement ${i + 1}:`, error.message)
            // Continue with other statements even if one fails
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.warn(`⚠️  Error executing statement ${i + 1}:`, err.message)
        }
      }
    }
    
    console.log('🎉 Database setup completed!')
    
    // Test the setup by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('📊 Could not verify tables (this is normal if using direct SQL execution)')
    } else {
      console.log('📊 Created tables:', tables.map(t => t.table_name).join(', '))
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  try {
    console.log('🚀 Setting up Supabase database using direct SQL...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the entire schema at once
    const { error } = await supabase.rpc('exec', { sql: schema })
    
    if (error) {
      console.error('❌ Error executing schema:', error)
      throw error
    }
    
    console.log('🎉 Database setup completed!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    console.log('💡 You may need to run the SQL manually in the Supabase dashboard')
    console.log('📁 SQL file location:', path.join(__dirname, 'supabase-schema.sql'))
  }
}

// Check if we have the required environment variables
if (!supabaseServiceKey || supabaseServiceKey === 'your-service-key') {
  console.log('⚠️  SUPABASE_SERVICE_KEY not found in environment variables')
  console.log('💡 Please set your Supabase service key:')
  console.log('   export SUPABASE_SERVICE_KEY="your-service-key-here"')
  console.log('')
  console.log('📋 You can find your service key in the Supabase dashboard:')
  console.log('   1. Go to your project settings')
  console.log('   2. Navigate to API section')
  console.log('   3. Copy the "service_role" key')
  console.log('')
  console.log('🔄 Alternatively, you can run the SQL manually:')
  console.log('   1. Open the Supabase dashboard')
  console.log('   2. Go to SQL Editor')
  console.log('   3. Copy and paste the contents of supabase-schema.sql')
  console.log('   4. Execute the SQL')
  process.exit(1)
}

// Run the setup
if (process.argv.includes('--direct')) {
  setupDatabaseDirect()
} else {
  setupDatabase()
}