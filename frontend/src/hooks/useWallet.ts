"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { supabase } from '@/lib/supabase'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export function useWallet() {
  const [account, setAccount] = useState<string>("")
  const [balance, setBalance] = useState<string>("0")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask.")
      return
    }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setAccount(address)
      setIsConnected(true)
      
      // Get balance
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
      
      // Store user in Supabase
      try {
        // Check if Supabase is properly configured
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!supabaseKey || supabaseKey === 'your-anon-key') {
          console.warn('Supabase not configured properly. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
        } else {
          const { error } = await supabase
            .from('users')
            .upsert({ 
              id: address, 
              wallet_address: address,
              updated_at: new Date().toISOString()
            })
          
          if (error) {
            console.error('Error storing user in Supabase:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            })
          } else {
            console.log('User stored successfully in Supabase')
          }
        }
      } catch (error) {
        console.error('Failed to store user in Supabase:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error
        })
      }
      
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAccount("")
    setBalance("0")
    setIsConnected(false)
  }

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts: unknown) => {
          const accountList = accounts as string[]
          if (accountList.length > 0) {
            setAccount(accountList[0])
            setIsConnected(true)
            
            // Load balance
            const provider = new ethers.BrowserProvider(window.ethereum!)
            provider.getBalance(accountList[0]).then(bal => {
              setBalance(ethers.formatEther(bal))
            })
            
            // Check if user exists in Supabase, if not create them
            try {
              // Check if Supabase is properly configured
              const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              if (!supabaseKey || supabaseKey === 'your-anon-key') {
                console.warn('Supabase not configured properly. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
                return
              }

              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', accountList[0])
                .single()
              
              if (error && error.code === 'PGRST116') {
                // User doesn't exist, create them
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({ 
                    id: accountList[0], 
                    wallet_address: accountList[0],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                
                if (insertError) {
                  console.error('Error creating user in Supabase:', insertError)
                } else {
                  console.log('User created successfully in Supabase')
                }
              } else if (error) {
                console.error('Error checking user in Supabase:', {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint
                })
              } else {
                console.log('User found in Supabase:', data)
              }
            } catch (error) {
              console.error('Failed to check/create user in Supabase:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                error: error
              })
            }
          }
        })
    }
  }, [])

  return {
    account,
    address: account, // Alias for compatibility
    balance,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet
  }
}
