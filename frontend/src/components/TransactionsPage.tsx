"use client"

import { motion } from 'framer-motion'
import { Download, RefreshCw, Calendar, Search } from 'lucide-react'
import TransactionList from './TransactionList'
import { useWallet } from '@/hooks/useWallet'
import { useState, useEffect, useCallback } from 'react'
import { TransactionService } from '@/services/transactionService'
import { Transaction as SupabaseTransaction } from '@/lib/supabase'

interface TransactionsPageProps {
  onTabChange: (tab: string) => void
}

export default function TransactionsPage({ onTabChange }: TransactionsPageProps) {
  const { isConnected, address } = useWallet()
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<SupabaseTransaction[]>([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalVolume: '0'
  })

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  const loadTransactions = useCallback(async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const userTransactions = await TransactionService.getUserTransactions(address, 100)
      setTransactions(userTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const loadStats = useCallback(async () => {
    try {
      const transactionStats = await TransactionService.getTransactionStats()
      setStats(transactionStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  const handleRefresh = async () => {
    await Promise.all([loadTransactions(), loadStats()])
  }

  useEffect(() => {
    if (isConnected && address) {
      loadTransactions()
      loadStats()
    }
  }, [isConnected, address, loadTransactions, loadStats])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Connect your wallet to view your transaction history.
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
              <p className="text-gray-300">
                Track all your deposits and withdrawals
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'deposit', label: 'Deposits' },
                  { key: 'withdrawal', label: 'Withdrawals' }
                ].map(({ key, label }) => (
                  <motion.button
                    key={key}
                    onClick={() => setFilter(key as 'all' | 'deposit' | 'withdrawal')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filter === key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transaction Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Total Deposits</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDeposits}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500/20 to-pink-600/20 rounded-xl p-6 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-white">{stats.totalWithdrawals}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Volume</p>
                  <p className="text-2xl font-bold text-white">{TransactionService.formatAmount(stats.totalVolume)} SHM</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TransactionList 
            transactions={filteredTransactions} 
            isLoading={isLoading}
            useSupabase={true}
          />
        </motion.div>
      </div>
    </div>
  )
}
