import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['@supabase/supabase-js'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS: process.env.NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS,
    NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS: process.env.NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS,
    NEXT_PUBLIC_SHM_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_SHM_TOKEN_ADDRESS,
    NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  }
};

export default nextConfig;
