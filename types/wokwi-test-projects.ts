/**
 * Wokwi 集成 PoC 测试项目配置
 * 
 * 本文件定义了用于 Wokwi 集成验证的标准测试项目
 * 确保所有开发者和测试环境使用相同的项目进行验证
 */

export interface TestProject {
  id: string
  name: string
  description: string
  type: 'arduino' | 'esp32' | 'raspberry-pi-pico'
  features: string[]
  url?: string
}

export type TestScenario = 
  | 'basic-embed'
  | 'communication' 
  | 'code-injection'
  | 'custom-chip'
  | 'performance'

/**
 * 标准测试项目配置
 * 
 * 这些项目在 Wokwi 官网创建，专门用于 KNZN 平台的集成测试
 */
export const TEST_PROJECTS: Record<string, TestProject> = {
  // 主要测试项目 - 用于基础功能验证
  BASIC_ARDUINO: {
    id: '451385811510693889',
    name: 'Arduino LED 控制',
    description: '基础的 Arduino LED 控制项目，用于验证基本加载和交互功能',
    type: 'arduino',
    features: ['基础GPIO控制', '串口输出', '简单逻辑'],
    url: 'https://wokwi.com/projects/451385811510693889'
  },
  
  // 扩展测试项目 - 用于特定场景验证
  ESP32_SERIAL: {
    id: '451385811510693889',
    name: 'ESP32 串口通信',
    description: 'ESP32 串口通信测试，验证不同平台兼容性',
    type: 'esp32',
    features: ['WiFi模块', '串口通信', '多任务处理']
  },
  
  CODE_INJECTION: {
    id: '451385811510693889',
    name: 'Arduino 动态代码',
    description: '用于测试代码注入功能的 Arduino 项目',
    type: 'arduino',
    features: ['动态代码更新', 'LED控制', '实时编译']
  },
  
  CUSTOM_CHIP: {
    id: 'custom-logic-analyzer',
    name: '自定义逻辑分析仪',
    description: '包含自定义芯片的项目，用于测试芯片通信',
    type: 'arduino',
    features: ['自定义芯片', '逻辑分析', '事件通信']
  },
  
  PERFORMANCE: {
    id: 'complex-circuit-simulation',
    name: '复杂电路仿真',
    description: '复杂电路项目，用于性能和稳定性测试',
    type: 'arduino',
    features: ['复杂电路', '多组件', '高频操作']
  }
} as const

/**
 * 根据测试场景获取对应的项目ID
 * @param scenario 测试场景
 * @returns 项目ID
 */
export function getProjectForScenario(scenario: TestScenario): string {
  switch (scenario) {
    case 'basic-embed':
      return TEST_PROJECTS.BASIC_ARDUINO.id
    case 'communication':
      return TEST_PROJECTS.ESP32_SERIAL.id
    case 'code-injection':
      return TEST_PROJECTS.CODE_INJECTION.id
    case 'custom-chip':
      return TEST_PROJECTS.CUSTOM_CHIP.id
    case 'performance':
      return TEST_PROJECTS.PERFORMANCE.id
    default:
      return TEST_PROJECTS.BASIC_ARDUINO.id
  }
}

/**
 * 获取项目信息
 * @param projectId 项目ID
 * @returns 项目信息
 */
export function getProjectInfo(projectId: string): TestProject | undefined {
  return Object.values(TEST_PROJECTS).find(project => project.id === projectId)
}

/**
 * 获取所有可用的测试项目
 * @returns 测试项目列表
 */
export function getAllTestProjects(): TestProject[] {
  return Object.values(TEST_PROJECTS)
}

/**
 * 验证项目ID是否为有效的测试项目
 * @param projectId 项目ID
 * @returns 是否有效
 */
export function isValidTestProject(projectId: string): boolean {
  return Object.values(TEST_PROJECTS).some(project => project.id === projectId)
}