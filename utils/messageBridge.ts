/**
 * MessageBridge 通信服务
 * 用于主应用与 Wokwi iframe 之间的安全双向通信
 *
 * 核心功能：
 * - 消息队列和待发送队列机制
 * - 消息来源安全验证
 * - 基础的 postMessage 通信
 * - iframe Ready 状态竞态处理
 * - 超时处理和重试机制
 */

import type {
  WokwiMessage,
  WokwiError,
  WokwiFileUpdate,
} from '../types/wokwi'
import {
  validateOrigin,
  validateWokwiMessage,
  generateMessageId,
  MESSAGE_TYPES,
} from './wokwi'

/**
 * MessageBridge 类
 * 处理主应用与 Wokwi iframe 之间的所有通信
 */
export class MessageBridge {
  private iframe: HTMLIFrameElement | null = null
  private messageQueue: WokwiMessage[] = []
  private pendingQueue: WokwiMessage[] = [] // 等待 Wokwi Ready 的消息队列
  private listeners: Map<string, ((data: WokwiMessage | { ready: boolean } | WokwiError) => void)[]> = new Map()
  private isWokwiReady: boolean = false
  private messageTimeout: number = 3000 // 3秒超时
  private maxQueueSize: number = 100 // 最大队列长度
  private securityEnabled: boolean = true

  // Ready 状态处理相关
  private readyTimeout: NodeJS.Timeout | null = null
  private readyTimeoutDuration: number = 10000 // 10秒 Ready 超时
  private maxReadyRetries: number = 3
  private currentReadyRetries: number = 0
  private readyPromise: Promise<void> | null = null
  private readyResolve: (() => void) | null = null
  private readyReject: ((error: Error) => void) | null = null

  // 性能监控
  private messageCount: number = 0
  private errorCount: number = 0
  private lastMessageTime: number = 0

  constructor() {
    this.setupGlobalMessageListener()
  }

  /**
   * 初始化通信桥梁
   * @param iframe Wokwi iframe 元素
   */
  initialize(iframe: HTMLIFrameElement): void {
    if (!iframe) {
      throw new Error('MessageBridge: iframe 元素不能为空')
    }

    this.iframe = iframe
    this.isWokwiReady = false
    this.currentReadyRetries = 0
    this.clearQueues()
    this.clearReadyTimeout()

    console.log('MessageBridge: 已初始化，等待 Wokwi Ready 信号')

    // 启动 Ready 超时监控
    this.startReadyTimeout()
  }

  /**
   * 等待 Wokwi Ready 状态
   * @returns Promise<void>
   */
  async waitForReady(): Promise<void> {
    if (this.isWokwiReady) {
      return Promise.resolve()
    }

    // 如果已经有等待中的 Promise，返回同一个
    if (this.readyPromise) {
      return this.readyPromise
    }

    // 创建新的 Ready Promise
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve
      this.readyReject = reject
    })

    return this.readyPromise
  }

  /**
   * 启动 Ready 超时监控
   */
  private startReadyTimeout(): void {
    this.clearReadyTimeout()

    this.readyTimeout = setTimeout(() => {
      this.handleReadyTimeout()
    }, this.readyTimeoutDuration)

    console.log(`MessageBridge: 启动 Ready 超时监控，${this.readyTimeoutDuration}ms 后超时`)
  }

  /**
   * 清除 Ready 超时监控
   */
  private clearReadyTimeout(): void {
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout)
      this.readyTimeout = null
    }
  }

  /**
   * 处理 Ready 超时
   */
  private handleReadyTimeout(): void {
    this.currentReadyRetries++

    console.warn(`MessageBridge: Wokwi Ready 超时 (尝试 ${this.currentReadyRetries}/${this.maxReadyRetries})`)

    if (this.currentReadyRetries >= this.maxReadyRetries) {
      // 达到最大重试次数，触发错误
      const error = new Error(`MessageBridge: Wokwi Ready 超时，已重试 ${this.maxReadyRetries} 次`)

      this.emitError({
        type: 'load-error',
        message: error.message,
        timestamp: Date.now(),
        context: {
          retries: this.currentReadyRetries,
          timeout: this.readyTimeoutDuration,
        },
      })

      // 拒绝 Ready Promise
      if (this.readyReject) {
        this.readyReject(error)
        this.readyPromise = null
        this.readyResolve = null
        this.readyReject = null
      }
    }
    else {
      // 重新启动超时监控
      this.startReadyTimeout()

      // 触发重试事件
      this.triggerListeners('ready-retry', {
        retry: this.currentReadyRetries,
        maxRetries: this.maxReadyRetries,
      } as any)
    }
  }

  /**
   * 发送消息到 Wokwi（带队列机制）
   * @param message 要发送的消息
   * @returns Promise<void>
   */
  async sendMessage(message: WokwiMessage): Promise<void> {
    if (!this.iframe) {
      throw new Error('MessageBridge: 未初始化 iframe')
    }

    // 验证消息格式
    if (!validateWokwiMessage(message)) {
      throw new Error('MessageBridge: 无效的消息格式')
    }

    // 检查队列大小限制
    if (this.pendingQueue.length >= this.maxQueueSize) {
      console.warn('MessageBridge: 待发送队列已满，丢弃最旧的消息')
      this.pendingQueue.shift()
    }

    if (!this.isWokwiReady) {
      // iframe 未就绪，消息入队等待
      this.pendingQueue.push(message)
      console.log(`MessageBridge: 消息已入队等待 Wokwi Ready: ${message.type}`)

      // 如果是高优先级消息，尝试等待 Ready 状态
      if (this.isHighPriorityMessage(message)) {
        try {
          await this.waitForReady()
          // Ready 后立即发送该消息
          return this.sendImmediately(message)
        }
        catch (error) {
          console.error('MessageBridge: 等待 Ready 状态失败:', error)
          throw error
        }
      }

      return Promise.resolve()
    }

    // iframe 已就绪，立即发送
    return this.sendImmediately(message)
  }

  /**
   * 判断是否为高优先级消息
   * @param message 消息
   * @returns boolean
   */
  private isHighPriorityMessage(message: WokwiMessage): boolean {
    const highPriorityTypes = [
      MESSAGE_TYPES.SIMULATION_CONTROL,
      MESSAGE_TYPES.INJECT_CODE,
    ]
    return highPriorityTypes.includes(message.type as any)
  }

  /**
   * 立即发送消息（内部方法）
   * @param message 要发送的消息
   * @returns Promise<void>
   */
  private async sendImmediately(message: WokwiMessage): Promise<void> {
    if (!this.iframe?.contentWindow) {
      throw new Error('MessageBridge: iframe contentWindow 不可用')
    }

    try {
      // 发送消息到 iframe
      this.iframe.contentWindow.postMessage(message, '*')

      // 更新统计信息
      this.messageCount++
      this.lastMessageTime = Date.now()

      console.log(`MessageBridge: 消息已发送 [${message.type}] ID: ${message.id}`)

      // 将消息添加到历史队列（用于调试）
      this.addToMessageQueue(message)
    }
    catch (error) {
      this.errorCount++
      const errorMessage = `MessageBridge: 发送消息失败 - ${error}`
      console.error(errorMessage)

      // 触发错误事件
      this.emitError({
        type: 'communication-error',
        message: errorMessage,
        timestamp: Date.now(),
        context: { message, error },
      })

      throw new Error(errorMessage)
    }
  }

  /**
   * 代码注入专用方法
   * @param filename 文件名
   * @param content 文件内容
   * @returns Promise<void>
   */
  async injectCode(filename: string, content: string): Promise<void> {
    const validFilenames = ['sketch.ino', 'main.py', 'main.cpp']
    if (!validFilenames.includes(filename)) {
      throw new Error(`MessageBridge: 不支持的文件类型: ${filename}`)
    }

    const message: WokwiMessage = {
      type: MESSAGE_TYPES.INJECT_CODE,
      payload: {
        fileUpdate: {
          filename: filename as WokwiFileUpdate['filename'],
          content,
          encoding: 'utf-8',
        },
      },
      timestamp: Date.now(),
      id: generateMessageId(),
    }

    return this.sendMessage(message)
  }

  /**
   * 监听来自 Wokwi 的消息
   * @param type 消息类型
   * @param callback 回调函数
   */
  onMessage(type: string, callback: (data: WokwiMessage | { ready: boolean } | WokwiError) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(callback)
  }

  /**
   * 移除消息监听器
   * @param type 消息类型
   * @param callback 要移除的回调函数
   */
  offMessage(type: string, callback?: (data: WokwiMessage | { ready: boolean } | WokwiError) => void): void {
    if (!this.listeners.has(type)) {
      return
    }

    if (callback) {
      const callbacks = this.listeners.get(type)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
    else {
      // 移除所有该类型的监听器
      this.listeners.delete(type)
    }
  }

  /**
   * 设置全局消息监听器
   */
  private setupGlobalMessageListener(): void {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener('message', (event: MessageEvent) => {
      this.handleIncomingMessage(event)
    })
  }

  /**
   * 处理接收到的消息
   * @param event MessageEvent
   */
  private handleIncomingMessage(event: MessageEvent): void {
    // 安全验证：检查消息来源
    if (this.securityEnabled && !this.validateMessageOrigin(event.origin)) {
      console.warn(`MessageBridge: 拒绝来自未授权域名的消息: ${event.origin}`)
      this.emitError({
        type: 'security-error',
        message: `未授权的消息来源: ${event.origin}`,
        timestamp: Date.now(),
        context: { origin: event.origin },
      })
      return
    }

    // 验证消息格式
    if (!validateWokwiMessage(event.data)) {
      console.warn('MessageBridge: 收到无效格式的消息', event.data)
      return
    }

    const message = event.data as WokwiMessage

    // 处理特殊的 Wokwi Ready 信号
    if (message.type === MESSAGE_TYPES.WOKWI_READY) {
      this.onWokwiReady()
    }

    // 将消息添加到历史队列
    this.addToMessageQueue(message)

    // 触发相应的监听器
    this.triggerListeners(message.type, message)

    // 触发通用监听器
    this.triggerListeners('*', message)

    console.log(`MessageBridge: 收到消息 [${message.type}] ID: ${message.id}`)
  }

  /**
   * 验证消息来源的合法性
   * @param origin 消息来源
   * @returns boolean
   */
  private validateMessageOrigin(origin: string): boolean {
    // 开发环境允许 localhost
    if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return true
    }

    return validateOrigin(origin)
  }

  /**
   * 处理 Wokwi Ready 信号
   */
  private onWokwiReady(): void {
    if (this.isWokwiReady) {
      console.log('MessageBridge: 收到重复的 Wokwi Ready 信号')
      return
    }

    this.isWokwiReady = true
    console.log('MessageBridge: Wokwi iframe 已就绪，开始处理待发送消息')

    // 清除 Ready 超时监控
    this.clearReadyTimeout()
    this.currentReadyRetries = 0

    // 解决 Ready Promise
    if (this.readyResolve) {
      this.readyResolve()
      this.readyPromise = null
      this.readyResolve = null
      this.readyReject = null
    }

    // 清空待发送队列
    this.flushPendingQueue()

    // 触发 Ready 事件
    this.triggerListeners('ready', { ready: true })
  }

  /**
   * 清空待发送队列
   */
  private flushPendingQueue(): void {
    const queueLength = this.pendingQueue.length
    console.log(`MessageBridge: 处理 ${queueLength} 条待发送消息`)

    while (this.pendingQueue.length > 0) {
      const message = this.pendingQueue.shift()!
      try {
        this.sendImmediately(message)
      }
      catch (error) {
        console.error('MessageBridge: 处理待发送消息时出错:', error)
        // 继续处理其他消息
      }
    }

    console.log('MessageBridge: 待发送队列已清空')
  }

  /**
   * 触发监听器
   * @param type 消息类型
   * @param data 消息数据
   */
  private triggerListeners(type: string, data: WokwiMessage | { ready: boolean } | WokwiError): void {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        }
        catch (error) {
          console.error(`MessageBridge: 监听器执行出错 [${type}]:`, error)
        }
      })
    }
  }

  /**
   * 添加消息到历史队列
   * @param message 消息
   */
  private addToMessageQueue(message: WokwiMessage): void {
    this.messageQueue.push(message)

    // 限制队列大小，保留最近的消息
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift()
    }
  }

  /**
   * 触发错误事件
   * @param error 错误信息
   */
  private emitError(error: WokwiError): void {
    this.triggerListeners('error', error)
  }

  /**
   * 清空所有队列
   */
  private clearQueues(): void {
    this.messageQueue.length = 0
    this.pendingQueue.length = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      queueSize: this.messageQueue.length,
      pendingQueueSize: this.pendingQueue.length,
      isReady: this.isWokwiReady,
      lastMessageTime: this.lastMessageTime,
      readyRetries: this.currentReadyRetries,
      maxReadyRetries: this.maxReadyRetries,
      readyTimeoutDuration: this.readyTimeoutDuration,
      hasReadyTimeout: this.readyTimeout !== null,
    }
  }

  /**
   * 获取消息历史
   */
  getMessageHistory(): WokwiMessage[] {
    return [...this.messageQueue]
  }

  /**
   * 重置 MessageBridge 状态
   */
  reset(): void {
    this.isWokwiReady = false
    this.clearQueues()
    this.listeners.clear()
    this.messageCount = 0
    this.errorCount = 0
    this.lastMessageTime = 0

    // 清理 Ready 状态相关
    this.clearReadyTimeout()
    this.currentReadyRetries = 0

    // 拒绝未完成的 Ready Promise
    if (this.readyReject) {
      this.readyReject(new Error('MessageBridge 已重置'))
    }
    this.readyPromise = null
    this.readyResolve = null
    this.readyReject = null

    console.log('MessageBridge: 状态已重置')
  }

  /**
   * 销毁 MessageBridge
   */
  destroy(): void {
    this.reset()
    this.iframe = null

    // 移除全局事件监听器（如果需要的话）
    // 注意：由于我们使用的是全局监听器，这里不移除以避免影响其他实例

    console.log('MessageBridge: 已销毁')
  }

  /**
   * 启用/禁用安全验证
   * @param enabled 是否启用
   */
  setSecurityEnabled(enabled: boolean): void {
    this.securityEnabled = enabled
    console.log(`MessageBridge: 安全验证已${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 设置消息超时时间
   * @param timeout 超时时间（毫秒）
   */
  setMessageTimeout(timeout: number): void {
    this.messageTimeout = timeout
  }

  /**
   * 设置最大队列大小
   * @param size 队列大小
   */
  setMaxQueueSize(size: number): void {
    this.maxQueueSize = size
  }

  /**
   * 设置 Ready 超时时间
   * @param timeout 超时时间（毫秒）
   */
  setReadyTimeout(timeout: number): void {
    this.readyTimeoutDuration = timeout
  }

  /**
   * 设置 Ready 最大重试次数
   * @param retries 重试次数
   */
  setMaxReadyRetries(retries: number): void {
    this.maxReadyRetries = retries
  }

  /**
   * 强制触发 Ready 状态（用于测试）
   */
  forceReady(): void {
    if (!this.isWokwiReady) {
      console.log('MessageBridge: 强制触发 Ready 状态')
      this.onWokwiReady()
    }
  }
}

// 导出单例实例（可选）
export const messageBridge = new MessageBridge()

// 导出工厂函数
export const createMessageBridge = (): MessageBridge => {
  return new MessageBridge()
}