"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { account, disconnectWallet } = useWallet();

  const handleDisconnect = () => {
    disconnectWallet();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/home", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/vaults", label: "Vaults" },
    { href: "/create-vault", label: "Create Vault" },
    { href: "/transactions", label: "Transactions" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/home" className="text-xl font-bold">
          VaultX
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-blue-400 transition-colors ${
                pathname === item.href ? "text-blue-400 font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Wallet Info & Disconnect */}
        <div className="flex items-center space-x-4">
          {account && (
            <span className="px-3 py-2 rounded-lg bg-gray-800 text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          )}
          <Button onClick={handleDisconnect} variant="danger" size="sm">
            Disconnect
          </Button>
        </div>
      </div>
    </nav>
  );
}