/**
 * Make.com (formerly Integromat) Adapter
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import axios from 'axios'

export class MakeAdapter extends BaseAdapter {
  /**
   * Register agent (returns webhook URL for Make scenario configuration)
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    webhookUrl?: string
    error?: string
  }> {
    try {
      // Similar to Zapier, Make.com scenarios use webhooks
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/adapters/make/webhook/${metadata.id}`

      console.log(`[Make] Agent ${metadata.name} ready for scenario configuration`)
      console.log(`[Make] Webhook URL: ${webhookUrl}`)

      return {
        success: true,
        agentId: metadata.id,
        webhookUrl,
      }
    } catch (error) {
      console.error('Error registering Make agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Execute task via Make webhook
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      const makeWebhookUrl = this.config.endpoint

      if (!makeWebhookUrl) {
        return {
          success: false,
          error: 'Make webhook URL not configured',
        }
      }

      const startTime = Date.now()

      // Send task data to Make scenario
      const response = await axios.post(
        makeWebhookUrl,
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

      return {
        success: response.status >= 200 && response.status < 300,
        output: response.data,
        metadata: {
          duration,
          platform: 'make',
          statusCode: response.status,
        },
      }
    } catch (error) {
      console.error('Error executing Make task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Check if Make webhook is reachable
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const makeWebhookUrl = this.config.endpoint

      if (!makeWebhookUrl) {
        return {
          online: false,
          error: 'Webhook URL not configured',
        }
      }

      // Send ping to webhook
      const response = await axios.post(
        makeWebhookUrl,
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
   * Unregister agent
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    console.log(`[Make] Agent ${agentId} unregistered (user should disable scenario)`)
    return { success: true }
  }
}

