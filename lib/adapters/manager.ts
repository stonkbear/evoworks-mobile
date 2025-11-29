/**
 * Adapter Manager - Orchestrate agent execution across platforms
 */

import { BaseAdapter, AdapterConfig, AgentMetadata, TaskPayload, TaskResult } from './base'
import { N8nAdapter } from './n8n'
import { ZapierAdapter } from './zapier'
import { OpenAIAdapter } from './openai'
import { MakeAdapter } from './make'
import { WebhookAdapter } from './webhook'
import { NativeAdapter } from './native'
import { prisma } from '@/lib/db/prisma'

export type Platform = 'N8N' | 'ZAPIER' | 'OPENAI' | 'MAKE' | 'WEBHOOK' | 'NATIVE'

/**
 * Get adapter for platform
 */
export function getAdapter(platform: Platform, config: AdapterConfig): BaseAdapter {
  switch (platform) {
    case 'N8N':
      return new N8nAdapter(config)
    case 'ZAPIER':
      return new ZapierAdapter(config)
    case 'OPENAI':
      return new OpenAIAdapter(config)
    case 'MAKE':
      return new MakeAdapter(config)
    case 'WEBHOOK':
      return new WebhookAdapter(config)
    case 'NATIVE':
      return new NativeAdapter(config)
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * Register agent on platform
 */
export async function registerAgentOnPlatform(
  agentId: string,
  platform: Platform,
  config: AdapterConfig
): Promise<{
  success: boolean
  platformAgentId?: string
  error?: string
}> {
  try {
    // Get agent metadata
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return { success: false, error: 'Agent not found' }
    }

    const metadata: AgentMetadata = {
      id: agent.id,
      name: agent.name,
      description: agent.description || '',
      capabilities: (agent.capabilities as string[]) || [],
      pricing: {
        model: 'fixed',
        amount: 0,
        currency: 'USD',
      },
      region: agent.region || 'US',
    }

    // Get adapter and register
    const adapter = getAdapter(platform, config)
    const result = await adapter.registerAgent(metadata)

    if (!result.success) {
      return result
    }

    // Update agent record with platform info
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        platform,
        platformAgentId: result.agentId,
        platformConfig: JSON.stringify(config),
      },
    })

    console.log(`[AdapterManager] Registered agent ${agentId} on ${platform}`)

    return {
      success: true,
      platformAgentId: result.agentId,
    }
  } catch (error) {
    console.error('Error registering agent on platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}

/**
 * Execute task on agent's platform
 */
export async function executeTaskOnPlatform(
  agentId: string,
  taskPayload: TaskPayload
): Promise<TaskResult> {
  try {
    // Get agent with platform config
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        platform: true,
        platformAgentId: true,
        platformConfig: true,
      },
    })

    if (!agent || !agent.platform) {
      return {
        success: false,
        error: 'Agent platform not configured',
      }
    }

    const platform = agent.platform as Platform
    const config = agent.platformConfig ? JSON.parse(agent.platformConfig as string) : {}
    const platformAgentId = agent.platformAgentId || agentId

    // Get adapter and execute
    const adapter = getAdapter(platform, config)
    const result = await adapter.executeTask(platformAgentId, taskPayload)

    console.log(
      `[AdapterManager] Executed task ${taskPayload.id} on ${platform} (success: ${result.success})`
    )

    return result
  } catch (error) {
    console.error('Error executing task on platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Execution failed',
    }
  }
}

/**
 * Check agent status across platform
 */
export async function checkAgentStatus(agentId: string): Promise<{
  online: boolean
  platform?: string
  lastSeen?: Date
  error?: string
}> {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        platform: true,
        platformAgentId: true,
        platformConfig: true,
      },
    })

    if (!agent || !agent.platform) {
      return {
        online: false,
        error: 'Agent platform not configured',
      }
    }

    const platform = agent.platform as Platform
    const config = agent.platformConfig ? JSON.parse(agent.platformConfig as string) : {}
    const platformAgentId = agent.platformAgentId || agentId

    const adapter = getAdapter(platform, config)
    const status = await adapter.getAgentStatus(platformAgentId)

    return {
      ...status,
      platform,
    }
  } catch (error) {
    console.error('Error checking agent status:', error)
    return {
      online: false,
      error: error instanceof Error ? error.message : 'Status check failed',
    }
  }
}

/**
 * Unregister agent from platform
 */
export async function unregisterAgentFromPlatform(agentId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        platform: true,
        platformAgentId: true,
        platformConfig: true,
      },
    })

    if (!agent || !agent.platform) {
      return { success: true } // Already unregistered
    }

    const platform = agent.platform as Platform
    const config = agent.platformConfig ? JSON.parse(agent.platformConfig as string) : {}
    const platformAgentId = agent.platformAgentId || agentId

    const adapter = getAdapter(platform, config)
    const result = await adapter.unregisterAgent(platformAgentId)

    if (result.success) {
      // Clear platform info from database
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          platformAgentId: null,
          platformConfig: {} as any, // Empty JSON object instead of null
        },
      })
    }

    console.log(`[AdapterManager] Unregistered agent ${agentId} from ${platform}`)

    return result
  } catch (error) {
    console.error('Error unregistering agent from platform:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unregistration failed',
    }
  }
}

/**
 * List supported platforms
 */
export function listPlatforms(): Platform[] {
  return ['N8N', 'ZAPIER', 'OPENAI', 'MAKE', 'WEBHOOK', 'NATIVE']
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities(platform: Platform): {
  name: string
  description: string
  requiresApiKey: boolean
  requiresEndpoint: boolean
  supportsStreaming: boolean
  supportsBatching: boolean
} {
  const capabilities = {
    N8N: {
      name: 'n8n',
      description: 'Execute agents as n8n workflows',
      requiresApiKey: true,
      requiresEndpoint: true,
      supportsStreaming: false,
      supportsBatching: true,
    },
    ZAPIER: {
      name: 'Zapier',
      description: 'Execute agents via Zapier webhooks',
      requiresApiKey: false,
      requiresEndpoint: true,
      supportsStreaming: false,
      supportsBatching: false,
    },
    OPENAI: {
      name: 'OpenAI Assistants',
      description: 'Execute agents as OpenAI Assistants',
      requiresApiKey: true,
      requiresEndpoint: false,
      supportsStreaming: true,
      supportsBatching: false,
    },
    MAKE: {
      name: 'Make.com',
      description: 'Execute agents via Make scenarios',
      requiresApiKey: false,
      requiresEndpoint: true,
      supportsStreaming: false,
      supportsBatching: true,
    },
    WEBHOOK: {
      name: 'Generic Webhook',
      description: 'Execute agents via custom webhooks',
      requiresApiKey: false,
      requiresEndpoint: true,
      supportsStreaming: false,
      supportsBatching: false,
    },
    NATIVE: {
      name: 'Native SDK',
      description: 'Direct integration with Echo SDK',
      requiresApiKey: false,
      requiresEndpoint: false,
      supportsStreaming: true,
      supportsBatching: true,
    },
  }

  return capabilities[platform]
}

