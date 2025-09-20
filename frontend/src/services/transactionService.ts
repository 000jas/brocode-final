import { supabase, Transaction, ContractEvent, Vault, UserVault } from '../lib/supabase';
import { ethers } from 'ethers';

export class TransactionService {
  // Record a transaction in the database
  static async recordTransaction(
    walletAddress: string,
    vaultId: number,
    amount: string,
    type: 'deposit' | 'withdrawal' | 'vault_created' | 'authorized_withdrawer_set',
    txHash: string,
    blockNumber: number,
    blockTimestamp: number,
    gasUsed?: number,
    gasPrice?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('record_transaction', {
        wallet_address_param: walletAddress,
        vault_id_param: vaultId,
        amount_param: amount,
        type_param: type,
        tx_hash_param: txHash,
        block_number_param: blockNumber,
        block_timestamp_param: blockTimestamp,
        gas_used_param: gasUsed,
        gas_price_param: gasPrice
      });

      if (error) {
        console.error('Error recording transaction:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to record transaction:', error);
      throw error;
    }
  }

  // Record a contract event
  static async recordContractEvent(
    contractAddress: string,
    eventName: string,
    eventData: Record<string, unknown>,
    txHash: string,
    blockNumber: number,
    blockTimestamp: number
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('record_contract_event', {
        contract_address_param: contractAddress,
        event_name_param: eventName,
        event_data_param: eventData,
        tx_hash_param: txHash,
        block_number_param: blockNumber,
        block_timestamp_param: blockTimestamp
      });

      if (error) {
        console.error('Error recording contract event:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to record contract event:', error);
      throw error;
    }
  }

  // Get all transactions for a user
  static async getUserTransactions(walletAddress: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          vaults (
            id,
            name,
            description,
            apy
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      throw error;
    }
  }

  // Get all transactions (admin view)
  static async getAllTransactions(limit: number = 100): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            wallet_address
          ),
          vaults (
            id,
            name,
            description,
            apy
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all transactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch all transactions:', error);
      throw error;
    }
  }

  // Get user's vault balances
  static async getUserVaultBalances(walletAddress: string): Promise<UserVault[]> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_vaults')
        .select(`
          *,
          vaults (
            id,
            name,
            description,
            apy
          )
        `)
        .eq('user_id', user.id)
        .gt('amount', '0');

      if (error) {
        console.error('Error fetching user vault balances:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch user vault balances:', error);
      throw error;
    }
  }

  // Get all vaults
  static async getAllVaults(): Promise<Vault[]> {
    try {
      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('is_active', true)
        .order('id');

      if (error) {
        console.error('Error fetching vaults:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch vaults:', error);
      throw error;
    }
  }

  // Get contract events
  static async getContractEvents(
    contractAddress?: string,
    eventName?: string,
    limit: number = 100
  ): Promise<ContractEvent[]> {
    try {
      let query = supabase
        .from('contract_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (contractAddress) {
        query = query.eq('contract_address', contractAddress);
      }

      if (eventName) {
        query = query.eq('event_name', eventName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contract events:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch contract events:', error);
      throw error;
    }
  }

  // Get transaction statistics
  static async getTransactionStats(): Promise<{
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalVolume: string;
  }> {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount');

      if (error) {
        console.error('Error fetching transaction stats:', error);
        throw error;
      }

      const stats = {
        totalTransactions: transactions?.length || 0,
        totalDeposits: transactions?.filter(t => t.type === 'deposit').length || 0,
        totalWithdrawals: transactions?.filter(t => t.type === 'withdrawal').length || 0,
        totalVolume: '0'
      };

      // Calculate total volume
      if (transactions) {
        const totalVolume = transactions.reduce((sum, tx) => {
          if (tx.type === 'deposit') {
            return sum + parseFloat(tx.amount);
          } else if (tx.type === 'withdrawal') {
            return sum - parseFloat(tx.amount);
          }
          return sum;
        }, 0);
        stats.totalVolume = totalVolume.toString();
      }

      return stats;
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error);
      throw error;
    }
  }

  // Format amount for display
  static formatAmount(amount: string, decimals: number = 18): string {
    try {
      const formatted = ethers.formatUnits(amount, decimals);
      return parseFloat(formatted).toFixed(4);
    } catch (error) {
      return amount;
    }
  }

  // Format timestamp for display
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }
}
