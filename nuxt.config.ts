// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 启用 Nuxt 4 兼容模式

  // 模块配置
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],

  // 开发工具
  devtools: { enabled: true },

  // CSS 框架
  css: ['~/assets/css/main.css'],

  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅服务端）
    databaseUrl: process.env.DATABASE_URL || '',
    databaseHost: process.env.DATABASE_HOST || '',
    databaseName: process.env.DATABASE_NAME || '',
    databaseUser: process.env.DATABASE_USER || '',
    databasePassword: process.env.DATABASE_PASSWORD || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    backupPassword: process.env.BACKUP_PASSWORD || '',

    // 公共配置（客户端可访问）
    public: {
      siteUrl: process.env.SITE_URL || 'https://knzn.net',
      appName: 'KNZN 硬件学习平台',
    },
  },
  future: {
    compatibilityVersion: 4,
  },

  // 组件自动导入配置
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // 兼容性日期
  compatibilityDate: '2025-12-26',

  // Nitro 配置
  nitro: {
    experimental: {
      wasm: true,
    },
  },

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false, // 暂时禁用开发环境类型检查以避免 vue-tsc 问题
    shim: false, // 禁用 shim，完全依赖 Volar/Vue Official
  },

  // 启动时验证环境变量
  hooks: {
    ready: () => {
      // 环境变量验证将在后续任务中实现
      console.log('✅ Nuxt 4 项目初始化完成')
    },
  },

  // ESLint 配置
  eslint: {
    config: {
      stylistic: true,
    },
  },

  // 图片优化配置
  image: {
    // 开发环境使用 IPX，生产环境使用 Cloudflare
    provider: process.env.NODE_ENV === 'production' ? 'cloudflare' : 'ipx',
    // 生产环境使用 Cloudflare 图像优化
    cloudflare: {
      baseURL: 'https://knzn.net',
    },
    // 静态图像优化配置
    staticFilename: '[publicPath]/images/[name]-[hash][ext]',
  },
})
