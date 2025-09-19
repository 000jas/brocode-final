// Script to apply wallet authentication schema fixes
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchemaFix() {
  try {
    console.log('Applying wallet authentication schema fixes...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'fix-wallet-auth-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error('Error executing statement:', error);
          console.error('Statement:', statement);
        } else {
          console.log('✓ Statement executed successfully');
        }
      }
    }
    
    console.log('Schema fixes applied successfully!');
  } catch (error) {
    console.error('Error applying schema fixes:', error);
  }
}

// Alternative method using direct SQL execution
async function applySchemaFixDirect() {
  try {
    console.log('Applying wallet authentication schema fixes (direct method)...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'fix-wallet-auth-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the entire SQL content
    const { error } = await supabase.rpc('exec', { sql: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
    } else {
      console.log('Schema fixes applied successfully!');
    }
  } catch (error) {
    console.error('Error applying schema fixes:', error);
  }
}

// Run the script
if (require.main === module) {
  console.log('Choose an execution method:');
  console.log('1. Direct SQL execution (recommended)');
  console.log('2. Statement by statement execution');
  
  // For now, use direct execution
  applySchemaFixDirect();
}

module.exports = { applySchemaFix, applySchemaFixDirect };
