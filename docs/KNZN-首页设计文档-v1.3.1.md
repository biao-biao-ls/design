# 🏠 KNZN 首页设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 首页 (The Access Terminal)  
**路由**: `/` 或 `/home`  
**用户状态**: 游客 / 已登录均可访问  
**文档版本**: v3.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 实用级设计规范

## 🎯 设计理念

**从过度设计到实用主义**：
- 采用：序列帧动画、CSS 3D、2 个核心音效
- 目标：保持赛博朋克调性，开发成本控制

## 🎯 产品需求文档 (PRD)

### 首页定位与价值主张

#### 核心定位
首页是用户的**第一关**。不采用传统 Landing Page（头图+功能列表）的设计方式，而是直接展现一个**沉浸式互动装置**，通过仪式化的"通电"过程完成用户身份转换：从"游客"→ "KNZN 云端硬件实验室接入者"。

#### 设计哲学
- **零成本开始**: 无需购买硬件，点击开关 → 灯亮了 → 瞬间建立"云端硬件"认知
- **3秒启动体验**: 300ms 内给予反馈，1500ms 内完成整个"通电仪式"
- **沉浸式体验**: 赛博朋克视觉 + 电影级音效 + 物理级交互手感
- **商业转化**: Guest Mode 无需注册即可体验，通关后引导注册转化

## 🎯 核心功能需求

### FR-001: 全局状态管理与后端同步

**描述**: 页面加载时根据用户连接状态显示相应视觉呈现，状态检查改为调用后端 API

**初始化流程**:
```javascript
// 状态持久化检查逻辑
function initializePageState() {
  // Step 1: 检查用户连接状态（调用后端 API）
  checkConnectionStatus()
    .then(isConnected => {
      if (isConnected === true) {
        // 用户已接入 → 直接显示通电状态
        renderConnectedState()
      } else {
        // 用户未接入 → 显示断电状态
        renderDisconnectedState()
      }
    })
    .catch(error => {
      console.warn('Failed to check connection status:', error)
      // 降级到断电状态
      renderDisconnectedState()
    })
}

// 后端状态检查
async function checkConnectionStatus() {
  try {
    const response = await $fetch('/api/user/me')
    
    // 如果返回 200 且有用户数据，则为通电状态
    if (response && response.user) {
      return true
    }
    
    return false
  } catch (error) {
    // 如果返回 401 或其他错误，则为断电状态（或游客态）
    if (error.statusCode === 401) {
      return false
    }
    
    // 其他错误也当作断电处理
    return false
  }
}

// server/api/user/me.get.ts
export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    
    if (!session || !session.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }
    
    // 获取用户详细信息
    const user = await db.select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    
    if (!user.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return {
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        level: user[0].level,
        xp: user[0].xp,
        isPro: user[0].isPro,
        avatarUrl: user[0].avatarUrl
      },
      connectionStatus: 'online'
    }
  } catch (error) {
    // 返回 401 表示未登录（断电状态）
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
})
```

**断电状态** (当 API 返回 401):
- 背景色: 深邃黑 `#050505`
- 显示: 闸刀开关、Logo 轮廓、闪烁文案
- 隐藏: 菜单、CTA 按钮、氛围光、页脚

**通电状态** (当 API 返回 200):
- 文案: `> CLOUD_LAB_ONLINE. WELCOME TO THE FUTURE.`
- 颜色: 荧光青 `#00FFC2`（表示已接通云端实验室）
- 闸刀: 已在底部 (translateY: 100px)
- 菜单: 已显示 (opacity: 1)
- 氛围光: 已开启
### FR-002: 闸刀交互机制

**触发方式**:
- 仅在断电状态激活（已连接时拖拽无效）
- 桌面端: 向下拖拽鼠标 (Y 轴)
- 移动端: 单指下拉

**序列帧动画配置**:
```javascript
const SWITCH_ANIMATION_CONFIG = {
  // 序列帧配置
  spriteSheet: {
    imageUrl: '/images/switch-animation-sprite.png',
    frameCount: 30,
    frameWidth: 240,
    frameHeight: 360,
    totalWidth: 7200, // 240 * 30 frames
    format: 'horizontal-strip'
  },
  
  // 拖拽参数
  dragConfig: {
    direction: 'vertical',
    minDistance: 80,              // 最小拖拽距离 (px)
    maxDistance: 100,             // 最大拖拽距离
    
    // 使用 CSS transition
    animation: {
      type: 'css-transition',
      duration: '300ms',
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // 弹性回弹
      property: 'background-position'
    }
  }
}
```

### FR-003: 通电仪式流程

**简化后的通电仪式**:
```javascript
const SIMPLIFIED_RITUAL_CONFIG = {
  totalDuration: 1500, // 1.5 秒
  
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
### FR-004: Guest Mode 与音频兼容性

**简化的音频处理**:
```javascript
// 音频兼容性解决方案
const AUDIO_COMPATIBILITY = {
  // 使用 Howler.js 作为 Safari 兼容方案
  audioLibrary: 'howler.js',
  
  // 音频配置
  sounds: {
    switch_snap: {
      src: ['/sounds/switch-snap.wav', '/sounds/switch-snap.mp3'],
      volume: 0.7,
      preload: true,
      html5: true // 强制使用 HTML5 Audio，避免 Web Audio API 问题
    },
    electrical_hum: {
      src: ['/sounds/electrical-hum.wav', '/sounds/electrical-hum.mp3'],
      volume: 0.4,
      loop: true,
      preload: true,
      html5: true
    }
  },
  
  // iOS Safari 兼容性处理
  iosCompatibility: {
    enabled: true,
    
    // 在用户首次交互时解锁音频
    unlockAudio: () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          console.log('Audio context resumed for iOS')
        })
      }
    },
    
    // 检测 iOS 设备
    isIOS: () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent)
    }
  },
  
  // 降级策略
  fallback: {
    onAudioLoadError: 'continue-without-sound',
    showAudioDisabledNotice: false,
    
    // 如果音频完全失败，显示视觉反馈
    visualFeedbackOnly: {
      enabled: true,
      switchSnapEffect: 'css-animation-pulse',
      humEffect: 'css-glow-animation'
    }
  }
}

// 音频初始化
const initializeAudio = () => {
  // 检测音频支持
  if (!Howler.codecs('wav') && !Howler.codecs('mp3')) {
    console.warn('Audio not supported, using visual feedback only')
    return false
  }
  
  // iOS 特殊处理
  if (AUDIO_COMPATIBILITY.iosCompatibility.isIOS()) {
    // 监听首次用户交互
    document.addEventListener('touchstart', () => {
      AUDIO_COMPATIBILITY.iosCompatibility.unlockAudio()
    }, { once: true })
  }
  
  // 预加载音频
  Object.entries(AUDIO_COMPATIBILITY.sounds).forEach(([key, config]) => {
    try {
      window.audioSounds = window.audioSounds || {}
      window.audioSounds[key] = new Howl(config)
    } catch (error) {
      console.warn(`Failed to load sound: ${key}`, error)
    }
  })
  
  return true
}

// Guest 数据迁移逻辑
const handleUserRegistration = async (newUserId) => {
  const guestToken = localStorage.getItem('guest_token')
  
  if (guestToken) {
    try {
      // 合并游客数据到正式账户
      const result = await $fetch('/api/user/merge-guest', {
        method: 'POST',
        body: { guestToken }
      })
      
      if (result.success) {
        // 清理游客数据
        localStorage.removeItem('guest_token')
        localStorage.removeItem('knzn_connection_state')
        
        // 显示数据迁移成功提示
        showNotification('你的学习进度已成功保存！', 'success')
      }
    } catch (error) {
      console.error('Guest data merge failed:', error)
    }
  }
}
```

### FR-005: 移动端优化

**移动端交互简化**:
```javascript
// 单指拖拽配置
const MOBILE_INTERACTION = {
  touchMethod: 'single-finger',
  
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
  }
}
```
## 🎨 设计规范

### 视觉设计

#### 色彩系统

**核心色彩**:
```
背景: #050505 (深邃黑)
强调: #00FFC2 (荧光青)
辅助: #33FF00 (终端绿)
警告: #FF0055 (霓虹红)
```

#### 闸刀设计规范

**资源规格**:
- 雪碧图尺寸: 7200px × 360px (30 帧 × 240px 宽)
- 单帧尺寸: 240px × 360px (桌面) / 160px × 240px (移动)
- 文件格式: WebP (主) + PNG (降级)
- 文件大小: < 150KB (压缩后)

#### Logo 设计

- 样式: 线条风格 (Outline)
- OFF: #333333 (深灰)
- ON: #00FFC2 (荧光青)
- 大小: 120px (桌面) / 80px (移动)

#### CTA 按钮

**样式**:
- 文案: "[ 启动云端实验室 ]"
- 字体: Orbitron / Russo One
- 尺寸: 280px × 48px
- 背景: #00FFC2
- 文字: #050505
- 圆角: 8px

#### 文本规范

**闪烁文案**: `> CLOUD_LAB_OFFLINE. DRAG TO INITIALIZE.`
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

### 音效设计

#### 音效清单（2 个核心音效）

| 文件名 | 时长 | 用途 | 播放时机 | 音量 |
|--------|------|------|---------|------|
| switch-snap.wav | 0.2s | 闸刀锁定音 | 拖拽完成时 | 0.7 |
| electrical-hum.wav | 2.0s | 通电嗡鸣声 | 锁定后 200ms | 0.4 |
### 响应式设计

#### 断点定义

| 设备 | 宽度 | 闸刀尺寸 | 调整 |
|------|------|---------|------|
| 移动竖屏 | < 480px | 140×210px | 垂直堆叠 |
| 移动横屏 | 480-767px | 160×240px | 水平居中 |
| 平板 | 768-1023px | 200×300px | 适度留白 |
| 桌面 | 1024px+ | 240×360px | 中心对称 |

### 无障碍设计

```html
<!-- 电源开关 -->
<button 
  id="power-switch"
  class="switch"
  aria-label="电源开关。桌面端向下拖拽，移动端使用单指下拉。"
  aria-pressed="false"
  role="switch"
>
  <!-- 内容 -->
</button>

<!-- CTA按钮 -->
<button 
  id="cta-button"
  class="btn btn--primary"
  aria-label="启动云端实验室，开始硬件学习之旅"
  disabled
>
  [ 启动云端实验室 ]
</button>

<!-- 实时区域 -->
<div aria-live="polite" aria-atomic="true" id="status-region">
  系统初始化中...
</div>
```

## 🛠️ 技术实现指南

### 技术栈

- **前端框架**: Vue 3 + Nuxt 4 + TypeScript
- **动画库**: 纯 CSS3 Transitions
- **图片处理**: WebP + PNG 降级
- **音效库**: HTML5 Audio API
- **优化策略**: 懒加载、代码分割、资源压缩

### 文件结构

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
## ✅ 质检清单

### 功能验证
- [ ] 拖拽 >= 80px 触发通电
- [ ] 拖拽 < 80px 回弹（CSS transition）
- [ ] 200ms 时 switch-snap.wav 播放
- [ ] Guest Mode 数据保存和迁移
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

**文档版本**: v3.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队