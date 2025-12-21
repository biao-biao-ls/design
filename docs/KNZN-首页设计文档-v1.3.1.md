# 🏠 KNZN 首页 - 接入终端 (The Access Terminal) 个人开发者版

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 首页 (The Access Terminal)  
**路由**: `/` 或 `/home`  
**用户状态**: 游客 / 已登录均可访问  
**文档版本**: v2.0 (个人开发者优化版 - 降维打击)  
**最后更新**: 2024-12-21  
**审核状态**: ✅ 个人开发者可实现版本  
**文档类型**: 实用级设计规范（高性价比）

## 🎯 设计理念转变

**从过度设计到实用主义**：
- ❌ 放弃：Three.js 3D 渲染、复杂物理引擎、9 层音效系统
- ✅ 采用：序列帧动画、CSS 3D、2 个核心音效
- 🎯 目标：保持赛博朋克调性，开发成本砍掉 70%

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

#### FR-002: 闸刀交互机制 ✅ 序列帧版

**触发方式**:
- 仅在断电状态激活（已连接时拖拽无效）
- 桌面端: 向下拖拽鼠标 (Y 轴)
- 移动端: 单指下拉（简化为单指，提升易用性）

**序列帧动画配置**:
```javascript
const SWITCH_ANIMATION_CONFIG = {
  // 序列帧配置（替代 3D 模型）
  spriteSheet: {
    imageUrl: '/images/switch-animation-sprite.png',
    frameCount: 30,
    frameWidth: 240,
    frameHeight: 360,
    totalWidth: 7200, // 240 * 30 frames
    format: 'horizontal-strip'
  },
  
  // 拖拽参数（大幅简化）
  dragConfig: {
    direction: 'vertical',
    minDistance: 80,              // 最小拖拽距离 (px)
    maxDistance: 100,             // 最大拖拽距离
    
    // 移除复杂物理引擎，改用 CSS transition
    animation: {
      type: 'css-transition',
      duration: '300ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // 弹性回弹
      property: 'background-position'
    }
  },
  
  // 实时帧更新
  frameUpdate: {
    method: 'background-position',
    calculation: `
      const dragPercent = Math.max(0, Math.min(1, dragDistance / maxDistance));
      const frameIndex = Math.floor(dragPercent * (frameCount - 1));
      const yOffset = -frameIndex * frameHeight;
      switchElement.style.backgroundPosition = \`0 \${yOffset}px\`;
    `
  }
}
```

**拖拽结果**:
```
IF 拖拽距离 < 80px:
  → 闸刀回弹到第 0 帧 (CSS transition 300ms)
  → 播放回弹音效 (可选)
  
ELSE IF 拖拽距离 >= 80px:
  → 闸刀锁定在第 30 帧 (最后一帧)
  → 播放锁定音效 (switch_snap.wav)
  → 触发通电仪式流程
  → 设置 localStorage 连接状态
```

---

#### FR-003: 通电仪式流程 (Initialization Ritual) ✅ 简化版

**简化后的通电仪式**:
```javascript
const SIMPLIFIED_RITUAL_CONFIG = {
  // 移除超时保护机制（不需要加载 3D 库）
  // 移除复杂的 9 层音效同步
  
  totalDuration: 1500, // 缩短到 1.5 秒
  
  timeline: [
    {
      time: 0,
      action: 'user_completes_drag',
      effect: 'switch_locks_to_final_frame'
    },
    {
      time: 200,
      action: 'play_snap_sound',
      sound: 'switch_snap.wav',
      volume: 0.7
    },
    {
      time: 400,
      action: 'logo_ignition',
      effect: 'css_color_change + text_shadow_glow',
      from: '#333333',
      to: '#00FFC2',
      duration: 300
    },
    {
      time: 600,
      action: 'play_hum_sound',
      sound: 'electrical_hum.wav',
      volume: 0.4,
      loop: true
    },
    {
      time: 800,
      action: 'menu_cascade',
      effect: 'css_opacity_animation',
      stagger: 100 // 每个按钮间隔 100ms
    },
    {
      time: 1200,
      action: 'background_glow',
      effect: 'css_background_gradient_animation',
      duration: 300
    },
    {
      time: 1500,
      action: 'show_cta_button',
      effect: 'css_scale_animation',
      from: 'scale(0.8)',
      to: 'scale(1)'
    }
  ]
}
```

**核心简化**:
- ❌ 移除：复杂的超时保护、3D 库加载检测
- ❌ 移除：9 层音效同步、复杂的音频上下文解锁
- ❌ 移除：粒子爆发效果、重型粒子库
- ✅ 保留：核心的视觉反馈和 2 个关键音效
- ✅ 使用：纯 CSS 动画 + 简单的 JavaScript 时序控制

---

#### FR-004: Guest Mode (游客模式) ✅ 简化版

**简化的音频处理**:
```javascript
// 简化的音频解锁（移除复杂的 AudioContext 管理）
const SIMPLE_AUDIO_CONFIG = {
  // 在用户首次交互时解锁音频
  unlockOnFirstInteraction: true,
  
  // 简化的音频文件管理
  sounds: {
    switch_snap: {
      src: '/sounds/switch-snap.wav',
      volume: 0.7,
      preload: true
    },
    electrical_hum: {
      src: '/sounds/electrical-hum.wav', 
      volume: 0.4,
      loop: true,
      preload: true
    }
  },
  
  // 降级策略：如果音频加载失败，静默继续
  fallback: {
    onAudioLoadError: 'continue-without-sound',
    showAudioDisabledNotice: false
  }
}

// 简化的 Guest Token 管理
const guestToken = 'guest_' + Date.now(); // 简单的时间戳
localStorage.setItem('guest_token', guestToken);
localStorage.setItem('knzn_connection_state', 'true');
```

**实现机制**:
- ❌ 移除：复杂的 AudioContext 状态管理
- ❌ 移除：音频上下文解锁的错误处理
- ✅ 简化：基础的 HTML5 Audio API
- ✅ 降级：音频加载失败时静默继续

---

#### FR-005: 移动端优化 ✅ 单指版

**移动端交互简化**:
```javascript
// 移除复杂的双指拖拽，改用单指
const MOBILE_INTERACTION = {
  touchMethod: 'single-finger',
  reason: '双指拖拽对用户来说太复杂，降低转化率',
  
  // 单指拖拽配置
  singleFingerDrag: {
    minTouchDistance: 60, // 移动端降低最小距离
    touchSensitivity: 1.2, // 提高灵敏度
    
    // 防误触
    touchStartDelay: 100, // 100ms 后才开始识别拖拽
    
    // 视觉反馈
    feedback: {
      onTouchStart: 'switch-highlight',
      onDragging: 'real-time-frame-update',
      onTouchEnd: 'snap-to-final-state'
    }
  },
  
  // 移除用户引导复杂性
  guidance: {
    showHint: false, // 不显示双指提示
    naturalInteraction: true // 让交互更自然
  }
}
```

**移动端特殊处理**:
```css
/* 移动端闸刀尺寸调整 */
@media (max-width: 768px) {
  .switch {
    width: 160px;
    height: 240px;
    background-size: 160px 7200px; /* 调整雪碧图尺寸 */
  }
}

/* 触摸优化 */
.switch {
  touch-action: pan-y; /* 只允许垂直滑动 */
  user-select: none;
  -webkit-user-select: none;
}
```

---

### 1.3 非功能需求 (Non-Functional Requirements)

#### NFR-001: 性能指标 (个人开发者版)

| 指标 | 目标值 | 实现方式 |
|------|--------|----------|
| 首屏加载时间 (LCP) | < 1.2s | 序列帧图片 + CSS，无 JS 库依赖 |
| 可交互时间 (TTI) | < 1.5s | 纯 CSS 动画，无复杂计算 |
| 拖拽响应延迟 | < 16ms | background-position 更新，GPU 加速 |
| 通电仪式流畅度 | 60fps | CSS transitions，避免 JS 动画 |
| 音效播放延迟 | < 100ms | HTML5 Audio，预加载 |
| 移动端拖拽帧率 | ≥ 30fps | 单指拖拽，简化触摸逻辑 |
| 总资源大小 | < 300KB | 2 个音效 + 1 个雪碧图 + CSS |

**优化策略**:
- ✅ 序列帧雪碧图替代 3D 模型（减少 90% 资源）
- ✅ CSS 动画替代 JS 动画（GPU 加速）
- ✅ 2 个音效替代 9 个音效（减少 80% 音频资源）
- ✅ 移除 Three.js 等重型库（减少 500KB+ JS）
- ✅ 使用 WebP 格式雪碧图（减少 50% 图片大小）

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

#### 2.1.2 闸刀设计规范 (序列帧版)

**资源规格**:
- 雪碧图尺寸: 7200px × 360px (30 帧 × 240px 宽)
- 单帧尺寸: 240px × 360px (桌面) / 160px × 240px (移动)
- 文件格式: WebP (主) + PNG (降级)
- 文件大小: < 150KB (压缩后)

**视觉风格**:
- 金属质感: 通过预渲染实现，无需实时 PBR
- 光影效果: 烘焙到序列帧中
- 状态变化: 通过帧切换实现

**状态动画**:
```css
.switch {
  width: 240px;
  height: 360px;
  background-image: url('/images/switch-sprite.webp');
  background-size: 7200px 360px; /* 30 帧宽度 */
  background-position: 0 0; /* 初始第一帧 */
  background-repeat: no-repeat;
  will-change: background-position; /* GPU 加速 */
  transition: background-position 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.switch.dragging {
  transition: none; /* 拖拽时禁用过渡，实时更新 */
}

.switch.completed {
  background-position: -6960px 0; /* 最后一帧 (29 * 240px) */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .switch {
    width: 160px;
    height: 240px;
    background-size: 4800px 240px; /* 30 帧 × 160px */
  }
  
  .switch.completed {
    background-position: -4640px 0; /* 最后一帧 (29 * 160px) */
  }
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

### 2.3 音效设计 (简化版)

#### 2.3.1 音效清单（2 个核心音效）

| 文件名 | 时长 | 用途 | 播放时机 | 音量 |
|--------|------|------|---------|------|
| switch-snap.wav | 0.2s | 闸刀锁定音 | 拖拽完成时 | 0.7 |
| electrical-hum.wav | 2.0s | 通电嗡鸣声 | 锁定后 200ms | 0.4 |

#### 2.3.2 音效配置 (简化版)

```javascript
const SIMPLE_AUDIO_CONFIG = {
  switch_snap: {
    src: '/sounds/switch-snap.wav',
    volume: 0.7,
    duration: 200, // ms
    preload: true,
    description: '清脆的金属锁定声'
  },
  
  electrical_hum: {
    src: '/sounds/electrical-hum.wav',
    volume: 0.4,
    duration: 2000, // ms
    loop: true,
    fadeIn: 300, // 300ms 淡入
    preload: true,
    description: '低频电流嗡鸣，营造通电氛围'
  }
}

// 简化的播放逻辑
function playSound(soundName) {
  const audio = new Audio(SIMPLE_AUDIO_CONFIG[soundName].src);
  audio.volume = SIMPLE_AUDIO_CONFIG[soundName].volume;
  audio.play().catch(() => {
    // 静默处理音频播放失败
    console.log('Audio playback failed, continuing silently');
  });
}
```

**简化理由**:
- ❌ 移除 7 个非核心音效，减少 80% 音频资源
- ❌ 移除复杂的音频同步和淡入淡出逻辑
- ✅ 保留最重要的反馈音效：锁定确认 + 氛围营造
- ✅ 降级策略：音频失败时静默继续，不影响核心体验

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

### 3.1 技术栈 (个人开发者版)

- **前端框架**: Vue 3 + Nuxt 4 + TypeScript
- **动画库**: 纯 CSS3 Transitions (移除 GSAP 依赖)
- **图片处理**: WebP + PNG 降级
- **音效库**: HTML5 Audio API (移除 Howler.js)
- **优化策略**: 懒加载、代码分割、资源压缩

### 3.2 文件结构 (简化版)

```
src/
├── pages/
│   └── index.vue                # 首页主组件
├── components/
│   ├── AccessTerminal.vue       # 首页容器
│   ├── SwitchSprite.vue         # 序列帧闸刀组件
│   ├── Logo.vue                 # Logo组件
│   └── CTAButton.vue            # CTA按钮
├── composables/
│   ├── usePowerSequence.ts      # 通电仪式逻辑
│   ├── useSpriteAnimation.ts    # 序列帧动画控制
│   └── useSimpleAudio.ts        # 简化音效管理
├── assets/
│   ├── images/
│   │   ├── switch-sprite.webp   # 闸刀序列帧雪碧图
│   │   └── switch-sprite.png    # PNG 降级
│   ├── sounds/
│   │   ├── switch-snap.wav      # 锁定音效
│   │   └── electrical-hum.wav   # 通电音效
│   └── styles/
│       └── access-terminal.css  # 样式文件
└── utils/
    └── analytics.ts             # 分析埋点
```

### 3.3 核心实现要点 (个人开发者版)

#### 序列帧动画控制

```typescript
/**
 * 序列帧闸刀动画控制器
 * 替代复杂的 3D 渲染和物理引擎
 */
class SpriteSwitch {
  private element: HTMLElement;
  private frameCount: number = 30;
  private frameWidth: number = 240;
  private isDragging: boolean = false;
  private startY: number = 0;
  private maxDragDistance: number = 100;
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // 统一的指针事件处理（支持鼠标和触摸）
    this.element.addEventListener('pointerdown', this.onDragStart.bind(this));
    document.addEventListener('pointermove', this.onDragMove.bind(this));
    document.addEventListener('pointerup', this.onDragEnd.bind(this));
  }
  
  private onDragStart(e: PointerEvent): void {
    this.isDragging = true;
    this.startY = e.clientY;
    this.element.classList.add('dragging');
    
    // 简化的音频解锁（首次交互时）
    this.unlockAudio();
  }
  
  private onDragMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    
    const dragDistance = Math.max(0, e.clientY - this.startY);
    const dragPercent = Math.min(1, dragDistance / this.maxDragDistance);
    
    // 实时更新序列帧
    this.updateFrame(dragPercent);
  }
  
  private updateFrame(percent: number): void {
    const frameIndex = Math.floor(percent * (this.frameCount - 1));
    const xOffset = -frameIndex * this.frameWidth;
    this.element.style.backgroundPosition = `${xOffset}px 0`;
  }
  
  private onDragEnd(e: PointerEvent): void {
    if (!this.isDragging) return;
    
    const dragDistance = e.clientY - this.startY;
    this.isDragging = false;
    this.element.classList.remove('dragging');
    
    if (dragDistance >= 80) {
      // 成功：锁定到最后一帧
      this.lockSwitch();
    } else {
      // 失败：回弹到第一帧
      this.resetSwitch();
    }
  }
  
  private lockSwitch(): void {
    // 锁定到最后一帧
    this.element.style.backgroundPosition = `-${(this.frameCount - 1) * this.frameWidth}px 0`;
    this.element.classList.add('completed');
    
    // 播放锁定音效
    this.playSound('switch-snap');
    
    // 触发通电仪式
    setTimeout(() => this.startPowerSequence(), 200);
  }
  
  private resetSwitch(): void {
    // 回弹到第一帧（CSS transition 处理动画）
    this.element.style.backgroundPosition = '0 0';
  }
  
  private playSound(soundName: string): void {
    const audio = new Audio(`/sounds/${soundName}.wav`);
    audio.volume = soundName === 'switch-snap' ? 0.7 : 0.4;
    audio.play().catch(() => {
      // 静默处理音频失败
      console.log('Audio playback failed, continuing silently');
    });
  }
  
  private startPowerSequence(): void {
    // 简化的通电仪式
    setTimeout(() => this.playSound('electrical-hum'), 200);
    setTimeout(() => this.animateLogo(), 400);
    setTimeout(() => this.showMenu(), 800);
    setTimeout(() => this.showCTA(), 1200);
  }
  
  private animateLogo(): void {
    const logo = document.querySelector('.logo');
    logo?.classList.add('powered');
  }
  
  private showMenu(): void {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item, index) => {
      setTimeout(() => item.classList.add('visible'), index * 100);
    });
  }
  
  private showCTA(): void {
    const cta = document.querySelector('.cta-button');
    cta?.classList.add('visible');
  }
  
  private unlockAudio(): void {
    // 简化的音频解锁
    const audio = new Audio();
    audio.play().catch(() => {});
  }
}
```

#### 简化的 CSS 动画

```css
/* 序列帧闸刀 */
.switch {
  width: 240px;
  height: 360px;
  background-image: url('/images/switch-sprite.webp');
  background-size: 7200px 360px;
  background-position: 0 0;
  background-repeat: no-repeat;
  cursor: grab;
  will-change: background-position;
  transition: background-position 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.switch.dragging {
  cursor: grabbing;
  transition: none; /* 拖拽时禁用过渡 */
}

/* Logo 通电动画 */
.logo {
  color: #333333;
  transition: all 300ms ease-out;
}

.logo.powered {
  color: #00FFC2;
  text-shadow: 
    0 0 10px rgba(0, 255, 194, 0.8),
    0 0 20px rgba(0, 255, 194, 0.6);
}

/* 菜单项渐入 */
.menu-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 300ms ease-out;
}

.menu-item.visible {
  opacity: 1;
  transform: translateY(0);
}

/* CTA 按钮弹出 */
.cta-button {
  opacity: 0;
  transform: scale(0.8);
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cta-button.visible {
  opacity: 1;
  transform: scale(1);
}
```

---

## ✅ 质检清单 (个人开发者版)

### 功能验证
- [ ] 拖拽 >= 80px 触发通电
- [ ] 拖拽 < 80px 回弹（CSS transition）
- [ ] 200ms 时 switch-snap.wav 播放
- [ ] Guest Mode 数据保存
- [ ] 移动端单指拖拽正常
- [ ] 序列帧动画流畅切换

### 性能验证
- [ ] 首屏加载 < 1.2s
- [ ] 拖拽帧率 60fps (桌面) / 30fps+ (移动)
- [ ] 无卡顿
- [ ] background-position 更新流畅
- [ ] 总资源 < 300KB

### 视觉验证
- [ ] 序列帧切换自然
- [ ] 色值完全匹配
- [ ] CSS 动画缓动正确
- [ ] 响应式各断点正常
- [ ] Logo 通电效果可见

### 音效验证
- [ ] 2 个音效加载完成
- [ ] 音量符合配置
- [ ] 延迟 < 100ms
- [ ] 音频失败时静默继续

### 移动端验证
- [ ] 单指拖拽正常
- [ ] 触摸响应灵敏
- [ ] 序列帧在移动端正确缩放
- [ ] 性能达标 (30fps+)

### 降级验证
- [ ] WebP 不支持时 PNG 降级
- [ ] 音频播放失败时静默继续
- [ ] 低端设备性能正常

---

## 📝 更新日志

### v2.0 个人开发者优化版 (2024-12-21)

✅ **核心简化**:
- 序列帧动画替代 Three.js 3D 渲染
- 2 个核心音效替代 9 层音效系统
- CSS 动画替代复杂 JS 动画
- 单指拖拽替代双指拖拽

✅ **性能优化**:
- 总资源从 >1MB 降至 <300KB
- 开发工时从 11-17 天降至 1.5 天
- 移除所有重型 JS 库依赖
- GPU 加速的 CSS 动画

✅ **实用性提升**:
- 移动端交互更自然
- 音频失败时优雅降级
- 跨设备兼容性更好
- 维护成本大幅降低

---

**文档版本**: v2.0 (个人开发者优化版)  
**编制时间**: 2024-12-21  
**审核状态**: ✅ 个人开发者可实现  
**预估工时**: 1.5 天（vs 原版 11-17 天）

---
