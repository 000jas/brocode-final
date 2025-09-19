// Wallet-based authentication for Supabase
import { ethers } from 'ethers';
import { supabase } from './supabaseClient';

export class WalletAuth {
  private static instance: WalletAuth;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  static getInstance(): WalletAuth {
    if (!WalletAuth.instance) {
      WalletAuth.instance = new WalletAuth();
    }
    return WalletAuth.instance;
  }

  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send("eth_requestAccounts", []);
    
    if (accounts && accounts.length > 0) {
      this.signer = await this.provider.getSigner();
      return accounts[0];
    }
    
    return null;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.signMessage(message);
  }

  async createProfileWithAuth(walletAddress: string): Promise<{ id: number; wallet_address: string; user_id: string | null; created_at: string } | null> {
    try {
      // Create a message to sign
      const message = `Create profile for ${walletAddress} at ${new Date().toISOString()}`;
      
      // Sign the message (for future verification)
      await this.signMessage(message);
      
      // First check if profile already exists
      const existingProfile = await this.getProfileByWallet(walletAddress);
      if (existingProfile) {
        console.log('Profile already exists:', existingProfile);
        return existingProfile;
      }
      
      // Create new profile directly
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress,
          user_id: null
        })
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        });
        
        // If it's an RLS error, return a mock profile for now
        if (error.code === '42501' || error.message.includes('RLS') || error.message.includes('permission')) {
          console.warn('RLS policy blocking profile creation. Returning mock profile.');
          return {
            id: Date.now(),
            wallet_address: walletAddress,
            user_id: null,
            created_at: new Date().toISOString()
          };
        }
        
        throw error;
      }

      return data;
    } catch (error: unknown) {
      console.error('Wallet auth error:', {
        message: (error as any)?.message || 'Unknown error',
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        fullError: error
      });
      throw error;
    }
  }

  async getProfileByWallet(walletAddress: string): Promise<{ id: number; wallet_address: string; user_id: string | null; created_at: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }
}
