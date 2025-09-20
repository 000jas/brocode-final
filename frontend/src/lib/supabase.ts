import { createClient } from '@supabase/supabase-js'

// Your Supabase connection details
const supabaseUrl = 'https://ynesrhvclnchnequcrjb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Validate configuration
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key') {
  console.warn('⚠️ Supabase not configured properly. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  wallet_address: string
  created_at: string
  updated_at: string
}

export interface Vault {
  id: number
  name: string
  description: string
  apy: number
  total_deposits: number
  created_at: string
  is_active: boolean
}

export interface Transaction {
  id: string
  user_id: string
  vault_id: number
  amount: string // Using string for big numbers
  type: 'deposit' | 'withdrawal' | 'vault_created' | 'authorized_withdrawer_set'
  tx_hash: string
  block_number: number
  block_timestamp: number
  gas_used: number
  gas_price: string
  created_at: string
}

export interface UserVault {
  user_id: string
  vault_id: number
  amount: string
  created_at: string
  updated_at: string
}

export interface ContractEvent {
  id: string
  contract_address: string
  event_name: string
  event_data: Record<string, unknown>
  tx_hash: string
  block_number: number
  block_timestamp: number
  created_at: string
}
