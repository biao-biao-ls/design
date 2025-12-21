# 🎮 KNZN 关卡场景页面设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 关卡场景 (Lesson Scene / Challenge Arena)  
**路由**: `/lesson/:lessonId` 或 `/challenge/:challengeId`  
**用户状态**: 已登录用户（从技能地图 `/map` 进入）  
**文档版本**: v2.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 生产就绪版本  
**文档类型**: 完整设计规范

## 🎯 核心设计理念

关卡场景页是用户从**被动浏览**转变为**主动挑战**的舞台。用户在技能地图上点击某个节点后，进入这个沉浸式的学习-挑战空间，完成一系列任务来掌握该技能。

### 设计哲学
- **模块化学习路径**: 每个关卡分为 3-4 个小环节，避免一次性信息过载
- **即时反馈机制**: 每个操作都有立即的成功/失败反馈
- **新手友好**: 强制引导确保用户不会在第一步就流失
- **移动端明确定位**: 作为管理/查看工具，不强行适配复杂交互

## 🎯 核心功能需求

### FR-001: 关卡内容结构与新手引导

**描述**: 定义关卡的内容组织方式，确保每个关卡既有学习深度又不过度复杂，特别强化新手引导避免用户流失。

**关卡结构**:
```javascript
const LESSON_STRUCTURE = {
  // 关卡元数据
  metadata: {
    id: 'lesson_001',
    title: 'GPIO 基础入门',
    description: '学习如何使用树莓派控制 LED 灯亮灭',
    difficulty: 'BEGINNER',
    estimatedDuration: 30,
    prerequisiteSkills: ['电路基础'],
    learningObjectives: [
      '理解 GPIO 端口的作用',
      '掌握如何配置 GPIO 为输入或输出',
      '能独立点亮和熄灭一个 LED'
    ],
    rewards: {
      xp: 300,
      badge: 'gpio-master'
    }
  },

  // 新手引导系统
  onboardingOverlay: {
    enabled: true,
    triggerCondition: 'first_time_user_or_wokwi_unfamiliar',
    
    steps: [
      {
        step: 1,
        target: '.wokwi-iframe',
        title: '这是你的虚拟实验台',
        content: '左边是代码编辑器，右边是电路仿真。就像真实的硬件实验室！',
        position: 'center',
        backdrop: true,
        nextButton: '我明白了'
      },
      {
        step: 2,
        target: '.code-editor',
        title: '在这里写代码',
        content: '点击这里可以编辑 Python 代码。不用担心，我们已经准备好了模板。',
        position: 'right',
        highlight: true,
        nextButton: '继续'
      },
      {
        step: 3,
        target: '.run-button',
        title: '点击运行看效果',
        content: '写好代码后，点击这个绿色按钮运行。你会看到右边的 LED 灯亮起来！',
        position: 'bottom',
        highlight: true,
        nextButton: '试试看'
      },
      {
        step: 4,
        target: '.circuit-area',
        title: '观察电路变化',
        content: '代码运行时，这里的电路会实时响应。LED 会亮、电机会转，就像真的一样！',
        position: 'left',
        nextButton: '开始学习'
      }
    ],
    
    completion: {
      showConfirmation: true,
      message: '太棒了！现在你知道如何使用这个虚拟实验台了。准备好开始第一个项目了吗？',
      ctaText: '开始第一个项目'
    }
  },

  // 关卡包含的 4 个学习环节（增加反思阶段）
  phases: [
    {
      id: 'phase_1',
      type: 'THEORY',
      title: '第一阶段: 理论基础 (10 min)',
      description: '了解 GPIO 的基本概念',
      
      content: {
        format: 'video',
        sourceUrl: '/videos/gpio-basics.mp4',
        duration: 600,
        
        interactiveElements: [
          {
            type: 'quiz',
            time: 400,
            question: 'GPIO 中的"O"代表什么?',
            options: ['Output (输出)', 'Operation (操作)', 'Operator (操作符)'],
            correctAnswer: 0,
            explanation: 'GPIO 完整名称是 General Purpose Input/Output'
          }
        ]
      },
      
      completionCriteria: {
        watchPercentage: 80,
        passQuizzes: true
      }
    },

    {
      id: 'phase_2',
      type: 'PRACTICAL',
      title: '第二阶段: 实践环节 (15 min)',
      description: '在 Wokwi 虚拟环境中操作树莓派',
      
      content: {
        format: 'wokwi-simulator',
        
        wokwi: {
          projectId: 'gpio-led-basic',
          diagram: {
            version: 1,
            author: 'KNZN',
            editor: 'wokwi',
            parts: [
              { type: 'wokwi-pi-pico', id: 'pico', top: 0, left: 0 },
              { type: 'wokwi-led', id: 'led1', top: 100, left: 200, attrs: { color: 'red' } },
              { type: 'wokwi-resistor', id: 'r1', top: 150, left: 200, attrs: { value: '220' } }
            ],
            connections: [
              ['pico:GP17', 'led1:A', 'green'],
              ['led1:C', 'r1:1', 'green'],
              ['r1:2', 'pico:GND.1', 'black']
            ]
          },
          
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
          expectedOutputs: [
            'LED ON',
            'LED OFF'
          ],
          gpioChecks: [
            { pin: 17, expectedState: 'HIGH', atTime: 0 },
            { pin: 17, expectedState: 'LOW', atTime: 1000 }
          ]
        }
      }
    },

    {
      id: 'phase_3',
      type: 'DEBUG_MODE',
      title: '第三阶段: 故障排查模式 (10 min)',
      description: '修复一段有 Bug 的代码或连错的电路',
      
      content: {
        format: 'debug-challenge',
        
        challenge: {
          title: '修复这个不工作的 LED 电路',
          briefing: '电路图看起来正确，但 LED 不亮。找出问题并修复它。',
          
          buggyCode: `
import machine
import time

# 设置 GPIO 17 为输入（这里是错误的）
led = machine.Pin(17, machine.Pin.IN)

# 尝试点亮 LED
led.on()  # 这行会报错
time.sleep(1)
          `,
          
          buggyCircuit: {
            // Wokwi 支持断路/短路模拟
            faults: [
              { type: 'disconnected_wire', connection: 'led1:C-r1:1' },
              { type: 'wrong_pin_mode', pin: 17, currentMode: 'INPUT', correctMode: 'OUTPUT' }
            ]
          },
          
          hints: [
            '检查 GPIO 引脚的配置模式',
            '确认所有连线都正确连接',
            '查看串口输出的错误信息'
          ],
          
          validation: {
            type: 'fix-verification',
            checkCriteria: [
              'gpio_pin_mode_correct',
              'circuit_connections_valid',
              'led_blinks_successfully'
            ]
          }
        }
      }
    },

    {
      id: 'phase_4',
      type: 'REFLECTION',
      title: '第四阶段: 费曼笔记 (5 min)',
      description: '用自己的话总结本关学到的知识点',
      
      content: {
        format: 'feynman-log',
        
        reflection: {
          title: '请用自己的话解释今天学到的内容',
          prompts: [
            'GPIO 是什么？它的作用是什么？',
            '为什么需要电阻？不加电阻会怎样？',
            '你在调试过程中学到了什么？',
            '如果要向朋友解释这个项目，你会怎么说？'
          ],
          
          minWords: 100,
          maxWords: 300,
          
          aiAssistance: {
            enabled: true,
            helpType: 'writing_suggestions',
            prompt: '帮助用户组织语言，但不直接给出答案'
          }
        },
        
        completionCriteria: {
          wordCount: 100,
          coverKeyPoints: ['gpio_concept', 'resistor_purpose', 'debugging_process'],
          passAIReview: true
        }
      }
    }
  ]
}
```

### FR-002: 关卡进度跟踪

**描述**: 实时显示用户在当前关卡中的进度，提供即时的成功/失败反馈

**进度追踪系统**:
```javascript
const PROGRESS_TRACKING = {
  progressBar: {
    segments: [
      { id: 'phase_1', label: '理论', progress: 100, status: 'completed' },
      { id: 'phase_2', label: '实践', progress: 65, status: 'in-progress' },
      { id: 'phase_3', label: '挑战', progress: 0, status: 'locked' }
    ],
    totalProgress: 55,
    estimatedTimeRemaining: 15
  },

  performanceMetrics: {
    accuracy: {
      label: '准确度',
      value: 90,
      unit: '%',
      color: '#00FFC2'
    },
    
    timeElapsed: {
      label: '已花时间',
      value: 15,
      unit: 'min',
      estimatedTotal: 30
    }
  },

  feedback: {
    onSuccess: {
      message: '✨ 完美！继续下一步',
      animation: 'success-glow',
      sound: 'success.mp3',
      xpEarned: 50
    },
    
    onFailure: {
      message: '⚠️ 再试一次，你可以的！',
      hint: '💡 检查代码中的 GPIO 引脚号',
      color: '#FF6B35'
    }
  }
}
```

### FR-003: Wokwi 仿真器集成与通信监控

**描述**: 使用 Wokwi iframe 集成，包含完善的心跳检测和错误处理机制

**Wokwi 集成配置**:
```javascript
const WOKWI_INTEGRATION = {
  iframe: {
    src: 'https://wokwi.com/projects/new/pi-pico',
    width: '100%',
    height: '600px',
    sandbox: 'allow-scripts allow-same-origin allow-forms'
  },

  // X-Ray 透视视图（原理可视化）
  xrayVisualizer: {
    enabled: true,
    position: 'side-panel',
    width: '300px',
    
    visualizations: [
      {
        trigger: 'gpio_pin_high',
        animation: 'mos_transistor_on',
        description: 'GPIO 拉高时，MOS 管导通，电流流向 LED',
        svgPath: '/animations/mos-transistor-on.svg'
      },
      {
        trigger: 'gpio_pin_low', 
        animation: 'mos_transistor_off',
        description: 'GPIO 拉低时，MOS 管截止，电流被阻断',
        svgPath: '/animations/mos-transistor-off.svg'
      },
      {
        trigger: 'current_flow',
        animation: 'electron_flow',
        description: '电子从负极流向正极，形成电流',
        svgPath: '/animations/current-flow.svg'
      }
    ],
    
    controls: {
      playPause: true,
      speed: { min: 0.5, max: 2.0, default: 1.0 },
      replay: true
    }
  },

  // 心跳检测机制
  heartbeat: {
    enabled: true,
    interval: 5000,
    timeout: 10000,
    maxRetries: 3,
    
    checkConnection: () => {
      const iframe = document.getElementById('wokwi-iframe');
      const startTime = Date.now();
      
      iframe.contentWindow.postMessage({
        type: 'HEARTBEAT_PING',
        timestamp: startTime
      }, 'https://wokwi.com');
      
      setTimeout(() => {
        if (!this.lastHeartbeatResponse || 
            (Date.now() - this.lastHeartbeatResponse) > this.timeout) {
          this.handleConnectionFailure();
        }
      }, this.timeout);
    },
    
    handleConnectionFailure: () => {
      console.warn('Wokwi iframe connection lost');
      showUserNotification('仿真器连接中断，正在重新连接...', 'warning');
      this.retryConnection();
    }
  },

  communication: {
    sendCode: (code) => {
      const iframe = document.getElementById('wokwi-iframe');
      
      if (!iframe || !iframe.contentWindow) {
        console.error('Wokwi iframe not ready');
        showUserNotification('仿真器未就绪，请稍后再试', 'error');
        return false;
      }
      
      try {
        iframe.contentWindow.postMessage({
          type: 'UPDATE_CODE',
          code: code,
          timestamp: Date.now()
        }, 'https://wokwi.com');
        
        return true;
      } catch (error) {
        console.error('Failed to send code to Wokwi:', error);
        showUserNotification('代码发送失败，请检查网络连接', 'error');
        return false;
      }
    },

    receiveStatus: (event) => {
      if (event.origin !== 'https://wokwi.com') return;
      
      if (event.data.type === 'HEARTBEAT_PONG') {
        this.lastHeartbeatResponse = Date.now();
        return;
      }
      
      if (event.data.type === 'SIMULATION_STATE') {
        const gpio17State = event.data.gpio[17];
        validateLessonProgress(gpio17State);
      }
      
      if (event.data.type === 'SERIAL_OUTPUT') {
        if (event.data.output.includes('LEVEL_COMPLETED')) {
          markPhaseCompleted();
        }
      }
      
      if (event.data.type === 'ERROR') {
        console.error('Wokwi error:', event.data.message);
        showUserNotification('仿真器遇到错误：' + event.data.message, 'error');
      }
    },
    
    retryConnection: () => {
      const iframe = document.getElementById('wokwi-iframe');
      const currentSrc = iframe.src;
      
      iframe.src = '';
      setTimeout(() => {
        iframe.src = currentSrc;
        
        setTimeout(() => {
          this.heartbeat.checkConnection();
        }, 3000);
      }, 1000);
    }
  },

  validation: {
    method: 'custom-chip-integration',
    
    customChip: {
      // 使用 Wokwi Custom Chip API 创建虚拟逻辑分析仪
      chipName: 'knzn-logic-analyzer',
      implementation: `
        // 自定义芯片：虚拟逻辑分析仪
        class KNZNLogicAnalyzer {
          constructor() {
            this.samples = [];
            this.isRecording = false;
          }
          
          onPinChange(pin, value, timestamp) {
            if (this.isRecording) {
              this.samples.push({ pin, value, timestamp });
              
              // 实时判题：检查时序是否正确
              if (this.samples.length >= 10) {
                const pattern = this.analyzePattern();
                if (pattern.isValid) {
                  this.sendMessage('LEVEL_COMPLETED', pattern);
                }
              }
            }
          }
          
          analyzePattern() {
            // 分析 GPIO 17 的时序模式
            const gpio17Samples = this.samples.filter(s => s.pin === 17);
            
            // 检查是否符合预期的 LED 闪烁模式
            const expectedPattern = [1, 0, 1, 0]; // 高-低-高-低
            const actualPattern = gpio17Samples.map(s => s.value);
            
            return {
              isValid: this.arraysEqual(expectedPattern, actualPattern),
              timing: this.calculateTiming(gpio17Samples),
              accuracy: this.calculateAccuracy(gpio17Samples)
            };
          }
        }
      `,
      
      connections: [
        { chipPin: 'GPIO17_MONITOR', targetPin: 'pico:GP17' },
        { chipPin: 'VCC', targetPin: 'pico:3V3' },
        { chipPin: 'GND', targetPin: 'pico:GND' }
      ]
    },
    
    serialCheck: {
      expectedOutputs: [
        'LED ON',
        'LED OFF',
        'LEVEL_COMPLETED'
      ],
      timeout: 10000
    },
    
    gpioCheck: {
      pin: 17,
      expectedSequence: [
        { time: 0, state: 'HIGH' },
        { time: 1000, state: 'LOW' }
      ]
    }
  },

  templates: {
    'gpio-led-basic': {
      diagram: '/wokwi-templates/gpio-led-basic.json',
      code: '/wokwi-templates/gpio-led-basic.py'
    },
    'sos-morse': {
      diagram: '/wokwi-templates/sos-morse.json', 
      code: '/wokwi-templates/sos-morse-starter.py'
    }
  }
}
```

### FR-004: 成就系统与分享功能

**描述**: 基于完成度和正确性的成就系统，强化分享功能支持一键生成炫酷分享卡片

**成就系统配置**:
```javascript
const ACHIEVEMENT_SYSTEM = {
  dimensions: [
    {
      id: 'completion',
      name: '完成度',
      weight: 60,
      thresholds: {
        perfect: { score: 100, badge: 'gpio-master', xp: 300 },
        good: { score: 80, xp: 200 },
        passing: { score: 60, xp: 100 }
      }
    },
    
    {
      id: 'speed',
      name: '速度',
      weight: 40,
      bonuses: [
        {
          condition: 'completed_under_20_minutes',
          badge: 'speed-learner',
          xp: 100
        }
      ]
    }
  ],

  notifications: {
    onAchievementUnlock: {
      animation: 'badge-popup',
      sound: 'achievement.mp3',
      duration: 2000
    }
  },
  
  // 分享功能增强
  shareFeatures: {
    autoGenerateCard: true,
    
    shareCard: {
      template: 'cyberpunk-achievement',
      elements: [
        {
          type: 'background',
          gradient: 'linear-gradient(135deg, #0A0E27, #1A1F3A)',
          overlay: 'circuit-pattern.png'
        },
        {
          type: 'badge',
          position: 'center-top',
          size: '120px',
          glow: true
        },
        {
          type: 'text',
          content: '我在 KNZN 完成了 {lessonTitle}！',
          font: 'Orbitron',
          color: '#00FFC2',
          position: 'center'
        },
        {
          type: 'stats',
          content: [
            '用时：{duration} 分钟',
            '准确度：{accuracy}%',
            '获得 XP：{xp}'
          ],
          position: 'bottom-left'
        },
        {
          type: 'wokwi-screenshot',
          position: 'center-bottom',
          caption: '我的电路仿真',
          border: '2px solid #00FFC2'
        },
        {
          type: 'watermark',
          content: 'KNZN.net',
          position: 'bottom-right',
          qrCode: true
        }
      ],
      
      export: {
        formats: ['png', 'jpg'],
        resolution: '1200x630',
        quality: 0.9
      }
    },
    
    wokwiRecording: {
      enabled: true,
      autoRecord: true,
      duration: 30,
      format: 'gif',
      maxSize: '5MB',
      
      triggers: [
        'lesson_completed',
        'challenge_solved',
        'user_manual_record'
      ]
    },
    
    socialShare: {
      platforms: [
        {
          name: 'wechat',
          label: '分享到微信',
          action: 'generate-qrcode',
          icon: 'wechat-icon.svg'
        },
        {
          name: 'weibo',
          label: '分享到微博',
          action: 'open-share-dialog',
          icon: 'weibo-icon.svg',
          hashtags: ['#KNZN', '#硬件学习', '#电路设计']
        },
        {
          name: 'douyin',
          label: '分享到抖音',
          action: 'download-video',
          icon: 'douyin-icon.svg',
          format: 'mp4'
        },
        {
          name: 'twitter',
          label: 'Share to Twitter',
          action: 'open-share-dialog',
          icon: 'twitter-icon.svg',
          hashtags: ['#KNZN', '#HardwareLearning']
        }
      ],
      
      templates: {
        default: '我在 KNZN 完成了 {lessonTitle}！用时 {duration} 分钟，准确度 {accuracy}%。一起来学习硬件吧！',
        speed: '⚡ 速度挑战！我用 {duration} 分钟完成了 {lessonTitle}，你能更快吗？',
        perfect: '🏆 完美通关！{lessonTitle} 100% 准确度达成！'
      }
    },
    
    incentives: {
      firstShare: {
        xp: 50,
        badge: 'first-sharer',
        message: '感谢分享！获得 50 XP'
      },
      viralBonus: {
        condition: 'share_brings_3_new_users',
        xp: 200,
        badge: 'influencer',
        message: '你的分享带来了 3 个新用户！'
      }
    }
  }
}
```

### FR-005: AI 助教系统

**描述**: 简单的 OpenAI API 包装，提供智能学习辅助

**AI 助教配置**:
```javascript
const AI_TUTOR = {
  apiIntegration: {
    endpoint: '/api/ai-help',
    model: 'gpt-4o-mini',
    
    promptTemplate: `
你是一个硬件学习助教。用户在学习 GPIO 基础时遇到了问题。

当前关卡: {lessonTitle}
用户代码: {userCode}
错误信息: {errorMessage}
学习目标: {learningObjectives}

请用简单易懂的中文回答，包含：
1. 问题分析
2. 具体的修复建议
3. 相关知识点解释

回答要简洁，不超过 200 字。
    `
  },

  errorTranslation: {
    commonErrors: {
      'NameError': '变量或函数名未定义，检查拼写和导入',
      'IndentationError': '缩进错误，Python 对缩进很敏感',
      'SyntaxError': '语法错误，检查括号、冒号等符号'
    }
  },

  usage: {
    trigger: 'help-button-click',
    ui: {
      button: '🤖 AI 助教',
      position: 'bottom-right',
      modal: true
    }
  }
}
```

### FR-006: 布局系统与移动端策略

**描述**: 使用固定布局，移动端明确定位为管理/查看工具

**固定布局配置**:
```javascript
const LAYOUT_SYSTEM = {
  desktop: {
    layout: 'two-column',
    structure: `
┌─────────────────────────────────────────────────────────┐
│  顶部导航栏 (Progress + Breadcrumb)                      │
├─────────────────────────────────────────────────────────┤
│  任务描述 (30%)        │  Wokwi 仿真器 (70%)            │
│                        │                                │
│  • 当前步骤            │  ┌─────────────────────────────┐ │
│  • 学习目标            │  │                             │ │
│  • 提示信息            │  │    Wokwi iframe             │ │
│  • AI 助教按钮         │  │                             │ │
│                        │  └─────────────────────────────┘ │
│                        │                                │
│  [可折叠]              │  [运行代码] [重置] [提示]       │
└────────────────────────┴────────────────────────────────┘
    `,
    
    components: {
      taskPanel: {
        width: '30%',
        minWidth: '300px',
        collapsible: true,
        position: 'left'
      },
      
      simulatorPanel: {
        width: '70%',
        content: 'wokwi-iframe',
        position: 'right'
      }
    }
  },

  // 移动端策略：明确定位为管理/查看工具
  mobile: {
    layout: 'redirect-to-desktop',
    
    mobileStrategy: {
      showDesktopPrompt: true,
      promptMessage: '为了获得最佳学习体验，建议在电脑上打开此关卡',
      promptSubtext: 'Wokwi 仿真器需要较大屏幕和键盘输入',
      
      actions: [
        {
          label: '发送到我的电脑',
          action: 'send-link-to-email',
          description: '将关卡链接发送到邮箱，稍后在电脑上继续'
        },
        {
          label: '查看关卡介绍',
          action: 'show-lesson-overview',
          description: '了解关卡内容和学习目标'
        },
        {
          label: '仍要继续',
          action: 'force-mobile-view',
          description: '体验可能不佳，但仍可查看内容',
          warning: true
        }
      ]
    },
    
    fallbackLayout: `
┌─────────────────────────────────┐
│  ⚠️ 移动端体验提示               │
├─────────────────────────────────┤
│  📖 关卡介绍（可折叠）           │
├─────────────────────────────────┤
│  📱 "请在电脑上完成实际操作"     │
│  🔗 [发送链接到邮箱]            │
├─────────────────────────────────┤
│  📋 学习目标和知识点             │
│  📊 进度追踪                    │
└─────────────────────────────────┘
    `,
    
    adaptations: {
      wokwiIframe: {
        display: 'none',
        replacement: 'desktop-prompt-card'
      },
      
      taskPanel: {
        width: '100%',
        content: 'lesson-overview-only',
        interactiveElements: 'disabled'
      }
    }
  }
}
```

### FR-007: 状态持久化

**描述**: 简单的本地存储，支持学习进度恢复

**状态持久化配置**:
```javascript
const PERSISTENCE_SYSTEM = {
  storage: {
    method: 'localStorage',
    key: 'knzn-lesson-progress',
    
    data: {
      lessonId: 'lesson_001',
      currentPhase: 'phase_2',
      userCode: 'import machine...',
      completedPhases: ['phase_1'],
      lastSaved: '2024-12-22T10:30:00Z'
    }
  },

  autoSave: {
    triggers: [
      {
        event: 'code-change',
        debounce: 2000
      },
      {
        event: 'phase-completion',
        immediate: true
      },
      {
        event: 'before-navigation',
        immediate: true
      }
    ]
  },

  recovery: {
    onPageLoad: {
      checkForSavedProgress: true,
      showRestorePrompt: true,
      ui: {
        message: '发现未完成的进度，是否继续？',
        buttons: ['继续学习', '重新开始']
      }
    }
  }
}
```

## 🎨 设计规范

### 页面布局

#### 整体结构

```
┌─────────────────────────────────────────────────────────────────┐
│ 顶部导航栏                                                       │
│ [返回] [当前关卡: GPIO 基础] [进度: 2/3] [XP: 300]             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┬────────────────────────────────────────────┐
│                      │                                            │
│   任务描述 (30%)     │   Wokwi 仿真器 (70%)                      │
│                      │                                            │
│  • 当前步骤          │  ┌───────────────────────────────────────┐ │
│  • 学习目标          │  │                                        │ │
│  • 代码模板          │  │    Wokwi iframe                       │ │
│  • 提示信息          │  │    (包含代码编辑器和电路仿真)          │ │
│                      │  │                                        │ │
│  [🤖 AI 助教]       │  └───────────────────────────────────────┘ │
│  [💡 提示]          │                                            │
│  [📖 折叠面板]      │  [▶ 运行代码] [🔄 重置] [💾 保存]        │
│                      │                                            │
└──────────────────────┴────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 底部状态栏                                                       │
│ 准确度: 90% | 用时: 15min | [继续下一阶段 →]                   │
└─────────────────────────────────────────────────────────────────┘
```

### 色彩与视觉

#### 赛博朋克配色

```css
:root {
  --color-primary: #00FFC2;           /* 荧光青 - 主色调 */
  --color-secondary: #FF6B35;         /* 橙红 - 强调色 */
  --color-accent: #FFD700;            /* 金色 - 成功色 */
  
  --color-success: #33FF00;           /* 终端绿 - 成功 */
  --color-error: #FF0055;             /* 霓虹红 - 错误 */
  --color-warning: #FFB81C;           /* 警告黄 */
  
  --color-bg-primary: #0A0E27;        /* 深邃紫黑 */
  --color-bg-secondary: #1A1F3A;      /* 次级深蓝 */
  
  --color-text-primary: #E0E0E0;      /* 浅灰文字 */
  --color-text-secondary: #999999;    /* 深灰文字 */
}
```

### 动画与反馈

#### 关键动画

```css
/* 成功反馈 */
@keyframes success-glow {
  0% { box-shadow: 0 0 5px var(--color-success); }
  50% { box-shadow: 0 0 20px var(--color-success); }
  100% { box-shadow: 0 0 5px var(--color-success); }
}

/* 错误提示 */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 进度更新 */
@keyframes progress-fill {
  from { width: var(--prev-progress); }
  to { width: var(--new-progress); }
}
```

## 🛠️ 技术实现指南

### 技术栈

- **前端框架**: Vue 3 + Nuxt 4 + TypeScript
- **仿真器**: Wokwi iframe 集成
- **状态管理**: Pinia + localStorage
- **AI 助教**: OpenAI API 直接调用
- **动画库**: CSS3 + 简单 JavaScript

### 核心文件结构

```
src/
├── pages/
│   └── lesson/
│       └── [lessonId].vue        # 关卡页面主容器
├── components/
│   ├── LessonScene.vue           # 关卡场景主组件
│   ├── TaskPanel.vue             # 任务描述面板
│   ├── WokwiSimulator.vue        # Wokwi iframe 包装器
│   ├── ProgressBar.vue           # 进度条
│   ├── AITutor.vue               # AI 助教
│   ├── OnboardingOverlay.vue     # 新手引导
│   ├── ShareCard.vue             # 分享卡片生成
│   └── AchievementModal.vue      # 成就弹窗
├── composables/
│   ├── useLesson.ts              # 关卡逻辑
│   ├── useWokwi.ts               # Wokwi 通信
│   ├── useProgress.ts            # 进度追踪
│   ├── useAITutor.ts             # AI 助教
│   ├── useOnboarding.ts          # 新手引导
│   ├── useShare.ts               # 分享功能
│   └── useLocalStorage.ts        # 本地存储
├── assets/
│   ├── videos/
│   │   └── gpio-basics.mp4
│   ├── audio/
│   │   ├── success.mp3
│   │   └── error.mp3
│   └── data/
│       └── lessons.json          # 关卡数据
└── utils/
    ├── wokwiAPI.ts               # Wokwi API 封装
    ├── validation.ts             # 判题逻辑
    ├── shareCardGenerator.ts     # 分享卡片生成
    └── aiHelper.ts               # AI 助教 API
```

### Wokwi 集成实现

```javascript
// composables/useWokwi.ts
export const useWokwi = () => {
  const iframe = ref<HTMLIFrameElement>()
  const isConnected = ref(false)
  const lastHeartbeat = ref(0)
  
  // 心跳检测
  const startHeartbeat = () => {
    setInterval(() => {
      if (iframe.value?.contentWindow) {
        iframe.value.contentWindow.postMessage({
          type: 'HEARTBEAT_PING',
          timestamp: Date.now()
        }, 'https://wokwi.com')
      }
    }, 5000)
  }
  
  // 发送代码到 Wokwi
  const sendCode = (code: string) => {
    if (!iframe.value?.contentWindow) {
      showNotification('仿真器未就绪，请稍后再试', 'error')
      return false
    }
    
    try {
      iframe.value.contentWindow.postMessage({
        type: 'UPDATE_CODE',
        code
      }, 'https://wokwi.com')
      return true
    } catch (error) {
      showNotification('代码发送失败', 'error')
      return false
    }
  }
  
  // 监听 Wokwi 状态
  const listenToWokwi = () => {
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://wokwi.com') return
      
      switch (event.data.type) {
        case 'HEARTBEAT_PONG':
          lastHeartbeat.value = Date.now()
          isConnected.value = true
          break
          
        case 'SERIAL_OUTPUT':
          checkLessonCompletion(event.data.output)
          break
          
        case 'ERROR':
          showNotification(`仿真器错误: ${event.data.message}`, 'error')
          break
      }
    })
  }
  
  return { 
    sendCode, 
    listenToWokwi, 
    startHeartbeat,
    isConnected 
  }
}
```

### 简单判题逻辑

```javascript
// utils/validation.ts
export const validateLesson = (serialOutput: string, lessonId: string) => {
  const validationRules = {
    'lesson_gpio_basics': [
      { pattern: /LED ON/, points: 50 },
      { pattern: /LED OFF/, points: 50 },
      { pattern: /LEVEL_COMPLETED/, points: 100 }
    ]
  }
  
  const rules = validationRules[lessonId] || []
  let totalScore = 0
  
  rules.forEach(rule => {
    if (rule.pattern.test(serialOutput)) {
      totalScore += rule.points
    }
  })
  
  return {
    passed: totalScore >= 100,
    score: totalScore,
    feedback: generateFeedback(totalScore)
  }
}
```

## ✅ 质检清单

### 功能验证
- [ ] 新手引导正常显示和完成
- [ ] 三个阶段顺序加载，状态正确切换
- [ ] Wokwi iframe 正常加载和通信
- [ ] 心跳检测和错误处理正常
- [ ] 串口输出监听和判题逻辑正常
- [ ] 进度条实时更新
- [ ] AI 助教响应正常
- [ ] 分享卡片生成功能正常
- [ ] 本地存储和恢复功能正常
- [ ] 移动端桌面提示正常显示

### 性能验证
- [ ] 页面加载 < 3.0s
- [ ] Wokwi iframe 加载 < 5.0s
- [ ] AI 助教响应 < 3.0s
- [ ] 分享卡片生成 < 2.0s
- [ ] 本地存储延迟 < 100ms

### 用户体验验证
- [ ] 新手引导清晰易懂
- [ ] 错误消息清晰有用
- [ ] 进度反馈即时
- [ ] 关卡难度合理
- [ ] 移动端提示友好
- [ ] 分享功能易用

### 技术风险验证
- [ ] Wokwi API 调用稳定
- [ ] 心跳检测机制有效
- [ ] 网络异常时有明确提示
- [ ] 本地存储容量控制
- [ ] AI API 调用频率限制

---

**文档版本**: v2.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 生产就绪版本  
**交付对象**: 开发团队