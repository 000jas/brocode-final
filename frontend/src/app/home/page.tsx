"use client";

import { useWallet } from "@/context/WalletContext";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const { account: address } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VaultX Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your vault management dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">VaultX Dashboard</h2>
          {address ? (
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Connected Address:</span>
              </p>
              <p className="text-sm text-gray-500 font-mono bg-gray-50 p-2 rounded">
                {address}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Short Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-sm text-green-600 mt-2">
                ✓ Wallet connected successfully
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No wallet connected</p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <p className="text-2xl font-bold text-blue-600">$0.00</p>
            <p className="text-sm text-gray-500">Available funds</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Active Vaults</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Participating vaults</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Returns</h3>
            <p className="text-2xl font-bold text-purple-600">$0.00</p>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
