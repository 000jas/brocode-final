"use client";

import { useWallet } from "@/context/WalletContext";

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    account ? (
      <div className="flex items-center gap-2">
        <span className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    ) : (
      <button
        onClick={connectWallet}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        Connect Wallet
      </button>
    )
  );
}
