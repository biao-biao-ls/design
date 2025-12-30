/**
 * Wokwi 集成相关的 TypeScript 类型定义
 * 用于 PoC 验证的核心接口
 */

// Wokwi 消息类型定义
export interface WokwiMessage {
  type: 'load-project' | 'inject-code' | 'inject-code-response' | 'simulation-control' | 'state-update' | 'custom-chip-event' | 'wokwi-ready'
  payload: {
    projectId?: string
    code?: string
    action?: 'start' | 'stop' | 'reset'
    state?: SimulationState
    chipData?: CustomChipData
    fileUpdate?: WokwiFileUpdate
    success?: boolean
    error?: string
  }
  timestamp: number
  id: string
}

// 代码注入专用消息格式
export interface WokwiFileUpdate {
  filename: 'sketch.ino' | 'main.py' | 'main.cpp'
  content: string
  encoding?: 'utf-8'
}

// 自定义芯片事件标准化格式
export interface CustomChipEvent {
  type: 'wokwi:custom-chip:event'
  chipId: string // 例如 "logic-analyzer-01"
  event: string  // 例如 "signal-high", "pin-change"
  data: any      // 芯片特定的数据
  timestamp: number
}

// 仿真状态接口
export interface SimulationState {
  isRunning: boolean
  runtime: number
  components: ComponentState[]
  serialOutput?: string[]
}

// 自定义芯片数据接口
export interface CustomChipData {
  chipId: string
  pins: PinState[]
  customEvents: CustomChipEvent[] // 使用标准化的芯片事件格式
}

// 组件状态接口
export interface ComponentState {
  id: string
  type: string
  value: any
  pins: PinState[]
}

// 引脚状态接口
export interface PinState {
  number: number
  value: number | boolean
  mode: 'input' | 'output' | 'analog'
}

// 性能监控数据模型
export interface PerformanceMetrics {
  loadTime: number
  messageLatency: number[]
  memoryUsage: number
  frameRate: number
  errorCount: number
  uptime: number
}

// Wokwi 错误类型
export interface WokwiError {
  type: 'load-error' | 'communication-error' | 'simulation-error' | 'security-error'
  message: string
  timestamp: number
  context?: any
}

// Wokwi 集成组件的 Props 接口
export interface WokwiIntegrationProps {
  projectId?: string
  initialCode?: string
  enableDebug?: boolean
  testMode?: 'basic' | 'communication' | 'injection' | 'custom-chip' | 'performance'
}

// Wokwi 状态接口
export interface WokwiState {
  isLoaded: boolean
  isRunning: boolean
  currentProject: string | null
  lastMessage: WokwiMessage | null
  errors: WokwiError[]
  performance: PerformanceMetrics
}

// useWokwi Composable 返回类型
export interface UseWokwiReturn {
  // 状态
  state: import('vue').Ref<WokwiState>
  isReady: import('vue').ComputedRef<boolean>

  // 方法
  loadProject: (projectId: string) => Promise<void>
  injectCode: (code: string) => Promise<boolean>
  sendMessage: (message: WokwiMessage) => Promise<void>
  startSimulation: () => Promise<void>
  stopSimulation: () => Promise<void>
  resetSimulation: () => Promise<void>

  // 事件监听
  onMessage: (callback: (message: WokwiMessage) => void) => void
  onStateChange: (callback: (state: WokwiState) => void) => void
  onError: (callback: (error: WokwiError) => void) => void
}

// 错误恢复策略接口
export interface ErrorRecoveryStrategy {
  maxRetries: number
  retryDelay: number
  fallbackAction: () => void
  userNotification: string
}

// PoC 测试场景类型
export type TestScenario = 
  | 'basic-embed'
  | 'communication'
  | 'code-injection'
  | 'custom-chip'
  | 'performance'
  | 'mobile-adaptation'
  | 'security'

// PoC 验证结果接口
export interface PocValidationResult {
  scenario: TestScenario
  success: boolean
  message: string
  metrics?: PerformanceMetrics
  errors?: WokwiError[]
  timestamp: number
}

// 消息生成工具函数类型
export type MessageGenerator = () => string