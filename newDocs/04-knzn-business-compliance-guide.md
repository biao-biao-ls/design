# 📕 KNZN 商业化与合规指南 (Business)

> **核心目标**: 全球市场合规 + 自动化商业化 - Lemon Squeezy 支付 + GDPR 合规 + SEO 优化

## 📋 文档概述

**商业模式**: SaaS 订阅 + 联盟营销  
**合规要求**: GDPR/CCPA + 全球税务自动化  
**营销策略**: SEO + 内容营销 + 社区驱动  
**文档版本**: v2.0 (KNZN 专用版)  

## 💳 支付系统 (Lemon Squeezy)

### 商业化架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        全球用户支付                              │
├─────────────────────────────────────────────────────────────────┤
│ 🇺🇸 USD │ 🇪🇺 EUR │ 🇬🇧 GBP │ 🇯🇵 JPY │ 🇦🇺 AUD            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lemon Squeezy 支付网关                      │
├─────────────────────────────────────────────────────────────────┤
│ • 自动税务处理 (VAT/GST/Sales Tax)                             │
│ • 多币种支持 (150+ 国家)                                       │
│ • 欺诈检测和风险管理                                            │
│ • 自动发票生成                                                  │
│ • 退款和争议处理                                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      KNZN 订阅管理                             │
├─────────────────────────────────────────────────────────────────┤
│ Webhook 处理        │ 用户权限同步      │ 使用量跟踪              │
│ • 订阅创建          │ • Pro 权限开通    │ • API 调用限制          │
│ • 订阅更新          │ • 功能解锁        │ • 存储配额              │
│ • 订阅取消          │ • 降级处理        │ • 邮件发送限制          │
│ • 支付失败          │ • 宽限期管理      │ • 优先支持              │
└─────────────────────────────────────────────────────────────────┘
```

### 订阅计划配置

```typescript
// shared/types/subscription.ts
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: PlanFeature[]
  limits: PlanLimits
  popular?: boolean
}

export interface PlanFeature {
  name: string
  description: string
  included: boolean
  limit?: number
}

export interface PlanLimits {
  simulationTime: number // 分钟/月
  storageQuota: number // MB
  aiQueries: number // 次/月
  emailSupport: boolean
  prioritySupport: boolean
  certificateDownloads: number
  blueprintAccess: 'basic' | 'premium' | 'all'
}

// 订阅计划定义
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      { name: 'Basic Simulations', description: '30 minutes per month', included: true, limit: 30 },
      { name: 'Community Access', description: 'Join discussions and share projects', included: true },
      { name: 'Basic Blueprints', description: 'Access to 20+ free blueprints', included: true },
      { name: 'Email Support', description: 'Community support only', included: false },
      { name: 'Certificates', description: 'Basic completion certificates', included: true, limit: 3 }
    ],
    limits: {
      simulationTime: 30,
      storageQuota: 100,
      aiQueries: 10,
      emailSupport: false,
      prioritySupport: false,
      certificateDownloads: 3,
      blueprintAccess: 'basic'
    }
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    popular: true,
    features: [
      { name: 'Unlimited Simulations', description: 'No time limits', included: true },
      { name: 'Premium Blueprints', description: 'Access to 200+ premium blueprints', included: true },
      { name: 'AI Debugging Assistant', description: 'Unlimited AI-powered help', included: true },
      { name: 'Priority Support', description: '24h email response time', included: true },
      { name: 'LinkedIn Certificates', description: 'Professional certificates with LinkedIn integration', included: true },
      { name: 'Advanced Analytics', description: 'Detailed learning progress tracking', included: true }
    ],
    limits: {
      simulationTime: -1, // 无限制
      storageQuota: 1000,
      aiQueries: -1,
      emailSupport: true,
      prioritySupport: true,
      certificateDownloads: -1,
      blueprintAccess: 'all'
    }
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    price: 99.99,
    currency: 'USD',
    interval: 'year',
    features: [
      { name: 'All Pro Features', description: 'Everything in Pro plan', included: true },
      { name: '2 Months Free', description: 'Save 17% with annual billing', included: true },
      { name: 'Early Access', description: 'Beta features and new content first', included: true }
    ],
    limits: {
      simulationTime: -1,
      storageQuota: 2000,
      aiQueries: -1,
      emailSupport: true,
      prioritySupport: true,
      certificateDownloads: -1,
      blueprintAccess: 'all'
    }
  }
]
```

### Lemon Squeezy 集成

```typescript
// server/api/payment/create-checkout.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { planId, userId, email } = body
  
  // 🔐 验证用户
  const session = await getUserSession(event)
  if (!session || session.user.id !== userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  // 📋 获取计划信息
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
  if (!plan || plan.price === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid plan'
    })
  }
  
  try {
    // 🛒 创建 Lemon Squeezy 结账会话
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: email,
              name: session.user.name,
              custom: {
                user_id: userId
              }
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMON_SQUEEZY_STORE_ID
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: getVariantId(planId) // 映射到 Lemon Squeezy 产品变体
              }
            }
          }
        }
      })
    })
    
    if (!checkoutResponse.ok) {
      throw new Error('Failed to create checkout session')
    }
    
    const checkout = await checkoutResponse.json()
    
    // 📝 记录结账会话
    await db.insert(checkoutSessions).values({
      id: nanoid(),
      userId,
      planId,
      lemonSqueezyCheckoutId: checkout.data.id,
      status: 'pending',
      createdAt: new Date()
    })
    
    return {
      checkoutUrl: checkout.data.attributes.url,
      checkoutId: checkout.data.id
    }
  } catch (error) {
    console.error('Checkout creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    })
  }
})

// 🗺️ 计划 ID 到 Lemon Squeezy 变体 ID 的映射
const getVariantId = (planId: string): string => {
  const variantMap: Record<string, string> = {
    'pro-monthly': process.env.LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID!,
    'pro-yearly': process.env.LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID!
  }
  
  return variantMap[planId] || ''
}
```

### 订阅状态管理

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
      statusMessage: 'Invalid webhook signature'
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
      case 'subscription_expired':
        await handleSubscriptionExpired(data)
        break
      case 'subscription_payment_failed':
        await handlePaymentFailed(data)
        break
      case 'subscription_payment_success':
        await handlePaymentSuccess(data)
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
  const { customer_email, status, product_name, variant_name, custom_data } = data.attributes
  const userId = custom_data?.user_id
  
  if (!userId) {
    console.error('No user ID in subscription data')
    return
  }
  
  // ✅ 激活 Pro 权限
  await db.update(users)
    .set({
      isPro: true,
      proSubscriptionStatus: status,
      proSubscriptionPlan: variant_name,
      proActivatedAt: new Date(),
      proExpiresAt: new Date(data.attributes.renews_at)
    })
    .where(eq(users.id, userId))
  
  // 📝 记录订阅
  await db.insert(subscriptions).values({
    id: nanoid(),
    userId,
    lemonSqueezyId: data.id,
    status,
    planName: variant_name,
    price: data.attributes.unit_price,
    currency: data.attributes.currency,
    renewsAt: new Date(data.attributes.renews_at),
    createdAt: new Date()
  })
  
  // 📧 发送欢迎邮件
  await sendEmail({
    to: customer_email,
    template: 'pro-welcome',
    data: {
      planName: variant_name,
      features: getProFeatures()
    }
  })
  
  console.log(`✅ Pro subscription activated for user: ${userId}`)
}

// 🔄 订阅更新处理
const handleSubscriptionUpdated = async (data: any) => {
  const { custom_data, status, renews_at } = data.attributes
  const userId = custom_data?.user_id
  
  if (!userId) return
  
  await db.update(users)
    .set({
      proSubscriptionStatus: status,
      proExpiresAt: new Date(renews_at)
    })
    .where(eq(users.id, userId))
  
  await db.update(subscriptions)
    .set({
      status,
      renewsAt: new Date(renews_at),
      updatedAt: new Date()
    })
    .where(eq(subscriptions.lemonSqueezyId, data.id))
}

// ❌ 订阅取消处理
const handleSubscriptionCancelled = async (data: any) => {
  const { custom_data, ends_at } = data.attributes
  const userId = custom_data?.user_id
  
  if (!userId) return
  
  // 🕐 设置宽限期 (订阅到期前保持 Pro 权限)
  await db.update(users)
    .set({
      proSubscriptionStatus: 'cancelled',
      proExpiresAt: new Date(ends_at) // 保持到期末
    })
    .where(eq(users.id, userId))
  
  // 📧 发送取消确认邮件
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length) {
    await sendEmail({
      to: user[0].email,
      template: 'subscription-cancelled',
      data: {
        name: user[0].name,
        expiresAt: ends_at,
        reactivateUrl: 'https://knzn.net/pricing'
      }
    })
  }
  
  console.log(`❌ Subscription cancelled for user: ${userId}, expires: ${ends_at}`)
}

// ⏰ 订阅过期处理
const handleSubscriptionExpired = async (data: any) => {
  const { custom_data } = data.attributes
  const userId = custom_data?.user_id
  
  if (!userId) return
  
  // 🔒 移除 Pro 权限
  await db.update(users)
    .set({
      isPro: false,
      proSubscriptionStatus: 'expired',
      proExpiredAt: new Date()
    })
    .where(eq(users.id, userId))
  
  // 📧 发送续费提醒
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length) {
    await sendEmail({
      to: user[0].email,
      template: 'subscription-expired',
      data: {
        name: user[0].name,
        renewUrl: 'https://knzn.net/pricing'
      }
    })
  }
  
  console.log(`⏰ Subscription expired for user: ${userId}`)
}
```

## 🛡️ GDPR 合规系统

### Cookie 同意管理

```vue
<!-- components/CookieConsentBanner.vue -->
<template>
  <div v-if="showBanner" class="cookie-consent-banner">
    <div class="banner-content">
      <div class="banner-text">
        <h3>🍪 We use cookies</h3>
        <p>
          We use cookies to enhance your experience, analyze site usage, and assist with marketing efforts. 
          <a href="/privacy-policy" target="_blank">Learn more</a>
        </p>
      </div>
      
      <div class="cookie-categories">
        <div 
          v-for="category in cookieCategories"
          :key="category.id"
          class="category-item"
        >
          <label class="category-label">
            <input 
              type="checkbox" 
              v-model="category.accepted"
              :disabled="category.required"
              class="category-checkbox"
            />
            <span class="category-name">{{ category.name }}</span>
          </label>
          <p class="category-description">{{ category.description }}</p>
        </div>
      </div>
      
      <div class="banner-actions">
        <button @click="acceptAll" class="btn-accept-all">
          Accept All
        </button>
        <button @click="acceptSelected" class="btn-accept-selected">
          Accept Selected
        </button>
        <button @click="rejectAll" class="btn-reject">
          Reject All
        </button>
        <button @click="showSettings = true" class="btn-settings">
          Settings
        </button>
      </div>
    </div>
    
    <!-- 🔧 详细设置面板 -->
    <div v-if="showSettings" class="settings-panel">
      <div class="settings-header">
        <h3>Cookie Settings</h3>
        <button @click="showSettings = false" class="close-btn">×</button>
      </div>
      
      <div class="settings-content">
        <div 
          v-for="category in cookieCategories"
          :key="category.id"
          class="setting-category"
        >
          <div class="category-header">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="category.accepted"
                :disabled="category.required"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              <span class="category-title">{{ category.name }}</span>
            </label>
          </div>
          
          <p class="category-detail">{{ category.description }}</p>
          
          <div class="cookie-list">
            <h4>Cookies used:</h4>
            <ul>
              <li v-for="cookie in category.cookies" :key="cookie">
                <code>{{ cookie }}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button @click="saveSettings" class="btn-save">Save Settings</button>
        <button @click="showSettings = false" class="btn-cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CookieCategory {
  id: string
  name: string
  description: string
  required: boolean
  accepted: boolean
  cookies: string[]
}

const showBanner = ref(false)
const showSettings = ref(false)

// 🍪 Cookie 分类定义
const cookieCategories = ref<CookieCategory[]>([
  {
    id: 'necessary',
    name: 'Strictly Necessary',
    description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
    required: true,
    accepted: true,
    cookies: ['session_token', 'csrf_token', 'auth_state', 'cookie_consent']
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'These cookies enable enhanced functionality and personalization, such as remembering your preferences.',
    required: false,
    accepted: false,
    cookies: ['user_preferences', 'theme_setting', 'language_setting']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'These cookies help us understand how visitors interact with our website by collecting anonymous information.',
    required: false,
    accepted: false,
    cookies: ['_ga', '_gid', '_gat', 'analytics_session']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
    required: false,
    accepted: false,
    cookies: ['marketing_id', 'ad_tracking', 'conversion_pixel']
  }
])

// 🔍 检查是否需要显示横幅
const checkConsentStatus = () => {
  const consent = localStorage.getItem('cookie_consent')
  if (!consent) {
    showBanner.value = true
  } else {
    const consentData = JSON.parse(consent)
    cookieCategories.value.forEach(category => {
      if (!category.required) {
        category.accepted = consentData[category.id] || false
      }
    })
    applyConsentSettings()
  }
}

// ✅ 接受所有 Cookie
const acceptAll = () => {
  cookieCategories.value.forEach(category => {
    category.accepted = true
  })
  saveConsentSettings()
  showBanner.value = false
}

// 🎯 接受选中的 Cookie
const acceptSelected = () => {
  saveConsentSettings()
  showBanner.value = false
}

// ❌ 拒绝所有非必需 Cookie
const rejectAll = () => {
  cookieCategories.value.forEach(category => {
    if (!category.required) {
      category.accepted = false
    }
  })
  saveConsentSettings()
  showBanner.value = false
}

// 💾 保存设置
const saveSettings = () => {
  saveConsentSettings()
  showSettings.value = false
  showBanner.value = false
}

// 💾 保存同意设置
const saveConsentSettings = () => {
  const consentData: Record<string, boolean> = {}
  cookieCategories.value.forEach(category => {
    consentData[category.id] = category.accepted
  })
  
  localStorage.setItem('cookie_consent', JSON.stringify(consentData))
  localStorage.setItem('cookie_consent_date', new Date().toISOString())
  
  applyConsentSettings()
}

// 🔧 应用同意设置
const applyConsentSettings = () => {
  cookieCategories.value.forEach(category => {
    if (category.accepted) {
      enableCookieCategory(category.id)
    } else {
      disableCookieCategory(category.id)
    }
  })
}

// ✅ 启用 Cookie 类别
const enableCookieCategory = (categoryId: string) => {
  switch (categoryId) {
    case 'analytics':
      // 启用 Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
      break
    case 'marketing':
      // 启用营销 Cookie
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        })
      }
      break
  }
}

// ❌ 禁用 Cookie 类别
const disableCookieCategory = (categoryId: string) => {
  switch (categoryId) {
    case 'analytics':
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
      break
    case 'marketing':
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        })
      }
      break
  }
}

onMounted(() => {
  checkConsentStatus()
})
</script>
### 用户数据权利实现

```typescript
// server/api/privacy/export-data.post.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  const userId = session.user.id
  
  try {
    // 📊 收集用户所有数据
    const userData = {
      // 👤 基本信息
      profile: await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        level: users.level,
        xp: users.xp,
        isPro: users.isPro,
        createdAt: users.createdAt,
        lastActiveAt: users.lastActiveAt
      }).from(users).where(eq(users.id, userId)),
      
      // 📚 学习进度
      progress: await db.select().from(progress).where(eq(progress.userId, userId)),
      
      // 🏆 证书记录
      certificates: await db.select().from(certificates).where(eq(certificates.userId, userId)),
      
      // 💬 社区内容
      posts: await db.select().from(communityPosts).where(eq(communityPosts.userId, userId)),
      
      // 💳 订阅信息
      subscriptions: await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)),
      
      // 📧 邮件记录 (最近 90 天)
      emailLogs: await db.select().from(emailLogs)
        .where(and(
          eq(emailLogs.userId, userId),
          gte(emailLogs.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        )),
      
      // 🔐 登录记录 (最近 30 天)
      loginHistory: await db.select().from(loginHistory)
        .where(and(
          eq(loginHistory.userId, userId),
          gte(loginHistory.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ))
    }
    
    // 📄 生成导出文件
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      dataTypes: Object.keys(userData),
      data: userData,
      metadata: {
        totalRecords: Object.values(userData).flat().length,
        exportFormat: 'JSON',
        gdprCompliant: true
      }
    }
    
    // 📝 记录导出请求
    await db.insert(dataExportLogs).values({
      id: nanoid(),
      userId,
      exportType: 'full',
      recordCount: exportData.metadata.totalRecords,
      createdAt: new Date()
    })
    
    return {
      success: true,
      data: exportData,
      downloadUrl: await generateExportDownloadUrl(exportData)
    }
  } catch (error) {
    console.error('Data export error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Data export failed'
    })
  }
})

// 🗑️ 用户数据删除 API
// server/api/privacy/delete-account.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { confirmationCode, reason } = body
  
  const session = await getUserSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  // ✅ 验证确认码
  if (confirmationCode !== 'DELETE_MY_ACCOUNT') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid confirmation code'
    })
  }
  
  const userId = session.user.id
  
  try {
    // 📊 数据删除前统计
    const deletionStats = {
      progressRecords: await db.select({ count: count() }).from(progress).where(eq(progress.userId, userId)),
      certificates: await db.select({ count: count() }).from(certificates).where(eq(certificates.userId, userId)),
      posts: await db.select({ count: count() }).from(communityPosts).where(eq(communityPosts.userId, userId))
    }
    
    // 🗑️ 删除关联数据 (级联删除)
    await db.transaction(async (tx) => {
      // 删除学习进度
      await tx.delete(progress).where(eq(progress.userId, userId))
      
      // 删除证书
      await tx.delete(certificates).where(eq(certificates.userId, userId))
      
      // 匿名化社区内容 (保留内容但移除个人信息)
      await tx.update(communityPosts)
        .set({
          userId: 'deleted-user',
          title: '[Deleted User Post]',
          content: '[This content has been removed at the user\'s request]'
        })
        .where(eq(communityPosts.userId, userId))
      
      // 删除订阅记录
      await tx.delete(subscriptions).where(eq(subscriptions.userId, userId))
      
      // 删除邮件日志
      await tx.delete(emailLogs).where(eq(emailLogs.userId, userId))
      
      // 删除登录历史
      await tx.delete(loginHistory).where(eq(loginHistory.userId, userId))
      
      // 最后删除用户账户
      await tx.delete(users).where(eq(users.id, userId))
    })
    
    // 📝 记录删除日志 (匿名)
    await db.insert(accountDeletionLogs).values({
      id: nanoid(),
      deletedUserId: userId, // 保留 ID 用于审计
      reason: reason || 'User request',
      deletionStats: JSON.stringify(deletionStats),
      deletedAt: new Date()
    })
    
    // 📧 发送删除确认邮件
    await sendEmail({
      to: session.user.email,
      template: 'account-deleted',
      data: {
        name: session.user.name,
        deletedAt: new Date().toISOString()
      }
    })
    
    // 🚪 清除会话
    await clearUserSession(event)
    
    return {
      success: true,
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Account deletion failed'
    })
  }
})
```

## 🔍 SEO 优化系统

### Nuxt SEO 配置

```typescript
// nuxt.config.ts - SEO 配置
export default defineNuxtConfig({
  // 🔍 SEO 模块
  modules: [
    '@nuxtjs/seo'
  ],
  
  // 🌐 站点配置
  site: {
    url: 'https://knzn.net',
    name: 'KNZN - Hardware Learning Platform',
    description: 'Learn hardware engineering through interactive simulations and gamified experiences. Master electronics with Wokwi simulations, earn certificates, and join a global community.',
    defaultLocale: 'en'
  },
  
  // 🔍 SEO 配置
  seo: {
    redirectToCanonicalSiteUrl: true
  },
  
  // 🗺️ Sitemap 配置
  sitemap: {
    hostname: 'https://knzn.net',
    gzip: true,
    routes: async () => {
      // 动态生成路由
      const routes = []
      
      // 添加蓝图页面
      const blueprints = await db.select({ id: blueprints.id })
        .from(blueprints)
        .where(eq(blueprints.status, 'published'))
      
      blueprints.forEach(blueprint => {
        routes.push(`/blueprints/${blueprint.id}`)
      })
      
      // 添加社区帖子
      const posts = await db.select({ id: communityPosts.id })
        .from(communityPosts)
        .where(eq(communityPosts.status, 'published'))
        .limit(1000)
      
      posts.forEach(post => {
        routes.push(`/community/posts/${post.id}`)
      })
      
      return routes
    }
  },
  
  // 🤖 Robots.txt 配置
  robots: {
    UserAgent: '*',
    Allow: '/',
    Disallow: ['/admin', '/api', '/auth'],
    Sitemap: 'https://knzn.net/sitemap.xml'
  },
  
  // 📊 结构化数据
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'KNZN',
      url: 'https://knzn.net',
      logo: 'https://knzn.net/logo.png',
      sameAs: [
        'https://twitter.com/knzn_platform',
        'https://github.com/knzn-platform'
      ]
    }
  }
})
```

### 动态 SEO 元数据

```vue
<!-- pages/blueprints/[id].vue -->
<template>
  <div class="blueprint-page">
    <!-- 蓝图内容 -->
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const blueprintId = route.params.id as string

// 📊 获取蓝图数据
const { data: blueprint } = await $fetch(`/api/blueprints/${blueprintId}`)

if (!blueprint) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Blueprint not found'
  })
}

// 🔍 动态 SEO 配置
useSeoMeta({
  title: `${blueprint.title} - KNZN Blueprint`,
  description: blueprint.description,
  ogTitle: blueprint.title,
  ogDescription: blueprint.description,
  ogImage: blueprint.coverImage,
  ogUrl: `https://knzn.net/blueprints/${blueprintId}`,
  twitterCard: 'summary_large_image',
  twitterTitle: blueprint.title,
  twitterDescription: blueprint.description,
  twitterImage: blueprint.coverImage
})

// 📊 结构化数据
useSchemaOrg([
  {
    '@type': 'Article',
    headline: blueprint.title,
    description: blueprint.description,
    image: blueprint.coverImage,
    author: {
      '@type': 'Organization',
      name: 'KNZN'
    },
    publisher: {
      '@type': 'Organization',
      name: 'KNZN',
      logo: {
        '@type': 'ImageObject',
        url: 'https://knzn.net/logo.png'
      }
    },
    datePublished: blueprint.createdAt,
    dateModified: blueprint.updatedAt
  }
])
</script>
```

### SEO 性能监控

```typescript
// server/api/seo/analytics.get.ts
export default defineEventHandler(async (event) => {
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  try {
    // 📊 获取 Google Search Console 数据 (需要配置 API)
    const searchConsoleData = await getSearchConsoleData()
    
    // 📈 获取页面性能数据
    const performanceData = await getPageSpeedData()
    
    // 🔍 获取关键词排名
    const keywordRankings = await getKeywordRankings()
    
    return {
      searchConsole: searchConsoleData,
      performance: performanceData,
      keywords: keywordRankings,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SEO analytics fetch failed'
    })
  }
})

// 🔍 关键词排名跟踪
const getKeywordRankings = async () => {
  const keywords = [
    'hardware learning platform',
    'electronics simulation',
    'wokwi tutorials',
    'arduino learning',
    'circuit simulation online',
    'electronics education',
    'hardware engineering course'
  ]
  
  // 这里可以集成第三方 SEO API 如 SEMrush, Ahrefs 等
  return keywords.map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 100) + 1, // 模拟数据
    searchVolume: Math.floor(Math.random() * 10000),
    difficulty: Math.floor(Math.random() * 100)
  }))
}
```

## 📧 邮件营销系统

### 邮件模板管理

```typescript
// server/utils/email-templates.ts
export const EMAIL_TEMPLATES = {
  // 🎉 欢迎系列邮件
  'welcome-series-1': {
    subject: 'Welcome to KNZN! Your hardware journey starts here 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 20px; text-align: center;">
          <img src="https://knzn.net/logo-white.png" alt="KNZN" style="height: 60px;">
          <h1 style="color: #00ff88; margin: 20px 0;">Welcome to the Future of Hardware Learning!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 18px; color: #333;">Hi {{name}},</p>
          
          <p>Welcome to KNZN! You've just joined thousands of developers who are mastering hardware engineering through our interactive platform.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00ff88; margin-top: 0;">🎯 What's Next?</h3>
            <ul style="padding-left: 20px;">
              <li><strong>Explore the Skill Map</strong> - See your complete learning journey</li>
              <li><strong>Try Your First Simulation</strong> - Start with basic LED circuits</li>
              <li><strong>Join the Community</strong> - Share projects and get help</li>
              <li><strong>Earn Certificates</strong> - Build your professional portfolio</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://knzn.net/skill-map" style="background: #00ff88; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start Learning Now
            </a>
          </div>
          
          <p>Over the next few days, I'll send you some tips to help you get the most out of KNZN. If you have any questions, just reply to this email!</p>
          
          <p>Happy coding!<br>
          <strong>The KNZN Team</strong></p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>Follow us: 
            <a href="https://twitter.com/knzn_platform">Twitter</a> | 
            <a href="https://github.com/knzn-platform">GitHub</a> | 
            <a href="https://knzn.net/community">Community</a>
          </p>
          <p>
            <a href="{{unsubscribeUrl}}">Unsubscribe</a> | 
            <a href="https://knzn.net/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    `
  },
  
  // 📚 学习进度提醒
  'progress-reminder': {
    subject: 'Don\'t lose momentum! Continue your hardware journey 💪',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ff88;">Hi {{name}}, ready to level up?</h2>
        
        <p>I noticed you haven't been active on KNZN for a few days. Don't worry - we all need breaks! But I wanted to remind you of the progress you've made:</p>
        
        <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #00ff88;">📊 Your Progress</h3>
          <ul>
            <li>Level: {{userLevel}}</li>
            <li>XP: {{userXP}}</li>
            <li>Completed Lessons: {{completedLessons}}</li>
            <li>Certificates Earned: {{certificates}}</li>
          </ul>
        </div>
        
        <p>You're doing great! Here's what I recommend for your next session:</p>
        
        <div style="border-left: 4px solid #00ff88; padding-left: 20px; margin: 20px 0;">
          <h4>🎯 Suggested Next Steps:</h4>
          <p><strong>{{nextLesson}}</strong><br>
          {{nextLessonDescription}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://knzn.net/lesson/{{nextLessonId}}" style="background: #00ff88; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Continue Learning
          </a>
        </div>
        
        <p>Remember: consistency beats intensity. Even 15 minutes a day can make a huge difference!</p>
      </div>
    `
  },
  
  // 🏆 成就解锁
  'achievement-unlocked': {
    subject: '🏆 Achievement Unlocked: {{achievementName}}!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 40px 20px;">
          <h1 style="font-size: 48px; margin: 0;">🏆</h1>
          <h2 style="color: #000; margin: 10px 0;">Achievement Unlocked!</h2>
          <h3 style="color: #333; margin: 0;">{{achievementName}}</h3>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 18px;">Congratulations {{name}}!</p>
          
          <p>You've just unlocked the <strong>{{achievementName}}</strong> achievement. {{achievementDescription}}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4>🎁 Rewards Earned:</h4>
            <ul style="list-style: none; padding: 0;">
              <li>✨ +{{xpReward}} XP</li>
              <li>🏅 {{badgeName}} Badge</li>
              {{#if bonusReward}}
              <li>🎉 {{bonusReward}}</li>
              {{/if}}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://knzn.net/profile/achievements" style="background: #00ff88; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View All Achievements
            </a>
          </div>
          
          <p>Keep up the excellent work! What will you unlock next?</p>
        </div>
      </div>
    `
  }
}

// 📧 自动邮件发送系统
export const scheduleWelcomeSeries = async (userId: string, email: string, name: string) => {
  const welcomeEmails = [
    { template: 'welcome-series-1', delay: 0 }, // 立即发送
    { template: 'welcome-series-2', delay: 24 * 60 * 60 * 1000 }, // 1天后
    { template: 'welcome-series-3', delay: 3 * 24 * 60 * 60 * 1000 }, // 3天后
    { template: 'welcome-series-4', delay: 7 * 24 * 60 * 60 * 1000 }  // 7天后
  ]
  
  for (const emailConfig of welcomeEmails) {
    await scheduleEmail({
      userId,
      email,
      template: emailConfig.template,
      data: { name },
      sendAt: new Date(Date.now() + emailConfig.delay)
    })
  }
}

// 📅 邮件调度系统
const scheduleEmail = async (emailJob: {
  userId: string
  email: string
  template: string
  data: Record<string, any>
  sendAt: Date
}) => {
  await db.insert(scheduledEmails).values({
    id: nanoid(),
    userId: emailJob.userId,
    email: emailJob.email,
    template: emailJob.template,
    data: JSON.stringify(emailJob.data),
    scheduledFor: emailJob.sendAt,
    status: 'pending',
    createdAt: new Date()
  })
}
```

### 邮件自动化触发器

```typescript
// server/api/cron/email-automation.get.ts
export default defineEventHandler(async (event) => {
  // 🔐 验证 Cron 请求
  const authHeader = getHeader(event, 'authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  try {
    let processedEmails = 0
    
    // 📧 处理待发送邮件
    processedEmails += await processScheduledEmails()
    
    // 📊 发送进度提醒
    processedEmails += await sendProgressReminders()
    
    // 🏆 发送成就通知
    processedEmails += await sendAchievementNotifications()
    
    // 💔 发送流失用户挽回邮件
    processedEmails += await sendWinbackEmails()
    
    return {
      success: true,
      processedEmails,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Email automation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Email automation failed'
    })
  }
})

// 📧 处理计划邮件
const processScheduledEmails = async (): Promise<number> => {
  const pendingEmails = await db.select()
    .from(scheduledEmails)
    .where(and(
      eq(scheduledEmails.status, 'pending'),
      lte(scheduledEmails.scheduledFor, new Date())
    ))
    .limit(100)
  
  let sent = 0
  
  for (const email of pendingEmails) {
    try {
      await sendEmail({
        to: email.email,
        template: email.template,
        data: JSON.parse(email.data)
      })
      
      await db.update(scheduledEmails)
        .set({ 
          status: 'sent', 
          sentAt: new Date() 
        })
        .where(eq(scheduledEmails.id, email.id))
      
      sent++
    } catch (error) {
      await db.update(scheduledEmails)
        .set({ 
          status: 'failed', 
          error: error.message 
        })
        .where(eq(scheduledEmails.id, email.id))
    }
  }
  
  return sent
}

// 📊 发送进度提醒
const sendProgressReminders = async (): Promise<number> => {
  // 查找 3 天未活跃的用户
  const inactiveUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    level: users.level,
    xp: users.xp
  })
  .from(users)
  .where(and(
    lt(users.lastActiveAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    eq(users.emailNotifications, true)
  ))
  .limit(50)
  
  let sent = 0
  
  for (const user of inactiveUsers) {
    // 获取用户进度
    const userProgress = await getUserProgressSummary(user.id)
    
    await sendEmail({
      to: user.email,
      template: 'progress-reminder',
      data: {
        name: user.name,
        userLevel: user.level,
        userXP: user.xp,
        completedLessons: userProgress.completedLessons,
        certificates: userProgress.certificates,
        nextLesson: userProgress.nextLesson?.title,
        nextLessonDescription: userProgress.nextLesson?.description,
        nextLessonId: userProgress.nextLesson?.id
      }
    })
    
    sent++
  }
  
  return sent
}
```

## 📈 分析与监控

### 用户行为分析

```typescript
// server/api/analytics/user-behavior.get.ts
export default defineEventHandler(async (event) => {
  const admin = await getAdminUser(event)
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  
  const timeRange = getQuery(event).range || '30d'
  const startDate = getDateFromRange(timeRange)
  
  try {
    const analytics = {
      // 👥 用户统计
      userStats: await getUserStats(startDate),
      
      // 📚 学习统计
      learningStats: await getLearningStats(startDate),
      
      // 💰 收入统计
      revenueStats: await getRevenueStats(startDate),
      
      // 🔄 转化漏斗
      conversionFunnel: await getConversionFunnel(startDate),
      
      // 📊 用户留存
      retentionCohorts: await getRetentionCohorts(startDate)
    }
    
    return analytics
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Analytics fetch failed'
    })
  }
})

// 👥 用户统计
const getUserStats = async (startDate: Date) => {
  const totalUsers = await db.select({ count: count() }).from(users)
  const newUsers = await db.select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, startDate))
  
  const activeUsers = await db.select({ count: count() })
    .from(users)
    .where(gte(users.lastActiveAt, startDate))
  
  const proUsers = await db.select({ count: count() })
    .from(users)
    .where(eq(users.isPro, true))
  
  return {
    total: totalUsers[0].count,
    new: newUsers[0].count,
    active: activeUsers[0].count,
    pro: proUsers[0].count,
    conversionRate: ((proUsers[0].count / totalUsers[0].count) * 100).toFixed(2)
  }
}

// 💰 收入统计
const getRevenueStats = async (startDate: Date) => {
  const subscriptions = await db.select({
    price: subscriptions.price,
    currency: subscriptions.currency,
    createdAt: subscriptions.createdAt
  })
  .from(subscriptions)
  .where(and(
    gte(subscriptions.createdAt, startDate),
    eq(subscriptions.status, 'active')
  ))
  
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.price, 0)
  const monthlyRecurring = subscriptions
    .filter(sub => sub.currency === 'USD')
    .reduce((sum, sub) => sum + sub.price, 0)
  
  return {
    totalRevenue,
    monthlyRecurring,
    averageRevenuePerUser: totalRevenue / subscriptions.length || 0,
    subscriptionCount: subscriptions.length
  }
}

// 🔄 转化漏斗分析
const getConversionFunnel = async (startDate: Date) => {
  const visitors = await db.select({ count: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, startDate))
  
  const signups = await db.select({ count: count() })
    .from(users)
    .where(gte(users.createdAt, startDate))
  
  const firstLesson = await db.select({ count: count() })
    .from(progress)
    .where(and(
      gte(progress.createdAt, startDate),
      eq(progress.status, 'completed')
    ))
  
  const conversions = await db.select({ count: count() })
    .from(subscriptions)
    .where(gte(subscriptions.createdAt, startDate))
  
  return {
    visitors: visitors[0].count,
    signups: signups[0].count,
    firstLesson: firstLesson[0].count,
    conversions: conversions[0].count,
    conversionRates: {
      visitorToSignup: ((signups[0].count / visitors[0].count) * 100).toFixed(2),
      signupToFirstLesson: ((firstLesson[0].count / signups[0].count) * 100).toFixed(2),
      firstLessonToConversion: ((conversions[0].count / firstLesson[0].count) * 100).toFixed(2)
    }
  }
}
```

---

**文档版本**: v2.0 - KNZN 专用版  
**最后更新**: 2024-12-23  
**适用项目**: KNZN 硬件学习平台  
**商业模式**: SaaS + 联盟营销 + 全球合规

这份商业化指南专为 KNZN 项目的全球市场设计，确保在追求商业成功的同时完全符合 GDPR/CCPA 等法规要求，并通过自动化系统最大化运营效率。
## 🔒 安全防护系统 (BOM 搜索防护)

### 搜索关键词安全校验

```typescript
// server/utils/security-sanitizer.ts

// 🔒 搜索关键词安全校验器
export const sanitizeKeyword = (keyword: string): { 
  sanitized: string; 
  isValid: boolean; 
  violations: string[] 
} => {
  const violations: string[] = []
  
  // 🧹 基础清理
  let sanitized = keyword.trim()
  
  // 🚫 长度限制
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100)
    violations.push('Keyword truncated to 100 characters')
  }
  
  if (sanitized.length < 2) {
    return {
      sanitized: '',
      isValid: false,
      violations: ['Keyword too short (minimum 2 characters)']
    }
  }
  
  // 🔍 正则校验：仅允许中英文数字和基本符号
  const allowedPattern = /^[a-zA-Z0-9\u4e00-\u9fa5\s\-_\.]+$/
  if (!allowedPattern.test(sanitized)) {
    violations.push('Invalid characters detected')
    // 移除不允许的字符
    sanitized = sanitized.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s\-_\.]/g, '')
  }
  
  // 🚫 XSS 防护：检测脚本注入
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ]
  
  for (const pattern of xssPatterns) {
    if (pattern.test(sanitized)) {
      violations.push('Potential XSS attack detected')
      sanitized = sanitized.replace(pattern, '')
    }
  }
  
  // 🚫 开放重定向防护：检测 URL 模式
  const redirectPatterns = [
    /https?:\/\//gi,
    /ftp:\/\//gi,
    /file:\/\//gi,
    /\.\.\/+/g,
    /\/\/+/g
  ]
  
  for (const pattern of redirectPatterns) {
    if (pattern.test(sanitized)) {
      violations.push('Potential open redirect detected')
      sanitized = sanitized.replace(pattern, '')
    }
  }
  
  // 🚫 SQL 注入防护
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /('|(\\')|(;)|(--)|(\|)|(\*)|(%)|(\+))/g,
    /(\b(OR|AND)\b.*=)/gi
  ]
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      violations.push('Potential SQL injection detected')
      sanitized = sanitized.replace(pattern, '')
    }
  }
  
  // 🚫 路径遍历防护
  const pathTraversalPatterns = [
    /\.\.\//g,
    /\.\.\\+/g,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi
  ]
  
  for (const pattern of pathTraversalPatterns) {
    if (pattern.test(sanitized)) {
      violations.push('Path traversal attempt detected')
      sanitized = sanitized.replace(pattern, '')
    }
  }
  
  // 🧹 最终清理
  sanitized = sanitized.trim()
  
  return {
    sanitized,
    isValid: sanitized.length >= 2 && violations.length === 0,
    violations
  }
}

// 🔍 BOM 搜索安全中间件
export const validateBOMSearch = (searchQuery: string): {
  isValid: boolean;
  sanitizedQuery: string;
  securityReport: {
    violations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    blocked: boolean;
  }
} => {
  const result = sanitizeKeyword(searchQuery)
  
  // 🚨 风险等级评估
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  let blocked = false
  
  if (result.violations.length > 0) {
    const highRiskViolations = [
      'Potential XSS attack detected',
      'Potential open redirect detected',
      'Potential SQL injection detected',
      'Path traversal attempt detected'
    ]
    
    const hasHighRisk = result.violations.some(v => 
      highRiskViolations.some(hr => v.includes(hr))
    )
    
    if (hasHighRisk) {
      riskLevel = 'high'
      blocked = true
    } else if (result.violations.length > 2) {
      riskLevel = 'medium'
    }
  }
  
  return {
    isValid: result.isValid && !blocked,
    sanitizedQuery: result.sanitized,
    securityReport: {
      violations: result.violations,
      riskLevel,
      blocked
    }
  }
}
```

### BOM 搜索 API 安全实现

```typescript
// server/api/bom/search.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { query, category, priceRange } = body
  
  // 🔒 安全校验
  const securityCheck = validateBOMSearch(query)
  
  if (!securityCheck.isValid) {
    // 📝 记录安全事件
    await logSecurityEvent({
      type: 'bom_search_blocked',
      originalQuery: query,
      violations: securityCheck.securityReport.violations,
      riskLevel: securityCheck.securityReport.riskLevel,
      userIP: getClientIP(event),
      userAgent: getHeader(event, 'user-agent'),
      timestamp: new Date()
    })
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid search query',
      data: {
        violations: securityCheck.securityReport.violations,
        riskLevel: securityCheck.securityReport.riskLevel
      }
    })
  }
  
  // ✅ 使用清理后的查询进行搜索
  const sanitizedQuery = securityCheck.sanitizedQuery
  
  try {
    // 🔍 执行安全的 BOM 搜索
    const searchResults = await performSecureBOMSearch({
      query: sanitizedQuery,
      category: sanitizeCategory(category),
      priceRange: validatePriceRange(priceRange)
    })
    
    // 📊 记录搜索统计
    await recordSearchAnalytics({
      query: sanitizedQuery,
      category,
      resultCount: searchResults.length,
      userIP: getClientIP(event)
    })
    
    return {
      success: true,
      query: sanitizedQuery,
      results: searchResults,
      securityInfo: {
        sanitized: query !== sanitizedQuery,
        violations: securityCheck.securityReport.violations
      }
    }
  } catch (error) {
    console.error('BOM search error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Search failed'
    })
  }
})

// 🔍 安全的 BOM 搜索实现
const performSecureBOMSearch = async (params: {
  query: string;
  category?: string;
  priceRange?: { min: number; max: number };
}) => {
  const { query, category, priceRange } = params
  
  // 🏪 安全的供应商 API 调用
  const suppliers = [
    {
      name: 'DigiKey',
      apiUrl: 'https://api.digikey.com/Search/v3/Products/Keyword',
      affiliateId: process.env.DIGIKEY_AFFILIATE_ID
    },
    {
      name: 'Mouser',
      apiUrl: 'https://api.mouser.com/api/v1/search/keyword',
      affiliateId: process.env.MOUSER_AFFILIATE_ID
    }
  ]
  
  const results = []
  
  for (const supplier of suppliers) {
    try {
      // 🔒 构建安全的 API 请求
      const searchParams = new URLSearchParams({
        keyword: query,
        ...(category && { category }),
        ...(priceRange && { 
          minPrice: priceRange.min.toString(),
          maxPrice: priceRange.max.toString()
        }),
        affiliate: supplier.affiliateId || ''
      })
      
      // 🌐 调用供应商 API
      const response = await fetch(`${supplier.apiUrl}?${searchParams}`, {
        headers: {
          'User-Agent': 'KNZN-Platform/1.0',
          'Accept': 'application/json'
        },
        timeout: 5000 // 5秒超时
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // 🧹 清理和标准化结果
        const cleanResults = sanitizeSearchResults(data, supplier.name)
        results.push(...cleanResults)
      }
    } catch (error) {
      console.error(`${supplier.name} search error:`, error)
      // 继续其他供应商的搜索
    }
  }
  
  // 🔄 去重和排序
  return deduplicateAndSort(results)
}

// 🧹 清理搜索结果
const sanitizeSearchResults = (rawResults: any, supplierName: string) => {
  if (!Array.isArray(rawResults.products)) {
    return []
  }
  
  return rawResults.products.map((product: any) => ({
    id: sanitizeString(product.id || ''),
    name: sanitizeString(product.name || ''),
    description: sanitizeString(product.description || ''),
    price: validatePrice(product.price),
    currency: sanitizeString(product.currency || 'USD'),
    availability: sanitizeString(product.availability || ''),
    supplier: supplierName,
    // 🔗 生成安全的联盟链接
    affiliateUrl: generateSafeAffiliateUrl(product.url, supplierName),
    datasheet: sanitizeUrl(product.datasheet),
    image: sanitizeUrl(product.image),
    specifications: sanitizeSpecifications(product.specifications)
  })).filter(product => product.id && product.name) // 过滤无效结果
}

// 🔗 生成安全的联盟链接
const generateSafeAffiliateUrl = (originalUrl: string, supplier: string): string => {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return ''
  }
  
  // 🔍 验证 URL 格式
  try {
    const url = new URL(originalUrl)
    
    // 🚫 仅允许 HTTPS 和已知供应商域名
    const allowedDomains = [
      'digikey.com',
      'mouser.com',
      'element14.com',
      'rs-online.com',
      'aliexpress.com'
    ]
    
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname.endsWith(domain)
    )
    
    if (url.protocol !== 'https:' || !isAllowedDomain) {
      return ''
    }
    
    // 🏷️ 添加联盟标识
    const affiliateParams = getAffiliateParams(supplier)
    if (affiliateParams) {
      Object.entries(affiliateParams).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    
    return url.toString()
  } catch {
    return ''
  }
}

// 🏷️ 获取联盟参数
const getAffiliateParams = (supplier: string): Record<string, string> | null => {
  const affiliateConfig = {
    'DigiKey': {
      'aid': process.env.DIGIKEY_AFFILIATE_ID || '',
      'utm_source': 'knzn',
      'utm_medium': 'affiliate'
    },
    'Mouser': {
      'partnumber': process.env.MOUSER_AFFILIATE_ID || '',
      'utm_source': 'knzn'
    }
  }
  
  return affiliateConfig[supplier] || null
}

// 📝 记录安全事件
const logSecurityEvent = async (event: {
  type: string;
  originalQuery: string;
  violations: string[];
  riskLevel: string;
  userIP: string;
  userAgent?: string;
  timestamp: Date;
}) => {
  await db.insert(securityLogs).values({
    id: nanoid(),
    eventType: event.type,
    severity: event.riskLevel,
    details: JSON.stringify({
      originalQuery: event.originalQuery,
      violations: event.violations,
      userAgent: event.userAgent
    }),
    userIP: event.userIP,
    createdAt: event.timestamp
  })
  
  // 🚨 高风险事件立即告警
  if (event.riskLevel === 'high') {
    await sendSecurityAlert(event)
  }
}

// 🚨 发送安全告警
const sendSecurityAlert = async (event: any) => {
  await sendEmail({
    to: 'security@knzn.net',
    template: 'security-alert',
    data: {
      eventType: event.type,
      riskLevel: event.riskLevel,
      violations: event.violations,
      userIP: event.userIP,
      timestamp: event.timestamp.toISOString()
    }
  })
}
```

### 前端安全搜索组件

```vue
<!-- components/SecureBOMSearch.vue -->
<template>
  <div class="secure-bom-search">
    <div class="search-container">
      <form @submit.prevent="performSearch" class="search-form">
        <div class="input-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for components (e.g., Arduino Uno, resistor 220Ω)"
            class="search-input"
            :class="{ 'error': hasSecurityWarning }"
            maxlength="100"
            @input="validateInput"
          />
          <button 
            type="submit" 
            :disabled="!isValidQuery || searching"
            class="search-btn"
          >
            <Icon v-if="searching" name="loading" class="animate-spin" />
            <Icon v-else name="search" />
            Search
          </button>
        </div>
        
        <!-- 🚨 安全警告 -->
        <div v-if="securityWarning" class="security-warning">
          <Icon name="shield-exclamation" class="text-yellow-500" />
          <span>{{ securityWarning }}</span>
        </div>
        
        <!-- ✅ 输入提示 -->
        <div class="input-hints">
          <span class="hint">💡 Try: "Arduino Nano", "LED 5mm red", "Capacitor 100uF"</span>
        </div>
      </form>
    </div>
    
    <!-- 🔍 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h3>Found {{ searchResults.length }} components</h3>
        <div v-if="searchInfo.sanitized" class="sanitization-notice">
          <Icon name="shield-check" class="text-green-500" />
          <span>Search query was automatically cleaned for security</span>
        </div>
      </div>
      
      <div class="results-grid">
        <div 
          v-for="component in searchResults"
          :key="component.id"
          class="component-card"
        >
          <div class="component-image">
            <img 
              :src="component.image || '/images/component-placeholder.png'"
              :alt="component.name"
              loading="lazy"
            />
          </div>
          
          <div class="component-info">
            <h4>{{ component.name }}</h4>
            <p class="description">{{ component.description }}</p>
            
            <div class="component-details">
              <div class="price">
                <span class="amount">{{ component.price }}</span>
                <span class="currency">{{ component.currency }}</span>
              </div>
              <div class="supplier">{{ component.supplier }}</div>
            </div>
            
            <div class="component-actions">
              <a 
                :href="component.affiliateUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="buy-btn"
                @click="trackPurchaseClick(component)"
              >
                <Icon name="external-link" />
                View on {{ component.supplier }}
              </a>
              
              <button 
                @click="addToBOM(component)"
                class="add-btn"
              >
                <Icon name="plus" />
                Add to BOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref([])
const securityWarning = ref('')
const hasSecurityWarning = ref(false)
const isValidQuery = ref(false)
const searchInfo = ref({ sanitized: false })

// 🔍 输入验证 (客户端预检)
const validateInput = () => {
  const query = searchQuery.value.trim()
  
  // 🧹 基础验证
  isValidQuery.value = query.length >= 2 && query.length <= 100
  
  // 🚫 简单的客户端安全检查
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /https?:\/\//i
  ]
  
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(query)
  )
  
  if (hasSuspiciousContent) {
    securityWarning.value = 'Invalid characters detected. Please use only component names and specifications.'
    hasSecurityWarning.value = true
    isValidQuery.value = false
  } else {
    securityWarning.value = ''
    hasSecurityWarning.value = false
  }
}

// 🔍 执行搜索
const performSearch = async () => {
  if (!isValidQuery.value || searching.value) return
  
  searching.value = true
  searchResults.value = []
  
  try {
    const response = await $fetch('/api/bom/search', {
      method: 'POST',
      body: {
        query: searchQuery.value.trim(),
        category: 'all'
      }
    })
    
    if (response.success) {
      searchResults.value = response.results
      searchInfo.value = response.securityInfo
      
      // 📊 记录搜索事件
      trackSearchEvent(response.query, response.results.length)
    }
  } catch (error) {
    console.error('Search error:', error)
    
    if (error.data?.violations) {
      securityWarning.value = 'Search blocked for security reasons. Please refine your query.'
      hasSecurityWarning.value = true
    } else {
      alert('Search failed. Please try again.')
    }
  } finally {
    searching.value = false
  }
}

// 📊 跟踪搜索事件
const trackSearchEvent = (query: string, resultCount: number) => {
  // 发送分析事件到后端
  $fetch('/api/analytics/search', {
    method: 'POST',
    body: {
      query,
      resultCount,
      timestamp: new Date().toISOString()
    }
  }).catch(() => {
    // 静默失败，不影响用户体验
  })
}

// 🛒 添加到 BOM
const addToBOM = (component: any) => {
  // 实现添加到 BOM 逻辑
  console.log('Adding to BOM:', component)
}

// 📊 跟踪购买点击
const trackPurchaseClick = (component: any) => {
  // 跟踪联盟链接点击
  $fetch('/api/analytics/affiliate-click', {
    method: 'POST',
    body: {
      componentId: component.id,
      supplier: component.supplier,
      price: component.price
    }
  }).catch(() => {
    // 静默失败
  })
}
</script>
```