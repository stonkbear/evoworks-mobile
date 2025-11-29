import { NextRequest, NextResponse } from 'next/server'
import { getCategoryTree, getAllCategories, searchCategories } from '@/lib/discovery/taxonomy'

/**
 * GET /api/categories
 * Get category taxonomy
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')
    const flat = searchParams.get('flat') === 'true'

    let categories

    if (query) {
      // Search categories
      categories = searchCategories(query)
    } else if (flat) {
      // Get flat list
      categories = getAllCategories()
    } else {
      // Get hierarchical tree
      categories = getCategoryTree()
    }

    return NextResponse.json({
      success: true,
      data: {
        categories,
        count: categories.length,
      },
    })
  } catch (error) {
    console.error('Error getting categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CATEGORY_ERROR',
          message: 'Failed to get categories',
        },
      },
      { status: 500 }
    )
  }
}

