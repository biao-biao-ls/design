// 测试环境设置文件
import { vi } from 'vitest'

// 模拟浏览器环境
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
  },
  writable: true,
})

// 设置测试环境变量
process.env.NODE_ENV = 'test'