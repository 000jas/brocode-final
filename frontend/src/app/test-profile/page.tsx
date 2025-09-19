"use client";

import { useWallet } from "@/context/WalletContext";
import { useSupabase } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TestProfilePage() {
  const { account, connectWallet, isConnected } = useWallet();
  const { getUserByWallet } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkProfile = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const userProfile = await getUserByWallet(account);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Profile Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Wallet Status:</p>
          <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </p>
        </div>

        {account && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Address:</p>
            <p className="font-mono text-sm break-all">{account}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={connectWallet}
            disabled={isConnected}
            className="w-full"
          >
            {isConnected ? "Already Connected" : "Connect Wallet"}
          </Button>

          <Button
            onClick={checkProfile}
            disabled={!isConnected || loading}
            className="w-full"
          >
            {loading ? "Checking..." : "Check Profile in Supabase"}
          </Button>
        </div>

        {profile && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Profile Found!</h3>
            <div className="text-sm text-green-700">
              <p><strong>ID:</strong> {profile.id}</p>
              <p><strong>Wallet Address:</strong> {profile.wallet_address}</p>
              <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {profile === null && isConnected && !loading && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 text-sm">
              No profile found. Try connecting your wallet first to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
