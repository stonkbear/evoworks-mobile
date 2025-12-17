/**
 * Ghost Flow API Client
 * SDK for communicating with Ghost Flow's API
 */

import type {
  GhostFlowExportPackage,
  GhostFlowListing,
  GhostFlowAnalytics,
  X402ExecuteRequest,
  X402ExecuteResponse,
  GhostFlowTokenResponse,
  GhostFlowUser,
} from './types'

export interface GhostFlowClientConfig {
  apiUrl: string
  apiKey?: string
  accessToken?: string
}

export class GhostFlowClient {
  private apiUrl: string
  private apiKey?: string
  private accessToken?: string

  constructor(config: GhostFlowClientConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = config.apiKey
    this.accessToken = config.accessToken
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Set access token for user-authenticated requests
   */
  setAccessToken(token: string) {
    this.accessToken = token
  }

  /**
   * Exchange OAuth code for tokens
   */
  async exchangeOAuthCode(code: string, redirectUri: string): Promise<GhostFlowTokenResponse> {
    const response = await fetch(`${this.apiUrl}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.GHOSTFLOW_CLIENT_ID,
        client_secret: process.env.GHOSTFLOW_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<GhostFlowTokenResponse> {
    const response = await fetch(`${this.apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<GhostFlowUser> {
    const response = await this.authenticatedFetch('/api/auth/me')
    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`)
    }
    return response.json()
  }

  // ============================================================================
  // BOARDS / WORKFLOWS
  // ============================================================================

  /**
   * List boards for an organization
   */
  async listBoards(orgId: string): Promise<any[]> {
    const response = await this.authenticatedFetch(`/api/canvas/boards/${orgId}`)
    if (!response.ok) {
      throw new Error(`Failed to list boards: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Get a single board
   */
  async getBoard(boardId: string): Promise<any> {
    const response = await this.authenticatedFetch(`/api/canvas/board/${boardId}`)
    if (!response.ok) {
      throw new Error(`Failed to get board: ${response.status}`)
    }
    return response.json()
  }

  // ============================================================================
  // AGENTS
  // ============================================================================

  /**
   * List active agents
   */
  async listAgents(): Promise<any[]> {
    const response = await this.authenticatedFetch('/api/agents/list')
    if (!response.ok) {
      throw new Error(`Failed to list agents: ${response.status}`)
    }
    return response.json()
  }

  // ============================================================================
  // SWARMS
  // ============================================================================

  /**
   * List active swarms
   */
  async listSwarms(): Promise<any[]> {
    const response = await this.authenticatedFetch('/api/swarms/list')
    if (!response.ok) {
      throw new Error(`Failed to list swarms: ${response.status}`)
    }
    return response.json()
  }

  // ============================================================================
  // EVOWORKS MARKETPLACE INTEGRATION
  // ============================================================================

  /**
   * Publish asset to EvoWorks marketplace
   */
  async publishToMarketplace(
    sourceId: string,
    sourceType: 'board' | 'agent' | 'swarm' | 'collection',
    metadata: {
      name: string
      description: string
      pricingModel: 'free' | 'per-call' | 'subscription' | 'one-time'
      price?: number
      tags?: string[]
    }
  ): Promise<GhostFlowListing> {
    const response = await this.authenticatedFetch('/api/evoworks/publish', {
      method: 'POST',
      body: JSON.stringify({
        sourceId,
        sourceType,
        ...metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Publish failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get organization's marketplace listings
   */
  async getMyListings(): Promise<GhostFlowListing[]> {
    const response = await this.authenticatedFetch('/api/evoworks/listings')
    if (!response.ok) {
      throw new Error(`Failed to get listings: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Get listing analytics
   */
  async getListingAnalytics(listingId: string): Promise<GhostFlowAnalytics> {
    const response = await this.authenticatedFetch(`/api/evoworks/listings/${listingId}/analytics`)
    if (!response.ok) {
      throw new Error(`Failed to get analytics: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Unpublish a listing
   */
  async unpublishListing(listingId: string): Promise<void> {
    const response = await this.authenticatedFetch(`/api/evoworks/listings/${listingId}/unpublish`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error(`Failed to unpublish: ${response.status}`)
    }
  }

  // ============================================================================
  // X402 EXECUTION
  // ============================================================================

  /**
   * Execute a listing via x402 payment
   */
  async executeWithPayment(
    listingId: string,
    input: Record<string, any>,
    paymentHeader: string,
    callerId: string
  ): Promise<X402ExecuteResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`

    const response = await fetch(`${this.apiUrl}/api/evoworks/x402/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-id': callerId,
        'x-org-id': process.env.EVOWORKS_ORG_ID || '',
        'x-payment-amount': paymentHeader,
        'x-request-id': requestId,
        ...(this.apiKey && { 'x-api-key': this.apiKey }),
      },
      body: JSON.stringify({
        listingId,
        paymentHeader,
        input,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Execution failed: ${response.status}`)
    }

    return response.json()
  }

  // ============================================================================
  // EXPORT PACKAGE
  // ============================================================================

  /**
   * Get export package for a listing
   */
  async getExportPackage(listingId: string): Promise<GhostFlowExportPackage> {
    const response = await this.authenticatedFetch(`/api/evoworks/listings/${listingId}/package`)
    if (!response.ok) {
      throw new Error(`Failed to get export package: ${response.status}`)
    }
    return response.json()
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    } else if (this.apiKey) {
      headers['x-api-key'] = this.apiKey
    }

    return fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers,
    })
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: GhostFlowClient | null = null

/**
 * Get Ghost Flow client instance
 */
export function getGhostFlowClient(): GhostFlowClient {
  if (!clientInstance) {
    clientInstance = new GhostFlowClient({
      apiUrl: process.env.GHOSTFLOW_API_URL || 'https://api.ghostflow.ai',
      apiKey: process.env.GHOSTFLOW_API_KEY,
    })
  }
  return clientInstance
}

/**
 * Create a user-authenticated Ghost Flow client
 */
export function createUserClient(accessToken: string): GhostFlowClient {
  return new GhostFlowClient({
    apiUrl: process.env.GHOSTFLOW_API_URL || 'https://api.ghostflow.ai',
    accessToken,
  })
}

