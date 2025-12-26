#!/usr/bin/env node

/**
 * 构建验证脚本
 * 检查构建输出并验证是否存在严重错误
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

console.log('🔍 开始构建验证...\n')

try {
  // 运行构建命令
  console.log('📦 执行构建...')
  const buildOutput = execSync('npm run build', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  })
  
  console.log('✅ 构建完成\n')
  
  // 检查构建输出
  const outputDir = '.output'
  const serverDir = join(outputDir, 'server')
  const publicDir = join(outputDir, 'public')
  
  console.log('🔍 验证构建输出...')
  
  // 检查关键文件是否存在
  const criticalFiles = [
    join(serverDir, 'index.mjs'),
    join(publicDir, '_nuxt'),
  ]
  
  let allFilesExist = true
  
  criticalFiles.forEach(file => {
    if (existsSync(file)) {
      console.log(`✅ ${file} - 存在`)
    } else {
      console.log(`❌ ${file} - 缺失`)
      allFilesExist = false
    }
  })
  
  // 分析构建输出中的警告和错误
  console.log('\n📊 构建输出分析:')
  
  const warnings = []
  const errors = []
  
  const lines = buildOutput.split('\n')
  lines.forEach(line => {
    if (line.includes('WARN') && !line.includes('sharp binaries')) {
      warnings.push(line.trim())
    }
    if (line.includes('ERROR')) {
      errors.push(line.trim())
    }
  })
  
  // 检查 sharp 警告（这是已知的非关键警告）
  const sharpWarnings = lines.filter(line => 
    line.includes('sharp binaries for darwin-arm64 cannot be found')
  )
  
  if (sharpWarnings.length > 0) {
    console.log('⚠️  已知警告: Sharp 图像处理库在 macOS ARM64 上的兼容性问题')
    console.log('   这不会影响应用功能，已配置使用 IPX 作为替代方案')
  }
  
  if (errors.length > 0) {
    console.log('❌ 发现构建错误:')
    errors.forEach(error => console.log(`   ${error}`))
    process.exit(1)
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  构建警告:')
    warnings.forEach(warning => console.log(`   ${warning}`))
  }
  
  // 检查包大小
  const packageJsonPath = join(serverDir, 'package.json')
  if (existsSync(packageJsonPath)) {
    console.log('\n📦 构建统计:')
    
    // 从构建输出中提取大小信息
    const sizeLines = lines.filter(line => 
      line.includes('kB') && (line.includes('gzip') || line.includes('│'))
    )
    
    if (sizeLines.length > 0) {
      console.log('   主要文件大小:')
      sizeLines.slice(0, 5).forEach(line => {
        const cleaned = line.replace(/\[.*?\]/g, '').trim()
        if (cleaned) {
          console.log(`   ${cleaned}`)
        }
      })
    }
  }
  
  console.log('\n✅ 构建验证完成!')
  
  if (allFilesExist && errors.length === 0) {
    console.log('🎉 构建成功，所有关键文件都已生成')
    console.log('\n🚀 可以使用以下命令预览构建结果:')
    console.log('   node .output/server/index.mjs')
  } else {
    console.log('❌ 构建验证失败')
    process.exit(1)
  }
  
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}