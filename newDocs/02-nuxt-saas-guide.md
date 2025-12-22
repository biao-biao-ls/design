# Nuxt 4 SaaS 项目技术指导文档

## 📋 文档概述

**适用场景**: 中小型 SaaS 产品、B2B 平台、内容管理系统  
**技术特点**: Nuxt 4 全栈 + 类型安全 + 快速部署  
**参考项目**: 硬件学习平台的前端架构  
**文档版本**: v1.0  

## 🎯 架构概述

基于 Nuxt 4 的全栈 SaaS 解决方案，适用于需要快速上线、成本可控的中小型项目：

- **全栈一体**: Nuxt 4 + Nitro 服务端，减少架构复杂度
- **类型安全**: TypeScript + Zod Schema 全链路类型保护
- **快速部署**: Vercel/Netlify 一键部署，零运维成本
- **成本优化**: 无需独立后端服务器，降低运营成本

## 🏗️ 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层 (Client Layer)                    │
├─────────────────────────────────────────────────────────────────┤
│ Web Browser │ Mobile Browser │ PWA │ API Clients               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN 层 (Vercel Edge)                      │
├─────────────────────────────────────────────────────────────────┤
│ • 全球边缘节点缓存                                              │
│ • 静态资源分发                                                  │
│ • 自动 HTTPS 和域名管理                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nuxt 4 全栈应用                             │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (Vue 3)        │ Backend (Nitro Server)               │
│ • 用户界面              │ • API Routes (/api/*)                │
│ • 管理后台              │ • 认证系统                           │
│ • 响应式设计            │ • 业务逻辑处理                       │
│ • PWA 支持              │ • 数据验证                           │
│ • SEO 优化              │ • 文件上传                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│ Serverless DB         │ 文件存储          │ 第三方服务          │
│ • Supabase/PlanetScale│ • Cloudflare R2   │ • 邮件服务          │
│ • PostgreSQL          │ • Vercel Blob     │ • 支付服务          │
│ • Prisma ORM          │ • 图片 CDN        │ • 分析服务          │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈选型

#### 核心技术栈
```typescript
const SAAS_TECH_STACK = {
  // 全栈框架
  framework: 'Nuxt 4',
  runtime: 'Nitro (Node.js)',
  
  // 前端技术
  frontend: {
    ui: 'Vue 3 + Composition API',
    styling: 'UnoCSS + Headless UI',
    stateManagement: 'Pinia',
    forms: 'VeeValidate + Zod',
    icons: '@nuxt/icon',
    animations: 'Motion One'
  },
  
  // 后端技术
  backend: {
    server: 'Nitro (内置)',
    database: 'Supabase/PlanetScale',
    orm: 'Prisma',
    auth: 'Supabase Auth / Auth0',
    validation: 'Zod',
    storage: 'Cloudflare R2 / Vercel Blob'
  },
  
  // 开发工具
  development: {
    language: 'TypeScript',
    linting: 'ESLint + Prettier',
    testing: 'Vitest + Playwright',
    deployment: 'Vercel / Netlify'
  }
}
```

## 📁 项目结构

### Nuxt 4 目录结构

```
saas-project/
├── app/                           # Nuxt 4 应用目录
│   ├── components/                # Vue 组件
│   │   ├── ui/                   # 基础 UI 组件
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   └── index.ts
│   │   ├── forms/                # 表单组件
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   └── ContactForm.vue
│   │   ├── layout/               # 布局组件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── Sidebar.vue
│   │   └── dashboard/            # 仪表板组件
│   │       ├── StatsCard.vue
│   │       ├── Chart.vue
│   │       └── DataTable.vue
│   │
│   ├── composables/              # 组合式函数
│   │   ├── useAuth.ts            # 认证逻辑
│   │   ├── useApi.ts             # API 调用
│   │   ├── useSubscription.ts    # 订阅管理
│   │   ├── useNotification.ts    # 通知系统
│   │   └── useLocalStorage.ts    # 本地存储
│   │
│   ├── layouts/                  # 布局模板
│   │   ├── default.vue           # 默认布局
│   │   ├── auth.vue              # 认证页面布局
│   │   ├── dashboard.vue         # 仪表板布局
│   │   └── landing.vue           # 落地页布局
│   │
│   ├── pages/                    # 页面路由
│   │   ├── index.vue             # 首页
│   │   ├── pricing.vue           # 定价页
│   │   ├── about.vue             # 关于页面
│   │   ├── auth/                 # 认证相关页面
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   └── forgot-password.vue
│   │   ├── dashboard/            # 仪表板页面
│   │   │   ├── index.vue         # 仪表板首页
│   │   │   ├── settings.vue      # 设置页面
│   │   │   ├── billing.vue       # 账单页面
│   │   │   └── profile.vue       # 个人资料
│   │   └── admin/                # 管理员页面
│   │       ├── users.vue
│   │       ├── analytics.vue
│   │       └── settings.vue
│   │
│   ├── plugins/                  # Nuxt 插件
│   │   ├── auth.client.ts        # 客户端认证
│   │   ├── api.ts                # API 配置
│   │   └── toast.client.ts       # 通知插件
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── auth.ts               # 认证状态
│   │   ├── user.ts               # 用户状态
│   │   ├── subscription.ts       # 订阅状态
│   │   └── notification.ts       # 通知状态
│   │
│   ├── utils/                    # 工具函数
│   │   ├── validation.ts         # 验证规则
│   │   ├── format.ts             # 格式化函数
│   │   ├── constants.ts          # 常量定义
│   │   └── helpers.ts            # 辅助函数
│   │
│   └── app.vue                   # 根组件
│
├── server/                       # 服务端代码
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证 API
│   │   │   ├── login.post.ts
│   │   │   ├── register.post.ts
│   │   │   └── logout.post.ts
│   │   ├── users/                # 用户 API
│   │   │   ├── index.get.ts      # 获取用户列表
│   │   │   ├── [id].get.ts       # 获取单个用户
│   │   │   ├── [id].put.ts       # 更新用户
│   │   │   └── [id].delete.ts    # 删除用户
│   │   ├── subscription/         # 订阅 API
│   │   │   ├── plans.get.ts
│   │   │   ├── subscribe.post.ts
│   │   │   └── cancel.post.ts
│   │   └── admin/                # 管理员 API
│   │       ├── analytics.get.ts
│   │       └── settings.get.ts
│   │
│   ├── middleware/               # 服务端中间件
│   │   ├── auth.ts               # 认证中间件
│   │   ├── admin.ts              # 管理员权限
│   │   └── cors.ts               # CORS 配置
│   │
│   └── utils/                    # 服务端工具
│       ├── database.ts           # 数据库连接
│       ├── auth.ts               # 认证工具
│       ├── email.ts              # 邮件服务
│       └── validation.ts         # 服务端验证
│
├── types/                        # TypeScript 类型
│   ├── auth.ts                   # 认证相关类型
│   ├── user.ts                   # 用户相关类型
│   ├── subscription.ts           # 订阅相关类型
│   └── api.ts                    # API 响应类型
│
├── prisma/                       # Prisma 配置
│   ├── schema.prisma             # 数据库模型
│   ├── migrations/               # 数据库迁移
│   └── seed.ts                   # 种子数据
│
├── public/                       # 静态资源
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│
├── nuxt.config.ts                # Nuxt 配置
├── package.json                  # 项目配置
├── tailwind.config.ts            # Tailwind 配置
├── uno.config.ts                 # UnoCSS 配置
└── .env                          # 环境变量
```

## 🔧 核心配置

### 1. Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // 模块配置
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/icon',
    '@vee-validate/nuxt',
    '@nuxtjs/supabase' // 如果使用 Supabase
  ],
  
  // CSS 配置
  css: [
    '@unocss/reset/tailwind.css'
  ],
  
  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅服务端）
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    
    // 公共配置（客户端可访问）
    public: {
      siteUrl: process.env.SITE_URL || 'https://myapp.com',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },
  
  // SEO 配置
  app: {
    head: {
      title: 'My SaaS App',
      meta: [
        { name: 'description', content: 'Amazing SaaS application' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // Nitro 配置
  nitro: {
    experimental: {
      wasm: true
    }
  },
  
  // TypeScript 配置
  typescript: {
    typeCheck: true
  }
})
```

### 2. 类型定义

```typescript
// types/auth.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位')
})

export const RegisterSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码不匹配",
  path: ["confirmPassword"]
})

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']),
  subscription: z.object({
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
    status: z.enum(['ACTIVE', 'CANCELED', 'EXPIRED']),
    expiresAt: z.date().optional()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// 导出类型
export type LoginDto = z.infer<typeof LoginSchema>
export type RegisterDto = z.infer<typeof RegisterSchema>
export type User = z.infer<typeof UserSchema>
```

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 3. 数据库模型

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  avatar    String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 订阅关系
  subscription Subscription?
  
  // 其他关系
  posts     Post[]
  comments  Comment[]

  @@map("users")
}

model Subscription {
  id        String           @id @default(cuid())
  userId    String           @unique
  plan      SubscriptionPlan @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)
  expiresAt DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  // 关联关系
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联关系
  author   User      @relation(fields: [authorId], references: [id])
  comments Comment[]

  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联关系
  post   Post @relation(fields: [postId], references: [id])
  author User @relation(fields: [authorId], references: [id])

  @@map("comments")
}

enum Role {
  USER
  ADMIN
}

enum SubscriptionPlan {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
}
```

## 🎨 前端开发

### 1. 认证系统

```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const loading = ref(false)

  const login = async (credentials: LoginDto) => {
    loading.value = true
    try {
      const { data } = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (data) {
        user.value = data.user
        
        // 设置认证 cookie
        const token = useCookie('auth-token', {
          default: () => null,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: true,
          sameSite: 'strict'
        })
        token.value = data.token

        await navigateTo('/dashboard')
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterDto) => {
    loading.value = true
    try {
      const { data } = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (data) {
        user.value = data.user
        
        const token = useCookie('auth-token')
        token.value = data.token

        await navigateTo('/dashboard')
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      const token = useCookie('auth-token')
      token.value = null
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await $fetch<ApiResponse<User>>('/api/auth/me')
      if (data) {
        user.value = data
      }
    } catch (error) {
      console.error('Fetch user error:', error)
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    register,
    logout,
    fetchUser
  }
}
```

```vue
<!-- app/components/forms/LoginForm.vue -->
<template>
  <form @submit="onSubmit" class="space-y-6">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        邮箱地址
      </label>
      <div class="mt-1">
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': errors.email }"
        >
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">
          {{ errors.email }}
        </p>
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        密码
      </label>
      <div class="mt-1">
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': errors.password }"
        >
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
          {{ errors.password }}
        </p>
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin -ml-1 mr-3 h-5 w-5" />
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { LoginSchema, type LoginDto } from '~/types/auth'

const { login } = useAuth()
const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(LoginSchema)
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const loading = ref(false)

const onSubmit = handleSubmit(async (values: LoginDto) => {
  loading.value = true
  try {
    await login(values)
  } catch (error: any) {
    const toast = useToast()
    toast.add({
      title: '登录失败',
      description: error.data?.message || '请检查邮箱和密码',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
})
</script>
```

### 2. 仪表板组件

```vue
<!-- app/components/dashboard/StatsCard.vue -->
<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <Icon :name="icon" class="h-6 w-6 text-gray-400" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ title }}
            </dt>
            <dd>
              <div class="text-lg font-medium text-gray-900">
                {{ formattedValue }}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="change !== undefined" class="bg-gray-50 px-5 py-3">
      <div class="text-sm">
        <span
          class="font-medium"
          :class="{
            'text-green-600': change > 0,
            'text-red-600': change < 0,
            'text-gray-600': change === 0
          }"
        >
          <Icon
            v-if="change > 0"
            name="heroicons:arrow-trending-up"
            class="inline h-4 w-4"
          />
          <Icon
            v-else-if="change < 0"
            name="heroicons:arrow-trending-down"
            class="inline h-4 w-4"
          />
          {{ Math.abs(change) }}%
        </span>
        <span class="text-gray-600 ml-1">
          与上月相比
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  icon: string
  change?: number
  formatter?: (value: number | string) => string
}

const props = withDefaults(defineProps<Props>(), {
  formatter: (value) => String(value)
})

const formattedValue = computed(() => {
  return props.formatter(props.value)
})
</script>
```

### 3. 订阅管理

```typescript
// app/composables/useSubscription.ts
export const useSubscription = () => {
  const subscription = useState<Subscription | null>('subscription', () => null)

  const fetchSubscription = async () => {
    try {
      const { data } = await $fetch<ApiResponse<Subscription>>('/api/subscription')
      if (data) {
        subscription.value = data
      }
    } catch (error) {
      console.error('Fetch subscription error:', error)
    }
  }

  const subscribe = async (planId: string) => {
    try {
      const { data } = await $fetch<ApiResponse<{ checkoutUrl: string }>>('/api/subscription/checkout', {
        method: 'POST',
        body: { planId }
      })

      if (data?.checkoutUrl) {
        // 跳转到支付页面
        await navigateTo(data.checkoutUrl, { external: true })
      }
    } catch (error) {
      throw error
    }
  }

  const cancelSubscription = async () => {
    try {
      await $fetch('/api/subscription/cancel', { method: 'POST' })
      await fetchSubscription() // 刷新订阅状态
    } catch (error) {
      throw error
    }
  }

  const isActive = computed(() => {
    return subscription.value?.status === 'ACTIVE'
  })

  const isPro = computed(() => {
    return subscription.value?.plan === 'PRO' && isActive.value
  })

  const isEnterprise = computed(() => {
    return subscription.value?.plan === 'ENTERPRISE' && isActive.value
  })

  return {
    subscription: readonly(subscription),
    fetchSubscription,
    subscribe,
    cancelSubscription,
    isActive,
    isPro,
    isEnterprise
  }
}
```

## 🚀 后端开发

### 1. API 路由

```typescript
// server/api/auth/login.post.ts
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { LoginSchema } from '~/types/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证输入数据
    const validatedData = LoginSchema.parse(body)
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { subscription: true }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '邮箱或密码错误'
      })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: '邮箱或密码错误'
      })
    }

    // 生成 JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: '输入数据格式错误',
        data: error.errors
      })
    }
    throw error
  }
})
```

```typescript
// server/api/users/index.get.ts
export default defineEventHandler(async (event) => {
  try {
    // 验证管理员权限
    const user = await requireAuth(event)
    if (user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '权限不足'
      })
    }

    // 获取查询参数
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string

    // 构建查询条件
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    // 查询用户列表
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              expiresAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw error
  }
})
```

### 2. 中间件

```typescript
// server/utils/auth.ts
import jwt from 'jsonwebtoken'

export async function requireAuth(event: any) {
  const config = useRuntimeConfig()
  
  // 从 header 或 cookie 获取 token
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '') || getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '未提供认证令牌'
    })
  }

  try {
    // 验证 JWT token
    const payload = jwt.verify(token, config.jwtSecret) as any
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { subscription: true }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在'
      })
    }

    return user
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: '无效的认证令牌'
    })
  }
}

export async function requireAdmin(event: any) {
  const user = await requireAuth(event)
  
  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: '需要管理员权限'
    })
  }

  return user
}
```

### 3. 支付集成

```typescript
// server/api/subscription/checkout.post.ts
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const { planId } = await readBody(event)

    const config = useRuntimeConfig()
    const stripe = new Stripe(config.stripeSecretKey)

    // 定义价格计划
    const plans = {
      pro: {
        priceId: 'price_pro_monthly',
        name: 'Pro Plan'
      },
      enterprise: {
        priceId: 'price_enterprise_monthly',
        name: 'Enterprise Plan'
      }
    }

    const plan = plans[planId as keyof typeof plans]
    if (!plan) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的订阅计划'
      })
    }

    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${config.public.siteUrl}/dashboard?success=true`,
      cancel_url: `${config.public.siteUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId
      }
    })

    return {
      success: true,
      data: {
        checkoutUrl: session.url
      }
    }
  } catch (error) {
    throw error
  }
})
```

## 🎨 UI 组件库

### 1. 基础组件

```vue
<!-- app/components/ui/Button.vue -->
<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin -ml-1 mr-2 h-4 w-4" />
    <Icon v-else-if="icon" :name="icon" class="-ml-1 mr-2 h-4 w-4" />
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  tag?: 'button' | 'a' | 'nuxt-link'
  disabled?: boolean
  loading?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  tag: 'button'
})

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300'
  }
  
  return [
    baseClasses,
    sizeClasses[props.size],
    variantClasses[props.variant],
    {
      'opacity-50 cursor-not-allowed': props.disabled || props.loading
    }
  ]
})
</script>
```

```vue
<!-- app/components/ui/Modal.vue -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- 背景遮罩 -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <!-- 模态框内容 -->
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="modelValue"
              class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
              @click.stop
            >
              <!-- 关闭按钮 -->
              <button
                v-if="closable"
                @click="close"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <Icon name="heroicons:x-mark" class="h-6 w-6" />
              </button>
              
              <!-- 标题 -->
              <div v-if="title || $slots.title" class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">
                  <slot name="title">{{ title }}</slot>
                </h3>
              </div>
              
              <!-- 内容 -->
              <div class="px-6 py-4">
                <slot />
              </div>
              
              <!-- 底部操作 -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// 防止页面滚动
watch(() => props.modelValue, (isOpen) => {
  if (process.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>
```

## 🚀 部署配置

### 1. Vercel 部署

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "RESEND_API_KEY": "@resend_api_key"
  },
  "functions": {
    "server/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. 环境变量配置

```bash
# .env.example
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/myapp"

# 认证
JWT_SECRET="your-super-secret-jwt-key"

# 支付
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# 邮件
RESEND_API_KEY="re_..."

# 站点配置
SITE_URL="https://myapp.com"

# Supabase (如果使用)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
```

### 3. 部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 开始部署 SaaS 应用..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
npx prisma migrate deploy

# 3. 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 4. 构建应用
echo "🏗️ 构建应用..."
npm run build

# 5. 部署到 Vercel
echo "☁️ 部署到 Vercel..."
npx vercel --prod

echo "✅ 部署完成！"
```

## 📊 监控和分析

### 1. 错误监控

```typescript
// plugins/error-tracking.client.ts
export default defineNuxtPlugin(() => {
  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // 发送错误到监控服务
    $fetch('/api/errors', {
      method: 'POST',
      body: {
        message: event.error?.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }).catch(() => {
      // 静默处理错误上报失败
    })
  })

  // Vue 错误处理
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('vue:error', (error, context) => {
    console.error('Vue error:', error, context)
    
    $fetch('/api/errors', {
      method: 'POST',
      body: {
        message: error.message,
        stack: error.stack,
        context: JSON.stringify(context),
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }).catch(() => {})
  })
})
```

### 2. 用户分析

```typescript
// composables/useAnalytics.ts
export const useAnalytics = () => {
  const track = (event: string, properties?: Record<string, any>) => {
    if (process.client) {
      // 发送分析事件
      $fetch('/api/analytics/track', {
        method: 'POST',
        body: {
          event,
          properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer
        }
      }).catch(() => {})
    }
  }

  const identify = (userId: string, traits?: Record<string, any>) => {
    if (process.client) {
      $fetch('/api/analytics/identify', {
        method: 'POST',
        body: {
          userId,
          traits,
          timestamp: new Date().toISOString()
        }
      }).catch(() => {})
    }
  }

  return {
    track,
    identify
  }
}
```

## 🔧 最佳实践

### 1. 性能优化

- **代码分割**: 使用 Nuxt 的自动代码分割
- **图片优化**: 使用 `@nuxt/image` 模块
- **缓存策略**: 合理设置 HTTP 缓存头
- **懒加载**: 组件和路由懒加载

### 2. SEO 优化

```typescript
// composables/useSEO.ts
export const useSEO = (options: {
  title?: string
  description?: string
  image?: string
  url?: string
}) => {
  const { $config } = useNuxtApp()
  
  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: options.title,
    ogDescription: options.description,
    ogImage: options.image || `${$config.public.siteUrl}/og-image.jpg`,
    ogUrl: options.url || $config.public.siteUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: options.image
  })
}
```

### 3. 安全考虑

- **输入验证**: 前后端双重验证
- **CSRF 保护**: 使用 CSRF token
- **XSS 防护**: 输出转义和 CSP
- **SQL 注入**: 使用 Prisma ORM
- **认证安全**: JWT + 安全 cookie

## 📋 开发工作流

### 1. 本地开发

```bash
# 启动开发服务器
npm run dev

# 运行数据库迁移
npx prisma migrate dev

# 查看数据库
npx prisma studio

# 运行测试
npm run test

# 类型检查
npm run type-check
```

### 2. 部署流程

```bash
# 构建应用
npm run build

# 预览构建结果
npm run preview

# 部署到 Vercel
npx vercel --prod
```

## 🎯 总结

这套 Nuxt 4 SaaS 架构具有以下优势：

1. **快速开发**: 全栈一体化，减少配置复杂度
2. **类型安全**: TypeScript + Zod 全链路类型保护
3. **成本优化**: 无需独立后端，降低运营成本
4. **易于部署**: Vercel/Netlify 一键部署
5. **SEO 友好**: SSR/SSG 支持，搜索引擎优化
6. **可扩展性**: 模块化设计，易于功能扩展

适用于中小型 SaaS 产品、B2B 平台、内容管理系统等需要快速上线的项目。