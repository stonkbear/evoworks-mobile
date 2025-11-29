import { NextRequest, NextResponse } from 'next/server'
import { updatePolicyPack, deletePolicyPack } from '@/lib/policy/manager'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/policies/:id
 * Get a policy pack by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policyPack = await prisma.policyPack.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!policyPack) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Policy pack not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: policyPack,
    })
  } catch (error) {
    console.error('Error getting policy pack:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_ERROR',
          message: 'Failed to get policy pack',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/policies/:id
 * Update a policy pack
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication
    // TODO: Check if user has POLICY_ADMIN role

    const body = await req.json()
    const { name, rules } = body

    await updatePolicyPack(params.id, { name, rules })

    return NextResponse.json({
      success: true,
      data: {
        policyPackId: params.id,
        updated: true,
      },
    })
  } catch (error) {
    console.error('Error updating policy pack:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update policy pack',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/policies/:id
 * Delete a policy pack
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication
    // TODO: Check if user has POLICY_ADMIN role

    const success = await deletePolicyPack(params.id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete policy pack',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        policyPackId: params.id,
        deleted: true,
      },
    })
  } catch (error) {
    console.error('Error deleting policy pack:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete policy pack',
        },
      },
      { status: 500 }
    )
  }
}

