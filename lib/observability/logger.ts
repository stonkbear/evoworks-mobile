/**
 * Structured Logger with multiple log levels
 * Integrates with OpenTelemetry for distributed tracing
 */

import { getTraceContext } from './tracing'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  traceId?: string
  spanId?: string
  [key: string]: any
}

/**
 * Log with structured data
 */
function log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
  const traceContext = getTraceContext()
  
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    traceId: traceContext?.traceId,
    spanId: traceContext?.spanId,
    ...metadata,
  }

  // In production, send to log aggregation service (Datadog, New Relic, etc.)
  const logString = JSON.stringify(entry)
  
  switch (level) {
    case 'debug':
      console.debug(logString)
      break
    case 'info':
      console.log(logString)
      break
    case 'warn':
      console.warn(logString)
      break
    case 'error':
    case 'fatal':
      console.error(logString)
      break
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, any>) => log('debug', message, metadata),
  info: (message: string, metadata?: Record<string, any>) => log('info', message, metadata),
  warn: (message: string, metadata?: Record<string, any>) => log('warn', message, metadata),
  error: (message: string, metadata?: Record<string, any>) => log('error', message, metadata),
  fatal: (message: string, metadata?: Record<string, any>) => log('fatal', message, metadata),
}

/**
 * Create a child logger with default metadata
 */
export function createLogger(defaultMetadata: Record<string, any>) {
  return {
    debug: (message: string, metadata?: Record<string, any>) =>
      log('debug', message, { ...defaultMetadata, ...metadata }),
    info: (message: string, metadata?: Record<string, any>) =>
      log('info', message, { ...defaultMetadata, ...metadata }),
    warn: (message: string, metadata?: Record<string, any>) =>
      log('warn', message, { ...defaultMetadata, ...metadata }),
    error: (message: string, metadata?: Record<string, any>) =>
      log('error', message, { ...defaultMetadata, ...metadata }),
    fatal: (message: string, metadata?: Record<string, any>) =>
      log('fatal', message, { ...defaultMetadata, ...metadata }),
  }
}

