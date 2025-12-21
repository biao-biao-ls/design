# 📜 KNZN 个人开发者技术栈白皮书 (v1.0)

> **核心原则**：不造轮子 (No Reinventing the Wheel)。作为个人开发者，只写核心业务逻辑，基础设施全部“外包”给成熟的 SaaS 和开源库。

## 1. 核心架构 (The Core Stack)

我们采用 **"NuxtBase"** 架构（Nuxt + Supabase），这是目前独立开发者（Indie Hacker）公认的效率天花板。

| 模块 | 选型 | 理由 (Why?) |
| --- | --- | --- |
| **全栈框架** | **Nuxt 4** (Vue 3) | 单一代码库 (Monorepo) 体验，SEO 友好，自动路由，极佳的开发体验 (DX)。 |
| **后端/数据库** | **Supabase** | 开源 Firebase 替代品。提供 Postgres 数据库、身份认证 (Auth)、即时 API (Auto-generated APIs)。**省去 80% 后端 CRUD 代码。** |
| **支付/订阅** | **Lemon Squeezy** | 专为 SaaS 设计的“全托管”支付平台。自动处理全球税务、发票、退款。**彻底摆脱合规烦恼。** |
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
* *用途*：前端生成“结业证书”，无需后端渲染。



---

## 4. 数据库设计 (Database Schema - Supabase)

你只需要设计这 4 张核心表，其他用 Supabase 自带的 `auth.users`。

1. **`profiles`** (扩展用户信息)
* `id` (PK, ref `auth.users`), `username`, `avatar_url`, `xp`, `level`, `is_pro` (Boolean)


2. **`progress`** (学习进度)
* `user_id`, `node_id` (技能节点), `status` (locked/active/completed), `score`, `updated_at`


3. **`blueprints`** (官方蓝图库)
* `id`, `title`, `difficulty`, `category`, `kit_url`, `cover_image`


4. **`certificates`** (已颁发证书)
* `id` (UUID), `user_id`, `badge_type`, `issued_at`, `verify_hash`



---

## 5. MVP 开发路线图 (6-Week Sprint Plan)

这是你的作战计划。不要试图一次性做完，按周交付。

### 🗓️ Week 1: 地基搭建 (Infrastructure)

* [ ] 初始化 Nuxt 4 项目，配置 UnoCSS, Pinia, Supabase 模块。
* [ ] 搭建 Supabase 本地环境，设计并应用数据库 Schema。
* [ ] 实现 GitHub / 邮箱登录 (Supabase Auth UI)。
* [ ] 部署 Hello World 到 Vercel。

### 🗓️ Week 2: 首页与核心交互 (The Hook)

* [ ] 开发首页“闸刀开关”组件 (序列帧动画)。
* [ ] 实现“通电仪式”交互与音效。
* [ ] 完成 Guest Mode 逻辑 (localStorage 状态)。
* [ ] **里程碑**：一个能动、酷炫的 Landing Page 上线。

### 🗓️ Week 3: 技能地图与导航 (The Map)

* [ ] 使用 Figma 绘制技能树 SVG。
* [ ] 开发 SVG 交互组件 (点击、状态着色、连线动画)。
* [ ] 对接 `progress` 表，实现节点解锁逻辑。
* [ ] 开发 HUD 界面 (导航栏、XP 条)。

### 🗓️ Week 4: 关卡仿真核心 (The Engine)

* [ ] 集成 Wokwi iframe。
* [ ] 实现 `postMessage` 通信 (代码注入、串口监听)。
* [ ] 开发“任务面板”和“判题逻辑” (正则匹配串口输出)。
* [ ] 对接 OpenAI API 实现简单的 AI 助教弹窗。

### 🗓️ Week 5: 用户与支付 (The Business)

* [ ] 开发用户中心 (Dashboard) 布局。
* [ ] 实现 2D 车库预览 (图片分层)。
* [ ] 配置 Lemon Squeezy 商品，实现 Webhook 自动开通 Pro 权限。
* [ ] 实现排行榜 (简单的 Supabase 查询)。

### 🗓️ Week 6: 蓝图与发布 (Launch Ready)

* [ ] 填充 5-10 个官方蓝图内容 (Markdown + 图片)。
* [ ] 开发蓝图库展示页和详情页。
* [ ] 集成 `jspdf` 实现证书下载。
* [ ] **全站测试** (移动端适配、Safari 兼容性)。
* [ ] **正式发布 (Product Hunt Launch)！**

---

## 💡 给开发者的最后建议 (Final Tips)

1. **Mobile First? No, Desktop First.**
* 这是一个重交互的学习平台，90% 的用户会用电脑访问（写代码、看电路图）。优先保证桌面端体验，移动端只做“查看/管理”功能的适配。


2. **不要过度封装**
* 直接在 Page 组件里写 Supabase 查询是可以的。不要为了“架构洁癖”去写复杂的 Service 层。怎么快怎么来。


3. **Wokwi 是核心资产**
* 花时间去研究 Wokwi 的 API，它是你能够以一人之力抗衡大厂的关键。
