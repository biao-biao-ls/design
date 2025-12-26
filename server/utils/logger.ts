// 日志工具函数
interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}

interface LogEntry {
  level: keyof LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`

    if (context) {
      logMessage += ` | Context: ${JSON.stringify(context)}`
    }

    if (error) {
      logMessage += ` | Error: ${error.message}`
      if (error.stack) {
        logMessage += ` | Stack: ${error.stack}`
      }
    }

    return logMessage
  }

  private log(level: keyof LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
      ...(error && { error }),
    }

    const formattedMessage = this.formatMessage(entry)

    // 控制台输出
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage)
        break
      case 'WARN':
        console.warn(formattedMessage)
        break
      case 'INFO':
        console.info(formattedMessage)
        break
      case 'DEBUG':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage)
        }
        break
    }

    // 在生产环境中，这里可以添加日志持久化逻辑
    // 例如写入数据库或发送到日志服务
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('ERROR', message, context, error)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context)
  }
}

// 导出单例实例
export const logger = new Logger()

// 导出日志级别常量
export { LOG_LEVELS }
