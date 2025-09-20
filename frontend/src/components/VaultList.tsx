"use client";

import { useVault, Vault } from "@/hooks/useVault";
import { useWallet } from "@/context/WalletContext";

export default function VaultList() {
  const { vaults, loading, error } = useVault();
  const { account } = useWallet();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vaults</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading vaults...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vaults</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading vaults: {error}</p>
        </div>
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vaults</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vaults yet</h3>
          <p className="text-gray-500">Be the first to create a vault!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vaults</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vaults.map((vault) => (
          <VaultCard key={vault.id} vault={vault} isOwnVault={vault.user_address === account} />
        ))}
      </div>
    </div>
  );
}

interface VaultCardProps {
  vault: Vault;
  isOwnVault: boolean;
}

function VaultCard({ vault, isOwnVault }: VaultCardProps) {
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
