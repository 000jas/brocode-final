"use client";

interface VaultCardProps {
  name: string;
  totalDeposits: string;
  members: number;
  onJoin: () => void;
}

export default function VaultCard({ name, totalDeposits, members, onJoin }: VaultCardProps) {
  return (
    <div className="p-4 bg-white shadow rounded-xl flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Total Deposits: {totalDeposits} SHM
        </p>
        <p className="text-sm text-gray-600">Members: {members}</p>
      </div>

      <button
        onClick={onJoin}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Join Vault
      </button>
    </div>
  );
}
