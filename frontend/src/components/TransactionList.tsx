"use client"

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Transaction as SupabaseTransaction } from '@/lib/supabase'
import { TransactionService } from '@/services/transactionService'

interface Transaction {
  id: string
  vaultId: number
  amount: number
  type: 'deposit' | 'withdrawal'
  txHash: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'failed'
}

interface TransactionListProps {
  transactions: Transaction[] | SupabaseTransaction[]
  isLoading?: boolean
  useSupabase?: boolean
}

export default function TransactionList({ transactions, isLoading, useSupabase = false }: TransactionListProps) {
  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? ArrowDownLeft : ArrowUpRight
  }

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-400' : 'text-red-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSupabaseTransaction = (tx: SupabaseTransaction) => {
    return {
      id: tx.id,
      vaultId: tx.vault_id,
      amount: parseFloat(TransactionService.formatAmount(tx.amount)),
      type: tx.type as 'deposit' | 'withdrawal',
      txHash: tx.tx_hash,
      createdAt: tx.created_at,
      status: 'confirmed' as const
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-700 rounded w-20" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No transactions yet</h3>
        <p className="text-gray-400">Your transaction history will appear here once you start investing.</p>
      </motion.div>
    )
  }

  const displayTransactions = useSupabase 
    ? (transactions as SupabaseTransaction[]).map(formatSupabaseTransaction)
    : transactions as Transaction[]

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction, index) => {
        const Icon = getTransactionIcon(transaction.type)
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'deposit' 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className={`w-5 h-5 ${getTransactionColor(transaction.type)}`} />
              </motion.div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-white font-medium capitalize">
                    {transaction.type} to Vault #{transaction.vaultId}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <button
                  onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <span>View on Etherscan</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
