"use client";

import { useWallet } from "@/lib/useWallet";
import Navbar from "@/components/Navbar";

export default function TransactionsPage() {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">View your transaction history and track all vault activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Deposits</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-gray-500">All time</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Withdrawals</h3>
            <p className="text-2xl font-bold text-red-600">$0.00</p>
            <p className="text-sm text-gray-500">All time</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Rewards</h3>
            <p className="text-2xl font-bold text-purple-600">$0.00</p>
            <p className="text-sm text-gray-500">Earned</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Total count</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here once you start using vaults</p>
          </div>
        </div>
      </div>
    </div>
  );
}