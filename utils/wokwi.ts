/**
 * Wokwi 集成相关的工具函数
 * 用于 PoC 验证的辅助功能
 */

import type { WokwiMessage, MessageGenerator } from '~~/types/wokwi'

// Wokwi 项目配置常量
export const WOKWI_PROJECTS = {
  '451385811510693889': {
    id: '451385811510693889',
    name: 'Arduino Uno LED 闪烁',
    description: '基础的 Arduino LED 闪烁项目',
    type: 'arduino'
  },
  '451385811510693889': {
    id: '451385811510693889', 
    name: 'ESP32 串口监视器',
    description: 'ESP32 串口通信测试项目',
    type: 'esp32'
  },
  '451385811510693889': {
    id: '451385811510693889',
    name: 'Arduino LED 控制',
    description: '可动态控制的 LED 项目',
    type: 'arduino'
  },
  'custom-logic-analyzer': {
    id: 'custom-logic-analyzer',
    name: '自定义逻辑分析仪',
    description: '包含自定义芯片的逻辑分析项目',
    type: 'custom'
  },
  'complex-circuit-simulation': {
    id: 'complex-circuit-simulation',
    name: '复杂电路仿真',
    description: '用于性能测试的复杂电路',
    type: 'complex'
  }
} as const

// Wokwi 域名白名单
export const WOKWI_ALLOWED_ORIGINS = [
  'https://wokwi.com',
  'https://embed.wokwi.com',
  'https://api.wokwi.com'
]

// 消息类型常量
export const MESSAGE_TYPES = {
  LOAD_PROJECT: 'load-project',
  INJECT_CODE: 'inject-code',
  INJECT_CODE_RESPONSE: 'inject-code-response',
  SIMULATION_CONTROL: 'simulation-control',
  STATE_UPDATE: 'state-update',
  CUSTOM_CHIP_EVENT: 'custom-chip-event',
  WOKWI_READY: 'wokwi-ready'
} as const

// 错误恢复策略配置
export const ERROR_RECOVERY_STRATEGIES = {
  'load-timeout': {
    maxRetries: 3,
    retryDelay: 2000,
    fallbackAction: () => console.log('切换到离线模式'),
    userNotification: '仿真器加载超时，正在重试...'
  },
  'communication-failed': {
    maxRetries: 5,
    retryDelay: 1000,
    fallbackAction: () => console.log('重新初始化通信桥梁'),
    userNotification: '通信中断，正在重新连接...'
  },
  'security-violation': {
    maxRetries: 0,
    retryDelay: 0,
    fallbackAction: () => console.error('安全违规，停止通信'),
    userNotification: '检测到安全问题，已停止通信'
  }
}

/**
 * 生成唯一的消息 ID
 */
export const generateMessageId: MessageGenerator = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证消息来源是否合法
 */
export const validateOrigin = (origin: string): boolean => {
  return WOKWI_ALLOWED_ORIGINS.includes(origin)
}

/**
 * 创建标准化的 Wokwi 消息
 */
export const createWokwiMessage = (
  type: WokwiMessage['type'],
  payload: WokwiMessage['payload']
): WokwiMessage => {
  return {
    type,
    payload,
    timestamp: Date.now(),
    id: generateMessageId()
  }
}

/**
 * 验证 Wokwi 消息格式
 */
export const validateWokwiMessage = (message: any): message is WokwiMessage => {
  if (!message || typeof message !== 'object') {
    return false
  }

  const requiredFields = ['type', 'payload', 'timestamp', 'id']
  for (const field of requiredFields) {
    if (!(field in message)) {
      return false
    }
  }

  // 验证消息类型
  const validTypes = Object.values(MESSAGE_TYPES)
  const additionalValidTypes = ['wokwi:file:updated', 'inject-code-response']
  const allValidTypes = [...validTypes, ...additionalValidTypes]
  
  if (!allValidTypes.includes(message.type)) {
    return false
  }

  return true
}

/**
 * 清理和验证用户输入
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return ''
  }

  // 移除潜在的恶意脚本
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化延迟时间
 */
export const formatLatency = (ms: number): string => {
  if (ms < 1) {
    return '<1ms'
  } else if (ms < 1000) {
    return `${Math.round(ms)}ms`
  } else {
    return `${(ms / 1000).toFixed(1)}s`
  }
}

/**
 * 检测设备类型
 */
export const detectDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)

  if (isTablet) {
    return 'tablet'
  } else if (isMobile) {
    return 'mobile'
  } else {
    return 'desktop'
  }
}

/**
 * 检查浏览器是否支持 Wokwi 功能
 */
export const checkBrowserSupport = (): {
  supported: boolean
  missing: string[]
} => {
  const missing: string[] = []

  if (typeof window === 'undefined') {
    return { supported: false, missing: ['window'] }
  }

  // 检查必需的 API
  if (!window.postMessage) {
    missing.push('postMessage')
  }

  if (!window.addEventListener) {
    missing.push('addEventListener')
  }

  if (!window.JSON) {
    missing.push('JSON')
  }

  // 检查 iframe 支持
  const iframe = document.createElement('iframe')
  if (!iframe.contentWindow) {
    missing.push('iframe')
  }

  return {
    supported: missing.length === 0,
    missing
  }
}

/**
 * 生成测试用的示例代码
 */
export const generateSampleCode = (type: 'arduino' | 'esp32' | 'python'): string => {
  switch (type) {
    case 'arduino':
      return `// Arduino LED 闪烁示例
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino 已启动");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
  Serial.println("LED 闪烁中...");
}`

    case 'esp32':
      return `// ESP32 WiFi 连接示例
#include <WiFi.h>

const char* ssid = "your-wifi-name";
const char* password = "your-wifi-password";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("正在连接 WiFi...");
  }
  
  Serial.println("WiFi 连接成功!");
  Serial.print("IP 地址: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  delay(1000);
}`

    case 'python':
      return `# Raspberry Pi Pico 示例
import machine
import time

led = machine.Pin(25, machine.Pin.OUT)

print("Pico 已启动")

while True:
    led.on()
    time.sleep(1)
    led.off()
    time.sleep(1)
    print("LED 闪烁中...")`

    default:
      return '// 示例代码'
  }
}

/**
 * 计算数组的平均值
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  return (...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}