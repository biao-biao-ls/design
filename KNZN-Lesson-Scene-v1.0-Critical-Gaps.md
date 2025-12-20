# 🎮 KNZN 关卡场景 v1.0 - 5 个关键遗漏补充方案

## ⚠️ 核心问题

关卡场景文档虽然功能完整，但在**极端交互场景**和**工程落地**上存在 5 个关键盲区，这些问题会直接导致用户挫败感，影响留存率。本文档为每个问题提供详尽的解决方案。

---

## 🚨 遗漏 #1: 移动端的"不可能三角" (Mobile Experience Paradox)

### 问题描述

在手机屏幕上同时显示：
- 代码编辑器（需要 ~40% 宽度）
- 虚拟面包板（需要 ~40% 宽度）
- 任务说明书（需要 ~20% 宽度）
- 性能指标显示
- 按钮栏

**物理上不可能**在手机屏幕上全部展示。键盘输入代码在手机上也是灾难级体验。

### 解决方案

#### 方案 A: 强制桌面端（激进但明确）

```javascript
const MOBILE_STRATEGY = {
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
    },
    
    phase_3_challenge: {
      enabled: false,
      reason: '需要代码编写和创意实现'
    },
    
    phase_4_quiz: {
      enabled: true,
      reason: '选择题可以在手机上完成'
    }
  },

  // 设备检测
  deviceDetection: {
    breakpoints: {
      mobile: {
        maxWidth: '768px',
        orientations: ['portrait', 'landscape']
      },
      tablet: {
        minWidth: '768px',
        maxWidth: '1024px'
      },
      desktop: {
        minWidth: '1024px'
      }
    },
    
    capabilityMatrix: {
      'mobile-portrait': {
        phase_1: 'full',
        phase_2: 'disabled',
        phase_3: 'disabled',
        phase_4: 'full',
        reason: '屏幕宽度过小，无法展示 IDE + 模拟器'
      },
      
      'mobile-landscape': {
        phase_1: 'full',
        phase_2: 'limited',    // 可以尝试，但体验受限
        phase_3: 'disabled',
        phase_4: 'full'
      },
      
      'tablet': {
        phase_1: 'full',
        phase_2: 'full',       // 可以勉强展示
        phase_3: 'limited',
        phase_4: 'full'
      },
      
      'desktop': {
        phase_1: 'full',
        phase_2: 'full',
        phase_3: 'full',
        phase_4: 'full'
      }
    }
  }
}
```

#### 方案 B: 伴侣模式（双屏协作）

```javascript
const COMPANION_MODE = {
  name: '伴侣模式',
  description: '手机作为第二屏幕，展示任务书和原理图',
  enabled: true,
  
  // 主屏幕 (PC/Tablet)
  primaryScreen: {
    displays: ['IDE', 'HardwareSimulator'],
    layout: '50-50-split',
    focusAreas: ['code-editing', 'circuit-visualization'],
    hideByDefault: ['taskDescription', 'performanceMetrics']
  },

  // 伴侣屏幕 (手机)
  companionScreen: {
    displays: ['TaskDescription', 'CircuitDiagram', 'Hints'],
    layout: 'vertical-stack',
    
    // 伴侣屏幕上的特殊功能
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
          },
          {
            id: 'reset',
            label: '🔄 重置',
            sendsToPC: true
          }
        ]
      },
      
      // 伴侣屏幕可以控制 PC 端
      remoteControl: {
        enabled: true,
        capabilities: [
          'request-hint-on-pc',
          'toggle-solution-visibility',
          'request-code-execution'
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
    security: 'session-based'  // 每次配对有新的 session token
  }
}
```

#### 方案 C: 渐进式降级（最实用）

```javascript
const PROGRESSIVE_DEGRADATION = {
  mobile_portrait: {
    // 竖屏: 优先级排序显示
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
        // 代码编辑区可以展开
        expandable: true
      },
      {
        priority: 3,
        component: 'HardwareSimulator',
        height: '25%',
        scrollable: true,
        // 模拟器可折叠
        collapsible: true
      },
      {
        priority: 4,
        component: 'ActionButtons',
        height: 'auto',
        sticky: true,  // 始终粘在底部
        safeArea: 'max(16px, env(safe-area-inset-bottom))'  // 避免 Home Indicator
      }
    ],
    
    // 自适应编辑器
    codeEditor: {
      fontSize: '12px',      // 比桌面端小
      height: 'auto',
      minLines: 10,
      maxLines: 20,
      
      // 移动端特殊功能
      mobileOptimizations: {
        fullscreenEditMode: {
          enabled: true,
          gesture: 'swipe-up',
          hidesTaskDescription: true,
          hidesSimulator: true,
          toggleBehavior: 'slide-animation'
        },
        
        codeTemplateSnippets: {
          enabled: true,
          snippets: [
            { label: 'GPIO 设置', code: 'GPIO.setup(17, GPIO.OUT)' },
            { label: 'LED 亮', code: 'GPIO.output(17, GPIO.HIGH)' },
            { label: 'LED 灭', code: 'GPIO.output(17, GPIO.LOW)' },
            { label: '延迟', code: 'time.sleep(1)' },
            { label: '清理', code: 'GPIO.cleanup()' }
          ],
          tapToInsert: true
        }
      }
    },
    
    // 移动端输入法优化
    inputOptimizations: {
      keyboardBehavior: {
        hidePredictionBar: true,
        autoCapitalize: 'off',
        autoCorrect: 'off'  // Python 不需要自动纠正
      },
      
      // 虚拟键盘遮挡处理
      keyboardAvoidance: {
        enabled: true,
        behavior: 'scroll-editor-above-keyboard',
        animation: 'smooth'
      }
    }
  },
  
  mobile_landscape: {
    layouts: [
      {
        priority: 1,
        component: 'CodeEditor',
        width: '60%',
        height: '100%'
      },
      {
        priority: 2,
        component: 'HardwareSimulator',
        width: '40%',
        height: '100%'
      }
    ],
    
    hiddenComponents: [
      'TaskDescription',  // 任务说明需要滑动侧边栏查看
      'PerformanceMetrics'
    ],
    
    sidebarPanel: {
      enabled: true,
      position: 'left',
      width: '280px',
      toggle: 'hamburger-menu',
      contains: [
        'TaskDescription',
        'Hints',
        'PerformanceMetrics'
      ]
    }
  },

  tablet: {
    layouts: [
      {
        priority: 1,
        component: 'TaskDescription',
        width: '25%',
        height: '100%'
      },
      {
        priority: 2,
        component: 'CodeEditor',
        width: '37.5%',
        height: '100%'
      },
      {
        priority: 3,
        component: 'HardwareSimulator',
        width: '37.5%',
        height: '100%'
      }
    ],
    
    // 平板可以支持全功能
    fullFeatureSupport: true
  },

  desktop: {
    layouts: [
      {
        priority: 1,
        component: 'Sidebar',
        width: '20%'
      },
      {
        priority: 2,
        component: 'CodeEditor',
        width: '40%'
      },
      {
        priority: 3,
        component: 'HardwareSimulator',
        width: '40%'
      }
    ],
    
    fullFeatureSupport: true
  }
}
```

---

## 🚨 遗漏 #2: 状态持久化与防挫败机制 (State Persistence & Anti-Frustration)

### 问题描述

场景：用户花了 30 分钟写了 80 行代码，连接了 15 根电路线。突然：
- 刷新了页面
- 网络波动断开
- 浏览器崩溃
- 误触返回按钮

所有进度**丢失**。用户会立即离开。

### 解决方案

#### 自动快照系统

```javascript
const AUTO_SNAPSHOT_SYSTEM = {
  enabled: true,
  
  // 快照触发条件
  triggers: [
    {
      event: 'code-change',
      debounceMs: 1000,      // 防止频繁保存
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
    },
    {
      event: 'before-execution',
      when: 'user-clicks-run-code'  // 执行前先保存当前状态
    }
  ],

  // 存储策略（多层备份）
  storageStrategy: {
    layer1: {
      name: 'IndexedDB (本地浏览器)',
      capacity: '50MB',
      persistence: 'browser-session + local-storage',
      latency: '< 10ms',
      reliability: 'medium'  // 用户可能清空浏览数据
    },
    
    layer2: {
      name: '后端数据库',
      capacity: 'unlimited',
      persistence: 'permanent',
      latency: '200-500ms',  // 网络延迟
      reliability: 'high',
      
      // 只有完整、有效的快照才保存到后端
      validationRules: [
        'code-length > 20 characters',
        'circuit-is-valid',
        'no-syntax-errors'
      ]
    },
    
    // 同步策略
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
        syncWhenOnline: true,
        indication: 'grey-icon-with-pending-count'
      }
    }
  },

  // 版本历史
  versionHistory: {
    enabled: true,
    maxSnapshots: 20,
    snapshots: [
      {
        id: 'snapshot_001',
        timestamp: 1734777600000,
        label: '你自动保存',
        code: 'import RPi.GPIO...',
        circuitState: { /* breadboard state */ },
        size: '3.2KB'
      },
      {
        id: 'snapshot_002',
        timestamp: 1734777620000,
        label: '代码执行后',
        code: 'import RPi.GPIO...',
        circuitState: { /* breadboard state */ },
        size: '3.2KB'
      }
    ],
    
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
  }
}
```

#### 防挫败机制

```javascript
const ANTI_FRUSTRATION_SYSTEM = {
  // 确认对话框（防误触）
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

  // 防止意外返回
  backButtonBehavior: {
    enabled: true,
    intercept: 'browser-back-button',
    
    flow: `
1. 用户点击浏览器的 [<] 返回键
2. 如果有未保存的更改 → 拦截，显示确认对话框
3. 否则正常返回到技能地图
    `
  },

  // 无法撤销操作的警告
  destructiveActionWarning: {
    actions: [
      'reset-all-code',
      'clear-all-circuit',
      'abandon-this-phase'
    ],
    
    ui: {
      type: 'modal-with-countdown',
      title: '🚨 此操作无法撤销',
      message: '你即将清除所有代码。这无法恢复，但你可以从历史版本还原。',
      countdown: 3,           // 3 秒倒计时才能确认
      buttons: [
        { label: '取消', action: 'cancel', disabled: false },
        { label: '我已确认', action: 'proceed', disabled: true, enablesAfter: 3000 }
      ]
    }
  }
}
```

---

## 🚨 遗漏 #3: 布局与视窗管理 (Workspace Layout)

### 问题描述

IDE 和硬件模拟器分开放在两个地方，用户看代码时看不见电路运行效果，看电路时又看不见代码。这是**最大的学习效率杀手**。

### 解决方案

#### FR-007: 智能分屏系统 (Smart Split Panes)

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
    },
    
    tablet: {
      name: 'Stacked Layout',
      layout: `
┌────────────────────────────────────────────┐
│  IDE (60%)                                 │
├────────────────────────────────────────────┤
│  Simulator (40%) + Task Panel (collapsed)  │
└────────────────────────────────────────────┘
      `,
      components: {
        codePanel: {
          width: '100%',
          height: '60%'
        },
        
        simulatorPanel: {
          width: '100%',
          height: '40%'
        },
        
        taskPanel: {
          position: 'overlay',
          icon: 'side-panel-toggle',
          slideInFrom: 'left',
          width: '300px'
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
    },
    {
      name: 'Fullscreen Simulator (电路调试)',
      description: '模拟器全屏，IDE 折叠为左侧小窗',
      layout: '5-95',
      icon: '🔬'
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
      },
      {
        between: 'codePanel',
        and: 'simulatorPanel',
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
        
        fontColor: {
          code: '#E0E0E0',
          ui: 'transparent'
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

## 🚨 遗漏 #4: 与"实物制造 (Sector 04)"的连接断裂 (Loot System)

### 问题描述

用户完成了 GPIO 关卡，但不知道这个成就为"赛博越野车"项目贡献了什么。缺乏**目标感的具体反馈**。

### 解决方案

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
            phase_3_challenge: 'any',    // 挑战任意完成即可
            phase_4_quiz: 'score >= 60'  // 测验需要 60+ 分
          }
        },
        
        {
          id: 'timing-coordinator',
          name: '⏱️ 时序协调器',
          description: '精确控制事件的先后顺序和延迟',
          rarity: 'uncommon',
          icon: '/assets/loot/timing.png',
          
          requirements: {
            phase_3_challenge: 'completed',      // 必须完成创意挑战
            bonus: 'code_contains_sleep_function'  // 代码里用到了 time.sleep()
          }
        },
        
        {
          id: 'persistence-badge',
          name: '🏅 坚持勋章',
          description: '表示你不怕犯错的精神',
          rarity: 'uncommon',
          icon: '/assets/loot/persistence.png',
          
          requirements: {
            phase_2_or_3_attempts: '>= 3'  // 尝试了至少 3 次
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
          'usedIn-badge'  // 显示在 Sector 04 的哪些项目中用到
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
        
        // 缺少的模块显示为 "灰化"
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

## 🚨 遗漏 #5: 错误处理的"人性化" (Error Humanization)

### 问题描述

Docker 运行 Python 报错通常是晦涩的 Traceback，小白用户看不懂：
```
Traceback (most recent call last):
  File "<stdin>", line 5, in <module>
NameError: name 'GPI' is not defined
```

应该翻译成：
```
🤖 指挥官，我检测到一个指令错误。
你可能把 GPIO 拼错了——系统找不到名叫 'GPI' 的指令。
建议: 检查第 5 行，应该是 GPIO.setup() 吧？
```

### 解决方案

#### FR-007（扩展）: 智能错误翻译与调试辅助

```javascript
const SMART_ERROR_TRANSLATION = {
  name: 'FR-007-EXTENDED: 智能调试',
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
      pattern: 'TypeError: \'int\' object is not subscriptable',
      category: 'type-mismatch',
      
      humanTranslation: `
🤖 类型错误：你在用错误的方式操作一个数字。

错误含义：
你试图像处理列表一样处理一个数字。
例如： num[0] ← 这样用在数字上是不对的

示例：
错误: x = 5; print(x[0])     ← 数字不能用 [索引]
正确: x = [5]; print(x[0])   ← 列表才能用 [索引]
      `,
      
      suggestions: [
        'Check data types',
        'Use list instead of single value',
        'Review indexing operations'
      ]
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

示例：
错误:
  if True:
  print("x")   ← 缺少缩进

正确:
  if True:
    print("x")  ← 有缩进
      `,
      
      suggestions: [
        'Check line indentation',
        'Ensure consistent spacing',
        'Use 4 spaces or 1 tab, not mix'
      ],
      
      autoFix: {
        enabled: true,
        action: 'highlight-problematic-line',
        offering: 'Would you like me to auto-fix the indentation?'
      }
    },

    {
      pattern: 'GPIO.RPi.GPIO.error: No access to /dev/mem',
      category: 'hardware-simulation-error',
      
      humanTranslation: `
🤖 硬件模拟错误：系统无法访问 GPIO 硬件。

原因：
你正在尝试真实控制树莓派的 GPIO，但这个程序运行在虚拟环境中。

解决：
1. 确保你在虚拟模拟器中运行（不是真实树莓派）
2. 检查代码中是否正确初始化了 GPIO：
   GPIO.setmode(GPIO.BCM)
   GPIO.setup(17, GPIO.OUT)

在虚拟模拟器中，这些命令会被拦截并转换为仿真。
      `,
      
      suggestions: [
        'This is expected in simulator mode',
        'GPIO operations will be simulated',
        'Check if GPIO is initialized'
      ],
      
      severity: 'warning'  // 这其实不是错误
    }
  ],

  // 错误上下文分析
  contextAnalysis: {
    enabled: true,
    
    provides: [
      'which-line-has-error',
      'what-the-code-was-trying-to-do',
      'what-went-wrong',
      'how-to-fix-it',
      'similar-examples'
    ],
    
    ui: {
      errorPanel: {
        layout: 'vertical',
        sections: [
          {
            section: 'error-title',
            icon: '❌',
            color: '#FF0055'
          },
          {
            section: 'human-explanation',
            icon: '💬',
            color: '#FFD700'
          },
          {
            section: 'problematic-code',
            icon: '🔍',
            background: 'highlighted-line',
            lineNumber: true
          },
          {
            section: 'suggestions',
            icon: '💡',
            type: 'ordered-list',
            interactive: true  // 可点击应用建议
          },
          {
            section: 'similar-examples',
            icon: '📚',
            link: 'show-from-tutorials'
          }
        ]
      }
    }
  },

  // 步进执行调试 (Step-through Debugging)
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
          control: 'Step Over (F10) / Step Into (F11) / Step Out (Shift+F11)'
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
          example: 'When code runs GPIO.output(17, HIGH), LED blinks immediately',
          synchronization: 'instant'
        },
        {
          feature: 'breakpoints',
          effect: 'pause-execution-at-specific-lines',
          how: 'click-line-number'
        }
      ]
    },

    // 时序可视化（最重要！）
    timingVisualization: {
      enabled: true,
      description: '用时间轴显示代码执行时序和硬件响应',
      
      visualization: {
        type: 'timeline',
        shows: [
          {
            track: 'Code Execution',
            events: [
              { time: 0, action: 'GPIO.setmode(BCM)', color: '#00FFC2' },
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
              { time: 1000, state: 'LED ON', color: '#33FF00', visualization: 'led-icon-lit' },
              { time: 2000, state: 'GPIO 17 → LOW', color: '#666666' },
              { time: 2000, state: 'LED OFF', color: '#666666', visualization: 'led-icon-dim' }
            ]
          }
        ],
        
        alignment: 'synchronized',  // 代码执行和硬件反应完美对齐
        synchronizationLatency: '< 50ms'
      }
    }
  }
}
```

---

## 📋 完整修改清单

### 新增 FR-007: 布局与视窗管理 (Workspace Layout)

```markdown
#### FR-007: 布局与视窗管理 ✅ 分屏同步版

**描述**: 定义 IDE、硬件模拟器、任务书的空间关系，支持拖拽改大小、Zen Mode、实时同步

**核心功能**:
- 多种预设布局 (Classic/Visual-First/Code-First/Fullscreen)
- 用户自定义布局并记忆偏好
- 拖拽改大小的分屏面板
- Zen Mode (沉浸编码，隐藏干扰)
- 代码行与硬件状态的实时同步高亮
```

### 新增 FR-008: 智能调试 (Smart Debugging)

```markdown
#### FR-008: 智能调试 ✅ 步进执行版

**描述**: 将晦涩的错误翻译成人类可理解的语言，并支持逐行执行和硬件时序可视化

**核心功能**:
- 错误模式识别与人性化翻译
- 代码上下文分析（指出错误行、解释原因、给出修复建议）
- 步进执行（逐行运行代码）
- 变量监视面板（实时显示所有变量值）
- 硬件时序可视化（显示代码执行和硬件反应的对齐关系）
```

### 补充 FR-002: 状态持久化扩展

```markdown
#### FR-002-EXTENDED: 自动快照与恢复 ✅ 多层备份版

**新增特性**:
- IndexedDB 本地存储 (< 10ms)
- 后端数据库异步备份 (200-500ms)
- 版本历史（最多 20 个快照）
- 离线工作模式（网络断开时继续使用）
- 防挫败机制（确认对话框、撤销支持、无法恢复操作警告）
```

### 补充 FR-001: 移动端适配

```markdown
#### FR-001-EXTENDED: 移动端渐进式降级 ✅ 三层方案版

**新增特性**:
- 方案 A: 强制桌面端（Phase 2/3 在手机上禁用）
- 方案 B: 伴侣模式（手机显示任务书，PC 显示 IDE）
- 方案 C: 渐进式降级（根据屏幕大小自动调整布局）
- 移动端代码片段（快速插入常用代码）
- 虚拟键盘遮挡处理
```

### 补充 FR-004: Loot 系统

```markdown
#### FR-004-EXTENDED: 物品掉落与库存 ✅ 商业闭环版

**新增特性**:
- 每个关卡完成时掉落虚拟硬件模块
- 模块稀有度系统（common/uncommon/rare/epic）
- 库存系统（记录所有已获得模块）
- 与 Sector 04 的集成（显示模块用途）
- 解锁动画和掉落提示
```

---

## 🎯 优先级建议

| 优先级 | 遗漏 | 影响范围 | 修复难度 | 估计工期 |
|------|------|--------|--------|--------|
| **P0** | #5 错误人性化 | 所有用户 | 中 | 3-5 天 |
| **P0** | #2 状态持久化 | 所有用户 | 中-高 | 5-7 天 |
| **P0** | #3 布局管理 | 所有用户 | 中 | 3-5 天 |
| **P1** | #1 移动端适配 | 移动端用户 (30%) | 高 | 7-10 天 |
| **P2** | #4 Loot 系统 | 商业化需求 | 低 | 2-3 天 |

---

**完成度**: 5 个关键遗漏 + 3 个新增 FR + 完整实现方案 ✅  
**推荐行动**: 立即将这些内容合并到关卡场景文档 v1.0 → v1.1

