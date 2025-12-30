/**
 * 代码注入功能演示
 * 展示如何使用 useWokwi 的代码注入功能
 */

import { useWokwi } from '../app/composables/useWokwi'
import { generateSampleCode } from './wokwi'

/**
 * 代码注入演示类
 */
export class CodeInjectionDemo {
  private wokwi: ReturnType<typeof useWokwi>

  constructor() {
    this.wokwi = useWokwi({ enableDebug: true })
  }

  /**
   * 初始化演示
   * @param iframe Wokwi iframe 元素
   */
  async initialize(iframe: HTMLIFrameElement): Promise<void> {
    this.wokwi.initializeIframe(iframe)
    
    // 等待 Wokwi 就绪
    while (!this.wokwi.isReady.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('代码注入演示已初始化')
  }

  /**
   * 演示基础代码注入
   */
  async demonstrateBasicInjection(): Promise<void> {
    console.log('=== 基础代码注入演示 ===')
    
    const arduinoCode = generateSampleCode('arduino')
    
    try {
      const result = await this.wokwi.injectCode(arduinoCode, 'sketch.ino')
      console.log('✅ Arduino 代码注入成功:', result)
    } catch (error) {
      console.error('❌ Arduino 代码注入失败:', error)
    }
  }

  /**
   * 演示多文件类型注入
   */
  async demonstrateMultiFileInjection(): Promise<void> {
    console.log('=== 多文件类型注入演示 ===')
    
    const testCases = [
      { filename: 'sketch.ino', code: generateSampleCode('arduino') },
      { filename: 'main.py', code: generateSampleCode('python') },
      { filename: 'main.cpp', code: generateSampleCode('esp32') },
    ]

    for (const testCase of testCases) {
      try {
        const result = await this.wokwi.injectCode(testCase.code, testCase.filename)
        console.log(`✅ ${testCase.filename} 注入成功:`, result)
      } catch (error) {
        console.error(`❌ ${testCase.filename} 注入失败:`, error)
      }
    }
  }

  /**
   * 演示错误处理
   */
  async demonstrateErrorHandling(): Promise<void> {
    console.log('=== 错误处理演示 ===')
    
    // 测试空代码
    try {
      await this.wokwi.injectCode('')
    } catch (error) {
      console.log('✅ 空代码错误处理正确:', error.message)
    }

    // 测试空白代码
    try {
      await this.wokwi.injectCode('   ')
    } catch (error) {
      console.log('✅ 空白代码错误处理正确:', error.message)
    }
  }

  /**
   * 演示动态代码更新
   */
  async demonstrateDynamicUpdate(): Promise<void> {
    console.log('=== 动态代码更新演示 ===')
    
    const codeVersions = [
      `// 版本 1: 基础 LED 闪烁
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`,
      `// 版本 2: 快速闪烁
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(200);
  digitalWrite(LED_BUILTIN, LOW);
  delay(200);
}`,
      `// 版本 3: 呼吸灯效果
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 255; i++) {
    analogWrite(LED_BUILTIN, i);
    delay(10);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(LED_BUILTIN, i);
    delay(10);
  }
}`
    ]

    for (let i = 0; i < codeVersions.length; i++) {
      try {
        const result = await this.wokwi.injectCode(codeVersions[i])
        console.log(`✅ 版本 ${i + 1} 代码更新成功:`, result)
        
        // 等待一段时间再更新下一个版本
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`❌ 版本 ${i + 1} 代码更新失败:`, error)
      }
    }
  }

  /**
   * 运行完整演示
   */
  async runFullDemo(): Promise<void> {
    console.log('🚀 开始代码注入功能完整演示')
    
    await this.demonstrateBasicInjection()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await this.demonstrateMultiFileInjection()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await this.demonstrateErrorHandling()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await this.demonstrateDynamicUpdate()
    
    console.log('✨ 代码注入功能演示完成')
  }

  /**
   * 获取演示统计信息
   */
  getStats() {
    return this.wokwi.getDebugInfo()
  }

  /**
   * 清理演示
   */
  cleanup(): void {
    this.wokwi.cleanup()
    console.log('代码注入演示已清理')
  }
}

// 导出便捷函数
export const createCodeInjectionDemo = (): CodeInjectionDemo => {
  return new CodeInjectionDemo()
}

// 使用示例
export const exampleUsage = `
// 使用示例
import { createCodeInjectionDemo } from './utils/codeInjectionDemo'

const demo = createCodeInjectionDemo()

// 在 Vue 组件中使用
export default {
  async mounted() {
    const iframe = this.$refs.wokwiIframe as HTMLIFrameElement
    await demo.initialize(iframe)
    
    // 运行演示
    await demo.runFullDemo()
    
    // 获取统计信息
    console.log('演示统计:', demo.getStats())
    
    // 清理
    demo.cleanup()
  }
}
`