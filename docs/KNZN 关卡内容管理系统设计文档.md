# 📝 KNZN 关卡内容管理系统 (CMS) 设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 关卡内容管理系统  
**路由**: `/admin/content/lessons`  
**用户状态**: 内容管理员权限  
**文档版本**: v1.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 完整设计规范

## 🎯 核心问题与解决方案

### 问题分析
根据技术主管的分析，**内容生产是最大的瓶颈**：

> 一个高质量的关卡需要：设计电路 + 编写代码 + 编写教程文案 + 制作 X-Ray SVG 动画 + 设计故障排查逻辑。按照目前的设计，做一个关卡可能需要 2-3 天。30 个关卡就是 3 个月。

### 解决方案
开发一套**简易的 CMS（内容管理系统）**，通过配置而非写代码来生成关卡，将关卡制作时间从 2-3 天缩短到 4-6 小时。

## 🏗️ 系统架构

### 关卡数据结构 (JSON Schema)

```typescript
// 关卡配置 JSON Schema
interface LessonConfig {
  // 基础信息
  metadata: {
    id: string
    title: string
    description: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    estimatedDuration: number // 分钟
    category: string
    tags: string[]
    prerequisites: string[]
    learningObjectives: string[]
  }
  
  // 奖励配置
  rewards: {
    xp: number
    badge?: string
    unlocks?: string[] // 解锁的后续关卡
  }
  
  // 四个学习阶段
  phases: [
    {
      id: 'theory'
      type: 'THEORY'
      title: string
      content: TheoryContent
    },
    {
      id: 'practice'
      type: 'PRACTICAL'
      title: string
      content: PracticalContent
    },
    {
      id: 'debug'
      type: 'DEBUG_MODE'
      title: string
      content: DebugContent
    },
    {
      id: 'reflection'
      type: 'REFLECTION'
      title: string
      content: ReflectionContent
    }
  ]
}

// 理论阶段内容
interface TheoryContent {
  format: 'video' | 'interactive_slides' | 'text_with_images'
  
  // 视频内容
  video?: {
    url: string
    duration: number
    subtitles?: string
    interactiveElements: QuizElement[]
  }
  
  // 交互式幻灯片
  slides?: {
    slides: SlideContent[]
    navigation: 'linear' | 'free'
  }
  
  // 图文内容
  textContent?: {
    sections: TextSection[]
    images: ImageContent[]
  }
  
  // 完成条件
  completionCriteria: {
    watchPercentage?: number
    passQuizzes?: boolean
    readTime?: number
  }
}

// 实践阶段内容
interface PracticalContent {
  format: 'wokwi-simulator'
  
  wokwi: {
    projectId: string
    diagram: WokwiDiagram
    initialCode: string
    
    // X-Ray 透视配置
    xrayConfig?: {
      enabled: boolean
      animations: XRayAnimation[]
      triggers: XRayTrigger[]
    }
  }
  
  // 判题配置
  validation: {
    type: 'serial-output-check' | 'gpio-state-check' | 'custom-chip-check'
    expectedOutputs?: string[]
    gpioChecks?: GPIOCheck[]
    customChipValidation?: CustomChipConfig
  }
  
  // 提示系统
  hints: {
    automatic: AutoHint[]
    onDemand: string[]
  }
}

// 调试阶段内容
interface DebugContent {
  format: 'debug-challenge'
  
  challenge: {
    title: string
    briefing: string
    
    // 有问题的代码/电路
    buggyCode: string
    buggyCircuit?: {
      faults: CircuitFault[]
    }
    
    // 提示系统
    hints: string[]
    
    // 验证逻辑
    validation: {
      type: 'fix-verification'
      checkCriteria: string[]
    }
  }
}

// 反思阶段内容
interface ReflectionContent {
  format: 'feynman-log'
  
  reflection: {
    title: string
    prompts: string[]
    minWords: number
    maxWords: number
    
    // AI 辅助
    aiAssistance: {
      enabled: boolean
      helpType: 'writing_suggestions' | 'concept_check'
    }
  }
  
  completionCriteria: {
    wordCount: number
    coverKeyPoints: string[]
    passAIReview?: boolean
  }
}
```

## 🎨 CMS 界面设计

### 关卡编辑器主界面

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 关卡编辑器 - GPIO 基础入门                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📋 基础信息                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 标题: [GPIO 基础入门                    ]                   │ │
│ │ 描述: [学习如何使用树莓派控制 LED 灯亮灭  ]                 │ │
│ │ 难度: [初级 ▼] 时长: [35] 分钟                              │ │
│ │ 分类: [硬件基础 ▼] 标签: [GPIO, LED, 树莓派]               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🎯 学习目标                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • 理解 GPIO 端口的作用                                      │ │
│ │ • 掌握如何配置 GPIO 为输入或输出                            │ │
│ │ • 能独立点亮和熄灭一个 LED                                  │ │
│ │ • 学会调试和故障排查                                        │ │
│ │ [+ 添加目标]                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 📚 阶段配置                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📖 理论阶段 [已配置 ✅] [编辑]                               │ │
│ │ 🔧 实践阶段 [已配置 ✅] [编辑]                               │ │
│ │ 🐛 调试阶段 [未配置 ⚠️] [编辑]                               │ │
│ │ 💭 反思阶段 [已配置 ✅] [编辑]                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [💾 保存草稿] [👁️ 预览] [🚀 发布] [📋 复制为模板]              │
└─────────────────────────────────────────────────────────────────┘
```

### 实践阶段编辑器

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔧 实践阶段编辑器                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🎬 Wokwi 配置                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 项目 ID: [gpio-led-basic        ] [从模板选择 ▼]            │ │
│ │                                                             │ │
│ │ 📋 初始代码:                                                │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ import machine                                          │ │ │
│ │ │ import time                                             │ │ │
│ │ │                                                         │ │ │
│ │ │ # 设置 GPIO 17 为输出                                   │ │ │
│ │ │ led = machine.Pin(17, machine.Pin.OUT)                  │ │ │
│ │ │                                                         │ │ │
│ │ │ # 🚀 在这里写你的代码                                   │ │ │
│ │ │ # 点亮 LED                                              │ │ │
│ │ │ led.on()                                                │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ✅ 判题配置                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 判题类型: [串口输出检查 ▼]                                  │ │
│ │                                                             │ │
│ │ 期望输出:                                                   │ │
│ │ • LED ON                                                    │ │
│ │ • LED OFF                                                   │ │
│ │ [+ 添加输出]                                                │ │
│ │                                                             │ │
│ │ GPIO 状态检查:                                              │ │
│ │ • GPIO 17: 高电平 (0ms)                                     │ │
│ │ • GPIO 17: 低电平 (1000ms)                                  │ │
│ │ [+ 添加检查]                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🎨 X-Ray 透视配置                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 启用 X-Ray: [✅]                                            │ │
│ │                                                             │ │
│ │ 动画配置:                                                   │ │
│ │ • GPIO 拉高 → MOS 管导通动画                                │ │
│ │ • GPIO 拉低 → MOS 管截止动画                                │ │
│ │ [+ 添加动画] [📁 选择 SVG 文件]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [💾 保存配置] [👁️ 预览效果] [🧪 测试判题]                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 技术实现

### 1. 关卡配置存储

```typescript
// 关卡配置表
export const lessonConfigs = pgTable('lesson_configs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'),
  category: text('category'),
  
  // JSON 存储完整配置
  config: jsonb('config').$type<LessonConfig>(),
  
  // 状态管理
  status: text('status').default('draft'), // draft, published, archived
  version: integer('version').default(1),
  
  // 元数据
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at')
})

// 关卡模板表
export const lessonTemplates = pgTable('lesson_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  
  // 模板配置
  template: jsonb('template').$type<Partial<LessonConfig>>(),
  
  // 使用统计
  usageCount: integer('usage_count').default(0),
  
  createdAt: timestamp('created_at').defaultNow()
})
```

### 2. 关卡生成器

```typescript
// 关卡生成器
class LessonGenerator {
  // 从配置生成完整的关卡组件
  static generateLesson(config: LessonConfig): LessonComponent {
    return {
      metadata: config.metadata,
      phases: config.phases.map(phase => this.generatePhase(phase)),
      validation: this.generateValidation(config),
      rewards: config.rewards
    }
  }
  
  // 生成阶段组件
  static generatePhase(phase: PhaseConfig): PhaseComponent {
    switch (phase.type) {
      case 'THEORY':
        return this.generateTheoryPhase(phase.content as TheoryContent)
      case 'PRACTICAL':
        return this.generatePracticalPhase(phase.content as PracticalContent)
      case 'DEBUG_MODE':
        return this.generateDebugPhase(phase.content as DebugContent)
      case 'REFLECTION':
        return this.generateReflectionPhase(phase.content as ReflectionContent)
    }
  }
  
  // 生成实践阶段
  static generatePracticalPhase(content: PracticalContent): PracticalComponent {
    return {
      wokwiConfig: {
        projectId: content.wokwi.projectId,
        diagram: content.wokwi.diagram,
        initialCode: content.wokwi.initialCode
      },
      
      validation: {
        type: content.validation.type,
        rules: this.generateValidationRules(content.validation)
      },
      
      xrayConfig: content.wokwi.xrayConfig ? {
        animations: content.wokwi.xrayConfig.animations,
        triggers: content.wokwi.xrayConfig.triggers
      } : null,
      
      hints: content.hints
    }
  }
  
  // 生成验证规则
  static generateValidationRules(validation: ValidationConfig): ValidationRules {
    const rules = []
    
    if (validation.expectedOutputs) {
      rules.push({
        type: 'serial_output',
        expected: validation.expectedOutputs,
        weight: 50
      })
    }
    
    if (validation.gpioChecks) {
      rules.push({
        type: 'gpio_state',
        checks: validation.gpioChecks,
        weight: 50
      })
    }
    
    return { rules, passingScore: 80 }
  }
}
```

### 3. 模板系统

```typescript
// 预定义模板
const LESSON_TEMPLATES = {
  // GPIO 基础模板
  'gpio-basic': {
    metadata: {
      category: '硬件基础',
      difficulty: 'BEGINNER',
      estimatedDuration: 30,
      tags: ['GPIO', 'LED']
    },
    phases: [
      {
        type: 'THEORY',
        content: {
          format: 'video',
          video: {
            duration: 600,
            interactiveElements: [
              {
                type: 'quiz',
                time: 400,
                question: 'GPIO 中的"O"代表什么?',
                options: ['Output (输出)', 'Operation (操作)', 'Operator (操作符)'],
                correctAnswer: 0
              }
            ]
          }
        }
      },
      {
        type: 'PRACTICAL',
        content: {
          format: 'wokwi-simulator',
          wokwi: {
            projectId: 'gpio-led-template',
            initialCode: `
import machine
import time

# 设置 GPIO 17 为输出
led = machine.Pin(17, machine.Pin.OUT)

# 🚀 在这里写你的代码
# 点亮 LED
led.on()
time.sleep(1)

# 熄灭 LED
led.off()
            `
          },
          validation: {
            type: 'serial-output-check',
            expectedOutputs: ['LED ON', 'LED OFF']
          }
        }
      }
    ]
  },
  
  // 电机控制模板
  'motor-control': {
    metadata: {
      category: '电机控制',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: 45,
      tags: ['电机', 'PWM', 'L298N']
    }
    // ... 模板配置
  }
}
```

### 4. 批量生成工具

```typescript
// 批量生成关卡
class BatchLessonGenerator {
  // 从 CSV 批量导入
  static async importFromCSV(csvData: string): Promise<LessonConfig[]> {
    const rows = parseCSV(csvData)
    const lessons = []
    
    for (const row of rows) {
      const lesson = await this.generateFromRow(row)
      lessons.push(lesson)
    }
    
    return lessons
  }
  
  // 从单行数据生成关卡
  static async generateFromRow(row: CSVRow): Promise<LessonConfig> {
    const template = LESSON_TEMPLATES[row.template]
    
    return {
      ...template,
      metadata: {
        ...template.metadata,
        id: row.id,
        title: row.title,
        description: row.description
      },
      phases: template.phases.map(phase => ({
        ...phase,
        title: this.interpolateTitle(phase.title, row),
        content: this.interpolateContent(phase.content, row)
      }))
    }
  }
  
  // 内容插值
  static interpolateContent(content: any, variables: Record<string, string>): any {
    const contentStr = JSON.stringify(content)
    const interpolated = contentStr.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match
    })
    return JSON.parse(interpolated)
  }
}
```

## 📊 效率提升对比

| 任务 | 手工制作 | CMS 制作 | 效率提升 |
|------|----------|----------|----------|
| **基础关卡** | 2-3 天 | 4-6 小时 | **75% 时间节省** |
| **复杂关卡** | 3-5 天 | 8-12 小时 | **70% 时间节省** |
| **批量制作** | 30 天 (10个) | 5-7 天 (10个) | **80% 时间节省** |

### 时间分解

**手工制作 (2-3 天)**：
- 设计电路：4-6 小时
- 编写代码：3-4 小时
- 编写教程：4-6 小时
- 制作 X-Ray 动画：6-8 小时
- 设计判题逻辑：2-3 小时
- 测试调试：2-4 小时

**CMS 制作 (4-6 小时)**：
- 选择模板：15 分钟
- 配置基础信息：30 分钟
- 调整 Wokwi 配置：1-2 小时
- 配置判题规则：30 分钟
- 选择 X-Ray 动画：30 分钟
- 测试验证：1-2 小时

## 🚀 开发优先级

### Phase 1: 基础 CMS (Week 1-2)
- [ ] 关卡配置数据结构
- [ ] 基础编辑器界面
- [ ] 模板系统
- [ ] 关卡生成器

### Phase 2: 高级功能 (Week 3-4)
- [ ] X-Ray 动画配置
- [ ] 批量导入工具
- [ ] 预览和测试功能
- [ ] 版本管理

### Phase 3: 优化工具 (Week 5-6)
- [ ] 可视化电路编辑器
- [ ] 智能判题规则生成
- [ ] 关卡质量检查工具
- [ ] 使用统计和优化建议

## ✅ 成功指标

- **制作效率**：单个关卡制作时间 < 6 小时
- **质量保证**：生成的关卡通过率 > 95%
- **易用性**：非技术人员可以使用 CMS
- **扩展性**：支持新的关卡类型和模板

---

**文档版本**: v1.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队