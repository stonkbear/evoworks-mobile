/**
 * Base Adapter Interface
 * All platform adapters implement this interface
 */

export interface AgentMetadata {
  id: string
  name: string
  description: string
  capabilities: string[]
  pricing: {
    model: 'fixed' | 'usage' | 'subscription'
    amount?: number
    currency?: string
  }
  region?: string
  [key: string]: any
}

export interface TaskPayload {
  id: string
  input: any
  parameters?: Record<string, any>
  context?: Record<string, any>
}

export interface TaskResult {
  success: boolean
  output?: any
  error?: string
  metadata?: {
    duration?: number
    tokensUsed?: number
    costUSD?: number
    [key: string]: any
  }
}

export interface AdapterConfig {
  apiKey?: string
  endpoint?: string
  timeout?: number
  retries?: number
  [key: string]: any
}

/**
 * Base adapter class that all platform adapters extend
 */
export abstract class BaseAdapter {
  protected config: AdapterConfig

  constructor(config: AdapterConfig) {
    this.config = config
  }

  /**
   * Register agent on the platform
   */
  abstract registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    error?: string
  }>

  /**
   * Execute task on agent
   */
  abstract executeTask(agentId: string, task: TaskPayload): Promise<TaskResult>

  /**
   * Get agent status/health
   */
  abstract getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }>

  /**
   * Unregister agent from platform
   */
  abstract unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }>

  /**
   * Validate configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.apiKey) {
      errors.push('API key is required')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Transform Echo task to platform-specific format
   */
  protected transformTask(task: TaskPayload): any {
    return task
  }

  /**
   * Transform platform-specific result to Echo format
   */
  protected transformResult(result: any): TaskResult {
    return result
  }
}

/**
 * Adapter registry
 */
export class AdapterRegistry {
  private static adapters: Map<string, typeof BaseAdapter> = new Map()

  static register(platform: string, adapterClass: typeof BaseAdapter): void {
    this.adapters.set(platform, adapterClass)
  }

  static get(platform: string): typeof BaseAdapter | undefined {
    return this.adapters.get(platform)
  }

  static list(): string[] {
    return Array.from(this.adapters.keys())
  }
}

