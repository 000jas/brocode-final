"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ethers } from "ethers";
import { supabase } from "@/lib/supabaseClient";
import { WalletAuth } from "@/lib/walletAuth";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const walletAuth = WalletAuth.getInstance();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const walletAddress = await walletAuth.connectWallet();
      if (walletAddress) {
        setAccount(walletAddress);
        
        // Create or update profile in Supabase with wallet auth
        await createOrUpdateProfileWithAuth(walletAddress);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  }, []);

  // Function to create or update profile with wallet authentication
  const createOrUpdateProfileWithAuth = async (walletAddress: string) => {
    try {
      console.log('🔍 Starting authenticated profile creation for address:', walletAddress);
      
      // First, try to find existing profile
      console.log('🔍 Checking for existing profile...');
      const existingProfile = await walletAuth.getProfileByWallet(walletAddress);
      
      if (existingProfile) {
        console.log('✅ Profile already exists:', existingProfile);
        alert(`Profile already exists! ID: ${existingProfile.id}`);
        return existingProfile;
      }

      // Create new profile with wallet authentication
      console.log('🔍 Creating new profile with wallet auth...');
      const newProfile = await walletAuth.createProfileWithAuth(walletAddress);
      
      console.log('✅ Profile created successfully:', newProfile);
      alert(`Profile created successfully! ID: ${newProfile.id}`);
      return newProfile;
    } catch (error: any) {
      console.error('❌ Error in createOrUpdateProfileWithAuth:', error);
      alert(`Error creating profile: ${error.message}`);
    }
  };

  // Function to create or update profile in Supabase (legacy - keeping for fallback)
  const createOrUpdateProfile = async (walletAddress: string) => {
    try {
      console.log('🔍 Starting profile creation for address:', walletAddress);
      
      // First, try to find existing profile
      console.log('🔍 Checking for existing profile...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      console.log('🔍 Fetch result:', { existingProfile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('❌ Error fetching profile:', fetchError);
        alert(`Error checking profile: ${fetchError.message}`);
        return;
      }

      if (existingProfile) {
        console.log('✅ Profile already exists:', existingProfile);
        alert(`Profile already exists! ID: ${existingProfile.id}`);
        return existingProfile;
      }

      // Create new profile
      console.log('🔍 Creating new profile...');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress,
          user_id: null // We'll handle auth later if needed
        })
        .select()
        .single();

      console.log('🔍 Insert result:', { newProfile, insertError });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
        alert(`Error creating profile: ${insertError.message}`);
        return;
      }

      console.log('✅ Profile created successfully:', newProfile);
      alert(`Profile created successfully! ID: ${newProfile.id}`);
      return newProfile;
    } catch (error) {
      console.error('❌ Error in createOrUpdateProfile:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const disconnectWallet = useCallback(() => {
    setAccount(null);
  }, []);

  // Check if wallet is already connected and listen to account/chain changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = (await provider.send("eth_accounts", [])) as string[];
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          setAccount(walletAddress);
          // Also create/update profile for existing connections
          await createOrUpdateProfileWithAuth(walletAddress);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    };

    const handleAccountsChanged = async (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === "string") {
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        // Create/update profile when account changes
        await createOrUpdateProfileWithAuth(walletAddress);
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = () => {
      // Reload to ensure app picks up the new network
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    };

    checkConnection();

    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      window.ethereum.on("chainChanged", handleChainChanged as (...args: unknown[]) => void);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
        window.ethereum.removeListener("chainChanged", handleChainChanged as (...args: unknown[]) => void);
      }
    };
  }, []);

  const value: WalletContextType = {
    account,
    connectWallet,
    disconnectWallet,
    isConnected: !!account,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

// Export the context for direct access if needed
export { WalletContext };
