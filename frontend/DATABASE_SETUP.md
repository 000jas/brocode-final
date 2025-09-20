# 🗄️  Micro-Mint Database Setup Guide

## 📋 Quick Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/ynesrhvclnchnequcrjb/sql
2. Click "New Query" button
3. Copy the entire content from `create-tables.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute

### Step 2: Verify Setup
After running the SQL, execute this command in your terminal:
```bash
node setup-database-guide.js
```

## 📊 Database Schema

### Tables Created:
- **users**: Stores wallet addresses and user data
- **vaults**: Contains vault information (name, APY, total deposits)
- **user_vaults**: Tracks user investments in each vault
- **transactions**: Records all deposit/withdrawal transactions

### Features:
- ✅ Automatic user creation on wallet connect
- ✅ Transaction tracking and history
- ✅ Portfolio management
- ✅ Vault performance analytics
- ✅ Row Level Security (RLS) policies
- ✅ Optimized indexes for performance

## 🔧 What Happens When You Connect Wallet:

1. **User Creation**: Wallet address is stored as user ID
2. **Data Persistence**: All data persists across sessions
3. **Transaction Tracking**: Deposits/withdrawals are recorded
4. **Portfolio Updates**: Real-time portfolio calculations

## 🚀 After Setup:

1. Start your development server: `npm run dev`
2. Open: http://localhost:3000
3. Connect your MetaMask wallet
4. Your wallet address will be automatically stored in Supabase!

## 🧪 Testing:

Run the verification script to test all functionality:
```bash
node setup-database-guide.js
```

This will test:
- ✅ Database connection
- ✅ User creation
- ✅ Vault creation
- ✅ Transaction recording
- ✅ Data retrieval

## 📁 Files Created:
- `create-tables.sql` - Complete database schema
- `setup-database-guide.js` - Verification script
- `DATABASE_SETUP.md` - This guide

Your  Micro-Mintplatform will be fully functional once the database is set up! 🎉
