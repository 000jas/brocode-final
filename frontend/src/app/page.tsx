"use client";

import { useState } from "react";
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

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } else {
      alert("Please install MetaMask!");
    }
  }

  return (
    <div className="p-4">
      {account ? (
        <p className="text-green-600">Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
