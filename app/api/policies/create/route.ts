import { NextRequest, NextResponse } from 'next/server'
import { createPolicyPack } from '@/lib/policy/manager'
import { getPolicyTemplate, listPolicyTemplates } from '@/lib/policy/templates'

/**
 * POST /api/policies/create
 * Create a new policy pack
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication
    // TODO: Check if user has POLICY_ADMIN role

    const body = await req.json()
    const { name, rules, template, orgId } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Policy pack name is required',
          },
        },
        { status: 400 }
      )
    }

    let policyRules = rules

    // If template is specified, use template rules
    if (template) {
      const templateData = getPolicyTemplate(template)
      if (!templateData) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TEMPLATE_NOT_FOUND',
              message: `Template "${template}" not found`,
            },
          },
          { status: 404 }
        )
      }
      policyRules = templateData.rules
    }

    if (!policyRules || Object.keys(policyRules).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RULES',
            message: 'Policy rules or template must be provided',
          },
        },
        { status: 400 }
      )
    }

    const policyPackId = await createPolicyPack(name, policyRules, orgId)

    return NextResponse.json({
      success: true,
      data: {
        policyPackId,
        name,
        rulesCount: Object.keys(policyRules).length,
      },
    })
  } catch (error) {
    console.error('Error creating policy pack:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create policy pack',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/policies/create
 * Get available policy templates
 */
export async function GET() {
  try {
    const templates = listPolicyTemplates()

    return NextResponse.json({
      success: true,
      data: {
        templates,
        count: templates.length,
      },
    })
  } catch (error) {
    console.error('Error listing templates:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: 'Failed to list templates',
        },
      },
      { status: 500 }
    )
  }
}

