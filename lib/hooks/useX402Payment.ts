'use client'

/**
 * x402 Micropayment Hook
 * Client-side hook for initiating and tracking x402 payments
 */

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, encodeFunctionData } from 'viem'
import { base } from 'viem/chains'

// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

// Evoworks treasury address (receives payments, distributes to publishers)
const EVOWORKS_TREASURY = '0x742d35Cc6634C0532925a3b844Bc9e7595f8c4e0' as const

// ERC20 Transfer ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export type PaymentStatus = 'idle' | 'initiating' | 'awaiting_signature' | 'pending' | 'confirming' | 'success' | 'error'

export interface PaymentDetails {
  listingSlug: string
  listingName: string
  amountCents: number // Price in cents (e.g., 500 = $5.00)
  publisherAddress?: string
}

export interface UseX402PaymentResult {
  status: PaymentStatus
  txHash: string | null
  error: string | null
  initiatePayment: (details: PaymentDetails) => Promise<boolean>
  reset: () => void
  isConnected: boolean
  address: string | undefined
}

export function useX402Payment(): UseX402PaymentResult {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingDetails, setPendingDetails] = useState<PaymentDetails | null>(null)

  const { writeContractAsync } = useWriteContract()

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  })

  // Update status based on confirmation
  if (isConfirming && status === 'pending') {
    setStatus('confirming')
  }
  if (isSuccess && status === 'confirming') {
    setStatus('success')
    // Record the transaction on the backend
    if (pendingDetails && txHash) {
      recordTransaction(pendingDetails, txHash)
    }
  }

  const initiatePayment = useCallback(async (details: PaymentDetails): Promise<boolean> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return false
    }

    setStatus('initiating')
    setError(null)
    setTxHash(null)
    setPendingDetails(details)

    try {
      // Convert cents to USDC (6 decimals)
      // $5.00 = 500 cents = 5_000_000 USDC units
      const amountUSDC = parseUnits((details.amountCents / 100).toString(), 6)

      setStatus('awaiting_signature')

      // Send USDC to treasury (or direct to publisher if set)
      const recipient = details.publisherAddress || EVOWORKS_TREASURY

      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, amountUSDC],
        chainId: base.id,
      })

      setTxHash(hash)
      setStatus('pending')
      
      return true
    } catch (err) {
      console.error('Payment failed:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
      setStatus('error')
      return false
    }
  }, [isConnected, address, writeContractAsync])

  const reset = useCallback(() => {
    setStatus('idle')
    setTxHash(null)
    setError(null)
    setPendingDetails(null)
  }, [])

  return {
    status,
    txHash,
    error,
    initiatePayment,
    reset,
    isConnected,
    address,
  }
}

// Record successful transaction to backend
async function recordTransaction(details: PaymentDetails, txHash: string) {
  try {
    await fetch('/api/x402/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingSlug: details.listingSlug,
        txHash,
        amountCents: details.amountCents,
      }),
    })
  } catch (err) {
    console.error('Failed to record transaction:', err)
  }
}

export default useX402Payment

