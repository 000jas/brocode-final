"use client";

import { useWallet } from "@/context/WalletContext";
import Link from "next/link";

export default function HomePage() {
  const { account, connectWallet, disconnectWallet, isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">🏦 BroCode Vault</h1>
        
        <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          
          {isConnected ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">✅ Wallet Connected</p>
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">Address:</span> {account}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Disconnect
                </button>
                <Link
                  href="/portfolio"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Connect your wallet to get started</p>
              <button
                onClick={connectWallet}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto mt-8">
          <h3 className="text-lg font-semibold mb-4">Navigation</h3>
          <div className="flex gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              📊 Portfolio
            </Link>
            <Link
              href="/transactions"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              📋 Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
