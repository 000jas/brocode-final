"use client";

// src/lib/useWallet.ts
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const disconnectWallet = () => {
    setAddress(null);
  };

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install it.");
        return;
      }

      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      const userAddress = accounts[0];
      setAddress(userAddress);

      // ✅ Save address to Supabase
      await supabase.from("users").upsert([{ wallet_address: userAddress }]);

      return userAddress;
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }

  return { address, isConnecting, connectWallet, disconnectWallet };
}
