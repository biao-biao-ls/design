# UnoCSS 集成文档

## 概述

本文档描述了 KNZN 硬件学习平台中 UnoCSS 的集成和配置，包括赛博朋克主题的实现。

## 安装的依赖

```json
{
  "@unocss/nuxt": "^0.x.x",
  "@unocss/preset-uno": "^0.x.x",
  "@unocss/preset-icons": "^0.x.x",
  "@unocss/preset-typography": "^0.x.x",
  "@unocss/preset-web-fonts": "^0.x.x"
}
```

## 配置文件

### uno.config.ts

主要配置文件，包含：

- **预设配置**：Uno、图标、排版、Web 字体
- **赛博朋克主题**：自定义颜色、动画、字体
- **自定义规则**：主题变量和样式规则
- **快捷方式**：常用组件样式的快捷类

### 主题色彩

```typescript
colors: {
  cyber: {
    neon: '#00FFC2',      // 霓虹绿
    pink: '#FF0080',      // 霓虹粉
    blue: '#0080FF',      // 霓虹蓝
    purple: '#8000FF',    // 霓虹紫
    orange: '#FF8000',    // 霓虹橙
    yellow: '#FFFF00',    // 霓虹黄
  }
}
```

## 主题变量

按照 KNZN 开发规范，使用预设主题变量而非硬编码颜色：

### 背景色
- `bg-page` - 页面背景 (#0a0a0a)
- `bg-card` - 卡片背景 (#18181b)
- `bg-card-hover` - 卡片悬停背景 (#27272a)

### 文本颜色
- `text-primary` - 主要文本颜色 (#ffffff)
- `text-secondary` - 次要文本颜色 (#a1a1aa)
- `text-accent` - 强调文本颜色 (#00FFC2)

### 边框颜色
- `border-neon` - 霓虹边框 (#00FFC2)
- `border-cyber` - 赛博朋克边框 (#FF0080)

### 霓虹效果
- `glow-neon` - 霓虹绿发光效果
- `glow-pink` - 霓虹粉发光效果
- `glow-blue` - 霓虹蓝发光效果

## 组件样式快捷方式

### 按钮
- `btn-cyber` - 赛博朋克风格按钮
- `btn-primary` - 主要按钮样式

### 卡片
- `card-cyber` - 赛博朋克风格卡片
- `card-dark` - 深色卡片样式

### 输入框
- `input-cyber` - 赛博朋克风格输入框

### 文本
- `text-cyber-title` - 赛博朋克标题样式
- `text-cyber-subtitle` - 赛博朋克副标题样式

### 布局
- `container-cyber` - 响应式容器
- `flex-center` - 居中对齐
- `flex-between` - 两端对齐

## 动画效果

### 内置动画
- `animate-glow` - 霓虹发光动画
- `animate-pulse-slow` - 慢速脉冲动画
- `animate-float` - 浮动动画
- `animate-scan` - 扫描线动画

### 自定义关键帧
- `glow` - 霓虹发光效果
- `float` - 上下浮动效果
- `scan` - 扫描线效果

## 图标系统

使用 `@iconify-json/heroicons` 和 `@iconify-json/simple-icons`：

```html
<!-- Heroicons -->
<div class="i-heroicons-home text-2xl text-accent" />

<!-- Simple Icons -->
<div class="i-simple-icons-vue-dot-js text-2xl text-accent" />
```

## 字体配置

### Web 字体
- `font-mono` - JetBrains Mono, Fira Code, Consolas
- `font-sans` - Inter
- `font-cyber` - Orbitron, Exo 2

## 响应式设计

使用标准的 UnoCSS 响应式前缀：
- `sm:` - 640px 及以上
- `md:` - 768px 及以上
- `lg:` - 1024px 及以上
- `xl:` - 1280px 及以上

## 使用示例

### 基础页面结构
```vue
<template>
  <div class="bg-page min-h-screen">
    <div class="container-cyber py-8">
      <h1 class="text-cyber-title">页面标题</h1>
      <p class="text-cyber-subtitle">页面描述</p>
    </div>
  </div>
</template>
```

### 卡片组件
```vue
<template>
  <div class="card-cyber">
    <h3 class="text-accent mb-4">卡片标题</h3>
    <p class="text-secondary">卡片内容</p>
  </div>
</template>
```

### 按钮组件
```vue
<template>
  <button class="btn-cyber">
    点击按钮
  </button>
</template>
```

## 开发注意事项

1. **严禁硬编码颜色**：始终使用预设主题变量
2. **响应式优先**：使用响应式类确保移动端兼容
3. **性能考虑**：合理使用动画效果，避免过度使用
4. **可访问性**：确保颜色对比度符合无障碍标准

## 演示页面

访问 `/unocss-demo` 查看完整的主题演示和组件展示。

## 故障排除

### 常见问题

1. **样式不生效**
   - 检查 `uno.config.ts` 配置
   - 确认类名在安全列表中
   - 重启开发服务器

2. **图标不显示**
   - 确认图标包已安装
   - 检查图标名称是否正确
   - 验证图标集合配置

3. **字体加载失败**
   - 检查网络连接
   - 验证字体名称配置
   - 考虑使用本地字体备选

### 调试技巧

1. 使用浏览器开发者工具检查生成的 CSS
2. 在 `uno.config.ts` 中添加调试日志
3. 使用 UnoCSS 的在线工具验证类名