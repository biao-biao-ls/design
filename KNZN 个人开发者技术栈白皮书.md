# 📜 KNZN 个人开发者技术栈白皮书 (v3.0 - 海外市场版)

> **核心原则**：不造轮子 (No Reinventing the Wheel)。作为个人开发者，只写核心业务逻辑，基础设施全部"外包"给成熟的 SaaS 和开源库。
> 
> **海外市场定位**：面向全球开发者的硬件学习平台，重点关注 GDPR/CCPA 合规、海外支付、邮件服务等关键基础设施。

## 1. 核心架构 (The Core Stack - 海外优化版)

我们采用 **"BFF"** 架构（Backend for Frontend），彻底移除 Supabase 依赖，转为自托管模式，获得更好的性能和控制力。**针对海外市场，特别强化 GDPR 合规、邮件服务和全球 CDN 部署。**

| 模块 | 选型 | 理由 (Why?) | 海外市场优势 |
| --- | --- | --- | --- |
| **全栈框架** | **Nuxt 4** (Vue 3) | 单一代码库 (Monorepo) 体验，SEO 友好，自动路由，极佳的开发体验 (DX)。 | 完美支持 SSR，利于 Google SEO |
| **后端服务** | **Nuxt 4 Server (Nitro)** | 承担 API 接口和业务逻辑，冷启动快，部署简单，与前端完美集成。 | Edge Runtime 支持，全球低延迟 |
| **数据库** | **PostgreSQL (自托管)** | 部署在 VPS，完全控制数据，无供应商锁定，成本可控。 | 符合 GDPR 数据主权要求 |
| **ORM** | **Drizzle ORM** | 轻量、Type-safe、冷启动快，完美契合 Serverless 环境。 | 原生支持数据导出（GDPR 要求） |
| **鉴权系统** | **Better-Auth** | 集成 Google/Github OAuth，数据存本地库，无第三方依赖。 | **海外标配：Email + OAuth，无手机号** |
| **支付/订阅** | **Lemon Squeezy** | 专为 SaaS 设计的"全托管"支付平台。自动处理全球税务、发票、退款。**彻底摆脱合规烦恼。** | **自动处理欧盟 VAT 和美国各州税法** |
| **部署托管** | **Vercel** | 零配置部署 Nuxt，全球 CDN 加速，Git 提交即发布。免费层级足够支撑 MVP。 | **无需 ICP 备案，全球 CDN 加速** |
| **邮件服务** | **Resend** | 开发者友好的 API，送达率高，免费额度大。 | **海外 Email is King，必备基础设施** |
| **对象存储** | **Cloudflare R2** | 成本极低 ($0.015/GB)，全球 CDN 加速，与 PostgreSQL 完美分离。 | 全球边缘节点，符合数据本地化要求 |

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

## 3. 关键第三方服务 (Critical 3rd-Party Services - 海外市场版)

这些服务解决了 KNZN 的特定业务难点，并确保海外市场合规性。

* **电路仿真**: **Wokwi** (iframe集成) ⚠️ **商业授权风险**
* *用途*：提供 Arduino/ESP32 在线仿真环境。
* *集成方式*：`postMessage` 通信，控制代码运行和获取串口输出。
* *商业风险*：通过嵌入 Wokwi 进行商业化（收会员费）需要仔细研读 Wokwi 的 Terms of Service。
* *建议*：如果流量做大了，可能需要购买 Wokwi 的 Club 计划或进行商业授权咨询，避免法律风险。


* **AI 助教**: **OpenAI API** (`gpt-4o-mini`)
* *用途*：代码纠错、原理解释。
* *特点*：`gpt-4o-mini` 极其便宜且速度快，适合高频低难度的教学对话。


* **对象存储**: **Cloudflare R2** (主) / **AWS S3** (备选)
* *用途*：存储用户上传的图片、蓝图文件、证书附件等。
* *特点*：成本极低 ($0.015/GB)，全球 CDN 加速，与 PostgreSQL 完美分离。
* *集成方式*：前端直传 (Presigned URL)，后端只负责签名验证。


* **邮件服务**: **Resend** ⭐ **海外核心基础设施**
* *用途*：注册验证、密码重置、Magic Link 登录、课程进度提醒、证书发送。
* *特点*：开发者友好的 API，送达率高，免费额度大。
* *海外重要性*：Email is King，所有用户交互都依赖邮件。
* *合规配置*：必须配置 DKIM 和 SPF 记录，防止进垃圾箱。


* **隐私合规**: **Cookie Consent Banner** ⭐ **GDPR/CCPA 必需**
* *用途*：Cookie 同意横幅，用户数据处理同意。
* *实现*：使用 `@nuxtjs/gtag` + 自定义 Cookie Banner 组件。
* *功能*：支持用户"删除数据权"和"数据导出权"。


* **数据备份与容灾**: **自动化备份系统** ⚠️ **自建数据库责任**
* *用途*：PostgreSQL 数据库自动备份、加密存储、容灾恢复。
* *方案*：每日自动 pg_dump + 加密 + 上传到 Cloudflare R2。
* *风险*：自建 PostgreSQL 意味着要自己负责备份，VPS 挂了用户数据怎么办？
* *实现*：Cron Job + OpenSSL 加密 + R2 存储，保留 30 天备份。


* **PDF 生成**: **jspdf** + **html2canvas**
* *用途*：前端生成"结业证书"，无需后端渲染。


### 邮件服务架构设计 (海外核心基础设施)

```typescript
// 🌍 海外市场：Email is King，所有用户交互都依赖邮件
const EMAIL_CONFIG = {
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY,
  fromDomain: 'knzn.net',
  
  // 🛡️ 必须配置 DKIM 和 SPF，防止进垃圾箱
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

### 数据备份与容灾架构设计

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

```typescript
// 备份管理 API
// server/api/admin/backup/create.post.ts
export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const admin = event.context.admin
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Super admin access required'
    })
  }
  
  try {
    // 执行备份脚本
    const { stdout, stderr } = await execAsync('/scripts/backup.sh')
    
    // 记录备份日志
    await db.insert(backupLogs).values({
      id: nanoid(),
      type: 'manual',
      status: 'completed',
      fileSize: await getBackupFileSize(),
      createdBy: admin.id,
      createdAt: new Date()
    })
    
    return {
      success: true,
      message: 'Backup created successfully',
      output: stdout
    }
  } catch (error) {
    // 记录失败日志
    await db.insert(backupLogs).values({
      id: nanoid(),
      type: 'manual',
      status: 'failed',
      error: error.message,
      createdBy: admin.id,
      createdAt: new Date()
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Backup failed: ' + error.message
    })
  }
})

// 恢复备份 API
// server/api/admin/backup/restore.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { backupFile, confirmationCode } = body
  
  // 验证超级管理员权限
  const admin = event.context.admin
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Super admin access required'
    })
  }
  
  // 验证确认码（防止误操作）
  if (confirmationCode !== 'RESTORE_DATABASE_CONFIRM') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid confirmation code'
    })
  }
  
  try {
    // 1. 下载备份文件
    await downloadFromR2(`backups/database/${backupFile}`, `/tmp/${backupFile}`)
    
    // 2. 解密文件
    await execAsync(`openssl enc -aes-256-cbc -d -in /tmp/${backupFile} -out /tmp/restore.sql.gz -k ${process.env.BACKUP_PASSWORD}`)
    
    // 3. 解压文件
    await execAsync('gunzip /tmp/restore.sql.gz')
    
    // 4. 创建当前数据库备份（安全措施）
    await execAsync('/scripts/backup.sh')
    
    // 5. 恢复数据库
    await execAsync(`psql ${process.env.DATABASE_URL} < /tmp/restore.sql`)
    
    // 6. 清理临时文件
    await execAsync('rm /tmp/restore.sql')
    
    // 记录恢复日志
    await db.insert(backupLogs).values({
      id: nanoid(),
      type: 'restore',
      status: 'completed',
      backupFile,
      createdBy: admin.id,
      createdAt: new Date()
    })
    
    return {
      success: true,
      message: 'Database restored successfully'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Restore failed: ' + error.message
    })
  }
})
```

```typescript
// Cron Job 配置
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

```typescript
// 🛡️ 隐私合规系统
const PRIVACY_COMPLIANCE = {
  cookieConsent: {
    enabled: true,
    
    // Cookie 分类
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
      },
      marketing: {
        name: 'Marketing',
        description: 'Used to track visitors across websites',
        required: false,
        cookies: ['fbp', 'linkedin_pixel']
      }
    },
    
    // Banner 配置
    banner: {
      position: 'bottom',
      theme: 'cyberpunk',
      showOnFirstVisit: true,
      showSettingsLink: true
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
      anonymizeData: true // 保留统计数据但匿名化
    },
    
    // 更正权（GDPR Article 16）
    dataCorrection: {
      selfService: true,
      fields: ['name', 'email', 'preferences']
    }
  },
  
  // 数据处理记录
  dataProcessing: {
    purposes: [
      'Service provision',
      'User authentication', 
      'Learning progress tracking',
      'Certificate generation',
      'Customer support'
    ],
    legalBasis: 'Legitimate interest + User consent',
    retentionPeriod: '3 years after last activity',
    thirdPartySharing: [
      'Vercel (hosting)',
      'Resend (email)',
      'Cloudflare (CDN)',
      'OpenAI (AI features)'
    ]
  }
}

// Cookie Consent Banner 组件
// components/CookieConsentBanner.vue
<template>
  <div v-if="showBanner" class="cookie-banner">
    <div class="banner-content">
      <h3>We use cookies</h3>
      <p>We use cookies to enhance your experience and analyze site usage.</p>
      
      <div class="cookie-categories">
        <label v-for="category in categories" :key="category.id">
          <input 
            type="checkbox" 
            v-model="category.accepted"
            :disabled="category.required"
          />
          {{ category.name }}
        </label>
      </div>
      
      <div class="banner-actions">
        <button @click="acceptAll">Accept All</button>
        <button @click="acceptSelected">Accept Selected</button>
        <button @click="showSettings = true">Settings</button>
      </div>
    </div>
  </div>
</template>
```



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

## 5. 鉴权模块调整 (Self-hosted Auth - 海外市场版)

**放弃**：Supabase Client SDK (supabase.auth.signInWith...)  
**新增**：在 Nuxt Server 端集成 Better-Auth，**专为海外市场优化**

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
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },
  
  // 🔐 Magic Link 登录（海外用户偏好）
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
  
  // 🛡️ GDPR 合规配置
  user: {
    deleteUser: {
      enabled: true, // 支持用户删除账户（GDPR 要求）
    },
    changeEmail: {
      enabled: true,
      requireEmailVerification: true
    }
  }
})

export default defineEventHandler(async (event) => {
  return auth.handler(event.node.req, event.node.res)
})
```

**海外登录流程**：
1. **Email + Magic Link**（主推）：用户输入邮箱 → 收到登录链接 → 点击登录
2. **Email + Password**（传统）：用户注册邮箱密码 → 邮箱验证 → 登录
3. **Google OAuth**（便捷）：一键 Google 登录
4. **GitHub OAuth**（开发者友好）：面向技术用户

**🚫 绝不使用的登录方式**：
- ❌ 手机号 + 验证码（海外用户极度反感）
- ❌ 微信登录（海外无法使用）
- ❌ QQ 登录（海外无法使用）

**安全性与合规**：
- Cookie 设置：`SameSite=Lax`, `Secure`, `HttpOnly`
- 支持用户数据导出（GDPR 要求）
- 支持用户账户删除（GDPR 要求）
- 邮件验证必需（防止垃圾注册）

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

6. **Better-Auth 兼容性备选方案**
* Better-Auth 在 Nuxt 4 中如遇到 edge case，可切换到 NuxtAuth (Auth.js)
* 保持技术栈灵活性，避免被单一库锁定

7. **对象存储最佳实践**
* 坚持前端压缩 → 直传 R2 模式，后端只负责签名
* 千万不要让原图经过后端，会打爆 VPS 带宽和内存
* 定期清理孤儿文件，控制存储成本