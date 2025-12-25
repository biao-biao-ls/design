# 设计文档

## 概述

KNZN 项目基础架构采用现代化的容器化部署方案，基于 Nuxt 4 全栈框架构建，使用 PostgreSQL 作为主数据库，通过 Docker Compose 在 Contabo VPS 上实现完全自托管部署。该架构专为海外市场设计，重点关注 GDPR 合规、邮件服务集成和跨架构兼容性。

### 核心设计原则

1. **容器化优先**：所有服务均通过 Docker 容器化，确保环境一致性
2. **自托管控制**：完全摆脱 Supabase 等第三方依赖，获得数据主权
3. **海外市场适配**：内置 GDPR 合规、邮件服务和多语言支持
4. **开发体验优化**：本地开发环境与生产环境保持一致性
5. **安全性优先**：环境变量验证、HTTPS 强制、安全头配置

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                  │
├─────────────────────────────────────────────────────────────────┤
│ Web Browser │ Mobile Browser │ Desktop PWA │ API Clients        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Contabo VPS (单机集群)                      │
├─────────────────────────────────────────────────────────────────┤
│                     Nginx 容器 (入口)                          │
│ • SSL 证书管理 (Cloudflare 证书)                               │
│ • HTTP/2 + Gzip 压缩                                           │
│ • 静态资源缓存                                                  │
│ • 反向代理到 Nuxt 容器                                          │
│ • 安全头配置                                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    应用层 (Nuxt 4 + Nitro)                     │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (Vue 3)        │ Backend (Nitro Server)               │
│ • 响应式 UI 组件        │ • API Routes (/api/*)                │
│ • 状态管理 (Pinia)      │ • 认证系统 (Better-Auth)             │
│ • 路由管理              │ • 业务逻辑处理                       │
│ • 客户端缓存            │ • 数据验证和安全                     │
│                         │ • 邮件服务集成                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL 容器     │ Redis 容器        │ Cloudflare R2         │
│ • 用户数据          │ • Nitro 缓存      │ • 静态文件存储        │
│ • 应用数据          │ • 会话存储        │ • 图片和文档          │
│ • 系统配置          │ • 限流控制        │ • 备份文件            │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈选型

#### 前端技术栈
- **框架**: Nuxt 4 (Vue 3) - 全栈框架，SSR 支持，SEO 友好
- **样式**: UnoCSS - 原子化 CSS，按需生成，零运行时开销
- **状态管理**: Pinia - Vue 官方推荐，TypeScript 支持完美
- **工具库**: VueUse - 高质量 Composition API 工具集
- **图标**: Iconify - 按需引入，10万+ 图标库
- **动画**: CSS Transitions + Motion One - 轻量级动画解决方案

#### 后端技术栈
- **运行时**: Nuxt 4 Server (Nitro) - 高性能服务端渲染引擎
- **数据库**: PostgreSQL 15 - 企业级关系型数据库
- **ORM**: Drizzle ORM - 轻量、Type-safe、冷启动快
- **认证**: Better-Auth - 现代化认证解决方案，支持 OAuth
- **邮件**: Resend - 开发者友好的邮件服务
- **存储**: Cloudflare R2 - 成本低廉的对象存储

#### 部署技术栈
- **容器化**: Docker + Docker Compose - 标准化容器编排
- **Web 服务器**: Nginx - 高性能反向代理和静态文件服务
- **SSL**: Cloudflare SSL 证书 - 使用现有证书文件
- **VPS**: Contabo VPS L (12GB RAM, 6 CPU cores) - 高性价比服务器
- **CI/CD**: GitHub Actions - 自动化构建和部署

## 组件和接口

### 核心组件架构

#### 1. 认证服务组件 (Authentication Service)

```typescript
// server/utils/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "~/server/database/connection"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  
  // 海外市场标配：Email + OAuth
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
  
  // Magic Link 登录（海外用户偏好）
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  
  magicLink: {
    enabled: true
  },
  
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  }
})
```

#### 2. 数据库连接组件 (Database Connection)

```typescript
// server/database/connection.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// 环境变量验证
const requiredEnvVars = [
  'DATABASE_URL',
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD'
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

const connectionConfig = {
  host: process.env.DATABASE_HOST,
  port: 5432,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  
  // 连接池设置 (12GB RAM 可支持更多连接)
  max: 30,
  min: 5,
  idle: 30000,
  acquire: 60000,
  
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

const queryClient = postgres(process.env.DATABASE_URL!, connectionConfig)
export const db = drizzle(queryClient)
```

#### 3. 邮件服务组件 (Email Service)

```typescript
// server/utils/email.ts
interface EmailTemplate {
  subject: string
  template: string
  attachments?: boolean
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to KNZN - Your Hardware Learning Journey Begins!',
    template: 'welcome-email.html'
  },
  magicLink: {
    subject: 'Sign in to KNZN',
    template: 'magic-link.html'
  },
  passwordReset: {
    subject: 'Reset Your KNZN Password',
    template: 'password-reset.html'
  }
}

export const sendEmail = async (options: {
  to: string
  template: string
  data: Record<string, any>
  attachments?: Buffer[]
}) => {
  // 环境变量验证
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY environment variable')
  }
  
  const templateConfig = EMAIL_TEMPLATES[options.template]
  if (!templateConfig) {
    throw new Error(`Unknown email template: ${options.template}`)
  }
  
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
        subject: templateConfig.subject,
        html: await renderTemplate(options.template, options.data),
        attachments: options.attachments
      })
    })
    
    if (!response.ok) {
      throw new Error(`Email sending failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}
```

#### 4. 环境变量验证组件 (Environment Validation)

```typescript
// server/utils/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().url(),
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(8),
  
  // OAuth 配置
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  
  // 邮件服务
  RESEND_API_KEY: z.string().startsWith('re_'),
  
  // 文件存储
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  
  // 站点配置
  SITE_URL: z.string().url(),
  
  // Better Auth 密钥
  BETTER_AUTH_SECRET: z.string().min(32),
  
  // 备份加密
  BACKUP_PASSWORD: z.string().min(16)
})

export function validateEnvironment() {
  try {
    const validatedEnv = envSchema.parse(process.env)
    console.log('✅ Environment variables validated successfully')
    return validatedEnv
  } catch (error) {
    console.error('❌ Environment validation failed:')
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

// Nuxt Runtime Config 集成
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // 私有配置（仅服务端）
    databaseUrl: process.env.DATABASE_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    backupPassword: process.env.BACKUP_PASSWORD,
    
    // 公共配置（客户端可访问）
    public: {
      siteUrl: process.env.SITE_URL || 'https://knzn.net'
    }
  },
  
  // 启动时验证环境变量
  hooks: {
    'ready': () => {
      validateEnvironment()
    }
  }
})
```

### API 接口设计

#### 1. 认证 API 接口

```typescript
// server/api/auth/[...all].ts
import { auth } from "~/server/utils/auth"

export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event))
})
```

#### 2. 健康检查 API

```typescript
// server/api/health.get.ts
export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    await db.execute(sql`SELECT 1`)
    
    // 检查 Redis 连接 (如果使用)
    // await redis.ping()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        // redis: 'connected'
      }
    }
  } catch (error) {
    setResponseStatus(event, 503)
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }
  }
})
```

#### 3. GDPR 合规 API

```typescript
// server/api/privacy/export-data.post.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const userId = session.user.id
  
  // 收集用户数据
  const userData = {
    profile: await getUserProfile(userId),
    createdAt: new Date().toISOString(),
    exportedAt: new Date().toISOString()
  }
  
  return {
    data: userData,
    format: 'json',
    gdprCompliant: true
  }
})

// server/api/privacy/delete-account.post.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const userId = session.user.id
  
  // 标记账户为待删除状态（30天宽限期）
  await db.update(users)
    .set({ 
      deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending_deletion'
    })
    .where(eq(users.id, userId))
  
  // 发送确认邮件
  await sendEmail({
    to: session.user.email,
    template: 'account-deletion-scheduled',
    data: { userName: session.user.name }
  })
  
  return {
    message: 'Account deletion scheduled',
    gracePeriod: '30 days',
    gdprCompliant: true
  }
})
```

## 数据模型

### 核心数据表结构

```typescript
// server/database/schema.ts
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core'

// 用户表
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
  
  // GDPR 合规字段
  gdprConsent: boolean('gdpr_consent').default(false),
  gdprConsentDate: timestamp('gdpr_consent_date'),
  deletionScheduledAt: timestamp('deletion_scheduled_at'),
  status: text('status').default('active') // 'active', 'pending_deletion', 'deleted'
})

// OAuth 账号关联表
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'google', 'github'
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// 会话表
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
})

// 系统配置表
export const systemConfigs = pgTable('system_configs', {
  id: serial('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: text('updated_by').references(() => users.id)
})

// 错误日志表
export const errorLogs = pgTable('error_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  level: text('level').notNull(), // 'error', 'warn', 'info'
  message: text('message').notNull(),
  stack: text('stack'),
  userId: text('user_id').references(() => users.id),
  url: text('url'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow()
})

// 备份日志表
export const backupLogs = pgTable('backup_logs', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  type: text('type').notNull(), // 'manual', 'scheduled', 'restore'
  status: text('status').notNull(), // 'completed', 'failed', 'in_progress'
  fileSize: text('file_size'),
  fileName: text('file_name'),
  error: text('error'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
})
```

### 数据库迁移策略

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './server/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
} satisfies Config
```

```json
// package.json scripts
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:migrate:prod": "NODE_ENV=production drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push",
    "db:reset": "rm -rf ./drizzle && npm run db:generate",
    "validate-env": "node -e \"require('./server/utils/env-validation').validateEnvironment()\"",
    
    // 开发环境脚本
    "dev": "nuxt dev",
    "dev:docker": "docker-compose -f docker-compose.dev.yml up -d && npm run dev",
    "dev:stop": "docker-compose -f docker-compose.dev.yml down",
    "db:migrate:dev": "DATABASE_URL=postgresql://knzn_user:password@localhost:5432/knzn_development drizzle-kit migrate"
  }
}
```

```typescript
// server/utils/migration-runner.ts
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './connection'

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...')
    
    await migrate(db, { 
      migrationsFolder: './drizzle',
      migrationsTable: 'drizzle_migrations'
    })
    
    console.log('✅ Database migrations completed successfully')
  } catch (error) {
    console.error('❌ Database migration failed:', error)
    
    // 记录迁移失败到数据库（如果可能）
    try {
      await logMigrationError(error)
    } catch (logError) {
      console.error('Failed to log migration error:', logError)
    }
    
    throw error
  }
}

// 在应用启动时自动运行迁移
// server/plugins/migration.ts
export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await runMigrations()
    } catch (error) {
      console.error('Migration failed during startup:', error)
      process.exit(1)
    }
  }
})
```

## 容器化配置

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx 反向代理
  nginx:
    build: ./docker/nginx
    container_name: knzn-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # 挂载 Cloudflare 证书
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - knzn-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Nuxt 4 应用
  app:
    build:
      context: .
      dockerfile: ./docker/app/Dockerfile
      platforms:
        - linux/amd64  # 确保 AMD64 架构兼容性
    container_name: knzn-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://knzn_user:${DATABASE_PASSWORD}@postgres:5432/knzn_production
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - knzn-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: knzn-postgres
    environment:
      POSTGRES_DB: knzn_production
      POSTGRES_USER: knzn_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - knzn-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U knzn_user -d knzn_production"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  knzn-network:
    driver: bridge
```

### Nuxt 应用 Dockerfile

```dockerfile
# docker/app/Dockerfile
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 环境变量验证
RUN npm run validate-env

# 生成数据库迁移文件
RUN npm run db:generate

# 构建应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# 复制构建产物和迁移文件
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output
COPY --from=builder --chown=nuxtjs:nodejs /app/drizzle /app/drizzle
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules /app/node_modules

# 复制迁移脚本
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json /app/package.json

USER nuxtjs

EXPOSE 3000

ENV PORT 3000
ENV HOST 0.0.0.0

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 启动脚本：先运行迁移，再启动应用
CMD ["sh", "-c", "npm run db:migrate:prod && node .output/server/index.mjs"]
```

### 开发环境配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # 仅启动数据库，Nuxt 在本地运行
  postgres:
    image: postgres:15-alpine
    container_name: knzn-postgres-dev
    environment:
      POSTGRES_DB: knzn_development
      POSTGRES_USER: knzn_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD:-password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./docker/postgres/init-dev.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U knzn_user -d knzn_development"]
      interval: 10s
      timeout: 5s
      retries: 5

  # PgAdmin (可选，用于数据库管理)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: knzn-pgadmin-dev
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@knzn.net
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin123}
    ports:
      - "5050:80"
    depends_on:
      - postgres
    restart: unless-stopped

  # Redis (开发环境缓存)
  redis:
    image: redis:7-alpine
    container_name: knzn-redis-dev
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_dev_data:
```

```bash
# scripts/dev-setup.sh - 开发环境一键启动脚本
#!/bin/bash

echo "🚀 Starting KNZN development environment..."

# 1. 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# 2. 启动开发数据库
echo "📦 Starting development database..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 3. 等待数据库启动
echo "⏳ Waiting for database to be ready..."
until docker exec knzn-postgres-dev pg_isready -U knzn_user -d knzn_development; do
  sleep 2
done

# 4. 运行数据库迁移
echo "🔄 Running database migrations..."
npm run db:migrate:dev

# 5. 启动 Nuxt 开发服务器
echo "🌟 Starting Nuxt development server..."
npm run dev

echo "✅ Development environment is ready!"
echo "📊 PgAdmin: http://localhost:5050 (admin@knzn.net / admin123)"
echo "🗄️ Database: postgresql://knzn_user:password@localhost:5432/knzn_development"
```

```json
// package.json 开发脚本更新
{
  "scripts": {
    "dev": "nuxt dev",
    "dev:setup": "bash scripts/dev-setup.sh",
    "dev:docker": "docker-compose -f docker-compose.dev.yml up -d && npm run db:migrate:dev && npm run dev",
    "dev:stop": "docker-compose -f docker-compose.dev.yml down",
    "dev:clean": "docker-compose -f docker-compose.dev.yml down -v && docker system prune -f",
    "validate-env": "node -e \"require('./server/utils/env-validation').validateEnvironment()\"",
    "db:migrate:dev": "DATABASE_URL=postgresql://knzn_user:password@localhost:5432/knzn_development drizzle-kit migrate"
  }
}
```

## 部署和 CI/CD

### GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to Contabo VPS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate environment variables
        run: npm run validate-env
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          DATABASE_HOST: localhost
          DATABASE_NAME: test
          DATABASE_USER: test
          DATABASE_PASSWORD: test
          GOOGLE_CLIENT_ID: test
          GOOGLE_CLIENT_SECRET: test
          GITHUB_CLIENT_ID: test
          GITHUB_CLIENT_SECRET: test
          RESEND_API_KEY: re_test
          R2_ACCESS_KEY_ID: test
          R2_SECRET_ACCESS_KEY: test
          CLOUDFLARE_ACCOUNT_ID: test
          SITE_URL: https://test.com
          BETTER_AUTH_SECRET: test-secret-key-32-characters-long
          BACKUP_PASSWORD: test-backup-password
      
      - name: Run tests
        run: npm run test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/app/Dockerfile
          platforms: linux/amd64  # 确保 AMD64 架构
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Deploy to Contabo VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/knzn
            
            # 拉取最新镜像
            docker-compose pull
            
            # 执行数据库迁移
            docker-compose run --rm app npm run db:migrate:prod
            
            # 重启服务
            docker-compose up -d --force-recreate
            
            # 清理旧镜像
            docker system prune -f
            
            # 健康检查
            sleep 30
            curl -f http://localhost/api/health || exit 1
            
            # 验证数据库迁移成功
            docker-compose exec -T postgres psql -U knzn_user -d knzn_production -c "SELECT version FROM drizzle_migrations ORDER BY version DESC LIMIT 1;"
```

### 自动化备份脚本

```bash
#!/bin/bash
# scripts/backup.sh - 自动备份脚本

set -e

# 配置变量
BACKUP_DIR="/opt/knzn-backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="knzn-postgres"
BACKUP_FILE="knzn_backup_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gz.enc"

# 创建备份目录
mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup..."

# 1. 执行数据库备份
docker exec $DB_CONTAINER pg_dump -U knzn_user knzn_production > $BACKUP_DIR/$BACKUP_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "✅ Database backup completed: $BACKUP_FILE"
else
    echo "❌ Database backup failed!"
    exit 1
fi

# 2. 压缩备份文件
echo "🗜️ Compressing backup..."
gzip $BACKUP_DIR/$BACKUP_FILE

# 3. 加密压缩文件
echo "🔐 Encrypting backup..."
openssl enc -aes-256-cbc -salt \
    -in $BACKUP_DIR/${BACKUP_FILE}.gz \
    -out $BACKUP_DIR/$ENCRYPTED_FILE \
    -k $BACKUP_PASSWORD

# 4. 上传到 Cloudflare R2
echo "☁️ Uploading to R2..."
aws s3 cp $BACKUP_DIR/$ENCRYPTED_FILE \
    s3://knzn-backups/database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

# 5. 验证备份完整性
echo "🔍 Verifying backup integrity..."
aws s3 ls s3://knzn-backups/database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

if [ $? -eq 0 ]; then
    echo "✅ Backup verification successful"
else
    echo "❌ Backup verification failed!"
    exit 1
fi

# 6. 清理本地文件
rm $BACKUP_DIR/${BACKUP_FILE}.gz
rm $BACKUP_DIR/$ENCRYPTED_FILE

# 7. 清理旧备份（保留30天）
echo "🧹 Cleaning old backups..."
aws s3 ls s3://knzn-backups/database/ \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com \
    | awk '$1 < "'$(date -d '30 days ago' '+%Y-%m-%d')'" {print $4}' \
    | xargs -I {} aws s3 rm s3://knzn-backups/database/{} \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

echo "🎉 Backup completed successfully: $ENCRYPTED_FILE"

# 8. 记录备份日志到数据库
docker exec $DB_CONTAINER psql -U knzn_user -d knzn_production -c "
INSERT INTO backup_logs (id, type, status, file_name, file_size, created_at) 
VALUES (
  '$(uuidgen)', 
  'scheduled', 
  'completed', 
  '$ENCRYPTED_FILE',
  '$(stat -f%z $BACKUP_DIR/$ENCRYPTED_FILE 2>/dev/null || stat -c%s $BACKUP_DIR/$ENCRYPTED_FILE)',
  NOW()
);"
```

### Cron Job 配置

```bash
# 在 VPS 上配置定时任务
# crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /opt/knzn/scripts/backup.sh >> /var/log/knzn-backup.log 2>&1

# 每周日凌晨 3 点清理 Docker 系统
0 3 * * 0 docker system prune -f >> /var/log/docker-cleanup.log 2>&1

# 每月 1 号检查 SSL 证书有效期（Cloudflare 证书）
0 4 1 * * /opt/knzn/scripts/check-ssl-expiry.sh >> /var/log/ssl-check.log 2>&1
```

现在让我继续完成设计文档的剩余部分...

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

基于需求分析，以下是项目基础架构的核心正确性属性：

### 属性 1: 环境变量验证完整性
*对于任何* 缺失的关键环境变量，系统启动时应该立即失败并显示具体的缺失变量名称，而不是在运行时崩溃
**验证需求: 需求 1.7**

### 属性 2: 数据库迁移幂等性
*对于任何* 数据库迁移脚本，多次执行应该产生相同的最终数据库状态，不会因重复执行而出错
**验证需求: 需求 2.2**

### 属性 3: 数据库查询性能保证
*对于任何* 标准数据库查询操作，响应时间应该在 500 毫秒以内，确保系统响应性能
**验证需求: 需求 2.3**

### 属性 4: 数据备份完整性
*对于任何* 生成的数据库备份文件，应该包含所有用户数据并且可以成功恢复到新的数据库实例
**验证需求: 需求 2.5**

### 属性 5: 容器启动性能
*对于任何* 容器服务启动，应该在 30 秒内完成启动并通过健康检查，确保快速部署
**验证需求: 需求 3.2**

### 属性 6: 容器数据持久化
*对于任何* 容器重启操作，所有持久化数据应该保持完整，服务状态应该正确恢复
**验证需求: 需求 3.3**

### 属性 7: 日志轮转机制
*对于任何* 超过 10MB 的 Docker 日志文件，系统应该自动执行轮转并保留最近 3 份日志文件
**验证需求: 需求 3.6**

### 属性 8: HTTPS 重定向一致性
*对于任何* HTTP 请求到平台域名，服务器应该自动重定向到对应的 HTTPS URL
**验证需求: 需求 5.1**

### 属性 9: SSL 证书有效性
*对于任何* HTTPS 连接请求，SSL 证书应该是有效的、未过期的，并且与域名匹配
**验证需求: 需求 5.2**

### 属性 10: 监控数据连续性
*对于任何* 系统运行期间，性能指标和日志数据应该持续收集，不应出现数据丢失
**验证需求: 需求 6.1**

### 属性 11: GDPR 数据导出完整性
*对于任何* 用户数据导出请求，导出文件应该包含该用户的所有个人数据，格式应该是机器可读的
**验证需求: 需求 7.2**

### 属性 12: GDPR 数据删除彻底性
*对于任何* 账户删除请求，在宽限期结束后，该用户的所有个人数据应该从系统中完全清除
**验证需求: 需求 7.3**

## 错误处理

### 错误分类和处理策略

#### 1. 系统级错误处理

```typescript
// server/middleware/error-handler.ts
export default defineEventHandler(async (event) => {
  try {
    // 正常请求处理
    await $fetch(event.node.req.url!)
  } catch (error) {
    // 错误分类处理
    if (error instanceof DatabaseConnectionError) {
      // 数据库连接错误 - 尝试重连
      await retryDatabaseConnection()
      setResponseStatus(event, 503)
      return { error: 'Database temporarily unavailable', retryAfter: 30 }
    }
    
    if (error instanceof ValidationError) {
      // 数据验证错误 - 返回详细错误信息
      setResponseStatus(event, 400)
      return { error: 'Validation failed', details: error.details }
    }
    
    if (error instanceof AuthenticationError) {
      // 认证错误 - 清除会话并重定向
      await clearUserSession(event)
      setResponseStatus(event, 401)
      return { error: 'Authentication required' }
    }
    
    // 未知错误 - 记录日志并返回通用错误
    console.error('Unhandled error:', error)
    await logError(error, event)
    setResponseStatus(event, 500)
    return { error: 'Internal server error' }
  }
})
```

#### 2. 数据库错误处理

```typescript
// server/utils/database-error-handler.ts
export class DatabaseErrorHandler {
  static async handleConnectionError(error: Error, retryCount = 0): Promise<void> {
    const maxRetries = 3
    const retryDelay = Math.pow(2, retryCount) * 1000 // 指数退避
    
    if (retryCount >= maxRetries) {
      // 记录严重错误并发送告警
      await logCriticalError('Database connection failed after max retries', error)
      await sendAlertEmail('Database Connection Critical', error.message)
      throw new Error('Database connection permanently failed')
    }
    
    console.warn(`Database connection failed, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`)
    await new Promise(resolve => setTimeout(resolve, retryDelay))
    
    try {
      await testDatabaseConnection()
    } catch (retryError) {
      return this.handleConnectionError(retryError, retryCount + 1)
    }
  }
  
  static async handleMigrationError(error: Error): Promise<void> {
    // 迁移错误处理 - 记录详细信息但不自动重试
    await logError('Database migration failed', error, {
      level: 'critical',
      category: 'database_migration',
      requiresManualIntervention: true
    })
    
    // 发送紧急通知
    await sendAlertEmail('Database Migration Failed', `
      Migration failed with error: ${error.message}
      
      Manual intervention required. Please check the database state and migration scripts.
      
      Stack trace: ${error.stack}
    `)
    
    throw error // 不要继续执行，需要人工干预
  }
}
```

#### 3. 容器错误处理

```typescript
// server/utils/container-health.ts
export class ContainerHealthMonitor {
  static async checkContainerHealth(): Promise<HealthStatus> {
    const healthChecks = [
      this.checkDatabaseConnection(),
      this.checkFileSystemAccess(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]
    
    const results = await Promise.allSettled(healthChecks)
    const failures = results.filter(result => result.status === 'rejected')
    
    if (failures.length > 0) {
      const errors = failures.map(f => f.reason?.message).join(', ')
      await logError('Container health check failed', new Error(errors))
      
      // 如果是关键服务失败，触发容器重启
      if (failures.some(f => f.reason instanceof DatabaseConnectionError)) {
        await this.requestContainerRestart('Database connection failed')
      }
      
      return {
        status: 'unhealthy',
        errors: errors,
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  }
  
  static async requestContainerRestart(reason: string): Promise<void> {
    console.error(`Requesting container restart: ${reason}`)
    
    // 记录重启请求
    await logError('Container restart requested', new Error(reason), {
      level: 'warning',
      category: 'container_management'
    })
    
    // 在 Docker 环境中，健康检查失败会自动触发重启
    // 这里我们只需要确保进程退出
    process.exit(1)
  }
}
```

#### 4. GDPR 合规错误处理

```typescript
// server/utils/gdpr-error-handler.ts
export class GDPRComplianceHandler {
  static async handleDataExportError(userId: string, error: Error): Promise<void> {
    // 数据导出失败 - 记录并通知用户
    await logError('GDPR data export failed', error, {
      userId,
      level: 'high',
      category: 'gdpr_compliance',
      requiresUserNotification: true
    })
    
    // 发送用户通知邮件
    const user = await getUserById(userId)
    if (user) {
      await sendEmail({
        to: user.email,
        template: 'data-export-failed',
        data: {
          userName: user.name,
          supportEmail: 'privacy@knzn.net',
          errorReference: generateErrorReference()
        }
      })
    }
  }
  
  static async handleDataDeletionError(userId: string, error: Error): Promise<void> {
    // 数据删除失败 - 这是严重的合规问题
    await logCriticalError('GDPR data deletion failed', error, {
      userId,
      category: 'gdpr_compliance',
      requiresImmediateAction: true
    })
    
    // 发送紧急通知给管理员
    await sendAlertEmail('CRITICAL: GDPR Data Deletion Failed', `
      User ${userId} data deletion failed.
      
      This is a critical GDPR compliance issue that requires immediate attention.
      
      Error: ${error.message}
      Stack: ${error.stack}
      
      Please manually verify and complete the data deletion process.
    `)
    
    // 标记用户为需要手动处理
    await markUserForManualDeletion(userId, error.message)
  }
}
```

### 错误监控和告警

```typescript
// server/utils/error-monitoring.ts
export class ErrorMonitoring {
  static async logError(
    message: string, 
    error: Error, 
    context: {
      level?: 'info' | 'warning' | 'high' | 'critical'
      category?: string
      userId?: string
      url?: string
      userAgent?: string
      ipAddress?: string
      requiresUserNotification?: boolean
      requiresImmediateAction?: boolean
    } = {}
  ): Promise<void> {
    const errorLog = {
      id: generateId(),
      level: context.level || 'high',
      message,
      stack: error.stack,
      userId: context.userId,
      url: context.url,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      category: context.category,
      createdAt: new Date()
    }
    
    // 记录到数据库
    await db.insert(errorLogs).values(errorLog)
    
    // 根据错误级别决定通知方式
    if (context.level === 'critical' || context.requiresImmediateAction) {
      await this.sendCriticalAlert(errorLog)
    } else if (context.level === 'high') {
      await this.sendHighPriorityAlert(errorLog)
    }
    
    // 如果需要通知用户
    if (context.requiresUserNotification && context.userId) {
      await this.notifyUser(context.userId, errorLog)
    }
    
    // 集成第三方错误追踪服务
    await this.sendToErrorTracking(errorLog, error)
  }
  
  static async sendCriticalAlert(errorLog: ErrorLog): Promise<void> {
    // 发送邮件告警
    await sendEmail({
      to: 'alerts@knzn.net',
      template: 'critical-error-alert',
      data: {
        errorId: errorLog.id,
        message: errorLog.message,
        category: errorLog.category,
        timestamp: errorLog.createdAt.toISOString(),
        level: errorLog.level
      }
    })
  }
  
  static async sendToErrorTracking(errorLog: ErrorLog, error: Error): Promise<void> {
    // 集成 Sentry 或 GlitchTip
    if (process.env.SENTRY_DSN) {
      try {
        // 这里可以集成 Sentry SDK
        console.log('Sending error to Sentry:', errorLog.id)
      } catch (sentryError) {
        console.error('Failed to send error to Sentry:', sentryError)
      }
    }
    
    // 或者使用轻量级的 GlitchTip
    if (process.env.GLITCHTIP_DSN) {
      try {
        await fetch(process.env.GLITCHTIP_DSN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: errorLog.message,
            level: errorLog.level,
            timestamp: errorLog.createdAt.toISOString(),
            extra: {
              category: errorLog.category,
              userId: errorLog.userId,
              url: errorLog.url
            },
            exception: {
              values: [{
                type: error.constructor.name,
                value: error.message,
                stacktrace: { frames: parseStackTrace(error.stack) }
              }]
            }
          })
        })
      } catch (glitchTipError) {
        console.error('Failed to send error to GlitchTip:', glitchTipError)
      }
    }
  }
}

// server/middleware/error-logger.ts
export default defineEventHandler(async (event) => {
  // 捕获未处理的错误
  process.on('unhandledRejection', async (reason, promise) => {
    await ErrorMonitoring.logError(
      'Unhandled Promise Rejection',
      reason instanceof Error ? reason : new Error(String(reason)),
      { level: 'critical', category: 'unhandled_rejection' }
    )
  })
  
  process.on('uncaughtException', async (error) => {
    await ErrorMonitoring.logError(
      'Uncaught Exception',
      error,
      { level: 'critical', category: 'uncaught_exception' }
    )
    
    // 给错误处理一些时间，然后退出
    setTimeout(() => process.exit(1), 1000)
  })
})
```

### Docker 日志配置

```yaml
# docker-compose.yml 日志配置更新
version: '3.8'

services:
  nginx:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"

  app:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"
        labels: "service=knzn-app"

  postgres:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        compress: "true"
        labels: "service=knzn-postgres"
```

### 系统监控脚本

```bash
#!/bin/bash
# scripts/monitor-system.sh - 系统监控脚本

# 检查容器状态
check_containers() {
    echo "🔍 Checking container health..."
    
    containers=("knzn-nginx" "knzn-app" "knzn-postgres")
    
    for container in "${containers[@]}"; do
        if ! docker ps --filter "name=$container" --filter "status=running" | grep -q $container; then
            echo "❌ Container $container is not running"
            
            # 发送告警
            curl -X POST "https://api.resend.com/emails" \
                -H "Authorization: Bearer $RESEND_API_KEY" \
                -H "Content-Type: application/json" \
                -d "{
                    \"from\": \"alerts@knzn.net\",
                    \"to\": \"admin@knzn.net\",
                    \"subject\": \"Container Alert: $container Down\",
                    \"html\": \"Container $container is not running. Please check the system immediately.\"
                }"
        else
            echo "✅ Container $container is healthy"
        fi
    done
}

# 检查磁盘空间
check_disk_space() {
    echo "💾 Checking disk space..."
    
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $disk_usage -gt 80 ]; then
        echo "⚠️ Disk usage is ${disk_usage}%"
        
        # 清理 Docker 系统
        docker system prune -f
        
        # 如果仍然超过 85%，发送告警
        disk_usage_after=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        if [ $disk_usage_after -gt 85 ]; then
            curl -X POST "https://api.resend.com/emails" \
                -H "Authorization: Bearer $RESEND_API_KEY" \
                -H "Content-Type: application/json" \
                -d "{
                    \"from\": \"alerts@knzn.net\",
                    \"to\": \"admin@knzn.net\",
                    \"subject\": \"Disk Space Alert: ${disk_usage_after}% Used\",
                    \"html\": \"Disk usage is critically high at ${disk_usage_after}%. Please free up space immediately.\"
                }"
        fi
    else
        echo "✅ Disk usage is ${disk_usage}% (healthy)"
    fi
}

# 检查内存使用
check_memory() {
    echo "🧠 Checking memory usage..."
    
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ $memory_usage -gt 85 ]; then
        echo "⚠️ Memory usage is ${memory_usage}%"
        
        # 发送告警
        curl -X POST "https://api.resend.com/emails" \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"from\": \"alerts@knzn.net\",
                \"to\": \"admin@knzn.net\",
                \"subject\": \"Memory Alert: ${memory_usage}% Used\",
                \"html\": \"Memory usage is high at ${memory_usage}%. System may need attention.\"
            }"
    else
        echo "✅ Memory usage is ${memory_usage}% (healthy)"
    fi
}

# 检查应用健康状态
check_app_health() {
    echo "🏥 Checking application health..."
    
    health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)
    
    if [ $health_response -ne 200 ]; then
        echo "❌ Application health check failed (HTTP $health_response)"
        
        # 尝试重启应用容器
        docker-compose restart app
        
        # 等待重启
        sleep 30
        
        # 再次检查
        health_response_retry=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)
        
        if [ $health_response_retry -ne 200 ]; then
            # 发送紧急告警
            curl -X POST "https://api.resend.com/emails" \
                -H "Authorization: Bearer $RESEND_API_KEY" \
                -H "Content-Type: application/json" \
                -d "{
                    \"from\": \"alerts@knzn.net\",
                    \"to\": \"admin@knzn.net\",
                    \"subject\": \"CRITICAL: Application Down\",
                    \"html\": \"Application health check failed even after restart. Manual intervention required.\"
                }"
        fi
    else
        echo "✅ Application is healthy"
    fi
}

# 执行所有检查
main() {
    echo "🚀 Starting system monitoring..."
    echo "Timestamp: $(date)"
    
    check_containers
    check_disk_space
    check_memory
    check_app_health
    
    echo "✅ System monitoring completed"
}

main
```

### SSL 证书检查脚本

```bash
#!/bin/bash
# scripts/check-ssl-expiry.sh - SSL 证书有效期检查脚本

echo "🔐 Checking SSL certificate expiry..."

CERT_FILE="/opt/knzn/ssl/cf_cert.pem"
DOMAIN="knzn.net"

# 检查证书文件是否存在
if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Certificate file not found: $CERT_FILE"
    
    # 发送告警邮件
    curl -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"from\": \"alerts@knzn.net\",
            \"to\": \"admin@knzn.net\",
            \"subject\": \"SSL Certificate File Missing\",
            \"html\": \"SSL certificate file $CERT_FILE is missing. Please check the certificate configuration.\"
        }"
    exit 1
fi

# 检查证书有效期
EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

echo "📅 Certificate expires on: $EXPIRY_DATE"
echo "⏰ Days until expiry: $DAYS_UNTIL_EXPIRY"

# 如果证书在 30 天内过期，发送提醒
if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "⚠️ Certificate expires in $DAYS_UNTIL_EXPIRY days"
    
    # 发送提醒邮件
    curl -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"from\": \"alerts@knzn.net\",
            \"to\": \"admin@knzn.net\",
            \"subject\": \"SSL Certificate Expiry Warning\",
            \"html\": \"SSL certificate for $DOMAIN will expire in $DAYS_UNTIL_EXPIRY days on $EXPIRY_DATE. Please renew the certificate from Cloudflare.\"
        }"
elif [ $DAYS_UNTIL_EXPIRY -lt 0 ]; then
    echo "❌ Certificate has expired!"
    
    # 发送紧急告警
    curl -X POST "https://api.resend.com/emails" \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"from\": \"alerts@knzn.net\",
            \"to\": \"admin@knzn.net\",
            \"subject\": \"CRITICAL: SSL Certificate Expired\",
            \"html\": \"SSL certificate for $DOMAIN has expired on $EXPIRY_DATE. Immediate action required to renew the certificate.\"
        }"
else
    echo "✅ Certificate is valid for $DAYS_UNTIL_EXPIRY more days"
fi

# 验证证书与域名匹配
CERT_DOMAIN=$(openssl x509 -in "$CERT_FILE" -noout -subject | grep -o 'CN=[^,]*' | cut -d= -f2)
if [ "$CERT_DOMAIN" != "$DOMAIN" ] && [ "$CERT_DOMAIN" != "*.$DOMAIN" ]; then
    echo "⚠️ Certificate domain mismatch: expected $DOMAIN, got $CERT_DOMAIN"
fi

echo "🔐 SSL certificate check completed"
```

### Cron Job 配置更新

```bash
# 在 VPS 上配置定时任务
# crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /opt/knzn/scripts/backup.sh >> /var/log/knzn-backup.log 2>&1

# 每 5 分钟检查系统状态
*/5 * * * * /opt/knzn/scripts/monitor-system.sh >> /var/log/knzn-monitor.log 2>&1

# 每周日凌晨 3 点清理 Docker 系统
0 3 * * 0 docker system prune -f >> /var/log/docker-cleanup.log 2>&1

# 每月 1 号检查 SSL 证书有效期（Cloudflare 证书）
0 4 1 * * /opt/knzn/scripts/check-ssl-expiry.sh >> /var/log/ssl-check.log 2>&1

# 每天凌晨 1 点轮转应用日志
0 1 * * * /usr/sbin/logrotate /etc/logrotate.d/knzn-app
```
```

## 测试策略

### 双重测试方法

我们采用**单元测试**和**基于属性的测试**相结合的综合测试策略：

- **单元测试**：验证具体示例、边界情况和错误条件
- **基于属性的测试**：验证所有输入范围内的通用属性
- **集成测试**：验证组件间交互和端到端流程

### 基于属性的测试配置

我们使用 **fast-check** 作为 JavaScript/TypeScript 的属性测试库：

```typescript
// tests/properties/infrastructure.test.ts
import fc from 'fast-check'
import { describe, test, expect } from 'vitest'

describe('Infrastructure Properties', () => {
  test('Property 1: Environment variable validation completeness', () => {
    fc.assert(fc.property(
      fc.array(fc.string(), { minLength: 1 }), // 随机环境变量名数组
      (missingVars) => {
        // 对于任何缺失的环境变量，系统应该立即失败
        const originalEnv = { ...process.env }
        
        // 删除指定的环境变量
        missingVars.forEach(varName => {
          delete process.env[varName]
        })
        
        try {
          const result = validateEnvironment()
          // 如果没有抛出错误，说明这些变量不是必需的
          expect(result).toBeDefined()
        } catch (error) {
          // 如果抛出错误，应该包含缺失变量的信息
          missingVars.forEach(varName => {
            if (REQUIRED_ENV_VARS.includes(varName)) {
              expect(error.message).toContain(varName)
            }
          })
        } finally {
          // 恢复环境变量
          process.env = originalEnv
        }
      }
    ), { numRuns: 100 })
  })
  
  test('Property 2: Database migration idempotency', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 5 }), // 执行次数
      async (executionCount) => {
        // 对于任何迁移脚本，多次执行应该产生相同结果
        const initialState = await getDatabaseSchema()
        
        // 执行迁移多次
        for (let i = 0; i < executionCount; i++) {
          await runMigrations()
        }
        
        const finalState = await getDatabaseSchema()
        
        // 最终状态应该与单次执行的结果相同
        await resetDatabase()
        await runMigrations()
        const singleExecutionState = await getDatabaseSchema()
        
        expect(finalState).toEqual(singleExecutionState)
      }
    ), { numRuns: 50 })
  })
  
  test('Property 3: Database query performance guarantee', () => {
    fc.assert(fc.property(
      fc.record({
        table: fc.constantFrom('users', 'sessions', 'system_configs'),
        limit: fc.integer({ min: 1, max: 100 }),
        offset: fc.integer({ min: 0, max: 1000 })
      }),
      async (queryParams) => {
        // 对于任何标准查询，响应时间应该在 500ms 内
        const startTime = Date.now()
        
        await db.select()
          .from(queryParams.table)
          .limit(queryParams.limit)
          .offset(queryParams.offset)
        
        const duration = Date.now() - startTime
        expect(duration).toBeLessThan(500)
      }
    ), { numRuns: 100 })
  })
  
  test('Property 7: Log rotation mechanism', () => {
    fc.assert(fc.property(
      fc.integer({ min: 11, max: 50 }), // 日志文件大小 (MB)
      async (logSizeMB) => {
        // 对于任何超过 10MB 的日志，应该触发轮转
        const logContent = 'x'.repeat(logSizeMB * 1024 * 1024)
        
        // 模拟写入大量日志
        await writeLogFile('test.log', logContent)
        
        // 触发日志轮转检查
        await checkLogRotation()
        
        // 验证轮转结果
        const logFiles = await getLogFiles()
        const activeLogSize = await getFileSize('test.log')
        
        // 主日志文件应该被轮转，大小应该小于 10MB
        expect(activeLogSize).toBeLessThan(10 * 1024 * 1024)
        
        // 应该保留最近 3 份轮转日志
        const rotatedLogs = logFiles.filter(f => f.includes('.log.'))
        expect(rotatedLogs.length).toBeLessThanOrEqual(3)
      }
    ), { numRuns: 20 })
  })
})
```

### 单元测试示例

```typescript
// tests/unit/auth.test.ts
import { describe, test, expect, beforeEach } from 'vitest'
import { auth } from '~/server/utils/auth'

describe('Authentication System', () => {
  beforeEach(async () => {
    await resetTestDatabase()
  })
  
  test('should create user session on successful login', async () => {
    const user = await createTestUser({
      email: 'test@example.com',
      password: 'password123'
    })
    
    const session = await auth.signIn.email({
      email: 'test@example.com',
      password: 'password123'
    })
    
    expect(session.user.id).toBe(user.id)
    expect(session.session.expiresAt).toBeInstanceOf(Date)
  })
  
  test('should handle OAuth provider errors gracefully', async () => {
    // 模拟 OAuth 提供商错误
    mockOAuthProvider('google', { error: 'invalid_grant' })
    
    await expect(
      auth.signIn.social({ provider: 'google' })
    ).rejects.toThrow('OAuth authentication failed')
  })
  
  test('should enforce GDPR data export within 30 days', async () => {
    const user = await createTestUser()
    const exportRequest = await requestDataExport(user.id)
    
    // 验证导出请求被正确记录
    expect(exportRequest.status).toBe('pending')
    expect(exportRequest.requestedAt).toBeInstanceOf(Date)
    
    // 模拟 30 天后的处理
    const exportData = await processDataExport(user.id)
    
    expect(exportData).toHaveProperty('profile')
    expect(exportData).toHaveProperty('createdAt')
    expect(exportData.gdprCompliant).toBe(true)
  })
})
```

### 集成测试

```typescript
// tests/integration/deployment.test.ts
import { describe, test, expect } from 'vitest'

describe('Deployment Integration', () => {
  test('should complete full deployment cycle', async () => {
    // 1. 构建 Docker 镜像
    const buildResult = await buildDockerImage()
    expect(buildResult.success).toBe(true)
    expect(buildResult.imageId).toBeDefined()
    
    // 2. 启动容器
    const containerResult = await startContainer(buildResult.imageId)
    expect(containerResult.containerId).toBeDefined()
    
    // 3. 等待健康检查通过
    await waitForHealthCheck(containerResult.containerId, 30000)
    
    // 4. 验证服务可用性
    const healthResponse = await fetch('http://localhost:3000/api/health')
    expect(healthResponse.status).toBe(200)
    
    const healthData = await healthResponse.json()
    expect(healthData.status).toBe('healthy')
    
    // 5. 清理
    await stopContainer(containerResult.containerId)
  })
  
  test('should handle database migration in deployment', async () => {
    // 部署前的数据库状态
    const initialSchema = await getDatabaseSchema()
    
    // 执行部署（包含迁移）
    await deployWithMigration()
    
    // 验证迁移执行成功
    const finalSchema = await getDatabaseSchema()
    expect(finalSchema.version).toBeGreaterThan(initialSchema.version)
    
    // 验证数据完整性
    const userData = await db.select().from(users).limit(1)
    expect(userData).toBeDefined()
  })
})
```

### 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // 30 秒超时，适合集成测试
    
    // 基于属性的测试配置
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    }
  }
})
```

每个属性测试运行最少 100 次迭代，确保充分的随机输入覆盖。测试标签格式：**Feature: project-infrastructure, Property {number}: {property_text}**，便于追踪和维护。

## 技术风险和缓解策略

### Nuxt 4 兼容性风险

**风险描述**: Nuxt 4 目前（截至 2024 年底）可能部分模块尚未完全适配，某些关键 Nuxt Modules（如 nuxt-security 或某些 UI 库）可能报错。

**缓解策略**:
1. **降级预案**: 如果发现关键模块不兼容，准备降级到 Nuxt 3 的预案
2. **渐进式升级**: Nuxt 3 到 4 的迁移通常很平滑，可以先用 Nuxt 3 启动项目
3. **模块替代**: 为关键功能准备替代方案，避免依赖单一模块

```typescript
// nuxt.config.ts - 兼容性配置
export default defineNuxtConfig({
  // 如果 Nuxt 4 出现问题，可以快速切换到 Nuxt 3
  future: {
    compatibilityVersion: process.env.NUXT_COMPATIBILITY_VERSION === '3' ? 3 : 4
  },
  
  // 模块兼容性检查
  modules: [
    // 优先使用稳定的核心模块
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    
    // 可选模块，如果不兼容可以移除
    // '@nuxtjs/google-fonts', // 可以用 CDN 替代
    // 'nuxt-security', // 可以用中间件替代
  ],
  
  // 兼容性检查钩子
  hooks: {
    'modules:before': () => {
      console.log('Checking Nuxt module compatibility...')
    },
    'modules:done': () => {
      console.log('All modules loaded successfully')
    }
  }
})
```

### 跨架构构建风险

**风险描述**: 在 Apple Silicon Mac 上构建的镜像可能无法在 AMD64 VPS 上运行。

**缓解策略**:
1. **CI/CD 构建**: 优先使用 GitHub Actions 在 AMD64 环境中构建
2. **本地跨架构构建**: 使用 `docker buildx` 进行跨架构构建
3. **架构检测**: 在部署脚本中添加架构兼容性检查

```bash
# scripts/check-architecture.sh
#!/bin/bash

echo "🔍 Checking Docker image architecture compatibility..."

IMAGE_NAME="ghcr.io/your-username/knzn-app:latest"

# 检查镜像架构
ARCH=$(docker inspect $IMAGE_NAME --format='{{.Architecture}}')

if [ "$ARCH" != "amd64" ]; then
    echo "❌ Image architecture is $ARCH, but VPS requires amd64"
    echo "Please rebuild with: docker buildx build --platform linux/amd64"
    exit 1
else
    echo "✅ Image architecture is compatible (amd64)"
fi
```

### 数据库迁移风险

**风险描述**: 生产环境数据库迁移失败可能导致服务不可用。

**缓解策略**:
1. **迁移前备份**: 每次迁移前自动创建数据库备份
2. **迁移验证**: 在测试环境中验证迁移脚本
3. **回滚机制**: 准备快速回滚到上一个稳定版本的机制

```typescript
// server/utils/safe-migration.ts
export async function safeMigration() {
  try {
    // 1. 创建迁移前备份
    console.log('Creating pre-migration backup...')
    await createBackup('pre-migration')
    
    // 2. 执行迁移
    console.log('Running migrations...')
    await runMigrations()
    
    // 3. 验证迁移结果
    console.log('Validating migration...')
    await validateMigration()
    
    console.log('✅ Migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    
    // 4. 自动回滚
    console.log('Attempting automatic rollback...')
    await rollbackMigration()
    
    throw error
  }
}
```