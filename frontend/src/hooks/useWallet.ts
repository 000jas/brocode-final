"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

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

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return null;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
  }, []);

  // Check if wallet is already connected and listen to account/chain changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = (await provider.send("eth_accounts", [])) as string[];
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === "string") {
        setAddress(accounts[0]);
      } else {
        setAddress(null);
      }
    };

    checkConnection();

    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      }
    };
  }, []);

  return {
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isConnected: !!address,
  };
}
