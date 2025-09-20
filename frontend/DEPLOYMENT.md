# Vercel Deployment Guide

This guide will help you deploy your VaultFi application to Vercel with Supabase integration.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Supabase integration and Vercel deployment config"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name: **vaultfi** (or your preferred name)
   - Directory: **./frontend**
   - Override settings? **No**

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`
5. Configure environment variables (see below)
6. Click "Deploy"

### 3. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ynesrhvclnchnequcrjb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_RPC_URL=https://your-rpc-url
NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS=0x...
NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS=0x...
NEXT_PUBLIC_SHM_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_NAME=shardeum
NEXT_PUBLIC_CHAIN_ID=8082
```

#### Optional Variables:

```env
SUPABASE_SERVICE_KEY=your-service-key-here
```

### 4. Set Up Database

After deployment, you need to set up your Supabase database:

1. **Option A: Use the setup script locally:**
   ```bash
   cd frontend
   npm run setup-db
   ```

2. **Option B: Manual setup in Supabase dashboard:**
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL

### 5. Update Contract Addresses

Once your contracts are deployed, update the environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update the contract addresses with your deployed contract addresses
4. Redeploy the application

## 🔧 Configuration Files

The following files have been created for Vercel deployment:

- `vercel.json` - Vercel configuration
- `next.config.ts` - Next.js configuration with environment variables
- `.vercelignore` - Files to ignore during deployment

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Contract addresses updated
- [ ] Build test passed locally (`npm run build`)

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript errors are resolved
   - Verify environment variables are set

2. **Runtime Errors:**
   - Check browser console for errors
   - Verify Supabase connection
   - Ensure contract addresses are correct

3. **Database Connection Issues:**
   - Verify Supabase URL and keys
   - Check if database schema is set up
   - Ensure RLS policies allow access

### Debug Steps:

1. **Check Vercel Function Logs:**
   - Go to Vercel dashboard
   - Navigate to Functions tab
   - Check for any error logs

2. **Test Environment Variables:**
   ```javascript
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log('RPC URL:', process.env.NEXT_PUBLIC_RPC_URL)
   ```

3. **Verify Supabase Connection:**
   - Check Supabase dashboard for connection logs
   - Test database queries in Supabase SQL editor

## 🔄 Redeployment

To redeploy after changes:

```bash
cd frontend
vercel --prod
```

Or push to your main branch if auto-deployment is enabled.

## 📊 Monitoring

After deployment, monitor:

1. **Vercel Analytics** - Performance and usage
2. **Supabase Dashboard** - Database performance
3. **Browser Console** - Client-side errors
4. **Vercel Function Logs** - Server-side errors

## 🎯 Production Checklist

- [ ] Environment variables set correctly
- [ ] Database schema deployed
- [ ] Contract addresses updated
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test Supabase connection
4. Check browser console for errors
5. Review this deployment guide

Your VaultFi application should now be live on Vercel with full Supabase integration! 🎉
