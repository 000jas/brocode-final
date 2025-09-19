"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
}

export interface Vault {
  id: string;
  name: string;
  description?: string;
  creator_profile_id: string;
  total_deposits: number;
  total_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VaultMember {
  id: string;
  vault_id: string;
  profile_id: string;
  deposit_amount: number;
  share_percentage: number;
  joined_at: string;
}

export interface Transaction {
  id: string;
  vault_id?: string;
  profile_id?: string;
  type: 'deposit' | 'withdraw' | 'reward';
  amount: number;
  tx_hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user profile by wallet address
  const getUserByWallet = async (walletAddress: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByWallet:', error);
      return null;
    }
  };

  // Create or update user profile
  const upsertUser = async (walletAddress: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ wallet_address: walletAddress })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUser:', error);
      return null;
    }
  };

  // Get all active vaults
  const getVaults = async (): Promise<Vault[]> => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vaults:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVaults:', error);
      return [];
    }
  };

  // Create a new vault
  const createVault = async (name: string, description: string, creatorProfileId: string): Promise<Vault | null> => {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .insert({
          name,
          description,
          creator_profile_id: creatorProfileId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating vault:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createVault:', error);
      return null;
    }
  };

  // Join a vault
  const joinVault = async (vaultId: string, profileId: string, depositAmount: number): Promise<VaultMember | null> => {
    try {
      const { data, error } = await supabase
        .from('vault_members')
        .insert({
          vault_id: vaultId,
          profile_id: profileId,
          deposit_amount: depositAmount
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining vault:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in joinVault:', error);
      return null;
    }
  };

  // Get user's vault memberships
  const getUserVaults = async (profileId: string): Promise<VaultMember[]> => {
    try {
      const { data, error } = await supabase
        .from('vault_members')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        console.error('Error fetching user vaults:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserVaults:', error);
      return [];
    }
  };

  // Get transactions for a user
  const getUserTransactions = async (profileId: string): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTransactions:', error);
      return [];
    }
  };

  // Record a transaction
  const recordTransaction = async (
    vaultId: string | null,
    profileId: string,
    type: 'deposit' | 'withdraw' | 'reward',
    amount: number,
    txHash?: string
  ): Promise<Transaction | null> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          vault_id: vaultId,
          profile_id: profileId,
          type,
          amount,
          tx_hash: txHash,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording transaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in recordTransaction:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    getUserByWallet,
    upsertUser,
    getVaults,
    createVault,
    joinVault,
    getUserVaults,
    getUserTransactions,
    recordTransaction
  };
}
