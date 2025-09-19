
"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        Shardeum Vaults
      </Link>

      <div className="flex gap-6 items-center">
      <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/portfolio" className="hover:underline">Portfolio</Link>
        <Link href="/transactions" className="hover:underline">Transactions</Link>
        <Link href="/vaults" className="hover:underline">Vaults</Link>
        <WalletConnect />
      </div>
    </nav>
  );
}
