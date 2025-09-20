"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, TrendingUp, Users, Wallet, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import VaultCard from './VaultCard'
import { useWallet } from '@/hooks/useWallet'
import { useState, useEffect, useCallback } from 'react'
import { contractService } from '@/services/contractService'

interface HomePageProps {
  onTabChange: (tab: string) => void
}

export default function HomePage({ onTabChange }: HomePageProps) {
  const { isConnected, account, balance } = useWallet()
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [vaultBalance, setVaultBalance] = useState('0')
  const [selectedVault, setSelectedVault] = useState(1)

  // Featured vault will be loaded from Supabase
  const featuredVault = null

  // Load vault balance when wallet connects
  const loadVaultBalance = useCallback(async () => {
    if (account) {
      try {
        const balance = await contractService.getVaultBalance(selectedVault, account)
        setVaultBalance(balance)
      } catch (error) {
        console.error('Error loading vault balance:', error)
        setVaultBalance('0')
      }
    }
  }, [account, selectedVault])

  // Handle deposit
  const handleDeposit = async () => {
    if (!account || !depositAmount) return
    
    setIsDepositing(true)
    try {
      const txHash = await contractService.deposit(selectedVault, depositAmount)
      console.log('Deposit successful:', txHash)
      setDepositAmount('')
      await loadVaultBalance()
      alert('Deposit successful!')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsDepositing(false)
    }
  }

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!account || !withdrawAmount) return
    
    setIsWithdrawing(true)
    try {
      const txHash = await contractService.withdraw(selectedVault, withdrawAmount)
      console.log('Withdraw successful:', txHash)
      setWithdrawAmount('')
      await loadVaultBalance()
      alert('Withdraw successful!')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('Withdraw failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Load vault balance when account changes
  useEffect(() => {
    if (account) {
      loadVaultBalance()
    }
  }, [account, selectedVault, loadVaultBalance])

  const features = [
    {
      icon: Shield,
      title: "Secure & Audited",
      description: "Smart contracts audited by leading security firms"
    },
    {
      icon: Zap,
      title: "Instant Deposits",
      description: "Deposit and withdraw funds instantly with no lock-up periods"
    },
    {
      icon: TrendingUp,
      title: "High Yields",
      description: "Earn up to 12.5% APY through automated DeFi strategies"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Governed by token holders with transparent decision making"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Micro-Mint
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            >
              The future of decentralized finance. Earn high yields on your Shardeum tokens 
              through our automated vault strategies. Secure, transparent, and profitable.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              {!isConnected ? (
                <motion.button
                  onClick={() => onTabChange('portfolio')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => onTabChange('portfolio')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Portfolio
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                onClick={() => onTabChange('transactions')}
                className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Transactions
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Dashboard Section */}
      {isConnected && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="py-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Your Dashboard</h2>
              <p className="text-gray-300 text-lg">Manage your investments and track your portfolio</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Wallet Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/30"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Wallet Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-1">Wallet Address</p>
                    <p className="text-white font-mono text-sm break-all">{account}</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-1">Wallet Balance</p>
                    <p className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(4)} SHM</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-1">Vault Balance (Vault #{selectedVault})</p>
                    <p className="text-2xl font-bold text-white">{parseFloat(vaultBalance).toFixed(4)} SHM</p>
                  </div>
                </div>
              </motion.div>

              {/* Deposit/Withdraw Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/30"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                </div>

                <div className="space-y-6">
                  {/* Vault Selection */}
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Select Vault</label>
                    <select
                      value={selectedVault}
                      onChange={(e) => setSelectedVault(Number(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500/50"
                    >
                      <option value={1}>Vault #1 - Shardeum DeFi</option>
                      <option value={2}>Vault #2 - Yield Farming</option>
                      <option value={3}>Vault #3 - Liquidity Mining</option>
                    </select>
                  </div>

                  {/* Deposit Section */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      <span>Deposit to Vault</span>
                    </h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Amount (SHM)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
                      />
                      <motion.button
                        onClick={handleDeposit}
                        disabled={isDepositing || !depositAmount}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isDepositing ? 'Depositing...' : 'Deposit'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Withdraw Section */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <ArrowUpRight className="w-5 h-5 text-red-400" />
                      <span>Withdraw from Vault</span>
                    </h4>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Amount (SHM)"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                      />
                      <motion.button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !withdrawAmount}
                        className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <motion.button
                    onClick={loadVaultBalance}
                    className="w-full py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Refresh Vault Balance
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose  Micro-Mint?</h2>
            <p className="text-gray-300 text-lg">Built for the future of DeFi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

        {/* Featured Vault Section */}
        {featuredVault && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="py-16 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Featured Vault</h2>
                <p className="text-gray-300 text-lg">Start earning with our most popular vault</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <VaultCard
                  vault={featuredVault}
                  onDeposit={(vaultId) => {
                    console.log('Deposit to vault:', vaultId)
                    // Handle deposit logic
                  }}
                  onWithdraw={(vaultId) => {
                    console.log('Withdraw from vault:', vaultId)
                    // Handle withdraw logic
                  }}
                />
              </div>
            </div>
          </motion.section>
        )}

      {/* Stats Section - Removed dummy data */}
    </div>
  )
}
