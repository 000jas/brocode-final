import { ethers } from 'ethers';
import { TransactionService } from './transactionService';

// Contract ABIs (you'll need to update these with your actual contract ABIs)
const DEPOSIT_VAULT_ABI = [
  "event Deposited(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawn(uint256 indexed vaultId, address indexed user, uint256 amount, uint256 timestamp)",
  "event VaultCreated(uint256 indexed vaultId)",
  "event AuthorizedWithdrawerSet(address indexed withdrawer, bool allowed)"
];

const WITHDRAW_HANDLER_ABI = [
  "event WithdrawRequested(address indexed user, uint256 indexed vaultId, uint256 amount, uint256 timestamp)"
];

const SHM_TOKEN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private depositVaultContract: ethers.Contract;
  private withdrawHandlerContract: ethers.Contract;
  private shmTokenContract: ethers.Contract;
  private isListening: boolean = false;

  constructor(
    rpcUrl: string,
    depositVaultAddress: string,
    withdrawHandlerAddress: string,
    shmTokenAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    this.depositVaultContract = new ethers.Contract(
      depositVaultAddress,
      DEPOSIT_VAULT_ABI,
      this.provider
    );
    
    this.withdrawHandlerContract = new ethers.Contract(
      withdrawHandlerAddress,
      WITHDRAW_HANDLER_ABI,
      this.provider
    );
    
    this.shmTokenContract = new ethers.Contract(
      shmTokenAddress,
      SHM_TOKEN_ABI,
      this.provider
    );
  }

  // Start listening to blockchain events
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('Already listening to blockchain events');
      return;
    }

    try {
      // Listen to DepositVault events
      this.depositVaultContract.on('Deposited', async (vaultId, user, amount, timestamp, event) => {
        await this.handleDepositedEvent(vaultId, user, amount, timestamp, event);
      });

      this.depositVaultContract.on('Withdrawn', async (vaultId, user, amount, timestamp, event) => {
        await this.handleWithdrawnEvent(vaultId, user, amount, timestamp, event);
      });

      this.depositVaultContract.on('VaultCreated', async (vaultId, event) => {
        await this.handleVaultCreatedEvent(vaultId, event);
      });

      this.depositVaultContract.on('AuthorizedWithdrawerSet', async (withdrawer, allowed, event) => {
        await this.handleAuthorizedWithdrawerSetEvent(withdrawer, allowed, event);
      });

      // Listen to WithdrawHandler events
      this.withdrawHandlerContract.on('WithdrawRequested', async (user, vaultId, amount, timestamp, event) => {
        await this.handleWithdrawRequestedEvent(user, vaultId, amount, timestamp, event);
      });

      // Listen to SHM Token events
      this.shmTokenContract.on('Transfer', async (from, to, value, event) => {
        await this.handleTransferEvent(from, to, value, event);
      });

      this.isListening = true;
      console.log('Started listening to blockchain events');
    } catch (error) {
      console.error('Error starting blockchain event listener:', error);
      throw error;
    }
  }

  // Stop listening to blockchain events
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      this.depositVaultContract.removeAllListeners();
      this.withdrawHandlerContract.removeAllListeners();
      this.shmTokenContract.removeAllListeners();
      
      this.isListening = false;
      console.log('Stopped listening to blockchain events');
    } catch (error) {
      console.error('Error stopping blockchain event listener:', error);
      throw error;
    }
  }

  // Handle Deposited event
  private async handleDepositedEvent(
    vaultId: bigint,
    user: string,
    amount: bigint,
    timestamp: bigint,
    event: ethers.EventLog
  ): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordTransaction(
        user,
        Number(vaultId),
        amount.toString(),
        'deposit',
        event.transactionHash,
        block.number,
        block.timestamp
      );

      await TransactionService.recordContractEvent(
        event.address,
        'Deposited',
        {
          vaultId: vaultId.toString(),
          user,
          amount: amount.toString(),
          timestamp: timestamp.toString()
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded deposit: ${user} deposited ${amount} to vault ${vaultId}`);
    } catch (error) {
      console.error('Error handling Deposited event:', error);
    }
  }

  // Handle Withdrawn event
  private async handleWithdrawnEvent(
    vaultId: bigint,
    user: string,
    amount: bigint,
    timestamp: bigint,
    event: ethers.EventLog
  ): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordTransaction(
        user,
        Number(vaultId),
        amount.toString(),
        'withdrawal',
        event.transactionHash,
        block.number,
        block.timestamp
      );

      await TransactionService.recordContractEvent(
        event.address,
        'Withdrawn',
        {
          vaultId: vaultId.toString(),
          user,
          amount: amount.toString(),
          timestamp: timestamp.toString()
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded withdrawal: ${user} withdrew ${amount} from vault ${vaultId}`);
    } catch (error) {
      console.error('Error handling Withdrawn event:', error);
    }
  }

  // Handle VaultCreated event
  private async handleVaultCreatedEvent(vaultId: bigint, event: ethers.EventLog): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordContractEvent(
        event.address,
        'VaultCreated',
        {
          vaultId: vaultId.toString()
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded vault creation: vault ${vaultId} created`);
    } catch (error) {
      console.error('Error handling VaultCreated event:', error);
    }
  }

  // Handle AuthorizedWithdrawerSet event
  private async handleAuthorizedWithdrawerSetEvent(
    withdrawer: string,
    allowed: boolean,
    event: ethers.EventLog
  ): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordContractEvent(
        event.address,
        'AuthorizedWithdrawerSet',
        {
          withdrawer,
          allowed
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded authorized withdrawer: ${withdrawer} set to ${allowed}`);
    } catch (error) {
      console.error('Error handling AuthorizedWithdrawerSet event:', error);
    }
  }

  // Handle WithdrawRequested event
  private async handleWithdrawRequestedEvent(
    user: string,
    vaultId: bigint,
    amount: bigint,
    timestamp: bigint,
    event: ethers.EventLog
  ): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordContractEvent(
        event.address,
        'WithdrawRequested',
        {
          user,
          vaultId: vaultId.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString()
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded withdraw request: ${user} requested ${amount} from vault ${vaultId}`);
    } catch (error) {
      console.error('Error handling WithdrawRequested event:', error);
    }
  }

  // Handle Transfer event
  private async handleTransferEvent(
    from: string,
    to: string,
    value: bigint,
    event: ethers.EventLog
  ): Promise<void> {
    try {
      const block = await event.getBlock();

      await TransactionService.recordContractEvent(
        event.address,
        'Transfer',
        {
          from,
          to,
          value: value.toString()
        },
        event.transactionHash,
        block.number,
        block.timestamp
      );

      console.log(`Recorded transfer: ${value} tokens from ${from} to ${to}`);
    } catch (error) {
      console.error('Error handling Transfer event:', error);
    }
  }

  // Get contract addresses
  getContractAddresses(): {
    depositVault: string;
    withdrawHandler: string;
    shmToken: string;
  } {
    return {
      depositVault: this.depositVaultContract.target as string,
      withdrawHandler: this.withdrawHandlerContract.target as string,
      shmToken: this.shmTokenContract.target as string
    };
  }

  // Check if listening
  isEventListening(): boolean {
    return this.isListening;
  }
}
