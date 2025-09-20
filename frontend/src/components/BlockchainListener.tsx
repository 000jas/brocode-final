"use client"

import { useEffect, useState } from 'react'
import { BlockchainService } from '@/services/blockchainService'

interface BlockchainListenerProps {
  rpcUrl: string
  depositVaultAddress: string
  withdrawHandlerAddress: string
  shmTokenAddress: string
  onError?: (error: Error) => void
}

export default function BlockchainListener({
  rpcUrl,
  depositVaultAddress,
  withdrawHandlerAddress,
  shmTokenAddress,
  onError
}: BlockchainListenerProps) {
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = new BlockchainService(
          rpcUrl,
          depositVaultAddress,
          withdrawHandlerAddress,
          shmTokenAddress
        )
        
        setBlockchainService(service)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize blockchain service'
        setError(errorMessage)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    }

    initializeService()
  }, [rpcUrl, depositVaultAddress, withdrawHandlerAddress, shmTokenAddress, onError])

  useEffect(() => {
    if (!blockchainService) return

    const startListening = async () => {
      try {
        await blockchainService.startListening()
        setIsListening(true)
        setError(null)
        console.log('Blockchain event listener started successfully')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start blockchain listener'
        setError(errorMessage)
        setIsListening(false)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    }

    startListening()

    // Cleanup function
    return () => {
      if (blockchainService && isListening) {
        blockchainService.stopListening().catch(console.error)
        setIsListening(false)
      }
    }
  }, [blockchainService, onError, isListening])

  // This component doesn't render anything visible
  // It just manages the blockchain event listening in the background
  return null
}

// Hook to use blockchain listener
export function useBlockchainListener(
  rpcUrl: string,
  depositVaultAddress: string,
  withdrawHandlerAddress: string,
  shmTokenAddress: string
) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blockchainService, setBlockchainService] = useState<BlockchainService | null>(null)

  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = new BlockchainService(
          rpcUrl,
          depositVaultAddress,
          withdrawHandlerAddress,
          shmTokenAddress
        )
        
        setBlockchainService(service)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize blockchain service'
        setError(errorMessage)
      }
    }

    initializeService()
  }, [rpcUrl, depositVaultAddress, withdrawHandlerAddress, shmTokenAddress])

  const startListening = async () => {
    if (!blockchainService) return

    try {
      await blockchainService.startListening()
      setIsListening(true)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start blockchain listener'
      setError(errorMessage)
      setIsListening(false)
    }
  }

  const stopListening = async () => {
    if (!blockchainService) return

    try {
      await blockchainService.stopListening()
      setIsListening(false)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop blockchain listener'
      setError(errorMessage)
    }
  }

  return {
    isListening,
    error,
    startListening,
    stopListening,
    blockchainService
  }
}
