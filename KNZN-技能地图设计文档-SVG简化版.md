# 🗺️ KNZN 技能地图 - SVG 简化版设计文档

## 📋 文档概述

**项目名称**: KNZN 硬件学习网站 - 技能地图页面  
**路由**: `/map` 或 `/skill-map`  
**技术方案**: SVG 静态拓扑图 + Vue 数据绑定  
**文档版本**: v2.0 (SVG 简化版)  
**设计理念**: 高性价比、零维护成本、完美适配  

---

## 🎯 核心改造理念

### 从复杂到简单的转变

| 原文档方案 | SVG 简化方案 | 优势 |
|-----------|-------------|------|
| Canvas + 力导向算法 | SVG + 固定坐标 | 布局完全可控，零计算开销 |
| 复杂物理仿真 | Figma 手绘布局 | 在任何设备上都完美显示 |
| Canvas + A11y DOM 覆盖层 | SVG 原生 DOM | 天然支持屏幕阅读器和键盘导航 |
| 复杂粒子流动画 | CSS stroke-dashoffset | 经典描边动画，效果足够赛博朋克 |
| 动态 BGM 切换 | 单一背景音 | 避免音频加载和兼容性问题 |

---

## 🛠️ 技术实现方案

### 1. 地图制作流程

#### Step 1: Figma 设计
```
1. 打开 Figma，创建 1200×800 画布
2. 画 4 个同心圆区域：
   - Sector 01 (硬件基础): 橙红色 #FF6B35
   - Sector 02 (固件开发): 荧光青 #00FFC2  
   - Sector 03 (应用设计): 金色 #FFD700
   - Sector 04 (物质化): 中心白色 #FFFFFF
3. 手动放置约 30 个节点，连好线
4. 给每个节点 Group 命名: node-1-1, node-1-2, node-2-1 等
5. 导出 SVG 代码
```

#### Step 2: SVG 结构示例
```svg
<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#1A1F3A"/>
      <stop offset="100%" stop-color="#0A0E27"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- 连接线 -->
  <g class="edges">
    <path id="edge-1-1-to-1-2" d="M200,300 L350,280" 
          stroke="#1E3A5F" stroke-width="2" class="edge"/>
    <!-- 更多连接线... -->
  </g>
  
  <!-- 节点 -->
  <g class="nodes">
    <!-- Sector 01 节点 -->
    <g id="node-1-1" class="node" data-status="completed" data-sector="hardware">
      <circle cx="200" cy="300" r="20" fill="#FF6B35"/>
      <text x="200" y="305" text-anchor="middle" fill="white" font-size="12">1.1</text>
    </g>
    
    <g id="node-1-2" class="node" data-status="locked" data-sector="hardware">
      <circle cx="350" cy="280" r="20" fill="#333333"/>
      <text x="350" y="285" text-anchor="middle" fill="#666" font-size="12">1.2</text>
    </g>
    
    <!-- Sector 04 中心节点 -->
    <g id="node-4-1" class="node core-node" data-status="locked" data-sector="fabrication">
      <circle cx="600" cy="400" r="30" fill="#FFFFFF" opacity="0.3"/>
      <text x="600" y="405" text-anchor="middle" fill="#666" font-size="14">4.1</text>
    </g>
    
    <!-- 更多节点... -->
  </g>
</svg>
```

### 2. Vue 组件实现

```vue
<template>
  <div class="skill-map-container">
    <!-- HUD 层 -->
    <div class="hud-layer">
      <div class="hud-top-left">
        <button @click="goBack" class="back-btn">← 返回首页</button>
        <div class="breadcrumb">首页 > 技能地图</div>
      </div>
      
      <div class="hud-top-right">
        <div class="user-assets">
          <span class="xp">⚡ {{ userXP }}</span>
          <span class="credits">💎 {{ userCredits }}</span>
        </div>
      </div>
      
      <div class="hud-bottom-center">
        <input 
          type="search" 
          placeholder="搜索技能 (e.g. GPIO, 中断)"
          class="search-bar"
          v-model="searchQuery"
        />
      </div>
      
      <div class="hud-bottom-right">
        <button @click="recenterView" class="icon-btn" title="定位">✛</button>
        <button @click="toggleLegend" class="icon-btn" title="图例">?</button>
        <button @click="openSettings" class="icon-btn" title="设置">⚙️</button>
      </div>
    </div>
    
    <!-- SVG 地图 -->
    <div class="map-container" ref="mapContainer">
      <svg 
        ref="skillMapSVG"
        viewBox="0 0 1200 800" 
        xmlns="http://www.w3.org/2000/svg"
        class="skill-map-svg"
      >
        <!-- SVG 内容在这里 -->
      </svg>
    </div>
    
    <!-- 节点详情弹窗 -->
    <NodeDetailModal 
      v-if="selectedNode" 
      :node="selectedNode" 
      @close="selectedNode = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { SkillNode, UserProgress } from '@/types/skills'

// 响应式数据
const userXP = ref(4200)
const userCredits = ref(1250)
const searchQuery = ref('')
const selectedNode = ref<SkillNode | null>(null)
const userProgress = ref<UserProgress>({
  completedNodes: ['node-1-1', 'node-1-2'],
  inProgressNodes: ['node-1-3'],
  unlockedNodes: ['node-1-1', 'node-1-2', 'node-1-3', 'node-2-1']
})

// SVG 引用
const skillMapSVG = ref<SVGElement>()
const mapContainer = ref<HTMLElement>()

onMounted(() => {
  initializeMap()
  bindNodeEvents()
})

/**
 * 初始化地图状态
 */
function initializeMap() {
  if (!skillMapSVG.value) return
  
  // 根据用户进度更新节点状态
  const nodes = skillMapSVG.value.querySelectorAll('.node')
  
  nodes.forEach(node => {
    const nodeId = node.id
    const nodeElement = node as SVGGElement
    
    // 根据进度设置节点状态
    if (userProgress.value.completedNodes.includes(nodeId)) {
      setNodeStatus(nodeElement, 'completed')
    } else if (userProgress.value.inProgressNodes.includes(nodeId)) {
      setNodeStatus(nodeElement, 'in-progress')
    } else if (userProgress.value.unlockedNodes.includes(nodeId)) {
      setNodeStatus(nodeElement, 'unlocked')
    } else {
      setNodeStatus(nodeElement, 'locked')
    }
  })
  
  // 更新连接线状态
  updateEdgeStates()
}

/**
 * 设置节点状态
 */
function setNodeStatus(nodeElement: SVGGElement, status: string) {
  const circle = nodeElement.querySelector('circle')
  const text = nodeElement.querySelector('text')
  
  if (!circle || !text) return
  
  // 移除所有状态类
  nodeElement.classList.remove('completed', 'in-progress', 'unlocked', 'locked')
  nodeElement.classList.add(status)
  
  // 设置颜色
  const colors = {
    completed: '#33FF00',
    'in-progress': '#00FFC2', 
    unlocked: '#FFD700',
    locked: '#333333'
  }
  
  circle.setAttribute('fill', colors[status] || '#333333')
  text.setAttribute('fill', status === 'locked' ? '#666' : 'white')
  
  // 设置数据属性
  nodeElement.setAttribute('data-status', status)
}

/**
 * 绑定节点点击事件
 */
function bindNodeEvents() {
  if (!skillMapSVG.value) return
  
  const nodes = skillMapSVG.value.querySelectorAll('.node')
  
  nodes.forEach(node => {
    const nodeElement = node as SVGGElement
    
    // 点击事件
    nodeElement.addEventListener('click', (e) => {
      e.preventDefault()
      const nodeId = nodeElement.id
      const status = nodeElement.getAttribute('data-status')
      
      if (status === 'locked') {
        // 显示锁定提示
        showToast('该技能尚未解锁，请先完成前置课程')
        return
      }
      
      // 打开节点详情
      openNodeDetail(nodeId)
    })
    
    // 悬停效果
    nodeElement.addEventListener('mouseenter', () => {
      if (nodeElement.getAttribute('data-status') !== 'locked') {
        const circle = nodeElement.querySelector('circle')
        if (circle) {
          circle.style.filter = 'brightness(1.2)'
        }
      }
    })
    
    nodeElement.addEventListener('mouseleave', () => {
      const circle = nodeElement.querySelector('circle')
      if (circle) {
        circle.style.filter = 'brightness(1)'
      }
    })
  })
}

/**
 * 更新连接线状态
 */
function updateEdgeStates() {
  if (!skillMapSVG.value) return
  
  const edges = skillMapSVG.value.querySelectorAll('.edge')
  
  edges.forEach(edge => {
    const edgeElement = edge as SVGPathElement
    const edgeId = edgeElement.id
    
    // 解析连接的节点 (例如: edge-1-1-to-1-2)
    const match = edgeId.match(/edge-(.+)-to-(.+)/)
    if (!match) return
    
    const fromNodeId = `node-${match[1]}`
    const toNodeId = `node-${match[2]}`
    
    // 检查两个节点的状态
    const fromCompleted = userProgress.value.completedNodes.includes(fromNodeId)
    const toUnlocked = userProgress.value.unlockedNodes.includes(toNodeId)
    
    if (fromCompleted && toUnlocked) {
      // 已完成路径 - 亮绿色
      edgeElement.setAttribute('stroke', '#33FF00')
      edgeElement.setAttribute('stroke-width', '3')
      edgeElement.classList.add('completed-path')
    } else if (toUnlocked) {
      // 可用路径 - 青色
      edgeElement.setAttribute('stroke', '#00FFC2')
      edgeElement.setAttribute('stroke-width', '2')
    } else {
      // 锁定路径 - 暗灰色
      edgeElement.setAttribute('stroke', '#333333')
      edgeElement.setAttribute('stroke-width', '1')
    }
  })
}

/**
 * 路径点亮动画
 */
function animatePathLighting(fromNodeId: string, toNodeIds: string[]) {
  toNodeIds.forEach((toNodeId, index) => {
    setTimeout(() => {
      const edgeId = `edge-${fromNodeId.replace('node-', '')}-to-${toNodeId.replace('node-', '')}`
      const edge = skillMapSVG.value?.querySelector(`#${edgeId}`) as SVGPathElement
      
      if (edge) {
        // 添加能量流动画
        edge.classList.add('energy-flow')
        
        // 动画结束后移除类
        setTimeout(() => {
          edge.classList.remove('energy-flow')
        }, 1500)
      }
    }, index * 300) // 每个连接线间隔 300ms
  })
}

// 其他方法...
function goBack() {
  // 返回首页逻辑
}

function recenterView() {
  // 重置 SVG viewBox 到初始位置
}

function toggleLegend() {
  // 显示/隐藏图例
}

function openSettings() {
  // 打开设置面板
}

function openNodeDetail(nodeId: string) {
  // 打开节点详情弹窗
}

function showToast(message: string) {
  // 显示提示消息
}
</script>
```

### 3. CSS 样式

```css
/* 技能地图容器 */
.skill-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #0F1628 100%);
  overflow: hidden;
}

/* HUD 层 */
.hud-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.hud-layer > * {
  pointer-events: auto;
}

/* HUD 各区域 */
.hud-top-left {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hud-top-right {
  position: absolute;
  top: 20px;
  right: 20px;
}

.hud-bottom-center {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding-bottom: max(20px, env(safe-area-inset-bottom));
}

.hud-bottom-right {
  position: absolute;
  bottom: 0;
  right: 20px;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮样式 */
.back-btn {
  background: rgba(10, 14, 39, 0.9);
  border: 1px solid #00FFC2;
  color: #00FFC2;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 200ms ease;
}

.back-btn:hover {
  background: rgba(0, 255, 194, 0.1);
}

.icon-btn {
  width: 44px;
  height: 44px;
  background: rgba(10, 14, 39, 0.9);
  border: 1px solid #00FFC2;
  color: #00FFC2;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
}

.icon-btn:hover {
  background: rgba(0, 255, 194, 0.1);
  transform: scale(1.05);
}

/* 搜索栏 */
.search-bar {
  width: min(90vw, 400px);
  padding: 12px 16px;
  background: rgba(10, 14, 39, 0.9);
  border: 1px solid #00FFC2;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 200ms ease;
}

.search-bar:focus {
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.search-bar::placeholder {
  color: #666;
}

/* 用户资产 */
.user-assets {
  display: flex;
  gap: 16px;
  background: rgba(10, 14, 39, 0.9);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #333;
}

.user-assets span {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* SVG 地图 */
.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-map-svg {
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 800px;
  cursor: grab;
}

.skill-map-svg:active {
  cursor: grabbing;
}

/* 节点样式 */
.node {
  cursor: pointer;
  transition: all 200ms ease;
}

.node.locked {
  cursor: not-allowed;
  opacity: 0.5;
}

.node circle {
  transition: all 200ms ease;
}

.node text {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  pointer-events: none;
}

/* 连接线动画 */
@keyframes energy-flow {
  0% {
    stroke-dasharray: 20, 10;
    stroke-dashoffset: 0;
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: -100;
    opacity: 0.5;
  }
}

.edge.energy-flow {
  stroke: #00FFC2 !important;
  stroke-width: 4 !important;
  animation: energy-flow 1.5s ease-in-out;
}

.edge.completed-path {
  filter: drop-shadow(0 0 3px #33FF00);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hud-top-left,
  .hud-top-right {
    position: relative;
    top: 10px;
    left: 10px;
    right: 10px;
  }
  
  .search-bar {
    width: min(95vw, 300px);
    font-size: 16px; /* 防止 iOS 缩放 */
  }
  
  .icon-btn {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
}

/* 面包屑 */
.breadcrumb {
  color: #666;
  font-size: 12px;
}
```

---

## 🎨 视觉设计简化

### 色彩系统
```css
:root {
  /* 背景 */
  --bg-primary: #0A0E27;
  --bg-secondary: #1A1F3A;
  
  /* Sector 颜色 */
  --sector-01: #FF6B35; /* 橙红 */
  --sector-02: #00FFC2; /* 荧光青 */
  --sector-03: #FFD700; /* 金色 */
  --sector-04: #FFFFFF; /* 白色 */
  
  /* 节点状态 */
  --node-completed: #33FF00;
  --node-progress: #00FFC2;
  --node-unlocked: #FFD700;
  --node-locked: #333333;
  
  /* UI 元素 */
  --border-primary: #00FFC2;
  --text-primary: #FFFFFF;
  --text-secondary: #666666;
}
```

### 节点图形设计
- **初级**: 圆形 ●
- **中级**: 菱形 ◆  
- **高级**: 方形 ■
- **大师**: 星形 ★

---

## 📱 响应式适配

### 断点设计
```css
/* 移动端竖屏 */
@media (max-width: 480px) and (orientation: portrait) {
  .skill-map-svg {
    transform: scale(0.8);
  }
  
  .search-bar {
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }
}

/* 移动端横屏 */
@media (max-width: 768px) and (orientation: landscape) {
  .hud-bottom-center {
    bottom: 10px;
  }
}

/* 平板 */
@media (min-width: 768px) and (max-width: 1024px) {
  .skill-map-svg {
    max-width: 900px;
    max-height: 600px;
  }
}
```

---

## ⚡ 性能优化

### 1. SVG 优化
- 使用 `<use>` 元素复用相同图形
- 合并相似的路径
- 移除不必要的属性和注释

### 2. 动画优化
```css
/* 使用 transform 而非改变属性 */
.node:hover {
  transform: scale(1.1);
}

/* 使用 will-change 提示浏览器 */
.edge.energy-flow {
  will-change: stroke-dashoffset;
}

/* 减少重绘 */
.node circle {
  will-change: fill;
}
```

### 3. 懒加载
```typescript
// 只在需要时加载节点详情
const loadNodeDetail = async (nodeId: string) => {
  const { default: NodeDetail } = await import('@/components/NodeDetail.vue')
  return NodeDetail
}
```

---

## 🚀 开发时间估算

| 任务 | 时间 | 说明 |
|------|------|------|
| Figma 设计地图 | 1-2 天 | 手绘节点位置，导出 SVG |
| Vue 组件开发 | 2-3 天 | 基础交互和状态管理 |
| CSS 样式和动画 | 1-2 天 | 赛博朋克风格，响应式 |
| 节点详情弹窗 | 1 天 | 简单的模态框 |
| 测试和优化 | 1 天 | 跨设备测试 |
| **总计** | **6-9 天** | 相比原方案节省 2-3 周 |

---

## ✅ 总结

### 这个 SVG 方案的优势：

1. **零维护成本**: 没有复杂的物理仿真，不会出现节点飞出屏幕的 bug
2. **完美适配**: SVG `viewBox` 自动缩放，在任何设备上都完美显示
3. **天然无障碍**: SVG DOM 元素天然支持屏幕阅读器和键盘导航
4. **开发效率**: 6-9 天完成，而不是 3-4 周
5. **性能优秀**: 没有 Canvas 重绘开销，动画使用 CSS 硬件加速
6. **易于扩展**: 添加新节点只需在 Figma 中画一个圆，导出即可

### 与原文档的对比：

| 指标 | 原文档 | SVG 方案 |
|------|--------|----------|
| 开发时间 | 3-4 周 | 6-9 天 |
| 维护成本 | 高 (力导向算法调参) | 低 (静态布局) |
| 跨设备兼容 | 复杂 (需大量测试) | 简单 (SVG 自适应) |
| 无障碍支持 | 复杂 (双层渲染) | 简单 (原生 DOM) |
| 性能 | 中等 (Canvas 重绘) | 优秀 (CSS 动画) |
| 扩展性 | 困难 (算法重计算) | 简单 (添加 SVG 元素) |

这就是为什么 SVG 方案是个人开发者的最佳选择！