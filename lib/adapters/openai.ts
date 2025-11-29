/**
 * OpenAI Assistants Adapter - Execute agents as OpenAI Assistants
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import OpenAI from 'openai'

export class OpenAIAdapter extends BaseAdapter {
  private client: OpenAI

  constructor(config: any) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Register agent as OpenAI Assistant
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    error?: string
  }> {
    try {
      // Create OpenAI Assistant
      const assistant = await this.client.beta.assistants.create({
        name: metadata.name,
        description: metadata.description,
        model: this.config.model || 'gpt-4-turbo-preview',
        instructions: `You are an AI agent with the following capabilities: ${metadata.capabilities.join(', ')}`,
        tools: [
          { type: 'code_interpreter' },
          { type: 'file_search' },
        ],
      })

      console.log(`[OpenAI] Created Assistant ${assistant.id} for agent ${metadata.name}`)

      return {
        success: true,
        agentId: assistant.id,
      }
    } catch (error) {
      console.error('Error creating OpenAI Assistant:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Assistant',
      }
    }
  }

  /**
   * Execute task using OpenAI Assistant
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      const startTime = Date.now()

      // Create thread
      const thread = await this.client.beta.threads.create()

      // Add message to thread
      await this.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: JSON.stringify({
          task: task.input,
          parameters: task.parameters,
        }),
      })

      // Run assistant
      let run = await this.client.beta.threads.runs.create(thread.id, {
        assistant_id: agentId,
      })

      // Poll for completion
      while (run.status === 'queued' || run.status === 'in_progress') {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        run = await this.client.beta.threads.runs.retrieve(thread.id, run.id)
      }

      if (run.status !== 'completed') {
        return {
          success: false,
          error: `Run failed with status: ${run.status}`,
        }
      }

      // Get messages
      const messages = await this.client.beta.threads.messages.list(thread.id)
      const assistantMessages = messages.data.filter((m) => m.role === 'assistant')

      const output = assistantMessages[0]?.content[0]

      const duration = Date.now() - startTime

      return {
        success: true,
        output: output && 'text' in output ? output.text.value : output,
        metadata: {
          duration,
          platform: 'openai',
          threadId: thread.id,
          runId: run.id,
          tokensUsed: run.usage?.total_tokens,
        },
      }
    } catch (error) {
      console.error('Error executing OpenAI task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Get Assistant status
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const assistant = await this.client.beta.assistants.retrieve(agentId)

      return {
        online: true,
        lastSeen: new Date(),
      }
    } catch (error) {
      console.error('Error getting OpenAI Assistant status:', error)
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      }
    }
  }

  /**
   * Delete OpenAI Assistant
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await this.client.beta.assistants.del(agentId)

      console.log(`[OpenAI] Deleted Assistant ${agentId}`)

      return { success: true }
    } catch (error) {
      console.error('Error deleting OpenAI Assistant:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed',
      }
    }
  }
}

