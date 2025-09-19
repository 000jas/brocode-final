"use client";

import { useWallet } from "@/lib/useWallet";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function VaultsPage() {
  const { address } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vaults</h1>
            <p className="text-gray-600 mt-2">Discover and join community vaults or create your own</p>
          </div>
          <Button variant="primary">Create Vault</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Community Vaults</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Available to join</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">My Vaults</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Created by me</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Joined Vaults</h3>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Currently participating</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Vaults</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No vaults available yet</p>
            <p className="text-sm">Be the first to create a community vault</p>
          </div>
        </div>
      </div>
    </div>
  );
}