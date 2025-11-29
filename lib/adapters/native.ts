/**
 * Native Adapter - Direct SDK integration for Echo agents
 */

import { BaseAdapter, AgentMetadata, TaskPayload, TaskResult } from './base'
import { prisma } from '@/lib/db/prisma'

export class NativeAdapter extends BaseAdapter {
  /**
   * Register native agent in database
   */
  async registerAgent(metadata: AgentMetadata): Promise<{
    success: boolean
    agentId?: string
    error?: string
  }> {
    try {
      // Agent is already in database, just mark as native
      await prisma.agent.update({
        where: { id: metadata.id },
        data: {
          platform: 'NATIVE',
          platformConfig: {
            sdkVersion: this.config.sdkVersion || '1.0.0',
          },
        },
      })

      console.log(`[Native] Registered agent ${metadata.name} as native`)

      return {
        success: true,
        agentId: metadata.id,
      }
    } catch (error) {
      console.error('Error registering native agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }

  /**
   * Execute task directly (agent handles via SDK)
   */
  async executeTask(agentId: string, task: TaskPayload): Promise<TaskResult> {
    try {
      // For native agents, execution is handled by the agent's SDK
      // We just create a pending execution record
      const execution = await prisma.execution.create({
        data: {
          task: {
            connect: { id: task.id }
          },
          agent: {
            connect: { id: agentId }
          },
          status: 'PENDING',
          input: task.input as any,
          startedAt: new Date(),
        },
      })

      console.log(`[Native] Created execution ${execution.id} for agent ${agentId}`)

      // Agent will poll for pending executions or receive via WebSocket
      return {
        success: true,
        output: {
          executionId: execution.id,
          status: 'pending',
          message: 'Task queued for native agent',
        },
        metadata: {
          platform: 'native',
          executionId: execution.id,
        },
      }
    } catch (error) {
      console.error('Error executing native task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      }
    }
  }

  /**
   * Get native agent status from database
   */
  async getAgentStatus(agentId: string): Promise<{
    online: boolean
    lastSeen?: Date
    error?: string
  }> {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: {
          status: true,
          lastSeenAt: true,
        },
      })

      if (!agent) {
        return {
          online: false,
          error: 'Agent not found',
        }
      }

      return {
        online: agent.status === 'ACTIVE',
        lastSeen: agent.lastSeenAt || undefined,
      }
    } catch (error) {
      console.error('Error getting native agent status:', error)
      return {
        online: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      }
    }
  }

  /**
   * Unregister native agent
   */
  async unregisterAgent(agentId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          status: 'INACTIVE' as any,
        },
      })

      console.log(`[Native] Unregistered agent ${agentId}`)

      return { success: true }
    } catch (error) {
      console.error('Error unregistering native agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unregistration failed',
      }
    }
  }
}

