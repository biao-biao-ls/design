# KNZN 硬件学习平台

专业的硬件学习和仿真平台，基于 Nuxt 4 构建，支持 Arduino、ESP32 等硬件开发学习。

## 🚀 技术栈

- **前端框架**: Nuxt 4 (Vue 3)
- **样式框架**: UnoCSS (赛博朋克主题)
- **状态管理**: Pinia
- **数据库**: PostgreSQL + Drizzle ORM
- **认证系统**: Better-Auth
- **邮件服务**: Resend
- **文件存储**: Cloudflare R2
- **容器化**: Docker + Docker Compose
- **部署**: Contabo VPS

## 📋 功能特性

- 🔧 **硬件仿真**: 支持多种硬件平台的在线仿真
- 📚 **学习资源**: 丰富的教程、示例代码和项目案例
- 👥 **社区交流**: 用户交流和项目分享
- 🔐 **安全认证**: OAuth 登录 (Google, GitHub) + Magic Link
- 🌍 **GDPR 合规**: 完整的隐私保护和数据管理
- 📱 **响应式设计**: 支持桌面和移动设备

## 🛠️ 开发环境设置

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (通过 Docker)

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd knzn-platform
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入实际配置值
   ```

4. **启动开发环境**
   ```bash
   # 一键启动（推荐）
   npm run dev:setup
   
   # 或者分步启动
   npm run dev:docker  # 启动数据库容器
   npm run dev         # 启动 Nuxt 开发服务器
   ```

5. **访问应用**
   - 应用地址: http://localhost:3000
   - PgAdmin: http://localhost:5050 (admin@knzn.net / admin123)

### 开发脚本

```bash
# 开发相关
npm run dev              # 启动开发服务器
npm run dev:docker       # 启动开发环境容器
npm run dev:stop         # 停止开发环境容器
npm run dev:clean        # 清理开发环境

# 构建和部署
npm run build            # 构建生产版本
npm run preview          # 预览生产版本

# 代码质量
npm run lint             # 代码检查
npm run lint:fix         # 自动修复代码问题
npm run typecheck        # TypeScript 类型检查

# 测试
npm run test             # 运行测试
npm run test:watch       # 监听模式运行测试

# 数据库
npm run db:generate      # 生成数据库迁移文件
npm run db:migrate       # 执行数据库迁移
npm run db:studio        # 打开 Drizzle Studio
npm run db:reset         # 重置数据库迁移

# 环境验证
npm run validate-env     # 验证环境变量配置
```

## 📁 项目结构

```
knzn-platform/
├── app/                    # 前端应用 (Nuxt 4)
│   ├── assets/             # 静态资源
│   ├── components/         # Vue 组件
│   │   ├── ui/             # 基础 UI 组件
│   │   └── wokwi/          # 硬件仿真组件 (Client-Only)
│   ├── composables/        # 组合式函数
│   ├── layouts/            # 布局组件
│   ├── pages/              # 页面路由
│   ├── utils/              # 工具函数
│   └── app.vue             # 根组件
├── server/                 # 后端 API (Nitro)
│   ├── api/                # API 路由
│   ├── database/           # 数据库 Schema
│   ├── middleware/         # 服务端中间件
│   └── utils/              # 服务端工具
├── tests/                  # 测试文件
├── docker/                 # Docker 配置
├── scripts/                # 构建脚本
└── ssl/                    # SSL 证书
```

## 🎨 设计系统

项目采用赛博朋克风格的设计系统：

### 颜色主题

- **主背景**: `bg-page` (#0a0a0a)
- **卡片背景**: `bg-card` (#1a1a1a)
- **主要文本**: `text-primary` (#ffffff)
- **次要文本**: `text-secondary` (#a0a0a0)
- **强调色**: `text-accent-cyber` (#00ffc2)
- **霓虹边框**: `border-neon` (#00ffc2)

### 组件使用

```vue
<template>
  <!-- 使用预设主题变量 -->
  <div class="bg-page text-primary">
    <div class="bg-card border border-neon p-6 rounded-lg">
      <h1 class="text-accent-cyber">标题</h1>
      <p class="text-secondary">描述文本</p>
    </div>
  </div>
</template>
```

## 🔧 开发规范

### Vue 组件

- 必须使用 `<script setup lang="ts">` 语法
- Props 使用泛型定义: `defineProps<Props>()`
- 组件命名规范:
  - 页面组件: `Page` 前缀
  - 基础组件: `Base` 前缀
  - 业务组件: `App` 前缀

### Wokwi 仿真组件

- 必须放在 `app/components/wokwi/` 目录
- 必须使用 `<ClientOnly>` 包装
- 必须检查 `window` 对象存在性

```vue
<template>
  <ClientOnly>
    <div ref="wokwiContainer">
      <!-- 仿真器内容 -->
    </div>
    <template #fallback>
      <div>加载仿真器中...</div>
    </template>
  </ClientOnly>
</template>
```

### 类型安全

- 启用 TypeScript 严格模式
- 前端类型从后端 Schema 推导
- 禁止使用 `any` 类型

## 🚀 部署

### 生产环境部署

1. **构建 Docker 镜像**
   ```bash
   docker build -t knzn-platform .
   ```

2. **部署到 VPS**
   ```bash
   # 通过 GitHub Actions 自动部署
   git push origin main
   ```

### 环境变量配置

生产环境需要配置以下环境变量：

- 数据库连接信息
- OAuth 应用密钥
- 邮件服务 API 密钥
- 文件存储配置
- SSL 证书路径

详细配置请参考 `.env.example` 文件。

## 📝 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 项目主页: https://knzn.net
- 邮箱: contact@knzn.net

---

**KNZN 硬件学习平台** - 让硬件学习更简单 🚀