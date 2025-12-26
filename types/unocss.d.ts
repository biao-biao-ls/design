// UnoCSS 类型定义
declare module '@unocss/nuxt' {
  interface Theme {
    colors: {
      primary: Record<string, string>
      cyber: Record<string, string>
      dark: Record<string, string>
    }
  }
}

// 扩展全局 CSS 变量类型
declare module 'csstype' {
  interface Properties {
    '--cyber-neon'?: string
    '--cyber-pink'?: string
    '--cyber-blue'?: string
    '--cyber-purple'?: string
    '--cyber-orange'?: string
    '--cyber-yellow'?: string
    '--bg-page'?: string
    '--bg-card'?: string
    '--bg-card-hover'?: string
    '--text-primary'?: string
    '--text-secondary'?: string
    '--text-accent'?: string
    '--border-neon'?: string
  }
}

export {}