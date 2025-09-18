"use client";

import { useContext, useEffect, useState } from "react";
import { WalletContext } from "@/context/WalletContext";
import { useVault } from "@/hooks/useVault";

export default function PortfolioPage() {
  const { account } = useContext(WalletContext);
  const { getBalance } = useVault();
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    if (account) {
      getBalance(account).then((bal) => setBalance(bal));
    }
  }, [account]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Portfolio</h1>

      {!account ? (
        <p className="text-gray-500">Connect your wallet to view portfolio.</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 max-w-md">
          <p className="text-lg">Wallet: <span className="font-mono">{account}</span></p>
          <p className="text-xl font-semibold mt-4">
            Balance in Vault: {balance} SHM
          </p>

          <div className="mt-6 flex gap-4">
            <button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600">
              Deposit
            </button>
            <button className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
