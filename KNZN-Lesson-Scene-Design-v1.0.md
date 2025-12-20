# 🎮 KNZN 关卡场景页面 (Lesson Scene) 完整设计文档 v1.0

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 关卡场景 (Lesson Scene / Challenge Arena)  
**路由**: `/lesson/:lessonId` 或 `/challenge/:challengeId`  
**用户状态**: 已登录用户（从技能地图 `/map` 进入）  
**文档版本**: v1.0（完整设计规范版）  
**最后更新**: 2024-12-20  
**审核状态**: ✅ 可交付高级工程师进行开发  
**文档类型**: 生产级设计规范（零歧义）

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
│   └── LeftSidebar.vue           # 左侧栏
├── composables/
│   ├── useLesson.ts              # 关卡逻辑
│   ├── useCodeExecution.ts       # 代码执行逻辑
│   ├── useProgressTracking.ts    # 进度追踪
│   ├── useAchievementSystem.ts   # 成就系统
│   └── useLearningAnalytics.ts   # 学习分析
├── assets/
│   ├── videos/
│   │   └── gpio-basics.mp4
│   ├── audio/
│   │   ├── success_chime.mp3
│   │   └── error_buzz.mp3
│   └── data/
│       └── lessons.json          # 关卡数据
└── utils/
    ├── codeValidator.ts          # 代码验证
    ├── testRunner.ts             # 测试运行器
    └── analyticsTracker.ts       # 分析追踪
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

### 性能验证
- [ ] 页面加载 < 3.0s
- [ ] 代码执行反馈 < 500ms
- [ ] IDE 自动完成 < 200ms
- [ ] 动画帧率 60fps

### 用户体验验证
- [ ] 错误消息清晰有用
- [ ] 进度反馈即时且满足感十足
- [ ] 关卡难度循序渐进
- [ ] 没有信息过载感

---

**文档版本**: v1.0  
**编制时间**: 2024-12-20  
**审核状态**: ✅ 生产级规范  
**交付对象**: 高级前端工程师

可与《技能地图设计文档 v1.1》配合使用，完整覆盖用户从浏览→学习→成就的完整闭环。

