"use client"

import { motion } from 'framer-motion'
import { Plus, TrendingUp, DollarSign, PieChart as PieChartIcon } from 'lucide-react'
import PortfolioChart from './PortfolioChart'
import VaultCard from './VaultCard'
import { useWallet } from '@/hooks/useWallet'

interface PortfolioPageProps {
  onTabChange: (tab: string) => void
}

export default function PortfolioPage({ onTabChange }: PortfolioPageProps) {
  const { isConnected } = useWallet()

  // Data will be loaded from Supabase
  const portfolioData: { date: string; invested: number; yield: number }[] = []
  const vaultAllocations: { name: string; value: number; color: string }[] = []
  const userVaults: { id: number; name: string; description: string; apy: number; totalDeposits: number; userDeposit: number; isActive: boolean }[] = []

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <PieChartIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Connect your wallet to view your portfolio and start investing in our vaults.
          </p>
          <motion.button
            onClick={() => onTabChange('home')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Portfolio</h1>
          <p className="text-gray-300">
            Track your investments and yields across all vaults
          </p>
        </motion.div>

        {/* Portfolio Chart */}
        {portfolioData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <PortfolioChart data={portfolioData} vaultAllocations={vaultAllocations} />
          </motion.div>
        )}

        {/* Your Vaults Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Vaults</h2>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Vault</span>
            </motion.button>
          </div>

          {userVaults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userVaults.map((vault, index) => (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <VaultCard
                    vault={vault}
                    onDeposit={(vaultId) => {
                      console.log('Deposit to vault:', vaultId)
                      // Handle deposit logic
                    }}
                    onWithdraw={(vaultId) => {
                      console.log('Withdraw from vault:', vaultId)
                      // Handle withdraw logic
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No vaults yet</h3>
              <p className="text-gray-400">Start investing by adding your first vault</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Deposit Funds</span>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">View Analytics</span>
            </motion.button>
            
            <motion.button
              onClick={() => onTabChange('transactions')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Transaction History</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
