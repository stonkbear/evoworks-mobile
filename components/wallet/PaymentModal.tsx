'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_ADDRESS, USDC_ABI } from '@/lib/web3/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    name: string;
    walletAddress: string;
  };
  task: {
    id: string;
    title: string;
  };
  payment: {
    paymentId: string;
    amount: string;
  };
  onSuccess?: (txHash: string) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  agent,
  task,
  payment,
  onSuccess,
}: PaymentModalProps) {
  const { address } = useAccount();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePayment = async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('pending');
      setErrorMessage('');

      // Convert USD amount to USDC (6 decimals)
      const usdcAmount = parseUnits(payment.amount, 6);

      // Send USDC to agent's wallet
      writeContract(
        {
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [agent.walletAddress as `0x${string}`, usdcAmount],
        },
        {
          onSuccess: async (txHash) => {
            setStatus('success');
            
            // Verify payment with backend
            try {
              const response = await fetch('/api/jarvis/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId: payment.paymentId,
                  transactionHash: txHash,
                }),
              });

              if (response.ok) {
                onSuccess?.(txHash);
              }
            } catch (error) {
              console.error('Failed to verify payment:', error);
            }
          },
          onError: (error) => {
            setStatus('error');
            setErrorMessage(error.message || 'Transaction failed');
          },
        }
      );
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Confirm Payment
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Pay with USDC on Base to hire this agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Agent Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Agent</h3>
            <p className="text-lg font-bold text-white">{agent.name}</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
            </p>
          </div>

          {/* Task Info */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Task</h3>
            <p className="text-white">{task.title}</p>
          </div>

          {/* Payment Amount */}
          <div className="p-6 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border-2 border-orange-500/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Amount</span>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  ${payment.amount}
                </p>
                <p className="text-sm text-gray-400">USDC on Base</p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'pending' && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-400">
                  {isConfirming ? 'Confirming transaction...' : 'Awaiting wallet approval...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please confirm in your wallet
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">Payment confirmed!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Agent is now working on your task
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Payment failed</p>
                <p className="text-xs text-gray-400 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status !== 'success' ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={status === 'pending'}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={status === 'pending' || !address}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {status === 'pending' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${payment.amount} USDC`
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

