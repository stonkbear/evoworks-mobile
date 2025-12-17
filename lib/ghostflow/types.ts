/**
 * Ghost Flow Integration Types
 * Based on Ghost Flow's EvoWorks export specification
 */

// ============================================================================
// LISTING TYPES
// ============================================================================

export type GhostFlowListingType = 'automation' | 'agent' | 'swarm' | 'knowledge-pack'

// Maps Ghost Flow types to Evoworks ListingType
export const GHOSTFLOW_TYPE_MAP: Record<GhostFlowListingType, string> = {
  'automation': 'WORKFLOW',
  'agent': 'AGENT',
  'swarm': 'SWARM',
  'knowledge-pack': 'KNOWLEDGE_PACK',
}

// ============================================================================
// EXPORT PACKAGE
// ============================================================================

export interface GhostFlowExportManifest {
  version: '1.0.0'
  type: GhostFlowListingType
  name: string
  description: string
  author: {
    orgId: string
    orgName: string
  }
  createdAt: string
  ghostFlowVersion: string
}

export interface BoardNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, any>
}

export interface BoardConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface BoardConfig {
  id: string
  name: string
  nodes: BoardNode[]
  connections: BoardConnection[]
  viewport: { x: number; y: number; zoom: number }
}

export interface AgentConfig {
  id: string
  name: string
  role: string
  systemPrompt: string
  model: string
  tools: string[]
}

export interface SwarmTopology {
  type: 'hierarchical' | 'mesh' | 'pipeline'
  orchestrator?: string
  connections?: Array<{ from: string; to: string }>
}

export interface SwarmConfig {
  agents: AgentConfig[]
  topology: SwarmTopology
  orchestrator?: AgentConfig
}

export interface CollectionConfig {
  id: string
  name: string
  documentCount: number
  chunkCount: number
  embeddingModel: string
}

export interface GhostFlowExportPackage {
  manifest: GhostFlowExportManifest
  config: {
    board?: BoardConfig
    agent?: AgentConfig
    swarm?: SwarmConfig
    collection?: CollectionConfig
  }
  inputSchema?: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
  outputSchema?: {
    type: 'object'
    properties: Record<string, any>
  }
  signature?: string
}

// ============================================================================
// API TYPES
// ============================================================================

export interface GhostFlowListing {
  id: string
  ghostFlowId: string
  orgId: string
  type: GhostFlowListingType
  name: string
  description: string
  status: 'draft' | 'pending' | 'active' | 'paused'
  version: string
  packUrl: string
  createdAt: string
  updatedAt: string
}

export interface GhostFlowAnalytics {
  listingId: string
  views: number
  installs: number
  executions: number
  revenue: number
  period: {
    start: string
    end: string
  }
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

export interface X402ExecuteRequest {
  listingId: string
  paymentHeader: string
  input: Record<string, any>
}

export interface X402ExecuteResponse {
  success: boolean
  output: Record<string, any>
  executionTimeMs: number
  receipt: {
    requestId: string
    amountPaid: number
    timestamp: string
  }
}

export interface X402VerifyRequest {
  paymentHeader: string
  amount: number
  listingId: string
}

export interface X402VerifyResponse {
  valid: boolean
  error?: string
  paymentId?: string
}

export interface X402SettleRequest {
  paymentId: string
  listingId: string
  executionId: string
  success: boolean
}

export interface X402SettleResponse {
  settled: boolean
  transactionId?: string
  error?: string
}

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

export type GhostFlowEventType = 
  | 'listing:created'
  | 'listing:published'
  | 'listing:unpublished'
  | 'execution:started'
  | 'execution:completed'
  | 'execution:failed'
  | 'payment:received'

export interface GhostFlowWebhookEvent {
  event: GhostFlowEventType
  timestamp: string
  data: Record<string, any>
}

export interface ListingCreatedEvent {
  event: 'listing:created'
  timestamp: string
  data: {
    listingId: string
    orgId: string
    type: GhostFlowListingType
    name: string
  }
}

export interface ExecutionCompletedEvent {
  event: 'execution:completed'
  timestamp: string
  data: {
    listingId: string
    requestId: string
    output: Record<string, any>
    duration: number
    callerId: string
  }
}

export interface PaymentReceivedEvent {
  event: 'payment:received'
  timestamp: string
  data: {
    listingId: string
    amountCents: number
    callerId: string
    transactionId: string
  }
}

// ============================================================================
// OAUTH TYPES
// ============================================================================

export interface GhostFlowOAuthState {
  userId: string
  returnUrl?: string
  nonce: string
}

export interface GhostFlowTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: 'Bearer'
  scope: string
}

export interface GhostFlowUser {
  id: string
  email: string
  orgId: string
  orgName: string
}

