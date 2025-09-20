import { ethers } from 'ethers'
import { supabase } from '@/lib/supabase'

// Contract addresses - replace with your deployed addresses
const DEPOSIT_VAULT_ADDRESS = "0x718f3c219b639Acb984673cfa9D33a8fA6E8E918"
const WITHDRAW_HANDLER_ADDRESS = "0xF7E2A9666DABF1Ad1C4f830baB5051EDd7cacA0b"

// Contract ABIs
const DEPOSIT_VAULT_ABI = [
  "function createVault(uint256 vaultId) external",
  "function deposit(uint256 vaultId) external payable",
  "function balanceOf(uint256 vaultId, address user) external view returns (uint256)",
  "function setAuthorizedWithdrawer(address withdrawer, bool allowed) external",
  "function getVaultBalance(uint256 vaultId) external view returns (uint256)",
  "event Deposit(address indexed user, uint256 indexed vaultId, uint256 amount)",
  "event VaultCreated(uint256 indexed vaultId, address creator)"
]

const WITHDRAW_HANDLER_ABI = [
  "function withdraw(uint256 vaultId, uint256 amount) external",
  "event Withdrawal(address indexed user, uint256 indexed vaultId, uint256 amount)"
]

export class ContractService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected')
    }
    
    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
  }

  async deposit(vaultId: number, amount: string): Promise<string> {
    if (!this.signer) {
      await this.initialize()
    }

    try {
      const depositVault = new ethers.Contract(
        DEPOSIT_VAULT_ADDRESS,
        DEPOSIT_VAULT_ABI,
        this.signer!
      )

      const tx = await depositVault.deposit(vaultId, {
        value: ethers.parseEther(amount)
      })

      await tx.wait()
      
      // Store transaction in Supabase
      await this.storeTransaction({
        vaultId,
        amount: parseFloat(amount),
        type: 'deposit',
        txHash: tx.hash,
        status: 'confirmed'
      })

      return tx.hash
    } catch (error) {
      console.error('Deposit failed:', error)
      throw new Error(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async withdraw(vaultId: number, amount: string): Promise<string> {
    if (!this.signer) {
      await this.initialize()
    }

    try {
      const withdrawHandler = new ethers.Contract(
        WITHDRAW_HANDLER_ADDRESS,
        WITHDRAW_HANDLER_ABI,
        this.signer!
      )

      const tx = await withdrawHandler.withdraw(vaultId, ethers.parseEther(amount))
      await tx.wait()

      // Store transaction in Supabase
      await this.storeTransaction({
        vaultId,
        amount: parseFloat(amount),
        type: 'withdrawal',
        txHash: tx.hash,
        status: 'confirmed'
      })

      return tx.hash
    } catch (error) {
      console.error('Withdraw failed:', error)
      throw new Error(`Withdraw failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getVaultBalance(vaultId: number, userAddress: string): Promise<string> {
    if (!this.provider) {
      await this.initialize()
    }

    try {
      const depositVault = new ethers.Contract(
        DEPOSIT_VAULT_ADDRESS,
        DEPOSIT_VAULT_ABI,
        this.provider!
      )

      const balance = await depositVault.balanceOf(vaultId, userAddress)
      return ethers.formatEther(balance)
    } catch (error) {
      console.log('Vault not found or not created yet:', error)
      return '0'
    }
  }

  async getVaultTotalBalance(vaultId: number): Promise<string> {
    if (!this.provider) {
      await this.initialize()
    }

    const depositVault = new ethers.Contract(
      DEPOSIT_VAULT_ADDRESS,
      DEPOSIT_VAULT_ABI,
      this.provider!
    )

    const balance = await depositVault.getVaultBalance(vaultId)
    return ethers.formatEther(balance)
  }

  async createVault(vaultId: number): Promise<string> {
    if (!this.signer) {
      await this.initialize()
    }

    const depositVault = new ethers.Contract(
      DEPOSIT_VAULT_ADDRESS,
      DEPOSIT_VAULT_ABI,
      this.signer!
    )

    const tx = await depositVault.createVault(vaultId)
    await tx.wait()

    return tx.hash
  }

  private async storeTransaction(transaction: {
    vaultId: number
    amount: number
    type: 'deposit' | 'withdrawal'
    txHash: string
    status: 'pending' | 'confirmed' | 'failed'
  }) {
    if (!this.signer) return

    const userAddress = await this.signer.getAddress()
    
    await supabase
      .from('transactions')
      .insert({
        user_id: userAddress,
        vault_id: transaction.vaultId,
        amount: transaction.amount,
        type: transaction.type,
        tx_hash: transaction.txHash,
        status: transaction.status
      })

    // Update user vault balance
    await this.updateUserVaultBalance(userAddress, transaction.vaultId)
  }

  private async updateUserVaultBalance(userAddress: string, vaultId: number) {
    const balance = await this.getVaultBalance(vaultId, userAddress)
    
    await supabase
      .from('user_vaults')
      .upsert({
        user_id: userAddress,
        vault_id: vaultId,
        amount: parseFloat(balance),
        updated_at: new Date().toISOString()
      })
  }

  async getUserTransactions(userAddress: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userAddress)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getUserVaults(userAddress: string) {
    const { data, error } = await supabase
      .from('user_vaults')
      .select(`
        *,
        vaults (
          id,
          name,
          description,
          apy,
          total_deposits,
          is_active
        )
      `)
      .eq('user_id', userAddress)

    if (error) throw error
    return data || []
  }
}

export const contractService = new ContractService()
