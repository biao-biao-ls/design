/**
 * useWokwi 组合式函数
 * 用于管理 Wokwi 仿真器的状态和操作
 *
 * 核心功能：
 * - 响应式状态管理
 * - 基础的仿真控制方法
 * - 集成 MessageBridge 服务
 * - 错误处理和恢复机制
 */

import { ref, computed, onUnmounted } from 'vue'
import type {
  WokwiState,
  WokwiMessage,
  WokwiError,
  UseWokwiReturn,
  SimulationState,
} from '~~/types/wokwi'
import { MessageBridge } from '~~/utils/messageBridge'
import { generateMessageId, MESSAGE_TYPES } from '~~/utils/wokwi'

/**
 * useWokwi 组合式函数
 * @param options 配置选项
 * @returns UseWokwiReturn
 */
export function useWokwi(options: {
  enableDebug?: boolean
  autoConnect?: boolean
  maxRetries?: number
} = {}): UseWokwiReturn {
  const {
    enableDebug = false,
    autoConnect = true,
    maxRetries = 3,
  } = options

  // MessageBridge 实例
  const messageBridge = new MessageBridge({ enableDebug })

  // 响应式状态
  const state = ref<WokwiState>({
    isLoaded: false,
    isRunning: false,
    currentProject: null,
    lastMessage: null,
    errors: [],
    performance: {
      loadTime: 0,
      messageLatency: [],
      memoryUsage: 0,
      frameRate: 0,
      errorCount: 0,
      uptime: 0,
    },
  })

  // 内部状态
  const iframe = ref<HTMLIFrameElement | null>(null)
  const messageCallbacks = new Set<(message: WokwiMessage) => void>()
  const stateChangeCallbacks = new Set<(state: WokwiState) => void>()
  const errorCallbacks = new Set<(error: WokwiError) => void>()
  const startTime = Date.now()

  // 计算属性
  const isReady = computed(() => {
    return state.value.isLoaded && messageBridge.getStats().isReady
  })

  // 性能监控
  const updatePerformanceMetrics = () => {
    const stats = messageBridge.getStats()
    state.value.performance = {
      ...state.value.performance,
      errorCount: stats.errorCount,
      uptime: Date.now() - startTime,
    }
  }

  // 初始化 MessageBridge 事件监听
  const setupMessageBridgeListeners = () => {
    // 监听 Ready 事件
    messageBridge.onMessage('ready', () => {
      state.value.isLoaded = true
      if (enableDebug) {
        console.log('useWokwi: Wokwi 仿真器已就绪')
      }
      notifyStateChange()
    })

    // 监听状态更新消息
    messageBridge.onMessage(MESSAGE_TYPES.STATE_UPDATE, (data: WokwiMessage | { ready: boolean } | WokwiError) => {
      const message = data as WokwiMessage
      if (message.payload.state) {
        updateSimulationState(message.payload.state)
      }
      state.value.lastMessage = message
      notifyMessage(message)
    })

    // 监听自定义芯片事件
    messageBridge.onMessage(MESSAGE_TYPES.CUSTOM_CHIP_EVENT, (data: WokwiMessage | { ready: boolean } | WokwiError) => {
      const message = data as WokwiMessage
      state.value.lastMessage = message
      notifyMessage(message)
      if (enableDebug) {
        console.log('useWokwi: 收到自定义芯片事件', message.payload.chipData)
      }
    })

    // 监听错误事件
    messageBridge.onMessage('error', (data: WokwiMessage | { ready: boolean } | WokwiError) => {
      const error = data as WokwiError
      handleError(error)
    })

    // 监听所有消息（用于调试和性能监控）
    messageBridge.onMessage('*', (data: WokwiMessage | { ready: boolean } | WokwiError) => {
      const message = data as WokwiMessage
      updatePerformanceMetrics()

      if (enableDebug) {
        console.log('useWokwi: 收到消息', message.type, message)
      }
    })
  }

  // 更新仿真状态
  const updateSimulationState = (simulationState: SimulationState) => {
    state.value.isRunning = simulationState.isRunning

    // 更新性能指标
    if (simulationState.runtime) {
      state.value.performance.uptime = simulationState.runtime
    }

    notifyStateChange()
  }

  // 处理错误
  const handleError = (error: WokwiError) => {
    state.value.errors.push(error)
    state.value.performance.errorCount++

    if (enableDebug) {
      console.error('useWokwi: 错误', error)
    }

    notifyError(error)
    notifyStateChange()
  }

  // 通知消息回调
  const notifyMessage = (message: WokwiMessage) => {
    messageCallbacks.forEach((callback) => {
      try {
        callback(message)
      }
      catch (error) {
        console.error('useWokwi: 消息回调执行出错', error)
      }
    })
  }

  // 通知状态变化回调
  const notifyStateChange = () => {
    stateChangeCallbacks.forEach((callback) => {
      try {
        callback(state.value)
      }
      catch (error) {
        console.error('useWokwi: 状态变化回调执行出错', error)
      }
    })
  }

  // 通知错误回调
  const notifyError = (error: WokwiError) => {
    errorCallbacks.forEach((callback) => {
      try {
        callback(error)
      }
      catch (error) {
        console.error('useWokwi: 错误回调执行出错', error)
      }
    })
  }

  // 初始化 iframe
  const initializeIframe = (iframeElement: HTMLIFrameElement) => {
    iframe.value = iframeElement
    messageBridge.initialize(iframeElement)

    if (enableDebug) {
      console.log('useWokwi: iframe 已初始化')
    }
  }

  // 加载项目
  const loadProject = async (projectId: string): Promise<void> => {
    if (!projectId) {
      throw new Error('useWokwi: 项目 ID 不能为空')
    }

    const loadStartTime = Date.now()

    try {
      const message: WokwiMessage = {
        type: MESSAGE_TYPES.LOAD_PROJECT,
        payload: {
          projectId,
        },
        timestamp: Date.now(),
        id: generateMessageId(),
      }

      await messageBridge.sendMessage(message)

      state.value.currentProject = projectId
      state.value.performance.loadTime = Date.now() - loadStartTime

      if (enableDebug) {
        console.log(`useWokwi: 项目加载请求已发送 [${projectId}]`)
      }

      notifyStateChange()
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'load-error',
        message: `加载项目失败: ${error}`,
        timestamp: Date.now(),
        context: { projectId, error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 代码注入
  const injectCode = async (code: string, filename: string = 'sketch.ino'): Promise<boolean> => {
    if (!code) {
      throw new Error('useWokwi: 代码内容不能为空')
    }

    if (!code.trim()) {
      throw new Error('useWokwi: 代码内容不能为空白')
    }

    try {
      // 发送代码注入请求
      await messageBridge.injectCode(filename, code)

      if (enableDebug) {
        console.log(`useWokwi: 代码注入请求已发送 [${filename}]`)
      }

      // 等待 Wokwi 确认文件更新完成
      return new Promise<boolean>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          const timeoutError: WokwiError = {
            type: 'communication-error',
            message: `代码注入超时: ${filename}`,
            timestamp: Date.now(),
            context: { code, filename, timeout: 5000 },
          }
          handleError(timeoutError)
          reject(new Error('代码注入超时'))
        }, 5000) // 5秒超时

        // 监听文件更新确认消息
        const confirmationHandler = (message: WokwiMessage) => {
          if (message.type === 'inject-code-response' || 
              (message.type === 'state-update' && message.payload.fileUpdate)) {
            clearTimeout(timeoutId)
            
            // 移除监听器
            offMessage(confirmationHandler)
            
            // 检查是否是成功响应
            if (message.payload.success !== false) {
              if (enableDebug) {
                console.log(`useWokwi: 代码注入确认收到 [${filename}]`)
              }
              resolve(true)
            } else {
              const injectionError: WokwiError = {
                type: 'simulation-error',
                message: `代码注入被拒绝: ${message.payload.error || '未知错误'}`,
                timestamp: Date.now(),
                context: { code, filename, response: message.payload },
              }
              handleError(injectionError)
              reject(new Error(`代码注入被拒绝: ${message.payload.error || '未知错误'}`))
            }
          }
        }

        // 添加消息监听器
        onMessage(confirmationHandler)
      })
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'communication-error',
        message: `代码注入失败: ${error}`,
        timestamp: Date.now(),
        context: { code, filename, error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 发送消息
  const sendMessage = async (message: WokwiMessage): Promise<void> => {
    try {
      await messageBridge.sendMessage(message)

      if (enableDebug) {
        console.log('useWokwi: 自定义消息已发送', message.type)
      }
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'communication-error',
        message: `发送消息失败: ${error}`,
        timestamp: Date.now(),
        context: { message, error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 启动仿真
  const startSimulation = async (): Promise<void> => {
    const message: WokwiMessage = {
      type: MESSAGE_TYPES.SIMULATION_CONTROL,
      payload: {
        action: 'start',
      },
      timestamp: Date.now(),
      id: generateMessageId(),
    }

    try {
      await messageBridge.sendMessage(message)

      if (enableDebug) {
        console.log('useWokwi: 仿真启动请求已发送')
      }
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'simulation-error',
        message: `启动仿真失败: ${error}`,
        timestamp: Date.now(),
        context: { action: 'start', error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 停止仿真
  const stopSimulation = async (): Promise<void> => {
    const message: WokwiMessage = {
      type: MESSAGE_TYPES.SIMULATION_CONTROL,
      payload: {
        action: 'stop',
      },
      timestamp: Date.now(),
      id: generateMessageId(),
    }

    try {
      await messageBridge.sendMessage(message)

      if (enableDebug) {
        console.log('useWokwi: 仿真停止请求已发送')
      }
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'simulation-error',
        message: `停止仿真失败: ${error}`,
        timestamp: Date.now(),
        context: { action: 'stop', error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 重置仿真
  const resetSimulation = async (): Promise<void> => {
    const message: WokwiMessage = {
      type: MESSAGE_TYPES.SIMULATION_CONTROL,
      payload: {
        action: 'reset',
      },
      timestamp: Date.now(),
      id: generateMessageId(),
    }

    try {
      await messageBridge.sendMessage(message)

      // 重置本地状态
      state.value.isRunning = false
      state.value.performance.uptime = 0

      if (enableDebug) {
        console.log('useWokwi: 仿真重置请求已发送')
      }

      notifyStateChange()
    }
    catch (error) {
      const wokwiError: WokwiError = {
        type: 'simulation-error',
        message: `重置仿真失败: ${error}`,
        timestamp: Date.now(),
        context: { action: 'reset', error },
      }
      handleError(wokwiError)
      throw error
    }
  }

  // 事件监听器管理
  const onMessage = (callback: (message: WokwiMessage) => void): void => {
    messageCallbacks.add(callback)
  }

  const onStateChange = (callback: (state: WokwiState) => void): void => {
    stateChangeCallbacks.add(callback)
  }

  const onError = (callback: (error: WokwiError) => void): void => {
    errorCallbacks.add(callback)
  }

  // 移除事件监听器
  const offMessage = (callback: (message: WokwiMessage) => void): void => {
    messageCallbacks.delete(callback)
  }

  const offStateChange = (callback: (state: WokwiState) => void): void => {
    stateChangeCallbacks.delete(callback)
  }

  const offError = (callback: (error: WokwiError) => void): void => {
    errorCallbacks.delete(callback)
  }

  // 获取调试信息
  const getDebugInfo = (): {
    state: WokwiState
    messageBridgeStats: ReturnType<MessageBridge['getStats']>
    messageHistory: WokwiMessage[]
    callbacks: {
      message: number
      stateChange: number
      error: number
    }
  } => {
    return {
      state: state.value,
      messageBridgeStats: messageBridge.getStats(),
      messageHistory: messageBridge.getMessageHistory(),
      callbacks: {
        message: messageCallbacks.size,
        stateChange: stateChangeCallbacks.size,
        error: errorCallbacks.size,
      },
    }
  }

  // 重置状态
  const reset = () => {
    state.value = {
      isLoaded: false,
      isRunning: false,
      currentProject: null,
      lastMessage: null,
      errors: [],
      performance: {
        loadTime: 0,
        messageLatency: [],
        memoryUsage: 0,
        frameRate: 0,
        errorCount: 0,
        uptime: 0,
      },
    }

    messageBridge.reset()

    if (enableDebug) {
      console.log('useWokwi: 状态已重置')
    }

    notifyStateChange()
  }

  // 初始化
  const initialize = () => {
    setupMessageBridgeListeners()

    if (enableDebug) {
      console.log('useWokwi: 已初始化', {
        enableDebug,
        autoConnect,
        maxRetries,
      })
    }
  }

  // 清理函数
  const cleanup = () => {
    messageBridge.destroy()
    messageCallbacks.clear()
    stateChangeCallbacks.clear()
    errorCallbacks.clear()

    if (enableDebug) {
      console.log('useWokwi: 已清理')
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  // 立即初始化
  initialize()

  // 返回 API
  return {
    // 状态
    state,
    isReady,

    // 方法
    loadProject,
    injectCode,
    sendMessage,
    startSimulation,
    stopSimulation,
    resetSimulation,

    // 事件监听
    onMessage,
    onStateChange,
    onError,

    // 扩展方法（用于调试和高级用法）
    initializeIframe,
    offMessage,
    offStateChange,
    offError,
    getDebugInfo,
    reset,
    cleanup,
  } as UseWokwiReturn & {
    // 扩展方法
    initializeIframe: (iframe: HTMLIFrameElement) => void
    offMessage: (callback: (message: WokwiMessage) => void) => void
    offStateChange: (callback: (state: WokwiState) => void) => void
    offError: (callback: (error: WokwiError) => void) => void
    getDebugInfo: () => {
      state: WokwiState
      messageBridgeStats: ReturnType<MessageBridge['getStats']>
      messageHistory: WokwiMessage[]
      callbacks: {
        message: number
        stateChange: number
        error: number
      }
    }
    reset: () => void
    cleanup: () => void
  }
}

// 导出类型（用于其他地方引用）
export type { UseWokwiReturn }