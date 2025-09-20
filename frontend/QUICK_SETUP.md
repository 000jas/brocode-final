# Quick Setup Guide - Vault Creation Feature

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Apply Database Schema
```bash
npm run setup:vault
```

This will:
- Create the vaults table with proper constraints
- Set up Row Level Security policies
- Test the database connection
- Verify everything is working

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test the Feature
1. Navigate to `http://localhost:5001/create-vault`
2. Connect your MetaMask wallet
3. Create a vault with the form
4. View vaults at `http://localhost:5001/vaults`

## 🔧 Troubleshooting

### Error: "Database schema not applied"
**Solution**: Run the setup script:
```bash
npm run setup:vault
```

### Error: "Vaults table not found"
**Solution**: The database schema hasn't been applied. Run:
```bash
npm run setup:vault
```

### Error: "Missing environment variables"
**Solution**: Check your `.env.local` file has the correct Supabase credentials.

### Error: "Supabase connection failed"
**Solution**: 
1. Verify your Supabase URL and key
2. Check if your Supabase project is active
3. Ensure you have the correct permissions

## 📝 Manual Database Setup

If the automated setup fails, you can manually apply the schema:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `vault-schema.sql`
4. Paste and execute the SQL
5. Run `npm run setup:vault` to test

## ✅ Verification

After setup, you should see:
- ✅ No console errors about missing tables
- ✅ Vault creation form loads without errors
- ✅ Vault list displays (even if empty)
- ✅ MetaMask integration works
- ✅ Form validation works

## 🎯 Features Available

- **Vault Creation**: Create vaults with unique names
- **One Vault Per User**: Enforced by database constraints
- **Global Vault List**: All vaults visible to all users
- **MetaMask Integration**: Transaction handling
- **Form Validation**: Real-time validation
- **8% Fee Warning**: Prominent disclosure

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify your Supabase credentials
3. Ensure the database schema is applied
4. Check your MetaMask connection

The vault creation feature is now ready to use! 🎉
