# 🛠️ KNZN 管理后台设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 管理后台系统  
**路由**: `/admin/*`  
**用户状态**: 管理员权限  
**文档版本**: v1.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 完整设计规范

## 🎯 核心定位

**管理后台 (Admin Panel)** 是 KNZN 平台的运营管理中心，解决"脏活累活"问题，避免每次都要查数据库。

### 核心功能
- 📊 **数据监控**：用户数据、系统性能、错误日志
- 👥 **用户管理**：查看用户信息、手动发放徽章、处理申诉
- 📚 **内容管理**：管理蓝图内容、审核社区内容
- 🎓 **认证管理**：手动审核社区认证、管理证书
- 🔧 **系统维护**：数据库备份、系统配置、错误处理

## 🏗️ 系统架构

### 权限系统

```typescript
// 管理员权限等级
enum AdminRole {
  SUPER_ADMIN = 'super_admin',     // 超级管理员：所有权限
  CONTENT_ADMIN = 'content_admin', // 内容管理员：内容审核、蓝图管理
  SUPPORT_ADMIN = 'support_admin', // 客服管理员：用户支持、申诉处理
  READONLY_ADMIN = 'readonly_admin' // 只读管理员：仅查看数据
}

// 权限检查中间件
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
  
  // 将管理员信息添加到上下文
  event.context.admin = {
    id: user[0].id,
    role: user[0].adminRole,
    permissions: getAdminPermissions(user[0].adminRole)
  }
})
```

## 📊 核心功能模块

### 1. 仪表板 (Dashboard)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🛠️ KNZN Admin Dashboard                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 关键指标 (今日/本周/本月)                                    │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐       │
│ │ 新用户      │ 活跃用户    │ 完成关卡    │ Pro 转化    │       │
│ │ 23 (+15%)   │ 456 (+8%)   │ 89 (+12%)   │ 12 (+25%)   │       │
│ └─────────────┴─────────────┴─────────────┴─────────────┘       │
│                                                                 │
│ 🚨 系统警报                                                     │
│ • 数据库连接池使用率 85% (警告)                                 │
│ • 3 个用户申诉待处理                                            │
│ • Wokwi API 调用失败率 2.1%                                     │
│                                                                 │
│ 📈 实时图表                                                     │
│ [用户注册趋势] [关卡完成率] [收入统计] [错误率监控]             │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 用户管理 (User Management)

```typescript
// 用户管理功能
const USER_MANAGEMENT = {
  // 用户列表与搜索
  userList: {
    filters: ['all', 'pro_users', 'new_users', 'inactive_users', 'banned_users'],
    search: ['email', 'username', 'id'],
    sorting: ['created_at', 'last_active', 'xp', 'level'],
    pagination: { pageSize: 50, maxPages: 1000 }
  },
  
  // 用户详情页
  userDetail: {
    basicInfo: ['id', 'email', 'name', 'created_at', 'last_active'],
    progress: ['level', 'xp', 'completed_lessons', 'certificates'],
    subscription: ['plan', 'status', 'next_billing', 'payment_history'],
    activity: ['recent_lessons', 'community_posts', 'login_history'],
    moderation: ['warnings', 'bans', 'appeals']
  },
  
  // 管理操作
  actions: {
    // 手动发放徽章
    awardBadge: async (userId: string, badgeType: string, reason: string) => {
      await db.insert(certificates).values({
        id: nanoid(8),
        userId,
        badgeType,
        issuedAt: new Date(),
        issuedBy: 'admin',
        reason
      })
      
      // 记录管理日志
      await logAdminAction('award_badge', { userId, badgeType, reason })
    },
    
    // 调整用户 XP
    adjustXP: async (userId: string, xpChange: number, reason: string) => {
      await db.update(users)
        .set({ xp: sql`${users.xp} + ${xpChange}` })
        .where(eq(users.id, userId))
      
      await logAdminAction('adjust_xp', { userId, xpChange, reason })
    },
    
    // 用户封禁/解封
    banUser: async (userId: string, reason: string, duration?: number) => {
      await db.update(users)
        .set({ 
          isBanned: true,
          banReason: reason,
          banExpires: duration ? new Date(Date.now() + duration) : null
        })
        .where(eq(users.id, userId))
      
      await logAdminAction('ban_user', { userId, reason, duration })
    }
  }
}
```

### 3. 内容管理 (Content Management)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📚 内容管理                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🎨 蓝图管理                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [+ 新建蓝图] [批量导入] [导出备份]                          │ │
│ │                                                             │ │
│ │ 📋 蓝图列表 (30个)                                          │ │
│ │ ┌──────────────────┬────────┬────────┬──────────┬────────┐ │ │
│ │ │ 标题             │ 分类   │ 难度   │ 下载次数 │ 操作   │ │ │
│ │ ├──────────────────┼────────┼────────┼──────────┼────────┤ │ │
│ │ │ L298N电机驱动    │ 电机   │ 中级   │ 1,234    │ [编辑] │ │ │
│ │ │ Arduino入门LED   │ 基础   │ 初级   │ 2,456    │ [编辑] │ │ │
│ │ └──────────────────┴────────┴────────┴──────────┴────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💬 社区内容审核                                                 │
│ • 待审核帖子：5 个                                              │
│ • 举报内容：2 个                                                │
│ • 用户申诉：3 个                                                │
│                                                                 │
│ [查看待审核内容]                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 4. 认证管理 (Certification Management)

```typescript
// 认证管理系统
const CERTIFICATION_MANAGEMENT = {
  // 社区认证审核
  communityReview: {
    // 待审核的实物视频
    pendingReviews: async () => {
      return await db.select({
        id: communityPosts.id,
        userId: communityPosts.userId,
        userName: users.name,
        title: communityPosts.title,
        videoUrl: communityPosts.videoUrl,
        submittedAt: communityPosts.createdAt,
        badgeType: communityPosts.requestedBadge
      })
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.status, 'pending_review'))
    },
    
    // 审核操作
    reviewSubmission: async (postId: string, decision: 'approve' | 'reject', reason?: string) => {
      const post = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1)
      
      if (decision === 'approve') {
        // 发放徽章
        await awardBadge(post[0].userId, post[0].requestedBadge, 'Community verification approved')
        
        // 更新帖子状态
        await db.update(communityPosts)
          .set({ status: 'approved', reviewedAt: new Date() })
          .where(eq(communityPosts.id, postId))
      } else {
        // 拒绝并记录原因
        await db.update(communityPosts)
          .set({ status: 'rejected', rejectionReason: reason, reviewedAt: new Date() })
          .where(eq(communityPosts.id, postId))
      }
      
      await logAdminAction('review_submission', { postId, decision, reason })
    }
  },
  
  // 证书管理
  certificateManagement: {
    // 证书统计
    stats: async () => {
      const stats = await db.select({
        badgeType: certificates.badgeType,
        count: sql<number>`count(*)`
      })
      .from(certificates)
      .groupBy(certificates.badgeType)
      
      return stats
    },
    
    // 撤销证书（用于作弊处理）
    revokeCertificate: async (certificateId: string, reason: string) => {
      await db.update(certificates)
        .set({ 
          isRevoked: true,
          revokedAt: new Date(),
          revokeReason: reason
        })
        .where(eq(certificates.id, certificateId))
      
      await logAdminAction('revoke_certificate', { certificateId, reason })
    }
  }
}
```

### 5. 系统监控 (System Monitoring)

```typescript
// 系统监控配置
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
      // 获取慢查询日志（需要在 PostgreSQL 中启用）
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
    },
    
    errorStats: async () => {
      return await db.select({
        errorType: errorLogs.type,
        count: sql<number>`count(*)`
      })
      .from(errorLogs)
      .where(sql`created_at > NOW() - INTERVAL '24 hours'`)
      .groupBy(errorLogs.type)
    }
  },
  
  // Wokwi API 监控
  wokwiMonitoring: {
    apiCalls: {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0
    },
    
    trackApiCall: (success: boolean, responseTime: number) => {
      // 记录 API 调用统计
    }
  }
}
```

### 6. 数据备份管理

```typescript
// 数据备份系统
const BACKUP_MANAGEMENT = {
  // 自动备份配置
  autoBackup: {
    enabled: true,
    schedule: '0 2 * * *', // 每天凌晨2点
    retention: 30, // 保留30天
    
    // 备份脚本
    createBackup: async () => {
      const timestamp = new Date().toISOString().slice(0, 10)
      const backupFile = `knzn-backup-${timestamp}.sql`
      
      // 执行 pg_dump
      const command = `pg_dump ${process.env.DATABASE_URL} > /tmp/${backupFile}`
      await execAsync(command)
      
      // 压缩并加密
      const encryptedFile = `${backupFile}.gz.enc`
      await execAsync(`gzip /tmp/${backupFile}`)
      await execAsync(`openssl enc -aes-256-cbc -salt -in /tmp/${backupFile}.gz -out /tmp/${encryptedFile} -k ${process.env.BACKUP_PASSWORD}`)
      
      // 上传到 Cloudflare R2
      await uploadToR2(`/tmp/${encryptedFile}`, `backups/${encryptedFile}`)
      
      // 清理本地文件
      await execAsync(`rm /tmp/${encryptedFile}`)
      
      console.log(`Backup created: ${encryptedFile}`)
    }
  },
  
  // 手动备份与恢复
  manualBackup: {
    create: async (description: string) => {
      // 创建手动备份
    },
    
    restore: async (backupFile: string) => {
      // 恢复备份（危险操作，需要确认）
    },
    
    list: async () => {
      // 列出所有可用备份
    }
  }
}
```

## 🎨 界面设计

### 布局结构

```
┌─────────────────────────────────────────────────────────────────┐
│ 🛠️ KNZN Admin | 👤 Admin User | 🔔 Alerts (3) | 🚪 Logout      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 Dashboard │ 👥 Users │ 📚 Content │ 🎓 Certs │ 🔧 System     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     主要内容区域                                │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 技术实现

```typescript
// 管理后台路由结构
// pages/admin/index.vue - 仪表板
// pages/admin/users/index.vue - 用户列表
// pages/admin/users/[id].vue - 用户详情
// pages/admin/content/blueprints.vue - 蓝图管理
// pages/admin/content/community.vue - 社区内容审核
// pages/admin/certificates/index.vue - 证书管理
// pages/admin/system/monitoring.vue - 系统监控
// pages/admin/system/backups.vue - 备份管理

// 管理后台组件
// components/admin/UserTable.vue
// components/admin/ContentReview.vue
// components/admin/SystemMetrics.vue
// components/admin/BackupManager.vue
```

## 🔧 开发优先级

### Phase 1: 核心功能 (Week 1-2)
- [ ] 管理员权限系统
- [ ] 基础仪表板
- [ ] 用户管理（查看、搜索、基本操作）
- [ ] 错误日志查看

### Phase 2: 内容管理 (Week 3-4)
- [ ] 蓝图管理界面
- [ ] 社区内容审核
- [ ] 手动发放徽章功能

### Phase 3: 系统监控 (Week 5-6)
- [ ] 数据库监控
- [ ] 系统性能监控
- [ ] 自动备份系统

### Phase 4: 高级功能 (Week 7-8)
- [ ] 数据分析报表
- [ ] 批量操作工具
- [ ] 系统配置管理

## ✅ 质检清单

### 功能验证
- [ ] 管理员登录和权限验证正常
- [ ] 用户数据查看和管理功能正常
- [ ] 蓝图内容管理功能正常
- [ ] 证书发放和撤销功能正常
- [ ] 系统监控数据准确
- [ ] 数据备份功能正常

### 安全验证
- [ ] 管理员权限严格控制
- [ ] 敏感操作需要二次确认
- [ ] 所有管理操作都有日志记录
- [ ] 数据备份加密存储

### 性能验证
- [ ] 大量数据下界面响应正常
- [ ] 数据库查询优化
- [ ] 备份操作不影响正常服务

---

**文档版本**: v1.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队