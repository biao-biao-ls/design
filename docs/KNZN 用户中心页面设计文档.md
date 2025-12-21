# 🎮 KNZN 用户中心页面设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**页面名称**: 用户中心 (User Dashboard / Profile Center)  
**路由**: `/dashboard` 或 `/user/profile`  
**用户状态**: 已登录用户  
**文档版本**: v3.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 完整设计规范

## 🎯 页面定位与价值主张

### 核心定位
用户中心是**学习成就的展示柜**和**下一步学习的决策枢纽**。专注于个人进度展示，避免复杂的社交功能。

用户在这里可以：
- 👁️ 一眼掌握自己的学习进度和成就
- 🏆 展示自己的徽章、排名、虚拟作品
- 🎯 获得 AI 驱动的个性化学习建议
- 📊 查看全站排行榜（仅此而已，无需加好友）
- 📦 管理虚拟硬件库存，为 Sector 04 (物质化) 做准备
- 🎨 **生成和分享炫酷的成就卡片**

### 设计哲学
- **一页掌握**: 所有重要信息在首屏可见（无需下滑）
- **即时反馈**: 完成关卡后 3 秒内，中心页自动更新
- **成就感驱动**: 每个成就都有视觉庆祝（动画、声音、徽章闪光）
- **排名激励**: 简单的排行榜系统激发竞争欲望（无需复杂社交）
- **个性化驱动**: AI 推荐下一个技能，避免选择疲劳
- **分享导向**: 让用户愿意炫耀自己的学习成果

### 用户画像分层策略

**学习者 (Learners) - 70%**
- 特征：想要掌握硬件技能，关注学习进度
- 需求：清晰的学习路径、即时反馈、成就感
- 设计重点：进度可视化、技能雷达图、个性化推荐

**炫耀者 (Showcasers) - 20%**
- 特征：喜欢展示自己的成就和作品
- 需求：精美的成就展示、分享功能、社交认可
- 设计重点：成就墙、分享卡片生成、排行榜展示

**收集者 (Collectors) - 10%**
- 特征：喜欢收集徽章、解锁成就、完成挑战
- 需求：丰富的收集要素、稀有度系统、完成度追踪
- 设计重点：徽章系统、收集进度、稀有成就

## 🎯 核心功能需求

### FR-001: 个人资料卡
**描述**: 展示用户基础信息、等级、XP 和当前头衔

```javascript
const PROFILE_CARD = {
  user: {
    avatar: 'generated_pixel_avatar',
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

### FR-002: 技能雷达图
**描述**: 展示用户在 6 个核心维度的能力值，移动端自动降级为水平条形图

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
    triggerWidth: 480,
    type: 'horizontal-bar-chart'
  }
}
```

### FR-003: 成就与徽章墙
**描述**: 展示已获得的徽章，以及最近解锁的成就

**展示逻辑**:
- 最近获得: 顶部高亮显示最近 3 个徽章
- 稀有度特效: Common / Rare / Epic / Legendary

### FR-004: 排行榜系统
**描述**: 显示用户的全球排名，无社交功能

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
      tabs: ['全球', '本月', '本周'],
      display: 'top-50',
      updateFrequency: 'daily'
    }
  }
}
```

### FR-005: 库存与车库系统
**描述**: 展示用户在关卡中获得的虚拟硬件模块，用 2D 分层图片展示

```javascript
const GARAGE_PREVIEW_2D = {
  visual: {
    type: '2d-layered-illustration',
    baseImage: '/images/garage/car-wireframe-base.png',
    
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
        grayscale: true
      }
    ],
    
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

### FR-006: AI 学习推荐
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

### FR-007: 设置与订阅管理
**描述**: 用户偏好设置及账户订阅状态管理，使用 Lemon Squeezy 托管支付

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

## 🎨 设计规范

### 布局与响应式

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

### 视觉风格

- **车库预览**: 使用精美 2D 插画/GIF，营造赛博风格。未解锁部分使用 CSS Filter: Grayscale。
- **雷达图**: 动态生长动画，背景有同心圆网格呼吸效果。移动端降级为条形图。
- **卡片质感**: 玻璃拟态 (Glassmorphism) + 霓虹边框 (Neon Border)。

### 色彩系统

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

## 🛠️ 技术实现指南

### 目录结构建议

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

### 开发优先级

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

### 关键技术决策

#### 2D 车库实现方案

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

#### Lemon Squeezy 集成

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

#### Supabase 连接池优化策略

```javascript
const SUPABASE_CONFIG = {
  // 连接池配置
  connectionPool: {
    mode: 'transaction',
    maxConnections: 15,
    idleTimeout: 30000,
    
    monitoring: {
      enabled: true,
      alertThreshold: 12,
      logSlowQueries: true,
      slowQueryThreshold: 1000
    }
  },
  
  queryOptimization: {
    batchInserts: true,
    batchSize: 100,
    
    caching: {
      userProgress: 300,
      leaderboard: 3600,
      blueprints: 86400
    },
    
    connectionReuse: {
      enabled: true,
      maxReuse: 100,
      reuseTimeout: 60000
    }
  },
  
  fallback: {
    onConnectionLimit: 'queue-requests',
    queueTimeout: 5000,
    maxQueueSize: 50,
    
    readOnlyMode: {
      trigger: 'connection_limit_exceeded',
      allowedOperations: ['SELECT'],
      userMessage: '系统繁忙，暂时只能查看数据'
    }
  }
}

class SupabaseConnectionMonitor {
  constructor() {
    this.activeConnections = 0;
    this.connectionQueue = [];
    this.isMonitoring = true;
  }
  
  async executeQuery(query, params) {
    if (this.activeConnections >= SUPABASE_CONFIG.connectionPool.maxConnections) {
      return this.queueQuery(query, params);
    }
    
    this.activeConnections++;
    
    try {
      const result = await supabase.from(query.table).select(query.select);
      return result;
    } catch (error) {
      console.error('Supabase query failed:', error);
      throw error;
    } finally {
      this.activeConnections--;
      this.processQueue();
    }
  }
  
  queueQuery(query, params) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Query timeout in queue'));
      }, SUPABASE_CONFIG.fallback.queueTimeout);
      
      this.connectionQueue.push({
        query,
        params,
        resolve,
        reject,
        timeout
      });
    });
  }
  
  processQueue() {
    if (this.connectionQueue.length > 0 && 
        this.activeConnections < SUPABASE_CONFIG.connectionPool.maxConnections) {
      const { query, params, resolve, reject, timeout } = this.connectionQueue.shift();
      clearTimeout(timeout);
      
      this.executeQuery(query, params)
        .then(resolve)
        .catch(reject);
    }
  }
}
```

#### 排行榜缓存策略

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

### 性能优化策略

#### 图片资源优化
- 车库底图: WebP 格式，< 100KB
- 零件图层: SVG 或压缩 PNG，< 20KB 每个
- 头像: 生成式像素头像，避免上传存储

#### 数据加载策略
- 排行榜: 每日更新，Redis 缓存
- 用户数据: 首屏必需数据优先加载
- 成就数据: 懒加载，按需获取

### API 端点

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

## ✅ 质检清单

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

**文档版本**: v3.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队