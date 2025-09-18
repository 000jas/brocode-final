"use client";

import { useState, useEffect, useContext } from "react";
import { WalletContext } from "@/context/WalletContext";
import { useVault } from "@/hooks/useVault";

interface Vault {
  id: number;
  name: string;
  totalDeposits: string;
  members: number;
}

export default function VaultsPage() {
  const { account } = useContext(WalletContext);
  const { getVaults, createVault, joinVault } = useVault();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [newVaultName, setNewVaultName] = useState("");

  useEffect(() => {
    getVaults().then((v) => setVaults(v));
  }, []);

  const handleCreateVault = async () => {
    if (!newVaultName) return;
    await createVault(newVaultName);
    setNewVaultName("");
    const updated = await getVaults();
    setVaults(updated);
  };

  const handleJoinVault = async (id: number) => {
    await joinVault(id, "0.01"); // Example: deposit 0.01 SHM
    const updated = await getVaults();
    setVaults(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏦 Vaults</h1>

      {!account ? (
        <p className="text-gray-500">Connect wallet to view vaults.</p>
      ) : (
        <>
          {/* Create Vault */}
          <div className="mb-6 p-4 bg-white shadow rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Create New Vault</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Vault name"
                value={newVaultName}
                onChange={(e) => setNewVaultName(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleCreateVault}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>

          {/* Vault List */}
          <div className="grid md:grid-cols-2 gap-4">
            {vaults.length === 0 ? (
              <p className="text-gray-500">No vaults available.</p>
            ) : (
              vaults.map((vault) => (
                <div
                  key={vault.id}
                  className="p-4 bg-white shadow rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{vault.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Deposits: {vault.totalDeposits} SHM
                    </p>
                    <p className="text-sm text-gray-600">
                      Members: {vault.members}
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoinVault(vault.id)}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Join Vault
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
