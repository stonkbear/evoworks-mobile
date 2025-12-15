'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { USDC_ADDRESS, USDC_ABI } from '@/lib/web3/config';
import { base } from 'wagmi/chains';

export function USDCBalance() {
  const { address, isConnected } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  if (!isConnected || !address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading balance...</span>
      </div>
    );
  }

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance as bigint, 6)).toFixed(2)
    : '0.00';

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-700">
      <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
        <span className="text-blue-400 font-bold text-sm">$</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">USDC Balance</span>
        <span className="text-lg font-bold text-white">
          ${formattedBalance}
        </span>
      </div>
    </div>
  );
}

