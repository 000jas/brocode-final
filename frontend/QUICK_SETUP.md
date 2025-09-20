# Quick Setup Guide - Supabase Integration

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment file and update with your values:

```bash
cp env.example .env.local
```

**Required values to update in `.env.local`:**

```env
# Get these from your Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Update with your deployed contract addresses
NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS=0x...
NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS=0x...
NEXT_PUBLIC_SHM_TOKEN_ADDRESS=0x...

# Your blockchain RPC URL
NEXT_PUBLIC_RPC_URL=https://your-rpc-url
```

### 2. Database Setup

Run the database setup script:

```bash
npm run setup-db
```

If that fails, run with direct SQL execution:

```bash
npm run setup-db-direct
```

### 3. Start the Application

```bash
npm run dev
```

## 🔑 Getting Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (already set in code)
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

## 📋 Manual Database Setup (if script fails)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy contents of `supabase-schema.sql`
4. Paste and execute the SQL

## ✅ Verification

After setup, you should see:

1. **Database tables created** in Supabase dashboard
2. **Sample vaults** in the vaults table
3. **No console errors** in browser
4. **Transaction tracking** working when you make deposits/withdrawals

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid API key"** → Check your Supabase keys
2. **"Contract not found"** → Verify contract addresses
3. **"RPC error"** → Check your RPC URL
4. **"Database error"** → Run manual SQL setup

### Debug Mode:

Enable debug logging:
```javascript
localStorage.setItem('debug', 'blockchain-service')
```

## 📊 What's Tracked

The system automatically tracks:
- ✅ All deposits to vaults
- ✅ All withdrawals from vaults
- ✅ Vault creation events
- ✅ Token transfers
- ✅ Gas usage and transaction costs
- ✅ User balances in each vault

## 🎯 Next Steps

1. **Deploy your contracts** and update addresses
2. **Test transactions** to verify tracking
3. **Check the Transactions page** to see recorded data
4. **Monitor the console** for any errors

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure your contracts are deployed and accessible
4. Check Supabase dashboard for database errors