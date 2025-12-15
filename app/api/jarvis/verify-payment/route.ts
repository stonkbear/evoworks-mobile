/**
 * Jarvis SDK Endpoint - Verify Payment
 * 
 * POST /api/jarvis/verify-payment
 * 
 * Verifies x402 payment on-chain and releases task to agent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Payment } from '@/lib/billing/x402';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, transactionHash } = body;

    if (!paymentId || !transactionHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: paymentId, transactionHash',
        },
        { status: 400 }
      );
    }

    // Verify payment on-chain
    const result = await verifyX402Payment(paymentId, transactionHash);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        paymentId: result.paymentId,
        transactionHash: result.transactionHash,
        amount: result.amount,
        status: result.status,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      },
      { status: 500 }
    );
  }
}

