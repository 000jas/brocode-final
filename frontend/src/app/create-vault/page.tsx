"use client";

import { useState } from "react";
import VaultCreationForm from "@/components/VaultCreationForm";
import VaultList from "@/components/VaultList";
import DatabaseErrorBoundary from "@/components/DatabaseErrorBoundary";
import { useWallet } from "@/context/WalletContext";

export default function CreateVaultPage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<"create" | "list">("create");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vault Management</h1>
          <p className="text-gray-600">
            Create your own vault or explore existing vaults in the ecosystem
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "create"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Create Vault
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Vaults
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "create" && (
          <div className="flex justify-center">
            <DatabaseErrorBoundary>
              <VaultCreationForm />
            </DatabaseErrorBoundary>
          </div>
        )}

        {activeTab === "list" && (
          <DatabaseErrorBoundary>
            <VaultList />
          </DatabaseErrorBoundary>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Wallet Not Connected
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please connect your wallet to create a vault or view your vault details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
