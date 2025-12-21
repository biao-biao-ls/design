# 🎓 KNZN 认证系统设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 认证系统  
**文档版本**: v3.0  
**最后更新**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**文档类型**: 完整设计规范

## 🎯 核心定位

**从"职业资格认证"定位为"学习成就证明"**

我们证明的是"他学完了这门课"，而不是"他有资格修核电站"。

### 认证性质
- **学习证书**（Completion Certificate）而非职业资格
- **成就展示**而非能力认定
- **学习激励**而非就业凭证

## 🏗️ 认证体系

### 认证方式（2 种）

```
🤖 自动认证
├─ 完成所有关卡 = 获得"理论徽章"
├─ 系统自动检查学习进度
└─ 即时颁发，无需等待

👥 社交认证  
├─ 高难度仿真挑战通过
├─ 或上传实物运行视频到社区（可选加分项）
├─ 社区评审团预筛选 + 简单人工审核
└─ 或社区高赞自动触发（50+ 赞）
```

### 认证等级（2 级）

```
⭐ 理论认证 (Theory Badge)
• 完成所有相关课程和关卡
• 系统自动颁发
• 证明：掌握了理论知识

⭐⭐ 实战认证 (Practice Badge)  
• 理论认证 + 高难度仿真挑战通过
• 或理论认证 + 上传实物视频（加分项）
• 社区评审团审核通过
• 证明：能够实际应用和解决复杂问题
```

### 徽章库（8 个核心徽章）

```
技能类：
🔧 Arduino 入门    [完成 Arduino 基础关卡]
🔧 PCB 设计入门    [完成 PCB 设计关卡] 
🔧 焊接基础        [完成焊接相关关卡]
🔧 硬件综合        [完成 3+ 不同技能]

实战类：
🏆 仿真大师        [通过高难度仿真挑战]
🏆 制造者          [上传 1 个实物视频，可选]
🏆 创新者          [上传 1 个改进作品视频，可选]

社区类：
👥 帮助者          [采纳答案 20+ 个]
👥 贡献者          [发表 3+ 高质量文章]
```

## 🎨 用户认证页面

```
┌───────────────────────────────────────────────────────────────┐
│ 🎓 我的学习证书                                                │
│                                                                │
│ 👤 李三 (Level 8)                    [下载证书PDF]            │
│ @li_learner                                                    │
│                                                                │
│ 📊 已获得：4 个徽章    |  🎯 进行中：2 个    |  📚 完成：12 关卡 │
└───────────────────────────────────────────────────────────────┘

左侧：徽章展示
┌─────────────────────────────┐
│ 🎖️ 我的徽章 (4/8)          │
│                              │
│ ✅ 已获得：                  │
│ 🔧 Arduino 入门  ⭐          │
│ 👥 帮助者       ⭐           │
│ 🏆 仿真大师     ⭐⭐         │
│                              │
│ ⏳ 进行中：                  │
│ 🔧 PCB 设计入门  2/3 关卡    │
│ 👥 贡献者       1/3 文章     │
│                              │
│ [查看所有徽章]               │
└─────────────────────────────┘

右侧：证书和分享
┌────────────────────────────────────────┐
│ 📜 生成学习证书                        │
│                                        │
│ 选择证书样式：                         │
│ ⦿ 简约版（免费）                      │
│ ⦿ 精美版（Pro 会员）                  │
│ ⦿ 定制版（¥19.9）                     │
│                                        │
│ [预览证书] [下载 PDF] [分享链接]      │
│                                        │
│ 证书验证链接：                         │
│ knzn.net/cert/abc123                   │
│ [复制链接]                            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🎯 下一步建议：                        │
│                                        │
│ 📌 完成 1 个关卡即可获得 PCB 设计徽章  │
│    [继续学习]                         │
│                                        │
│ 📌 挑战高难度仿真获得实战认证          │
│    [开始挑战]                         │
└────────────────────────────────────────┘
```

## 🔧 技术实现方案

### 1. 证书生成器

```javascript
// 使用 html2canvas + jspdf 生成证书
const generateCertificate = (userData, badgeData) => {
  const template = `
    <div class="certificate-template">
      <div class="header">KNZN 学习证书</div>
      <div class="user-name">${userData.name}</div>
      <div class="achievement">
        已完成 ${badgeData.skillName} 相关学习
      </div>
      <div class="skills">
        掌握技能：${badgeData.skills.join(', ')}
      </div>
      <div class="date">颁发日期：${new Date().toLocaleDateString()}</div>
      <div class="verify-url">
        验证链接：knzn.net/cert/${generateUniqueId()}
      </div>
    </div>
  `;
  
  // 转换为 PDF
  return html2pdf(template);
};
```

### 2. 自动认证系统 + 防作弊机制

```javascript
// 自动检查用户是否满足徽章条件
// server/api/badges/check.post.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const userId = session.user.id
  const newBadges = []
  
  // 获取用户进度
  const userProgress = await db.select()
    .from(progress)
    .where(eq(progress.userId, userId))
  
  const completedLessons = userProgress.filter(p => p.status === 'completed')
  
  // Arduino 入门徽章
  const arduinoLessons = completedLessons.filter(p => p.lessonId.startsWith('arduino'))
  if (arduinoLessons.length >= 3) {
    const hasArduinoBadge = await checkUserHasBadge(userId, 'arduino-beginner')
    if (!hasArduinoBadge) {
      await awardBadge(userId, 'arduino-beginner')
      newBadges.push('arduino-beginner')
    }
  }
  
  // PCB 设计徽章  
  const pcbLessons = completedLessons.filter(p => p.lessonId.startsWith('pcb'))
  if (pcbLessons.length >= 3) {
    const hasPcbBadge = await checkUserHasBadge(userId, 'pcb-beginner')
    if (!hasPcbBadge) {
      await awardBadge(userId, 'pcb-beginner')
      newBadges.push('pcb-beginner')
    }
  }
  
  // 帮助者徽章
  const acceptedAnswers = await db.select()
    .from(replies)
    .where(
      and(
        eq(replies.userId, userId),
        eq(replies.isBestAnswer, true)
      )
    )
  
  if (acceptedAnswers.length >= 20) {
    const hasHelperBadge = await checkUserHasBadge(userId, 'helper')
    if (!hasHelperBadge) {
      await awardBadge(userId, 'helper')
      newBadges.push('helper')
    }
  }
  
  return {
    newBadges,
    message: newBadges.length > 0 ? '恭喜获得新徽章！' : '暂无新徽章'
  }
})

// 🛡️ 防作弊机制
const ANTI_CHEAT_SYSTEM = {
  // 关键判题逻辑放在后端
  serverSideValidation: {
    enabled: true,
    
    // 在服务端重新验证挑战结果
    validateChallenge: async (userId, challengeId, submissionData) => {
      // 验证提交数据的完整性
      const dataIntegrity = verifySubmissionIntegrity(submissionData)
      if (!dataIntegrity) {
        return { isValid: false, reason: 'Data integrity check failed' }
      }
      
      // 检查时间合理性（防止瞬间完成）
      const timeValidation = validateCompletionTime(submissionData.timeSpent)
      if (!timeValidation) {
        return { isValid: false, reason: 'Completion time suspicious' }
      }
      
      // 重新运行测试用例
      const testResults = await runServerSideTests(challengeId, submissionData.code)
      
      return {
        isValid: testResults.passed,
        score: testResults.score,
        evidence: testResults.evidence
      }
    }
  },
  
  // 前端数据签名
  dataIntegrity: {
    enabled: true,
    
    // 对关键数据进行签名
    signCriticalData: (data) => {
      const timestamp = Date.now()
      const payload = { ...data, timestamp }
      const signature = generateHMAC(payload, process.env.SIGNING_KEY)
      
      return { payload, signature }
    }
  },
  
  // 行为分析
  behaviorAnalysis: {
    enabled: true,
    
    // 检测异常行为模式
    detectAnomalies: (userActions) => {
      const flags = []
      
      // 完成时间过短
      if (userActions.completionTime < 30000) { // 30秒
        flags.push('suspiciously_fast')
      }
      
      // 鼠标/键盘活动异常
      if (userActions.interactionCount < 10) {
        flags.push('insufficient_interaction')
      }
      
      // 代码修改次数异常
      if (userActions.codeChanges < 3) {
        flags.push('minimal_code_changes')
      }
      
      return flags
    }
  }
}

// 徽章颁发函数
async function awardBadge(userId: string, badgeType: string) {
  const certificateId = generateUUID()
  const verifyHash = generateVerifyHash(userId, badgeType, certificateId)
  
  await db.insert(certificates).values({
    id: certificateId,
    userId,
    badgeType,
    verifyHash,
    issuedAt: new Date()
  })
  
  // 更新用户徽章列表
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (user.length) {
    const currentBadges = user[0].badges || []
    await db.update(users)
      .set({ 
        badges: [...currentBadges, badgeType]
      })
      .where(eq(users.id, userId))
  }
  
  return certificateId
}

// 检查用户是否已有徽章
async function checkUserHasBadge(userId: string, badgeType: string) {
  const existing = await db.select()
    .from(certificates)
    .where(
      and(
        eq(certificates.userId, userId),
        eq(certificates.badgeType, badgeType)
      )
    )
    .limit(1)
  
  return existing.length > 0
}
```

## 💰 变现模式

### 证书相关收费

```
📜 证书服务
├─ 电子版证书：免费
├─ 高清 PDF 下载：Pro 会员（¥19.9/月）
├─ 定制证书样式：¥19.9/次
└─ LinkedIn 认证展示：Pro 会员功能

🎖️ 徽章展示
├─ 基础徽章：免费
├─ 金边特效徽章：Pro 会员
├─ 个人主页徽章墙：Pro 会员
└─ 徽章分享卡片：Pro 会员

📊 数据服务  
├─ 学习进度报告：Pro 会员
├─ 技能雷达图：Pro 会员
└─ 年度学习总结：Pro 会员
```

### 预期收入

```
月度收入预估：
├─ Pro 会员：100 人 × ¥19.9 = ¥1,990
├─ 定制证书：20 次 × ¥19.9 = ¥398  
└─ 总计：约 ¥2,400/月

成本：
├─ 服务器：¥200/月
├─ 人工审核：¥500/月（每天 10 分钟）
└─ 净利润：¥1,700/月
```

## 🚀 MVP 开发计划

### Week 1: 核心功能
- [ ] 徽章系统基础架构
- [ ] 自动认证逻辑
- [ ] 用户认证页面

### Week 2: 证书生成
- [ ] 证书模板设计
- [ ] PDF 生成功能
- [ ] 证书验证页面

### Week 3: 高难度挑战
- [ ] 仿真挑战系统
- [ ] 防作弊机制
- [ ] 自动评分逻辑

### Week 4: 变现功能
- [ ] Pro 会员系统
- [ ] 付费证书样式
- [ ] 支付集成

## 📊 成功指标

| 指标 | 目标 | 说明 |
|------|------|------|
| **徽章获得率** | 40% | 用户获得至少 1 个徽章的比例 |
| **证书下载率** | 20% | 获得徽章用户下载证书的比例 |
| **Pro 转化率** | 5% | 免费用户转为 Pro 会员的比例 |
| **挑战通过率** | 15% | 高难度仿真挑战的通过率 |
| **审核效率** | 10 分钟/天 | 每日视频审核时间 |
| **用户满意度** | 4.0+ ⭐ | 对认证系统的满意度 |

---

**文档版本**: v3.0  
**编制时间**: 2024-12-22  
**审核状态**: ✅ 最终确定版本  
**交付对象**: 开发团队