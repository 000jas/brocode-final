"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "@/lib/supabaseClient";
import { useWallet } from "@/context/WalletContext";

interface VaultFormData {
  vaultName: string;
  description: string;
  depositAmount: string;
}

interface ValidationErrors {
  vaultName?: string;
  depositAmount?: string;
  general?: string;
}

export default function VaultCreationForm() {
  const { account, isConnected } = useWallet();
  const [formData, setFormData] = useState<VaultFormData>({
    vaultName: "",
    description: "",
    depositAmount: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: ValidationErrors = {};

    // Validate vault name
    if (!formData.vaultName.trim()) {
      newErrors.vaultName = "Vault name is required";
    } else if (formData.vaultName.length < 3) {
      newErrors.vaultName = "Vault name must be at least 3 characters";
    }

    // Validate deposit amount
    const depositAmount = parseFloat(formData.depositAmount);
    if (!formData.depositAmount.trim()) {
      newErrors.depositAmount = "Deposit amount is required";
    } else if (isNaN(depositAmount) || depositAmount < 5) {
      newErrors.depositAmount = "Deposit amount must be at least 5 SHM";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      setErrors({ general: "Please connect your wallet first" });
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    setShowWarning(true);
  };

  const handleConfirmCreation = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate MetaMask transaction
      const depositAmount = parseFloat(formData.depositAmount);
      const txHash = await simulateMetaMaskTransaction(depositAmount);
      
      if (!txHash) {
        throw new Error("Transaction failed");
      }

      // Insert or update vault into Supabase after successful transaction
      const { data, error } = await supabase
        .from("vaults")
        .upsert({
          user_address: account,
          vault_name: formData.vaultName.trim(),
          description: formData.description.trim() || null,
          initial_deposit: depositAmount
        }, {
          onConflict: 'user_address,vault_name'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create vault: ${error.message}`);
      }

      // Success - reset form and show success message
      setFormData({ vaultName: "", description: "", depositAmount: "" });
      setShowWarning(false);
      alert(`Vault "${formData.vaultName}" saved successfully! Transaction: ${txHash}`);
      
      // Refresh the page to show updated vault list
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error creating vault:", error);
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateMetaMaskTransaction = async (amount: number): Promise<string | null> => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // For now, we'll simulate a transaction
      // In a real implementation, this would interact with your smart contract
      const tx = {
        to: "0x0000000000000000000000000000000000000000", // Placeholder address
        value: ethers.parseEther(amount.toString()),
        gasLimit: 21000
      };

      // For simulation, we'll just return a mock transaction hash
      // In production, you would call: const txResponse = await signer.sendTransaction(tx);
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockTxHash;
    } catch (error) {
      console.error("MetaMask transaction failed:", error);
      throw new Error("Transaction failed. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Vault</h2>
        <p className="text-gray-600">Please connect your wallet to create a vault.</p>
      </div>
    );
  }


  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Vault</h2>
      
      {showWarning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  ⚠️ The platform will charge 8% of the yield earned on this investment.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => setShowWarning(false)}
                    className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCreation}
                    disabled={isSubmitting}
                    className="ml-3 bg-yellow-100 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600 disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "I Understand, Create Vault"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showWarning && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div>
            <label htmlFor="vaultName" className="block text-sm font-medium text-gray-700 mb-1">
              Vault Name *
            </label>
            <input
              type="text"
              id="vaultName"
              name="vaultName"
              value={formData.vaultName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vaultName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter unique vault name"
            />
            {errors.vaultName && (
              <p className="mt-1 text-sm text-red-600">{errors.vaultName}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your vault (optional)"
            />
          </div>

          <div>
            <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Deposit (SHM) *
            </label>
            <input
              type="number"
              id="depositAmount"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleInputChange}
              min="5"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.depositAmount ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Minimum 5 SHM"
            />
            {errors.depositAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum deposit: 5 SHM
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Vault..." : "Create Vault"}
          </button>
        </form>
      )}
    </div>
  );
}
