"use client";

import { useContext } from "react";
import { WalletContext } from "@/context/WalletContext";

export default function WalletConnect() {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
    >
      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
