# 📘 KNZN 全栈开发手册 (The Bible)

> **核心理念**: 个人开发者极速方案 - Nuxt 4 单体 + Drizzle + 混合部署，追求开发速度（DX）和低运维成本

## 📋 文档概述

**适用项目**: KNZN 硬件学习平台  
**技术定位**: 个人开发者高效率 + 出海合规  
**架构特点**: Nuxt 4 BFF + PostgreSQL + Contabo VPS 容器化集群  
**文档版本**: v2.0 (针对 KNZN 优化版)  

## 🎯 架构设计原则

### 核心原则：不造轮子 (No Reinventing the Wheel)

作为个人开发者，只写核心业务逻辑，基础设施全部"外包"给成熟的 SaaS 和开源库。

| 传统企业级方案 | KNZN 个人开发者方案 | 优势 |
|----------------|---------------------|------|
| NestJS 独立后端 | Nuxt 4 Server (Nitro) | 减少一层服务，开发更快 |
| Prisma ORM | Drizzle ORM | 冷启动更快，支持 Serverless |
| JWT/Passport | Better-Auth | 无手机号，Email Magic Link |
| 全 Docker 编排 | Contabo VPS 容器化集群 | 零运维成本 |

## 🏗️ 系统架构

### 整体架构图 (Contabo VPS 单机集群)

```
┌─────────────────────────────────────────────────────────────────┐
│                        全球用户访问                              │
├─────────────────────────────────────────────────────────────────┤
│ 🌍 Global Users │ 💻 Desktop First │ 📧 Email Auth │ 🚫 No Phone │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN (可选)                       │
├─────────────────────────────────────────────────────────────────┤
│ • 全球 CDN 加速 (静态资源)                                      │
│ • DDoS 防护                                                     │
│ • SSL 终端 (或直接到 VPS)                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Contabo VPS (单机集群)                      │
├─────────────────────────────────────────────────────────────────┤
│                     Nginx (反向代理)                           │
│ • SSL 证书管理 (Let's Encrypt)                                 │
│ • HTTP/2 + Gzip 压缩                                           │
│ • 静态资源缓存                                                  │
│ • 负载均衡 (单实例)                                             │
│ • 安全头配置                                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nuxt 4 容器 (核心应用)                      │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (Vue 3)        │ Backend (Nitro Server)               │
│ • 首页闸刀交互          │ • /server/api/* (API 路由)           │
│ • 技能地图 SVG          │ • Better-Auth 集成                   │
│ • 关卡场景 Wokwi        │ • Drizzle ORM 查询                   │
│ • 用户中心 2D 车库      │ • OpenAI API 调用                    │
│ • 社区中心              │ • Lemon Squeezy Webhook              │
│ • 蓝图库                │ • Resend 邮件发送                    │
│ • 管理后台              │ • R2 文件签名                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (VPS 本地)                         │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL 容器         │ Redis 容器           │ 第三方 SaaS     │
│ • 用户数据 (GDPR合规)   │ • Nitro 缓存         │ • Resend 邮件   │
│ • 学习进度              │ • 会话存储           │ • OpenAI API    │
│ • 社区内容              │ • 限流控制           │ • Lemon Squeezy │
│ • 数据持久化挂载        │ • 排行榜缓存         │ • Cloudflare R2 │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈选型

### 核心技术栈 (Contabo VPS 优化版)

```typescript
const KNZN_TECH_STACK = {
  // 🎯 全栈框架 (容器化部署)
  framework: 'Nuxt 4',
  server: 'Nitro (Node Server)',
  preset: 'node-server', // Docker 容器部署
  
  // 🎨 前端技术
  frontend: {
    ui: 'Vue 3 + Composition API',
    styling: 'UnoCSS (比 Tailwind 更快)',
    stateManagement: 'Pinia',
    utilities: 'VueUse',
    icons: 'Iconify (10万+ 图标)',
    animations: 'CSS Transitions + Motion One'
  },
  
  // ⚡ 后端技术 (容器化优化)
  backend: {
    runtime: 'Nitro Server (Docker 容器)',
    database: 'PostgreSQL (Docker 容器)',
    orm: 'Drizzle ORM (轻量、Type-safe)',
    cache: 'Redis (Docker 容器)',
    auth: 'Better-Auth (Proxy 模式)',
    validation: 'Zod Schema',
    storage: 'Cloudflare R2 (直传)'
  },
  
  // 🐳 容器化部署
  deployment: {
    orchestration: 'Docker Compose',
    webServer: 'Nginx (反向代理)',
    ssl: 'Let\'s Encrypt (Certbot)',
    cicd: 'GitHub Actions',
    registry: 'GitHub Container Registry'
  },
  
  // 🌍 第三方服务 (保持不变)
  services: {
    email: 'Resend (开发者友好)',
    payment: 'Lemon Squeezy (自动处理税务)',
    ai: 'OpenAI API (gpt-4o-mini)',
    simulation: 'Wokwi (iframe 集成)',
    storage: 'Cloudflare R2 (极低成本)'
  }
}
```

## 📁 项目目录结构

### Nuxt 4 目录组织

```
knzn-project/
├── 📁 assets/                    # 静态资源
│   ├── css/main.css             # 全局样式
│   ├── images/                  # 图片资源
│   └── sounds/                  # 音效文件
│
├── 📁 components/               # Vue 组件
│   ├── ui/                      # 基础 UI 组件
│   ├── layout/                  # 布局组件
│   ├── features/                # 功能组件
│   │   ├── SkillMap.vue        # 技能地图
│   │   ├── WokwiSimulator.vue  # Wokwi 仿真器
│   │   └── PowerSwitch.vue     # 闸刀开关
│   └── admin/                   # 管理后台组件
│
├── 📁 pages/                    # 页面路由 (自动生成)
│   ├── index.vue               # 首页
│   ├── skill-map.vue           # 技能地图
│   ├── lesson/                 # 关卡页面
│   ├── user/                   # 用户中心
│   ├── community/              # 社区中心
│   ├── blueprints/             # 蓝图库
│   └── admin/                  # 管理后台
│
├── 📁 server/                   # Nitro 后端 (核心)
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证相关
│   │   ├── user/               # 用户管理
│   │   ├── lesson/             # 关卡管理
│   │   ├── community/          # 社区功能
│   │   ├── admin/              # 管理接口
│   │   ├── webhook/            # 第三方回调
│   │   └── upload/             # 文件上传
│   ├── middleware/             # 服务端中间件
│   ├── utils/                  # 服务端工具
│   └── database/               # 数据库相关
│       ├── schema.ts           # Drizzle Schema
│       ├── connection.ts       # 数据库连接
│       └── migrations/         # 数据库迁移
│
├── 📁 shared/                   # 前后端共享
│   ├── types/                  # TypeScript 类型
│   ├── schemas/                # Zod 验证 Schema
│   └── constants/              # 常量定义
│
├── 📁 stores/                   # Pinia 状态管理
│   ├── auth.ts                 # 认证状态
│   ├── user.ts                 # 用户状态
│   └── lesson.ts               # 学习进度
│
├── 📁 plugins/                  # Nuxt 插件
├── 📁 middleware/               # 路由中间件
│   ├── auth.ts                 # 认证中间件
│   ├── mobile-redirect.ts      # 移动端拦截中间件
│   └── progress-handoff.ts     # 进度接力中间件
├── 📁 layouts/                  # 布局模板
└── 📁 public/                   # 公共静态文件
```

## 🗄️ 数据库设计 (Drizzle ORM)

### Schema 定义

```typescript
// server/database/schema.ts
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core'
import { randomUUID } from 'crypto'

// 🔧 工具函数
export const generateId = () => randomUUID()

// 👤 用户表 (替代 Supabase auth.users)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  isPro: boolean('is_pro').default(false), // Pro 会员标记
  role: text('role').default('user'), // 'user' | 'admin' | 'super_admin'
  
  // 🌍 海外市场字段
  timezone: text('timezone').default('UTC'),
  language: text('language').default('en'),
  
  // 📊 统计字段
  loginCount: integer('login_count').default(0),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
})

// 🔗 OAuth 账号关联表
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google', 'github'
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// 📚 学习进度表
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id').notNull(),
  phase: text('phase'), // 'theory', 'practice', 'debug', 'reflection'
  status: text('status'), // 'locked', 'active', 'completed'
  score: integer('score'),
  timeSpent: integer('time_spent'), // 学习时长(秒)
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// 🏆 证书表
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(), // 8位短ID用于验证
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  badgeType: text('badge_type').notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  verifyHash: text('verify_hash').notNull(), // 防伪哈希
  linkedinShared: boolean('linkedin_shared').default(false),
  isRevoked: boolean('is_revoked').default(false)
})

// 📋 蓝图表 (去电商化，专注学习)
export const blueprints = pgTable('blueprints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'), // 'beginner' | 'intermediate' | 'advanced'
  category: text('category'),
  tags: text('tags').array(),
  
  // 📸 媒体资源
  coverImage: text('cover_image'),
  images: text('images').array(),
  
  // 🔧 技术内容
  wokwiProjectId: text('wokwi_project_id'),
  bomData: jsonb('bom_data'), // BOM 清单
  schematicUrl: text('schematic_url'),
  codeUrl: text('code_url'),
  
  // 🛒 购买链接 (联盟营销)
  affiliateLinks: jsonb('affiliate_links'), // { "amazon": "...", "aliexpress": "..." }
  
  // 🎯 Pro 内容
  hasProContent: boolean('has_pro_content').default(false),
  proDescription: text('pro_description'),
  
  // 📊 统计
  downloads: integer('downloads').default(0),
  likes: integer('likes').default(0),
  views: integer('views').default(0),
  
  // 🏷️ 元数据
  isOfficial: boolean('is_official').default(true),
  status: text('status').default('published'), // 'draft', 'published', 'archived'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// 💬 社区帖子表
export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type'), // 'project', 'discussion', 'help', 'showcase'
  
  // 📸 媒体内容
  wokwiProjectId: text('wokwi_project_id'),
  images: text('images').array(),
  
  // 🏷️ 分类标签
  tags: text('tags').array(),
  category: text('category'),
  
  // 📊 互动统计
  likes: integer('likes').default(0),
  replies: integer('replies').default(0),
  views: integer('views').default(0),
  
  // 🎯 内容状态
  status: text('status').default('published'), // 'draft', 'published', 'archived', 'flagged'
  isPinned: boolean('is_pinned').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

### 数据库连接配置 (Docker 环境)

```typescript
// server/database/connection.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// 🔧 连接池配置 (针对 Contabo VPS L: 12GB RAM, 6 CPU cores 优化)
const connectionConfig = {
  host: process.env.DATABASE_HOST || 'postgres', // Docker 服务名
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'knzn_production',
  user: process.env.DATABASE_USER || 'knzn_user',
  password: process.env.DATABASE_PASSWORD,
  
  // 🐳 Contabo VPS L 优化配置 (12GB RAM, 6 CPU cores)
  max: 30, // 最大连接数 (适配高并发)
  idle_timeout: 30, // 空闲超时 30 秒
  connect_timeout: 10, // 连接超时 10 秒
  
  // 🚀 性能优化配置
  max_lifetime: 60 * 60, // 连接最大生命周期 1 小时
  transform: {
    undefined: null // 将 undefined 转换为 null
  },
  
  // 🔒 SSL 配置 (VPS 内部通信可关闭)
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : false,
    
  // 🚀 高性能配置
  prepare: false, // 避免 prepared statement 缓存问题
  onnotice: () => {}, // 忽略 PostgreSQL 通知
  
  // 📊 连接池监控配置
  debug: process.env.NODE_ENV === 'development',
  
  // 🔄 连接池回收配置
  max_uses: 7500, // 每个连接最大使用次数
  
  // 🎯 针对 Contabo VPS 的网络优化
  keep_alive: true,
  keepalive_initial_delay_millis: 10000,
  
  // 📈 批量操作优化
  fetch_array_size: 1000, // 批量查询优化
  
  // 🔧 类型转换配置
  types: {
    // 优化 JSON 类型处理
    json: {
      to: 20,
      from: [114, 3802],
      serialize: (x: any) => JSON.stringify(x),
      parse: (x: string) => {
        try {
          return JSON.parse(x)
        } catch {
          return x
        }
      }
    }
  }
}

const queryClient = postgres(process.env.DATABASE_URL!, connectionConfig)
export const db = drizzle(queryClient, { schema })

// 🧪 连接测试
export const testConnection = async () => {
  try {
    await queryClient`SELECT 1`
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// 📊 连接池状态监控
export const getConnectionPoolStats = () => {
  return {
    totalConnections: queryClient.options.max,
    activeConnections: queryClient.reserved.length,
    idleConnections: queryClient.idle.length,
    waitingQueries: queryClient.ended.length
  }
}

// 🔄 优雅关闭
process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection pool...')
  await queryClient.end()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection pool...')
  await queryClient.end()
  process.exit(0)
})

// 📊 连接池健康检查
export const healthCheck = async () => {
  try {
    const start = Date.now()
    await queryClient`SELECT 1 as health_check`
    const responseTime = Date.now() - start
    
    const stats = getConnectionPoolStats()
    
    return {
      healthy: true,
      responseTime,
      connectionPool: stats,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
```

## 🔐 认证系统 (Better-Auth)

### Better-Auth 配置 (Nginx 代理环境)

```typescript
// server/api/auth/[...].ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "~/server/database/connection"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  
  // 🌍 海外市场标配：Email + OAuth，绝不使用手机号
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ['openid', 'email', 'profile']
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['user:email']
    }
  },
  
  // 📧 Email 认证 (海外核心)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        template: 'password-reset',
        data: { resetUrl: url, userName: user.name }
      })
    }
  },
  
  // ✨ Magic Link 登录 (海外用户偏好)
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      await sendEmail({
        to: email,
        template: 'magic-link',
        data: { loginUrl: url }
      })
    }
  },
  
  // 🍪 Session 配置 (Nginx 代理环境)
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  },
  
  // 🛡️ GDPR 合规配置
  user: {
    deleteUser: {
      enabled: true, // 支持用户删除账户
    },
    changeEmail: {
      enabled: true,
      requireEmailVerification: true
    }
  },
  
  // 🔒 Nginx 代理环境安全配置 (重要)
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN || 'knzn.net'
    },
    // 信任代理 (Nginx)
    trustProxy: true,
    // Cookie 安全配置
    secureCookies: process.env.NODE_ENV === 'production',
    sameSiteCookies: 'lax'
  },
  
  // 🌐 基础 URL 配置 (重要)
  baseURL: process.env.SITE_URL || 'https://knzn.net',
  
  // 🔐 密钥配置
  secret: process.env.BETTER_AUTH_SECRET!
})

export default defineEventHandler(async (event) => {
  return auth.handler(event.node.req, event.node.res)
})
```

### 前端认证集成

```vue
<!-- composables/useAuth.ts -->
<script setup lang="ts">
import { authClient } from "better-auth/client"

const auth = authClient({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://knzn.net' 
    : 'http://localhost:3000'
})

export const useAuth = () => {
  const user = ref(null)
  const loading = ref(false)
  
  // 🔐 登录方法
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const result = await auth.signIn.email({ email, password })
      if (result.data) {
        user.value = result.data.user
        await navigateTo('/skill-map')
      }
      return result
    } finally {
      loading.value = false
    }
  }
  
  // ✨ Magic Link 登录
  const sendMagicLink = async (email: string) => {
    loading.value = true
    try {
      const result = await auth.signIn.magicLink({ email })
      return result
    } finally {
      loading.value = false
    }
  }
  
  // 🌐 OAuth 登录
  const signInWithGoogle = () => auth.signIn.social({ provider: 'google' })
  const signInWithGitHub = () => auth.signIn.social({ provider: 'github' })
  
  // 📝 注册
  const signUp = async (email: string, password: string, name: string) => {
    loading.value = true
    try {
      const result = await auth.signUp.email({ email, password, name })
      return result
    } finally {
      loading.value = false
    }
  }
  
  // 🚪 登出
  const signOut = async () => {
    await auth.signOut()
    user.value = null
    await navigateTo('/')
  }
  
  // 🔄 获取当前用户
  const getCurrentUser = async () => {
    const session = await auth.getSession()
    user.value = session?.user || null
    return user.value
  }
  
  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    sendMagicLink,
    signInWithGoogle,
    signInWithGitHub,
    signUp,
    signOut,
    getCurrentUser
  }
}
</script>
```

## 📧 邮件服务 (Resend)

### 邮件系统配置

```typescript
// server/utils/email.ts
interface EmailTemplate {
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to KNZN - Your Hardware Learning Journey Begins! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00ff88;">Welcome to KNZN!</h1>
        <p>Hi {{name}},</p>
        <p>Welcome to the future of hardware learning! You're now part of a community that's passionate about electronics and innovation.</p>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #00ff88;">🎯 What's Next?</h3>
          <ul style="color: #ffffff;">
            <li>Explore the Skill Map to see your learning path</li>
            <li>Try your first circuit simulation with Wokwi</li>
            <li>Join our community to share your projects</li>
          </ul>
        </div>
        
        <a href="{{skillMapUrl}}" style="background: #00ff88; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Start Learning Now
        </a>
        
        <p>Happy coding!<br>The KNZN Team</p>
      </div>
    `
  },
  
  magicLink: {
    subject: 'Sign in to KNZN ⚡',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00ff88;">Sign in to KNZN</h1>
        <p>Click the button below to sign in to your account:</p>
        
        <a href="{{loginUrl}}" style="background: #00ff88; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Sign In to KNZN
        </a>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `
  },
  
  certificate: {
    subject: 'Your KNZN Certificate is Ready! 🏆',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00ff88;">Congratulations! 🎉</h1>
        <p>Hi {{name}},</p>
        <p>You've successfully completed <strong>{{badgeType}}</strong> and earned your certificate!</p>
        
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #00ff88;">🏆 {{badgeType}}</h3>
          <p style="color: #ffffff;">Certificate ID: {{certificateId}}</p>
        </div>
        
        <p>Your certificate is attached to this email. You can also:</p>
        <ul>
          <li><a href="{{verifyUrl}}">Verify your certificate online</a></li>
          <li><a href="{{linkedinUrl}}">Share on LinkedIn</a></li>
          <li><a href="{{downloadUrl}}">Download high-res version</a></li>
        </ul>
        
        <p>Keep up the great work!<br>The KNZN Team</p>
      </div>
    `
  }
}

// 📧 邮件发送函数
export const sendEmail = async (options: {
  to: string
  template: keyof typeof EMAIL_TEMPLATES
  data: Record<string, any>
  attachments?: Buffer[]
}) => {
  const template = EMAIL_TEMPLATES[options.template]
  
  // 🔄 模板变量替换
  let html = template.html
  let subject = template.subject
  
  Object.entries(options.data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    html = html.replace(new RegExp(placeholder, 'g'), value)
    subject = subject.replace(new RegExp(placeholder, 'g'), value)
  })
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KNZN <noreply@knzn.net>',
        to: options.to,
        subject,
        html,
        attachments: options.attachments?.map((buffer, index) => ({
          filename: `certificate-${index + 1}.pdf`,
          content: buffer.toString('base64'),
          contentType: 'application/pdf'
        }))
      })
    })
    
    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Email sent successfully:', result.id)
    return result
  } catch (error) {
    console.error('❌ Email sending error:', error)
    throw error
  }
}

// 📊 邮件发送 API
// server/api/email/send.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { to, template, data, attachments } = body
  
  // 🔐 验证权限 (仅内部调用)
  const apiKey = getHeader(event, 'x-api-key')
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  try {
    const result = await sendEmail({ to, template, data, attachments })
    return { success: true, messageId: result.id }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Email sending failed'
    })
  }
})
```

## 💳 支付系统 (Lemon Squeezy)

### 支付集成配置

```typescript
// server/api/webhook/lemon-squeezy.post.ts
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const signature = getHeader(event, 'x-signature')
  
  // 🔐 验证 Webhook 签名
  const expectedSignature = crypto
    .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex')
  
  if (signature !== expectedSignature) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid signature'
    })
  }
  
  const { event_name, data } = body
  
  try {
    switch (event_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(data)
        break
      case 'subscription_updated':
        await handleSubscriptionUpdated(data)
        break
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data)
        break
      case 'subscription_resumed':
        await handleSubscriptionResumed(data)
        break
      case 'order_created':
        await handleOrderCreated(data)
        break
    }
    
    return { success: true }
  } catch (error) {
    console.error('Webhook processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed'
    })
  }
})

// 🎯 订阅创建处理
const handleSubscriptionCreated = async (data: any) => {
  const { customer_email, status, product_name, variant_name } = data.attributes
  
  // 🔍 根据邮箱找到用户
  const user = await db.select()
    .from(users)
    .where(eq(users.email, customer_email))
    .limit(1)
  
  if (user.length) {
    // ✅ 开通 Pro 权限
    await db.update(users)
      .set({ 
        isPro: true,
        proSubscriptionStatus: status,
        proSubscriptionPlan: variant_name,
        proActivatedAt: new Date()
      })
      .where(eq(users.id, user[0].id))
    
    // 📧 发送欢迎邮件
    await sendEmail({
      to: customer_email,
      template: 'pro-welcome',
      data: {
        name: user[0].name,
        plan: variant_name
      }
    })
    
    console.log(`✅ Pro subscription activated for user: ${user[0].id}`)
  }
}

// 🔄 订阅更新处理
const handleSubscriptionUpdated = async (data: any) => {
  const { customer_email, status } = data.attributes
  
  const user = await db.select()
    .from(users)
    .where(eq(users.email, customer_email))
    .limit(1)
  
  if (user.length) {
    await db.update(users)
      .set({ proSubscriptionStatus: status })
      .where(eq(users.id, user[0].id))
  }
}

// ❌ 订阅取消处理
const handleSubscriptionCancelled = async (data: any) => {
  const { customer_email } = data.attributes
  
  const user = await db.select()
    .from(users)
    .where(eq(users.email, customer_email))
    .limit(1)
  
  if (user.length) {
    await db.update(users)
      .set({ 
        isPro: false,
        proSubscriptionStatus: 'cancelled',
        proCancelledAt: new Date()
      })
      .where(eq(users.id, user[0].id))
    
    console.log(`❌ Pro subscription cancelled for user: ${user[0].id}`)
  }
}
```

### 前端支付集成

```vue
<!-- components/ProUpgradeModal.vue -->
<template>
  <div class="pro-upgrade-modal">
    <div class="modal-content">
      <h2>🚀 Upgrade to KNZN Pro</h2>
      
      <div class="features-list">
        <div class="feature">
          <Icon name="check" class="text-green-500" />
          <span>Unlimited circuit simulations</span>
        </div>
        <div class="feature">
          <Icon name="check" class="text-green-500" />
          <span>Advanced debugging tools</span>
        </div>
        <div class="feature">
          <Icon name="check" class="text-green-500" />
          <span>Premium blueprint library</span>
        </div>
        <div class="feature">
          <Icon name="check" class="text-green-500" />
          <span>LinkedIn certificate integration</span>
        </div>
      </div>
      
      <div class="pricing">
        <div class="price">
          <span class="currency">$</span>
          <span class="amount">9.99</span>
          <span class="period">/month</span>
        </div>
        <p class="tax-note">Tax included (handled by Lemon Squeezy)</p>
      </div>
      
      <button 
        @click="upgradeToProo"
        :disabled="loading"
        class="upgrade-btn"
      >
        <Icon v-if="loading" name="loading" class="animate-spin" />
        {{ loading ? 'Processing...' : 'Upgrade Now' }}
      </button>
      
      <p class="guarantee">
        30-day money-back guarantee • Cancel anytime
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const loading = ref(false)

const upgradeToProo = async () => {
  if (!user.value) {
    await navigateTo('/auth/signin')
    return
  }
  
  loading.value = true
  
  try {
    // 🛒 创建 Lemon Squeezy 结账链接
    const response = await $fetch('/api/payment/create-checkout', {
      method: 'POST',
      body: {
        userId: user.value.id,
        email: user.value.email,
        plan: 'pro-monthly'
      }
    })
    
    // 🔗 跳转到支付页面
    window.location.href = response.checkoutUrl
  } catch (error) {
    console.error('Payment error:', error)
    // 显示错误提示
  } finally {
    loading.value = false
  }
}
</script>
```

## 📁 文件存储 (Cloudflare R2)

### R2 直传配置

```typescript
// server/api/upload/presign.post.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fileName, fileType, fileSize } = body
  
  // 🔐 验证用户权限
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  // ✅ 验证文件类型和大小
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain', 'application/json'
  ]
  
  if (!allowedTypes.includes(fileType)) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Invalid file type' 
    })
  }
  
  // 📏 文件大小限制
  const maxSize = session.user.isPro ? 10 * 1024 * 1024 : 2 * 1024 * 1024 // Pro: 10MB, Free: 2MB
  if (fileSize > maxSize) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: `File too large. Max size: ${maxSize / 1024 / 1024}MB` 
    })
  }
  
  // 🔑 生成预签名 URL
  const key = `uploads/${session.user.id}/${Date.now()}-${fileName}`
  const command = new PutObjectCommand({
    Bucket: 'knzn-assets',
    Key: key,
    ContentType: fileType,
    Metadata: {
      userId: session.user.id,
      originalName: fileName
    }
  })
  
  const presignedUrl = await getSignedUrl(r2Client, command, { 
    expiresIn: 300 // 5分钟有效
  })
  
  return {
    presignedUrl,
    fileKey: key,
    publicUrl: `https://assets.knzn.net/${key}`
  }
})
```

### 前端文件上传组件

```vue
<!-- components/FileUpload.vue -->
<template>
  <div class="file-upload">
    <div 
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      class="drop-zone"
      :class="{ 'drag-over': isDragOver }"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!uploading && !uploadedFile" class="upload-prompt">
        <Icon name="cloud-upload" class="text-4xl text-gray-400" />
        <p>Drag & drop your file here, or <button @click="$refs.fileInput.click()" class="text-blue-500">browse</button></p>
        <p class="text-sm text-gray-500">
          Max size: {{ maxSizeMB }}MB • Supported: {{ acceptedTypes }}
        </p>
      </div>
      
      <div v-if="uploading" class="upload-progress">
        <Icon name="loading" class="animate-spin text-2xl" />
        <p>Uploading... {{ uploadProgress }}%</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>
      
      <div v-if="uploadedFile" class="upload-success">
        <Icon name="check-circle" class="text-green-500 text-2xl" />
        <p>{{ uploadedFile.name }} uploaded successfully!</p>
        <button @click="resetUpload" class="text-blue-500">Upload another</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  acceptedTypes?: string
  maxSizeMB?: number
}

const props = withDefaults(defineProps<Props>(), {
  acceptedTypes: 'image/*',
  maxSizeMB: 2
})

const emit = defineEmits<{
  uploaded: [file: { name: string; url: string; key: string }]
}>()

const { user } = useAuth()
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedFile = ref<{ name: string; url: string; key: string } | null>(null)

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file: File) => {
  // ✅ 验证文件大小
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    alert(`File too large. Max size: ${props.maxSizeMB}MB`)
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // 🔑 获取预签名 URL
    const { presignedUrl, fileKey, publicUrl } = await $fetch('/api/upload/presign', {
      method: 'POST',
      body: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    })
    
    // 📤 直传到 R2
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        uploadedFile.value = {
          name: file.name,
          url: publicUrl,
          key: fileKey
        }
        emit('uploaded', uploadedFile.value)
      } else {
        throw new Error('Upload failed')
      }
      uploading.value = false
    }
    
    xhr.onerror = () => {
      uploading.value = false
      alert('Upload failed. Please try again.')
    }
    
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
    
  } catch (error) {
    console.error('Upload error:', error)
    uploading.value = false
    alert('Upload failed. Please try again.')
  }
}

const resetUpload = () => {
  uploadedFile.value = null
  uploadProgress.value = 0
}
</script>
```

## 🚀 部署配置

### Docker 容器化部署配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://knzn_user:${DATABASE_PASSWORD}@postgres:5432/knzn_production
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: knzn_production
      POSTGRES_USER: knzn_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Nuxt 配置 (Docker 部署优化)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // 🎨 CSS 框架
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/main.css'
  ],
  
  // 📦 模块配置
  modules: [
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon'
  ],
  
  // ⚡ 运行时配置
  runtimeConfig: {
    // 🔒 私有配置 (仅服务端)
    databaseUrl: process.env.DATABASE_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    lemonSqueezyApiKey: process.env.LEMON_SQUEEZY_API_KEY,
    internalApiKey: process.env.INTERNAL_API_KEY,
    
    // 🌐 公共配置 (客户端可访问)
    public: {
      siteUrl: process.env.SITE_URL || 'https://knzn.net',
      wokwiApiUrl: 'https://wokwi.com/api'
    }
  },
  
  // 🔧 Nitro 配置 (Docker 优化)
  nitro: {
    preset: 'node-server', // 重要：Docker 容器部署
    experimental: {
      wasm: true
    },
    // 🐳 Docker 环境配置
    storage: {
      redis: {
        driver: 'redis',
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    },
    // 📊 性能优化
    minify: true,
    sourceMap: false,
    // 🔒 安全配置 (Nginx 代理环境)
    experimental: {
      payloadExtraction: false // 避免 hydration 问题
    }
  },
  
  // 🏗️ 构建配置
  build: {
    transpile: ['@headlessui/vue']
  },
  
  // 🔍 SEO 配置
  app: {
    head: {
      title: 'KNZN - Hardware Learning Platform',
      meta: [
        { name: 'description', content: 'Learn hardware engineering through interactive simulations and gamified experiences.' },
        { name: 'keywords', content: 'hardware, electronics, learning, simulation, wokwi, arduino' }
      ]
    }
  },
  
  // 🌐 服务端渲染配置
  ssr: true,
  
  // 🔒 安全配置 (重要：Nginx 代理环境)
  security: {
    headers: {
      crossOriginEmbedderPolicy: false, // Wokwi iframe 需要
      contentSecurityPolicy: {
        'frame-src': ['https://wokwi.com', 'https://knzn.lemonsqueezy.com']
      }
    }
  }
})
```

## 📊 开发工作流

### 本地开发环境

```bash
# 🚀 快速启动
git clone https://github.com/your-org/knzn-project.git
cd knzn-project

# 📦 安装依赖
pnpm install

# 🔧 环境配置
cp .env.example .env.local
# 编辑 .env.local 填入必要的环境变量

# 🗄️ 数据库迁移
pnpm db:migrate

# 🌱 数据库种子
pnpm db:seed

# 🏃‍♂️ 启动开发服务器
pnpm dev
```

### 数据库管理

```bash
# 📊 生成迁移文件
pnpm drizzle-kit generate:pg

# 🔄 执行迁移
pnpm drizzle-kit push:pg

# 🌱 重置数据库 (开发环境)
pnpm db:reset

# 📈 查看数据库状态
pnpm drizzle-kit introspect:pg
```

### 部署流程

```bash
# 🚀 部署到 Contabo VPS
docker-compose up -d --build

# 🔍 检查部署状态
docker-compose ps

# 📊 查看部署日志
docker-compose logs -f
```

---

**文档版本**: v2.0 - KNZN 专用版  
**最后更新**: 2024-12-23  
**适用项目**: KNZN 硬件学习平台  
**技术栈**: Nuxt 4 + Drizzle + Better-Auth + Contabo VPS

这份文档是 KNZN 项目的技术圣经，涵盖了从架构设计到部署上线的完整流程。遵循"个人开发者高效率"原则，摒弃了企业级的复杂性，专注于快速开发和低运维成本。

## 📱 移动端适配策略 (Magic Link 跨端接力)

### 移动端拦截中间件

```typescript
// middleware/mobile-redirect.ts
export default defineNuxtRouteMiddleware((to) => {
  // 🔍 检测移动设备
  const userAgent = useRequestHeaders()['user-agent'] || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // 📱 移动端访问关卡页面时拦截
  if (isMobile && to.path.startsWith('/lesson/')) {
    // 🚫 强制拦截，重定向到移动端提示页
    return navigateTo({
      path: '/mobile-redirect',
      query: {
        returnTo: to.fullPath,
        lessonId: to.params.id
      }
    })
  }
})
```

### Magic Link 跨端接力页面

```vue
<!-- pages/mobile-redirect.vue -->
<template>
  <div class="mobile-redirect-page">
    <div class="container">
      <!-- 📱 移动端提示 -->
      <div class="mobile-notice">
        <Icon name="desktop-computer" class="desktop-icon" />
        <h1>🖥️ Desktop Experience Required</h1>
        <p>KNZN's interactive circuit simulations work best on desktop computers with larger screens and full keyboard support.</p>
      </div>
      
      <!-- 🔗 Magic Link 发送区域 -->
      <div class="magic-link-section">
        <h2>📧 Continue on Desktop</h2>
        <p>We'll send you a magic link to continue this lesson on your computer:</p>
        
        <form @submit.prevent="sendMagicLink" class="magic-link-form">
          <div class="input-group">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email address"
              required
              class="email-input"
              :disabled="sending"
            />
            <button 
              type="submit" 
              :disabled="sending || !email"
              class="send-btn"
            >
              <Icon v-if="sending" name="loading" class="animate-spin" />
              {{ sending ? 'Sending...' : 'Send Magic Link' }}
            </button>
          </div>
        </form>
        
        <!-- ✅ 发送成功提示 -->
        <div v-if="sent" class="success-message">
          <Icon name="check-circle" class="text-green-500" />
          <p>Magic link sent to <strong>{{ email }}</strong>!</p>
          <p class="text-sm text-gray-600">Check your email and click the link to continue on desktop.</p>
        </div>
      </div>
      
      <!-- 📋 课程预览 -->
      <div v-if="lessonPreview" class="lesson-preview">
        <h3>📚 Lesson Preview: {{ lessonPreview.title }}</h3>
        <p>{{ lessonPreview.description }}</p>
        
        <div class="preview-features">
          <div class="feature">
            <Icon name="cpu" />
            <span>Interactive Circuit Simulation</span>
          </div>
          <div class="feature">
            <Icon name="code" />
            <span>Real-time Code Editing</span>
          </div>
          <div class="feature">
            <Icon name="chart-bar" />
            <span>Logic Analyzer Tools</span>
          </div>
        </div>
      </div>
      
      <!-- 🏠 返回首页 -->
      <div class="navigation">
        <NuxtLink to="/" class="home-btn">
          <Icon name="home" />
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()

const email = ref(user.value?.email || '')
const sending = ref(false)
const sent = ref(false)
const lessonPreview = ref(null)

const returnTo = route.query.returnTo as string
const lessonId = route.query.lessonId as string

// 📚 获取课程预览信息
if (lessonId) {
  const { data } = await $fetch(`/api/lessons/${lessonId}/preview`)
  lessonPreview.value = data
}

// 📧 发送 Magic Link
const sendMagicLink = async () => {
  if (!email.value || sending.value) return
  
  sending.value = true
  
  try {
    await $fetch('/api/auth/magic-link/progress-handoff', {
      method: 'POST',
      body: {
        email: email.value,
        returnTo,
        lessonId,
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          source: 'mobile-redirect'
        }
      }
    })
    
    sent.value = true
  } catch (error) {
    console.error('Magic link error:', error)
    alert('Failed to send magic link. Please try again.')
  } finally {
    sending.value = false
  }
}

// 🔍 SEO 配置
useSeoMeta({
  title: 'Continue on Desktop - KNZN',
  description: 'KNZN circuit simulations work best on desktop. Get a magic link to continue your lesson.',
  robots: 'noindex, nofollow'
})
</script>

<style scoped>
.mobile-redirect-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.mobile-notice {
  margin-bottom: 40px;
}

.desktop-icon {
  font-size: 4rem;
  color: #00ff88;
  margin-bottom: 20px;
}

.magic-link-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.magic-link-form {
  margin: 20px 0;
}

.input-group {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.email-input {
  padding: 15px;
  border: 2px solid #00ff88;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 16px;
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.send-btn {
  padding: 15px 30px;
  background: #00ff88;
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #00cc6a;
  transform: translateY(-2px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background: rgba(0, 255, 136, 0.2);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #00ff88;
  margin-top: 20px;
}

.lesson-preview {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.preview-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00ff88;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (min-width: 640px) {
  .input-group {
    flex-direction: row;
  }
  
  .email-input {
    flex: 1;
  }
}
</style>
```

### 进度接力 Magic Link API

```typescript
// server/api/auth/magic-link/progress-handoff.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, returnTo, lessonId, deviceInfo } = body
  
  try {
    // 🔍 查找或创建用户
    let user = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (!user.length) {
      // 🆕 创建新用户 (临时账户)
      const newUser = await db.insert(users).values({
        id: nanoid(),
        email,
        name: email.split('@')[0], // 临时用户名
        createdAt: new Date(),
        isTempAccount: true // 标记为临时账户
      }).returning()
      
      user = newUser
    }
    
    // 🔑 生成进度接力令牌
    const handoffToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30分钟有效
    
    // 💾 保存接力会话
    await db.insert(progressHandoffSessions).values({
      id: nanoid(),
      userId: user[0].id,
      token: handoffToken,
      returnTo,
      lessonId,
      deviceInfo: JSON.stringify(deviceInfo),
      expiresAt,
      createdAt: new Date()
    })
    
    // 📧 发送 Magic Link 邮件
    const magicLinkUrl = `${process.env.SITE_URL}/auth/progress-handoff?token=${handoffToken}`
    
    await sendEmail({
      to: email,
      template: 'progress-handoff-magic-link',
      data: {
        magicLinkUrl,
        lessonTitle: await getLessonTitle(lessonId),
        expiresIn: '30 minutes'
      }
    })
    
    return {
      success: true,
      message: 'Magic link sent successfully'
    }
  } catch (error) {
    console.error('Progress handoff error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send magic link'
    })
  }
})

// 📚 获取课程标题
const getLessonTitle = async (lessonId: string): Promise<string> => {
  if (!lessonId) return 'KNZN Lesson'
  
  try {
    const lesson = await db.select({ title: lessons.title })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1)
    
    return lesson[0]?.title || 'KNZN Lesson'
  } catch {
    return 'KNZN Lesson'
  }
}
```

### 进度接力验证页面

```vue
<!-- pages/auth/progress-handoff.vue -->
<template>
  <div class="progress-handoff-page">
    <div class="container">
      <!-- ⏳ 验证中 -->
      <div v-if="verifying" class="verifying">
        <Icon name="loading" class="animate-spin text-4xl text-blue-500" />
        <h2>Verifying your magic link...</h2>
        <p>Please wait while we set up your session.</p>
      </div>
      
      <!-- ✅ 验证成功 -->
      <div v-else-if="verified" class="success">
        <Icon name="check-circle" class="text-6xl text-green-500" />
        <h2>Welcome back! 🎉</h2>
        <p>Your progress has been restored. Redirecting to your lesson...</p>
        
        <div class="lesson-info" v-if="lessonInfo">
          <h3>📚 {{ lessonInfo.title }}</h3>
          <p>{{ lessonInfo.description }}</p>
        </div>
        
        <div class="countdown">
          <p>Redirecting in {{ countdown }} seconds...</p>
          <button @click="redirectNow" class="redirect-btn">
            Continue Now
          </button>
        </div>
      </div>
      
      <!-- ❌ 验证失败 -->
      <div v-else class="error">
        <Icon name="x-circle" class="text-6xl text-red-500" />
        <h2>Invalid or Expired Link</h2>
        <p>This magic link is invalid or has expired. Please request a new one.</p>
        
        <div class="actions">
          <NuxtLink to="/" class="home-btn">
            <Icon name="home" />
            Go to Home
          </NuxtLink>
          <NuxtLink to="/auth/signin" class="signin-btn">
            <Icon name="login" />
            Sign In
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { signIn } = useAuth()

const verifying = ref(true)
const verified = ref(false)
const lessonInfo = ref(null)
const countdown = ref(5)
const redirectUrl = ref('/')

const token = route.query.token as string

// 🔍 验证 Magic Link
const verifyMagicLink = async () => {
  if (!token) {
    verifying.value = false
    return
  }
  
  try {
    const response = await $fetch('/api/auth/verify-progress-handoff', {
      method: 'POST',
      body: { token }
    })
    
    if (response.success) {
      // ✅ 验证成功，自动登录
      await signIn(response.user.email, response.tempPassword)
      
      verified.value = true
      redirectUrl.value = response.returnTo || '/skill-map'
      lessonInfo.value = response.lessonInfo
      
      // 🔄 开始倒计时重定向
      startCountdown()
    } else {
      verifying.value = false
    }
  } catch (error) {
    console.error('Magic link verification error:', error)
    verifying.value = false
  }
}

// ⏰ 倒计时重定向
const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      redirectNow()
    }
  }, 1000)
}

// 🚀 立即重定向
const redirectNow = () => {
  navigateTo(redirectUrl.value)
}

// 🔄 页面加载时验证
onMounted(() => {
  verifyMagicLink()
})

// 🔍 SEO 配置
useSeoMeta({
  title: 'Progress Handoff - KNZN',
  robots: 'noindex, nofollow'
})
</script>
```
## 🏗️ 关卡内容管理系统 (Lesson Generator Service)

### JSON Schema 校验系统

```typescript
// server/utils/lesson-schema.ts
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// 🔧 初始化 AJV 校验器
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

// 📋 关卡配置 JSON Schema
export const LESSON_CONFIG_SCHEMA = {
  type: 'object',
  required: ['id', 'title', 'description', 'phases', 'wokwi'],
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-z0-9-]+$',
      minLength: 3,
      maxLength: 50
    },
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 100
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 500
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced']
    },
    estimatedTime: {
      type: 'integer',
      minimum: 5,
      maximum: 180
    },
    prerequisites: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[a-z0-9-]+$'
      }
    },
    
    // 🎯 学习阶段配置
    phases: {
      type: 'array',
      minItems: 1,
      maxItems: 6,
      items: {
        type: 'object',
        required: ['id', 'title', 'type', 'content'],
        properties: {
          id: {
            type: 'string',
            enum: ['theory', 'practice', 'debug', 'reflection', 'challenge', 'assessment']
          },
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 50
          },
          type: {
            type: 'string',
            enum: ['reading', 'simulation', 'coding', 'quiz', 'debugging']
          },
          content: {
            type: 'object',
            properties: {
              markdown: { type: 'string' },
              tasks: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'title', 'description', 'verification'],
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    verification: {
                      type: 'object',
                      required: ['type'],
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['serial', 'component', 'timing', 'pattern', 'custom']
                        },
                        pattern: { type: 'string' },
                        timeout: { type: 'integer', minimum: 1000 },
                        customValidator: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    
    // 🔬 Wokwi 仿真配置
    wokwi: {
      type: 'object',
      required: ['projectId'],
      properties: {
        projectId: {
          type: 'string',
          pattern: '^[0-9]+$'
        },
        customChips: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'behavior'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              behavior: { type: 'string' }
            }
          }
        },
        xrayConfig: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            monitorPins: {
              type: 'array',
              items: { type: 'string' }
            },
            sampleRate: {
              type: 'integer',
              minimum: 1,
              maximum: 1000
            }
          }
        }
      }
    },
    
    // 🏆 成就和奖励
    rewards: {
      type: 'object',
      properties: {
        xp: {
          type: 'integer',
          minimum: 10,
          maximum: 1000
        },
        badges: {
          type: 'array',
          items: { type: 'string' }
        },
        unlocks: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
}

// ✅ 编译 Schema 校验器
export const validateLessonConfig = ajv.compile(LESSON_CONFIG_SCHEMA)

// 🔍 校验关卡配置
export const validateLesson = (config: any): { valid: boolean; errors?: string[] } => {
  const valid = validateLessonConfig(config)
  
  if (!valid) {
    const errors = validateLessonConfig.errors?.map(error => {
      const path = error.instancePath || 'root'
      return `${path}: ${error.message}`
    }) || []
    
    return { valid: false, errors }
  }
  
  return { valid: true }
}
```

### 关卡生成器服务

```typescript
// server/api/admin/lessons/generate.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { template, parameters } = body
  
  // 🔐 验证管理员权限
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  try {
    // 🏗️ 根据模板生成关卡配置
    const generatedConfig = await generateLessonFromTemplate(template, parameters)
    
    // ✅ 校验生成的配置
    const validation = validateLesson(generatedConfig)
    if (!validation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Generated lesson config is invalid',
        data: { errors: validation.errors }
      })
    }
    
    // 💾 保存到数据库
    const lesson = await db.insert(lessons).values({
      id: nanoid(),
      configId: generatedConfig.id,
      title: generatedConfig.title,
      description: generatedConfig.description,
      difficulty: generatedConfig.difficulty,
      config: JSON.stringify(generatedConfig),
      status: 'draft',
      createdBy: admin.id,
      createdAt: new Date()
    }).returning()
    
    return {
      success: true,
      lesson: lesson[0],
      config: generatedConfig
    }
  } catch (error) {
    console.error('Lesson generation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Lesson generation failed'
    })
  }
})

// 🏗️ 关卡模板生成器
const generateLessonFromTemplate = async (template: string, parameters: any) => {
  switch (template) {
    case 'basic-led':
      return generateBasicLEDLesson(parameters)
    case 'sensor-reading':
      return generateSensorLesson(parameters)
    case 'communication-protocol':
      return generateCommunicationLesson(parameters)
    default:
      throw new Error(`Unknown template: ${template}`)
  }
}

// 💡 基础 LED 关卡生成器
const generateBasicLEDLesson = (params: any) => {
  const { ledCount = 1, difficulty = 'beginner', includeButton = false } = params
  
  return {
    id: `basic-led-${ledCount}-${Date.now()}`,
    title: `Control ${ledCount} LED${ledCount > 1 ? 's' : ''}`,
    description: `Learn to control ${ledCount} LED${ledCount > 1 ? 's' : ''} using Arduino digital outputs${includeButton ? ' and button input' : ''}.`,
    difficulty,
    estimatedTime: 15 + (ledCount * 5),
    prerequisites: difficulty === 'beginner' ? [] : ['basic-electronics'],
    
    phases: [
      {
        id: 'theory',
        title: 'Understanding LEDs',
        type: 'reading',
        content: {
          markdown: `
# LED Basics

LEDs (Light Emitting Diodes) are semiconductor devices that emit light when current flows through them.

## Key Concepts:
- **Forward Voltage**: Typically 2-3V for standard LEDs
- **Current Limiting**: Always use resistors to limit current
- **Polarity**: LEDs have positive (anode) and negative (cathode) terminals

${ledCount > 1 ? `
## Multiple LEDs
When controlling multiple LEDs, you can:
- Use separate pins for individual control
- Use multiplexing for efficient pin usage
- Create patterns and animations
` : ''}
          `
        }
      },
      {
        id: 'practice',
        title: 'Build the Circuit',
        type: 'simulation',
        content: {
          tasks: [
            {
              id: 'connect-led',
              title: 'Connect LED to Pin 13',
              description: 'Wire the LED with a 220Ω resistor to digital pin 13',
              verification: {
                type: 'component',
                pattern: 'LED_CONNECTED_PIN_13'
              }
            },
            ...(ledCount > 1 ? Array.from({ length: ledCount - 1 }, (_, i) => ({
              id: `connect-led-${i + 2}`,
              title: `Connect LED ${i + 2}`,
              description: `Wire LED ${i + 2} to pin ${12 - i}`,
              verification: {
                type: 'component',
                pattern: `LED_CONNECTED_PIN_${12 - i}`
              }
            })) : []),
            {
              id: 'upload-code',
              title: 'Upload Blink Code',
              description: 'Upload the blink sketch to make the LED flash',
              verification: {
                type: 'serial',
                pattern: 'LED.*ON|LED.*OFF',
                timeout: 5000
              }
            }
          ]
        }
      }
    ],
    
    wokwi: {
      projectId: generateWokwiProject(ledCount, includeButton),
      xrayConfig: {
        enabled: true,
        monitorPins: Array.from({ length: ledCount }, (_, i) => `D${13 - i}`),
        sampleRate: 60
      }
    },
    
    rewards: {
      xp: 50 + (ledCount * 10),
      badges: ledCount === 1 ? ['first-led'] : ['multi-led-master'],
      unlocks: difficulty === 'beginner' ? ['basic-button'] : []
    }
  }
}

// 🔬 生成 Wokwi 项目配置
const generateWokwiProject = (ledCount: number, includeButton: boolean): string => {
  // 这里可以调用 Wokwi API 创建项目，或返回预设项目 ID
  const projectTemplates = {
    '1-led': '394142936442478593',
    '2-led': '394142936442478594',
    '3-led': '394142936442478595',
    '1-led-button': '394142936442478596'
  }
  
  const key = `${ledCount}-led${includeButton ? '-button' : ''}`
  return projectTemplates[key] || projectTemplates['1-led']
}
```

### 关卡配置验证 API

```typescript
// server/api/admin/lessons/validate.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { config } = body
  
  // 🔐 验证权限
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  try {
    // ✅ 基础 Schema 校验
    const validation = validateLesson(config)
    
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        warnings: []
      }
    }
    
    // 🔍 深度校验
    const deepValidation = await performDeepValidation(config)
    
    return {
      valid: deepValidation.valid,
      errors: deepValidation.errors,
      warnings: deepValidation.warnings,
      suggestions: deepValidation.suggestions
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Validation failed'
    })
  }
})

// 🔍 深度校验逻辑
const performDeepValidation = async (config: any) => {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // 🔗 检查前置条件
  if (config.prerequisites?.length > 0) {
    for (const prereq of config.prerequisites) {
      const exists = await db.select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.configId, prereq))
        .limit(1)
      
      if (!exists.length) {
        errors.push(`Prerequisite lesson '${prereq}' does not exist`)
      }
    }
  }
  
  // 🔬 验证 Wokwi 项目
  if (config.wokwi?.projectId) {
    const wokwiValid = await validateWokwiProject(config.wokwi.projectId)
    if (!wokwiValid) {
      errors.push(`Wokwi project '${config.wokwi.projectId}' is not accessible`)
    }
  }
  
  // 📊 检查任务验证逻辑
  for (const phase of config.phases) {
    if (phase.content?.tasks) {
      for (const task of phase.content.tasks) {
        if (task.verification?.type === 'custom' && !task.verification.customValidator) {
          errors.push(`Task '${task.id}' has custom verification but no validator function`)
        }
        
        if (task.verification?.type === 'serial' && !task.verification.pattern) {
          warnings.push(`Task '${task.id}' uses serial verification but no pattern specified`)
        }
      }
    }
  }
  
  // 💡 生成改进建议
  if (config.estimatedTime < 10) {
    suggestions.push('Consider increasing estimated time - very short lessons may not provide enough learning value')
  }
  
  if (config.phases.length === 1) {
    suggestions.push('Consider adding more phases (theory, practice, reflection) for better learning experience')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

// 🔬 验证 Wokwi 项目可访问性
const validateWokwiProject = async (projectId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://wokwi.com/api/projects/${projectId}`, {
      method: 'HEAD'
    })
    return response.ok
  } catch {
    return false
  }
}
```