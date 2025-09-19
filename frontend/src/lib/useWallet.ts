"use client";

// src/lib/useWallet.ts
import { useState, useEffect } from "react";
import { WalletAuth } from "./walletAuth";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profile, setProfile] = useState<{ id: number; wallet_address: string; user_id: string | null; created_at: string } | null>(null);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            const userAddress = accounts[0];
            setAddress(userAddress);
            
            // Check if profile exists
            const walletAuth = WalletAuth.getInstance();
            const existingProfile = await walletAuth.getProfileByWallet(userAddress);
            setProfile(existingProfile);
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  const disconnectWallet = () => {
    setAddress(null);
    setProfile(null);
  };

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install it.");
        return null;
      }

      setIsConnecting(true);

      const walletAuth = WalletAuth.getInstance();
      const userAddress = await walletAuth.connectWallet();
      
      if (userAddress) {
        setAddress(userAddress);
        
        // Check if profile already exists
        let existingProfile = await walletAuth.getProfileByWallet(userAddress);
        
        if (!existingProfile) {
          // Create new profile
          existingProfile = await walletAuth.createProfileWithAuth(userAddress);
        }
        
        setProfile(existingProfile);
        return userAddress;
      }
      
      return null;
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
      return null;
    } finally {
      setIsConnecting(false);
    }
  }

  return { 
    address, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    profile,
    isConnected: !!address 
  };
}
