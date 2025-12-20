# 🏠 KNZN 首页 - 接入终端 (The Access Terminal) 完整设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 首页 (The Access Terminal)  
**路由**: `/` 或 `/home`  
**用户状态**: 游客 / 已登录均可访问  
**文档版本**: v1.3.1 (性能优化完整版)  
**最后更新**: 2024-12-20  
**审核状态**: ✅ 可交付高级工程师进行开发  
**文档类型**: 生产级设计规范（零歧义）

---

## 🎯 第一部分：产品需求文档 (PRD)

### 1.1 首页定位与价值主张

#### 核心定位
首页是用户的**第一关**。不采用传统 Landing Page（头图+功能列表）的设计方式，而是直接展现一个**沉浸式互动装置**，通过仪式化的"通电"过程完成用户身份转换：从"游客"→ "KNZN 神经网络接入者"。

#### 设计哲学
- **零门槛上手**: 无需任何说明，点击开关 → 灯亮了 → 瞬间建立电路认知
- **即时满足感**: 300ms 内给予反馈，1500ms 内完成整个"通电仪式"
- **沉浸式体验**: 赛博朋克视觉 + 电影级音效 + 物理级交互手感
- **商业转化**: Guest Mode 无需注册即可体验，通关后引导注册转化

---

### 1.2 核心功能需求 (Functional Requirements)

#### FR-001: 全局状态管理 ✅ 状态持久化版

**描述**: 页面加载时根据用户连接状态显示相应视觉呈现

**初始化流程**:
```javascript
// ⭐ 状态持久化检查逻辑
function initializePageState() {
  // Step 1: 检查用户连接状态
  const isConnected = checkConnectionStatus();
  // 查询来源: 
  //   - sessionStorage['knzn_connection_state']
  //   - Vue Store (Pinia): userStore.isConnected
  //   - 已登录用户: 自动 true
  //   - 游客用户: 通过 token 追踪
  
  if (isConnected === true) {
    // Step 2a: 用户已接入 → 直接显示通电状态 ✨
    renderConnectedState();
    // 效果: 闸刀在底部，菜单可见，氛围光开启
    // 跳过拖拽交互
  } else {
    // Step 2b: 用户未接入 → 显示断电状态
    renderDisconnectedState();
    // 效果: 闸刀在顶部，菜单隐藏，仅显示闪烁文案
    // 等待用户拖拽
  }
}

// 状态检查的关键判定条件
const CONNECTION_STATE = {
  sessionKey: 'knzn_connection_state', // 本次会话连接状态
  timestamp: 'knzn_connection_time',   // 连接时间戳
  ttl: 86400 * 7,                      // 7 天有效期（防止过期session）
};
```

**断电状态** (当 isConnected === false):
- 背景色: 深邃黑 `#050505`
- 显示: 闸刀开关、Logo 轮廓、闪烁文案
- 隐藏: 菜单、CTA 按钮、氛围光、页脚

**通电状态** (当 isConnected === true):
- 文案: `> SYSTEM_ONLINE. WELCOME BACK.`
- 颜色: 荧光青 `#00FFC2`（表示已接通）
- 闸刀: 已在底部 (translateY: 100px)
- 菜单: 已显示 (opacity: 1)
- 氛围光: 已开启

---

#### FR-002: 闸刀交互机制 ✅ 完整版

**触发方式**:
- 仅在断电状态激活（已连接时拖拽无效）
- 桌面端: 向下拖拽鼠标 (Y 轴)
- 移动端: 双指按住两端下拉

**拖拽参数**:
```javascript
const DRAG_CONFIG = {
  direction: 'vertical',
  minDistance: 80,              // 最小拖拽距离 (px)
  maxDistance: 100,             // 最大拖拽距离
  friction: 0.92,               // 阻尼系数
  bounceEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  dragBounds: { min: 0, max: 100 },
  
  // ⭐ 快速连续拖拽检测（彩蛋触发）
  fidgetDetection: {
    maxRepeatCount: 3,           // 1秒内往复 3 次触发彩蛋
    timeWindow: 1000,            // 时间窗口 (ms)
    minDistanceForRepeat: 50,    // 每次拖拽至少 50px
  }
}
```

**拖拽结果**:
```
IF 拖拽距离 < 80px:
  → 闸刀弹回原位置 (300ms)
  → 播放回弹音效 (spring_back.wav)
  
ELSE IF 拖拽距离 >= 80px:
  → 闸刀锁定在底部 (y=100px)
  → 播放锁定音效 (switch_lock.wav)
  → 触发通电仪式流程
  → 设置 sessionStorage 连接状态
  
⭐ ELSE IF 快速往复拖拽 3 次 (1s内):
  → 触发"短路"彩蛋
  → 播放 short_circuit_buzz.wav
  → 显示 Glitch 干扰波纹
```

---

#### FR-003: 通电仪式流程 (Initialization Ritual) ✅ 超时兜底版

**超时保护机制**:
```javascript
const RITUAL_TIMEOUT_CONFIG = {
  maxWaitTime: 2000,           // 最多等待 2 秒
  checkInterval: 100,          // 每 100ms 检查一次加载状态
  
  onTimeout: () => {
    // 降级处理: 禁用 3D，改用 2D
    FEATURE_FLAGS.use3DModel = false;
    FEATURE_FLAGS.particleEffects = false;
    
    // 强制启动仪式，保证流程不中断
    forceProceedWithRitual();
  }
};
```

**完整时间轴**:

```
0ms: 用户完成拖拽 (闸刀位置 >= 80px)
  → 闸刀锁定
  → 设置 sessionStorage 连接状态
  
0-200ms: 黑屏死寂 + 超时保护
  → 等待核心包加载
  → 若 > 2000ms 未加载，强制继续
  
200ms: 锁定音效 (Lock Engagement)
  → 播放 switch_lock.wav (沉闷金属声)
  → 闸刀周围能量爆发效果
  
200ms: 电流启动 (Current Awakening)
  → 播放 current-hum.wav (电流嗡鸣)
  → 音量渐起: 0 → 0.6 (800ms内)
  
400ms: Logo 点亮 (Logo Ignition)
  → Logo 颜色: #333333 → #00FFC2
  → Glitch 故障效果 (0.5s, 5 steps)
  
800ms: 菜单按钮逐个点亮 (Menu Cascade)
  → 按钮依次淡入 + 滑入
  → 间隔 100ms
  → 播放 ui_light_on.wav × N
  
1200ms: 背景氛围光渐入 (Ambient Bloom)
  → 径向渐变光晕扩散
  → 持续 2 秒
  
1500ms: CTA 按钮显示 (Call-to-Action)
  → 弹出动画 (scale: 0.8 → 1)
```

---

#### FR-004: Guest Mode (游客模式) ✅ 音频解锁版

**音频上下文解锁策略**:
```javascript
// ⭐ 现代浏览器音频播放限制
// 必须在用户交互中触发 AudioContext.resume()

// 在拖拽开始时（pointerdown）解锁音频播放权限
switchElement.addEventListener('pointerdown', async (e) => {
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      sessionStorage.setItem('audio_context_unlocked', 'true');
    } catch (err) {
      console.warn('AudioContext resume failed:', err);
      // 降级: 禁用音效
      AUDIO_CONFIG.disabled = true;
    }
  }
  
  // 继续拖拽逻辑
  startDrag(e);
});
```

**实现机制**:
```javascript
const guestToken = generateGuestToken(); // UUID v4
sessionStorage.setItem('guest_token', guestToken);
sessionStorage.setItem('knzn_connection_state', 'true');

// 数据持久化
localStorage.setItem('guestProgress_' + guestToken, JSON.stringify({
  sector: 1,
  level: 1,
  completedAt: timestamp,
  circuitState: {...},
  stars: 1
}));
```

---

#### FR-005: 不稳定接触彩蛋 (The "Fidget" Easter Egg) ⭐ 创意增强

**触发条件**:
```javascript
// 在 1 秒内快速往复拖拽 3 次（各 >= 50px，最终 < 80px）
const FIDGET_CONFIG = {
  maxRepeatCount: 3,
  timeWindow: 1000,
  minDistancePerRepeat: 50,
  maxOffsetToTrigger: 60,  // 未完成锁定
};
```

**触发效果**:

| 元素 | 效果 | 持续时间 |
|------|------|---------|
| 音效 | short_circuit_buzz.wav (短路滋滋声) | 400ms |
| 视觉 | Glitch 干扰波纹扫过屏幕 | 400ms |
| 文案 | "⚠️ WARNING: SYSTEM INSTABILITY DETECTED" | 500ms |
| 闸刀 | 微弱抖动反馈 | 200ms |
| 触觉 | navigator.vibrate([50, 100, 50]) | - |

**设计理由**:
- 增强物理装置的真实感
- 符合赛博朋克审美（不完美、有噪音的系统）
- 提升交互趣味性（类似 Fidget Spinner）
- 给予失败的拖拽也有视觉反馈

---

### 1.3 非功能需求 (Non-Functional Requirements)

#### NFR-001: 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首屏加载时间 (LCP) | < 1.5s | 闸刀可交互 |
| 可交互时间 (TTI) | < 2.0s | 页面完全可交互 |
| 拖拽响应延迟 | < 16ms | 60fps 流畅度 |
| 通电仪式流畅度 | 60fps | 无卡顿 |
| 音效播放延迟 | < 50ms | 感知不到延迟 |
| 移动端拖拽帧率 | ≥ 30fps | 避免掉帧 |
| 音频上下文解锁 | < 100ms | 200ms 时播放就绪 |
| 超时保护激活 | 2000ms | 核心包加载超时 |

**优化策略**:
- 首页仅加载 HTML + CSS (< 200KB)
- 3D 库延迟加载到关卡
- 使用 `will-change: transform` 优化拖拽
- 避免 `filter: drop-shadow`，改用 `box-shadow`
- 移动端禁用粒子特效（降低 50%）
- **⭐ Fidget 检测使用节流或 requestAnimationFrame 避免 JS 阻塞**

#### NFR-002: 浏览器兼容性

| 浏览器 | 最低版本 | 支持 |
|--------|---------|------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 14+ | ✅ |
| Edge | 90+ | ✅ |
| IE 11 | - | ❌ |

#### NFR-003: 网络友好性
- 首页总资源: < 500KB
- 音效异步加载，不阻塞交互
- 图片格式: WebP + PNG + SVG

#### NFR-004: 可访问性 (A11y)
- 色彩对比度: WCAG AA 标准
  - 荧光青 vs 黑: 15.7:1 ✅
  - 终端绿 vs 黑: 8.2:1 ✅
- 键盘导航: Tab 支持
- 屏幕阅读器: 完整 aria-label

---

### 1.4 业务指标 (KPIs)

| KPI | 目标值 |
|-----|--------|
| 首页完成率 | > 90% |
| Guest Mode 转化率 | > 15% |
| 平均停留时间 | 30-45s |
| 设备退出率 | < 5% |
| 加载超时率 | < 0.5% |

---

## 🎨 第二部分：设计规范 (Design Specification)

### 2.1 视觉设计

#### 2.1.1 色彩系统

**核心色彩**:
```
背景: #050505 (深邃黑)
强调: #00FFC2 (荧光青)
辅助: #33FF00 (终端绿)
警告: #FF0055 (霓虹红)
```

#### 2.1.2 闸刀设计规范

**尺寸**:
- 桌面: 240px × 360px
- 移动: 160px × 240px

**材质** (PBR):
- Metalness: 0.8 (高度金属质)
- Roughness: 0.3 (光滑微观纹理)

**状态动画**:
```css
.switch {
  position: absolute;
  transform: translateY(0);
  will-change: transform;  /* ⭐ 性能优化 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.switch.dragging {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  z-index: 1000;
}

.switch.active {
  transform: translateY(100px);
  box-shadow: 0 0px 20px rgba(0, 255, 194, 0.6);
}

@keyframes switch-lock-burst {
  0% { filter: brightness(1); transform: scale(1); }
  50% { filter: brightness(1.3); transform: scale(1.05); }
  100% { filter: brightness(1); transform: scale(1); }
}
```

#### 2.1.3 Logo 设计

- 样式: 线条风格 (Outline)
- OFF: #333333 (深灰)
- ON: #00FFC2 (荧光青)
- 大小: 120px (桌面) / 80px (移动)

**Glitch 效果**:
```css
@keyframes glitch {
  0%, 100% { clip-path: inset(0); transform: translate(0); }
  20% { clip-path: inset(40% 0 30% 0); transform: translate(-2px, 2px); }
  40% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
  60% { clip-path: inset(60% 0 10% 0); transform: translate(-1px, 1px); }
  80% { clip-path: inset(10% 0 50% 0); transform: translate(1px, -1px); }
}

.logo.active {
  animation: glitch 0.5s steps(5) 1;
  color: #00FFC2;
  text-shadow:
    0 0 10px rgba(0, 255, 194, 0.8),
    0 0 20px rgba(0, 255, 194, 0.6),
    0 0 30px rgba(0, 255, 194, 0.4);
}
```

#### 2.1.4 CTA 按钮

**样式**:
- 文案: "[ 建立神经连接 ]"
- 字体: Orbitron / Russo One
- 尺寸: 280px × 48px
- 背景: #00FFC2
- 文字: #050505
- 圆角: 8px

**状态**:
```css
.btn-cta {
  background: #00FFC2;
  color: #050505;
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-cta:hover {
  background: #00FFD4;
  box-shadow: 0 0 30px rgba(0, 255, 194, 0.6);
  transform: translateY(-2px);
}
```

#### 2.1.5 文本规范

**闪烁文案**: `> SYSTEM_OFFLINE. DRAG TO INITIALIZE.`
```css
@keyframes blink {
  0%, 49%, 100% { opacity: 1; }
  50%, 99% { opacity: 0.3; }
}

.system-status {
  font-family: JetBrains Mono / Fira Code;
  font-size: 14px;
  color: #33FF00;
  animation: blink 0.8s step-start infinite;
  text-shadow: 0 0 10px rgba(51, 255, 0, 0.3);
}
```

---

### 2.2 交互设计

#### 2.2.1 微交互规范

| 交互 | 视觉反馈 | 音频反馈 | 其他 |
|------|---------|---------|------|
| 悬停 | 闸刀缩放 1.02x | electrical_hum.wav | cursor: grab |
| 拖拽中 | 实时跟随 | mechanical_drag.wav (loop) | cursor: grabbing |
| 回弹失败 | 反弹 + 闪红 | spring_back.wav | 触觉: 10ms |
| 拖拽成功 | 锁定 + 爆发 | switch_lock + current_hum | 触觉: [50,30,50] |
| **Fidget** | **Glitch 波纹** | **short_circuit_buzz** | **[50,100,50]** |

#### 2.2.2 拖拽物理模型

```javascript
const PHYSICS_MODEL = {
  dragging: {
    damping: 0.92,
    maxVelocity: 500,
    minDragDistance: 5,
  },
  bounce: {
    duration: 300,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    targetPosition: 0,
    overshoot: true,
  },
  lock: {
    duration: 200,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    targetPosition: 100,
  }
}
```

#### 2.2.3 移动端交互 ✅ 双指 + 用户引导

**双指拖拽方式**:
- 最小触点: 2
- 允许误差: ±10px
- 模拟仪式感

**用户引导机制**:
```javascript
// 检测单指拖拽
document.addEventListener('touchmove', (e) => {
  const touches = e.touches.length;
  
  if (touches === 1) {
    showGuidanceHint();        // 显示双指提示
    switchElement.classList.add('resistance-feedback');  // 阻力反馈
  } else if (touches === 2) {
    hideGuidanceHint();
    switchElement.classList.remove('resistance-feedback');
  }
});

@keyframes resistance-vibration {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}

.switch.resistance-feedback {
  animation: resistance-vibration 0.1s infinite;
  opacity: 0.7;
}
```

---

### 2.3 音效设计

#### 2.3.1 音效清单（9 个）

| 文件名 | 时长 | 用途 | 播放时机 | 音量 |
|--------|------|------|---------|------|
| electrical_hum.wav | 1.5s | 悬停电流 | 鼠标悬停 | 0.3 |
| mechanical_drag.wav | 0.8s | 拖拽机械音 | 拖拽期间 | 0.4 |
| spring_back.wav | 0.3s | 回弹弹簧 | 失败回弹 | 0.5 |
| switch_lock.wav | 0.15s | 锁定金属音 | 200ms | 0.7 |
| current-hum.wav | 2.0s | 通电音效 | 200ms+ | 0.6 |
| power_up.wav | 0.6s | Logo点亮 | 400ms | 0.8 |
| ui_light_on.wav | 0.2s | UI点亮 | 800ms+ | 0.5 |
| ambient_cyber.wav | 10.0s | 背景环境 | 1500ms+ | 0.15 |
| **short_circuit_buzz.wav** | **0.4s** | **短路滋滋** | **Fidget触发** | **0.6** |

#### 2.3.2 音效配置

```javascript
const AUDIO_CONFIG = {
  switch_lock: {
    volume: 0.7,
    duration: 0.15,
    priority: 'high',
    description: '沉闷有力的金属"咔哒"声'
  },
  current_hum: {
    volume: 0,
    targetVolume: 0.6,
    fadeDuration: 800,
    delay: 200,
    description: '电流嗡鸣声，与 switch_lock 层叠'
  },
  short_circuit_buzz: {
    volume: 0.6,
    duration: 0.4,
    pitchVariation: 0.05,
    description: '急促的不稳定"嗞嗞"声'
  }
}
```

---

### 2.4 响应式设计

#### 2.4.1 断点定义

| 设备 | 宽度 | 闸刀尺寸 | 调整 |
|------|------|---------|------|
| 移动竖屏 | < 480px | 140×210px | 垂直堆叠 |
| 移动横屏 | 480-767px | 160×240px | 水平居中 |
| 平板 | 768-1023px | 200×300px | 适度留白 |
| 桌面 | 1024px+ | 240×360px | 中心对称 |

#### 2.4.2 移动端优化

```css
/* 安全区适配 */
@supports (padding: max(0px)) {
  body {
    padding-top: max(16px, env(safe-area-inset-top));
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}

/* 触摸优化 */
.switch-container {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

/* 振动反馈 */
navigator.vibrate(100);              // 失败
navigator.vibrate([50, 30, 50]);     // 成功
navigator.vibrate([100, 50, 100]);   // 完成
```

---

### 2.5 无障碍设计 (A11y)

```html
<!-- 电源开关 -->
<button 
  id="power-switch"
  class="switch"
  aria-label="电源开关。桌面端向下拖拽，移动端使用两根手指下拉。"
  aria-pressed="false"
  role="switch"
>
  <!-- 内容 -->
</button>

<!-- CTA按钮 -->
<button 
  id="cta-button"
  class="btn btn--primary"
  aria-label="建立神经连接，进入关卡体验"
  disabled
>
  [ 建立神经连接 ]
</button>

<!-- 实时区域 -->
<div aria-live="polite" aria-atomic="true" id="status-region">
  系统初始化中...
</div>
```

---

## 🛠️ 第三部分：技术实现指南

### 3.1 技术栈

- **前端框架**: Vue 3 + Nuxt 4 + TypeScript
- **动画库**: GSAP + CSS3
- **3D 渲染**: Three.js (延迟加载)
- **音效库**: Howler.js
- **优化**: Lazy Loading, Code Splitting

### 3.2 文件结构

```
src/
├── pages/
│   └── index.vue                # 首页主组件
├── components/
│   ├── AccessTerminal.vue       # 首页容器
│   ├── PowerSwitch.vue          # 闸刀组件
│   ├── Logo.vue                 # Logo组件
│   ├── CTAButton.vue            # CTA按钮
│   └── DualFingerHint.vue       # 双指引导提示
├── composables/
│   ├── usePowerSequence.ts      # 通电仪式逻辑
│   ├── useDragPhysics.ts        # 拖拽物理引擎
│   ├── useAudioManager.ts       # 音效管理
│   └── useMobileGuide.ts        # 移动端引导逻辑
├── assets/
│   ├── models/switch.glb        # 闸刀3D模型
│   ├── sounds/
│   │   ├── current-hum.wav
│   │   ├── mechanical_drag.wav
│   │   ├── switch_lock.wav
│   │   └── short_circuit_buzz.wav
│   └── styles/access-terminal.css
└── utils/analytics.ts            # 分析埋点
```

### 3.3 核心实现要点

#### 音频解锁策略

```javascript
switchElement.addEventListener('pointerdown', async (e) => {
  // 解锁 AudioContext
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      sessionStorage.setItem('audio_context_unlocked', 'true');
    } catch (err) {
      console.warn('AudioContext resume failed');
      AUDIO_CONFIG.disabled = true;
    }
  }
  startDrag(e);
});
```

#### 超时保护机制

```javascript
function startInitializationRitual() {
  const startTime = Date.now();
  const timeoutChecker = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const isReady = window.__NUXT__ && window.THREE;
    
    if (isReady) {
      clearInterval(timeoutChecker);
      proceedWithRitual();
      return;
    }
    
    if (elapsed > 2000) {
      clearInterval(timeoutChecker);
      FEATURE_FLAGS.use3DModel = false;
      FEATURE_FLAGS.particleEffects = false;
      replaceWith2DFallback();
      proceedWithRitual();
    }
  }, 100);
}
```

#### Fidget 彩蛋检测 ✅ 性能优化版

```javascript
class FidgetDetector {
  constructor() {
    this.dragHistory = [];
    this.lastCheckTime = 0;
    this.checkThrottleInterval = 50; // 节流间隔 50ms
    this.rafScheduled = false;
  }
  
  // 方案 1: 使用节流（Throttle）- 适合高频 touchmove 事件
  recordDrag(dragData) {
    this.dragHistory.push(dragData);
    
    // ⭐ 性能优化：在高频 touchmove 事件中，每 50ms 最多检查一次
    // 防止 JS 线程阻塞（特别重要：低端安卓设备）
    const now = Date.now();
    if (now - this.lastCheckTime > this.checkThrottleInterval) {
      this.lastCheckTime = now;
      
      // 清理过期记录
      const cutoffTime = now - 1000;
      this.dragHistory = this.dragHistory.filter(
        (d) => d.timestamp > cutoffTime
      );
      
      // 检查是否触发彩蛋
      this.checkForFidget();
    }
  }
  
  // 方案 2: 使用 requestAnimationFrame（RAF）- 性能最优方案
  // 使用场景：如果需要更精细的控制或其他动画协调
  recordDragWithRAF(dragData) {
    this.dragHistory.push(dragData);
    
    // ⭐ 性能优化：将检查任务提交到浏览器的下一帧
    // 确保在浏览器重绘之前执行，不会阻塞用户交互
    if (!this.rafScheduled) {
      this.rafScheduled = true;
      requestAnimationFrame(() => {
        // 清理过期记录
        const now = Date.now();
        this.dragHistory = this.dragHistory.filter(
          (d) => now - d.timestamp < 1000
        );
        
        // 检查彩蛋
        this.checkForFidget();
        this.rafScheduled = false;
      });
    }
  }
  
  checkForFidget() {
    const validDrags = this.dragHistory.filter((d) => d.distance >= 50);
    if (validDrags.length >= 3) {
      const lastDrag = this.dragHistory[this.dragHistory.length - 1];
      if (lastDrag.position < 80) {
        this.triggerFidgetEasterEgg();
      }
    }
  }
  
  triggerFidgetEasterEgg() {
    // 播放音效
    playSound('short_circuit_buzz.wav', { volume: 0.6 });
    
    // 显示Glitch波纹
    const glitch = document.createElement('div');
    glitch.className = 'glitch-overlay active';
    document.body.appendChild(glitch);
    setTimeout(() => glitch.remove(), 400);
    
    // 闸刀抖动
    const switchEl = document.querySelector('.switch');
    switchEl.classList.add('fidgeting');
    setTimeout(() => switchEl.classList.remove('fidgeting'), 200);
    
    // 更新文案
    const status = document.querySelector('.system-status');
    status.textContent = '⚠️ WARNING: SYSTEM INSTABILITY DETECTED';
    status.style.color = '#FF0055';
    
    // 触觉反馈
    navigator.vibrate([50, 100, 50]);
    
    // 恢复
    setTimeout(() => {
      status.textContent = '> SYSTEM_OFFLINE. DRAG TO INITIALIZE.';
      status.style.color = '#33FF00';
    }, 500);
  }
}

// 使用选择：
// 1. 推荐用节流方案（recordDrag）- 简单、可靠、性能好
const fidgetDetector = new FidgetDetector();
document.addEventListener('pointermove', (e) => {
  if (isDragging) {
    fidgetDetector.recordDrag({
      timestamp: Date.now(),
      distance: Math.abs(e.clientY - startY),
      position: Math.max(0, Math.min(100, e.clientY - startY))
    });
  }
});

// 2. 或使用 RAF 方案（recordDragWithRAF）- 如果需要更高级的帧同步
// const fidgetDetector = new FidgetDetector();
// document.addEventListener('pointermove', (e) => {
//   if (isDragging) {
//     fidgetDetector.recordDragWithRAF({...});
//   }
// });
```

**性能优化要点说明**:

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **节流 (Throttle)** | 简单直接，不依赖浏览器 API | 精确度 ± 50ms | 大多数场景（推荐） |
| **RAF (requestAnimationFrame)** | 与浏览器帧同步，最优性能 | 依赖浏览器渲染 | 需要高精度动画同步 |
| **防抖 (Debounce)** | 最后一次执行 | 延迟判定 | 不适合本场景 |

---

## ✅ 质检清单

### 功能验证
- [ ] 拖拽 >= 80px 触发通电
- [ ] 拖拽 < 80px 回弹
- [ ] 200ms 时 switch_lock.wav 播放
- [ ] Guest Mode 数据保存
- [ ] 移动端双指引导显示
- [ ] Fidget 彩蛋触发（1s内往复3次）

### 性能验证
- [ ] 首屏加载 < 1.5s
- [ ] 拖拽帧率 60fps (桌面) / 30fps+ (移动)
- [ ] 无卡顿
- [ ] will-change 正确应用
- [ ] **⭐ Fidget 检测使用节流或 RAF，不阻塞 JS 线程**

### 视觉验证
- [ ] 色值完全匹配
- [ ] 动画缓动正确
- [ ] 响应式各断点正常
- [ ] Glitch 清晰可见
- [ ] 能量爆发效果可见

### 音效验证
- [ ] 9 个音效加载完成
- [ ] 音量符合配置
- [ ] 延迟 < 50ms
- [ ] switch_lock + current_hum 无冲突
- [ ] short_circuit_buzz 清晰

### 移动端验证
- [ ] 双指拖拽正常
- [ ] 单指提示显示
- [ ] 振动反馈工作
- [ ] 性能达标 (30fps+)
- [ ] **⭐ 低端安卓设备上 Fidget 检测不卡顿**

### 无障碍验证
- [ ] aria-label 完整
- [ ] 色彩对比度符合
- [ ] Tab 键导航正确
- [ ] 屏幕阅读器支持

---

## 📝 更新日志

### v1.3.1 性能优化版 (2024-12-20)

✅ **性能改进**:
- Fidget 检测添加节流机制（50ms 间隔）
- 提供 RAF 方案作为高性能替代
- 明确说明两种方案的适用场景
- 特别强调低端安卓设备的性能考虑

✅ **文档完整性**:
- 代码注释清晰说明性能优化理由
- 包含两种实现方案对比表
- 实际使用示例
- 性能优化检查清单

### v1.3 最终版本 (2024-12-20)

✅ **核心增强**:
- 状态持久化：已连接用户跳过拖拽
- 音频解锁策略：pointerdown 时解锁 AudioContext
- 超时保护：2 秒核心包加载超时自动降级
- Fidget 彩蛋：快速往复拖拽触发"短路"效果

✅ **音效补全**:
- switch_lock.wav (锁定音效)
- short_circuit_buzz.wav (短路音效)
- 共 9 个音效文件

✅ **文档完成度**:
- 5 项 FR（功能需求）
- 4 项 NFR（非功能需求）
- 零歧义、可直接开发

---

**文档版本**: v1.3.1 (Final - 性能优化完整版)  
**编制时间**: 2024-12-20  
**审核状态**: ✅ 生产级规范  
**交付对象**: 高级前端工程师

---
