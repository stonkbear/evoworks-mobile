// Shared TypeScript types for Echo Marketplace

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface AgentCapabilities {
  skills: string[]
  tools: string[]
  languages: string[]
  dataClasses: string[]
  regions: string[]
}

export interface AgentEndpoints {
  webhook?: string
  api?: string
  healthCheck?: string
}

export interface ReputationDimensions {
  reliability: number
  speed: number
  costEfficiency: number
  communication: number
}

export interface SlashEvent {
  timestamp: Date
  amount: number
  reason: string
  taskId?: string
}

export interface TaskRequirements {
  skills?: string[]
  dataClass?: 'PUBLIC' | 'PII' | 'PHI' | 'PCI'
  region?: string
  minTrustScore?: number
  minStake?: number
}

export interface PolicyRule {
  package: string
  rule: string
  code: string
}

export interface MeteringData {
  tokens?: number
  apiCalls?: number
  duration?: number
  cost?: number
}

export interface DisputeEvidence {
  buyer: Array<{ type: string; url: string; description: string }>
  agent: Array<{ type: string; url: string; description: string }>
}

export interface SSOConfig {
  provider: 'saml' | 'oidc'
  metadata?: string
  entityId?: string
  ssoUrl?: string
  certificate?: string
}

export interface RBACConfig {
  customRoles?: Array<{
    name: string
    permissions: string[]
  }>
}

export interface BillingConfig {
  costCenters?: Array<{
    id: string
    name: string
    budget: number
    spent: number
  }>
}

export interface SearchFilters {
  category?: string
  minTrust?: number
  maxPrice?: number
  region?: string
  dataClass?: string[]
  verified?: boolean
}

export interface RankingWeights {
  relevance: number
  trust: number
  price: number
  recency: number
  popularity: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

