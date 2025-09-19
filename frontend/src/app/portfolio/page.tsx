"use client";

import { useWallet } from "@/lib/useWallet";
import Navbar from "@/components/Navbar";

export default function PortfolioPage() {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-2">Manage your vault investments and track performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Investment</h3>
            <p className="text-2xl font-bold text-blue-600">$0.00</p>
            <p className="text-sm text-gray-500">Across all vaults</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Returns</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-gray-500">Lifetime earnings</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Active Vaults</h3>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Currently participating</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Vault Holdings</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No vault investments yet</p>
            <p className="text-sm">Start by exploring available vaults or creating your own</p>
          </div>
        </div>
      </div>
    </div>
  );
}