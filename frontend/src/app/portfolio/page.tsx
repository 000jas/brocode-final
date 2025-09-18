"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/hooks/useVault";

export default function PortfolioPage() {
  const { account } = useWallet();
  const { getBalance, deposit, withdraw, loading, error } = useVault();
  const [balance, setBalance] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  useEffect(() => {
    if (account) {
      getBalance(account).then((bal: string) => setBalance(bal));
    }
  }, [account, getBalance]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert("Please enter a valid deposit amount");
      return;
    }
    
    const success = await deposit(depositAmount);
    if (success) {
      setDepositAmount("");
      // Refresh balance
      if (account) {
        getBalance(account).then((bal: string) => setBalance(bal));
      }
      alert("Deposit successful!");
    } else {
      alert("Deposit failed. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    
    const success = await withdraw(withdrawAmount);
    if (success) {
      setWithdrawAmount("");
      // Refresh balance
      if (account) {
        getBalance(account).then((bal: string) => setBalance(bal));
      }
      alert("Withdrawal successful!");
    } else {
      alert("Withdrawal failed. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Portfolio</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {!account ? (
        <p className="text-gray-500">Connect your wallet to view portfolio.</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 max-w-md">
          <p className="text-lg">Wallet: <span className="font-mono text-sm">{account}</span></p>
          <p className="text-xl font-semibold mt-4">
            Balance in Vault: {balance} SHM
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (SHM)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={loading}
                />
                <button 
                  onClick={handleDeposit}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Deposit"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdraw Amount (SHM)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                />
                <button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
