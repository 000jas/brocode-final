"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  }, []);

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
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === "string") {
        setAccount(accounts[0]);
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
