/**
 * Category Taxonomy - Hierarchical category structure for agent classification
 */

export interface Category {
  id: string
  name: string
  description: string
  parent?: string
  children?: Category[]
  tags: string[]
}

/**
 * Predefined category taxonomy
 */
export const CATEGORY_TAXONOMY: Category[] = [
  {
    id: 'business-automation',
    name: 'Business Automation',
    description: 'Automate business processes and workflows',
    tags: ['automation', 'workflow', 'business'],
    children: [
      {
        id: 'crm',
        name: 'CRM & Sales',
        description: 'Customer relationship management and sales automation',
        parent: 'business-automation',
        tags: ['crm', 'sales', 'customers', 'leads'],
      },
      {
        id: 'marketing',
        name: 'Marketing',
        description: 'Marketing automation and campaign management',
        parent: 'business-automation',
        tags: ['marketing', 'campaigns', 'email', 'social'],
      },
      {
        id: 'hr',
        name: 'HR & Recruitment',
        description: 'Human resources and recruitment automation',
        parent: 'business-automation',
        tags: ['hr', 'recruitment', 'hiring', 'onboarding'],
      },
    ],
  },
  {
    id: 'development',
    name: 'Development & DevOps',
    description: 'Software development and deployment automation',
    tags: ['development', 'devops', 'coding'],
    children: [
      {
        id: 'code-gen',
        name: 'Code Generation',
        description: 'Automated code generation and scaffolding',
        parent: 'development',
        tags: ['code', 'generation', 'scaffolding', 'boilerplate'],
      },
      {
        id: 'testing',
        name: 'Testing & QA',
        description: 'Automated testing and quality assurance',
        parent: 'development',
        tags: ['testing', 'qa', 'automation', 'ci/cd'],
      },
      {
        id: 'devops',
        name: 'DevOps',
        description: 'Deployment and infrastructure automation',
        parent: 'development',
        tags: ['devops', 'deployment', 'infrastructure', 'monitoring'],
      },
    ],
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    description: 'Data processing, analysis, and insights',
    tags: ['data', 'analytics', 'insights'],
    children: [
      {
        id: 'etl',
        name: 'ETL & Data Pipeline',
        description: 'Extract, transform, and load data workflows',
        parent: 'data',
        tags: ['etl', 'pipeline', 'transformation', 'integration'],
      },
      {
        id: 'analytics',
        name: 'Analytics & BI',
        description: 'Business intelligence and analytics',
        parent: 'data',
        tags: ['analytics', 'bi', 'reports', 'dashboards'],
      },
      {
        id: 'ml',
        name: 'Machine Learning',
        description: 'ML model training and deployment',
        parent: 'data',
        tags: ['ml', 'ai', 'models', 'training'],
      },
    ],
  },
  {
    id: 'content',
    name: 'Content Creation',
    description: 'Create and manage content',
    tags: ['content', 'creation', 'media'],
    children: [
      {
        id: 'writing',
        name: 'Writing & Copywriting',
        description: 'Automated content writing and copywriting',
        parent: 'content',
        tags: ['writing', 'copy', 'content', 'blog'],
      },
      {
        id: 'design',
        name: 'Design & Graphics',
        description: 'Graphic design and image generation',
        parent: 'content',
        tags: ['design', 'graphics', 'images', 'visual'],
      },
      {
        id: 'video',
        name: 'Video & Audio',
        description: 'Video editing and audio processing',
        parent: 'content',
        tags: ['video', 'audio', 'editing', 'production'],
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Communication and collaboration tools',
    tags: ['communication', 'collaboration', 'messaging'],
    children: [
      {
        id: 'email',
        name: 'Email Automation',
        description: 'Automated email workflows',
        parent: 'communication',
        tags: ['email', 'automation', 'campaigns'],
      },
      {
        id: 'chat',
        name: 'Chat & Messaging',
        description: 'Chat bot and messaging automation',
        parent: 'communication',
        tags: ['chat', 'bot', 'messaging', 'support'],
      },
      {
        id: 'social',
        name: 'Social Media',
        description: 'Social media management and automation',
        parent: 'communication',
        tags: ['social', 'media', 'posts', 'scheduling'],
      },
    ],
  },
]

/**
 * Get category by ID
 */
export function getCategory(id: string): Category | undefined {
  for (const category of CATEGORY_TAXONOMY) {
    if (category.id === id) return category
    if (category.children) {
      const found = category.children.find((c) => c.id === id)
      if (found) return found
    }
  }
  return undefined
}

/**
 * Get all categories (flat list)
 */
export function getAllCategories(): Category[] {
  const categories: Category[] = []

  for (const category of CATEGORY_TAXONOMY) {
    categories.push(category)
    if (category.children) {
      categories.push(...category.children)
    }
  }

  return categories
}

/**
 * Get category tree (hierarchical)
 */
export function getCategoryTree(): Category[] {
  return CATEGORY_TAXONOMY
}

/**
 * Search categories by name or tags
 */
export function searchCategories(query: string): Category[] {
  const lowerQuery = query.toLowerCase()
  const categories = getAllCategories()

  return categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description.toLowerCase().includes(lowerQuery) ||
      cat.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Auto-categorize agent based on capabilities
 */
export async function autoCategorize(capabilities: any): Promise<string | null> {
  try {
    const skills = capabilities.skills || []
    const tools = capabilities.tools || []
    const allTerms = [...skills, ...tools].map((t: string) => t.toLowerCase())

    // Find best matching category
    const categories = getAllCategories()
    let bestMatch: { category: string; score: number } | null = null

    for (const category of categories) {
      const categoryTerms = [...category.tags, category.name.toLowerCase()]
      const matchCount = allTerms.filter((term: string) =>
        categoryTerms.some((catTerm) => term.includes(catTerm) || catTerm.includes(term))
      ).length

      if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.score)) {
        bestMatch = { category: category.id, score: matchCount }
      }
    }

    return bestMatch?.category || null
  } catch (error) {
    console.error('Error auto-categorizing:', error)
    return null
  }
}

