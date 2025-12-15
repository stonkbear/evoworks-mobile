/**
 * x402 Protocol Integration for Evoworks
 * 
 * Enables instant USDC payments for AI agent services using Coinbase's x402 protocol.
 * Perfect for Jarvis integration - autonomous AI-to-AI payments.
 */

import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import prisma from '@/lib/prisma';

// Initialize Coinbase SDK
const coinbase = new Coinbase({
  apiKeyName: process.env.COINBASE_API_KEY_NAME!,
  privateKey: process.env.COINBASE_API_KEY_PRIVATE!,
});

// USDC Contract on Base (Coinbase L2)
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export interface X402PaymentRequest {
  agentId: string;
  taskId: string;
  amount: number; // Amount in USD (e.g., 5.00 for $5)
  fromAddress: string; // Client's wallet address
  toAddress: string; // Agent's wallet address
  metadata?: {
    taskDescription?: string;
    estimatedDuration?: number;
    jarvisSessionId?: string;
  };
}

export interface X402PaymentResponse {
  success: boolean;
  transactionHash?: string;
  paymentId: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  message?: string;
}

/**
 * Create a payment request using x402 protocol
 * Returns HTTP 402 with payment details
 */
export async function createX402PaymentRequest(
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {
  try {
    // Convert USD to USDC (6 decimals)
    const usdcAmount = parseUnits(request.amount.toString(), 6);

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        agentId: request.agentId,
        taskId: request.taskId,
        amount: request.amount,
        currency: 'USDC',
        status: 'PENDING',
        provider: 'X402',
        metadata: {
          fromAddress: request.fromAddress,
          toAddress: request.toAddress,
          usdcAmount: usdcAmount.toString(),
          ...request.metadata,
        },
      },
    });

    return {
      success: true,
      paymentId: payment.id,
      amount: request.amount.toString(),
      status: 'pending',
      message: `Payment of ${request.amount} USDC required. Please approve transaction.`,
    };
  } catch (error) {
    console.error('x402 payment request failed:', error);
    return {
      success: false,
      paymentId: '',
      amount: request.amount.toString(),
      status: 'failed',
      message: error instanceof Error ? error.message : 'Payment request failed',
    };
  }
}

/**
 * Verify x402 payment on-chain
 * Called after client sends USDC transaction
 */
export async function verifyX402Payment(
  paymentId: string,
  transactionHash: string
): Promise<X402PaymentResponse> {
  try {
    // Get payment from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Create public client to verify transaction on Base
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Get transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
      confirmations: 1,
    });

    if (receipt.status === 'success') {
      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          transactionId: transactionHash,
          completedAt: new Date(),
        },
      });

      // Release task to agent
      await prisma.task.update({
        where: { id: payment.taskId },
        data: {
          status: 'IN_PROGRESS',
        },
      });

      return {
        success: true,
        transactionHash,
        paymentId,
        amount: payment.amount.toString(),
        status: 'confirmed',
        message: 'Payment confirmed. Task assigned to agent.',
      };
    } else {
      throw new Error('Transaction failed on-chain');
    }
  } catch (error) {
    console.error('x402 payment verification failed:', error);
    
    // Update payment as failed
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });

    return {
      success: false,
      paymentId,
      amount: '0',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

/**
 * Get wallet balance (USDC on Base)
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // USDC balanceOf ABI
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    // Convert from 6 decimals to USD
    return parseFloat(formatUnits(balance as bigint, 6));
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return 0;
  }
}

/**
 * Jarvis SDK Helper - Discover and hire agent in one call
 */
export async function jarvisHireAgent(params: {
  taskDescription: string;
  maxPrice: number;
  walletAddress: string;
  jarvisSessionId: string;
}): Promise<{
  success: boolean;
  agent?: any;
  task?: any;
  payment?: X402PaymentResponse;
  error?: string;
}> {
  try {
    // 1. Search for suitable agents
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
        capabilities: {
          has: params.taskDescription, // Simple capability matching
        },
      },
      orderBy: {
        trustScore: 'desc',
      },
      take: 1,
    });

    if (agents.length === 0) {
      return { success: false, error: 'No suitable agents found' };
    }

    const agent = agents[0];

    // 2. Create task
    const task = await prisma.task.create({
      data: {
        title: params.taskDescription,
        description: params.taskDescription,
        clientId: params.walletAddress, // Using wallet as client ID for now
        status: 'PENDING',
        budget: params.maxPrice,
        requirements: [params.taskDescription],
      },
    });

    // 3. Create payment request
    const payment = await createX402PaymentRequest({
      agentId: agent.id,
      taskId: task.id,
      amount: Math.min(params.maxPrice, 5.0), // Cap at agent's rate or max price
      fromAddress: params.walletAddress,
      toAddress: agent.walletAddress || agent.id, // Agent's wallet
      metadata: {
        taskDescription: params.taskDescription,
        jarvisSessionId: params.jarvisSessionId,
      },
    });

    return {
      success: true,
      agent,
      task,
      payment,
    };
  } catch (error) {
    console.error('Jarvis hire agent failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to hire agent',
    };
  }
}

/**
 * Auto-settle payment to agent after task completion
 */
export async function settleAgentPayment(taskId: string): Promise<boolean> {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        taskId,
        status: 'COMPLETED',
      },
      include: {
        agent: true,
      },
    });

    if (!payment || !payment.agent) {
      throw new Error('Payment or agent not found');
    }

    // In production, this would transfer USDC from escrow to agent's wallet
    // For now, just mark as settled
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        metadata: {
          ...(payment.metadata as object),
          settledAt: new Date().toISOString(),
        },
      },
    });

    // Update agent's earnings
    await prisma.agent.update({
      where: { id: payment.agentId },
      data: {
        totalEarnings: {
          increment: payment.amount,
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to settle agent payment:', error);
    return false;
  }
}

