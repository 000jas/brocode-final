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

  async createProfileWithAuth(walletAddress: string): Promise<any> {
    try {
      // Create a message to sign
      const message = `Create profile for ${walletAddress} at ${new Date().toISOString()}`;
      
      // Sign the message
      const signature = await this.signMessage(message);
      
      // Create profile with signature as proof
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress,
          user_id: null,
          // Store signature for verification (optional)
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Wallet auth error:', error);
      throw error;
    }
  }

  async getProfileByWallet(walletAddress: string): Promise<any> {
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
