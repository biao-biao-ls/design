import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 预设配置
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        heroicons: () => import('@iconify-json/heroicons/icons.json').then(i => i.default as any),
        'simple-icons': () => import('@iconify-json/simple-icons/icons.json').then(i => i.default as any),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // 赛博朋克风格字体
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas'],
        sans: ['Inter'],
        cyber: ['Orbitron', 'Exo 2'],
      },
    }),
  ],

  // 转换器
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],

  // 赛博朋克主题配置
  theme: {
    colors: {
      // 主色调 - 赛博朋克霓虹色
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },
      
      // 赛博朋克特色色彩
      cyber: {
        neon: '#00FFC2',      // 霓虹绿
        pink: '#FF0080',      // 霓虹粉
        blue: '#0080FF',      // 霓虹蓝
        purple: '#8000FF',    // 霓虹紫
        orange: '#FF8000',    // 霓虹橙
        yellow: '#FFFF00',    // 霓虹黄
      },

      // 背景色系
      dark: {
        50: '#18181b',
        100: '#27272a',
        200: '#3f3f46',
        300: '#52525b',
        400: '#71717a',
        500: '#a1a1aa',
        600: '#d4d4d8',
        700: '#e4e4e7',
        800: '#f4f4f5',
        900: '#fafafa',
      },
    },

    // 动画配置
    animation: {
      'glow': 'glow 2s ease-in-out infinite alternate',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'float': 'float 6s ease-in-out infinite',
      'scan': 'scan 2s linear infinite',
    },

    // 关键帧动画
    keyframes: {
      glow: {
        '0%': { 
          'box-shadow': '0 0 5px #00FFC2, 0 0 10px #00FFC2, 0 0 15px #00FFC2',
          'text-shadow': '0 0 5px #00FFC2',
        },
        '100%': { 
          'box-shadow': '0 0 10px #00FFC2, 0 0 20px #00FFC2, 0 0 30px #00FFC2',
          'text-shadow': '0 0 10px #00FFC2',
        },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      scan: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100vw)' },
      },
    },

    // 字体大小
    fontSize: {
      'xs': ['0.75rem', { 'line-height': '1rem' }],
      'sm': ['0.875rem', { 'line-height': '1.25rem' }],
      'base': ['1rem', { 'line-height': '1.5rem' }],
      'lg': ['1.125rem', { 'line-height': '1.75rem' }],
      'xl': ['1.25rem', { 'line-height': '1.75rem' }],
      '2xl': ['1.5rem', { 'line-height': '2rem' }],
      '3xl': ['1.875rem', { 'line-height': '2.25rem' }],
      '4xl': ['2.25rem', { 'line-height': '2.5rem' }],
      '5xl': ['3rem', { 'line-height': '1' }],
      '6xl': ['3.75rem', { 'line-height': '1' }],
      '7xl': ['4.5rem', { 'line-height': '1' }],
      '8xl': ['6rem', { 'line-height': '1' }],
      '9xl': ['8rem', { 'line-height': '1' }],
    },

    // 间距
    spacing: {
      '18': '4.5rem',
      '88': '22rem',
      '128': '32rem',
    },
  },

  // 自定义规则 - 赛博朋克主题变量
  rules: [
    // 页面背景
    ['bg-page', { 'background-color': '#0a0a0a' }],
    
    // 文本颜色
    ['text-primary', { 'color': '#ffffff' }],
    ['text-secondary', { 'color': '#a1a1aa' }],
    ['text-accent', { 'color': '#00FFC2' }],
    
    // 边框
    ['border-neon', { 'border-color': '#00FFC2' }],
    ['border-cyber', { 'border-color': '#FF0080' }],
    
    // 背景
    ['bg-card', { 'background-color': '#18181b' }],
    ['bg-card-hover', { 'background-color': '#27272a' }],
    
    // 强调色
    ['accent-cyber', { 'color': '#00FFC2' }],
    ['accent-pink', { 'color': '#FF0080' }],
    ['accent-blue', { 'color': '#0080FF' }],
    
    // 霓虹效果
    ['glow-neon', { 
      'box-shadow': '0 0 5px #00FFC2, 0 0 10px #00FFC2, 0 0 15px #00FFC2',
      'text-shadow': '0 0 5px #00FFC2',
    }],
    ['glow-pink', { 
      'box-shadow': '0 0 5px #FF0080, 0 0 10px #FF0080, 0 0 15px #FF0080',
      'text-shadow': '0 0 5px #FF0080',
    }],
    ['glow-blue', { 
      'box-shadow': '0 0 5px #0080FF, 0 0 10px #0080FF, 0 0 15px #0080FF',
      'text-shadow': '0 0 5px #0080FF',
    }],

    // 渐变背景
    ['bg-cyber-gradient', { 
      'background': 'linear-gradient(135deg, #00FFC2 0%, #FF0080 100%)',
    }],
    ['bg-dark-gradient', { 
      'background': 'linear-gradient(135deg, #0a0a0a 0%, #18181b 100%)',
    }],

    // 占位符颜色
    ['placeholder-secondary', { 'color': '#a1a1aa' }],
  ],

  // 快捷方式
  shortcuts: [
    // 按钮样式
    ['btn-cyber', 'px-4 py-2 bg-transparent border border-neon text-accent hover:bg-card-hover hover:glow-neon transition-all duration-300 cursor-pointer'],
    ['btn-primary', 'px-4 py-2 bg-cyber-neon text-dark-50 hover:bg-cyber-pink transition-all duration-300 cursor-pointer'],
    
    // 卡片样式
    ['card-cyber', 'bg-card border border-neon border-opacity-30 rounded-lg p-6 hover:border-neon hover:glow-neon transition-all duration-300'],
    ['card-dark', 'bg-card border border-dark-200 rounded-lg p-6 hover:bg-card-hover transition-all duration-300'],
    
    // 输入框样式
    ['input-cyber', 'bg-transparent border border-neon border-opacity-50 text-primary focus:border-neon focus:glow-neon outline-none transition-all duration-300'],
    
    // 文本样式
    ['text-cyber-title', 'text-2xl font-cyber font-bold text-accent glow-neon'],
    ['text-cyber-subtitle', 'text-lg font-cyber text-secondary'],
    
    // 布局
    ['container-cyber', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
    ['flex-center', 'flex items-center justify-center'],
    ['flex-between', 'flex items-center justify-between'],
  ],

  // 安全列表 - 确保这些类不会被清除
  safelist: [
    'bg-page',
    'text-primary',
    'text-secondary',
    'text-accent',
    'border-neon',
    'bg-card',
    'accent-cyber',
    'glow-neon',
    'btn-cyber',
    'card-cyber',
    'input-cyber',
  ],
})