# 构建优化文档

## 概述

本文档记录了 KNZN 项目构建过程中遇到的警告信息及其解决方案。

## 已解决的问题

### 1. CSS 属性名称警告

**问题**: UnoCSS 配置中使用了 `lineHeight` 而不是标准的 `line-height`

**解决方案**: 
```typescript
// 修正前
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],
}

// 修正后  
fontSize: {
  'xs': ['0.75rem', { 'line-height': '1rem' }],
}
```

### 2. Sharp 图像处理库警告

**问题**: `@nuxt/image` 模块在 macOS ARM64 架构上无法找到 sharp 二进制文件

**警告信息**:
```
[@nuxt/image] WARN sharp binaries for darwin-arm64 cannot be found.
```

**解决方案**: 配置使用 IPX 作为图像处理器替代 sharp

```typescript
// nuxt.config.ts
image: {
  provider: process.env.NODE_ENV === 'production' ? 'cloudflare' : 'ipx',
  ipx: {
    sharp: false, // 禁用 sharp
  },
  cloudflare: {
    baseURL: 'https://knzn.net',
  },
}
```

### 3. 原生绑定依赖问题

**问题**: `oxc-parser` 等原生模块在依赖安装时出现绑定问题

**解决方案**: 
1. 清理依赖并重新安装
2. 配置 `.npmrc` 正确处理可选依赖

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 当前构建状态

### ✅ 构建成功指标

- **构建完成**: 无错误退出
- **关键文件生成**: 
  - `.output/server/index.mjs` ✅
  - `.output/public/_nuxt/` ✅
- **类型检查**: 通过 ✅
- **UnoCSS 集成**: 正常工作 ✅

### ⚠️ 已知非关键警告

1. **Sharp 图像处理警告**: 
   - 不影响应用功能
   - 已配置 IPX 作为替代方案
   - 生产环境使用 Cloudflare 图像优化

### 📊 构建统计

- **总包大小**: ~21.9 MB (8.82 MB gzip)
- **主要 CSS 文件**: 40.61 kB (10.03 kB gzip)
- **主要 JS 文件**: 174.27 kB (66.13 kB gzip)

## 构建验证

使用构建验证脚本检查构建质量：

```bash
node scripts/build-check.js
```

该脚本会：
- 执行完整构建
- 验证关键文件存在
- 分析警告和错误
- 提供构建统计信息

## 部署建议

### 生产环境配置

1. **图像优化**: 使用 Cloudflare 图像优化服务
2. **CDN**: 配置静态资源 CDN 加速
3. **压缩**: 启用 gzip/brotli 压缩

### 性能优化

1. **代码分割**: Nuxt 自动进行路由级代码分割
2. **树摇优化**: 移除未使用的代码
3. **CSS 优化**: UnoCSS 按需生成样式

## 故障排除

### 常见构建问题

1. **依赖安装失败**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **类型检查错误**
   ```bash
   npm run typecheck
   ```

3. **UnoCSS 样式不生效**
   - 检查 `uno.config.ts` 配置
   - 验证类名在安全列表中
   - 重启开发服务器

### 监控指标

定期检查以下指标：
- 构建时间 (目标: < 2分钟)
- 包大小 (目标: < 25MB)
- 首屏加载时间 (目标: < 3秒)

## 更新日志

- **2025-12-26**: 修复 CSS 属性警告和 Sharp 依赖问题
- **2025-12-26**: 集成 UnoCSS 并配置赛博朋克主题
- **2025-12-26**: 创建构建验证脚本

## 相关文档

- [UnoCSS 集成文档](./unocss-integration.md)
- [项目架构文档](../KNZN%20项目架构与部署方案文档.md)
- [开发路线图](../KNZN-开发路线图-详细规划.md)