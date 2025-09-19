// src/hooks/useWallet.ts
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install it.");
        return;
      }

      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const userAddress = accounts[0];
      setAddress(userAddress);

      // ✅ Save address to Supabase
      await supabase.from("users").upsert([{ address: userAddress }]);

      return userAddress;
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  }

  return { address, isConnecting, connectWallet };
}
