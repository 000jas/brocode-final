"use client";

import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { address, disconnectWallet } = useWallet();
  const router = useRouter();

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VaultX Dashboard</h1>
          <Button onClick={handleDisconnect} variant="danger">
            Disconnect Wallet
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Connected Address:</span> {address}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Short Address:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
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
