"use client"

import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, ArrowRight, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface VaultCardProps {
  vault: {
    id: number
    name: string
    description: string
    apy: number
    totalDeposits: number
    userDeposit?: number
    isActive: boolean
  }
  onDeposit?: (vaultId: number) => void
  onWithdraw?: (vaultId: number) => void
  showActions?: boolean
}

export default function VaultCard({ 
  vault, 
  onDeposit, 
  onWithdraw, 
  showActions = true 
}: VaultCardProps) {
  const { isActive, apy, totalDeposits, userDeposit = 0 } = vault

  if (!vault) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-600/30">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-8 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        isActive 
          ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-purple-500/30' 
          : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/30'
      } backdrop-blur-xl`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-xl" />
      
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span>{isActive ? 'Active' : 'Inactive'}</span>
        </motion.div>
        
        <motion.div
          className="flex items-center space-x-1 text-yellow-400"
          whileHover={{ scale: 1.1 }}
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-bold">{apy}% APY</span>
        </motion.div>
      </div>

      {/* Vault Info */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">{vault.name}</h3>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">{vault.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <motion.div 
            className="bg-white/5 rounded-lg p-3 border border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Total Deposits</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrency(totalDeposits)}</p>
          </motion.div>

          <motion.div 
            className="bg-white/5 rounded-lg p-3 border border-white/10"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Your Deposit</span>
            </div>
            <p className="text-lg font-bold text-white">{formatCurrency(userDeposit)}</p>
          </motion.div>
        </div>

        {/* Actions */}
        {showActions && isActive && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <motion.button
              onClick={() => onDeposit?.(vault.id)}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign className="w-4 h-4" />
              <span>Deposit</span>
            </motion.button>
            
            {userDeposit > 0 && (
              <motion.button
                onClick={() => onWithdraw?.(vault.id)}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowRight className="w-4 h-4" />
                <span>Withdraw</span>
              </motion.button>
            )}
          </div>
        )}

        {/* View Details Link */}
        <motion.button
          className="w-full mt-4 flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-sm font-medium">View Details</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}
