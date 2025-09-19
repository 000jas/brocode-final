"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/hooks/useVault";

export default function HomePage() {
  const { account } = useWallet();
  const { getBalance } = useVault();

  const [balance, setBalance] = useState<string>("0");
  const [totalReturns, setTotalReturns] = useState<string>("0");

  useEffect(() => {
    let isActive = true;
    const fetchBalance = async () => {
      if (!account) {
        setBalance("0");
        return;
      }
      const b = await getBalance(account);
      if (isActive) setBalance(b);
    };
    fetchBalance();
    return () => {
      isActive = false;
    };
  }, [account, getBalance]);

  useEffect(() => {
    // Demo-only: derive mock returns from balance
    try {
      const returns = (parseFloat(balance || "0") * 0.05).toFixed(2);
      setTotalReturns(returns);
    } catch {
      setTotalReturns("0");
    }
  }, [balance]);

  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-6 py-8 max-w-6xl mx-auto">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">🏦 BroCode Vault</h1>
          <p className="text-gray-600 mt-2">Secure, simple, and transparent community vaults on Shardeum.</p>
        </section>

       
       

        
      </main>
    </div>
  );
}
