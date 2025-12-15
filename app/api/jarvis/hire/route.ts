/**
 * Jarvis SDK Endpoint - Hire Agent
 * 
 * POST /api/jarvis/hire
 * 
 * Allows Jarvis (or any AI assistant) to discover and hire agents autonomously.
 * Returns payment request that Jarvis can fulfill via x402.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jarvisHireAgent } from '@/lib/billing/x402';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { taskDescription, maxPrice, walletAddress, jarvisSessionId } = body;

    // Validate required fields
    if (!taskDescription || !maxPrice || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: taskDescription, maxPrice, walletAddress',
        },
        { status: 400 }
      );
    }

    // Hire agent via x402
    const result = await jarvisHireAgent({
      taskDescription,
      maxPrice: parseFloat(maxPrice),
      walletAddress,
      jarvisSessionId: jarvisSessionId || `jarvis-${Date.now()}`,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    // Return HTTP 402 Payment Required with payment details
    return NextResponse.json(
      {
        success: true,
        agent: {
          id: result.agent?.id,
          name: result.agent?.name,
          description: result.agent?.description,
          trustScore: result.agent?.trustScore,
          walletAddress: result.agent?.walletAddress,
        },
        task: {
          id: result.task?.id,
          title: result.task?.title,
          status: result.task?.status,
        },
        payment: {
          paymentId: result.payment?.paymentId,
          amount: result.payment?.amount,
          currency: 'USDC',
          status: result.payment?.status,
          message: result.payment?.message,
          // x402 payment instructions
          payTo: result.agent?.walletAddress,
          chain: 'base',
          token: 'USDC',
        },
      },
      { 
        status: 402, // HTTP 402 Payment Required
        headers: {
          'X-Payment-Required': 'true',
          'X-Payment-Amount': result.payment?.amount || '0',
          'X-Payment-Currency': 'USDC',
          'X-Payment-Chain': 'base',
        },
      }
    );
  } catch (error) {
    console.error('Jarvis hire endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jarvis/hire?taskDescription=...&maxPrice=...
 * 
 * Alternative endpoint for simple GET requests
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskDescription = searchParams.get('taskDescription');
    const maxPrice = searchParams.get('maxPrice');
    const walletAddress = searchParams.get('walletAddress');

    if (!taskDescription || !maxPrice || !walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required query parameters',
        },
        { status: 400 }
      );
    }

    // Call POST handler logic
    const result = await jarvisHireAgent({
      taskDescription,
      maxPrice: parseFloat(maxPrice),
      walletAddress,
      jarvisSessionId: `jarvis-${Date.now()}`,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        agent: result.agent,
        task: result.task,
        payment: result.payment,
      },
      { status: 402 }
    );
  } catch (error) {
    console.error('Jarvis hire GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

