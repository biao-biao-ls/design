# Monorepo 全栈项目技术指导文档

## 📋 文档概述

**适用场景**: 需要前后端分离、多端支持的全栈项目  
**技术特点**: Monorepo + TypeScript + 类型共享 + Docker 部署  
**参考项目**: 硬件工程师学习平台  
**文档版本**: v1.0  

## 🎯 架构概述

基于当前硬件学习平台的成功实践，本指导文档提供了一套经过验证的 Monorepo 全栈开发方案，适用于需要以下特性的项目：

- **多端支持**: Web端、管理端、移动端、桌面端
- **类型安全**: 前后端完全类型共享，零联调成本
- **开发效率**: 统一工具链，一键开发环境
- **部署简单**: Docker 容器化，一键部署脚本

## 🏗️ 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                  │
├─────────────────────────────────────────────────────────────────┤
│ Web App (Nuxt 4)  │ Admin (Nuxt 4)  │ Mobile (uni-app)  │ Desktop │
│ Vue 3 + UnoCSS    │ Element Plus    │ Vue 3             │ Electron│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API 网关层 (Nginx)                        │
├─────────────────────────────────────────────────────────────────┤
│ • 路由分发 (域名/路径)                                          │
│ • 负载均衡                                                      │
│ • SSL 终端                                                      │
│ • 静态资源服务                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    后端服务层 (NestJS)                         │
├─────────────────────────────────────────────────────────────────┤
│ • RESTful API                                                   │
│ • GraphQL (可选)                                               │
│ • WebSocket 实时通信                                           │
│ • 任务队列 (BullMQ)                                            │
│ • 文件上传处理                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL        │ Redis           │ 向量数据库        │ 文件存储 │
│ • 主数据库        │ • 缓存          │ • Qdrant         │ • 本地/云 │
│ • Prisma ORM      │ • 会话存储      │ • AI 知识库      │ • 图片视频│
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈选型

#### 核心技术栈
```typescript
const TECH_STACK = {
  // 包管理和构建
  packageManager: 'pnpm',
  buildTool: 'Turborepo',
  
  // 前端技术
  frontend: {
    framework: 'Nuxt 4 (Vue 3)',
    styling: 'UnoCSS + Element Plus',
    stateManagement: 'Pinia',
    utilities: 'VueUse',
    icons: '@nuxt/icon',
    testing: 'Vitest + @vue/test-utils'
  },
  
  // 后端技术
  backend: {
    framework: 'NestJS',
    runtime: 'Node.js 20+',
    adapter: 'Fastify',
    database: 'PostgreSQL + Prisma',
    cache: 'Redis + ioredis',
    queue: 'BullMQ',
    auth: 'JWT + Passport',
    validation: 'Zod + class-validator',
    documentation: 'Swagger/OpenAPI'
  },
  
  // 开发工具
  development: {
    language: 'TypeScript',
    linting: 'ESLint + Prettier',
    testing: 'Jest + Vitest',
    git: 'Husky + lint-staged',
    containerization: 'Docker + Docker Compose'
  }
}
```

## 📁 项目结构

### Monorepo 目录结构

```
project-root/
├── apps/                           # 应用层
│   ├── web/                       # 主应用 (Nuxt 4)
│   │   ├── app/                   # Nuxt 4 应用目录
│   │   │   ├── components/        # Vue 组件
│   │   │   ├── composables/       # 组合式函数
│   │   │   ├── layouts/           # 布局组件
│   │   │   ├── pages/             # 页面路由
│   │   │   ├── plugins/           # Nuxt 插件
│   │   │   ├── stores/            # Pinia 状态管理
│   │   │   └── utils/             # 工具函数
│   │   ├── public/                # 静态资源
│   │   ├── server/                # 服务端代码
│   │   ├── nuxt.config.ts         # Nuxt 配置
│   │   └── package.json
│   │
│   ├── admin/                     # 管理后台 (Nuxt 4)
│   │   └── [类似 web 结构]
│   │
│   ├── backend/                   # 后端服务 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/           # 业务模块
│   │   │   │   ├── auth/          # 认证模块
│   │   │   │   ├── users/         # 用户模块
│   │   │   │   └── ...
│   │   │   ├── common/            # 公共模块
│   │   │   │   ├── decorators/    # 装饰器
│   │   │   │   ├── filters/       # 异常过滤器
│   │   │   │   ├── guards/        # 守卫
│   │   │   │   ├── interceptors/  # 拦截器
│   │   │   │   └── pipes/         # 管道
│   │   │   ├── database/          # 数据库相关
│   │   │   │   ├── migrations/    # 数据库迁移
│   │   │   │   └── seeds/         # 种子数据
│   │   │   ├── config/            # 配置文件
│   │   │   └── main.ts            # 应用入口
│   │   ├── prisma/                # Prisma 配置
│   │   │   ├── schema.prisma      # 数据库模型
│   │   │   └── seed.ts            # 种子脚本
│   │   ├── test/                  # 测试文件
│   │   └── package.json
│   │
│   ├── app/                       # 移动应用 (uni-app)
│   └── desktop/                   # 桌面应用 (Electron)
│
├── packages/                      # 共享代码层
│   ├── types/                     # TypeScript 类型定义
│   │   ├── src/
│   │   │   ├── auth.schema.ts     # 认证相关类型
│   │   │   ├── user.schema.ts     # 用户相关类型
│   │   │   ├── api.schema.ts      # API 响应类型
│   │   │   └── index.ts           # 统一导出
│   │   └── package.json
│   │
│   ├── api/                       # API 客户端 SDK
│   │   ├── src/
│   │   │   ├── client.ts          # HTTP 客户端
│   │   │   ├── endpoints/         # API 端点定义
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                     # 通用工具函数
│   │   ├── src/
│   │   │   ├── date.ts            # 日期工具
│   │   │   ├── validation.ts      # 验证工具
│   │   │   ├── format.ts          # 格式化工具
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                        # UI 组件库 (可选)
│   └── domain/                    # 核心业务逻辑 (可选)
│
├── scripts/                       # 部署和工具脚本
│   ├── deploy-local.sh           # 本地部署脚本
│   ├── backup.sh                 # 备份脚本
│   └── setup-dev.sh              # 开发环境设置
│
├── nginx/                         # Nginx 配置
│   ├── nginx.conf                # 生产环境配置
│   └── nginx.local.conf          # 本地预览配置
│
├── ssl/                          # SSL 证书目录
├── docker-compose.yml            # 开发环境 Docker 配置
├── docker-compose.prod.yml       # 生产环境 Docker 配置
├── turbo.json                    # Turborepo 配置
├── pnpm-workspace.yaml           # pnpm 工作空间配置
├── package.json                  # 根项目配置
└── .env                          # 环境变量配置
```

## 🔧 开发环境配置

### 1. 初始化项目

```bash
# 1. 创建项目目录
mkdir my-fullstack-project
cd my-fullstack-project

# 2. 初始化 Git 仓库
git init

# 3. 创建基础目录结构
mkdir -p apps/{web,admin,backend,app,desktop}
mkdir -p packages/{types,api,utils,ui,domain}
mkdir -p scripts nginx ssl

# 4. 创建 pnpm 工作空间配置
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# 5. 创建根 package.json
cat > package.json << 'EOF'
{
  "name": "my-fullstack-project",
  "version": "1.0.0",
  "private": true,
  "description": "全栈项目 - Monorepo",
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@repo/types --filter=@repo/api --filter=@repo/web --parallel",
    "dev:backend": "turbo run dev --filter=@repo/backend",
    "dev:all": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,vue,json,md}\"",
    "prepare": "husky install || true"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-vue": "^9.20.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.4",
    "turbo": "^1.12.4",
    "typescript": "^5.3.3"
  },
  "packageManager": "pnpm@8.15.1",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF

# 6. 安装根依赖
pnpm install
```

### 2. 配置 Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        ".nuxt/**",
        ".output/**",
        "build/**",
        "tsconfig.tsbuildinfo"
      ]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": ["*.tsbuildinfo"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 3. 环境变量配置

```bash
# .env - 开发环境配置
# ==========================================
# Docker Compose 配置
# ==========================================

# PostgreSQL 配置
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=my_project
POSTGRES_PORT=5432

# Redis 配置
REDIS_PORT=6379

# ==========================================
# 后端应用配置
# ==========================================

# 数据库连接
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/my_project

# Redis 连接
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 服务配置
PORT=4000
NODE_ENV=development

# CORS 配置
FRONTEND_URL=http://localhost:3000

# ==========================================
# 前端应用配置
# ==========================================

# API 基础地址
NUXT_PUBLIC_API_BASE=/api

# 后端服务地址
BACKEND_URL=http://localhost:4000
```

## 📦 包配置详解

### 1. 类型共享包 (packages/types)

```typescript
// packages/types/src/auth.schema.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位')
})

export const RegisterSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(2, '昵称至少2个字符')
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  avatar: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.date(),
  updatedAt: z.date()
})

// 导出类型
export type LoginDto = z.infer<typeof LoginSchema>
export type RegisterDto = z.infer<typeof RegisterSchema>
export type User = z.infer<typeof UserSchema>

// API 响应类型
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.object({
      code: z.string(),
      message: z.string()
    }).optional()
  })

export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
  }
}
```

```json
// packages/types/package.json
{
  "name": "@repo/types",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --build --watch",
    "clean": "rm -rf dist tsconfig.tsbuildinfo",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

### 2. API 客户端包 (packages/api)

```typescript
// packages/api/src/client.ts
import type { ApiResponse } from '@repo/types'

export class ApiClient {
  private baseURL: string
  private token?: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建默认实例
export const apiClient = new ApiClient(
  typeof window !== 'undefined' 
    ? '/api'  // 浏览器环境使用相对路径
    : process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000'  // SSR 环境
)
```

```typescript
// packages/api/src/endpoints/auth.ts
import type { LoginDto, RegisterDto, User } from '@repo/types'
import { apiClient } from '../client'

export const authApi = {
  login: (data: LoginDto) => 
    apiClient.post<{ user: User; token: string }>('/auth/login', data),
    
  register: (data: RegisterDto) => 
    apiClient.post<{ user: User; token: string }>('/auth/register', data),
    
  getProfile: () => 
    apiClient.get<User>('/auth/profile'),
    
  logout: () => 
    apiClient.post('/auth/logout')
}
```

## 🎨 前端应用配置

### 1. Web 应用 (Nuxt 4)

```typescript
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // 模块配置
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/icon'
  ],
  
  // CSS 配置
  css: [
    '@unocss/reset/tailwind.css'
  ],
  
  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅服务端）
    backendUrl: process.env.BACKEND_URL,
    backendInternalUrl: process.env.BACKEND_INTERNAL_URL,
    
    // 公共配置（客户端可访问）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  
  // Nitro 配置
  nitro: {
    // 开发环境 API 代理
    devProxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:4000',
        changeOrigin: true,
        prependPath: true
      }
    }
  },
  
  // 构建配置
  build: {
    transpile: ['@repo/types', '@repo/api']
  },
  
  // TypeScript 配置
  typescript: {
    typeCheck: true
  }
})
```

```vue
<!-- apps/web/app/components/LoginForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">
        邮箱
      </label>
      <input
        v-model="form.email"
        type="email"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        :class="{ 'border-red-500': errors.email }"
      >
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </p>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700">
        密码
      </label>
      <input
        v-model="form.password"
        type="password"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        :class="{ 'border-red-500': errors.password }"
      >
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </p>
    </div>
    
    <button
      type="submit"
      :disabled="loading"
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
    >
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { LoginSchema, type LoginDto } from '@repo/types'

const { login } = useAuth()

const form = ref<LoginDto>({
  email: '',
  password: ''
})

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const handleSubmit = async () => {
  // 客户端验证
  const result = LoginSchema.safeParse(form.value)
  if (!result.success) {
    errors.value = result.error.flatten().fieldErrors
    return
  }
  
  errors.value = {}
  loading.value = true
  
  try {
    await login(form.value)
    await navigateTo('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>
```

```typescript
// apps/web/app/composables/useAuth.ts
import { authApi } from '@repo/api'
import type { LoginDto, RegisterDto, User } from '@repo/types'

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const token = useCookie('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  const login = async (credentials: LoginDto) => {
    const response = await authApi.login(credentials)
    
    if (response.success && response.data) {
      user.value = response.data.user
      token.value = response.data.token
      
      // 设置 API 客户端 token
      const { apiClient } = await import('@repo/api')
      apiClient.setToken(response.data.token)
    }
  }

  const logout = async () => {
    await authApi.logout()
    user.value = null
    token.value = null
    
    await navigateTo('/login')
  }

  const getProfile = async () => {
    if (!token.value) return
    
    const response = await authApi.getProfile()
    if (response.success && response.data) {
      user.value = response.data
    }
  }

  // 初始化时设置 token
  if (token.value) {
    const { apiClient } = await import('@repo/api')
    apiClient.setToken(token.value)
  }

  return {
    user: readonly(user),
    login,
    logout,
    getProfile
  }
}
```

### 2. 管理后台 (Nuxt 4 + Element Plus)

```typescript
// apps/admin/nuxt.config.ts
export default defineNuxtConfig({
  extends: ['../web'], // 继承 web 应用配置
  
  modules: [
    '@element-plus/nuxt',
    // ... 其他模块
  ],
  
  // 管理端特定配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      appName: '管理后台'
    }
  }
})
```

## 🚀 后端应用配置

### 1. NestJS 项目结构

```typescript
// apps/backend/src/main.ts
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  // CORS 配置
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    credentials: true
  })

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('API 文档')
    .setDescription('全栈项目 API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 4000
  await app.listen(port, '0.0.0.0')
  
  console.log(`🚀 服务器运行在: http://localhost:${port}`)
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`)
}

bootstrap()
```

```typescript
// apps/backend/src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { LoginSchema, RegisterSchema, type LoginDto, type RegisterDto } from '@repo/types'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  async register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id)
  }
}
```

```typescript
// apps/backend/src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ZodSchema } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      throw new BadRequestException('验证失败', error.errors)
    }
  }
}
```

### 2. Prisma 数据库配置

```prisma
// apps/backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nickname  String
  avatar    String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联关系
  posts     Post[]
  comments  Comment[]

  @@map("users")
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
```

## 🐳 Docker 部署配置

### 1. 开发环境 Docker Compose

```yaml
# docker-compose.yml
services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:17-alpine
    container_name: project-postgres
    restart: unless-stopped
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-my_project}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-postgres}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - project-network

  # Redis 缓存
  redis:
    image: redis:7.4-alpine
    container_name: project-redis
    restart: unless-stopped
    ports:
      - '${REDIS_PORT:-6379}:6379'
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - project-network

  # Nginx 反向代理（本地预览）
  nginx:
    image: nginx:alpine
    container_name: project-nginx
    profiles:
      - preview
    ports:
      - '80:80'
    volumes:
      - ./nginx/nginx.local.conf:/etc/nginx/nginx.conf:ro
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - project-network

networks:
  project-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 2. 生产环境 Docker Compose

```yaml
# docker-compose.prod.yml
services:
  # 后端服务
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
      target: production
    container_name: project-backend
    restart: unless-stopped
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:4000/health']
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - project-network

  # Web 前端
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: production
    container_name: project-web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=/api
    depends_on:
      - backend
    networks:
      - project-network

  # 管理后台
  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
      target: production
    container_name: project-admin
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=/api
    depends_on:
      - backend
    networks:
      - project-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: project-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
      - admin
      - backend
    networks:
      - project-network

  # PostgreSQL 数据库
  postgres:
    image: postgres:17-alpine
    container_name: project-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - project-network

  # Redis 缓存
  redis:
    image: redis:7.4-alpine
    container_name: project-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - project-network

networks:
  project-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### 3. Dockerfile 配置

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 开发阶段
FROM base AS development
COPY . .
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/backend build
EXPOSE 4000
CMD ["pnpm", "--filter", "@repo/backend", "start:prod"]

# 生产阶段
FROM base AS production
COPY . .
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/backend build
RUN pnpm prune --prod
EXPOSE 4000
USER node
CMD ["pnpm", "--filter", "@repo/backend", "start:prod"]
```

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/api/package.json ./packages/api/

RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . .
RUN pnpm --filter @repo/types build
RUN pnpm --filter @repo/api build
RUN pnpm --filter @repo/web build

FROM base AS production
COPY --from=build /app/.output /app/.output
EXPOSE 3000
USER node
CMD ["node", ".output/server/index.mjs"]
```

## 🚀 部署脚本

### 一键部署脚本

```bash
#!/bin/bash
# scripts/deploy-local.sh

set -e

PROJECT_NAME="my-fullstack-project"
DEFAULT_BRANCH="main"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_environment() {
    log_info "检查部署环境..."
    
    # 检查必需工具
    for tool in git docker pnpm; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺失必需工具: $tool"
            exit 1
        fi
    done
    
    # 检查 Docker 服务
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 更新代码
update_code() {
    local branch="${1:-$DEFAULT_BRANCH}"
    
    log_info "更新代码到最新版本..."
    
    git fetch origin
    git checkout "$branch"
    git reset --hard "origin/$branch"
    
    log_success "代码更新完成"
}

# 构建和部署
deploy() {
    log_info "开始部署..."
    
    # 检查环境变量文件
    if [ ! -f ".env.production.local" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env.production.local
            log_warning "请编辑 .env.production.local 文件配置环境变量"
        else
            log_error "未找到环境变量配置文件"
            exit 1
        fi
    fi
    
    # 构建镜像
    log_info "构建 Docker 镜像..."
    docker compose -f docker-compose.prod.yml --env-file .env.production.local build --no-cache
    
    # 启动服务
    log_info "启动服务..."
    docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 运行数据库迁移
    log_info "运行数据库迁移..."
    docker exec project-backend pnpm --filter @repo/backend prisma:migrate
    
    log_success "部署完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."
    
    # 检查服务状态
    docker compose -f docker-compose.prod.yml --env-file .env.production.local ps
    
    # 测试 API 连通性
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        log_success "API 服务正常"
    else
        log_error "API 服务异常"
        return 1
    fi
    
    log_success "部署验证通过"
}

# 主函数
main() {
    echo "🚀 $PROJECT_NAME - 部署脚本"
    echo "================================"
    
    check_environment
    update_code "$1"
    deploy
    verify_deployment
    
    echo ""
    echo "🎉 部署完成！"
    echo "=============="
    echo ""
    echo "📱 服务地址:"
    echo "  🌐 前端: http://localhost"
    echo "  🔧 管理端: http://admin.localhost"
    echo "  🚀 API: http://localhost/api"
    echo ""
}

main "$@"
```

## 📋 开发工作流

### 1. 日常开发流程

```bash
# 1. 启动开发环境
pnpm dev:all

# 2. 只启动前端 + 类型包
pnpm dev:web

# 3. 只启动后端
pnpm dev:backend

# 4. 运行测试
pnpm test

# 5. 类型检查
pnpm type-check

# 6. 代码格式化
pnpm format

# 7. 构建所有包
pnpm build
```

### 2. 数据库操作

```bash
# 进入后端目录
cd apps/backend

# 生成 Prisma 客户端
pnpm prisma:generate

# 创建迁移
pnpm prisma migrate dev --name add-user-table

# 运行种子数据
pnpm prisma:seed

# 打开数据库管理界面
pnpm prisma:studio
```

### 3. 部署流程

```bash
# 开发环境
docker compose up -d

# 生产环境
./scripts/deploy-local.sh

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 停止服务
docker compose -f docker-compose.prod.yml down
```

## 🔧 最佳实践

### 1. 代码组织原则

- **单一职责**: 每个包、模块、组件只负责一个功能
- **依赖方向**: 应用层依赖包层，包层之间避免循环依赖
- **类型安全**: 使用 Zod Schema 作为唯一数据源
- **错误处理**: 统一的错误处理机制

### 2. 性能优化

- **懒加载**: 路由和组件按需加载
- **缓存策略**: Redis 缓存热点数据
- **数据库优化**: 合理使用索引和查询优化
- **静态资源**: CDN 加速和压缩

### 3. 安全考虑

- **输入验证**: 前后端双重验证
- **权限控制**: RBAC 角色权限系统
- **数据加密**: 敏感数据加密存储
- **HTTPS**: 生产环境强制 HTTPS

## 📊 监控和维护

### 1. 日志管理

```typescript
// 统一日志配置
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, meta)
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error)
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, meta)
  }
}
```

### 2. 健康检查

```typescript
// apps/backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    }
  }
}
```

### 3. 备份策略

```bash
#!/bin/bash
# scripts/backup.sh

# 数据库备份
docker exec project-postgres pg_dump -U postgres my_project > backup_$(date +%Y%m%d_%H%M%S).sql

# 文件备份
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/

# 清理旧备份（保留7天）
find . -name "backup_*.sql" -mtime +7 -delete
find . -name "files_backup_*.tar.gz" -mtime +7 -delete
```

## 🎯 总结

这套 Monorepo 全栈架构具有以下优势：

1. **类型安全**: 前后端完全类型共享，减少接口联调问题
2. **开发效率**: 统一工具链，一键启动开发环境
3. **代码复用**: 共享包机制，避免重复代码
4. **部署简单**: Docker 容器化，一键部署脚本
5. **可扩展性**: 模块化设计，易于添加新功能
6. **维护性**: 统一的代码规范和工具配置

适用于中小型全栈项目，特别是需要多端支持和快速迭代的场景。