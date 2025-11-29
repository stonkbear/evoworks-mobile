/**
 * Zapier Adapter - Execute agents via Zapier webhooks
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import axios from 'axios'

export class ZapierAdapter extends BaseAdapter {
  /**
   * Register agent (returns webhook URL for Zap configuration)
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    webhookUrl?: string
    error?: string
  }> {
    try {
      // In Zapier integration, users configure their Zap to receive webhooks
      // We provide them with a webhook URL to use in their Zap
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/adapters/zapier/webhook/${metadata.id}`

      console.log(`[Zapier] Agent ${metadata.name} ready for Zap configuration`)
      console.log(`[Zapier] Webhook URL: ${webhookUrl}`)

      return {
        success: true,
        agentId: metadata.id,
        webhookUrl,
      }
    } catch (error) {
      console.error('Error registering Zapier agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Execute task via Zapier webhook
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      // User has configured a Zap with a webhook trigger
      // They provide us with their Zap's webhook URL
      const zapierWebhookUrl = this.config.endpoint

      if (!zapierWebhookUrl) {
        return {
          success: false,
          error: 'Zapier webhook URL not configured',
        }
      }

      const startTime = Date.now()

      // Send task data to Zapier
      const response = await axios.post(
        zapierWebhookUrl,
        {
          taskId: task.id,
          agentId,
          input: task.input,
          parameters: task.parameters,
          context: task.context,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: this.config.timeout || 60000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const duration = Date.now() - startTime

      // Zapier webhooks typically return status or empty response
      return {
        success: response.status >= 200 && response.status < 300,
        output: response.data || { status: 'sent' },
        metadata: {
          duration,
          platform: 'zapier',
          statusCode: response.status,
        },
      }
    } catch (error) {
      console.error('Error executing Zapier task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Check if Zapier webhook is reachable
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const zapierWebhookUrl = this.config.endpoint

      if (!zapierWebhookUrl) {
        return {
          online: false,
          error: 'Webhook URL not configured',
        }
      }

      // Send ping to webhook
      const response = await axios.post(
        zapierWebhookUrl,
        {
          ping: true,
          agentId,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 5000,
        }
      )

      return {
        online: response.status >= 200 && response.status < 300,
        lastSeen: new Date(),
      }
    } catch (error) {
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      }
    }
  }

  /**
   * Unregister agent (no-op for Zapier, user manages Zaps)
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    console.log(`[Zapier] Agent ${agentId} unregistered (user should disable Zap)`)
    return { success: true }
  }
}

