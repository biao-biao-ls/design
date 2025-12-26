import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue 相关规则
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off', // Vue 3 支持多根节点
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],

    // TypeScript 相关规则
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',

    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },

  // 忽略文件
  ignores: [
    'dist',
    '.nuxt',
    '.output',
    'node_modules',
    'drizzle',
  ],
})
