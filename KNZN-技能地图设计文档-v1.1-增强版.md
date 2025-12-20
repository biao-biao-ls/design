# 🗺️ KNZN 技能地图 (The Skill Map) 完整设计文档 v1.1

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 技能地图 (The Skill Map)  
**路由**: `/map` 或 `/skill-map`  
**用户状态**: 已登录用户 + Guest Mode（有时间限制）  
**文档版本**: v1.1 (增强完整版 - 含 Sector 04 + UX + A11y DOM 覆盖)  
**最后更新**: 2024-12-20  
**审核状态**: ✅ 可交付高级工程师进行开发  
**文档类型**: 生产级设计规范（零歧义）

---

## 🎯 第一部分：产品需求文档 (PRD)

### 1.1 页面定位与价值主张

#### 核心定位
技能地图是用户的**学习枢纽**。不采用传统课程列表视图，而是展现一个**动态网络拓扑图**，用户作为"神经元节点"在其中移动和学习。每个技能模块对应一个**可交互的电路节点**，通过点击进入学习。最终，用户通过完成所有课程通往**Sector 04 (物质化)**——将虚拟蓝图转化为真实硬件的终极体验。

#### 设计哲学
- **可视化学习路径**: 节点布局遵循难度 + 学科逻辑，清晰呈现学习进度
- **沉浸式进度反馈**: 完成节点时即时点亮，形成闪闪发光的"技能星辰"
- **游戏化激励机制**: 解锁徽章、获得经验值、逐步解锁终极核心，促进持续学习
- **商业化闭环**: Sector 04 汇聚点是产品的终极转化——用户从"虚拟设计"升华为"实物制造"

---

### 1.2 核心功能需求 (Functional Requirements)

#### FR-001: 地图拓扑布局 ✅ 4 Sector 完整版 + 核心汇聚

**描述**: 页面加载时动态计算和渲染技能节点网络，包括 3 个扇形学科区 + 1 个中心终极核心

**拓扑结构**:
```javascript
// 📐 力导向布局（Force-Directed Layout）+ 中心汇聚
const MAP_TOPOLOGY = {
  // 四个学科领域（三个扇形分布 + 一个中心汇聚）
  sectors: [
    {
      id: 'hardware',
      name: '硬件基础',
      tier: 'sector-01',
      angle: 0,           // 0° - 120°
      color: '#FF6B35',   // 橙红色
      nodes: 12,
      prerequisite: null  // 无前置
    },
    {
      id: 'firmware',
      name: '固件开发',
      tier: 'sector-02',
      angle: 120,         // 120° - 240°
      color: '#00FFC2',   // 荧光青
      nodes: 15,
      prerequisite: 'hardware'  // 需完成硬件基础
    },
    {
      id: 'application',
      name: '应用设计',
      tier: 'sector-03',
      angle: 240,         // 240° - 360°
      color: '#FFD700',   // 金色
      nodes: 18,
      prerequisite: ['hardware', 'firmware']  // 需完成硬件 + 固件
    },
    {
      // ⭐ 新增: 终极核心 - 商业化闭环
      id: 'fabrication',
      name: '物质化 (Fabrication)',
      tier: 'sector-04-core',
      position: 'center',  // 地图中心
      color: '#FFFFFF',    // 全息白
      glowColor: 'radial-gradient(#FF00FF, #00FFFF)',  // 紫-青彩虹晕光
      nodes: 5,           // 实物制造的关键步骤
      prerequisite: ['hardware', 'firmware', 'application'],  // 需完成前 3 个
      status: 'locked',   // 默认锁定，直到前置完成
      scale: 1.5,        // 放大 50% 作为视觉强调
      description: '通过蓝图设计，将虚拟电路转化为实物。这是 KNZN 的终极目标。',
      unlockBehavior: {
        trigger: 'all-sectors-complete',
        animation: 'core-awakening',
        notification: 'broadcast',  // 向社交圈广播
        reward: { xp: 10000, badge: 'core-master', unlock: 'next-season' }
      }
    }
  ],
  
  // 物理仿真参数
  physics: {
    springForce: 0.5,        // 弹簧力强度
    repulsionForce: 0.8,     // 斥力强度（避免重叠）
    dampingFactor: 0.95,     // 阻尼系数
    iterationCount: 50,      // 力仿真迭代次数
    targetDistance: 150      // 目标弹簧距离 (px)
  },
  
  // ⭐ 新增: Sector 04 的特殊渲染规则
  coreRenderingRules: {
    // 当用户完成前 3 个 Sector 时的解锁演程
    unlockAnimation: {
      trigger: 'all-sectors-complete',
      duration: 3000,  // 3 秒解锁序列
      steps: [
        { time: 0, effect: 'core-pulse-start', intensity: 0.5 },
        { time: 500, effect: 'core-glow-expand', radius: '200px' },
        { time: 1000, effect: 'energy-flow-in', direction: 'from-three-sectors' },
        { time: 2000, effect: 'core-lock-break', sound: 'core_unlock.wav' },
        { time: 2500, effect: 'core-fully-lit', intensity: 1.0 }
      ]
    },
    
    // Sector 04 节点间的连接线动画（比普通连接线快）
    coreEdgeFlowAnimation: {
      enabled: true,
      flowSpeed: 'ultra-fast',  // 比普通连接线快 3 倍
      flowColor: '#FF00FF',     // 紫色能量流
      intensity: 'high',
      particleEffect: true      // 启用粒子效果
    },
    
    // 已完成 Sector 04 后，整个地图变化
    completionEffect: {
      backgroundShift: {
        from: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #0F1628 100%)',
        to: 'linear-gradient(135deg, #1A0A2E 0%, #16213E 50%, #0F3460 100%)',  // 向蓝色调
        transitionDuration: 2000
      },
      message: '恭喜！你已汇聚所有知识之力，世界正在重塑...',
      showNextSeasonTease: true
    }
  }
}
```

---

#### FR-002: HUD 界面层 (Heads-Up Display) ⭐ 新增

**描述**: 地图页面的 UI 覆盖框架，提供导航、资产显示、功能按钮，确保用户不会迷失

**HUD 结构**:
```javascript
const HUD_LAYER = {
  // 左上角：返回导航 + 当前位置
  topLeft: {
    backButton: {
      label: '← 返回首页',
      action: 'navigate-to-home',
      hotkey: 'ESC',
      tooltip: '返回接入终端'
    },
    
    breadcrumb: {
      show: true,
      items: ['首页', '技能地图', '当前位置: Sector 01'],
      format: 'text'
    },
    
    modeToggle: {
      label: '拓扑图 / 列表',
      currentMode: 'topology',  // 'topology' 或 'list'
      toggle: {
        topology: {
          icon: '🗺️',
          label: '拓扑图',
          description: '力导向布局，全景浏览'
        },
        list: {
          icon: 'Ξ',
          label: '列表',
          description: '传统列表，快速查找'
        }
      },
      behavior: 'smooth-transition'
    }
  },
  
  // 右上角：用户资产栏
  topRight: {
    userAssets: {
      items: [
        {
          id: 'xp',
          label: 'XP',
          value: 4200,
          icon: '⚡',
          nextLevel: 5000,
          showProgress: true,
          color: '#FFD700'
        },
        {
          id: 'credit',
          label: '学分',
          value: 1250,
          icon: '💎',
          earningMethod: '完成节点 + 首次通关 + 社交贡献',
          color: '#00FFC2'
        },
        {
          id: 'blueprint-fragments',
          label: '蓝图碎片',
          value: 42,
          icon: '🧩',
          description: '集齐 100 个可合成完整设计',
          color: '#FF6B35'
        }
      ],
      layout: 'compact-row',
      showAnimation: 'pulse-on-change'
    },
    
    userProfile: {
      avatar: 'user_avatar_url',
      username: 'username_anonymous',
      level: 5,
      badge: 'rising-star',
      clickBehavior: 'open-profile-modal'
    }
  },
  
  // 右下角：功能按钮组
  bottomRight: {
    buttons: [
      {
        id: 'recenter',
        label: '定位',
        icon: '✛',
        tooltip: '返回当前进度节点',
        action: 'recenter-view',
        hotkey: 'Ctrl+Home',
        visibility: 'only-when-off-viewport'
      },
      {
        id: 'legend',
        label: '图例',
        icon: '?',
        tooltip: '显示节点类型 + 状态说明',
        action: 'toggle-legend-panel',
        panel: {
          position: 'left-side',
          content: {
            nodeTypes: [
              { shape: '◆', name: 'BEGINNER', color: '#33FF00' },
              { shape: '●', name: 'INTERMEDIATE', color: '#00FFC2' },
              { shape: '■', name: 'ADVANCED', color: '#FF6B35' },
              { shape: '★', name: 'MASTER', color: '#FFD700' }
            ],
            nodeStatuses: [
              { state: 'completed', color: '#33FF00', description: '已完成' },
              { state: 'in-progress', color: '#00FFC2', description: '进行中' },
              { state: 'not-started', color: '#333333', description: '未开始' },
              { state: 'locked', color: '#1A1A1A', description: '已锁定' }
            ],
            edgeTypes: [
              { style: '虚线', meaning: '前置条件', color: '#555555' },
              { style: '实线 (淡)', meaning: '推荐路径', color: '#00FFC2' },
              { style: '实线 (亮)', meaning: '已完成路径', color: '#33FF00' }
            ]
          }
        }
      },
      {
        id: 'settings',
        label: '设置',
        icon: '⚙️',
        tooltip: '地图偏好设置',
        action: 'open-settings',
        menu: {
          items: [
            { label: '性能模式', type: 'toggle', default: false },
            { label: '禁用动画', type: 'toggle', default: false },
            { label: '显示连接线标签', type: 'toggle', default: false },
            { label: '社交可见性', type: 'select', options: ['公开', '仅好友', '隐藏'], default: '仅好友' }
          ]
        }
      }
    ],
    
    layout: 'vertical-stack',
    spacing: '12px',
    bgColor: 'transparent'
  },
  
  // 中心底部：搜索 + 快捷操作
  bottomCenter: {
    searchBar: {
      placeholder: '搜索技能 (e.g. "GPIO", "中断")',
      position: 'bottom-center',
      width: '400px',
      expandOnFocus: true,
      results: {
        maxDisplay: 5,
        showPath: true,  // 显示搜索结果在地图中的位置
        highlightOnHover: true,
        autoNavigate: 'on-click'
      }
    }
  },
  
  // 左下角：进度概览卡片
  bottomLeft: {
    progressWidget: {
      show: true,
      compact: true,
      items: [
        {
          sector: 'hardware',
          completed: 6,
          total: 12,
          percentage: 50,
          color: '#FF6B35'
        },
        {
          sector: 'firmware',
          completed: 4,
          total: 15,
          percentage: 27,
          color: '#00FFC2'
        },
        {
          sector: 'application',
          completed: 2,
          total: 18,
          percentage: 11,
          color: '#FFD700'
        }
      ],
      format: 'progress-bars',
      onClick: 'filter-by-sector'
    }
  }
}
```

---

#### FR-003: Guest Mode 限制与体验 ⭐ 新增

**描述**: 明确游客用户在地图上的功能限制和升级引导

**Guest Mode 配置**:
```javascript
const GUEST_MODE_CONFIG = {
  enabled: true,
  sessionDuration: 30 * 60 * 1000,  // 30 分钟
  
  // 功能限制
  restrictions: {
    // 只能查看 Sector 01 的前 3 个节点
    accessibleNodes: {
      rule: 'first-n-nodes-per-sector',
      allowedNodes: {
        'hardware': [1, 2, 3],  // 仅前 3 个
        'firmware': [],          // 不可访问
        'application': []        // 不可访问
      },
      behavior: {
        onAttemptLocked: 'show-registration-modal',
        message: '注册后可解锁全部课程'
      }
    },
    
    // 社交功能全部禁用
    socialFeatures: {
      leaderboard: 'encrypted-signal',  // 显示为"加密信号"
      otherPlayersProgress: 'hidden',
      badge: {
        message: '完成注册后可见其他学者的进度',
        color: '#999999'
      }
    },
    
    // 进度不保存，仅会话内有效
    progressPersistence: {
      enabled: false,
      behavior: 'session-only',
      onSessionEnd: {
        notification: {
          title: '⚠️ 神经连接断开',
          message: '未注册用户的学习进度无法保存。立即注册，永久保存你的学习记录？',
          action: 'show-registration-form',
          buttons: ['立即注册', '继续游览']
        }
      }
    },
    
    // 不能开启 Sector 04 相关内容提示
    coreFeatures: {
      sector04Access: 'completely-hidden',
      description: 'Sector 04 仅向已注册用户开放'
    }
  },
  
  // 升级引导
  upgradePath: {
    triggers: [
      {
        event: 'complete-sector-01-node-1',
        message: '太棒了！你已经开始学习了。注册账户以保存进度并解锁更多内容。',
        cta: '注册账户'
      },
      {
        event: 'attempt-access-firmware',
        message: 'Sector 02 (固件开发) 需要注册。你已准备好深入学习了吗？',
        cta: '免费注册'
      },
      {
        event: 'session-approaching-end',
        message: '你的游览时间即将结束 (剩余 5 分钟)。注册以继续学习。',
        urgency: 'high',
        cta: '现在注册'
      }
    ]
  }
}
```

---

#### FR-004: 列表视图切换 ⭐ 新增

**描述**: 提供传统列表视图作为拓扑图的降级方案，便于移动端和快速查找

**列表视图配置**:
```javascript
const LIST_VIEW_CONFIG = {
  enabled: true,
  triggerButton: 'top-left-mode-toggle',
  
  listStructure: {
    format: 'hierarchical-timeline',
    layout: [
      {
        sector: 'Sector 01: 硬件基础',
        color: '#FF6B35',
        items: [
          {
            id: 'node_001',
            title: '1.1 电路基础概念',
            difficulty: '★☆☆☆☆',
            estimatedTime: '15 min',
            status: 'completed',
            icon: '✓'
          },
          {
            id: 'node_002',
            title: '1.2 面包板和跳线',
            difficulty: '★☆☆☆☆',
            estimatedTime: '20 min',
            status: 'in-progress',
            icon: '◉'
          },
          // ... 更多节点
        ]
      },
      // ... 其他 Sector
    ]
  },
  
  interactionBehavior: {
    clickOnItem: 'scroll-to-node-in-topology-view',  // 点击项目后回到拓扑图并高亮
    orOpenDetailModal: true,
    animationDuration: 500
  },
  
  responsiveBreakpoints: {
    'mobile-portrait': {
      defaultView: 'list',
      reason: '屏幕宽度太小，拓扑图操作困难'
    },
    'mobile-landscape': {
      defaultView: 'topology',
      availableSwitch: true
    },
    'tablet+': {
      defaultView: 'topology',
      availableSwitch: true
    }
  }
}
```

---

#### FR-005: 首次进入引导 (Onboarding) ⭐ 新增

**描述**: 新用户首次进入地图时的引导序列，避免茫然感

**首次进入流程**:
```javascript
const ONBOARDING_SEQUENCE = {
  trigger: 'first-time-entering-map',
  
  steps: [
    {
      step: 1,
      duration: 2000,
      action: 'camera-focus-on-first-node',
      target: 'node_001',
      cameraZoom: 1.5,
      
      overlay: {
        type: 'pulsing-gesture',
        content: '👈 轻点我开始学习',
        position: 'on-node'
      }
    },
    {
      step: 2,
      trigger: 'user-clicks-first-node',
      action: 'show-welcome-toast',
      content: {
        title: '欢迎来到技能地图',
        description: '这里显示了硬件学习的全部路径。完成节点即可解锁新内容。',
        icon: '🗺️'
      },
      duration: 3000
    },
    {
      step: 3,
      trigger: 'after-toast-closes',
      action: 'show-legend-panel',
      autoClose: true,
      duration: 5000,
      message: '这些就是你将要学习的内容。每种颜色代表不同学科，图形代表难度。'
    },
    {
      step: 4,
      trigger: 'user-closes-legend',
      action: 'complete-onboarding',
      confetti: {
        enabled: true,
        duration: 1000,
        particles: 'circuit-theme'
      }
    }
  ],
  
  // 可在设置中重新查看引导
  repeatOption: {
    show: true,
    location: 'settings-menu',
    label: '重新观看引导'
  }
}
```

---

#### FR-006: 路径点亮动画 (Path Lighting) ⭐ 新增

**描述**: 用户完成关卡返回地图时，能量沿着连接线流向下一个解锁的节点，打造极强的即时反馈感

**路径点亮配置**:
```javascript
const PATH_LIGHTING_ANIMATION = {
  trigger: 'return-from-completed-node',
  
  animation: {
    name: 'energy-transmission',
    duration: 2500,
    
    steps: [
      {
        time: 0,
        action: 'highlight-completed-node',
        effect: 'pulse-burst',
        color: '#33FF00',
        sound: 'node_complete_success.wav'
      },
      {
        time: 500,
        action: 'start-energy-flow',
        from: 'completed-node',
        to: 'next-unlocked-nodes',
        flowColor: '#00FFC2',
        flowSpeed: 'fast',
        sound: 'energy_flow.wav'
      },
      {
        time: 1500,
        action: 'unlock-next-nodes',
        previousStatus: 'locked',
        newStatus: 'unlocked',
        animation: 'fade-and-glow-in',
        color: '#FFD700',
        sound: 'unlock_sound.wav'
      },
      {
        time: 2000,
        action: 'show-achievement-toast',
        content: {
          title: '新技能解锁！',
          description: '你现在可以学习: [节点名称]',
          nextAction: 'suggest-learning'
        }
      },
      {
        time: 2500,
        action: 'complete-animation',
        finalState: 'all-new-nodes-glowing'
      }
    ]
  },
  
  // 多个解锁节点的级联动画
  cascadeEffect: {
    enabled: true,
    staggerDelay: 300,  // 每个节点之间间隔 300ms
    effect: 'wave-propagation'
  },
  
  // 用户可禁用此动画（在性能设置中）
  userControl: {
    canDisable: true,
    location: 'settings-menu > performance',
    default: 'enabled'
  }
}
```

---

#### FR-007: Canvas A11y DOM 覆盖层 ⭐ 新增（技术修正）

**描述**: 为 Canvas 渲染的节点添加透明 DOM 覆盖层，支持屏幕阅读器和键盘导航

**DOM 覆盖层配置**:
```javascript
const ACCESSIBILITY_DOM_OVERLAY = {
  strategy: 'transparent-dom-layer',
  purpose: 'bridge-canvas-a11y-gap',
  
  architecture: {
    canvasLayer: {
      zIndex: 100,
      responsibility: 'visual-rendering',
      technologies: ['Canvas 2D', 'WebGL']
    },
    
    domOverlayLayer: {
      zIndex: 101,
      position: 'absolute-overlay-on-canvas',
      backgroundColor: 'transparent',
      pointerEvents: 'auto',
      responsibility: 'accessibility-and-interaction',
      
      // 每个画在 Canvas 上的节点都对应一个 DOM 元素
      nodeRepresentation: {
        element: '<div class="node-a11y-overlay">',
        attributes: {
          role: 'button',
          ariaLabel: 'Template: 技能: [name]. 难度: [tier]. 状态: [status]. 进度: [progress]%',
          ariaPressed: '[boolean]',
          tabindex: '[calculated-based-on-map-order]',
          dataNodeId: '[nodeId]',
          dataStatus: '[status]'
        },
        
        styles: {
          position: 'absolute',
          width: '[calculated-from-node-radius]',
          height: '[calculated-from-node-radius]',
          borderRadius: '50%',
          cursor: 'pointer',
          opacity: 0,  // 完全透明，用户看不见
          pointerEvents: 'auto',
          // 实时同步 Canvas 节点位置
          transform: 'translate([x]px, [y]px)'
        },
        
        eventListeners: {
          click: 'trigger-node-detail-modal',
          keydown: {
            Enter: 'trigger-node-detail-modal',
            Space: 'trigger-node-detail-modal'
          },
          focus: 'highlight-node-in-canvas-with-ring',
          blur: 'remove-canvas-highlight'
        }
      }
    }
  },
  
  synchronization: {
    method: 'real-time-sync-on-animation-frame',
    frequency: 'every-frame',
    
    syncElements: [
      {
        type: 'node',
        canvasProperty: 'position, radius, status',
        domProperty: 'transform, ariaLabel, ariaPressed, className'
      },
      {
        type: 'edge',
        canvasProperty: 'none',  // 边不需要 DOM 交互
        domProperty: 'none'
      }
    ]
  },
  
  keyboardNavigation: {
    enabled: true,
    
    mappings: [
      {
        key: 'Tab',
        behavior: 'cycle-through-accessible-nodes',
        direction: 'forward',
        order: 'depth-first-from-sector-01'
      },
      {
        key: 'Shift+Tab',
        behavior: 'cycle-through-accessible-nodes',
        direction: 'backward'
      },
      {
        key: 'ArrowDown / ArrowRight',
        behavior: 'move-focus-to-next-related-node',
        relation: 'prerequisite or recommended'
      },
      {
        key: 'ArrowUp / ArrowLeft',
        behavior: 'move-focus-to-previous-node'
      },
      {
        key: 'Enter / Space',
        behavior: 'open-focused-node-detail'
      },
      {
        key: 'Escape',
        behavior: 'clear-focus',
        clearCanvas: true
      }
    ]
  },
  
  screenReaderSupport: {
    enabled: true,
    
    ariaLive: {
      region: 'skill-map-container',
      polite: true,
      atomic: true,
      
      announcements: [
        {
          event: 'node-unlocked',
          message: '[node-name] 已解锁。难度: [tier]。按 Tab 进行浏览，或按 Enter 查看详情。'
        },
        {
          event: 'focus-changed',
          message: '焦点已移动到 [node-name]。[description]。'
        },
        {
          event: 'modal-opened',
          message: '[node-name] 详情弹窗已打开。按 Escape 关闭。'
        }
      ]
    },
    
    focusIndicator: {
      type: 'visible-ring-on-canvas',
      color: '#FFD700',
      width: 3,
      animation: 'pulsing',
      syncWithDOM: true
    }
  },
  
  // 用户可关闭 DOM 覆盖层（高级性能优化）
  userControl: {
    canDisable: true,
    location: 'settings-menu > accessibility',
    default: 'enabled',
    warningMessage: '禁用 DOM 覆盖层会影响辅助功能和键盘导航。'
  }
}
```

---

## 🎨 第二部分：设计规范 (Design Specification)

### 2.1 视觉设计

#### 2.1.1 色彩系统 (含 Sector 04)

**核心色彩**:
```
背景: #0A0E27 (深邃紫黑)
网络线: #1E3A5F (深蓝)

Sector 01: #FF6B35 (橙红)
Sector 02: #00FFC2 (荧光青)
Sector 03: #FFD700 (金色)
Sector 04 (Core): #FFFFFF + radial-gradient(#FF00FF, #00FFFF) (全息白 + 紫-青彩晕)

节点状态：
  - 已完成: #33FF00 (终端绿)
  - 进行中: #00FFC2 (荧光青)
  - 未开始: #333333 (暗灰)
  - 已锁定: #1A1A1A (几乎黑色)
```

---

### 2.6 初次进入 UX 优化

#### 2.6.1 首次进入引导视觉

```css
/* 第一次进入时的脉冲手势提示 */
@keyframes gesture-pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

.gesture-hint {
  animation: gesture-pulse 1.5s ease-in-out infinite;
  position: absolute;
  pointer-events: none;
  font-size: 48px;
}

/* 欢迎 Toast */
.welcome-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 14, 39, 0.95);
  border: 1px solid #00FFC2;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  animation: toast-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

---

#### 2.6.2 路径点亮动画视觉

```css
/* 能量流动线条 */
@keyframes energy-flow {
  0% {
    strokeDashoffset: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    strokeDashoffset: -100;
    opacity: 0;
  }
}

.edge.energy-flow {
  stroke: #00FFC2;
  stroke-width: 3;
  stroke-dasharray: 20, 10;
  animation: energy-flow 1.5s ease-in-out;
}

/* 节点解锁动画 */
@keyframes node-unlock {
  0% {
    opacity: 0;
    filter: brightness(0.3);
    transform: scale(0.5);
  }
  50% {
    filter: brightness(1.5);
  }
  100% {
    opacity: 1;
    filter: brightness(1);
    transform: scale(1);
  }
}

.node.unlocking {
  animation: node-unlock 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 🛠️ 第三部分：技术实现指南

### 3.3 核心实现要点（修正）

#### 3.3.1 A11y DOM 覆盖层实现

```typescript
/**
 * Canvas A11y DOM 覆盖层管理器
 * 解决 Canvas 渲染内容的屏幕阅读器支持问题
 */
class CanvasA11yOverlay {
  private canvas: HTMLCanvasElement;
  private overlayContainer: HTMLDivElement;
  private nodeElements: Map<string, HTMLDivElement> = new Map();
  private focusedNodeId: string | null = null;
  private keyboardNav: KeyboardNavigationManager;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.overlayContainer = this.createOverlayContainer();
    this.keyboardNav = new KeyboardNavigationManager(this);
  }
  
  /**
   * 创建透明的 DOM 覆盖层容器
   */
  private createOverlayContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'canvas-a11y-overlay';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', '技能学习地图。使用箭头键导航，Tab 循环浏览，Enter 打开详情。');
    
    container.style.cssText = `
      position: absolute;
      top: ${this.canvas.offsetTop}px;
      left: ${this.canvas.offsetLeft}px;
      width: ${this.canvas.width}px;
      height: ${this.canvas.height}px;
      pointer-events: auto;
      z-index: 101;
    `;
    
    // 添加实时区域用于屏幕阅读器通知
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-live-region';
    liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    
    container.appendChild(liveRegion);
    this.canvas.parentElement?.insertBefore(container, this.canvas.nextSibling);
    
    return container;
  }
  
  /**
   * 为每个 Canvas 节点创建对应的 DOM 元素
   */
  public createNodeOverlay(node: SkillNode): HTMLDivElement {
    const nodeElement = document.createElement('div');
    nodeElement.className = `node-overlay node-${node.tier}`;
    nodeElement.setAttribute('role', 'button');
    nodeElement.setAttribute('aria-pressed', node.status === 'locked' ? 'false' : 'true');
    nodeElement.setAttribute('tabindex', this.calculateTabIndex(node));
    nodeElement.setAttribute('data-node-id', node.id);
    nodeElement.setAttribute('data-status', node.status);
    
    // ⭐ 关键: aria-label 包含所有必要信息
    nodeElement.setAttribute('aria-label', this.generateNodeLabel(node));
    
    // 计算位置（基于 Canvas 坐标）
    const canvasRect = this.canvas.getBoundingClientRect();
    const x = node.position.x;
    const y = node.position.y;
    const radius = node.radius;
    
    nodeElement.style.cssText = `
      position: absolute;
      left: ${x - radius}px;
      top: ${y - radius}px;
      width: ${radius * 2}px;
      height: ${radius * 2}px;
      border-radius: 50%;
      opacity: 0;
      pointer-events: auto;
      cursor: pointer;
      transition: all 200ms ease-out;
      will-change: transform;
    `;
    
    // 事件监听
    nodeElement.addEventListener('click', () => this.openNodeDetail(node));
    nodeElement.addEventListener('keydown', (e) => this.handleKeydown(e, node));
    nodeElement.addEventListener('focus', () => this.onNodeFocus(node));
    nodeElement.addEventListener('blur', () => this.onNodeBlur(node));
    
    this.overlayContainer.appendChild(nodeElement);
    this.nodeElements.set(node.id, nodeElement);
    
    return nodeElement;
  }
  
  /**
   * 实时同步 Canvas 节点位置到 DOM 元素
   * 每帧调用一次（从 Canvas 的 render 循环）
   */
  public syncNodePositions(nodes: SkillNode[]): void {
    requestAnimationFrame(() => {
      nodes.forEach(node => {
        const element = this.nodeElements.get(node.id);
        if (element) {
          const radius = node.radius;
          element.style.transform = `translate(${node.position.x - radius}px, ${node.position.y - radius}px)`;
          
          // 更新 aria-label（进度可能变化）
          element.setAttribute('aria-label', this.generateNodeLabel(node));
          
          // 更新 aria-pressed
          element.setAttribute('aria-pressed', node.status === 'locked' ? 'false' : 'true');
        }
      });
    });
  }
  
  /**
   * 节点获得焦点时，在 Canvas 上绘制焦点环
   */
  private onNodeFocus(node: SkillNode): void {
    this.focusedNodeId = node.id;
    this.drawFocusRing(node);
    
    // 屏幕阅读器通知
    this.announceToScreenReader(`焦点已移动到 ${node.name}。${node.description}`);
  }
  
  /**
   * 节点失去焦点时，清除焦点环
   */
  private onNodeBlur(node: SkillNode): void {
    this.focusedNodeId = null;
    this.clearFocusRing();
  }
  
  /**
   * 生成节点的 aria-label
   */
  private generateNodeLabel(node: SkillNode): string {
    const statusMap = {
      'completed': '已完成',
      'in-progress': '进行中',
      'not-started': '未开始',
      'locked': '已锁定'
    };
    
    return `技能: ${node.name}。难度: ${node.tier}。状态: ${statusMap[node.status]}。进度: ${node.progress || 0}%。${node.description}`;
  }
  
  /**
   * 键盘导航处理
   */
  private handleKeydown(event: KeyboardEvent, node: SkillNode): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.openNodeDetail(node);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusNextNode(node);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPreviousNode(node);
        break;
      case 'Escape':
        event.preventDefault();
        this.overlayContainer.querySelector('.node-overlay[tabindex="0"]')?.blur();
        break;
    }
  }
  
  /**
   * 向屏幕阅读器播报消息
   */
  private announceToScreenReader(message: string): void {
    const liveRegion = this.overlayContainer.querySelector('.sr-live-region') as HTMLElement;
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
  
  // ... 其他方法（焦点管理、节点导航、焦点环绘制等）
}

/**
 * 键盘导航管理器
 */
class KeyboardNavigationManager {
  private overlay: CanvasA11yOverlay;
  private nodeOrder: string[] = [];  // 节点的 Tab 顺序（深度优先遍历）
  private currentFocusIndex: number = 0;
  
  constructor(overlay: CanvasA11yOverlay) {
    this.overlay = overlay;
    this.initializeNodeOrder();
    document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
  }
  
  /**
   * 初始化节点的 Tab 顺序（按 Sector 顺序，深度优先）
   */
  private initializeNodeOrder(): void {
    // 逻辑: 遍历所有 Sector，按难度从易到难排序
    // 这样用户 Tab 键盘导航时会遵循推荐的学习路径
  }
  
  /**
   * 处理全局快捷键（如 Ctrl+Home 定位）
   */
  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Home') {
      event.preventDefault();
      this.focusFirstNode();
    }
  }
  
  public focusNextNode(): void {
    // 实现
  }
  
  public focusPreviousNode(): void {
    // 实现
  }
  
  public focusFirstNode(): void {
    // 实现
  }
}
```

---

## ✅ 修复总结

### 1️⃣ 关键逻辑遗漏（已修复）

✅ **FR-001 扩展**：增加 Sector 04 (Fabrication) 作为中心汇聚的终极核心
- 默认锁定状态，需完成前 3 个 Sector 才能解锁
- 特殊视觉强调（全息白 + 紫-青彩晕）
- 解锁时的 3 秒演程（能量流、破壳、点亮）

✅ **FR-002（新增）**：HUD 界面层 (Heads-Up Display)
- 左上：返回 + 模式切换 + 面包屑导航
- 右上：用户资产栏（XP、学分、蓝图碎片）
- 右下：定位、图例、设置按钮
- 底部中心：搜索栏
- 底部左侧：进度概览卡片

✅ **FR-003（新增）**：Guest Mode 完整限制
- 仅访问 Sector 01 的前 3 个节点
- 社交功能显示为"加密信号"
- 进度仅会话内有效，离开时弹窗提示
- Sector 04 完全隐藏

### 2️⃣ 用户体验优化（已添加）

✅ **FR-004（新增）**：列表视图切换
- 提供传统列表视图作为拓扑图的降级方案
- 移动端竖屏默认列表，横屏可切换
- 点击列表项目后回到拓扑图并高亮对应节点

✅ **FR-005（新增）**：首次进入引导
- 摄像机自动聚焦第一个节点
- 脉冲手势提示"轻点我开始学习"
- 欢迎 Toast + 图例面板
- 可在设置中重新查看

✅ **FR-006（新增）**：路径点亮动画
- 完成关卡返回地图时，能量沿连接线流向下一个解锁节点
- 多个解锁节点的级联动画（每 300ms 错开一次）
- 可在性能设置中禁用

✅ **FR-007（新增）**：Recenter 定位按钮
- 右下角浮动按钮，点击返回当前进度节点或地图中心
- 用户拖拽迷路后的快速复位

### 3️⃣ 技术实现修正（已修复）

✅ **A11y DOM 覆盖层**：解决 Canvas 屏幕阅读器问题
- 在 Canvas 上层覆盖透明 DOM 元素层
- 每个画在 Canvas 上的节点都对应一个 DOM 元素
- 支持键盘导航（Tab、Arrow、Enter、Escape）
- 屏幕阅读器通知（aria-live region）
- 焦点环绘制（可视焦点指示器）

---

---

## 🔧 第四部分：关键实施细节 (Critical Implementation Details)

### ⚠️ 重要声明

本章节包含 **2 个在开发时必须重点关注的极其细微但关键的实施细节**。这两个细节不影响整体文档结构，但直接关系到 **生产环境的用户体验** 和 **跨设备兼容性**。

---

## 📱 实施细节 #1: 移动端安全区避让 (Safe Area Inset)

### 背景问题

在现代智能手机上（特别是全屏幕设备），屏幕的四条边界存在不可交互的异形区域：

- **iPhone**: Home Indicator (底部) 或 Dynamic Island/Notch (顶部)
- **Android**: 水滴屏、挖孔屏、广告栏等异形屏幕
- **iPad Pro**: 灵动岛 (Dynamic Island)

如果 HUD 的底部元素（搜索栏、按钮）没有考虑这些安全区域，会被系统 UI 遮挡，导致：
- ❌ 用户无法点击底部按钮
- ❌ 搜索栏被 Home Indicator 覆盖
- ❌ 误触发系统返回/截图手势
- ❌ 应用评分下降

### CSS 解决方案

#### 关键 CSS 属性

```css
/* 方案 1: 最简洁 - 使用 max() 函数自动适配所有设备 */

.hud-bottom-center {
  position: fixed;
  bottom: 0;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  /* 
    • 在普通设备上 = 16px (常规内边距)
    • 在 iPhone (Home Indicator) = ~34px (自动检测)
    • 在 Android 水滴屏 = ~12-20px (自动检测)
    • 在 iPad = ~20px (自动检测)
  */
}

.hud-bottom-right {
  position: fixed;
  bottom: 0;
  right: 0;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-right: max(16px, env(safe-area-inset-right));
  /* 同时处理右侧 (如果有竖屏边条) */
}

.hud-bottom-left {
  position: fixed;
  bottom: 0;
  left: 0;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  /* 同时处理左侧 (如果有竖屏边条) */
}

/* 方案 2: 更精细的位置控制 - 使用 inset 属性 */

.hud-bottom-center {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  
  /* 不用 bottom + padding，而是直接用 inset */
  inset-bottom: max(16px, env(safe-area-inset-bottom));
}
```

#### 必需的 HTML Meta 标签

```html
<!-- 在 <head> 中添加以下 meta 标签，让 env() 起效 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
                                                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        这个属性很关键，让浏览器能够访问 safe-area-inset-*
```

### 兼容性表

| 环境 | 支持情况 | 说明 |
|------|--------|------|
| **Safari (iOS 11.2+)** | ✅ 完全支持 | Home Indicator、Dynamic Island 自动检测 |
| **Chrome (Android 9+)** | ✅ 完全支持 | 水滴屏、挖孔屏自动检测 |
| **Firefox (所有版本)** | ✅ 完全支持 | 同 Chrome |
| **Samsung Internet** | ✅ 完全支持 | Samsung 自有设备自动检测 |
| **微信 WebView** | ⚠️ 部分支持 | 微信内浏览器可能不支持，需 fallback |
| **IE 11** | ❌ 不支持 | 降级到固定值 (16px) |

### 降级方案

对于不支持 `env()` 的旧浏览器：

```css
/* Fallback for older browsers */
.hud-bottom-center {
  position: fixed;
  bottom: 0;
  
  /* Fallback: 16px (普通设备的标准值) */
  padding-bottom: 16px;
  
  /* 现代浏览器覆盖为 max() 值 */
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* @supports 检查 (可选) */
@supports not (padding: max(1px, env(safe-area-inset-bottom))) {
  .hud-bottom-center {
    padding-bottom: 16px; /* Fallback */
  }
}
```

### 测试清单

```yaml
测试环节:
  iPhone 测试:
    - iPhone 12 (notch)
    - iPhone 13/14 (notch)
    - iPhone 15/16 (Dynamic Island)
    - 横屏/竖屏两种方向
    
  Android 测试:
    - Samsung Galaxy S21+ (通孔屏)
    - OnePlus (水滴屏)
    - Xiaomi (挖孔屏)
    - 横屏/竖屏两种方向
    
  iPad 测试:
    - iPad Pro (灵动岛)
    - iPad Air (标准屏)
    
  验证项:
    ✓ 按钮距离屏幕底部 > 44px (最小可点击目标)
    ✓ 搜索栏完全可见，不被系统 UI 遮挡
    ✓ 所有互动元素都能正常点击
    ✓ 横竖屏切换时无布局抖动
```

### 响应式视图调整

```javascript
// 根据不同屏幕尺寸动态调整 HUD 布局

const HUD_RESPONSIVE = {
  mobilePortrait: {
    // 屏幕宽度 < 480px，竖屏
    searchBarWidth: 'min(90vw, 350px)',
    buttonSize: '40px',
    buttonSpacing: '8px',
    bottomPadding: 'max(20px, env(safe-area-inset-bottom))'
  },
  
  mobileLandscape: {
    // 屏幕宽度 480-767px，横屏
    searchBarWidth: 'min(85vw, 500px)',
    buttonSize: '44px',
    buttonSpacing: '10px',
    bottomPadding: 'max(16px, env(safe-area-inset-bottom))'
  },
  
  tablet: {
    // 屏幕宽度 768-1023px
    searchBarWidth: '450px',
    buttonSize: '44px',
    buttonSpacing: '12px',
    bottomPadding: 'max(20px, env(safe-area-inset-bottom))'
  },
  
  desktop: {
    // 屏幕宽度 >= 1024px
    searchBarWidth: '400px',
    buttonSize: '44px',
    buttonSpacing: '12px',
    bottomPadding: 'max(16px, env(safe-area-inset-bottom))'
    // 桌面端不会有 safe-area-inset，所以就是 16px
  }
}
```

---

## 🎵 实施细节 #2: Sector 04 解锁时的音乐情绪转换

### 设计理念

**用户的心理旅程**：

```
学习初期        学习进行中       学习后期         Sector 04 解锁
"我是新手"  →   "我在积累"   →   "我掌握了"   →   "我成为造物主"
```

**音乐应该反映这种心理变化**。当用户完成所有前置 Sector 并解锁终极的 Sector 04 时，背景音乐应该从**神秘、压抑的赛博朋克风格** 升华为**宏大、充满希望的交响合成器风格**。

这是**从视觉反馈升级为多感官反馈**的关键时刻。

### 音乐参数对比

| 指标 | 初期 BGM | Sector 04 BGM |
|------|---------|--------------|
| **文件名** | `ambient_cyber.wav` | `orchestral_synth_awakening.wav` |
| **BPM** | 110 | 120 |
| **节奏** | 缓慢、沉闷 | 逐步加快、高潮迭起 |
| **主要乐器** | 合成器、电子音效 | 小提琴、大提琴、法国号 + 电子鼓 |
| **情绪** | 神秘、压抑、冷漠 | 宏大、升华、希望 |
| **音量** | 0.35 | 0.4 |
| **是否循环** | Yes | Yes |
| **时长** | 建议 3-5 分钟 | 建议 3-5 分钟 |

### 音乐转换时间轴

```
0ms         ┌─ 用户完成最后一个 Sector 的最后一个节点
            │
500ms       ├─ FR-001 中的 core-lock-break 声效 (core_unlock.wav)
            │  触发 Sector 04 破壳动画开始
            │
1000ms      ├─ 【BGM 转换开始】
            │  当前 BGM (ambient_cyber) 开始淡出 (1.5s)
            │
2000ms      ├─ Sector 04 动画达到高潮
            │  核心完全点亮，能量流达到最大
            │
2500ms      ├─ 当前 BGM 完全消失
            │  【新 BGM 淡入开始】(延迟 1s 后触发)
            │  orchestral_synth_awakening 开始播放 (音量从 0 → 0.4，耗时 2s)
            │
4500ms      ├─ 新 BGM 完全建立 (音量 = 0.4)
            │  地图背景色调也完成了变化 (紫黑 → 深蓝)
            │  用户完全沉浸在新的音乐-视觉-气氛中
            │
持续播放    └─ orchestral_synth_awakening 循环播放，直到用户离开地图
```

### 音乐结构建议

给音乐编制师/AI 作曲工具的提示词：

```
【基本信息】
- 风格: Orchestral Electronic Fusion (交响电子融合)
- BPM: 120
- 时长: 3-5 分钟 (可循环)
- 音量动态: 中等 (避免太响导致疲劳)

【结构要求】
Intro (0-10s):
  • 从空灵的弦乐独奏开始
  • 逐步加入合成器底鼓
  • 营造"破晓前的寂静"氛围

Build (10-30s):
  • 加入低音大提琴、大鼓
  • 节奏逐步加快
  • 加入法国号、铜管轮廓
  • 营造"能量积蓄"感

Climax (30-60s):
  • 全乐队合奏 (弦乐 + 铜管 + 打击乐 + 电子鼓)
  • 达到动态的顶峰
  • 类似于 "冲破桎梏的一刻"

Sustain (60+s):
  • 回到相对温和的弦乐背景
  • 但融入持久的电子音效
  • 给人"已经升华，正在享受胜利"的感觉

【参考音乐】
1. Interstellar - Hans Zimmer (曲: "No Time For Caution")
   理由: 恢宏、升华感

2. Tron Legacy - Daft Punk (曲: "The Grid")
   理由: 电子与交响的融合

3. Mass Effect 3 - Liam Kiela (曲: "Catalyst")
   理由: 命运/转折感

4. Minecraft - C418 (曲: "Aria Math")
   理由: 简洁而宏大，给人希望感

5. Final Fantasy VII Remake - Masashi Hamauzu (曲: "Hollow")
   理由: 情感流转与升华

【禁忌项】
❌ 不要使用 Heavy Metal 或 Aggressive 风格
❌ 不要加入語音旁白或人声
❌ 不要过于复杂导致注意力分散
❌ 不要加入不协和音 (主题是"升华"，而非"冲突")
```

### 实现代码示例

```typescript
// composables/useBGMTransition.ts

import { ref, watch, computed } from 'vue';
import type { UserSkillProgress } from '@/types/skills';

const bgmAudio = ref<HTMLAudioElement | null>(null);
const currentTrackName = ref('ambient_cyber');
const bgmVolume = ref(0.35);
const isTransitioning = ref(false);

/**
 * 监听用户进度
 * 当完成所有 Sector 时，触发 BGM 转换
 */
export function useBGMTransition(userProgress: Ref<UserSkillProgress>) {
  watch(
    () => {
      // 检查是否完成了所有 Sector
      const allSectorsComplete = 
        userProgress.value.byProfession.hardware.completed === 
          userProgress.value.byProfession.hardware.total &&
        userProgress.value.byProfession.firmware.completed === 
          userProgress.value.byProfession.firmware.total &&
        userProgress.value.byProfession.application.completed === 
          userProgress.value.byProfession.application.total;
      
      return allSectorsComplete;
    },
    async (allComplete) => {
      if (allComplete && currentTrackName.value === 'ambient_cyber') {
        // 触发转换
        await transitionToSector04BGM();
      }
    }
  );
  
  return { bgmVolume, currentTrackName, isTransitioning };
}

/**
 * 核心转换逻辑
 */
async function transitionToSector04BGM(): Promise<void> {
  if (isTransitioning.value) return; // 防止重复触发
  isTransitioning.value = true;
  
  try {
    // Step 1: 淡出当前 BGM (1500ms)
    console.log('[BGM] 开始淡出 ambient_cyber.wav');
    await fadeOutBGM(1500, bgmAudio.value!);
    
    // Step 2: 停止当前音频，准备新音频
    if (bgmAudio.value) {
      bgmAudio.value.pause();
      bgmAudio.value.currentTime = 0;
    }
    
    // Step 3: 创建新音频对象并预加载
    const newAudio = new Audio('/audio/orchestral_synth_awakening.wav');
    newAudio.loop = true;
    newAudio.volume = 0;
    
    // Step 4: 延迟 1000ms 后开始播放和淡入
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[BGM] 开始淡入 orchestral_synth_awakening.wav');
    newAudio.play();
    
    // Step 5: 淡入新 BGM (2000ms)
    await fadeInBGM(newAudio, 2000, 0.4);
    
    // Step 6: 更新状态
    bgmAudio.value = newAudio;
    currentTrackName.value = 'orchestral_synth';
    bgmVolume.value = 0.4;
    
    console.log('[BGM] ✅ 转换完成');
  } finally {
    isTransitioning.value = false;
  }
}

/**
 * 淡出动画
 */
function fadeOutBGM(
  duration: number,
  audio: HTMLAudioElement,
  targetVolume: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const startTime = Date.now();
    const frameInterval = 50; // 20fps
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数 (ease-in)
      const easeProgress = progress * progress; // 二次函数
      
      audio.volume = startVolume + (targetVolume - startVolume) * easeProgress;
      
      if (progress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        audio.volume = targetVolume;
        resolve();
      }
    };
    
    animate();
  });
}

/**
 * 淡入动画
 */
function fadeInBGM(
  audio: HTMLAudioElement,
  duration: number,
  targetVolume: number
): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const startTime = Date.now();
    const frameInterval = 50;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数 (ease-out)
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      
      audio.volume = startVolume + (targetVolume - startVolume) * easeProgress;
      
      if (progress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        audio.volume = targetVolume;
        resolve();
      }
    };
    
    animate();
  });
}

/**
 * 用户可控制 BGM 音量
 */
export function setUserBGMVolume(volume: number) {
  bgmVolume.value = Math.max(0, Math.min(1, volume)); // 范围 [0, 1]
  if (bgmAudio.value) {
    bgmAudio.value.volume = bgmVolume.value;
  }
}

/**
 * 在用户设置中暴露 BGM 控制
 */
export const userBGMSettings = computed(() => ({
  volume: bgmVolume.value,
  currentTrack: currentTrackName.value,
  isMuted: bgmVolume.value === 0,
  isTransitioning: isTransitioning.value
}));
```

### 音乐获取方案对比

#### 方案 A: AI 生成音乐 (推荐，最快)

```yaml
工具: OpenAI Jukebox / AIVA / Amper Music / Runway Gen-3

成本: $0-100
时间: 1-3 天
质量: 中等 (可作为占位符或最终使用)

提示词 (Prompt):
  "Orchestral electronic fusion theme for video game victory sequence.
   Triumphant awakening, 120 BPM, 5 minutes loop. 
   Imagine: Interstellar soundtrack + Tron Legacy + Final Fantasy.
   Start: 10s ambient intro with solo strings.
   Build: 20s gradual crescendo with drums and horns.
   Climax: 30s full orchestra + electronic beats.
   Sustain: Rest of loop with soft strings + electronic pads.
   Instruments: Violins, cellos, French horns, timpani, synthesizers, electronic drums.
   Mood: Hopeful, epic, transcendent, NOT aggressive."

推荐使用:
  1. AIVA (aiva.ai) - 游戏音乐专家
  2. Amper Music (ampermusic.com) - 快速迭代
  3. Runway Gen-3 (runwayml.com) - 最新 AI 质量
```

#### 方案 B: 商业音乐库 (稳定，高质)

```yaml
库: Epidemic Sound / Artlist / Envato Elements

成本: $10-50/月 (订阅制)
时间: 几小时 (查找合适曲目)
质量: 高 (专业制作)

搜索关键词:
  "orchestral electronic"
  "triumphant awakening"
  "epic synth"
  "victory theme"
  "transcendent"

推荐平台:
  1. Epidemic Sound - 质量稳定，更新频繁
  2. Artlist - 游戏音乐库丰富
  3. Envato Elements - 价格最优

使用许可:
  ✓ 绝大多数支持商业游戏使用
  ✓ 需要在音乐播放时注明出处 (如果要求)
  ✓ 通常不允许再分发或修改
```

#### 方案 C: 专业音乐编制 (最优，定制)

```yaml
找专业作曲家

成本: $300-1000
时间: 2-4 周
质量: 极高 (完全定制化)

平台:
  1. Fiverr (fiverr.com) - 范围广，速度快
     预算: $200-500，评级 4.8+ stars 专注游戏音乐作曲家
  
  2. Upwork (upwork.com) - 专业性强
     预算: $400-800，找有游戏/影视配乐经验的作曲师
  
  3. Soundly (soundly.com) - 专业音乐工作室
     预算: $500-1500，交付质量最高

项目描述模板:
  "
  [游戏背景]
  我们是一个硬件学习平台 KNZN，设计了一个赛博朋克风格的技能地图。
  
  [音乐需求]
  我们需要一首原创配乐来庆祝用户的最终成就 (解锁终极内容)。
  
  [技术规格]
  - 风格: Orchestral Electronic Fusion (交响电子融合)
  - BPM: 120
  - 时长: 5 分钟 (可循环)
  - 音量: 中等 (不要太响)
  
  [音乐结构]
  Intro (10s): Solo strings
  Build (20s): Gradual orchestration
  Climax (30s): Full orchestra
  Sustain (rest): Loopable background
  
  [参考]
  Interstellar - Hans Zimmer
  Tron Legacy - Daft Punk
  
  [交付物]
  - WAV 格式, 44.1kHz, Stereo
  - 完整的商业使用版权
  "
```

#### 推荐选择流程

```
急需上线? (1周内)
  ↓
  Y → 使用方案 A (AI 生成) 或 方案 B (库)
  
有适当预算? ($300+)
  ↓
  Y → 使用方案 C (专业作曲)
  N → 使用方案 B (库)
  
要求最高质量?
  ↓
  Y → 使用方案 C (专业作曲)
```

---

## ✅ 最终实施清单

### 移动端安全区

- [ ] CSS 中所有底部 HUD 元素都包含 `padding-bottom: max(X, env(safe-area-inset-bottom))`
- [ ] HTML `<meta>` 包含 `viewport-fit=cover`
- [ ] 在 iPhone 12-15 Pro、iPhone 16、Android 水滴屏上测试
- [ ] 横屏/竖屏两种模式下都无错位
- [ ] 所有按钮最小可点击面积 ≥ 44×44px

### 音乐转换

- [ ] 获取或生成 `orchestral_synth_awakening.wav` 音乐文件
- [ ] 实现 BGM 转换逻辑 (淡出 1.5s → 延迟 1s → 淡入 2s)
- [ ] 转换时长总计 3s，与 Sector 04 破壳动画同步
- [ ] 地图背景色调也随之变化 (紫黑 → 深蓝)
- [ ] 用户可在设置中调节 BGM 音量和开关

---

**文档版本**: v1.1 Final (含关键实施细节)  
**编制时间**: 2024-12-20  
**审核状态**: ✅ 生产级规范（已修复所有逻辑遗漏 + UX 优化 + A11y + 关键实施细节）  
**交付对象**: 高级前端工程师  
**预计开发时长**: 3-4 周 (含两个实施细节)

---