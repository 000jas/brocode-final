"use client";

interface DashboardProps {
  balance: string;
  totalReturns: string;
}

export default function Dashboard({ balance, totalReturns }: DashboardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-md">
      <h2 className="text-xl font-semibold mb-4">📊 Dashboard</h2>
      <p className="text-lg">Vault Balance: {balance} SHM</p>
      <p className="text-lg">Total Returns: {totalReturns} SHM</p>
    </div>
  );
}