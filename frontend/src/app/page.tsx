"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import PortfolioPage from "@/components/PortfolioPage";
import TransactionsPage from "@/components/TransactionsPage";
import BlockchainListener from "@/components/BlockchainListener";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onTabChange={setActiveTab} />;
      case "portfolio":
        return <PortfolioPage onTabChange={setActiveTab} />;
      case "transactions":
        return <TransactionsPage onTabChange={setActiveTab} />;
      default:
        return <HomePage onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Blockchain Event Listener - runs in background */}
      <BlockchainListener
        rpcUrl={process.env.NEXT_PUBLIC_RPC_URL || 'https://your-rpc-url'}
        depositVaultAddress={process.env.NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000'}
        withdrawHandlerAddress={process.env.NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS || '0x0000000000000000000000000000000000000000'}
        shmTokenAddress={process.env.NEXT_PUBLIC_SHM_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000'}
        onError={(error) => console.error('Blockchain listener error:', error)}
      />
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}