# 🎮 KNZN 关卡场景页面 (Lesson Scene) 完整设计文档 v1.1

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 关卡场景 (Lesson Scene / Challenge Arena)  
**路由**: `/lesson/:lessonId` 或 `/challenge/:challengeId`  
**用户状态**: 已登录用户（从技能地图 `/map` 进入）  
**文档版本**: v1.1（增强版 - 包含关键遗漏修复）  
**最后更新**: 2024-12-20  
**审核状态**: ✅ 可交付高级工程师进行开发  
**文档类型**: 生产级设计规范（零歧义）

## ⚠️ v1.1 新增内容

本版本修复了 v1.0 中的 5 个关键遗漏：
1. **移动端适配** - 渐进式降级与伴侣模式
2. **状态持久化** - 自动快照与防挫败机制  
3. **布局管理** - 智能分屏与 Zen Mode
4. **Loot 系统** - 与 Sector 04 的连接
5. **错误人性化** - 智能调试与步进执行

---

## 🎯 第一部分：产品需求文档 (PRD)

### 1.1 页面定位与价值主张

#### 核心定位

关卡场景页是用户从**被动浏览**转变为**主动挑战**的舞台。用户在技能地图上点击某个节点后，进入这个沉浸式的学习-挑战空间，完成一系列任务（视频、实验、代码挑战、问卷）来掌握该技能。

#### 设计哲学

- **模块化学习路径**: 每个关卡分为 3-4 个小环节，避免一次性信息过载
- **即时反馈机制**: 每个操作都有立即的成功/失败反馈，激励持续尝试
- **多维度评估**: 不仅考核知识掌握，还评估学习速度、尝试次数、创新度
- **沉浸式环境**: 赛博朋克 UI + 动态音效，强化"在进行一场真实的技术挑战"的感受

---

### 1.2 核心功能需求 (Functional Requirements)

#### FR-001: 关卡内容结构 ✅ 模块化版

**描述**: 定义关卡的内容组织方式，确保每个关卡既有学习深度又不过度复杂

**关卡结构**:
```javascript
const LESSON_STRUCTURE = {
  // 关卡元数据
  metadata: {
    id: 'lesson_001',
    title: 'GPIO 基础入门',
    description: '学习如何使用树莓派控制 LED 灯亮灭',
    sector: 'hardware',
    difficulty: 'BEGINNER',     // BEGINNER | INTERMEDIATE | ADVANCED | MASTER
    estimatedDuration: 45,        // 分钟
    prerequisiteSkills: ['电路基础', '面包板使用'],
    learningObjectives: [         // 学习目标（用户应该学会什么）
      '理解 GPIO 端口的作用',
      '掌握如何配置 GPIO 为输入或输出',
      '能独立点亮和熄灭一个 LED'
    ],
    rewards: {
      xp: 500,
      badge: 'gpio-master',
      unlocksNextSkills: ['PWM控制LED亮度']
    }
  },

  // 关卡包含的 4 个学习环节
  phases: [
    {
      id: 'phase_1',
      type: 'THEORY',              // THEORY | PRACTICAL | CHALLENGE | QUIZ
      title: '第一阶段: 理论基础 (10 min)',
      description: '了解 GPIO 的基本概念',
      
      content: {
        format: 'video',            // video | interactive-slides | article | code-viewer
        sourceUrl: '/videos/gpio-basics.mp4',
        duration: 600,              // 秒
        
        // 视频的关键时间点标记
        keyMoments: [
          {
            time: 0,
            title: '什么是 GPIO?',
            note: '电气通用输入输出接口，树莓派的"手臂"'
          },
          {
            time: 120,
            title: 'GPIO 针脚布局',
            note: '树莓派有 40 个 GPIO 针脚'
          },
          {
            time: 300,
            title: 'BCM vs Board 编号',
            note: '两种编号方式的区别'
          }
        ],
        
        // 内嵌的交互式元素
        interactiveElements: [
          {
            type: 'quiz',
            time: 400,
            question: 'GPIO 中的"O"代表什么?',
            options: ['Output (输出)', 'Operation (操作)', 'Operator (操作符)'],
            correctAnswer: 0,
            explanation: 'GPIO 完整名称是 General Purpose Input/Output',
            onCorrect: { xp: 50, emoji: '✨' },
            onIncorrect: { hint: '提示: 是一个单词，以 O 开头' }
          }
        ],
        
        transcript: '/transcripts/gpio-basics-zh.srt'  // 字幕文件
      },
      
      completionCriteria: {
        watchPercentage: 80,        // 需要观看 80% 的视频
        passQuizzes: true            // 所有内嵌小测都要通过
      }
    },

    {
      id: 'phase_2',
      type: 'PRACTICAL',
      title: '第二阶段: 实践环节 (15 min)',
      description: '在虚拟环境中真实操作树莓派',
      
      content: {
        format: 'virtual-hardware-simulator',
        
        // 虚拟硬件模拟器配置
        simulator: {
          platform: 'TinkerCAD / Wokwi',          // 虚拟硬件平台
          boardType: 'Raspberry Pi 4',
          components: [
            {
              id: 'led_1',
              type: 'LED',
              color: 'red',
              GPIO_pin: 17,                       // GPIO 17
              initialState: 'off'
            },
            {
              id: 'resistor_1',
              type: 'Resistor',
              resistance: 220,
              unit: 'Ω'
            },
            {
              id: 'ground_rail',
              type: 'GroundRail'
            }
          ],
          
          // 虚拟面包板的初始布局
          breadboardLayout: {
            description: '将 LED 的正极接到 GPIO 17，通过 220Ω 电阻接地',
            hint: '按照电路原理图连接'
          }
        },
        
        // 用户需要完成的任务步骤
        tasks: [
          {
            step: 1,
            title: '连接电路',
            description: '根据原理图，用虚拟线路在面包板上连接 LED 和电阻',
            validation: {
              type: 'circuit-check',
              rules: [
                { rule: 'LED_positive_connected_to_GPIO17', consequence: 'pass' },
                { rule: 'Resistor_in_series', consequence: 'pass' },
                { rule: 'Complete_circuit_path', consequence: 'pass' }
              ]
            },
            help: {
              hint: '⭐ 从 LED 的长引脚开始',
              solution: '/solutions/gpio-circuit-step1.png'
            }
          },
          
          {
            step: 2,
            title: '编写代码控制 LED',
            description: '写一段 Python 代码点亮和熄灭 LED',
            
            environment: {
              type: 'web-ide',
              language: 'python',
              template: `
import RPi.GPIO as GPIO
import time

# 设置 GPIO 模式
GPIO.setmode(GPIO.BCM)

# 设置 GPIO 17 为输出
GPIO.setup(17, GPIO.OUT)

# 🚀 在这里写你的代码
# 点亮 LED
GPIO.output(17, GPIO.HIGH)
time.sleep(1)

# 熄灭 LED
GPIO.output(17, GPIO.LOW)

# 清理资源
GPIO.cleanup()
              `
            },
            
            validation: {
              type: 'code-execution',
              expectedOutput: {
                actions: [
                  { action: 'GPIO17_set_HIGH', time: 0 },
                  { action: 'GPIO17_set_LOW', time: 1000 }
                ]
              },
              testCases: [
                {
                  name: 'LED 应该在 0 秒时点亮',
                  check: 'LED_state === ON at t=0',
                  passed: true
                },
                {
                  name: 'LED 应该在 1 秒时熄灭',
                  check: 'LED_state === OFF at t=1000',
                  passed: true
                }
              ]
            },
            
            help: {
              hint: '⭐ 使用 GPIO.output() 函数来控制',
              wrongAnswerExplanations: {
                'forgot_GPIO_cleanup': '别忘了在最后清理 GPIO 资源！',
                'wrong_pin_number': '确保使用 GPIO 17，不是物理引脚号',
                'logic_reversed': 'HIGH = 点亮，LOW = 熄灭'
              }
            }
          }
        ],
        
        completionCriteria: {
          allTasksPassed: true,
          codeExecuted: true
        }
      }
    },

    {
      id: 'phase_3',
      type: 'CHALLENGE',
      title: '第三阶段: 创意挑战 (15 min)',
      description: '完成一个开放式挑战，展示你的创新思维',
      
      content: {
        format: 'creative-challenge',
        
        challenge: {
          title: '制作一个 SOS 求救灯',
          briefing: `
你现在是一名在孤岛上的电子工程师。
你需要用树莓派和一个 LED 灯发送摩尔斯电码求救信号。
S = · · · (3 个点)
O = − − − (3 个划)
S = · · · (3 个点)
          `,
          
          requirements: {
            functional: [
              '用 GPIO 17 控制 LED',
              '正确实现摩尔斯电码的 SOS 序列',
              '点 (·) = LED 亮 0.1 秒',
              '划 (−) = LED 亮 0.3 秒',
              '字母间隔 = 0.2 秒',
              '字与字间隔 = 0.7 秒'
            ],
            optional: [
              '重复 SOS 信号直到按下 Ctrl+C',
              '添加注释解释你的代码逻辑',
              '优化代码，避免重复 (使用函数或循环)'
            ]
          },
          
          startingCode: `
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)

# 🚀 实现 SOS 摩尔斯电码
# 提示: 定义一个函数来闪烁 LED

def blink(duration):
    GPIO.output(17, GPIO.HIGH)
    time.sleep(duration)
    GPIO.output(17, GPIO.LOW)
    time.sleep(0.1)

# 在这里实现 SOS...

GPIO.cleanup()
          `,
          
          evaluation: {
            automatic: {
              type: 'pattern-matching',
              checkPoints: [
                { check: 'SOS_pattern_correct', weight: 40 },
                { check: 'timing_accuracy', tolerance_ms: 50, weight: 30 },
                { check: 'code_cleanup', weight: 10 }
              ]
            },
            
            human: {
              type: 'peer-review',
              criteria: [
                { criterion: '代码可读性', weight: 10 },
                { criterion: '创意实现 (如是否优化或扩展)', weight: 10 }
              ],
              enabled: true
            }
          },
          
          hints: [
            {
              level: 1,
              text: '💡 你可以写一个函数来处理点和划'
            },
            {
              level: 2,
              text: '💡 使用列表来存储 SOS 的节奏模式'
            },
            {
              level: 3,
              text: '点击"显示解决方案"看一个示例'
            }
          ],
          
          exampleSolution: '/solutions/sos-morse-solution.py'
        }
      }
    },

    {
      id: 'phase_4',
      type: 'QUIZ',
      title: '第四阶段: 知识测验 (5 min)',
      description: '检验你对 GPIO 概念的掌握程度',
      
      content: {
        format: 'quiz',
        
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: '下列哪个不是 GPIO 的特点?',
            options: [
              '可编程配置为输入或输出',
              '可以与各种外设通信',
              '工作频率不能超过 1MHz',  // 正确答案（错误的说法）
              '树莓派有 40 个 GPIO 针脚'
            ],
            correctAnswer: 2,
            explanation: 'GPIO 实际上可以工作在远高于 1MHz 的频率。树莓派 GPIO 可以处理数 MHz 的频率。',
            difficulty: 'INTERMEDIATE'
          },
          
          {
            id: 'q2',
            type: 'true-false',
            question: '在树莓派上，BCM 编号和物理引脚编号是一样的吗?',
            correctAnswer: false,
            explanation: '不一样。BCM (Broadcom) 编号和物理位置编号不同。GPIO 17 在物理引脚 11。',
            difficulty: 'BEGINNER'
          },
          
          {
            id: 'q3',
            type: 'code-reading',
            question: '这段代码的输出是什么?',
            code: `
GPIO.setup(17, GPIO.OUT)
GPIO.output(17, GPIO.HIGH)  # 1 秒亮
time.sleep(1)
GPIO.output(17, GPIO.LOW)   # 1 秒灭
time.sleep(1)
print("LED 已关闭")
            `,
            options: [
              'LED 闪烁 1 秒亮 1 秒灭，然后打印消息',
              'LED 一直亮，打印消息',
              'LED 一直灭，打印消息',
              '代码错误'
            ],
            correctAnswer: 0,
            difficulty: 'INTERMEDIATE'
          }
        ],
        
        scoringRules: {
          passingScore: 60,         // 60% 通过
          totalQuestions: 3,
          pointPerQuestion: 100 / 3,
          
          rewards: {
            perfectScore: {
              xp: 200,
              badge: 'gpio-expert'
            },
            passingScore: {
              xp: 100,
              message: '很好！你掌握了 GPIO 基础。'
            },
            failingScore: {
              xp: 0,
              allowRetry: true,
              message: '再试一次吧。回到理论部分复习一下。'
            }
          }
        }
      }
    }
  ],

  // 关卡完成后的总结
  completion: {
    summary: {
      title: '恭喜！你已掌握 GPIO 基础',
      totalTimeSpent: 'calculated',
      performanceRating: 'calculated',  // A+ ~ D
      nextRecommendedSkill: 'PWM 控制 LED 亮度'
    },
    
    rewards: {
      totalXP: 500,
      badge: 'gpio-master',
      unlockedSkills: ['PWM控制LED亮度', '按钮输入检测'],
      certificateEarned: true
    }
  }
}
```

---

#### FR-002: 关卡进度跟踪 ✅ 实时反馈版

**描述**: 实时显示用户在当前关卡中的进度，提供即时的成功/失败反馈

**进度追踪系统**:
```javascript
const PROGRESS_TRACKING = {
  // 实时进度条
  progressBar: {
    segments: [
      { id: 'phase_1', label: '理论', progress: 100, status: 'completed' },
      { id: 'phase_2', label: '实践', progress: 65, status: 'in-progress' },
      { id: 'phase_3', label: '挑战', progress: 0, status: 'locked' },
      { id: 'phase_4', label: '测验', progress: 0, status: 'locked' }
    ],
    totalProgress: 41,  // (100 + 65 + 0 + 0) / 4
    estimatedTimeRemaining: 25  // 分钟
  },

  // 每个环节内的详细进度
  phaseProgress: {
    current: 'phase_2',
    details: {
      tasksCompleted: 1,
      taskTotal: 2,
      percentComplete: 50,
      status: 'in-progress'
    }
  },

  // 用户的各项指标
  performanceMetrics: {
    accuracy: {
      label: '准确度',
      value: 90,
      unit: '%',
      color: '#00FFC2'  // 荧光青
    },
    
    speed: {
      label: '速度',
      value: 85,
      unit: '%',
      reference: 'average_learner',  // 相对于平均学习者
      color: '#FFD700'  // 金色
    },
    
    attempts: {
      label: '尝试次数',
      value: 3,
      reference: 'phase_2_step_2'
    },
    
    timeElapsed: {
      label: '已花时间',
      value: 20,
      unit: 'min',
      estimatedTotal: 45
    }
  },

  // 实时反馈消息
  feedback: {
    onSuccess: {
      immediate: {
        type: 'celebration',
        animation: 'confetti',
        sound: 'success_chime.mp3',
        message: '✨ 完美！电路连接正确！',
        duration: 2000
      },
      
      delayed: {
        type: 'encouragement',
        delay: 3000,
        message: '你的连接速度比平均水平快 15%！',
        xpEarned: 50
      }
    },
    
    onFailure: {
      immediate: {
        type: 'hint',
        message: '⚠️ LED 的正极似乎没有接到 GPIO 17',
        color: '#FF6B35'  // 橙红
      },
      
      progressive: [
        {
          attempt: 1,
          hint: '💡 提示: 检查 LED 的长引脚'
        },
        {
          attempt: 2,
          hint: '💡 提示: LED 的长引脚应该连接到 GPIO 17'
        },
        {
          attempt: 3,
          hint: '💡 显示完整解决方案?',
          canReveal: true
        }
      ]
    }
  }
}
```

---

#### FR-003: 代码编辑器集成 ✅ IDE 版

**描述**: 在页面内嵌入功能完整的代码编辑器，支持实时执行和反馈

**代码编辑器配置**:
```javascript
const CODE_EDITOR_CONFIG = {
  // IDE 环境
  environment: {
    type: 'web-based-ide',
    languages: ['python', 'javascript', 'c++'],
    defaultLanguage: 'python',
    
    // 执行环境（沙箱）
    sandbox: {
      type: 'docker-container',
      image: 'python:3.9-slim',
      timeout: 10000,  // 10 秒超时
      memoryLimit: '256MB',
      
      preInstalledLibraries: [
        'RPi.GPIO',
        'time',
        'math',
        'random'
      ]
    }
  },

  // 编辑器功能
  features: {
    syntax-highlighting: {
      enabled: true,
      theme: 'dark-cyberpunk'
    },
    
    auto-completion: {
      enabled: true,
      suggestions: [
        'GPIO.setup',
        'GPIO.output',
        'GPIO.input',
        'time.sleep',
        'GPIO.HIGH',
        'GPIO.LOW'
      ]
    },
    
    error-detection: {
      enabled: true,
      realTime: true,
      highlightErrors: true
    },
    
    code-formatting: {
      enabled: true,
      formatter: 'black',
      onSave: true
    },
    
    version-control: {
      enabled: true,
      saveHistory: true,
      maxSnapshots: 10
    }
  },

  // 执行和测试
  execution: {
    runCode: {
      button: '▶ 运行代码',
      hotkey: 'Ctrl+Enter',
      
      // 执行流程
      process: [
        { step: 1, action: 'validateSyntax', timeout: 2000 },
        { step: 2, action: 'analyzeDependencies', timeout: 1000 },
        { step: 3, action: 'initializeSimulator', timeout: 2000 },
        { step: 4, action: 'executeCode', timeout: 10000 },
        { step: 5, action: 'collectOutput', timeout: 1000 },
        { step: 6, action: 'validateOutput', timeout: 2000 }
      ]
    },

    // 测试用例自动化
    testCases: [
      {
        name: 'GPIO 17 应该被设置为输出',
        code: 'assert GPIO.gpio_function(17) == GPIO.OUT',
        weight: 30
      },
      {
        name: 'LED 应该在第 0 秒亮起',
        code: 'assert LED_state_at_time(0) == HIGH',
        weight: 40
      },
      {
        name: 'LED 应该在第 1 秒熄灭',
        code: 'assert LED_state_at_time(1000) == LOW',
        weight: 30
      }
    ]
  },

  // 输出面板
  outputPanel: {
    sections: [
      {
        id: 'console',
        label: '控制台输出',
        content: 'simulation_output_stream'
      },
      {
        id: 'simulation',
        label: '硬件模拟器',
        content: 'virtual_circuit_state'
      },
      {
        id: 'errors',
        label: '错误日志',
        content: 'error_messages'
      }
    ]
  }
}
```

---

#### FR-004: 多维度成就系统 ✅ 即时激励版

**描述**: 不仅基于正确性评估，还基于学习速度、创新度、努力程度等多维度给予成就

**成就系统配置**:
```javascript
const ACHIEVEMENT_SYSTEM = {
  dimensions: [
    {
      id: 'accuracy',
      name: '准确度',
      weight: 40,
      thresholds: {
        perfect: { score: 100, badge: 'gpio-precision', xp: 200 },
        excellent: { score: 90, badge: 'gpio-expert', xp: 150 },
        good: { score: 80, xp: 100 },
        passing: { score: 60, xp: 50 }
      }
    },
    
    {
      id: 'speed',
      name: '速度',
      weight: 20,
      reference: 'average_learner',
      bonuses: [
        {
          condition: 'completed_in_50%_of_estimated_time',
          badge: 'flash-learner',
          xp: 150
        },
        {
          condition: 'completed_faster_than_99%_of_peers',
          badge: 'speed-demon',
          xp: 200
        }
      ]
    },
    
    {
      id: 'persistence',
      name: '坚持度',
      weight: 15,
      metrics: [
        {
          metric: 'attempts_until_success',
          thresholds: {
            first_try: { badge: 'first-blood', xp: 100 },
            second_try: { xp: 75 },
            multiple_tries: { badge: 'perseverance', xp: 50 }
          }
        },
        {
          metric: 'no_skip_hints',
          badge: 'independent-thinker',
          xp: 100
        }
      ]
    },
    
    {
      id: 'creativity',
      name: '创意度',
      weight: 15,
      unlocks: [
        {
          condition: 'creative_challenge_completed',
          evaluation: 'peer-review',
          badge: 'innovator',
          xp: 200
        },
        {
          condition: 'extended_solution_beyond_requirements',
          badge: 'overachiever',
          xp: 150
        }
      ]
    }
  ],

  // 实时成就通知
  notifications: {
    onAchievementUnlock: {
      animation: 'badge-popup',
      sound: 'achievement_unlock.mp3',
      position: 'top-center',
      duration: 3000
    },
    
    onMilestone: {
      animation: 'milestone-banner',
      sound: 'milestone_reached.mp3',
      message: '🎉 你完成了第一个硬件项目！',
      sharable: true
    }
  }
}
```

---

#### FR-005: 社交互动与同伴学习 ✅ 协作版

**描述**: 允许用户看到同伴的进度、寻求帮助、分享成就

**社交互动配置**:
```javascript
const SOCIAL_FEATURES = {
  // 同伴进度可视化（匿名）
  peerInsights: {
    enabled: true,
    privacy: 'anonymous',
    
    display: {
      averageScore: {
        label: '平均通过率',
        value: '78%',
        yourScore: '92%',
        color: '#00FFC2'
      },
      
      averageTime: {
        label: '平均用时',
        value: '48 分钟',
        yourTime: '35 分钟',
        badge: 'faster-than-average'
      },
      
      attemptDistribution: {
        label: '尝试次数分布',
        chart: 'histogram',
        yourAttempts: 2,
        medianAttempts: 3
      }
    }
  },

  // 寻求帮助功能
  getHelp: {
    askCommunity: {
      enabled: true,
      placeholder: '描述你卡住的地方...',
      responseTime: 'average: 2 hours',
      
      helpOptions: [
        {
          type: 'ask-question',
          label: '提出问题',
          icon: '💬'
        },
        {
          type: 'request-peer-review',
          label: '请求同伴评审',
          icon: '👥'
        },
        {
          type: 'discuss-alternative-solutions',
          label: '讨论其他解决方案',
          icon: '💡'
        }
      ]
    },

    askTutor: {
      enabled: true,
      costXP: 200,  // 消耗 XP 获取专业导师帮助
      responseTime: '< 30 min',
      
      serviceLevel: [
        { level: 'hint', cost: 100, description: '获取一个提示' },
        { level: 'explanation', cost: 200, description: '详细讲解' },
        { level: 'code-review', cost: 300, description: '代码评审' }
      ]
    }
  },

  // 分享成就
  shareAchievements: {
    enabled: true,
    
    shareTargets: [
      {
        platform: 'internal',
        label: '分享到 KNZN 社区',
        icon: '🔗',
        message: '我刚刚掌握了 GPIO 基础！加入我来探索硬件世界吧！'
      },
      {
        platform: 'twitter',
        label: '分享到 Twitter',
        icon: '🐦',
        template: '我用 @KNZNhw 完成了"GPIO 基础"关卡！🎉 #HardwareLearning'
      },
      {
        platform: 'linkedin',
        label: '分享到 LinkedIn',
        icon: '💼',
        template: '我完成了硬件学习平台 KNZN 上的 GPIO 基础课程，获得了"GPIO 大师"徽章'
      }
    ],
    
    shareableCard: {
      includes: ['badge', 'score', 'learnerName', 'timestamp', 'achievementIcon']
    }
  }
}
```

---

#### FR-006: 学习分析与个性化建议 ✅ AI 驱动版

**描述**: 使用学习数据分析推荐下一步学习路径，识别学习瓶颈

**学习分析配置**:
```javascript
const LEARNING_ANALYTICS = {
  // 用户学习模式识别
  learningProfile: {
    learningStyle: 'kinesthetic-visual',  // 通过实践和可视化学习最好
    
    strengths: [
      { area: '实践操作', confidence: 95 },
      { area: '快速理解', confidence: 85 },
      { area: '代码编写', confidence: 80 }
    ],
    
    weaknesses: [
      { area: '理论概念', confidence: 60 },
      { area: '数学计算', confidence: 55 }
    ],
    
    recommendedNextSteps: [
      {
        priority: 1,
        skill: 'PWM 脉冲宽度调制',
        reason: '你在实践环节表现出色，PWM 会进一步发挥你的优势',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: 50
      },
      {
        priority: 2,
        skill: '按钮输入与中断',
        reason: '这是与 GPIO 输出对应的技能，完整掌握双向通信',
        difficulty: 'INTERMEDIATE'
      }
    ]
  },

  // 学习瓶颈识别
  bottleneckDetection: {
    enabled: true,
    
    detectedIssues: [
      {
        issue: '频繁在相同错误上重复尝试',
        affectedArea: 'phase_2_step_2',
        severity: 'medium',
        recommendation: '建议查看完整解决方案和代码讲解视频'
      }
    ]
  },

  // 个性化学习路径调整
  adaptivePath: {
    enabled: true,
    algorithm: 'reinforcement-learning',
    
    adjustments: [
      {
        trigger: 'struggling_with_concept',
        action: 'suggest_additional_resources',
        resources: [
          'explainer-video-on-gpio-voltage',
          'interactive-breadboard-simulator',
          'peer-discussion-forum'
        ]
      },
      {
        trigger: 'progressing_faster_than_average',
        action: 'offer_challenge_mode',
        challenges: [
          'multi-LED-control',
          'sensor-integration',
          'autonomous-robot-control'
        ]
      }
    ]
  }
}
```

---

#### FR-007: 布局与视窗管理 ✅ 智能分屏版

**描述**: 定义 IDE、硬件模拟器、任务书的空间关系，支持拖拽改大小、Zen Mode、实时同步

**智能分屏系统**:
```javascript
const SMART_SPLIT_PANES = {
  name: 'FR-007: 布局与视窗管理',
  description: '定义 IDE、模拟器、任务书的空间关系及实时同步',

  // 默认布局
  defaultLayout: {
    desktop: {
      name: 'Classic Split',
      layout: `
┌──────────────────────────────────────────┐
│  Sidebar (20%)                           │
├──────────────────────────────────────────┤
│  Task Desc (20%) │ IDE (40%) │ Sim (40%) │
└──────────────────────────────────────────┘
      `,
      components: {
        sidebar: {
          width: '100%',
          height: '80px',
          contents: ['BreadcrumbNav', 'ProgressBar', 'MetricsDisplay']
        },
        
        main: {
          display: 'flex',
          layout: '20-40-40',
          
          taskPanel: {
            width: '20%',
            content: 'TaskDescription',
            scrollable: true,
            resizable: true,
            minWidth: '250px',
            maxWidth: '400px'
          },
          
          codePanel: {
            width: '40%',
            content: 'CodeEditor',
            scrollable: true,
            resizable: true
          },
          
          simulatorPanel: {
            width: '40%',
            content: 'HardwareSimulator',
            scrollable: true,
            resizable: true
          }
        }
      }
    }
  },

  // 用户自定义布局
  customLayouts: [
    {
      name: 'Code-First (专注编码)',
      description: 'IDE 占 70%，模拟器占 30%',
      layout: '70-30',
      icon: '💻'
    },
    {
      name: 'Visual-First (关注电路)',
      description: 'IDE 占 30%，模拟器占 70%',
      layout: '30-70',
      icon: '🔌'
    },
    {
      name: 'Fullscreen IDE (沉浸编码)',
      description: 'IDE 全屏，模拟器折叠为右侧小窗',
      layout: '95-5',
      icon: '🖥️'
    }
  ],

  // 拖拽改大小
  resizable: {
    enabled: true,
    dividers: [
      {
        between: 'taskPanel',
        and: 'codePanel',
        direction: 'vertical',
        cursor: 'col-resize',
        behavior: 'smooth'
      }
    ],
    
    // 记忆用户的偏好设置
    rememberPreference: {
      enabled: true,
      storage: 'localStorage',
      key: 'lesson_layout_preference',
      resetOnNewLesson: false
    }
  },

  // Zen Mode: 最小化干扰
  zenMode: {
    enabled: true,
    trigger: 'hotkey-Z',
    
    effect: {
      hide: [
        'Sidebar',
        'TaskDescription',
        'PerformanceMetrics',
        'AllButtons'
      ],
      
      show: [
        'CodeEditor',
        'HardwareSimulator'
      ],
      
      styling: {
        background: {
          from: 'radial-gradient(#FF00FF, #00FFFF)',  // 原始霓虹风
          to: '#0A0E27'                                // Zen Mode: 深黑
        },
        
        neonGlow: {
          intensity: 0.2,    // 降低霓虹光效 20%
          duration: 'instant'
        }
      },
      
      behavior: {
        showMinimalUI: true,
        hideAfterXSeconds: false,
        exitWith: 'ESC key or mouse move to top'
      }
    }
  }
}
```

---

#### FR-008: 智能调试与错误人性化 ✅ 步进执行版

**描述**: 将晦涩的错误翻译成人类可理解的语言，并支持逐行执行和硬件时序可视化

**智能错误翻译系统**:
```javascript
const SMART_ERROR_TRANSLATION = {
  name: 'FR-008: 智能调试',
  description: '将晦涩的错误翻译成可理解的人话，并提供修复建议',

  // 错误类型识别
  errorPatterns: [
    {
      pattern: 'NameError: name \'(\w+)\' is not defined',
      category: 'undefined-variable',
      
      humanTranslation: (match) => `
🤖 指挥官，我找不到一个叫 "${match[1]}" 的指令或变量。

可能的原因：
1. 拼写错误（例如 'GPI' 应该是 'GPIO'）
2. 变量没有定义（你需要先赋值给它）
3. 缺少 import（例如 'time' 需要 'import time'）

建议检查：
• 第 ${highlightedLine} 行的这个词
• 你是否已经导入了所需的模块
• 变量名是否一致
      `,
      
      suggestions: [
        'Check for typos in variable/function names',
        'Make sure all modules are imported',
        'Verify variable initialization'
      ],
      
      highlightCode: true,
      offendingLine: true
    },

    {
      pattern: 'IndentationError: unexpected indent',
      category: 'indentation-error',
      
      humanTranslation: `
🤖 缩进错误：你的代码行缩进不对。

Python 非常在意缩进！它用缩进来判断代码块的范围。

规则：
• if/for/while 后的代码需要缩进
• 同一个块的代码缩进必须一致
• 通常缩进 4 个空格
      `,
      
      autoFix: {
        enabled: true,
        action: 'highlight-problematic-line',
        offering: 'Would you like me to auto-fix the indentation?'
      }
    }
  ],

  // 步进执行调试
  stepThroughDebugging: {
    name: 'Step Debugger',
    enabled: true,
    
    ui: {
      button: {
        label: '🐢 逐行执行',
        position: 'code-editor-toolbar',
        hotkey: 'F10'
      }
    },
    
    behavior: {
      mode: 'step-execution',
      
      features: [
        {
          feature: 'line-by-line-execution',
          effect: 'execute-one-line-at-a-time',
          control: 'Step Over (F10) / Step Into (F11)'
        },
        {
          feature: 'variable-watch',
          effect: 'show-all-variables-and-their-values',
          panel: 'right-sidebar',
          updates: 'after-each-line'
        },
        {
          feature: 'hardware-state-tracking',
          effect: 'simulator-updates-in-real-time',
          synchronization: 'instant'
        }
      ]
    },

    // 时序可视化
    timingVisualization: {
      enabled: true,
      description: '用时间轴显示代码执行时序和硬件响应',
      
      visualization: {
        type: 'timeline',
        shows: [
          {
            track: 'Code Execution',
            events: [
              { time: 0, action: 'GPIO.setup(17, OUT)', color: '#00FFC2' },
              { time: 0, action: 'GPIO.output(17, HIGH)', color: '#00FFC2' },
              { time: 1000, action: 'time.sleep(1)', color: '#FFD700' },
              { time: 2000, action: 'GPIO.output(17, LOW)', color: '#FF6B35' }
            ]
          },
          {
            track: 'Hardware State',
            events: [
              { time: 0, state: 'GPIO 17 → HIGH', color: '#33FF00' },
              { time: 1000, state: 'LED ON', color: '#33FF00' },
              { time: 2000, state: 'LED OFF', color: '#666666' }
            ]
          }
        ],
        
        alignment: 'synchronized',
        synchronizationLatency: '< 50ms'
      }
    }
  }
}
```

---

#### FR-009: 移动端适配 ✅ 渐进式降级版

**描述**: 针对移动端的特殊适配，包括强制桌面端、伴侣模式、渐进式降级三种方案

**移动端策略**:
```javascript
const MOBILE_STRATEGY = {
  // 方案 A: 强制桌面端（激进但明确）
  restrictedPhasesOnMobile: {
    phase_1_theory: {
      enabled: true,
      reason: '仅限视频和选择题'
    },
    
    phase_2_practical: {
      enabled: false,
      recommendation: '建议在 PC 端进行以获得最佳体验',
      fallbackUI: {
        type: 'device-upgrade-prompt',
        message: '⚠️ Phase 2 (实践) 需要在桌面端完成。代码编辑和电路设计在手机上体验不佳。',
        cta: [
          {
            label: '在 PC 浏览器打开',
            action: 'open-on-desktop'
          },
          {
            label: '继续观看教学视频',
            action: 'stay-on-phase-1'
          }
        ]
      }
    }
  },

  // 方案 B: 伴侣模式（双屏协作）
  companionMode: {
    name: '伴侣模式',
    description: '手机作为第二屏幕，展示任务书和原理图',
    enabled: true,
    
    // 主屏幕 (PC/Tablet)
    primaryScreen: {
      displays: ['IDE', 'HardwareSimulator'],
      layout: '50-50-split',
      focusAreas: ['code-editing', 'circuit-visualization']
    },

    // 伴侣屏幕 (手机)
    companionScreen: {
      displays: ['TaskDescription', 'CircuitDiagram', 'Hints'],
      layout: 'vertical-stack',
      
      features: {
        liveSyncWithPrimary: {
          enabled: true,
          syncEvents: [
            'code-execution-started',
            'circuit-validation-result',
            'hint-requested'
          ],
          protocol: 'WebSocket',
          latency: '< 100ms'
        },
        
        quickActionsBar: {
          buttons: [
            {
              id: 'run-code',
              label: '▶ 运行',
              sendsToPC: true
            },
            {
              id: 'hint',
              label: '💡 提示',
              sendsToPC: true
            }
          ]
        }
      }
    },

    // 配对机制
    pairing: {
      method: 'qr-code',
      flow: `
1. 用户在 PC 开启 Phase 2
2. PC 屏幕右下角出现 "伴侣模式" 按钮
3. 点击后生成 QR 码
4. 用手机扫描 QR 码，自动连接
5. 手机显示任务书和原理图，PC 全屏 IDE
      `,
      pairing_timeout: 300000,  // 5 分钟超时
      security: 'session-based'
    }
  },

  // 方案 C: 渐进式降级（最实用）
  progressiveDegradation: {
    mobile_portrait: {
      layouts: [
        {
          priority: 1,
          component: 'TaskDescription',
          height: '25%',
          scrollable: true
        },
        {
          priority: 2,
          component: 'CodeEditor',
          height: '50%',
          scrollable: true,
          expandable: true
        },
        {
          priority: 3,
          component: 'HardwareSimulator',
          height: '25%',
          scrollable: true,
          collapsible: true
        }
      ],
      
      // 自适应编辑器
      codeEditor: {
        fontSize: '12px',
        height: 'auto',
        minLines: 10,
        maxLines: 20,
        
        mobileOptimizations: {
          fullscreenEditMode: {
            enabled: true,
            gesture: 'swipe-up',
            hidesTaskDescription: true,
            hidesSimulator: true
          },
          
          codeTemplateSnippets: {
            enabled: true,
            snippets: [
              { label: 'GPIO 设置', code: 'GPIO.setup(17, GPIO.OUT)' },
              { label: 'LED 亮', code: 'GPIO.output(17, GPIO.HIGH)' },
              { label: 'LED 灭', code: 'GPIO.output(17, GPIO.LOW)' }
            ],
            tapToInsert: true
          }
        }
      }
    }
  }
}
```

---

#### FR-010: 状态持久化与防挫败机制 ✅ 多层备份版

**描述**: 自动快照系统，防止用户因页面刷新、网络断开等原因丢失进度

**自动快照系统**:
```javascript
const AUTO_SNAPSHOT_SYSTEM = {
  enabled: true,
  
  // 快照触发条件
  triggers: [
    {
      event: 'code-change',
      debounceMs: 1000,
      condition: 'codeLength > 50 characters'
    },
    {
      event: 'circuit-change',
      immediatelyAfter: 'breadboard-connection',
      debounceMs: 500
    },
    {
      event: 'time-based',
      interval: 30000         // 每 30 秒自动保存
    },
    {
      event: 'before-navigation',
      when: 'user-tries-to-leave-with-unsaved-changes'
    }
  ],

  // 存储策略（多层备份）
  storageStrategy: {
    layer1: {
      name: 'IndexedDB (本地浏览器)',
      capacity: '50MB',
      persistence: 'browser-session + local-storage',
      latency: '< 10ms',
      reliability: 'medium'
    },
    
    layer2: {
      name: '后端数据库',
      capacity: 'unlimited',
      persistence: 'permanent',
      latency: '200-500ms',
      reliability: 'high',
      
      validationRules: [
        'code-length > 20 characters',
        'circuit-is-valid',
        'no-syntax-errors'
      ]
    },
    
    syncStrategy: {
      method: 'optimistic-update',
      flow: `
1. 用户修改代码 → 立即保存到 IndexedDB
2. 同时异步上传到后端
3. 后端返回确认 → 标记为 "已备份"
4. 如果上传失败 → 重试（指数退避）
5. 如果 30 秒后仍未成功 → 离线警告 ⚠️
      `
    }
  },

  // 恢复机制
  recovery: {
    onPageReload: {
      detection: 'page-refresh-or-crash',
      flow: `
1. 页面加载时检查 IndexedDB
2. 找到最新快照 → 自动恢复
3. 弹出通知: "你的代码已恢复。上次保存于 2 分钟前。"
4. 显示 [还原] [放弃] 按钮
5. 自动选择还原，30 秒后自动确认
      `,
      ui: {
        type: 'notification-bar',
        position: 'top',
        background: '#FFD700',
        icon: '💾',
        message: '✅ 你的代码已自动恢复',
        buttons: [
          {
            label: '查看还原的代码',
            action: 'scroll-to-editor'
          }
        ]
      }
    },

    onNetworkDisconnect: {
      detection: 'navigator.onLine === false',
      behavior: {
        workOffline: true,
        UI: '⚠️ 网络已断开。你的更改仍在本地保存。',
        syncWhenOnline: true
      }
    }
  },

  // 版本历史
  versionHistory: {
    enabled: true,
    maxSnapshots: 20,
    
    ui: {
      timeline: {
        type: 'horizontal-timeline',
        position: 'bottom-of-editor',
        label: '🕐 历史版本',
        maxDisplay: 5,
        expandable: true
      },
      
      restore: {
        action: 'click-snapshot',
        confirmation: '这会覆盖当前代码，确定吗？',
        buttons: ['还原', '取消']
      }
    }
  },

  // 防挫败机制
  antiFrustration: {
    confirmBeforeLeave: {
      enabled: true,
      triggerConditions: [
        'unsaved-code-changes',
        'incomplete-circuit',
        'unfinished-challenge'
      ],
      
      ui: {
        type: 'modal',
        title: '⚠️ 你有未保存的更改',
        message: '如果离开，你的代码会丢失。确定要离开吗？',
        buttons: [
          { label: '继续编辑', action: 'cancel', style: 'primary' },
          { label: '保存并离开', action: 'save-and-leave' },
          { label: '放弃更改离开', action: 'leave-without-saving', style: 'danger' }
        ]
      }
    },

    backButtonBehavior: {
      enabled: true,
      intercept: 'browser-back-button',
      flow: `
1. 用户点击浏览器的 [<] 返回键
2. 如果有未保存的更改 → 拦截，显示确认对话框
3. 否则正常返回到技能地图
      `
    }
  }
}
```

---

#### FR-011: Loot 系统与 Sector 04 连接 ✅ 商业闭环版

**描述**: 完成关卡时获得虚拟硬件模块，积累到 Sector 04 用于实物制造项目

**掉落物与库存系统**:
```javascript
const SECTOR_04_LOOT_SYSTEM = {
  name: '掉落物与库存系统',
  description: '完成关卡时获得虚拟硬件模块，积累到 Sector 04',

  // 每个关卡的掉落物定义
  lessonLootTable: {
    'lesson_gpio_basics': {
      title: 'GPIO 基础入门',
      lootDrops: [
        {
          id: 'gpio-control-module',
          name: '🔌 GPIO 控制单元',
          description: '能够读写通用输入输出信号',
          rarity: 'common',
          icon: '/assets/loot/gpio-module.png',
          
          // 此模块用于 Sector 04 的什么项目
          usedInSector04: {
            projects: ['赛博越野车', '家庭自动化系统'],
            functionality: 'LED 和马达控制'
          },
          
          // 获得条件
          requirements: {
            phase_1_completion: true,
            phase_2_completion: true,
            phase_3_challenge: 'any',
            phase_4_quiz: 'score >= 60'
          }
        },
        
        {
          id: 'timing-coordinator',
          name: '⏱️ 时序协调器',
          description: '精确控制事件的先后顺序和延迟',
          rarity: 'uncommon',
          icon: '/assets/loot/timing.png',
          
          requirements: {
            phase_3_challenge: 'completed',
            bonus: 'code_contains_sleep_function'
          }
        },
        
        {
          id: 'persistence-badge',
          name: '🏅 坚持勋章',
          description: '表示你不怕犯错的精神',
          rarity: 'uncommon',
          icon: '/assets/loot/persistence.png',
          
          requirements: {
            phase_2_or_3_attempts: '>= 3'
          }
        }
      ],
      
      // 完成动画
      unlockAnimation: {
        trigger: 'phase-4-completion',
        sequence: [
          {
            time: 0,
            action: 'show-completion-modal',
            title: '🎉 恭喜，你掌握了 GPIO 基础！'
          },
          {
            time: 1500,
            action: 'spawn-loot-drops',
            animation: 'items-fly-into-inventory',
            sound: 'loot-drop.mp3'
          },
          {
            time: 3000,
            action: 'show-inventory-preview',
            content: '你的库存已更新。查看 Sector 04 查看这些模块如何用于你的越野车。'
          },
          {
            time: 4000,
            action: 'show-next-recommended-skill',
            skill: 'PWM 脉冲宽度调制',
            reason: '下一个关卡会教你如何用 GPIO 控制 LED 的亮度，这是越野车大灯的关键。'
          }
        ]
      }
    }
  },

  // 库存系统
  inventory: {
    location: '/inventory',
    ui: {
      layout: 'grid-view',
      groupBy: 'rarity',
      filters: ['all', 'common', 'uncommon', 'rare', 'epic'],
      
      itemCard: {
        displays: [
          'icon',
          'name',
          'rarity-color-border',
          'description',
          'usedIn-badge'
        ],
        
        hover: {
          shows: 'detailed-tooltip',
          tooltip: [
            '详细描述',
            '用途',
            '如何获得',
            '解锁相关的下一个关卡推荐'
          ]
        }
      }
    }
  },

  // 与 Sector 04 的连接
  sector04Integration: {
    unlockCondition: 'all-modules-for-project-collected',
    
    projectList: [
      {
        projectId: 'cyber-buggy-v1',
        name: '赛博越野车 - 基础版',
        requiredModules: [
          'gpio-control-module',
          'motor-driver',
          'power-distribution'
        ],
        
        moduleStatus: {
          'gpio-control-module': 'unlocked',    // 绿色勾
          'motor-driver': 'locked',             // 灰化 + 需要的关卡
          'power-distribution': 'locked'
        },
        
        nextStepHint: '完成 PWM 关卡后，你将获得 [电机驱动模块]。'
      }
    ]
  }
}
```

---

---

## 🎨 第二部分：设计规范 (Design Specification)

### 2.1 页面布局

#### 2.1.1 整体结构

```
┌─────────────────────────────────────────────────────────────────┐
│ 顶部 HUD                                                         │
│ [返回] [当前关卡: GPIO 基础] [进度: 41%] [XP: 500] [时间: 20min] │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┬────────────────────────────────────────────┐
│                      │                                            │
│   左边栏             │   主内容区                                 │
│                      │                                            │
│  • Phase Progress    │  ┌───────────────────────────────────────┐ │
│  • Your Metrics      │  │  Current Phase: 理论基础               │ │
│  • Key Moments       │  │                                        │ │
│  • Help Panel        │  │  [视频播放器 / IDE / 题目区域]         │ │
│                      │  │                                        │ │
│                      │  └───────────────────────────────────────┘ │
│                      │                                            │
│                      │  ┌───────────────────────────────────────┐ │
│                      │  │  性能指标                               │ │
│                      │  │  准确度: ████████░░ 80%                │ │
│                      │  │  速度:   ██████████ 100%               │ │
│                      │  └───────────────────────────────────────┘ │
│                      │                                            │
└──────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 底部 Action Bar                                                  │
│ [← 上一个] [继续 →] [提示] [寻求帮助] [分享成就]               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 色彩与视觉

#### 赛博朋克配色

```css
/* 核心色彩 */
:root {
  --color-phase-theory: #FF6B35;      /* 橙红 - 理论 */
  --color-phase-practical: #00FFC2;   /* 荧光青 - 实践 */
  --color-phase-challenge: #FFD700;   /* 金色 - 挑战 */
  --color-phase-quiz: #9D4EDD;        /* 紫色 - 测验 */
  
  --color-success: #33FF00;            /* 终端绿 - 成功 */
  --color-error: #FF0055;              /* 霓虹红 - 错误 */
  --color-warning: #FFB81C;            /* 警告黄 */
  
  --color-bg-primary: #0A0E27;         /* 深邃紫黑 */
  --color-bg-secondary: #1A1F3A;       /* 次级深蓝 */
  
  --color-text-primary: #E0E0E0;       /* 浅灰文字 */
  --color-text-secondary: #999999;     /* 深灰文字 */
}
```

---

### 2.3 动画与反馈

#### 关键动画

```css
/* 成功反馈 */
@keyframes success-burst {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

/* 错误抖动 */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 进度更新 */
@keyframes progress-fill {
  from {
    width: var(--prev-progress);
  }
  to {
    width: var(--new-progress);
  }
}
```

---

## 🛠️ 第三部分：技术实现指南

### 3.1 技术栈

- **前端框架**: Vue 3 + Nuxt 4 + TypeScript
- **代码编辑器**: Monaco Editor 或 CodeMirror
- **硬件模拟**: Wokwi SDK 或 TinkerCAD Circuits API
- **实时执行**: Docker + WebSocket
- **动画库**: GSAP + CSS3
- **分析库**: Mixpanel 或 Amplitude

### 🚨 技术冲突预警与解决方案

#### 冲突 #1: 离线模式 vs Docker 执行

**问题描述**: FR-010 定义了离线工作模式，但 FR-003 使用云端 Docker 执行代码。网络断开时用户无法运行仿真。

**解决方案**:
```javascript
const OFFLINE_EXECUTION_STRATEGY = {
  // 方案 A: MVP 版本（推荐）
  mvpApproach: {
    behavior: 'graceful-degradation',
    offlineCapabilities: [
      'code-editing',           // ✅ 支持
      'syntax-highlighting',    // ✅ 支持  
      'auto-completion',        // ✅ 支持
      'code-execution',         // ❌ 需要联网
      'hardware-simulation'     // ❌ 需要联网
    ],
    
    ui: {
      networkStatus: {
        online: '🟢 在线 - 全功能可用',
        offline: '🔴 离线 - 仅支持代码编辑，运行需联网'
      },
      
      runButtonBehavior: {
        online: 'enabled',
        offline: {
          disabled: true,
          tooltip: '需要网络连接才能运行代码和仿真'
        }
      }
    }
  },

  // 方案 B: 进阶版本（v1.5+）
  advancedApproach: {
    technology: 'Pyodide (WebAssembly Python)',
    tradeoffs: {
      pros: ['真正的离线执行', '无需服务器'],
      cons: ['增加 ~15MB 包体积', '性能略低于服务端', '部分库不支持']
    },
    
    implementation: {
      fallbackChain: [
        '1. 尝试云端 Docker 执行',
        '2. 如果离线，降级到 Pyodide',
        '3. 如果 Pyodide 不支持某库，显示警告'
      ]
    }
  }
}
```

**MVP 建议**: 采用方案 A，在运行按钮旁显示网络状态指示器。

---

#### 冲突 #2: 伴侣模式开发成本

**问题描述**: FR-009 的伴侣模式需要实时状态同步，开发成本极高（相当于 Google Docs 级别的协作）。

**成本分析**:
```javascript
const COMPANION_MODE_COST_ANALYSIS = {
  complexity: 'Google Docs 级别的实时协作',
  
  technicalChallenges: [
    {
      challenge: '实时状态同步',
      effort: '3-4 周',
      description: 'PC 端代码变化需要实时同步到手机端'
    },
    {
      challenge: '冲突解决',
      effort: '2-3 周', 
      description: '如果用户同时在 PC 和手机上操作'
    },
    {
      challenge: '网络容错',
      effort: '1-2 周',
      description: '处理网络延迟、断线重连'
    },
    {
      challenge: '跨设备调试',
      effort: '1-2 周',
      description: '不同设备、浏览器的兼容性'
    }
  ],
  
  totalEstimate: '7-11 周 (1.5-2.5 个月)',
  
  // 分阶段实施建议
  phaseApproach: {
    'v1.0 (MVP)': {
      priority: 'P0',
      features: ['方案 C: 渐进式降级'],
      effort: '1-2 周'
    },
    
    'v1.2': {
      priority: 'P1', 
      features: ['方案 A: 强制桌面端提示'],
      effort: '3-5 天'
    },
    
    'v1.5': {
      priority: 'P2',
      features: ['方案 B: 伴侣模式 (简化版)'],
      effort: '4-6 周',
      scope: '仅支持单向同步 (PC → 手机)'
    },
    
    'v2.0': {
      priority: 'P3',
      features: ['伴侣模式 (完整版)'],
      effort: '7-11 周',
      scope: '双向同步 + 冲突解决'
    }
  }
}
```

**MVP 建议**: v1.0 仅实现渐进式降级，将伴侣模式推迟到 v1.5+。

---

### 🎯 技术选型建议 (开发团队参考)

#### 1. 布局管理 (FR-007) - 分屏拖拽

**推荐库**: 
- `splitpanes` (Vue 3 专用) 或 `@vueuse/core` 中的 `useDraggable`

**理由**: 
- 不要手写拖拽逻辑，这些库已经完美处理了触摸事件支持、最小宽度限制和响应式重排
- splitpanes 专门为分屏场景优化，支持嵌套分屏和记忆布局

```javascript
// 推荐实现方式
import { Splitpanes, Pane } from 'splitpanes'

// 而不是手写复杂的 mouse/touch 事件处理
```

---

#### 2. 状态持久化 (FR-010) - IndexedDB 操作

**推荐库**: 
- `Dexie.js` 或 `idb-keyval`

**理由**: 
- 原生 IndexedDB API 非常繁琐，Dexie.js 提供了更友好的查询语法和事务管理
- 能显著降低 `snapshotManager.ts` 的代码复杂度

```javascript
// 推荐实现方式
import Dexie from 'dexie'

class SnapshotDB extends Dexie {
  snapshots: Dexie.Table<Snapshot, string>
  
  constructor() {
    super('LessonSnapshots')
    this.version(1).stores({
      snapshots: 'id, timestamp, lessonId, code, circuitState'
    })
  }
}

// 而不是直接使用原生 IndexedDB 的复杂事务语法
```

---

#### 3. 错误翻译 (FR-008) - 正则维护

**推荐架构**: 
- 将 `error-patterns.json` 放在服务端或 CMS 中维护，而不是硬编码在前端

**理由**: 
- Python 的报错信息可能会随版本更新，或者你们会发现新的常见错误
- 动态更新正则可以让你们在不发版的情况下优化错误提示

```javascript
// 推荐实现方式
const errorPatterns = await fetch('/api/error-patterns').then(r => r.json())

// 而不是
import errorPatterns from '@/assets/data/error-patterns.json'
```

---

#### 4. 掉落物动画 (FR-011) - "爽感"设计

**推荐动画序列**: 
参考"开箱 (Loot Box)"的心理学设计

```javascript
const LOOT_DROP_ANIMATION = {
  phase1_anticipation: {
    duration: 1000,
    effect: '解密/合成动画',
    purpose: '建立期待感'
  },
  
  phase2_reveal: {
    duration: 800,
    effect: '物品图标"爆出"弹性动画',
    easing: 'back.out',  // 关键：弹性缓动
    purpose: '满足感爆发'
  },
  
  phase3_collect: {
    duration: 600,
    effect: '图标飞向右上角背包',
    easing: 'power2.out',
    purpose: '收集确认感'
  }
}
```

**GSAP 实现示例**:
```javascript
// 掉落前：期待感
gsap.to('.loot-container', { 
  scale: 1.1, 
  rotation: 5, 
  duration: 0.5, 
  yoyo: true, 
  repeat: 1 
})

// 掉落时：爆出感
gsap.fromTo('.loot-item', 
  { scale: 0, rotation: -180 },
  { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' }
)

// 拾取后：飞向背包
gsap.to('.loot-item', {
  x: 'calc(100vw - 80px)',
  y: '-60px',
  scale: 0.3,
  duration: 0.6,
  ease: 'power2.out'
})
```

### 3.2 核心文件结构

```
src/
├── pages/
│   └── lesson/
│       └── [lessonId].vue        # 关卡页面主容器
├── components/
│   ├── LessonScene.vue           # 关卡场景主组件
│   ├── PhaseTheory.vue           # 理论阶段组件
│   ├── PhasePractical.vue        # 实践阶段组件
│   ├── PhaseChallenge.vue        # 挑战阶段组件
│   ├── PhaseQuiz.vue             # 测验阶段组件
│   ├── CodeEditor.vue            # IDE 代码编辑器
│   ├── HardwareSimulator.vue      # 虚拟硬件模拟器
│   ├── ProgressBar.vue           # 进度条
│   ├── PerformanceMetrics.vue    # 性能指标显示
│   ├── AchievementNotification.vue # 成就通知
│   ├── LeftSidebar.vue           # 左侧栏
│   ├── SmartSplitPanes.vue       # 智能分屏系统 (FR-007)
│   ├── ErrorTranslator.vue       # 错误翻译器 (FR-008)
│   ├── StepDebugger.vue          # 步进调试器 (FR-008)
│   ├── MobileAdapter.vue         # 移动端适配器 (FR-009)
│   ├── CompanionMode.vue         # 伴侣模式 (FR-009)
│   ├── AutoSnapshot.vue          # 自动快照 (FR-010)
│   ├── LootSystem.vue            # 掉落物系统 (FR-011)
│   └── InventoryPanel.vue        # 库存面板 (FR-011)
├── composables/
│   ├── useLesson.ts              # 关卡逻辑
│   ├── useCodeExecution.ts       # 代码执行逻辑
│   ├── useProgressTracking.ts    # 进度追踪
│   ├── useAchievementSystem.ts   # 成就系统
│   ├── useLearningAnalytics.ts   # 学习分析
│   ├── useLayoutManager.ts       # 布局管理 (FR-007)
│   ├── useErrorTranslation.ts    # 错误翻译 (FR-008)
│   ├── useStepDebugger.ts        # 步进调试 (FR-008)
│   ├── useMobileDetection.ts     # 移动端检测 (FR-009)
│   ├── useAutoSnapshot.ts        # 自动快照 (FR-010)
│   └── useLootSystem.ts          # 掉落物系统 (FR-011)
├── assets/
│   ├── videos/
│   │   └── gpio-basics.mp4
│   ├── audio/
│   │   ├── success_chime.mp3
│   │   ├── error_buzz.mp3
│   │   └── loot-drop.mp3         # 掉落物音效 (FR-011)
│   ├── loot/                     # 掉落物图标 (FR-011)
│   │   ├── gpio-module.png
│   │   ├── timing.png
│   │   └── persistence.png
│   └── data/
│       ├── lessons.json          # 关卡数据
│       ├── error-patterns.json   # 错误模式 (FR-008)
│       └── loot-tables.json      # 掉落物表 (FR-011)
└── utils/
    ├── codeValidator.ts          # 代码验证
    ├── testRunner.ts             # 测试运行器
    ├── analyticsTracker.ts       # 分析追踪
    ├── errorPatternMatcher.ts    # 错误模式匹配 (FR-008)
    ├── deviceCapabilityDetector.ts # 设备能力检测 (FR-009)
    ├── snapshotManager.ts        # 快照管理 (FR-010)
    └── lootCalculator.ts         # 掉落物计算 (FR-011)
```

---

## ✅ 质检清单

### 功能验证
- [ ] 四个阶段顺序加载，状态正确切换
- [ ] 代码编辑器能执行代码并返回结果
- [ ] 虚拟硬件模拟器正确反映代码执行效果
- [ ] 进度条实时更新
- [ ] 成就系统正确识别多维度成就
- [ ] 社交功能正常（分享、寻求帮助）

### 新增功能验证 (v1.1)
- [ ] **布局管理 (FR-007)**: 分屏拖拽、Zen Mode、布局记忆
- [ ] **智能调试 (FR-008)**: 错误翻译、步进执行、时序可视化
- [ ] **移动端适配 (FR-009)**: 三种方案正常工作，伴侣模式配对成功
- [ ] **状态持久化 (FR-010)**: 自动快照、版本历史、离线工作
- [ ] **Loot 系统 (FR-011)**: 掉落物动画、库存管理、Sector 04 连接

### 性能验证
- [ ] 页面加载 < 3.0s
- [ ] 代码执行反馈 < 500ms
- [ ] IDE 自动完成 < 200ms
- [ ] 动画帧率 60fps
- [ ] **自动快照延迟 < 10ms (IndexedDB)**
- [ ] **错误翻译响应 < 200ms**
- [ ] **伴侣模式同步延迟 < 100ms**

### 用户体验验证
- [ ] 错误消息清晰有用
- [ ] 进度反馈即时且满足感十足
- [ ] 关卡难度循序渐进
- [ ] 没有信息过载感
- [ ] **移动端体验不受损**
- [ ] **代码丢失风险为零**
- [ ] **错误提示人性化**

### 技术风险验证 (v1.1 新增)
- [ ] **离线模式边界清晰**: 用户明确知道哪些功能离线可用
- [ ] **网络状态指示器**: 实时显示在线/离线状态
- [ ] **伴侣模式范围控制**: v1.0 仅实现渐进式降级
- [ ] **Docker 执行容错**: 网络异常时有明确错误提示
- [ ] **成本控制**: 复杂功能按优先级分阶段实施

### 技术选型验证 (开发团队)
- [ ] **分屏拖拽**: 使用 splitpanes 或 @vueuse/core，避免手写拖拽逻辑
- [ ] **IndexedDB 操作**: 使用 Dexie.js 或 idb-keyval，避免原生 API 复杂性
- [ ] **错误正则维护**: 服务端动态配置，支持不发版更新
- [ ] **掉落物动画**: 三阶段设计（期待→爆出→收集），使用 GSAP back.out 缓动

### 跨设备验证
- [ ] **桌面端**: 全功能正常
- [ ] **平板端**: 布局自适应
- [ ] **手机竖屏**: 渐进式降级或强制桌面端提示
- [ ] **手机横屏**: 侧边栏折叠正常
- [ ] **伴侣模式**: ⚠️ v1.0 暂不实施，优先级 P2

---

**文档版本**: v1.1 (增强版)  
**编制时间**: 2024-12-20  
**审核状态**: ✅ 生产级规范 (含技术风险评估)  
**交付对象**: 高级前端工程师

## 📋 v1.1 更新摘要

本版本修复了 v1.0 中的 5 个关键遗漏，新增了 5 个功能需求 (FR-007 到 FR-011)：

1. **FR-007 布局管理**: 智能分屏、Zen Mode、用户偏好记忆
2. **FR-008 智能调试**: 错误人性化翻译、步进执行、时序可视化  
3. **FR-009 移动端适配**: 三种方案（强制桌面/伴侣模式/渐进降级）
4. **FR-010 状态持久化**: 自动快照、多层备份、防挫败机制
5. **FR-011 Loot 系统**: 掉落物、库存、与 Sector 04 连接

## ⚠️ 技术风险与成本控制

### 关键技术冲突
1. **离线模式 vs Docker 执行**: MVP 版本采用优雅降级，离线时禁用代码运行
2. **伴侣模式开发成本**: 相当于 Google Docs 级别协作，推迟到 v1.5+ 实施

### 技术选型建议
1. **分屏拖拽**: 使用 splitpanes，避免手写复杂逻辑
2. **IndexedDB**: 使用 Dexie.js，简化数据库操作
3. **错误正则**: 服务端维护，支持动态更新
4. **掉落物动画**: 三阶段心理学设计，GSAP back.out 缓动

### 分阶段实施建议
- **v1.0 (MVP)**: FR-007, FR-008, FR-010, FR-011 + FR-009 渐进式降级
- **v1.2**: FR-009 强制桌面端提示
- **v1.5**: FR-009 伴侣模式简化版 (单向同步)
- **v2.0**: 伴侣模式完整版 (双向同步)

**优先级建议**: P0 (错误人性化、状态持久化、布局管理) → P1 (移动端适配) → P2 (Loot 系统)

可与《技能地图设计文档 v1.1》配合使用，完整覆盖用户从浏览→学习→成就的完整闭环。

