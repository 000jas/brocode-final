# Supabase Integration for Transaction Tracking

This document explains how to set up and use the Supabase integration for tracking all blockchain transactions in your vault system.

## Overview

The Supabase integration provides:
- **Real-time transaction tracking** from blockchain events
- **Comprehensive transaction history** with filtering and search
- **User portfolio tracking** with vault balances
- **Transaction statistics** and analytics
- **Automatic event logging** for all contract interactions

## Database Schema

The integration uses the following main tables:

### `users`
- Stores user wallet addresses
- Automatically created when first transaction occurs

### `vaults`
- Stores vault information (ID, name, description, APY)
- Pre-populated with sample vaults

### `transactions`
- Records all deposits, withdrawals, and vault operations
- Links to users and vaults
- Stores blockchain transaction details (hash, block number, gas used)

### `user_vaults`
- Tracks user balances in each vault
- Automatically updated on deposits/withdrawals

### `contract_events`
- Logs all contract events for debugging and analytics
- Stores event data as JSON

## Setup Instructions

### 1. Database Setup

Run the database setup script:

```bash
cd frontend
npm install
node setup-db.js
```

Or manually execute the SQL in `supabase-schema.sql` in your Supabase dashboard.

### 2. Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key (for admin operations)
- `NEXT_PUBLIC_RPC_URL`: Your blockchain RPC URL
- Contract addresses for your deployed contracts

### 3. Contract Addresses

Update the contract addresses in your environment file:
- `NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS`
- `NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS`
- `NEXT_PUBLIC_SHM_TOKEN_ADDRESS`

## Usage

### Automatic Transaction Tracking

The system automatically tracks transactions through blockchain event listeners:

```tsx
import BlockchainListener from '@/components/BlockchainListener'

// Add to your main app component
<BlockchainListener
  rpcUrl={process.env.NEXT_PUBLIC_RPC_URL}
  depositVaultAddress={process.env.NEXT_PUBLIC_DEPOSIT_VAULT_ADDRESS}
  withdrawHandlerAddress={process.env.NEXT_PUBLIC_WITHDRAW_HANDLER_ADDRESS}
  shmTokenAddress={process.env.NEXT_PUBLIC_SHM_TOKEN_ADDRESS}
  onError={(error) => console.error('Blockchain listener error:', error)}
/>
```

### Manual Transaction Recording

You can also manually record transactions:

```typescript
import { TransactionService } from '@/services/transactionService'

// Record a transaction
await TransactionService.recordTransaction(
  walletAddress,
  vaultId,
  amount,
  'deposit',
  txHash,
  blockNumber,
  blockTimestamp,
  gasUsed,
  gasPrice
)
```

### Fetching Transaction Data

```typescript
// Get user transactions
const transactions = await TransactionService.getUserTransactions(walletAddress, 50)

// Get all transactions (admin view)
const allTransactions = await TransactionService.getAllTransactions(100)

// Get user vault balances
const balances = await TransactionService.getUserVaultBalances(walletAddress)

// Get transaction statistics
const stats = await TransactionService.getTransactionStats()
```

## Components

### TransactionList
Displays transactions with Supabase integration:

```tsx
<TransactionList
  transactions={transactions}
  isLoading={isLoading}
  useSupabase={true}
/>
```

### TransactionsPage
Full transaction history page with filtering and statistics.

### BlockchainListener
Background service for automatic transaction tracking.

## API Functions

### Database Functions

The schema includes several PostgreSQL functions:

- `ensure_user_exists(wallet_address)`: Creates user if not exists
- `record_transaction(...)`: Records transaction and updates balances
- `record_contract_event(...)`: Logs contract events

### TransactionService Methods

- `recordTransaction()`: Record a new transaction
- `recordContractEvent()`: Log a contract event
- `getUserTransactions()`: Get user's transaction history
- `getAllTransactions()`: Get all transactions (admin)
- `getUserVaultBalances()`: Get user's vault balances
- `getTransactionStats()`: Get transaction statistics
- `getContractEvents()`: Get contract events
- `formatAmount()`: Format amounts for display
- `formatTimestamp()`: Format timestamps for display

## Event Tracking

The system tracks these contract events:

### DepositVault Events
- `Deposited`: User deposits to vault
- `Withdrawn`: User withdraws from vault
- `VaultCreated`: New vault created
- `AuthorizedWithdrawerSet`: Withdrawer authorization changed

### WithdrawHandler Events
- `WithdrawRequested`: Withdrawal request made

### SHM Token Events
- `Transfer`: Token transfers

## Security Considerations

1. **Service Key**: Keep your Supabase service key secure and never expose it in client-side code
2. **RLS Policies**: Consider implementing Row Level Security policies for production
3. **Input Validation**: All inputs are validated before database insertion
4. **Error Handling**: Comprehensive error handling prevents data corruption

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your Supabase URL and keys are correct
2. **Contract Addresses**: Verify contract addresses match your deployed contracts
3. **RPC URL**: Ensure your RPC URL is accessible and supports event listening
4. **Permissions**: Check that your Supabase service key has necessary permissions

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'blockchain-service')
```

### Manual Database Operations

If automatic setup fails, you can manually run the SQL:

1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy contents of `supabase-schema.sql`
4. Execute the SQL

## Performance Optimization

1. **Indexes**: The schema includes optimized indexes for common queries
2. **Pagination**: Use limit parameters for large datasets
3. **Caching**: Consider implementing client-side caching for frequently accessed data
4. **Batch Operations**: Use batch operations for multiple transactions

## Monitoring

Monitor your integration:

1. **Supabase Dashboard**: Check database performance and logs
2. **Browser Console**: Monitor blockchain event listener status
3. **Transaction Counts**: Verify transactions are being recorded
4. **Error Logs**: Check for any integration errors

## Future Enhancements

Potential improvements:
- Real-time notifications for new transactions
- Advanced analytics and reporting
- Export functionality for transaction data
- Integration with additional blockchain networks
- Automated compliance reporting
