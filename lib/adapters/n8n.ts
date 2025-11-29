/**
 * n8n Adapter - Execute agents as n8n workflows
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import axios from 'axios'

export class N8nAdapter extends BaseAdapter {
  /**
   * Register agent as n8n workflow
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    error?: string
  }> {
    try {
      const n8nUrl = this.config.endpoint || 'http://localhost:5678'
      const apiKey = this.config.apiKey

      // Create n8n workflow for agent
      const workflow = {
        name: metadata.name,
        nodes: [
          {
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            webhookId: metadata.id,
            parameters: {
              path: metadata.id,
              responseMode: 'responseNode',
            },
          },
          {
            name: 'Agent Logic',
            type: 'n8n-nodes-base.function',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              functionCode: `
                // Agent execution logic
                const input = $input.all();
                return [{
                  json: {
                    success: true,
                    output: input,
                    metadata: { platform: 'n8n' }
                  }
                }];
              `,
            },
          },
          {
            name: 'Respond to Webhook',
            type: 'n8n-nodes-base.respondToWebhook',
            typeVersion: 1,
            position: [650, 300],
            parameters: {},
          },
        ],
        connections: {
          Webhook: {
            main: [[{ node: 'Agent Logic', type: 'main', index: 0 }]],
          },
          'Agent Logic': {
            main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]],
          },
        },
        active: true,
        settings: {},
      }

      const response = await axios.post(`${n8nUrl}/api/v1/workflows`, workflow, {
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      })

      console.log(`[N8n] Registered agent ${metadata.name} as workflow ${response.data.id}`)

      return {
        success: true,
        agentId: response.data.id,
      }
    } catch (error) {
      console.error('Error registering n8n agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Execute task via n8n webhook
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      const n8nUrl = this.config.endpoint || 'http://localhost:5678'
      const startTime = Date.now()

      // Call n8n webhook
      const response = await axios.post(
        `${n8nUrl}/webhook/${agentId}`,
        {
          taskId: task.id,
          input: task.input,
          parameters: task.parameters,
          context: task.context,
        },
        {
          timeout: this.config.timeout || 60000,
        }
      )

      const duration = Date.now() - startTime

      return {
        success: true,
        output: response.data,
        metadata: {
          duration,
          platform: 'n8n',
        },
      }
    } catch (error) {
      console.error('Error executing n8n task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Get workflow status
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const n8nUrl = this.config.endpoint || 'http://localhost:5678'
      const apiKey = this.config.apiKey

      const response = await axios.get(`${n8nUrl}/api/v1/workflows/${agentId}`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
        },
      })

      return {
        online: response.data.active === true,
        lastSeen: new Date(response.data.updatedAt),
      }
    } catch (error) {
      console.error('Error getting n8n agent status:', error)
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      }
    }
  }

  /**
   * Delete n8n workflow
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const n8nUrl = this.config.endpoint || 'http://localhost:5678'
      const apiKey = this.config.apiKey

      await axios.delete(`${n8nUrl}/api/v1/workflows/${agentId}`, {
        headers: {
          'X-N8N-API-KEY': apiKey,
        },
      })

      console.log(`[N8n] Unregistered agent ${agentId}`)

      return { success: true }
    } catch (error) {
      console.error('Error unregistering n8n agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unregistration failed',
      }
    }
  }
}

