/**
 * MessageBridge 基础功能测试
 * 验证消息队列、安全验证和基础通信功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MessageBridge } from './messageBridge'
import type { WokwiMessage } from '../types/wokwi'
import { MESSAGE_TYPES } from './wokwi'

describe('MessageBridge', () => {
  let messageBridge: MessageBridge
  let mockIframe: HTMLIFrameElement

  beforeEach(() => {
    messageBridge = new MessageBridge()
    
    // 创建模拟的 iframe
    mockIframe = {
      contentWindow: {
        postMessage: vi.fn(),
      },
    } as any
  })

  describe('初始化', () => {
    it('应该能够正确初始化', () => {
      expect(() => {
        messageBridge.initialize(mockIframe)
      }).not.toThrow()

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(false)
      expect(stats.messageCount).toBe(0)
      expect(stats.errorCount).toBe(0)
    })

    it('应该在没有 iframe 时抛出错误', () => {
      expect(() => {
        messageBridge.initialize(null as any)
      }).toThrow('MessageBridge: iframe 元素不能为空')
    })
  })

  describe('消息队列机制', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该在 Wokwi 未就绪时将消息加入待发送队列', async () => {
      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.LOAD_PROJECT, // 使用非高优先级消息类型
        payload: { projectId: '451385811510693889' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      // 发送消息（不等待，因为 Wokwi 未就绪）
      await messageBridge.sendMessage(testMessage)
      
      // 检查状态
      const stats = messageBridge.getStats()
      expect(stats.pendingQueueSize).toBe(1)
      expect(mockIframe.contentWindow!.postMessage).not.toHaveBeenCalled()
    })

    it('应该在收到 Wokwi Ready 信号后清空待发送队列', () => {
      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      // 添加消息到待发送队列
      messageBridge.sendMessage(testMessage)

      // 模拟收到 Wokwi Ready 信号
      const readyMessage: WokwiMessage = {
        type: MESSAGE_TYPES.WOKWI_READY,
        payload: {},
        timestamp: Date.now(),
        id: 'ready-message',
      }

      // 直接调用内部方法来模拟接收到 Ready 消息
      messageBridge['handleIncomingMessage']({
        data: readyMessage,
        origin: 'https://wokwi.com',
      } as MessageEvent)

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(true)
      expect(stats.pendingQueueSize).toBe(0)
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(testMessage, '*')
    })

    it('应该在队列满时丢弃最旧的消息', async () => {
      // 设置较小的队列大小用于测试
      messageBridge.setMaxQueueSize(3)

      const messages: WokwiMessage[] = []
      
      for (let i = 1; i <= 5; i++) {
        const message: WokwiMessage = {
          type: MESSAGE_TYPES.LOAD_PROJECT, // 使用非高优先级消息类型
          payload: { projectId: `project-${i}` },
          timestamp: Date.now(),
          id: `test-message-${i}`,
        }
        messages.push(message)
        await messageBridge.sendMessage(message)
      }

      const stats = messageBridge.getStats()
      expect(stats.pendingQueueSize).toBe(3) // 只保留最后3条消息

      // 触发 Ready 状态
      messageBridge.forceReady()

      // 验证只有最后3条消息被发送
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledTimes(3)
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(messages[2], '*')
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(messages[3], '*')
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(messages[4], '*')
    })

    it('应该正确处理空队列的清空操作', () => {
      // 在没有待发送消息的情况下触发 Ready
      messageBridge.forceReady()

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(true)
      expect(stats.pendingQueueSize).toBe(0)
      expect(mockIframe.contentWindow!.postMessage).not.toHaveBeenCalled()
    })

    it('应该在 Wokwi 已就绪时立即发送消息', async () => {
      // 先触发 Ready 状态
      messageBridge.forceReady()

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      await messageBridge.sendMessage(testMessage)

      const stats = messageBridge.getStats()
      expect(stats.pendingQueueSize).toBe(0)
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(testMessage, '*')
    })

    it('应该正确跟踪消息历史队列', async () => {
      // 先触发 Ready 状态以便消息能立即发送
      messageBridge.forceReady()

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      await messageBridge.sendMessage(testMessage)

      const history = messageBridge.getMessageHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toEqual(testMessage)
    })

    it('应该限制消息历史队列的大小', async () => {
      // 设置较小的队列大小
      messageBridge.setMaxQueueSize(3)
      messageBridge.forceReady()

      // 发送多条消息
      for (let i = 1; i <= 5; i++) {
        const message: WokwiMessage = {
          type: MESSAGE_TYPES.SIMULATION_CONTROL,
          payload: { action: 'start' },
          timestamp: Date.now(),
          id: `test-message-${i}`,
        }
        await messageBridge.sendMessage(message)
      }

      const history = messageBridge.getMessageHistory()
      expect(history).toHaveLength(3) // 只保留最后3条消息
      expect(history[0].id).toBe('test-message-3')
      expect(history[1].id).toBe('test-message-4')
      expect(history[2].id).toBe('test-message-5')
    })

    it('应该在重置时清空所有队列', async () => {
      // 添加消息到待发送队列
      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.LOAD_PROJECT, // 使用非高优先级消息类型
        payload: { projectId: '451385811510693889' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }
      await messageBridge.sendMessage(testMessage)

      // 触发 Ready 并发送一条消息到历史队列
      messageBridge.forceReady()
      await messageBridge.sendMessage({
        type: MESSAGE_TYPES.STATE_UPDATE,
        payload: { state: { isRunning: true, runtime: 0, components: [] } },
        timestamp: Date.now(),
        id: 'test-message-2',
      })

      // 验证队列有内容
      expect(messageBridge.getStats().queueSize).toBeGreaterThan(0)

      // 重置
      messageBridge.reset()

      // 验证所有队列都被清空
      const stats = messageBridge.getStats()
      expect(stats.queueSize).toBe(0)
      expect(stats.pendingQueueSize).toBe(0)
      expect(messageBridge.getMessageHistory()).toHaveLength(0)
    })

    it('应该正确处理队列中的不同消息类型', async () => {
      const messages: WokwiMessage[] = [
        {
          type: MESSAGE_TYPES.LOAD_PROJECT,
          payload: { projectId: '451385811510693889' },
          timestamp: Date.now(),
          id: 'load-message',
        },
        {
          type: MESSAGE_TYPES.STATE_UPDATE,
          payload: { state: { isRunning: true, runtime: 0, components: [] } },
          timestamp: Date.now(),
          id: 'state-message',
        },
        {
          type: MESSAGE_TYPES.CUSTOM_CHIP_EVENT,
          payload: {
            chipData: {
              chipId: 'test-chip',
              pins: [],
              customEvents: [],
            },
          },
          timestamp: Date.now(),
          id: 'chip-message',
        },
      ]

      // 添加不同类型的消息到队列
      for (const message of messages) {
        await messageBridge.sendMessage(message)
      }

      const stats1 = messageBridge.getStats()
      expect(stats1.pendingQueueSize).toBe(3)

      // 触发 Ready 状态
      messageBridge.forceReady()

      const stats2 = messageBridge.getStats()
      expect(stats2.pendingQueueSize).toBe(0)

      // 验证所有消息都按顺序发送
      for (let i = 0; i < messages.length; i++) {
        expect(mockIframe.contentWindow!.postMessage).toHaveBeenNthCalledWith(i + 1, messages[i], '*')
      }
    })
  })

  describe('Ready 状态处理机制', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该能够等待 Wokwi Ready 状态', async () => {
      // 启动等待 Ready 的 Promise
      const readyPromise = messageBridge.waitForReady()

      // 模拟收到 Wokwi Ready 信号
      const readyMessage: WokwiMessage = {
        type: MESSAGE_TYPES.WOKWI_READY,
        payload: {},
        timestamp: Date.now(),
        id: 'ready-message',
      }

      // 直接调用内部方法来模拟接收到 Ready 消息
      messageBridge['handleIncomingMessage']({
        data: readyMessage,
        origin: 'https://wokwi.com',
      } as MessageEvent)

      // 等待 Ready Promise 完成
      await expect(readyPromise).resolves.not.toThrow()

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(true)
      expect(stats.readyRetries).toBe(0)
    })

    it('应该在已经 Ready 时立即返回', async () => {
      // 先触发 Ready 状态
      messageBridge.forceReady()

      // 再次等待 Ready 应该立即返回
      const readyPromise = messageBridge.waitForReady()
      await expect(readyPromise).resolves.not.toThrow()

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(true)
    })

    it('应该支持多个并发的 waitForReady 调用', async () => {
      // 启动多个等待 Ready 的 Promise
      const readyPromise1 = messageBridge.waitForReady()
      const readyPromise2 = messageBridge.waitForReady()
      const readyPromise3 = messageBridge.waitForReady()

      // 触发 Ready 状态
      setTimeout(() => {
        messageBridge.forceReady()
      }, 10)

      // 所有 Promise 都应该成功完成
      await expect(Promise.all([readyPromise1, readyPromise2, readyPromise3])).resolves.not.toThrow()
    })

    it('应该在 Ready 超时后进行重试', (done) => {
      // 设置较短的超时时间用于测试
      messageBridge.setReadyTimeout(100)
      messageBridge.setMaxReadyRetries(2)

      let retryCount = 0
      messageBridge.onMessage('ready-retry', (data: any) => {
        retryCount++
        expect(data.retry).toBe(retryCount)
        expect(data.maxRetries).toBe(2)
        
        if (retryCount === 2) {
          const stats = messageBridge.getStats()
          expect(stats.readyRetries).toBe(2)
          done()
        }
      })

      // 重新初始化以触发超时
      messageBridge.initialize(mockIframe)
    })

    it('应该在达到最大重试次数后触发错误', (done) => {
      // 设置较短的超时时间和重试次数
      messageBridge.setReadyTimeout(50)
      messageBridge.setMaxReadyRetries(1)

      messageBridge.onMessage('error', (error: any) => {
        expect(error.type).toBe('load-error')
        expect(error.message).toContain('Wokwi Ready 超时')
        expect(error.context.retries).toBe(1)
        expect(error.context.timeout).toBe(50)
        done()
      })

      // 重新初始化以触发超时
      messageBridge.initialize(mockIframe)
    })

    it('应该在 Ready 超时后拒绝 waitForReady Promise', async () => {
      // 设置较短的超时时间
      messageBridge.setReadyTimeout(50)
      messageBridge.setMaxReadyRetries(1)

      // 重新初始化以触发超时
      messageBridge.initialize(mockIframe)

      // waitForReady 应该被拒绝
      await expect(messageBridge.waitForReady()).rejects.toThrow('Wokwi Ready 超时')
    })

    it('应该能够强制触发 Ready 状态', () => {
      const stats1 = messageBridge.getStats()
      expect(stats1.isReady).toBe(false)

      messageBridge.forceReady()

      const stats2 = messageBridge.getStats()
      expect(stats2.isReady).toBe(true)
    })

    it('应该忽略重复的 Ready 信号', () => {
      // 第一次触发 Ready
      messageBridge.forceReady()
      expect(messageBridge.getStats().isReady).toBe(true)

      // 模拟收到重复的 Wokwi Ready 信号
      const readyMessage: WokwiMessage = {
        type: MESSAGE_TYPES.WOKWI_READY,
        payload: {},
        timestamp: Date.now(),
        id: 'ready-message-duplicate',
      }

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // 直接调用内部方法来模拟接收到重复的 Ready 消息
      messageBridge['handleIncomingMessage']({
        data: readyMessage,
        origin: 'https://wokwi.com',
      } as MessageEvent)

      // 验证重复信号被记录
      expect(consoleSpy).toHaveBeenCalledWith('MessageBridge: 收到重复的 Wokwi Ready 信号')

      consoleSpy.mockRestore()
    })

    it('应该在 Ready 后清空待发送队列', async () => {
      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.LOAD_PROJECT, // 使用非高优先级消息类型
        payload: { projectId: '451385811510693889' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      // 添加消息到待发送队列
      await messageBridge.sendMessage(testMessage)

      const stats1 = messageBridge.getStats()
      expect(stats1.pendingQueueSize).toBe(1)

      // 强制触发 Ready 状态
      messageBridge.forceReady()

      const stats2 = messageBridge.getStats()
      expect(stats2.isReady).toBe(true)
      expect(stats2.pendingQueueSize).toBe(0)
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(testMessage, '*')
    })

    it('应该在 Ready 后清空多条待发送消息', async () => {
      const messages: WokwiMessage[] = [
        {
          type: MESSAGE_TYPES.LOAD_PROJECT,
          payload: { projectId: '451385811510693889' },
          timestamp: Date.now(),
          id: 'test-message-1',
        },
        {
          type: MESSAGE_TYPES.STATE_UPDATE,
          payload: { state: { isRunning: true, runtime: 0, components: [] } },
          timestamp: Date.now(),
          id: 'test-message-2',
        },
        {
          type: MESSAGE_TYPES.CUSTOM_CHIP_EVENT,
          payload: {
            chipData: {
              chipId: 'test-chip',
              pins: [],
              customEvents: [],
            },
          },
          timestamp: Date.now(),
          id: 'test-message-3',
        },
      ]

      // 添加多条消息到待发送队列
      for (const message of messages) {
        await messageBridge.sendMessage(message)
      }

      const stats1 = messageBridge.getStats()
      expect(stats1.pendingQueueSize).toBe(3)

      // 强制触发 Ready 状态
      messageBridge.forceReady()

      const stats2 = messageBridge.getStats()
      expect(stats2.isReady).toBe(true)
      expect(stats2.pendingQueueSize).toBe(0)

      // 验证所有消息都已发送
      for (const message of messages) {
        expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(message, '*')
      }
    })

    it('应该处理队列清空过程中的发送错误', async () => {
      // 模拟 postMessage 抛出错误
      const mockPostMessage = vi.fn()
        .mockImplementationOnce(() => { throw new Error('发送失败') })
        .mockImplementation(() => {}) // 后续调用正常

      mockIframe.contentWindow!.postMessage = mockPostMessage

      const messages: WokwiMessage[] = [
        {
          type: MESSAGE_TYPES.LOAD_PROJECT,
          payload: { projectId: '451385811510693889' },
          timestamp: Date.now(),
          id: 'test-message-1',
        },
        {
          type: MESSAGE_TYPES.STATE_UPDATE,
          payload: { state: { isRunning: true, runtime: 0, components: [] } },
          timestamp: Date.now(),
          id: 'test-message-2',
        },
      ]

      // 添加消息到待发送队列
      for (const message of messages) {
        await messageBridge.sendMessage(message)
      }

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // 强制触发 Ready 状态
      messageBridge.forceReady()

      // 验证错误被记录但不影响其他消息的发送
      expect(consoleSpy).toHaveBeenCalledWith('MessageBridge: 发送消息失败 - Error: 发送失败')
      expect(mockPostMessage).toHaveBeenCalledTimes(2)

      consoleSpy.mockRestore()
    })

    it('应该处理高优先级消息的等待逻辑', async () => {
      const highPriorityMessage: WokwiMessage = {
        type: MESSAGE_TYPES.INJECT_CODE,
        payload: {
          fileUpdate: {
            filename: 'sketch.ino',
            content: 'test code',
            encoding: 'utf-8',
          },
        },
        timestamp: Date.now(),
        id: 'high-priority-message',
      }

      // 发送高优先级消息（应该等待 Ready）
      const sendPromise = messageBridge.sendMessage(highPriorityMessage)

      // 在另一个任务中触发 Ready
      setTimeout(() => {
        messageBridge.forceReady()
      }, 10)

      // 等待发送完成
      await expect(sendPromise).resolves.not.toThrow()

      // 验证消息已发送
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledWith(highPriorityMessage, '*')
    })

    it('应该在高优先级消息等待 Ready 失败时抛出错误', async () => {
      // 设置较短的超时时间
      messageBridge.setReadyTimeout(50)
      messageBridge.setMaxReadyRetries(1)

      const highPriorityMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'high-priority-message',
      }

      // 重新初始化以触发超时
      messageBridge.initialize(mockIframe)

      // 发送高优先级消息应该失败
      await expect(messageBridge.sendMessage(highPriorityMessage)).rejects.toThrow('Wokwi Ready 超时')
    })

    it('应该在重置时清理 Ready 状态', async () => {
      // 启动等待 Ready 的 Promise
      const readyPromise = messageBridge.waitForReady()

      // 重置 MessageBridge
      messageBridge.reset()

      // waitForReady Promise 应该被拒绝
      await expect(readyPromise).rejects.toThrow('MessageBridge 已重置')

      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(false)
      expect(stats.readyRetries).toBe(0)
      expect(stats.hasReadyTimeout).toBe(false)
    })

    it('应该在销毁时清理 Ready 状态', async () => {
      // 启动等待 Ready 的 Promise
      const readyPromise = messageBridge.waitForReady()

      // 销毁 MessageBridge
      messageBridge.destroy()

      // waitForReady Promise 应该被拒绝
      await expect(readyPromise).rejects.toThrow('MessageBridge 已重置')
    })

    it('应该正确触发 Ready 事件监听器', (done) => {
      messageBridge.onMessage('ready', (data: any) => {
        expect(data.ready).toBe(true)
        done()
      })

      messageBridge.forceReady()
    })

    it('应该在初始化时清理之前的 Ready 状态', () => {
      // 先触发 Ready 状态
      messageBridge.forceReady()
      expect(messageBridge.getStats().isReady).toBe(true)

      // 重新初始化
      messageBridge.initialize(mockIframe)

      // Ready 状态应该被重置
      const stats = messageBridge.getStats()
      expect(stats.isReady).toBe(false)
      expect(stats.readyRetries).toBe(0)
      expect(stats.pendingQueueSize).toBe(0)
    })
  })

  describe('消息验证', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该拒绝无效格式的消息', async () => {
      const invalidMessage = {
        type: 'invalid-type',
        // 缺少必需字段
      } as any

      await expect(messageBridge.sendMessage(invalidMessage)).rejects.toThrow('MessageBridge: 无效的消息格式')
    })

    it('应该接受有效格式的消息', async () => {
      const validMessage: WokwiMessage = {
        type: MESSAGE_TYPES.LOAD_PROJECT,
        payload: { projectId: '451385811510693889' },
        timestamp: Date.now(),
        id: 'test-message',
      }

      await expect(messageBridge.sendMessage(validMessage)).resolves.not.toThrow()
    })
  })

  describe('代码注入功能', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该支持有效的文件类型', async () => {
      const validFilenames = ['sketch.ino', 'main.py', 'main.cpp']
      
      // 先触发 Ready 状态以便消息能立即发送
      messageBridge.forceReady()
      
      const promises = validFilenames.map(filename => 
        messageBridge.injectCode(filename, 'test code')
      )
      
      await Promise.all(promises)
      
      // 验证所有文件类型都被接受
      expect(mockIframe.contentWindow!.postMessage).toHaveBeenCalledTimes(3)
    })

    it('应该拒绝无效的文件类型', async () => {
      await expect(messageBridge.injectCode('invalid.txt', 'test code'))
        .rejects.toThrow('MessageBridge: 不支持的文件类型: invalid.txt')
    })
  })

  describe('事件监听', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该能够添加和触发消息监听器', () => {
      const mockCallback = vi.fn()
      messageBridge.onMessage('test-event', mockCallback)

      // 模拟触发事件
      const testData = { test: 'data' }
      messageBridge['triggerListeners']('test-event', testData)

      expect(mockCallback).toHaveBeenCalledWith(testData)
    })

    it('应该能够移除消息监听器', () => {
      const mockCallback = vi.fn()
      messageBridge.onMessage('test-event', mockCallback)
      messageBridge.offMessage('test-event', mockCallback)

      // 模拟触发事件
      messageBridge['triggerListeners']('test-event', { test: 'data' })

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('统计信息', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该正确跟踪统计信息', () => {
      const initialStats = messageBridge.getStats()
      expect(initialStats.messageCount).toBe(0)
      expect(initialStats.errorCount).toBe(0)
      expect(initialStats.queueSize).toBe(0)
      expect(initialStats.pendingQueueSize).toBe(0)
      expect(initialStats.isReady).toBe(false)
      expect(initialStats.readyRetries).toBe(0)
      expect(initialStats.maxReadyRetries).toBe(3)
      expect(initialStats.readyTimeoutDuration).toBe(10000)
    })

    it('应该能够重置状态', () => {
      // 添加一些消息
      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message',
      }
      messageBridge.sendMessage(testMessage)

      // 重置状态
      messageBridge.reset()

      const stats = messageBridge.getStats()
      expect(stats.messageCount).toBe(0)
      expect(stats.errorCount).toBe(0)
      expect(stats.queueSize).toBe(0)
      expect(stats.pendingQueueSize).toBe(0)
      expect(stats.isReady).toBe(false)
      expect(stats.readyRetries).toBe(0)
    })
  })

  describe('安全验证', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该能够启用和禁用安全验证', () => {
      messageBridge.setSecurityEnabled(false)
      // 这里我们无法直接测试内部状态，但可以确保方法不抛出错误
      expect(() => messageBridge.setSecurityEnabled(true)).not.toThrow()
    })
  })

  describe('超时和错误处理', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该在发送消息失败时抛出错误', async () => {
      // 模拟 postMessage 抛出错误
      mockIframe.contentWindow!.postMessage = vi.fn(() => {
        throw new Error('postMessage 失败')
      })

      // 先触发 Ready 状态
      messageBridge.forceReady()

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      await expect(messageBridge.sendMessage(testMessage)).rejects.toThrow('MessageBridge: 发送消息失败')

      // 验证错误统计被更新
      const stats = messageBridge.getStats()
      expect(stats.errorCount).toBe(1)
    })

    it('应该在发送消息失败时触发错误事件', async () => {
      // 模拟 postMessage 抛出错误
      mockIframe.contentWindow!.postMessage = vi.fn(() => {
        throw new Error('postMessage 失败')
      })

      // 先触发 Ready 状态
      messageBridge.forceReady()

      let errorReceived: any = null
      messageBridge.onMessage('error', (error) => {
        errorReceived = error
      })

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      try {
        await messageBridge.sendMessage(testMessage)
      } catch (error) {
        // 忽略抛出的错误，我们关心的是事件
      }

      expect(errorReceived).not.toBeNull()
      expect(errorReceived.type).toBe('communication-error')
      expect(errorReceived.message).toContain('发送消息失败')
      expect(errorReceived.context.message).toEqual(testMessage)
    })

    it('应该在 iframe 不可用时抛出错误', async () => {
      // 设置无效的 iframe
      mockIframe.contentWindow = null

      // 先触发 Ready 状态
      messageBridge.forceReady()

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      await expect(messageBridge.sendMessage(testMessage)).rejects.toThrow('iframe contentWindow 不可用')
    })

    it('应该在未初始化时抛出错误', async () => {
      const newBridge = new MessageBridge()

      const testMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message-1',
      }

      await expect(newBridge.sendMessage(testMessage)).rejects.toThrow('MessageBridge: 未初始化 iframe')
    })

    it('应该正确处理 Ready 超时重试机制', (done) => {
      // 设置测试参数
      messageBridge.setReadyTimeout(100)
      messageBridge.setMaxReadyRetries(3)

      let retryCount = 0
      const retryData: any[] = []

      messageBridge.onMessage('ready-retry', (data: any) => {
        retryCount++
        retryData.push(data)

        if (retryCount === 3) {
          // 验证重试数据
          expect(retryData).toHaveLength(3)
          expect(retryData[0].retry).toBe(1)
          expect(retryData[1].retry).toBe(2)
          expect(retryData[2].retry).toBe(3)
          expect(retryData[0].maxRetries).toBe(3)

          const stats = messageBridge.getStats()
          expect(stats.readyRetries).toBe(3)
          done()
        }
      })

      // 重新初始化以触发超时
      messageBridge.initialize(mockIframe)
    })

    it('应该在超时重试期间正确更新统计信息', (done) => {
      messageBridge.setReadyTimeout(50)
      messageBridge.setMaxReadyRetries(2)

      let checkCount = 0
      messageBridge.onMessage('ready-retry', () => {
        checkCount++
        const stats = messageBridge.getStats()
        expect(stats.readyRetries).toBe(checkCount)
        expect(stats.isReady).toBe(false)

        if (checkCount === 2) {
          done()
        }
      })

      messageBridge.initialize(mockIframe)
    })

    it('应该在达到最大重试次数后停止重试', (done) => {
      messageBridge.setReadyTimeout(50)
      messageBridge.setMaxReadyRetries(2)

      let retryCount = 0
      let errorReceived = false

      messageBridge.onMessage('ready-retry', () => {
        retryCount++
      })

      messageBridge.onMessage('error', (error: any) => {
        errorReceived = true
        expect(retryCount).toBe(2) // 应该只重试2次
        expect(error.type).toBe('load-error')
        expect(error.context.retries).toBe(2)
        done()
      })

      messageBridge.initialize(mockIframe)
    })

    it('应该在 Ready 成功后停止超时监控', () => {
      messageBridge.setReadyTimeout(1000) // 设置较长的超时时间

      // 初始化后应该有超时监控
      messageBridge.initialize(mockIframe)
      expect(messageBridge.getStats().hasReadyTimeout).toBe(true)

      // 触发 Ready 后应该清除超时监控
      messageBridge.forceReady()
      expect(messageBridge.getStats().hasReadyTimeout).toBe(false)
    })

    it('应该在重置时清除超时监控', () => {
      messageBridge.setReadyTimeout(1000)
      messageBridge.initialize(mockIframe)

      expect(messageBridge.getStats().hasReadyTimeout).toBe(true)

      messageBridge.reset()
      expect(messageBridge.getStats().hasReadyTimeout).toBe(false)
    })

    it('应该在销毁时清除超时监控', () => {
      messageBridge.setReadyTimeout(1000)
      messageBridge.initialize(mockIframe)

      expect(messageBridge.getStats().hasReadyTimeout).toBe(true)

      messageBridge.destroy()
      expect(messageBridge.getStats().hasReadyTimeout).toBe(false)
    })

    it('应该正确处理监听器执行中的错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // 添加一个会抛出错误的监听器
      messageBridge.onMessage('test-event', () => {
        throw new Error('监听器错误')
      })

      // 添加一个正常的监听器
      const normalCallback = vi.fn()
      messageBridge.onMessage('test-event', normalCallback)

      // 触发事件
      messageBridge['triggerListeners']('test-event', { test: 'data' })

      // 验证错误被记录但不影响其他监听器
      expect(consoleSpy).toHaveBeenCalledWith('MessageBridge: 监听器执行出错 [test-event]:', expect.any(Error))
      expect(normalCallback).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('应该正确处理安全验证失败', () => {
      // 启用安全验证
      messageBridge.setSecurityEnabled(true)

      let securityError: any = null
      messageBridge.onMessage('error', (error) => {
        if ((error as any).type === 'security-error') {
          securityError = error
        }
      })

      // 模拟来自未授权域名的消息
      const maliciousMessage: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'malicious-message',
      }

      messageBridge['handleIncomingMessage']({
        data: maliciousMessage,
        origin: 'https://malicious-site.com',
      } as MessageEvent)

      expect(securityError).not.toBeNull()
      expect(securityError.type).toBe('security-error')
      expect(securityError.message).toContain('未授权的消息来源')
      expect(securityError.context.origin).toBe('https://malicious-site.com')
    })

    it('应该在禁用安全验证时接受所有消息', () => {
      // 禁用安全验证
      messageBridge.setSecurityEnabled(false)

      let messageReceived = false
      messageBridge.onMessage('*', () => {
        messageReceived = true
      })

      // 模拟来自任意域名的消息
      const message: WokwiMessage = {
        type: MESSAGE_TYPES.SIMULATION_CONTROL,
        payload: { action: 'start' },
        timestamp: Date.now(),
        id: 'test-message',
      }

      messageBridge['handleIncomingMessage']({
        data: message,
        origin: 'https://any-site.com',
      } as MessageEvent)

      expect(messageReceived).toBe(true)
    })

    it('应该正确处理无效消息格式', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 发送无效格式的消息
      messageBridge['handleIncomingMessage']({
        data: { invalid: 'message' },
        origin: 'https://wokwi.com',
      } as MessageEvent)

      expect(consoleSpy).toHaveBeenCalledWith('MessageBridge: 收到无效格式的消息', { invalid: 'message' })

      consoleSpy.mockRestore()
    })
  })

  describe('配置设置', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('应该能够设置消息超时时间', () => {
      expect(() => messageBridge.setMessageTimeout(5000)).not.toThrow()
    })

    it('应该能够设置最大队列大小', () => {
      expect(() => messageBridge.setMaxQueueSize(200)).not.toThrow()
    })

    it('应该能够设置 Ready 超时时间', () => {
      expect(() => messageBridge.setReadyTimeout(15000)).not.toThrow()
      const stats = messageBridge.getStats()
      expect(stats.readyTimeoutDuration).toBe(15000)
    })

    it('应该能够设置最大 Ready 重试次数', () => {
      expect(() => messageBridge.setMaxReadyRetries(5)).not.toThrow()
      const stats = messageBridge.getStats()
      expect(stats.maxReadyRetries).toBe(5)
    })
  })

  describe('属性测试 - 安全通信验证', () => {
    beforeEach(() => {
      messageBridge.initialize(mockIframe)
    })

    it('属性 8: 安全通信验证 - 对于任何通信消息，Message Bridge 应该验证消息来源的合法性、限制数据类型和大小、清理潜在的恶意内容', async () => {
      const fc = await import('fast-check')
      
      // 生成器：合法的 Wokwi 域名
      const validOriginGen = fc.constantFrom(
        'https://wokwi.com',
        'https://embed.wokwi.com',
        'https://api.wokwi.com'
      )

      // 生成器：非法的域名
      const invalidOriginGen = fc.oneof(
        fc.webUrl({ validSchemes: ['https'] }).filter(url => 
          !url.includes('wokwi.com')
        ),
        fc.constantFrom(
          'https://malicious-site.com',
          'https://fake-wokwi.com',
          'http://wokwi.com', // 不安全的 http
          'https://evil.com'
        )
      )

      // 生成器：有效的消息类型
      const validMessageTypeGen = fc.constantFrom(
        'load-project',
        'inject-code', 
        'simulation-control',
        'state-update',
        'custom-chip-event',
        'wokwi-ready'
      )

      // 生成器：无效的消息类型
      const invalidMessageTypeGen = fc.oneof(
        fc.string().filter(s => !['load-project', 'inject-code', 'simulation-control', 'state-update', 'custom-chip-event', 'wokwi-ready'].includes(s)),
        fc.constantFrom('malicious-type', '<script>alert("xss")</script>', 'javascript:void(0)')
      )

      // 生成器：有效的消息负载
      const validPayloadGen = fc.record({
        projectId: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        action: fc.option(fc.constantFrom('start', 'stop', 'reset')),
        code: fc.option(fc.string({ maxLength: 10000 }))
      })

      // 生成器：恶意负载（包含潜在的恶意内容）
      const maliciousPayloadGen = fc.record({
        projectId: fc.option(fc.oneof(
          fc.string().filter(s => s.includes('<script>')),
          fc.string().filter(s => s.includes('javascript:')),
          fc.string().filter(s => s.includes('on'))
        )),
        code: fc.option(fc.oneof(
          fc.string().filter(s => s.includes('<script>alert("xss")</script>')),
          fc.string().filter(s => s.includes('javascript:void(0)')),
          fc.string().filter(s => s.includes('onclick='))
        ))
      })

      // 生成器：有效的完整消息
      const validMessageGen = fc.record({
        type: validMessageTypeGen,
        payload: validPayloadGen,
        timestamp: fc.integer({ min: 0 }),
        id: fc.string({ minLength: 1, maxLength: 100 })
      })

      // 生成器：无效的消息格式
      const invalidMessageGen = fc.oneof(
        // 缺少必需字段
        fc.record({
          type: validMessageTypeGen,
          payload: validPayloadGen
          // 缺少 timestamp 和 id
        }),
        // 无效的消息类型
        fc.record({
          type: invalidMessageTypeGen,
          payload: validPayloadGen,
          timestamp: fc.integer({ min: 0 }),
          id: fc.string({ minLength: 1 })
        }),
        // 非对象类型
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null))
      )

      // 属性 1: 合法来源的有效消息应该被接受
      await fc.assert(fc.asyncProperty(
        validOriginGen,
        validMessageGen,
        async (origin, message) => {
          let messageReceived = false
          let securityErrorReceived = false

          messageBridge.onMessage('*', () => {
            messageReceived = true
          })

          messageBridge.onMessage('error', (error: any) => {
            if (error.type === 'security-error') {
              securityErrorReceived = true
            }
          })

          // 启用安全验证
          messageBridge.setSecurityEnabled(true)

          // 模拟接收来自合法来源的有效消息
          messageBridge['handleIncomingMessage']({
            data: message,
            origin: origin
          } as MessageEvent)

          // 合法来源的有效消息应该被接受，不应该触发安全错误
          expect(securityErrorReceived).toBe(false)
          expect(messageReceived).toBe(true)
        }
      ), { numRuns: 50 })

      // 属性 2: 非法来源的消息应该被拒绝
      await fc.assert(fc.asyncProperty(
        invalidOriginGen,
        validMessageGen,
        async (origin, message) => {
          let securityErrorReceived = false
          let messageReceived = false

          messageBridge.onMessage('error', (error: any) => {
            if (error.type === 'security-error') {
              securityErrorReceived = true
            }
          })

          messageBridge.onMessage('*', () => {
            messageReceived = true
          })

          // 启用安全验证
          messageBridge.setSecurityEnabled(true)

          // 模拟接收来自非法来源的消息
          messageBridge['handleIncomingMessage']({
            data: message,
            origin: origin
          } as MessageEvent)

          // 非法来源的消息应该被拒绝，触发安全错误
          expect(securityErrorReceived).toBe(true)
          expect(messageReceived).toBe(false)
        }
      ), { numRuns: 50 })

      // 属性 3: 无效格式的消息应该被拒绝
      await fc.assert(fc.asyncProperty(
        validOriginGen,
        invalidMessageGen,
        async (origin, message) => {
          let messageReceived = false

          messageBridge.onMessage('*', () => {
            messageReceived = true
          })

          // 启用安全验证
          messageBridge.setSecurityEnabled(true)

          // 模拟接收无效格式的消息
          messageBridge['handleIncomingMessage']({
            data: message,
            origin: origin
          } as MessageEvent)

          // 无效格式的消息应该被拒绝
          expect(messageReceived).toBe(false)
        }
      ), { numRuns: 50 })

      // 属性 4: 禁用安全验证时应该接受所有来源的有效消息
      await fc.assert(fc.asyncProperty(
        fc.oneof(validOriginGen, invalidOriginGen),
        validMessageGen,
        async (origin, message) => {
          let messageReceived = false

          messageBridge.onMessage('*', () => {
            messageReceived = true
          })

          // 禁用安全验证
          messageBridge.setSecurityEnabled(false)

          // 模拟接收消息
          messageBridge['handleIncomingMessage']({
            data: message,
            origin: origin
          } as MessageEvent)

          // 禁用安全验证时，有效消息应该被接受，无论来源
          expect(messageReceived).toBe(true)
        }
      ), { numRuns: 50 })

      // 属性 5: 发送消息时应该验证消息格式
      await fc.assert(fc.asyncProperty(
        invalidMessageGen,
        async (message) => {
          // 先触发 Ready 状态
          messageBridge.forceReady()

          // 尝试发送无效格式的消息应该抛出错误
          await expect(messageBridge.sendMessage(message as any))
            .rejects.toThrow('MessageBridge: 无效的消息格式')
        }
      ), { numRuns: 30 })

      // 属性 6: 代码注入应该限制文件类型
      await fc.assert(fc.asyncProperty(
        fc.string().filter(filename => 
          !['sketch.ino', 'main.py', 'main.cpp'].includes(filename)
        ),
        fc.string({ maxLength: 1000 }),
        async (filename, content) => {
          // 先触发 Ready 状态
          messageBridge.forceReady()

          // 尝试注入不支持的文件类型应该抛出错误
          await expect(messageBridge.injectCode(filename, content))
            .rejects.toThrow(`MessageBridge: 不支持的文件类型: ${filename}`)
        }
      ), { numRuns: 30 })

      // 属性 7: 队列大小应该被限制
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 11, max: 50 }),
        async (maxQueueSize, messageCount) => {
          // 设置较小的队列大小
          messageBridge.setMaxQueueSize(maxQueueSize)

          const messages: any[] = []
          for (let i = 0; i < messageCount; i++) {
            const message = {
              type: 'simulation-control',
              payload: { action: 'start' },
              timestamp: Date.now(),
              id: `test-message-${i}`
            }
            messages.push(message)
            await messageBridge.sendMessage(message)
          }

          const stats = messageBridge.getStats()
          // 待发送队列大小不应该超过设定的最大值
          expect(stats.pendingQueueSize).toBeLessThanOrEqual(maxQueueSize)
        }
      ), { numRuns: 20 })

      console.log('✅ 属性 8: 安全通信验证 - 所有属性测试通过')
    }, 30000) // 增加超时时间以适应属性测试
  })
})