# Database Fix Instructions

## Apply the Wallet Authentication Fix

To fix the wallet connection errors, you need to apply the database schema changes. Here are two options:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `simple-wallet-auth-fix.sql`
4. Click "Run" to execute the SQL

### Option 2: Using the SQL File

The SQL file `simple-wallet-auth-fix.sql` contains the following changes:

1. **Allow null user_id**: Makes `user_id` nullable for wallet-only profiles
2. **Update RLS policies**: Creates permissive policies for public access
3. **Add upsert function**: Creates a function to get or create profiles by wallet address

### What This Fixes

- ✅ Allows wallet-only profiles without requiring Supabase authentication
- ✅ Enables public access to create and read profiles
- ✅ Fixes the "RLS policy" errors you were seeing
- ✅ Provides proper error logging with detailed information

### After Applying the Fix

1. The wallet connection should work without errors
2. Profiles will be created automatically in the database
3. You'll see detailed error messages if something goes wrong
4. The dashboard will display the connected wallet address properly

### Testing

After applying the fix:
1. Try connecting your wallet
2. Check the browser console for any remaining errors
3. Verify the address appears on the dashboard
4. Check your Supabase `profiles` table to see the created profile

If you still see errors, the console will now show detailed error information instead of empty objects `{}`.
