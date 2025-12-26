// 格式化工具函数

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short',
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  // 相对时间格式
  if (format === 'relative') {
    if (diffInSeconds < 60) {
      return '刚刚'
    }
    else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} 分钟前`
    }
    else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} 小时前`
    }
    else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} 天前`
    }
  }

  // 标准格式
  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }

  return dateObj.toLocaleDateString('zh-CN', options)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化数字
 * @param num 数字
 * @param options 格式化选项
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (
  num: number,
  options: {
    style?: 'decimal' | 'currency' | 'percent'
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string => {
  const {
    style = 'decimal',
    currency = 'CNY',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options

  return new Intl.NumberFormat('zh-CN', {
    style,
    currency: style === 'currency' ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num)
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...',
): string => {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 生成随机 ID
 * @param length ID 长度
 * @returns 随机 ID 字符串
 */
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证 URL 格式
 * @param url URL 地址
 * @returns 是否为有效 URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  }
  catch {
    return false
  }
}
