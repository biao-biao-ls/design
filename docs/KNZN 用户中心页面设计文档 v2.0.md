# 🎮 KNZN 用户中心页面 (User Dashboard) 简化设计文档 v2.0

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 用户中心 (User Dashboard / Profile Center)  
**路由**: `/dashboard` 或 `/user/profile`  
**用户状态**: 已登录用户  
**文档版本**: v2.0（MVP 简化版 - 高性价比实现）  
**最后更新**: 2025-12-21  
**审核状态**: ✅ 可交付高级工程师进行开发  
**文档类型**: 生产级设计规范（零歧义）  
**设计理念**: 从"社交电商后台"简化为"个人成就展示柜"

---

## 🎯 第一部分：产品需求文档 (PRD)

### 1.1 页面定位与价值主张

#### 核心定位
用户中心是**学习成就的展示柜**和**下一步学习的决策枢纽**。专注于个人进度展示，避免复杂的社交功能。

用户在这里可以：
- 👁️ 一眼掌握自己的学习进度和成就
- 🏆 展示自己的徽章、排名、虚拟作品
- 🎯 获得 AI 驱动的个性化学习建议
- 📊 查看全站排行榜（仅此而已，无需加好友）
- 📦 管理虚拟硬件库存，为 Sector 04 (物质化) 做准备

#### 设计哲学 (简化版)
- **一页掌握**: 所有重要信息在首屏可见（无需下滑）
- **即时反馈**: 完成关卡后 3 秒内，中心页自动更新
- **成就感驱动**: 每个成就都有视觉庆祝（动画、声音、徽章闪光）
- **排名激励**: 简单的排行榜系统激发竞争欲望（无需复杂社交）
- **个性化驱动**: AI 推荐下一个技能，避免选择疲劳

#### 🚫 明确砍掉的功能
- ❌ 好友系统（加好友、私信、在线状态）
- ❌ 实时社交（双向关注、好友动态）
- ❌ 复杂挑战系统（P2P 对战、邀请机制）
- ❌ 3D 车库预览（改为 2D 分层图片点亮）
- ❌ 原生支付集成（改为 Lemon Squeezy 托管）

---

### 1.2 核心功能需求 (Functional Requirements) - 简化版

#### FR-001: 个人资料卡
**描述**: 展示用户基础信息、等级、XP 和当前头衔

```javascript
const PROFILE_CARD = {
  user: {
    avatar: 'generated_pixel_avatar', // AI 生成像素头像
    username: 'CyberEngineer_007',
    joinDate: '2024-01-15',
    title: 'Level 5 Wireman'
  },
  
  levelProgress: {
    current: 1250,
    next: 2000,
    percentage: 62.5,
    barColor: 'gradient(blue-to-cyan)'
  },
  
  quickStats: [
    { label: '总关卡', value: 42 },
    { label: '连续打卡', value: 5, unit: '天' },
    { label: '全球排名', value: 'Top 15%' }
  ]
}
```

#### FR-002: 技能雷达图 ✅ 移动端适配版
**描述**: 展示用户在 6 个核心维度的能力值

**桌面端**: 6D 雷达图  
**移动端**: 自动降级为水平条形图（避免文字重叠）

```javascript
const RADAR_CHART_CONFIG = {
  dimensions: [
    { id: 'logic', label: '逻辑思维', max: 100 },
    { id: 'wiring', label: '布线美学', max: 100 },
    { id: 'debugging', label: '调试能力', max: 100 },
    { id: 'coding', label: '代码控制', max: 100 },
    { id: 'theory', label: '理论基础', max: 100 },
    { id: 'creativity', label: '创新设计', max: 100 }
  ],
  
  mobileFallback: {
    enabled: true,
    triggerWidth: 480, // px
    type: 'horizontal-bar-chart'
  }
}
```

#### FR-003: 成就与徽章墙
**描述**: 展示已获得的徽章，以及最近解锁的成就

**展示逻辑**:
- 最近获得: 顶部高亮显示最近 3 个徽章
- 稀有度特效: Common / Rare / Epic / Legendary

#### FR-004: 排行榜系统 ✅ 简化版（无社交）
**描述**: 显示用户的全球排名，**砍掉好友系统和复杂挑战**

```javascript
const LEADERBOARD_SIMPLE = {
  globalLeaderboard: {
    userCurrentRank: {
      rank: 42,
      outOf: 50000,
      percentile: 99.9,
      badge: '🥉 铜牌'
    },
    
    leaderboard: {
      tabs: ['全球', '本月', '本周'], // 砍掉"好友"标签
      display: 'top-50', // 只显示前50名
      updateFrequency: 'daily' // 每天更新一次，不需要实时
    }
  }
}
```

**🚫 砍掉的功能**:
- ❌ friendsRanking: 好友排名
- ❌ challengeSystem: 挑战系统
- ❌ socialFeatures: 社交功能

#### FR-005: 库存与车库系统 ✅ 2D 简化版
**描述**: 展示用户在关卡中获得的虚拟硬件模块，**用 2D 分层图片代替 3D 模型**

```javascript
const GARAGE_PREVIEW_2D = {
  visual: {
    type: '2d-layered-illustration', // 2D 分层图片，不是 3D
    baseImage: '/images/garage/car-wireframe-base.png', // 底图：暗色线框车
    
    // 零件分层图片
    partLayers: [
      {
        id: 'chassis',
        image: '/images/garage/chassis-glow.png',
        unlocked: true,
        glowEffect: 'drop-shadow(0 0 10px #00ff88)'
      },
      {
        id: 'engine',
        image: '/images/garage/engine-glow.png',
        unlocked: false,
        grayscale: true // 未解锁时灰度显示
      }
    ],
    
    // CSS 动画效果
    animations: {
      onPartUnlock: {
        effect: 'filter: grayscale(0%) + glow-animation',
        duration: '2s'
      }
    }
  },

  progress: {
    totalParts: 12,
    collectedParts: 3,
    percentage: 25
  }
}
```

**🚫 砍掉的功能**:
- ❌ 3D 线框全息投影
- ❌ Three.js 渲染管线
- ❌ 复杂的 WebGL 动画

#### FR-006: AI 学习推荐
**描述**: 根据用户的雷达图短板和历史表现，推荐下一个任务

```javascript
const RECOMMENDATION = {
  title: '补强建议: 布线工艺',
  reason: '检测到您的布线美学得分较低',
  suggestedAction: {
    type: 'level',
    id: 'level_1_2_practice',
    label: '去练习: 完美布线挑战',
    xpBonus: '+20% XP'
  }
}
```

#### FR-007: 设置与订阅管理 ✅ Lemon Squeezy 托管版
**描述**: 用户偏好设置及账户订阅状态管理，**使用第三方支付托管**

```javascript
const USER_SETTINGS = {
  account: {
    avatar: 'upload / generate',
    email: 'change_email',
    password: 'reset_password'
  },
  
  preferences: {
    theme: ['cyberpunk_dark', 'matrix_green'],
    sound: { master: 80, sfx: 100, music: 50 },
    language: ['zh-CN', 'en-US']
  },

  // ⭐ 简化版: 订阅管理（Lemon Squeezy 托管）
  subscription: {
    currentPlan: {
      type: 'PRO_MONTHLY',
      status: 'active',
      nextBillingDate: '2025-02-20',
      amount: '$9.99'
    },
    actions: [
      { 
        label: '升级订阅', 
        action: 'redirect-to-lemon-squeezy',
        url: 'https://knzn.lemonsqueezy.com/checkout/premium'
      },
      { 
        label: '管理订阅', 
        action: 'redirect-to-lemon-squeezy-portal',
        url: 'https://knzn.lemonsqueezy.com/billing'
      }
    ]
  }
}
```

**🚫 砍掉的功能**:
- ❌ 原生支付方式绑定
- ❌ 发票下载系统
- ❌ 复杂的订阅周期管理
- ❌ 退款逻辑处理

---

## 🎨 第二部分：设计规范 (Design Specification) - 简化版

### 2.1 布局与响应式

#### 桌面端 (Desktop > 1024px)
**三栏布局**:
- **左 (30%)**: 个人卡片 + AI 推荐
- **中 (40%)**: 2D 车库预览 + 雷达图/条形图
- **右 (30%)**: 成就墙 + 排行榜

#### 移动端 (Mobile < 768px)
**单栏流式布局**:
1. 个人简报 (头像 + 等级 + 核心资产)
2. AI 推荐卡片 (最重要)
3. 2D 车库预览 + 进度条
4. 技能条形图 (雷达图降级)
5. 折叠的菜单 (成就、排行榜、设置)

### 2.2 视觉风格

- **车库预览**: 使用精美 2D 插画/GIF，营造赛博风格。未解锁部分使用 CSS Filter: Grayscale。
- **雷达图**: 动态生长动画，背景有同心圆网格呼吸效果。移动端降级为条形图。
- **卡片质感**: 玻璃拟态 (Glassmorphism) + 霓虹边框 (Neon Border)。

### 2.3 色彩系统

```css
:root {
  --color-primary-bright: #00FFC2;      /* 荧光青 */
  --color-secondary-bright: #FF00FF;    /* 荧光紫 */
  --color-accent-gold: #FFD700;         /* 金色 */
  --color-success: #33FF00;              /* 终端绿 */
  
  --color-bg-primary: #0A0E27;           /* 深邃紫黑 */
  --color-bg-secondary: #1A1F3A;         /* 次级深蓝 */
}
```

---

## 🛠️ 第三部分：技术实现指南 - 简化版

### 3.1 目录结构建议

```
src/
├── components/
│   ├── dashboard/
│   │   ├── UserProfileCard.vue
│   │   ├── SkillRadarChart.vue      # 包含 Mobile/Desktop 两种视图
│   │   ├── GaragePreview2D.vue      # 2D 分层图片预览
│   │   ├── InventoryGrid.vue
│   │   ├── LeaderboardSimple.vue    # 简化版排行榜（无好友）
│   │   └── AIRecommendation.vue
├── composables/
│   ├── useUserMetrics.ts
│   ├── useGarageState.ts            # 2D 车库状态逻辑
│   ├── useLeaderboard.ts            # 简化版排行榜逻辑
│   └── useSubscription.ts           # Lemon Squeezy 集成
```

### 3.2 开发优先级 (Phasing) - 简化版

**P0 - 核心闭环 (MVP 必需) - Week 1**:
- FR-001: 基础布局 + 个人资料
- FR-006: AI 推荐 (硬编码逻辑)
- FR-005: 库存系统 (基础列表，2D 车库)

**P1 - 商业化与增长 - Week 2**:
- FR-007: 订阅管理 (Lemon Squeezy 集成)
- FR-004: 排行榜系统
- FR-002: 动态雷达图

**P2 - 体验升级 - Week 3**:
- FR-003: 成就系统完善
- 移动端优化
- 性能优化

**总工期**: 约 2-3 周

### 3.3 关键技术决策

#### 3.3.1 2D 车库实现方案

```css
.garage-container {
  position: relative;
  width: 800px;
  height: 600px;
  background-image: url('/images/garage/car-wireframe-base.png');
}

.part-layer {
  position: absolute;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.part-layer.unlocked {
  filter: grayscale(0%) drop-shadow(0 0 10px #00ff88);
}
```

**优势**:
- 视觉效果依然很酷炫
- 加载速度快，移动端友好
- 美术资源制作成本低（找画师或 AI 生成）
- 无需 WebGL 兼容性考虑

#### 3.3.2 Lemon Squeezy 集成

```javascript
// 用户点击升级
const upgradeSubscription = () => {
  window.open('https://knzn.lemonsqueezy.com/checkout/premium-plan')
}

// 处理回调
app.post('/webhook/lemon-squeezy', (req, res) => {
  // 验证签名后更新用户权限
  const { user_id, subscription_status } = req.body
  await updateUserSubscription(user_id, subscription_status)
})
```

**优势**:
- 处理全球税务合规（VAT、GST等）
- 自动生成发票
- 处理退款和争议
- 支持多种支付方式
- 你只需要处理 webhook 回调

#### 3.3.3 排行榜缓存策略

```javascript
// 后端定时任务（每天凌晨）
const updateLeaderboard = async () => {
  const rankings = await calculateXPRankings()
  await redis.zadd('leaderboard:global', ...rankings)
}

// 前端只读取缓存
const getLeaderboard = async () => {
  return await redis.zrevrange('leaderboard:global', 0, 49, 'WITHSCORES')
}
```

**优势**:
- 避免实时计算排名的性能开销
- 每天更新一次足够了（学习平台不需要实时排名）
- Redis ZSET 天然支持排序

### 3.4 性能优化策略

#### 图片资源优化
- 车库底图: WebP 格式，< 100KB
- 零件图层: SVG 或压缩 PNG，< 20KB 每个
- 头像: 生成式像素头像，避免上传存储

#### 数据加载策略
- 排行榜: 每日更新，Redis 缓存
- 用户数据: 首屏必需数据优先加载
- 成就数据: 懒加载，按需获取

### 3.5 API 端点 - 简化版

```
GET  /api/user/profile              # 获取用户基本信息
GET  /api/user/achievements         # 获取成就列表
GET  /api/user/skills-progress      # 获取技能掌握度
GET  /api/user/inventory            # 获取物品库存

GET  /api/leaderboard/global        # 获取全球排名（缓存）
GET  /api/leaderboard/monthly       # 获取月度排名
GET  /api/leaderboard/weekly        # 获取周度排名

GET  /api/recommendations           # 获取个性化推荐

POST /api/user/settings             # 保存用户设置

# Lemon Squeezy 集成
POST /webhook/lemon-squeezy         # 处理支付回调
GET  /api/subscription/status       # 获取订阅状态
```

---

## ✅ 质检清单 - 简化版

### 功能验证
- [ ] 个人资料卡正确加载并实时更新
- [ ] 技能雷达图/条形图正确计算并展示
- [ ] 2D 车库预览正确显示零件点亮效果
- [ ] 排行榜正确显示全球排名（每日更新）
- [ ] AI 推荐系统基于用户数据生成建议
- [ ] Lemon Squeezy 订阅跳转和回调正常工作

### 性能验证
- [ ] 页面加载 < 2.5s
- [ ] 2D 车库图片总大小 < 200KB
- [ ] 排行榜从缓存读取，响应时间 < 100ms
- [ ] 移动端流畅运行，无卡顿

### 用户体验验证
- [ ] 首屏包含所有关键信息（无需下滑）
- [ ] 移动端条形图可读性良好
- [ ] 所有交互都有反馈（按钮点击、数据加载等）
- [ ] 错误消息清晰有用

---

## 📊 简化前后对比

| 功能模块 | 原文档要求 (高成本) | 修改后 MVP 方案 (高性价比) | 节省工时 |
|---------|-------------------|------------------------|---------|
| 社交系统 | 完整的好友、私信、在线状态 | 排行榜 (Leaderboard) 仅此而已 | 2-3 周 |
| 车库预览 | 3D 全息互动模型、实时渲染 | 精美 2D 插画 / GIF | 1-2 周 |
| 支付系统 | 原生对接、发票管理、订阅周期 | Lemon Squeezy 托管 | 2-3 周 |
| 雷达图 | 复杂的动态 ECharts 配置 | CSS + SVG 简单绘制 | 3-5 天 |
| 设置页 | 极其详细的隐私、通知设置 | 极简设置（改密码、改头像、绑定邮箱） | 1 周 |

**总节省工时**: 约 6-10 周 → 2-3 周

---

## 🚀 实施建议

### 立即开始
1. 搭建基础布局和个人资料卡
2. 实现 2D 车库预览（找画师或 AI 生成素材）
3. 集成 Lemon Squeezy（注册账号，配置 webhook）

### 近期完成
4. 实现排行榜系统（Redis 缓存）
5. 实现技能雷达图（桌面端）和条形图（移动端）
6. 实现 AI 推荐系统（初期可以硬编码规则）

### 后续优化
7. 完善成就系统
8. 移动端体验优化
9. 性能监控和优化

---

**文档版本**: v2.0 (简化版)  
**编制时间**: 2025-12-21  
**审核状态**: ✅ 生产级规范（高性价比实现）  
**交付对象**: 高级前端工程师

这个简化版本将开发周期从 2-3 个月缩短到 2-3 周，而且用户体验更聚焦于学习激励，避免了复杂社交功能的技术债务。
