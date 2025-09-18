"use client";

import { useContext, useEffect, useState } from "react";
import { WalletContext } from "@/context/WalletContext";
import { useVault } from "@/hooks/useVault";

interface Tx {
  type: "deposit" | "withdraw";
  amount: string;
  txHash: string;
}

export default function TransactionsPage() {
  const { account } = useContext(WalletContext);
  const { getTransactions } = useVault(); // implement this in your hook
  const [transactions, setTransactions] = useState<Tx[]>([]);

  useEffect(() => {
    if (account) {
      getTransactions(account).then((txs) => setTransactions(txs));
    }
  }, [account]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📜 Transactions</h1>

      {!account ? (
        <p className="text-gray-500">Connect wallet to view your transactions.</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Amount</th>
                <th className="border px-4 py-2 text-left">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 capitalize">{tx.type}</td>
                  <td className="border px-4 py-2">{tx.amount} SHM</td>
                  <td className="border px-4 py-2">
                    <a
                      href={`https://explorer-sphinx.shardeum.org/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
