# KNZN Nuxt 4 开发规范 (v2.0)

## 1. 核心原则

- **全栈类型安全**: 前端类型尽可能从后端 Schema 推导，避免重复定义
- **SSR 优先但受控**: 默认 SSR，但 Wokwi 等硬件仿真组件必须 Client-Only
- **实用主义**: 优先使用 Nuxt 模块，不造轮子，专注业务逻辑

## 2. 目录结构 (Nuxt 4 Future Mode)

### 强制使用 Nuxt 4 目录结构
- **配置要求**：在 `nuxt.config.ts` 中启用 `future: { compatibilityVersion: 4 }`
- **物理隔离**：前后端代码完全分离，防止服务端代码泄露到客户端

```
knzn/
├── app/                    # 前端应用逻辑 (Pages, Components, Composables)
│   ├── assets/             # 静态资源 (CSS, Fonts)
│   ├── components/         # Vue 组件
│   │   ├── wokwi/          # 硬件仿真组件 (必须 Client-Only)
│   │   ├── ui/             # 基础 UI 组件
│   │   └── pages/          # 页面级组件
│   ├── composables/        # 组合式函数 (Auto-imported)
│   ├── layouts/            # 布局组件
│   ├── middleware/         # 路由中间件
│   ├── pages/              # 页面路由
│   ├── plugins/            # 插件
│   ├── utils/              # 工具函数 (Auto-imported)
│   ├── app.vue             # 根组件
│   └── router.options.ts   # 路由配置
├── server/                 # 后端 API & DB 逻辑 (Nitro)
│   ├── api/                # API 路由
│   ├── database/           # 数据库 Schema & 迁移
│   ├── middleware/         # 服务端中间件
│   └── utils/              # 服务端工具函数
├── public/                 # 静态资源
├── layers/                 # (可选) 复用模块
├── nuxt.config.ts
└── ...
```

## 3. 编码规范

### 3.1 Vue 组件开发

#### 组件基础要求
- **必须使用** `<script setup lang="ts">` 语法
- **Props 定义**：使用 `defineProps<Props>()` 泛型语法，禁用运行时声明
- **组件命名规范**：
  - 页面级组件：`Page` 前缀 (如 `PageHome.vue`)
  - 基础组件：`Base` 前缀 (如 `BaseButton.vue`)
  - 业务组件：`App` 前缀 (如 `AppHeader.vue`)

#### Wokwi 硬件仿真组件特殊要求
- **强制位置**：必须放在 `app/components/wokwi/` 目录下
- **Client-Only 要求**：所有 Wokwi 组件必须检查 `window` 对象存在性
- **命名规范**：以 `Wokwi` 前缀命名 (如 `WokwiSimulator.vue`)

```vue
<!-- 正确示例：Wokwi 组件 -->
<template>
  <ClientOnly>
    <div ref="wokwiContainer" class="wokwi-simulator">
      <!-- Wokwi 仿真器内容 -->
    </div>
    <template #fallback>
      <div class="loading-simulator">加载仿真器中...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
// 必须检查 window 对象
const wokwiContainer = ref<HTMLElement>()

onMounted(() => {
  if (typeof window !== 'undefined') {
    // 初始化 Wokwi 仿真器
  }
})
</script>
```

### 3.2 状态管理 (Pinia)

#### Setup Stores 语法
- **必须使用** Setup Stores 写法（Vue 3 风格）
- **认证状态**：所有 Auth 状态必须通过 `useAuth` (Better-Auth wrapper) 获取
- **禁止手动存储** token 或用户信息

```typescript
// stores/auth.ts - 正确示例
export const useAuthStore = defineStore('auth', () => {
  const { data: session, signIn, signOut } = useAuth()
  
  const user = computed(() => session.value?.user)
  const isAuthenticated = computed(() => !!session.value)
  
  return {
    user,
    isAuthenticated,
    signIn,
    signOut
  }
})
```

### 3.3 样式规范 (UnoCSS)

#### 赛博朋克主题约束
- **严禁硬编码颜色值**：禁止使用 `text-blue-500`、`bg-[#00FFC2]` 等
- **必须使用预设主题变量**：
  - `bg-page` - 页面背景
  - `text-primary` - 主要文本颜色
  - `text-secondary` - 次要文本颜色
  - `border-neon` - 霓虹边框
  - `bg-card` - 卡片背景
  - `accent-cyber` - 赛博朋克强调色

```vue
<!-- 正确示例：使用主题变量 -->
<template>
  <div class="bg-page text-primary border border-neon">
    <h1 class="text-accent-cyber">KNZN 硬件仿真平台</h1>
  </div>
</template>

<!-- 错误示例：硬编码颜色 -->
<template>
  <div class="bg-black text-green-400 border border-[#00FFC2]">
    <!-- 禁止这样写 -->
  </div>
</template>
```

## 4. 全栈数据流

### 4.1 数据库层 (Server)

#### Drizzle ORM 规范
- **Schema 定义**：所有数据库表结构定义在 `server/database/schema.ts`
- **类型导出**：必须导出 TypeScript 类型供前端使用
- **迁移管理**：使用 Drizzle Kit 管理数据库迁移

```typescript
// server/database/schema.ts - 正确示例
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  isActive: boolean('is_active').default(true)
})

// 导出类型供前端使用
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

#### API 输入验证 (Zod)
- **必须验证**：所有 API 输入参数必须使用 Zod 验证
- **错误处理**：统一的错误响应格式

```typescript
// server/api/users.post.ts - 正确示例
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createUserSchema.parse(body)
    
    // 创建用户逻辑
    const user = await db.insert(users).values(validatedData).returning()
    
    return {
      success: true,
      data: user[0],
      error: null
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
})
```

### 4.2 数据获取 (Client)

#### useFetch 规范化使用
- **类型断言**：必须指定返回类型 `useFetch<ApiResponse<T>>`
- **错误处理**：必须处理 `error` 状态
- **统一响应格式**：所有 API 返回 `{ success: boolean, data: any, error: string | null }`

```typescript
// 正确示例：类型安全的数据获取
interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

const { data, error, pending } = await useFetch<ApiResponse<User>>('/api/user', {
  key: `user-${userId.value}`,
  pick: ['success', 'data', 'error']
})

// 错误处理
if (error.value || !data.value?.success) {
  // 处理错误情况
  console.error('获取用户信息失败:', data.value?.error || error.value)
}
```

#### 全栈类型共享
- **禁止重复定义**：前端不应手写 User 接口
- **直接导入**：从 `server/database/schema` 导入类型

```typescript
// 正确示例：类型共享
import type { User, NewUser } from '~/server/database/schema'

// 使用共享类型
const createUser = async (userData: NewUser) => {
  return await $fetch<ApiResponse<User>>('/api/users', {
    method: 'POST',
    body: userData
  })
}
```

## 5. SSR 安全与 Client-Only 策略

### SSR 兼容性规范
- **核心问题**：Wokwi 仿真器严重依赖 `window` 对象，SSR 时会导致 500 崩溃
- **解决方案**：所有涉及浏览器 API 的组件必须使用 Client-Only 策略

### 强制 Client-Only 的场景
1. **Wokwi 仿真器组件**：所有硬件仿真相关组件
2. **Canvas 操作**：图形绘制、图表库
3. **LocalStorage/SessionStorage**：本地存储操作
4. **第三方浏览器库**：依赖 DOM API 的库

### 实现方式

#### 方式一：使用 `<ClientOnly>` 组件
```vue
<template>
  <ClientOnly>
    <WokwiSimulator :project="project" />
    <template #fallback>
      <div class="bg-card border border-neon p-4 animate-pulse">
        <div class="text-center text-secondary">
          正在加载硬件仿真器...
        </div>
      </div>
    </template>
  </ClientOnly>
</template>
```

#### 方式二：使用 `.client.vue` 后缀
```
app/components/
├── WokwiSimulator.client.vue    # 仅在客户端渲染
├── CanvasChart.client.vue       # 仅在客户端渲染
└── BaseButton.vue               # 正常 SSR
```

#### 方式三：条件渲染检查
```vue
<script setup lang="ts">
const isClient = process.client

onMounted(() => {
  if (typeof window !== 'undefined') {
    // 安全的浏览器 API 调用
  }
})
</script>

<template>
  <div v-if="isClient">
    <!-- 仅客户端内容 -->
  </div>
</template>
```

## 6. 环境变量与配置

### 强类型环境变量验证
- **禁止直接使用** `process.env.XXX`
- **必须使用** `@t3-oss/env-nuxt` 进行验证
- **配置获取** 通过 `useRuntimeConfig()` 获取

```typescript
// env.ts - 环境变量验证
import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
  },
  client: {
    NUXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NUXT_PUBLIC_APP_URL: process.env.NUXT_PUBLIC_APP_URL,
  },
})
```

```typescript
// 正确使用方式
const config = useRuntimeConfig()
const appUrl = config.public.appUrl // 类型安全

// 错误使用方式
const appUrl = process.env.NUXT_PUBLIC_APP_URL // 禁止
```

## 7. 自动导入 (Auto-imports) 界定

### 显式 vs 隐式导入策略
- **Vue/Nuxt 核心函数**：使用自动导入
  - `ref`, `computed`, `watch`, `onMounted`
  - `useFetch`, `useRoute`, `useRouter`
  - `useState`, `useRuntimeConfig`

- **工具库**：建议显式导入（保持代码可读性）
  - `date-fns`, `lodash`, `zod` 等第三方库
  - 自定义工具函数（除非放在 `utils/` 目录下）

```typescript
// 正确示例：混合导入策略
<script setup lang="ts">
// 自动导入 - Vue/Nuxt 核心
const route = useRoute()
const user = ref<User | null>(null)

// 显式导入 - 第三方库
import { format } from 'date-fns'
import { z } from 'zod'

// 自动导入 - utils/ 目录下的函数
const formattedDate = formatDate(new Date()) // 来自 utils/formatDate.ts
</script>
```

## 8. TypeScript 严格模式配置

### 必须启用的配置
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4 // 启用 Nuxt 4 兼容模式
  },
  typescript: {
    strict: true,
    typeCheck: true, // 开发环境启用类型检查
    shim: false      // 禁用 shim，完全依赖 Volar/Vue Official
  }
})
```

## 9. 工程化配置

### ESLint 配置 (Flat Config)
```typescript
// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off', // Vue 3 支持多根节点
    '@typescript-eslint/no-unused-vars': 'error'
  }
})
```

### Git 提交规范
使用约定式提交 (Conventional Commits)：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具、依赖更新

示例：
```
feat(wokwi): 添加 Arduino 仿真器组件
fix(auth): 修复登录状态持久化问题
docs(api): 更新用户 API 文档
```

## 开发检查清单

在开发过程中，请确保以下要求得到满足：

- [ ] 使用 `app/` 目录结构
- [ ] 启用 TypeScript 严格模式
- [ ] 数据获取使用 `useFetch` 并配置 `pick`
- [ ] 静态组件使用 `.server.vue` 后缀
- [ ] 复杂状态使用 Pinia Setup Store
- [ ] 简单状态使用 `useState`
- [ ] 集成 `@nuxt/image` 进行图片优化
- [ ] 使用 `useSeoMeta` 管理 SEO
- [ ] 配置 ESLint Flat Config
- [ ] API 路由放在 `server/api` 中

## 错误处理

### 常见问题避免
- **Hydration Mismatch**：确保使用官方数据获取方法
- **状态污染**：避免在 SSR 中使用全局变量
- **Bundle 体积过大**：合理使用服务端组件和按需导入
- **类型错误**：启用严格类型检查并正确定义 Props

遵循以上规范，确保 Nuxt 4 项目的高性能、可维护性和类型安全。