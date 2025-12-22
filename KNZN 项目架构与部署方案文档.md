# 🏗️ KNZN 项目架构与部署方案文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**文档版本**: v1.0  
**编制时间**: 2024-12-23  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 完整架构与部署规范

## 🎯 项目概述

KNZN 是一个面向全球开发者的硬件学习平台，采用赛博朋克风格的游戏化设计，通过 Wokwi 仿真器提供零成本的硬件学习体验。项目定位为海外市场，重点关注 GDPR/CCPA 合规、邮件服务和全球 CDN 部署。

### 核心特色
- **零成本开始**: 无需购买硬件，基于 Wokwi 云端仿真
- **游戏化学习**: 技能地图、徽章系统、XP 升级机制
- **海外市场**: Email 登录、LinkedIn 集成、全球 CDN
- **自托管架构**: 摆脱 Supabase 依赖，完全控制数据

## 🏗️ 系统架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层 (Client Layer)                    │
├─────────────────────────────────────────────────────────────────┤
│ Web Browser │ Mobile Browser │ Desktop PWA │ API Clients        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN 层 (Vercel Edge)                      │
├─────────────────────────────────────────────────────────────────┤
│ • 全球边缘节点缓存                                              │
│ • 静态资源分发 (JS/CSS/Images)                                 │
│ • 自动 HTTPS 和域名管理                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    应用层 (Nuxt 4 + Nitro)                     │
├─────────────────────────────────────────────────────────────────┤
│ Frontend (Vue 3)        │ Backend (Nitro Server)               │
│ • 首页 (闸刀交互)       │ • API Routes (/api/*)                │
│ • 技能地图 (SVG)        │ • 认证系统 (Better-Auth)             │
│ • 关卡场景 (Wokwi)      │ • 业务逻辑处理                       │
│ • 用户中心              │ • 数据验证和安全                     │
│ • 社区中心              │ • 文件上传处理                       │
│ • 蓝图库                │ • 邮件服务集成                       │
│ • 管理后台              │ • 支付回调处理                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL (VPS)        │ Cloudflare R2        │ Redis (可选)   │
│ • 用户数据              │ • 静态文件存储        │ • 缓存层       │
│ • 学习进度              │ • 图片和视频          │ • 会话存储     │
│ • 社区内容              │ • 蓝图文件            │ • 排行榜       │
│ • 系统配置              │ • 备份文件            │                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    第三方服务层 (External Services)             │
├─────────────────────────────────────────────────────────────────┤
│ Wokwi API              │ Resend Email          │ Lemon Squeezy   │
│ • 电路仿真             │ • 邮件发送            │ • 支付处理      │
│ • 项目管理             │ • 模板管理            │ • 订阅管理      │
│                        │ • 送达率监控          │ • 税务处理      │
├─────────────────────────────────────────────────────────────────┤
│ OpenAI API             │ LinkedIn API          │ Analytics       │
│ • AI 助教              │ • 证书集成            │ • 用户行为      │
│ • 代码纠错             │ • 技能展示            │ • 性能监控      │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈选型

#### 前端技术栈
```typescript
const FRONTEND_STACK = {
  framework: 'Nuxt 4 (Vue 3)',
  styling: 'UnoCSS',
  stateManagement: 'Pinia',
  utilities: 'VueUse',
  icons: 'Iconify',
  animations: 'CSS Transitions + Motion One',
  
  buildTools: {
    bundler: 'Vite',
    typescript: 'TypeScript 5.0+',
    linting: 'ESLint + Prettier'
  }
}
```

#### 后端技术栈
```typescript
const BACKEND_STACK = {
  runtime: 'Nuxt 4 Server (Nitro)',
  database: 'PostgreSQL (自托管)',
  orm: 'Drizzle ORM',
  authentication: 'Better-Auth',
  
  services: {
    email: 'Resend',
    storage: 'Cloudflare R2',
    payment: 'Lemon Squeezy',
    ai: 'OpenAI API (gpt-4o-mini)'
  }
}
```

## 🗄️ 数据库设计

### 核心数据模型

```typescript
// server/database/schema.ts
import { pgTable, text, integer, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core'

// 用户表
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  isPro: boolean('is_pro').default(false),
  role: text('role').default('user'), // 'user' | 'admin' | 'super_admin'
  adminRole: text('admin_role'), // 管理员权限等级
  createdAt: timestamp('created_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at').defaultNow()
})

// OAuth 账号关联表
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  provider: text('provider').notNull(), // 'google', 'github'
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at')
})

// 学习进度表
export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  lessonId: text('lesson_id').notNull(),
  phase: text('phase'), // 'theory', 'practice', 'debug', 'reflection'
  status: text('status'), // 'locked', 'active', 'completed'
  score: integer('score'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
})

// 蓝图表
export const blueprints = pgTable('blueprints', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'), // 'beginner' | 'intermediate' | 'advanced'
  category: text('category'),
  tags: text('tags').array(),
  coverImage: text('cover_image'),
  wokwiProjectId: text('wokwi_project_id'),
  bomData: jsonb('bom_data'),
  affiliateLinks: jsonb('affiliate_links'),
  downloadUrl: text('download_url'),
  hasProContent: boolean('has_pro_content').default(false),
  isOfficial: boolean('is_official').default(true),
  downloads: integer('downloads').default(0),
  rating: integer('rating').default(0),
  createdAt: timestamp('created_at').defaultNow()
})

// 证书表
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(), // 8位短ID
  userId: text('user_id').references(() => users.id),
  badgeType: text('badge_type').notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  verifyHash: text('verify_hash').notNull(),
  isRevoked: boolean('is_revoked').default(false)
})

// 社区帖子表
export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type'), // 'project', 'discussion', 'help'
  wokwiProjectId: text('wokwi_project_id'),
  images: text('images').array(),
  tags: text('tags').array(),
  likes: integer('likes').default(0),
  replies: integer('replies').default(0),
  status: text('status').default('published'), // 'draft', 'published', 'archived'
  createdAt: timestamp('created_at').defaultNow()
})

// 关卡配置表 (CMS)
export const lessonConfigs = pgTable('lesson_configs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  difficulty: text('difficulty'),
  category: text('category'),
  config: jsonb('config'), // 完整的关卡配置JSON
  status: text('status').default('draft'), // 'draft', 'published', 'archived'
  version: integer('version').default(1),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  publishedAt: timestamp('published_at')
})

// 备份日志表
export const backupLogs = pgTable('backup_logs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'manual', 'scheduled', 'restore'
  status: text('status').notNull(), // 'completed', 'failed'
  fileSize: text('file_size'),
  error: text('error'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow()
})
```

### 数据库连接配置

```typescript
// server/database/connection.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const DATABASE_CONFIG = {
  connectionPool: {
    host: process.env.DATABASE_HOST,
    port: 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    
    // 连接池设置
    max: 15, // 最大连接数
    min: 2,  // 最小连接数
    idle: 30000, // 空闲超时 30s
    acquire: 60000, // 获取连接超时 60s
    
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
}

const queryClient = postgres(process.env.DATABASE_URL!, DATABASE_CONFIG.connectionPool)
export const db = drizzle(queryClient)
```

## 🔐 认证系统架构

### Better-Auth 配置

```typescript
// server/api/auth/[...].ts
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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your KNZN Password',
        template: 'password-reset',
        data: { resetUrl: url, userName: user.name }
      })
    }
  },
  
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      await sendEmail({
        to: email,
        subject: 'Sign in to KNZN',
        template: 'magic-link',
        data: { loginUrl: url }
      })
    }
  },
  
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  },
  
  // GDPR 合规配置
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
      requireEmailVerification: true
    }
  }
})
```

### 权限管理系统

```typescript
// server/middleware/admin-auth.ts
export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith('/admin')) return
  
  const session = await getUserSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin authentication required'
    })
  }
  
  const user = await db.select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
  
  if (!user.length || !user[0].adminRole) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access denied'
    })
  }
  
  event.context.admin = {
    id: user[0].id,
    role: user[0].adminRole,
    permissions: getAdminPermissions(user[0].adminRole)
  }
})

enum AdminRole {
  SUPER_ADMIN = 'super_admin',     // 超级管理员：所有权限
  CONTENT_ADMIN = 'content_admin', // 内容管理员：内容审核、蓝图管理
  SUPPORT_ADMIN = 'support_admin', // 客服管理员：用户支持、申诉处理
  READONLY_ADMIN = 'readonly_admin' // 只读管理员：仅查看数据
}
```

## 📧 邮件服务架构

### Resend 集成配置

```typescript
// server/utils/email.ts
const EMAIL_CONFIG = {
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY,
  fromDomain: 'knzn.net',
  
  // 必须配置 DKIM 和 SPF，防止进垃圾箱
  dnsRecords: {
    spf: 'v=spf1 include:_spf.resend.com ~all',
    dkim: 'resend._domainkey.knzn.net',
    dmarc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@knzn.net'
  },
  
  // 邮件模板（多语言支持）
  templates: {
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
    },
    courseProgress: {
      subject: 'Great Progress! You completed {courseName}',
      template: 'course-progress.html'
    },
    certificate: {
      subject: 'Your KNZN Certificate is Ready!',
      template: 'certificate-ready.html',
      attachments: true // PDF 证书
    }
  },
  
  // 发送频率限制（防止被标记为垃圾邮件）
  rateLimiting: {
    perUser: 10, // 每用户每小时最多 10 封
    perDomain: 1000, // 每域名每小时最多 1000 封
    cooldown: 60 // 同类邮件间隔 60 秒
  }
}

// 邮件发送封装
const sendEmail = async (options: {
  to: string
  template: string
  data: Record<string, any>
  attachments?: Buffer[]
}) => {
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
        subject: EMAIL_CONFIG.templates[options.template].subject,
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

## 💳 支付系统架构

### Lemon Squeezy 集成

```typescript
// server/api/webhook/lemon-squeezy.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const signature = getHeader(event, 'x-signature')
  
  // 验证 webhook 签名
  if (!verifyLemonSqueezySignature(body, signature)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid signature'
    })
  }
  
  const { event_name, data } = body
  
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
  }
  
  return { success: true }
})

const handleSubscriptionCreated = async (data: any) => {
  const { customer_id, status, product_name } = data.attributes
  
  // 根据 customer_id 找到用户
  const user = await db.select()
    .from(users)
    .where(eq(users.email, customer_id))
    .limit(1)
  
  if (user.length) {
    await db.update(users)
      .set({ 
        isPro: true,
        proSubscriptionStatus: status,
        proSubscriptionPlan: product_name
      })
      .where(eq(users.id, user[0].id))
  }
}
```

## 🗂️ 文件存储架构

### Cloudflare R2 配置

```typescript
// server/utils/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// 生成预签名上传 URL
export const generateUploadUrl = async (fileName: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: 'knzn-assets',
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: contentType,
  })
  
  return await getSignedUrl(r2Client, command, { expiresIn: 300 }) // 5分钟有效
}

// 文件上传处理
// server/api/upload/presign.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fileName, fileType, fileSize } = body
  
  // 验证用户权限
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  // 验证文件类型和大小
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(fileType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file type' })
  }
  
  if (fileSize > 500 * 1024) { // 500KB 限制
    throw createError({ statusCode: 400, statusMessage: 'File too large' })
  }
  
  const presignedUrl = await generateUploadUrl(fileName, fileType)
  
  return { presignedUrl }
})
```

## 🔄 数据备份与容灾

### 自动备份系统

```bash
#!/bin/bash
# 自动备份脚本 - /scripts/backup.sh

# 配置变量
BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="knzn_production"
BACKUP_FILE="knzn_backup_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gz.enc"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 1. 执行数据库备份
echo "Starting database backup..."
pg_dump $DATABASE_URL > $BACKUP_DIR/$BACKUP_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "Database backup completed: $BACKUP_FILE"
else
    echo "Database backup failed!"
    exit 1
fi

# 2. 压缩备份文件
echo "Compressing backup..."
gzip $BACKUP_DIR/$BACKUP_FILE

# 3. 加密压缩文件
echo "Encrypting backup..."
openssl enc -aes-256-cbc -salt \
    -in $BACKUP_DIR/${BACKUP_FILE}.gz \
    -out $BACKUP_DIR/$ENCRYPTED_FILE \
    -k $BACKUP_PASSWORD

# 4. 上传到 Cloudflare R2
echo "Uploading to R2..."
aws s3 cp $BACKUP_DIR/$ENCRYPTED_FILE \
    s3://knzn-backups/database/$ENCRYPTED_FILE \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

# 5. 清理本地文件
rm $BACKUP_DIR/${BACKUP_FILE}.gz
rm $BACKUP_DIR/$ENCRYPTED_FILE

# 6. 清理旧备份（保留30天）
aws s3 ls s3://knzn-backups/database/ \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com \
    | awk '$1 < "'$(date -d '30 days ago' '+%Y-%m-%d')'" {print $4}' \
    | xargs -I {} aws s3 rm s3://knzn-backups/database/{} \
    --endpoint-url https://$CLOUDFLARE_ACCOUNT_ID.r2.cloudflarestorage.com

echo "Backup completed successfully: $ENCRYPTED_FILE"
```

### Cron Job 配置

```typescript
// server/tasks/backup.ts
import cron from 'node-cron'

// 每天凌晨 2 点执行备份
cron.schedule('0 2 * * *', async () => {
  console.log('Starting scheduled backup...')
  
  try {
    await execAsync('/scripts/backup.sh')
    
    // 记录成功日志
    await db.insert(backupLogs).values({
      id: nanoid(),
      type: 'scheduled',
      status: 'completed',
      createdAt: new Date()
    })
    
    console.log('Scheduled backup completed successfully')
  } catch (error) {
    console.error('Scheduled backup failed:', error)
    
    // 记录失败日志
    await db.insert(backupLogs).values({
      id: nanoid(),
      type: 'scheduled',
      status: 'failed',
      error: error.message,
      createdAt: new Date()
    })
    
    // 发送告警邮件
    await sendAlertEmail('Backup Failed', error.message)
  }
}, {
  timezone: 'UTC'
})
```

## 🚀 部署架构

### Vercel 部署配置

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
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "GOOGLE_CLIENT_ID": "@google_client_id",
    "GOOGLE_CLIENT_SECRET": "@google_client_secret",
    "GITHUB_CLIENT_ID": "@github_client_id",
    "GITHUB_CLIENT_SECRET": "@github_client_secret",
    "RESEND_API_KEY": "@resend_api_key",
    "OPENAI_API_KEY": "@openai_api_key",
    "R2_ACCESS_KEY_ID": "@r2_access_key_id",
    "R2_SECRET_ACCESS_KEY": "@r2_secret_access_key",
    "CLOUDFLARE_ACCOUNT_ID": "@cloudflare_account_id",
    "LEMON_SQUEEZY_API_KEY": "@lemon_squeezy_api_key",
    "BACKUP_PASSWORD": "@backup_password"
  },
  "functions": {
    "server/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Nuxt 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // 模块配置
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts'
  ],
  
  // CSS 配置
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/main.css'
  ],
  
  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅服务端）
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
    backupPassword: process.env.BACKUP_PASSWORD,
    
    // 公共配置（客户端可访问）
    public: {
      siteUrl: process.env.SITE_URL || 'https://knzn.net',
      wokwiApiUrl: 'https://wokwi.com/api'
    }
  },
  
  // Nitro 配置
  nitro: {
    experimental: {
      wasm: true
    },
    storage: {
      redis: {
        driver: 'redis',
        // Redis 配置（可选）
      }
    }
  },
  
  // 构建配置
  build: {
    transpile: ['@headlessui/vue']
  },
  
  // 服务端渲染配置
  ssr: true,
  
  // 预渲染配置
  prerender: {
    routes: ['/']
  }
})
```

### VPS PostgreSQL 部署

```bash
# PostgreSQL 安装和配置脚本
#!/bin/bash

# 1. 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 2. 创建数据库和用户
sudo -u postgres psql << EOF
CREATE DATABASE knzn_production;
CREATE USER knzn_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE knzn_production TO knzn_user;
ALTER USER knzn_user CREATEDB;
\q
EOF

# 3. 配置 PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# 修改以下配置：
# listen_addresses = '*'
# max_connections = 100
# shared_buffers = 256MB
# effective_cache_size = 1GB

sudo nano /etc/postgresql/14/main/pg_hba.conf
# 添加以下行：
# host knzn_production knzn_user 0.0.0.0/0 md5

# 4. 重启 PostgreSQL
sudo systemctl restart postgresql
sudo systemctl enable postgresql

# 5. 配置防火墙
sudo ufw allow 5432/tcp

# 6. 创建备份目录
sudo mkdir -p /var/backups/postgresql
sudo chown postgres:postgres /var/backups/postgresql
```

## 🔒 安全配置

### HTTPS 和域名配置

```typescript
// server/middleware/security.ts
export default defineEventHandler(async (event) => {
  // 设置安全头
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-XSS-Protection', '1; mode=block')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (仅在生产环境)
  if (process.env.NODE_ENV === 'production') {
    setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // CSP 配置
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://wokwi.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.resend.com https://api.openai.com https://wokwi.com",
    "frame-src 'self' https://wokwi.com https://knzn.lemonsqueezy.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
  
  setHeader(event, 'Content-Security-Policy', csp)
})
```

### 环境变量管理

```bash
# .env.example
# 数据库配置
DATABASE_URL="postgresql://knzn_user:password@localhost:5432/knzn_production"

# OAuth 配置
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# 邮件服务
RESEND_API_KEY="re_your_resend_api_key"

# AI 服务
OPENAI_API_KEY="sk-your_openai_api_key"

# 文件存储
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"

# 支付服务
LEMON_SQUEEZY_API_KEY="your_lemon_squeezy_api_key"

# 备份加密
BACKUP_PASSWORD="your_backup_encryption_password"

# 站点配置
SITE_URL="https://knzn.net"
```

## 📊 监控与分析

### 系统监控配置

```typescript
// server/utils/monitoring.ts
const SYSTEM_MONITORING = {
  // 数据库监控
  database: {
    connectionPool: {
      current: () => db.pool.totalCount,
      max: () => db.pool.options.max,
      idle: () => db.pool.idleCount,
      waiting: () => db.pool.waitingCount
    },
    
    slowQueries: async () => {
      return await db.execute(sql`
        SELECT query, mean_exec_time, calls, total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000 
        ORDER BY mean_exec_time DESC 
        LIMIT 10
      `)
    }
  },
  
  // 错误监控
  errorTracking: {
    recentErrors: async (hours: number = 24) => {
      return await db.select()
        .from(errorLogs)
        .where(sql`created_at > NOW() - INTERVAL '${hours} hours'`)
        .orderBy(desc(errorLogs.createdAt))
        .limit(100)
    }
  },
  
  // Wokwi API 监控
  wokwiMonitoring: {
    apiCalls: {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0
    }
  }
}
```

### 性能优化配置

```typescript
// server/middleware/performance.ts
export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  // 响应完成后记录性能指标
  event.node.res.on('finish', () => {
    const duration = Date.now() - startTime
    const url = event.node.req.url
    const method = event.node.req.method
    const statusCode = event.node.res.statusCode
    
    // 记录慢请求
    if (duration > 1000) {
      console.warn(`Slow request: ${method} ${url} - ${duration}ms`)
    }
    
    // 记录错误请求
    if (statusCode >= 400) {
      console.error(`Error request: ${method} ${url} - ${statusCode}`)
    }
  })
})
```

## 🌍 GDPR 合规配置

### 隐私合规系统

```typescript
// server/utils/privacy.ts
const PRIVACY_COMPLIANCE = {
  cookieConsent: {
    enabled: true,
    
    categories: {
      necessary: {
        name: 'Strictly Necessary',
        description: 'Essential for the website to function',
        required: true,
        cookies: ['session', 'csrf-token', 'auth-state']
      },
      analytics: {
        name: 'Analytics',
        description: 'Help us understand how you use our site',
        required: false,
        cookies: ['_ga', '_gid', 'gtag']
      }
    }
  },
  
  // 用户权利实现
  userRights: {
    // 数据导出权（GDPR Article 20）
    dataExport: {
      endpoint: '/api/privacy/export-data',
      formats: ['json', 'csv'],
      includeData: [
        'profile', 'progress', 'certificates', 
        'posts', 'comments', 'achievements'
      ]
    },
    
    // 删除权（GDPR Article 17）
    dataDelete: {
      endpoint: '/api/privacy/delete-account',
      confirmationRequired: true,
      gracePeriod: 30, // 30 天内可恢复
      anonymizeData: true
    }
  }
}

// 数据导出 API
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
    progress: await getUserProgress(userId),
    certificates: await getUserCertificates(userId),
    posts: await getUserPosts(userId),
    comments: await getUserComments(userId)
  }
  
  // 生成导出文件
  const exportData = JSON.stringify(userData, null, 2)
  
  return {
    data: exportData,
    exportedAt: new Date().toISOString(),
    format: 'json'
  }
})
```

## 📈 扩展性设计

### 微服务架构准备

```typescript
// 为未来微服务化做准备的模块化设计
const SERVICE_MODULES = {
  auth: {
    path: '/server/services/auth',
    responsibilities: ['用户认证', '权限管理', '会话管理']
  },
  
  learning: {
    path: '/server/services/learning',
    responsibilities: ['关卡管理', '进度跟踪', '成就系统']
  },
  
  community: {
    path: '/server/services/community',
    responsibilities: ['社区内容', '用户互动', '内容审核']
  },
  
  payment: {
    path: '/server/services/payment',
    responsibilities: ['订阅管理', '支付处理', '发票生成']
  },
  
  notification: {
    path: '/server/services/notification',
    responsibilities: ['邮件发送', '推送通知', '消息队列']
  }
}
```

### 缓存策略

```typescript
// server/utils/cache.ts
const CACHE_STRATEGY = {
  redis: {
    enabled: process.env.REDIS_URL ? true : false,
    ttl: {
      userSession: 3600, // 1小时
      leaderboard: 3600, // 1小时
      blueprints: 86400, // 24小时
      userProgress: 300 // 5分钟
    }
  },
  
  memory: {
    enabled: true,
    maxSize: 100, // 100MB
    ttl: 300 // 5分钟
  }
}

// 缓存装饰器
export const cached = (ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cached = await getFromCache(cacheKey)
      if (cached) return cached
      
      // 执行原方法
      const result = await originalMethod.apply(this, args)
      
      // 存入缓存
      await setCache(cacheKey, result, ttl)
      
      return result
    }
  }
}
```

## 🚀 部署流程

### CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 部署检查清单

```markdown
## 部署前检查清单

### 环境配置
- [ ] 所有环境变量已在 Vercel 中配置
- [ ] PostgreSQL 数据库已部署并可访问
- [ ] Cloudflare R2 存储桶已创建
- [ ] DNS 记录已正确配置

### 第三方服务
- [ ] Google OAuth 应用已配置
- [ ] GitHub OAuth 应用已配置
- [ ] Resend 邮件服务已配置
- [ ] OpenAI API 密钥已获取
- [ ] Lemon Squeezy 商户已设置

### 安全配置
- [ ] HTTPS 证书已配置
- [ ] 安全头已设置
- [ ] CORS 策略已配置
- [ ] 备份系统已测试

### 功能测试
- [ ] 用户注册/登录流程
- [ ] 邮件发送功能
- [ ] 文件上传功能
- [ ] 支付回调处理
- [ ] 数据库备份恢复

### 性能优化
- [ ] 静态资源 CDN 配置
- [ ] 数据库查询优化
- [ ] 缓存策略实施
- [ ] 图片压缩配置
```

## 📊 成本预算

### 运营成本估算（月度）

```typescript
const MONTHLY_COSTS = {
  // 基础设施
  vercel: {
    plan: 'Pro',
    cost: 20, // $20/月
    description: '无限带宽，边缘函数，分析'
  },
  
  vps: {
    provider: 'DigitalOcean/Linode',
    plan: '2GB RAM, 1 CPU',
    cost: 12, // $12/月
    description: 'PostgreSQL 数据库服务器'
  },
  
  cloudflareR2: {
    storage: '10GB',
    bandwidth: '100GB',
    cost: 5, // ~$5/月
    description: '文件存储和 CDN'
  },
  
  // 第三方服务
  resend: {
    plan: 'Pro',
    emails: '50,000/月',
    cost: 20, // $20/月
    description: '邮件发送服务'
  },
  
  openai: {
    usage: 'gpt-4o-mini',
    tokens: '1M tokens/月',
    cost: 15, // ~$15/月
    description: 'AI 助教服务'
  },
  
  lemonSqueezy: {
    commission: '5% + $0.50',
    cost: 0, // 按交易收费
    description: '支付处理（从收入中扣除）'
  },
  
  // 总计
  total: 72, // $72/月
  
  // 收入目标
  revenue: {
    proSubscriptions: 500 * 9.99, // 500个Pro用户 * $9.99
    affiliateCommission: 500, // 联盟营销佣金
    total: 5495 // $5,495/月
  },
  
  // 净利润
  netProfit: 5495 - 72, // $5,423/月
  profitMargin: '98.7%'
}
```

## 📋 开发时间表

### MVP 开发计划（12周）

```typescript
const DEVELOPMENT_TIMELINE = {
  // Phase 1: 基础架构 (Week 1-3)
  phase1: {
    duration: '3 weeks',
    tasks: [
      'Nuxt 4 项目初始化',
      'PostgreSQL + Drizzle ORM 配置',
      'Better-Auth 集成',
      'Vercel 部署配置',
      '基础 UI 组件库'
    ]
  },
  
  // Phase 2: 核心功能 (Week 4-7)
  phase2: {
    duration: '4 weeks',
    tasks: [
      '首页闸刀交互',
      '技能地图 SVG 版本',
      '关卡场景 + Wokwi 集成',
      '用户中心页面',
      '蓝图库基础功能'
    ]
  },
  
  // Phase 3: 商业化功能 (Week 8-10)
  phase3: {
    duration: '3 weeks',
    tasks: [
      'Lemon Squeezy 支付集成',
      '认证系统 + 证书生成',
      'Pro 会员功能',
      '邮件服务集成',
      'LinkedIn 证书集成'
    ]
  },
  
  // Phase 4: 社区与管理 (Week 11-12)
  phase4: {
    duration: '2 weeks',
    tasks: [
      '社区中心基础功能',
      '管理后台',
      '数据备份系统',
      '性能优化',
      '安全加固'
    ]
  }
}
```

## 🎯 成功指标

### 关键性能指标 (KPI)

| 指标类别 | 指标名称 | 目标值 | 监测频率 |
|----------|----------|--------|----------|
| **用户增长** | 月活跃用户 | 1,000+ | 每月 |
| **用户增长** | 新用户注册 | 200+/月 | 每周 |
| **用户留存** | 7天留存率 | 60%+ | 每周 |
| **用户留存** | 30天留存率 | 30%+ | 每月 |
| **商业化** | Pro 转化率 | 5%+ | 每周 |
| **商业化** | 月收入 | $5,000+ | 每月 |
| **技术指标** | 页面加载时间 | <2s | 每日 |
| **技术指标** | API 响应时间 | <500ms | 每日 |
| **技术指标** | 系统可用性 | 99.9%+ | 每月 |
| **内容质量** | 关卡完成率 | 70%+ | 每周 |
| **内容质量** | 用户满意度 | 4.5+⭐ | 每月 |

---

**文档版本**: v1.0  
**编制时间**: 2024-12-23  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队

---

## 📞 联系信息

如有任何技术问题或需要进一步澄清，请联系：
- 技术负责人：[技术负责人姓名]
- 邮箱：[tech@knzn.net]
- 项目仓库：[GitHub 仓库链接]