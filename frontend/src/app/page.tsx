
// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";

export default function ConnectVaultPage() {
  const { connectWallet, account: address, isConnected } = useWallet();
  const router = useRouter();

  async function handleConnect() {
    try {
      await connectWallet();
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push("/home"); // Redirect to home after connection
      }, 100);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Welcome to Micro-Mint</h1>
      <p className="mb-6 text-gray-600">
        Connect your wallet to start exploring and investing in vaults.
      </p>
      <Button
        onClick={handleConnect}
        disabled={isConnected}
        className="px-6 py-3 text-lg rounded-xl"
      >
        {isConnected ? "Connected" : "Connect Wallet"}
      </Button>
      {address && (
        <p className="mt-4 text-sm text-green-600">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      )}
    </div>
  );
}
