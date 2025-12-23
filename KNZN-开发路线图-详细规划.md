# 🚀 KNZN 项目开发路线图 - 详细规划

## 📋 项目概述

**项目名称**: KNZN 硬件学习平台  
**技术架构**: Nuxt 4 + PostgreSQL + Docker 容器化部署  
**目标市场**: 全球开发者，GDPR 合规，Email 优先认证  
**核心特色**: Wokwi 仿真器集成 + 游戏化学习 + 赛博朋克风格  

## 🎯 开发原则

1. **模块化开发**: 每个 spec 都是独立可测试的功能模块
2. **渐进式交付**: 优先核心功能，后续迭代增强
3. **技术债务控制**: 避免过度设计，专注 MVP 快速上线
4. **用户体验优先**: 桌面端优先，移动端引导到桌面
5. **海外市场适配**: Email 认证、时区处理、GDPR 合规

## 📊 开发时间估算

**总开发时间**: 16-20 周  
**团队规模**: 1-2 名全栈开发者  
**部署方式**: Contabo VPS Docker 容器化集群  

---

## 🏗️ Phase 1: 基础架构与核心系统 (Week 1-4)

### Spec 1: 项目基础架构搭建
**优先级**: P0 (最高)  
**预估时间**: 1.5 周  
**依赖关系**: 无  

#### 功能需求
- Nuxt 4 项目初始化与配置
- PostgreSQL + Drizzle ORM 集成
- Docker 容器化配置
- Contabo VPS 部署环境
- 基础 CI/CD 流程

#### 验收标准
- [ ] Nuxt 4 项目成功启动
- [ ] 数据库连接正常，支持迁移
- [ ] Docker 容器正常构建和运行
- [ ] VPS 部署成功，HTTPS 配置完成
- [ ] GitHub Actions 自动部署流程

#### 技术要点
```typescript
// 核心技术栈配置
const TECH_STACK = {
  framework: 'Nuxt 4',
  database: 'PostgreSQL (Docker)',
  orm: 'Drizzle ORM',
  deployment: 'Contabo VPS + Docker Compose',
  webServer: 'Nginx (反向代理)',
  ssl: 'Let\'s Encrypt'
}
```

---

### Spec 2: 用户认证系统 (Better-Auth)
**优先级**: P0 (最高)  
**预估时间**: 1.5 周  
**依赖关系**: Spec 1 (基础架构)  

#### 功能需求
- Better-Auth 集成配置
- Google/GitHub OAuth 登录
- Magic Link 邮件登录
- 用户数据模型设计
- 会话管理与安全配置

#### 验收标准
- [ ] Google OAuth 登录流程正常
- [ ] GitHub OAuth 登录流程正常
- [ ] Magic Link 邮件发送和验证
- [ ] 用户会话持久化
- [ ] 安全头和 Cookie 配置

#### 海外市场特殊要求
```typescript
// 海外认证配置
const AUTH_CONFIG = {
  // ✅ 支持的登录方式
  methods: ['email+password', 'magic-link', 'google-oauth', 'github-oauth'],
  
  // ❌ 明确不支持的方式
  excluded: ['phone-sms', 'wechat', 'qq'],
  
  // 🌍 GDPR 合规
  gdprCompliant: true,
  dataExportSupport: true,
  accountDeletionSupport: true
}
```

---

### Spec 3: 邮件服务系统 (Resend)
**优先级**: P0 (最高)  
**预估时间**: 1 周  
**依赖关系**: Spec 2 (认证系统)  

#### 功能需求
- Resend API 集成
- 邮件模板系统
- Magic Link 邮件发送
- 欢迎邮件和通知邮件
- 邮件发送状态追踪

#### 验收标准
- [ ] Resend API 配置成功
- [ ] Magic Link 邮件正常发送
- [ ] 欢迎邮件模板美观
- [ ] 邮件送达率监控
- [ ] DNS 记录配置 (SPF, DKIM)

#### 邮件模板示例
```html
<!-- 欢迎邮件模板 -->
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h1 style="color: #00ff88;">Welcome to KNZN! 🚀</h1>
  <p>Your hardware learning journey begins now...</p>
  <a href="{{skillMapUrl}}" style="background: #00ff88; color: #000; padding: 12px 24px;">
    Start Learning
  </a>
</div>
```

---

## 🎨 Phase 2: 核心用户界面 (Week 5-8)

### Spec 4: 首页闸刀交互系统
**优先级**: P1 (高)  
**预估时间**: 1.5 周  
**依赖关系**: Spec 2 (认证系统)  

#### 功能需求
- 赛博朋克风格首页设计
- 闸刀开关序列帧动画
- 通电仪式交互流程
- Guest Mode 本地状态管理
- 音效系统集成

#### 验收标准
- [ ] 闸刀拖拽交互流畅 (60fps)
- [ ] 通电动画效果震撼
- [ ] 音效播放兼容 Safari
- [ ] Guest 模式数据持久化
- [ ] 移动端适配完成

#### 技术实现要点
```javascript
// 闸刀动画配置
const SWITCH_ANIMATION = {
  spriteSheet: {
    frames: 30,
    frameWidth: 240,
    frameHeight: 360,
    format: 'horizontal-strip'
  },
  interaction: {
    minDragDistance: 80,
    snapThreshold: 100,
    animationDuration: 300
  }
}
```

---

### Spec 5: 技能地图 SVG 系统
**优先级**: P1 (高)  
**预估时间**: 2 周  
**依赖关系**: Spec 2 (认证系统)  

#### 功能需求
- SVG 技能地图设计和实现
- 节点状态管理 (锁定/解锁/完成)
- 进度可视化和路径动画
- 搜索和筛选功能
- HUD 界面设计

#### 验收标准
- [ ] SVG 地图在所有设备正确显示
- [ ] 节点点击交互正常
- [ ] 进度状态实时更新
- [ ] 路径点亮动画流畅
- [ ] 搜索功能准确快速

#### SVG 地图结构
```svg
<!-- 技能地图 SVG 结构 -->
<svg viewBox="0 0 1200 800">
  <!-- 背景和区域 -->
  <g class="sectors">
    <circle cx="600" cy="400" r="300" fill="#FF6B35" opacity="0.1"/>
  </g>
  
  <!-- 连接线 -->
  <g class="edges">
    <path d="M200,300 L350,280" stroke="#00FFC2" class="edge"/>
  </g>
  
  <!-- 技能节点 -->
  <g class="nodes">
    <g id="node-1-1" class="node" data-status="completed">
      <circle cx="200" cy="300" r="20" fill="#00FFC2"/>
      <text x="200" y="305">1.1</text>
    </g>
  </g>
</svg>
```

---

### Spec 6: 用户中心页面
**优先级**: P1 (高)  
**预估时间**: 1.5 周  
**依赖关系**: Spec 2 (认证系统), Spec 5 (技能地图)  

#### 功能需求
- 用户 Dashboard 设计
- 学习进度统计
- 成就和徽章展示
- 2D 车库预览系统
- 个人资料管理

#### 验收标准
- [ ] Dashboard 数据准确显示
- [ ] 进度图表美观易读
- [ ] 徽章系统正常工作
- [ ] 车库预览效果良好
- [ ] 个人资料编辑功能

#### Dashboard 数据结构
```typescript
interface UserDashboard {
  profile: {
    name: string
    level: number
    xp: number
    isPro: boolean
  }
  progress: {
    completedLessons: number
    totalLessons: number
    currentStreak: number
    totalTimeSpent: number
  }
  achievements: Badge[]
  recentActivity: Activity[]
}
```

---

## 🎮 Phase 3: 核心学习功能 (Week 9-12)

### Spec 7: Wokwi 仿真器集成
**优先级**: P0 (最高)  
**预估时间**: 2.5 周  
**依赖关系**: Spec 2 (认证系统)  

#### 功能需求
- Wokwi iframe 集成和通信
- Custom Chip API 判题系统
- X-Ray 透视可视化
- 心跳检测和错误处理
- 实时状态监控

#### 验收标准
- [ ] Wokwi iframe 稳定加载
- [ ] postMessage 通信延迟 < 100ms
- [ ] Custom Chip 判题准确
- [ ] X-Ray 动画流畅 (30fps+)
- [ ] 错误处理和重连机制

#### 关键技术验证
```javascript
// Wokwi 集成 PoC 验证
const testWokwiIntegration = async () => {
  // 测试 1: 基础通信
  iframe.contentWindow.postMessage({
    type: 'UPDATE_CODE',
    code: 'digitalWrite(13, HIGH);'
  }, 'https://wokwi.com');
  
  // 测试 2: 高频数据传输
  // 测试 3: Custom Chip 判题
  // 如果任何测试失败，需要调整技术方案
}
```

---

### Spec 8: 关卡场景系统
**优先级**: P0 (最高)  
**预估时间**: 2.5 周  
**依赖关系**: Spec 7 (Wokwi 集成)  

#### 功能需求
- 关卡页面布局系统
- 四阶段学习流程
- 新手引导系统
- AI 助教集成
- 进度追踪和判题

#### 验收标准
- [ ] 关卡页面布局响应式
- [ ] 四阶段流程顺畅
- [ ] 新手引导清晰易懂
- [ ] AI 助教响应及时
- [ ] 判题系统准确可靠

#### 关卡结构设计
```typescript
interface LessonStructure {
  phases: [
    { id: 'theory', title: '理论基础', duration: 10 },
    { id: 'practice', title: '实践环节', duration: 15 },
    { id: 'debug', title: '故障排查', duration: 10 },
    { id: 'reflection', title: '费曼笔记', duration: 5 }
  ]
  validation: {
    serialOutput: string[]
    gpioStates: GPIOCheck[]
    timeConstraints: TimeConstraint[]
  }
}
```

---

## 💰 Phase 4: 商业化功能 (Week 13-16)

### Spec 9: 支付系统 (Lemon Squeezy)
**优先级**: P1 (高)  
**预估时间**: 1.5 周  
**依赖关系**: Spec 2 (认证系统)  

#### 功能需求
- Lemon Squeezy 支付集成
- Pro 订阅管理
- Webhook 回调处理
- 订阅状态同步
- 发票和税务处理

#### 验收标准
- [ ] 支付流程顺畅
- [ ] Pro 权限自动开通
- [ ] Webhook 处理稳定
- [ ] 订阅状态准确同步
- [ ] 税务合规处理

#### 支付流程设计
```typescript
// 支付流程
const paymentFlow = {
  1: '用户点击升级 Pro',
  2: '创建 Lemon Squeezy 结账链接',
  3: '跳转到支付页面',
  4: '支付成功后 Webhook 回调',
  5: '自动开通 Pro 权限',
  6: '发送确认邮件'
}
```

---

### Spec 10: 蓝图库系统
**优先级**: P2 (中)  
**预估时间**: 2 周  
**依赖关系**: Spec 3 (邮件系统), Spec 9 (支付系统)  

#### 功能需求
- 蓝图展示和分类
- BOM 清单管理
- 联盟营销链接
- 下载统计和评分
- Pro 内容保护

#### 验收标准
- [ ] 蓝图分类清晰
- [ ] BOM 清单准确
- [ ] 联盟链接正常跳转
- [ ] 下载统计准确
- [ ] Pro 内容访问控制

#### 蓝图数据模型
```typescript
interface Blueprint {
  id: number
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  bomData: BOMItem[]
  affiliateLinks: {
    amazon?: string
    aliexpress?: string
    taobao?: string
  }
  hasProContent: boolean
  downloads: number
  rating: number
}
```

---

### Spec 11: 证书系统
**优先级**: P2 (中)  
**预估时间**: 1.5 周  
**依赖关系**: Spec 8 (关卡系统)  

#### 功能需求
- PDF 证书生成
- 证书验证系统
- LinkedIn 集成
- 证书分享功能
- 防伪哈希验证

#### 验收标准
- [ ] PDF 证书美观专业
- [ ] 证书验证链接有效
- [ ] LinkedIn 一键添加
- [ ] 分享功能正常
- [ ] 防伪验证可靠

#### 证书生成流程
```typescript
// 证书生成
const generateCertificate = async (userId: string, badgeType: string) => {
  const certificateId = generateShortId(8)
  const verifyHash = generateVerifyHash(userId, badgeType, certificateId)
  
  const pdfBuffer = await generatePDF({
    template: 'certificate-template.html',
    data: { userName, badgeType, certificateId, issuedDate }
  })
  
  return { certificateId, verifyHash, pdfBuffer }
}
```

---

## 🌐 Phase 5: 社区与管理 (Week 17-20)

### Spec 12: 社区中心
**优先级**: P2 (中)  
**预估时间**: 2 周  
**依赖关系**: Spec 2 (认证系统), Spec 7 (Wokwi 集成)  

#### 功能需求
- 社区帖子发布和管理
- Wokwi 项目分享
- 点赞和评论系统
- 内容分类和标签
- 社区规则和审核

#### 验收标准
- [ ] 帖子发布流程顺畅
- [ ] Wokwi 项目正确嵌入
- [ ] 互动功能正常
- [ ] 内容分类准确
- [ ] 审核机制有效

---

### Spec 13: 管理后台
**优先级**: P2 (中)  
**预估时间**: 1.5 周  
**依赖关系**: 所有前置 Spec  

#### 功能需求
- 用户管理和统计
- 内容审核和管理
- 系统监控面板
- 数据备份管理
- 权限分级管理

#### 验收标准
- [ ] 管理界面友好易用
- [ ] 数据统计准确
- [ ] 审核工具高效
- [ ] 监控告警及时
- [ ] 备份恢复可靠

---

### Spec 14: 数据备份与监控
**优先级**: P1 (高)  
**预估时间**: 1 周  
**依赖关系**: Spec 1 (基础架构)  

#### 功能需求
- 自动数据库备份
- 系统性能监控
- 错误日志收集
- 告警通知系统
- 容灾恢复方案

#### 验收标准
- [ ] 每日自动备份
- [ ] 性能指标监控
- [ ] 错误及时告警
- [ ] 备份恢复测试通过
- [ ] 监控面板清晰

---

## 📋 开发优先级矩阵

| Spec | 功能模块 | 优先级 | 开发周期 | 依赖关系 | 风险等级 |
|------|----------|--------|----------|----------|----------|
| 1 | 基础架构搭建 | P0 | 1.5周 | 无 | 低 |
| 2 | 用户认证系统 | P0 | 1.5周 | Spec 1 | 低 |
| 3 | 邮件服务系统 | P0 | 1周 | Spec 2 | 低 |
| 4 | 首页闸刀交互 | P1 | 1.5周 | Spec 2 | 中 |
| 5 | 技能地图系统 | P1 | 2周 | Spec 2 | 中 |
| 6 | 用户中心页面 | P1 | 1.5周 | Spec 2,5 | 低 |
| 7 | Wokwi 仿真集成 | P0 | 2.5周 | Spec 2 | 高 |
| 8 | 关卡场景系统 | P0 | 2.5周 | Spec 7 | 高 |
| 9 | 支付系统 | P1 | 1.5周 | Spec 2 | 中 |
| 10 | 蓝图库系统 | P2 | 2周 | Spec 3,9 | 低 |
| 11 | 证书系统 | P2 | 1.5周 | Spec 8 | 中 |
| 12 | 社区中心 | P2 | 2周 | Spec 2,7 | 中 |
| 13 | 管理后台 | P2 | 1.5周 | 所有 | 低 |
| 14 | 备份监控 | P1 | 1周 | Spec 1 | 低 |

## 🎯 MVP 发布策略

### MVP 1.0 (Week 8) - 核心体验
**包含 Spec**: 1, 2, 3, 4, 5, 6  
**核心功能**: 用户注册登录 + 首页交互 + 技能地图 + 用户中心  
**目标**: 验证用户对产品概念的接受度  

### MVP 1.5 (Week 12) - 学习功能
**包含 Spec**: 7, 8  
**核心功能**: Wokwi 仿真器 + 关卡学习系统  
**目标**: 验证核心学习体验和技术可行性  

### MVP 2.0 (Week 16) - 商业化
**包含 Spec**: 9, 10, 11  
**核心功能**: Pro 订阅 + 蓝图库 + 证书系统  
**目标**: 验证商业模式和付费转化  

### MVP 2.5 (Week 20) - 完整产品
**包含 Spec**: 12, 13, 14  
**核心功能**: 社区功能 + 管理后台 + 运维监控  
**目标**: 完整产品上线，支持规模化运营  

## ⚠️ 关键风险点

### 技术风险
1. **Wokwi API 稳定性** (Spec 7)
   - 风险: Wokwi 服务不稳定或 API 变更
   - 缓解: 提前进行 PoC 验证，准备降级方案

2. **iframe 通信性能** (Spec 7, 8)
   - 风险: postMessage 延迟过高影响用户体验
   - 缓解: 性能测试，优化通信频率

3. **移动端适配复杂度** (Spec 4, 5, 8)
   - 风险: 移动端交互体验差
   - 缓解: 采用桌面优先策略，移动端引导到桌面

### 商业风险
1. **Wokwi 商业授权** (Spec 7)
   - 风险: 商业化使用可能需要付费授权
   - 缓解: 提前咨询 Wokwi 商业政策

2. **海外支付合规** (Spec 9)
   - 风险: 税务和合规处理复杂
   - 缓解: 使用 Lemon Squeezy 自动处理

## 📈 成功指标

### 技术指标
- 页面加载时间 < 2s
- API 响应时间 < 500ms
- 系统可用性 > 99.9%
- Wokwi 集成稳定性 > 95%

### 用户指标
- 月活跃用户 > 1,000
- 7天留存率 > 60%
- 关卡完成率 > 70%
- Pro 转化率 > 5%

### 商业指标
- 月收入 > $5,000
- 用户获取成本 < $10
- 客户生命周期价值 > $50
- 净利润率 > 90%

---

## 🚀 开始开发

这份路线图为 KNZN 项目提供了清晰的开发路径。每个 Spec 都是独立的功能模块，可以通过 Kiro spec 模式进行开发。建议按照优先级顺序执行，确保核心功能优先完成。

**下一步行动**:
1. 选择第一个要开发的 Spec (建议从 Spec 1 开始)
2. 使用 Kiro 创建对应的 spec 文件
3. 按照 requirements → design → tasks 的流程进行开发
4. 完成一个 Spec 后再开始下一个

每个 Spec 都经过精心设计，确保功能完整、逻辑自洽、互不重叠，为 KNZN 项目的成功奠定坚实基础。