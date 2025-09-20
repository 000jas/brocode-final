"use client";

import { useWallet } from "@/context/WalletContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import VaultList from "@/components/VaultList";
import DatabaseErrorBoundary from "@/components/DatabaseErrorBoundary";
import { useVault } from "@/hooks/useVault";
import { useState } from "react";

export default function VaultsPage() {
  const { account, isConnected } = useWallet();
  const { vaults, loading } = useVault();
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  // Filter vaults based on active tab
  const filteredVaults = activeTab === "my" 
    ? vaults.filter(vault => vault.user_address === account)
    : vaults;

  const myVaultsCount = vaults.filter(vault => vault.user_address === account).length;
  const allVaultsCount = vaults.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vaults</h1>
            <p className="text-gray-600 mt-2">Discover and join community vaults or create your own</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/create-vault'}
          >
            Create Vault
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Total Vaults</h3>
            <p className="text-2xl font-bold text-blue-600">{allVaultsCount}</p>
            <p className="text-sm text-gray-500">Available in ecosystem</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">My Vaults</h3>
            <p className="text-2xl font-bold text-green-600">{myVaultsCount}</p>
            <p className="text-sm text-gray-500">Created by me</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className="text-2xl font-bold text-purple-600">
              {isConnected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-sm text-gray-500">Wallet status</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Vaults
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Vaults
            </button>
          </div>
        </div>

        {/* Vault List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {activeTab === "all" ? "All Vaults" : "My Vaults"}
          </h2>
          
          <DatabaseErrorBoundary>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading vaults...</span>
              </div>
            ) : filteredVaults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">
                  {activeTab === "all" ? "No vaults available yet" : "You haven't created any vaults yet"}
                </p>
                <p className="text-sm">
                  {activeTab === "all" 
                    ? "Be the first to create a community vault" 
                    : "Create your first vault to get started"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVaults.map((vault) => (
                  <VaultCard key={vault.id} vault={vault} isOwnVault={vault.user_address === account} />
                ))}
              </div>
            )}
          </DatabaseErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// VaultCard component (same as in VaultList.tsx)
function VaultCard({ vault, isOwnVault }: { vault: any; isOwnVault: boolean }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg ${
      isOwnVault ? "border-blue-500 bg-blue-50" : "border-gray-200"
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {vault.vault_name}
            {isOwnVault && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Your Vault
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            Created by {formatAddress(vault.user_address)}
          </p>
        </div>
      </div>

      {vault.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {vault.description}
        </p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Initial Deposit:</span>
          <span className="text-sm font-semibold text-gray-900">
            {vault.initial_deposit} SHM
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Created:</span>
          <span className="text-sm text-gray-600">
            {formatDate(vault.created_at)}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Vault ID:</span>
          <span className="text-xs font-mono text-gray-400">
            {vault.id.slice(0, 8)}...
          </span>
        </div>
      </div>
    </div>
  );
}