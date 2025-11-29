/**
 * Generic Webhook Adapter - Execute agents via custom webhooks
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import axios from 'axios'
import crypto from 'crypto'

export class WebhookAdapter extends BaseAdapter {
  /**
   * Register agent with webhook URL
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    secret?: string
    error?: string
  }> {
    try {
      // Generate webhook secret for HMAC signature verification
      const secret = crypto.randomBytes(32).toString('hex')

      console.log(`[Webhook] Agent ${metadata.name} registered`)
      console.log(`[Webhook] Secret: ${secret}`)

      return {
        success: true,
        agentId: metadata.id,
        secret,
      }
    } catch (error) {
      console.error('Error registering webhook agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Execute task via webhook
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      const webhookUrl = this.config.endpoint

      if (!webhookUrl) {
        return {
          success: false,
          error: 'Webhook URL not configured',
        }
      }

      const startTime = Date.now()

      const payload = {
        taskId: task.id,
        agentId,
        input: task.input,
        parameters: task.parameters,
        context: task.context,
        timestamp: new Date().toISOString(),
      }

      // Generate HMAC signature for security
      const signature = this.generateSignature(payload, this.config.secret || '')

      // Send request to webhook
      const response = await axios.post(webhookUrl, payload, {
        timeout: this.config.timeout || 60000,
        headers: {
          'Content-Type': 'application/json',
          'X-Echo-Signature': signature,
          'X-Echo-Agent-Id': agentId,
        },
      })

      const duration = Date.now() - startTime

      return {
        success: response.status >= 200 && response.status < 300,
        output: response.data,
        metadata: {
          duration,
          platform: 'webhook',
          statusCode: response.status,
        },
      }
    } catch (error) {
      console.error('Error executing webhook task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Check if webhook is reachable
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const webhookUrl = this.config.endpoint

      if (!webhookUrl) {
        return {
          online: false,
          error: 'Webhook URL not configured',
        }
      }

      // Send health check ping
      const response = await axios.post(
        webhookUrl,
        {
          ping: true,
          agentId,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Echo-Ping': 'true',
          },
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
   * Unregister webhook agent
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    console.log(`[Webhook] Agent ${agentId} unregistered`)
    return { success: true }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: any, secret: string): string {
    const payloadString = JSON.stringify(payload)
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex')
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: any, signature: string, secret: string): boolean {
    const payloadString = JSON.stringify(payload)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }
}

