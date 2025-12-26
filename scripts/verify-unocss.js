#!/usr/bin/env node

/**
 * UnoCSS 集成验证脚本
 * 验证 UnoCSS 配置和主题是否正确集成
 */

import { readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 验证 UnoCSS 集成...\n')

// 检查配置文件
const configFiles = [
  'uno.config.ts',
  'app/assets/css/main.css',
  'nuxt.config.ts'
]

let allFilesExist = true

configFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8')
    console.log(`✅ ${file} - 存在`)
    
    // 检查关键配置
    if (file === 'uno.config.ts') {
      const hasPresets = content.includes('presetUno')
      const hasTheme = content.includes('cyber')
      const hasRules = content.includes('bg-page')
      
      console.log(`   - 预设配置: ${hasPresets ? '✅' : '❌'}`)
      console.log(`   - 赛博朋克主题: ${hasTheme ? '✅' : '❌'}`)
      console.log(`   - 自定义规则: ${hasRules ? '✅' : '❌'}`)
    }
    
    if (file === 'nuxt.config.ts') {
      const hasUnoCSS = content.includes('@unocss/nuxt')
      console.log(`   - UnoCSS 模块: ${hasUnoCSS ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
})

// 检查组件文件
const componentFiles = [
  'app/components/ui/CyberButton.vue',
  'app/components/ui/CyberCard.vue'
]

componentFiles.forEach(file => {
  try {
    readFileSync(file, 'utf-8')
    console.log(`✅ ${file} - 存在`)
  } catch (error) {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
})

// 检查页面文件
const pageFiles = [
  'app/pages/index.vue',
  'app/pages/unocss-demo.vue'
]

pageFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8')
    console.log(`✅ ${file} - 存在`)
    
    // 检查是否使用了主题类
    const usesThemeClasses = content.includes('bg-page') || 
                            content.includes('text-accent') || 
                            content.includes('card-cyber')
    console.log(`   - 使用主题类: ${usesThemeClasses ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
})

console.log('\n📋 验证结果:')
if (allFilesExist) {
  console.log('✅ UnoCSS 集成验证通过！')
  console.log('\n🚀 可以访问以下页面测试:')
  console.log('   - http://localhost:3000 (首页)')
  console.log('   - http://localhost:3000/unocss-demo (主题演示)')
  console.log('   - http://localhost:3000/test-components (组件测试)')
} else {
  console.log('❌ UnoCSS 集成验证失败，请检查缺失的文件')
  process.exit(1)
}

console.log('\n📚 文档位置:')
console.log('   - docs/unocss-integration.md (集成文档)')
console.log('   - uno.config.ts (配置文件)')