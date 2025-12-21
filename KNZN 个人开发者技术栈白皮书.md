# 📜 KNZN 个人开发者技术栈白皮书 (v2.0)

> **核心原则**：不造轮子 (No Reinventing the Wheel)。作为个人开发者，只写核心业务逻辑，基础设施全部"外包"给成熟的 SaaS 和开源库。

## 1. 核心架构 (The Core Stack)

我们采用 **"BFF"** 架构（Backend for Frontend），彻底移除 Supabase 依赖，转为自托管模式，获得更好的性能和控制力。

| 模块 | 选型 | 理由 (Why?) |
| --- | --- | --- |
| **全栈框架** | **Nuxt 4** (Vue 3) | 单一代码库 (Monorepo) 体验，SEO 友好，自动路由，极佳的开发体验 (DX)。 |
| **后端服务** | **Nuxt 4 Server (Nitro)** | 承担 API 接口和业务逻辑，冷启动快，部署简单，与前端完美集成。 |
| **数据库** | **PostgreSQL (Docker)** | 部署在 VPS，完全控制数据，无供应商锁定，成本可控。 |
| **ORM** | **Drizzle ORM** | 轻量、Type-safe、冷启动快，完美契合 Serverless 环境。 |
| **鉴权系统** | **Better-Auth** | 集成 Google/Github OAuth，数据存本地库，无第三方依赖。 |
| **支付/订阅** | **Lemon Squeezy** | 专为 SaaS 设计的"全托管"支付平台。自动处理全球税务、发票、退款。**彻底摆脱合规烦恼。** |
| **部署托管** | **Vercel** | 零配置部署 Nuxt，全球 CDN 加速，Git 提交即发布。免费层级足够支撑 MVP。 |

---

## 2. 前端生态 (Frontend Ecosystem)

保持轻量，拒绝臃肿。

* **CSS 框架**: **UnoCSS**
* *理由*：比 Tailwind 更快，原子化 CSS，按需生成，零运行时开销。完美契合赛博朋克风格的快速定制。


* **状态管理**: **Pinia**
* *理由*：Vue 官方推荐，极简 API，TypeScript 支持完美。


* **工具库**: **VueUse**
* *理由*：几十个高质量 Hooks (`useLocalStorage`, `useDark`, `useWindowSize`)，避免手写基础逻辑。


* **图标库**: **Iconify** (配合 UnoCSS)
* *理由*：按需引入 10 万+ 图标，无需下载 SVG 文件。


* **动画库**: **CSS Transitions** (主) + **Motion One** (辅)
* *理由*：大部分交互用 CSS 解决（如首页闸刀、技能树连线）。复杂序列动画用 Motion One（轻量级 GSAP 替代品）。



---

## 3. 关键第三方服务 (Critical 3rd-Party Services)

这些服务解决了 KNZN 的特定业务难点。

* **电路仿真**: **Wokwi** (iframe集成)
* *用途*：提供 Arduino/ESP32 在线仿真环境。
* *集成方式*：`postMessage` 通信，控制代码运行和获取串口输出。


* **AI 助教**: **OpenAI API** (`gpt-4o-mini`)
* *用途*：代码纠错、原理解释。
* *特点*：`gpt-4o-mini` 极其便宜且速度快，适合高频低难度的教学对话。


* **邮件服务**: **Resend**
* *用途*：发送欢迎邮件、证书 PDF、重置密码邮件。
* *特点*：开发者友好的 API，送达率高，免费额度大。


* **PDF 生成**: **jspdf** + **html2canvas**
* *用途*：前端生成"结业证书"，无需后端渲染。



---

## 4. 数据库设计 (Database Schema - PostgreSQL + Drizzle)

使用 Drizzle ORM 定义 Schema，完全 Type-safe，部署在自己的 VPS PostgreSQL 实例。

```typescript
// server/database/schema.ts
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core'
import { randomUUID } from 'crypto'

// UUID 生成工具函数
export const generateId = () => randomUUID()

// 1. 用户与鉴权 (替代 Supabase auth.users)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()), // 应用层生成 UUID
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  isPro: boolean('is_pro').default(false), // Pro 会员标记
  role: text('role').default('user'), // 'user' | 'admin'
  createdAt: timestamp('created_at').defaultNow()
})

// 2. 第三方账号关联 (用于 OAuth)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  provider: text('provider').notNull(), // 'google', 'github', 'apple'
  providerAccountId: text('provider_account_id').notNull(), // open_id
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at')
})

// 3. 蓝图表 (去电商化)
export const blueprints = pgTable('blueprints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'), // 'beginner' | 'intermediate' | 'advanced'
  category: text('category'),
  coverImage: text('cover_image'),
  bomData: jsonb('bom_data'), // 存储 BOM 数组
  affiliateLinks: jsonb('affiliate_links'), // { "taobao": "...", "jd": "..." }
  wokwiProjectId: text('wokwi_project_id'), // Wokwi 项目 ID
  isOfficial: boolean('is_official').default(true),
  createdAt: timestamp('created_at').defaultNow()
})

// 4. 学习进度 (本地化)
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  lessonId: text('lesson_id').notNull(),
  phase: text('phase'), // 'theory', 'practice', 'debug'
  status: text('status'), // 'locked', 'active', 'completed'
  score: integer('score'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// 5. 证书表 (已颁发证书)
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id').references(() => users.id),
  badgeType: text('badge_type').notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  verifyHash: text('verify_hash').notNull()
})
```

---

## 5. 鉴权模块调整 (Self-hosted Auth)

**放弃**：Supabase Client SDK (supabase.auth.signInWith...)  
**新增**：在 Nuxt Server 端集成 Better-Auth

```typescript
// server/api/auth/[...].ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "~/server/database/connection"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },
  
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  }
})

export default defineEventHandler(async (event) => {
  return auth.handler(event.node.req, event.node.res)
})
```

**OAuth 回调逻辑**：
1. 用户点击"Google 登录"
2. 跳转到 `/api/auth/sign-in/google`
3. 回调到 `/api/auth/callback/google`
4. 后端获取 User Info，查询 users 表：
   - 有：创建 Session，写入 HttpOnly Cookie
   - 无：插入新用户 → 创建 Session → 写入 Cookie
5. 安全性：确保 Cookie 设置 `SameSite=Lax`, `Secure`, `HttpOnly`

---

## 6. MVP 开发路线图 (6-Week Sprint Plan)

这是你的作战计划。不要试图一次性做完，按周交付。

### 🗓️ Week 1: 地基搭建 (Infrastructure)

* [ ] 初始化 Nuxt 4 项目，配置 UnoCSS, Pinia
* [ ] 搭建 PostgreSQL Docker 环境，配置 Drizzle ORM
* [ ] 实现 Better-Auth 集成 (GitHub / Google 登录)
* [ ] 部署 Hello World 到 Vercel

### 🗓️ Week 2: 首页与核心交互 (The Hook)

* [ ] 开发首页"闸刀开关"组件 (序列帧动画)
* [ ] 实现"通电仪式"交互与音效
* [ ] 完成 Guest Mode 逻辑 (localStorage 状态)
* [ ] **里程碑**：一个能动、酷炫的 Landing Page 上线

### 🗓️ Week 3: 技能地图与导航 (The Map)

* [ ] 使用 Figma 绘制技能树 SVG
* [ ] 开发 SVG 交互组件 (点击、状态着色、连线动画)
* [ ] 对接 `progress` 表，实现节点解锁逻辑
* [ ] 开发 HUD 界面 (导航栏、XP 条)

### 🗓️ Week 4: 关卡仿真核心 (The Engine)

* [ ] 集成 Wokwi iframe
* [ ] 实现 `postMessage` 通信 (代码注入、串口监听)
* [ ] 开发"任务面板"和"判题逻辑" (后端验证)
* [ ] 对接 OpenAI API 实现简单的 AI 助教弹窗

### 🗓️ Week 5: 用户与支付 (The Business)

* [ ] 开发用户中心 (Dashboard) 布局
* [ ] 实现 2D 车库预览 (图片分层)
* [ ] 配置 Lemon Squeezy 商品，实现 Webhook 自动开通 Pro 权限
* [ ] 实现排行榜 (PostgreSQL 查询)

### 🗓️ Week 6: 蓝图与发布 (Launch Ready)

* [ ] 填充 5-10 个官方蓝图内容 (Markdown + 图片)
* [ ] 开发蓝图库展示页和详情页
* [ ] 集成 `jspdf` 实现证书下载
* [ ] **全站测试** (移动端适配、Safari 兼容性)
* [ ] **正式发布 (Product Hunt Launch)！**

---

## 💡 给开发者的最后建议 (Final Tips)

1. **Mobile First? No, Desktop First.**
* 这是一个重交互的学习平台，90% 的用户会用电脑访问（写代码、看电路图）。优先保证桌面端体验，移动端只做"查看/管理"功能的适配。

2. **不要过度封装**
* 直接在 API 路由里写 Drizzle 查询是可以的。不要为了"架构洁癖"去写复杂的 Service 层。怎么快怎么来。

3. **Wokwi 是核心资产**
* 花时间去研究 Wokwi 的 API，它是你能够以一人之力抗衡大厂的关键。

4. **数据库迁移策略**
* 使用 Drizzle Kit 管理数据库迁移，保持版本控制
* 定期备份 PostgreSQL 数据，避免数据丢失

5. **性能监控**
* 使用 Vercel Analytics 监控页面性能
* 监控 PostgreSQL 连接数，避免连接池耗尽