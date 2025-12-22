# 📙 KNZN 核心交互与仿真开发指南

> **核心目标**: 打造沉浸式硬件学习体验 - Wokwi 仿真 + SVG 交互 + 赛博朋克动画

## 📋 文档概述

**适用功能**: KNZN 核心交互系统  
**技术特点**: Wokwi 集成 + SVG 地图 + CSS 动画  
**设计风格**: 赛博朋克 + 游戏化  
**文档版本**: v2.0 (KNZN 专用版)  

## 🎯 交互系统架构

### 核心交互组件

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互层                                │
├─────────────────────────────────────────────────────────────────┤
│ 🔌 闸刀开关 │ 🗺️ 技能地图 │ 🔬 Wokwi仿真 │ 🏆 成就系统      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      动画引擎层                                 │
├─────────────────────────────────────────────────────────────────┤
│ CSS Transitions │ Motion One │ SVG Animations │ 序列帧动画      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    状态管理层 (Pinia)                          │
├─────────────────────────────────────────────────────────────────┤
│ 用户进度 │ 地图状态 │ 仿真状态 │ 音效控制 │ 主题切换          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据持久化层                               │
├─────────────────────────────────────────────────────────────────┤
│ LocalStorage │ IndexedDB │ PostgreSQL │ Wokwi API              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔌 首页闸刀开关系统

### 闸刀交互组件

```vue
<!-- components/PowerSwitch.vue -->
<template>
  <div class="power-switch-container">
    <!-- 🎬 背景视频/序列帧 -->
    <div class="background-animation">
      <div 
        v-for="frame in animationFrames" 
        :key="frame.id"
        :class="['frame', { active: currentFrame === frame.id }]"
        :style="{ backgroundImage: `url(${frame.url})` }"
      />
    </div>
    
    <!-- 🔌 闸刀开关 -->
    <div class="switch-assembly">
      <div 
        class="switch-handle"
        :class="{ 
          'switch-on': isPowered,
          'switch-animating': isAnimating 
        }"
        @click="togglePower"
      >
        <div class="handle-grip"></div>
        <div class="electrical-arc" v-if="showArc"></div>
      </div>
      
      <!-- ⚡ 电气效果 -->
      <div class="electrical-effects">
        <div 
          v-for="spark in sparks" 
          :key="spark.id"
          class="spark"
          :style="spark.style"
        />
      </div>
    </div>
    
    <!-- 📊 状态显示 -->
    <div class="status-panel">
      <div class="voltage-meter">
        <span class="label">VOLTAGE</span>
        <span class="value" :class="{ powered: isPowered }">
          {{ isPowered ? '5.0V' : '0.0V' }}
        </span>
      </div>
      
      <div class="power-indicator">
        <div class="led" :class="{ on: isPowered }"></div>
        <span>{{ isPowered ? 'ONLINE' : 'OFFLINE' }}</span>
      </div>
    </div>
    
    <!-- 🎵 音效控制 -->
    <audio ref="switchSound" preload="auto">
      <source src="/sounds/switch-on.mp3" type="audio/mpeg">
    </audio>
    <audio ref="humSound" preload="auto" loop>
      <source src="/sounds/electrical-hum.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script setup lang="ts">
interface Spark {
  id: string
  style: {
    left: string
    top: string
    animationDelay: string
    animationDuration: string
  }
}

const isPowered = ref(false)
const isAnimating = ref(false)
const showArc = ref(false)
const currentFrame = ref(0)
const sparks = ref<Spark[]>([])

// 🎬 动画帧配置
const animationFrames = [
  { id: 0, url: '/animations/power-off-01.jpg' },
  { id: 1, url: '/animations/power-transition-01.jpg' },
  { id: 2, url: '/animations/power-transition-02.jpg' },
  { id: 3, url: '/animations/power-on-01.jpg' },
]

// 🔊 音效引用
const switchSound = ref<HTMLAudioElement>()
const humSound = ref<HTMLAudioElement>()

// ⚡ 切换电源状态
const togglePower = async () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  
  // 🎵 播放开关音效
  switchSound.value?.play()
  
  if (!isPowered.value) {
    // 🔛 开启电源
    await playPowerOnAnimation()
    isPowered.value = true
    
    // 🎵 播放电流声
    humSound.value?.play()
    
    // ⚡ 生成电火花效果
    generateSparks()
    
    // 🚀 触发"通电仪式"
    await triggerPowerOnRitual()
    
  } else {
    // 🔴 关闭电源
    await playPowerOffAnimation()
    isPowered.value = false
    
    // 🔇 停止电流声
    humSound.value?.pause()
    
    // 清除电火花
    sparks.value = []
  }
  
  isAnimating.value = false
}

// 🎬 播放开机动画
const playPowerOnAnimation = async () => {
  for (let i = 0; i < animationFrames.length; i++) {
    currentFrame.value = i
    await new Promise(resolve => setTimeout(resolve, 150))
  }
  
  // ⚡ 显示电弧效果
  showArc.value = true
  setTimeout(() => {
    showArc.value = false
  }, 500)
}

// 🎬 播放关机动画
const playPowerOffAnimation = async () => {
  for (let i = animationFrames.length - 1; i >= 0; i--) {
    currentFrame.value = i
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// ⚡ 生成电火花效果
const generateSparks = () => {
  const sparkCount = 8
  sparks.value = Array.from({ length: sparkCount }, (_, i) => ({
    id: `spark-${i}`,
    style: {
      left: `${45 + Math.random() * 10}%`,
      top: `${40 + Math.random() * 20}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${0.5 + Math.random() * 1}s`
    }
  }))
}

// 🚀 通电仪式 (首次访问特效)
const triggerPowerOnRitual = async () => {
  const { isFirstVisit } = useUserProgress()
  
  if (isFirstVisit.value) {
    // 🎆 全屏特效
    await showWelcomeAnimation()
    
    // 🎵 播放欢迎音效
    const welcomeSound = new Audio('/sounds/welcome-fanfare.mp3')
    welcomeSound.play()
    
    // 📊 更新用户状态
    isFirstVisit.value = false
    
    // 🗺️ 解锁技能地图
    await navigateTo('/skill-map')
  }
}

// 🎆 欢迎动画
const showWelcomeAnimation = async () => {
  // 实现全屏粒子效果、文字动画等
  // 使用 Motion One 或 CSS 动画
}
</script>
<style scoped>
.power-switch-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.frame.active {
  opacity: 1;
}

.switch-assembly {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.switch-handle {
  width: 120px;
  height: 200px;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  border-radius: 15px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 2px 5px rgba(255, 255, 255, 0.1);
}

.switch-handle:hover {
  transform: scale(1.05);
  box-shadow: 
    0 15px 40px rgba(0, 255, 136, 0.2),
    inset 0 2px 5px rgba(255, 255, 255, 0.2);
}

.switch-on {
  background: linear-gradient(145deg, #00ff88, #00cc6a);
  box-shadow: 
    0 15px 40px rgba(0, 255, 136, 0.4),
    inset 0 2px 5px rgba(255, 255, 255, 0.3);
}

.handle-grip {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 160px;
  background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.switch-on .handle-grip {
  background: linear-gradient(145deg, #ffffff, #e0e0e0);
}

.electrical-arc {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 40px;
  background: radial-gradient(ellipse, rgba(0, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: arc-flicker 0.5s ease-in-out;
}

@keyframes arc-flicker {
  0%, 100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
}

.electrical-effects {
  position: absolute;
  top: -50px;
  left: -50px;
  width: 220px;
  height: 300px;
  pointer-events: none;
}

.spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00ffff;
  border-radius: 50%;
  animation: spark-animation 1s ease-out infinite;
}

@keyframes spark-animation {
  0% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px #00ffff;
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(
      calc(var(--random-x, 0) * 50px), 
      calc(var(--random-y, 0) * 50px)
    );
    box-shadow: 0 0 20px #00ffff;
  }
}

.status-panel {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ff88;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.voltage-meter {
  text-align: center;
}

.voltage-meter .label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.voltage-meter .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #ff4444;
  font-family: 'Courier New', monospace;
  transition: color 0.3s ease;
}

.voltage-meter .value.powered {
  color: #00ff88;
  text-shadow: 0 0 10px #00ff88;
}

.power-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.led {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #333;
  transition: all 0.3s ease;
}

.led.on {
  background: #00ff88;
  box-shadow: 
    0 0 10px #00ff88,
    0 0 20px #00ff88,
    0 0 30px #00ff88;
}

.switch-animating {
  animation: switch-shake 0.3s ease-in-out;
}

@keyframes switch-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
</style>
```

## 🗺️ 技能地图 SVG 系统

### SVG 交互地图组件

```vue
<!-- components/SkillMap.vue -->
<template>
  <div class="skill-map-container">
    <!-- 🗺️ SVG 技能地图 -->
    <svg 
      ref="mapSvg"
      class="skill-map"
      viewBox="0 0 1200 800"
      @click="handleMapClick"
    >
      <!-- 🌌 背景网格 -->
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#00ff88" stroke-width="0.5" opacity="0.3"/>
        </pattern>
        
        <!-- 🔆 发光效果 -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <!-- 🛤️ 学习路径连线 -->
      <g class="path-connections">
        <path 
          v-for="connection in pathConnections"
          :key="connection.id"
          :d="connection.path"
          :class="['connection-line', connection.status]"
          :stroke-dasharray="connection.animated ? '10,5' : 'none'"
        />
      </g>
      
      <!-- 🎯 技能节点 -->
      <g class="skill-nodes">
        <g 
          v-for="node in skillNodes"
          :key="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
          :class="['skill-node', node.status]"
          @click="selectNode(node)"
          @mouseenter="showNodeTooltip(node, $event)"
          @mouseleave="hideNodeTooltip"
        >
          <!-- 节点背景圆 -->
          <circle 
            :r="node.radius"
            :class="['node-bg', node.status]"
            :filter="node.status === 'completed' ? 'url(#glow)' : 'none'"
          />
          
          <!-- 节点图标 -->
          <foreignObject 
            :x="-node.radius/2" 
            :y="-node.radius/2" 
            :width="node.radius" 
            :height="node.radius"
          >
            <div class="node-icon">
              <Icon :name="node.icon" :size="node.radius * 0.6" />
            </div>
          </foreignObject>
          
          <!-- 进度环 -->
          <circle 
            v-if="node.progress > 0"
            :r="node.radius + 5"
            class="progress-ring"
            :stroke-dasharray="`${node.progress * 2 * Math.PI * (node.radius + 5) / 100} ${2 * Math.PI * (node.radius + 5)}`"
          />
          
          <!-- 节点标签 -->
          <text 
            :y="node.radius + 25"
            class="node-label"
            text-anchor="middle"
          >
            {{ node.title }}
          </text>
        </g>
      </g>
      
      <!-- 🎆 粒子效果 -->
      <g class="particle-effects">
        <circle
          v-for="particle in particles"
          :key="particle.id"
          :cx="particle.x"
          :cy="particle.y"
          :r="particle.size"
          :fill="particle.color"
          :opacity="particle.opacity"
        />
      </g>
    </svg>
    
    <!-- 📋 节点详情面板 -->
    <div 
      v-if="selectedNode"
      class="node-details-panel"
      :style="{ 
        left: selectedNode.x + 'px', 
        top: selectedNode.y + 'px' 
      }"
    >
      <div class="panel-header">
        <h3>{{ selectedNode.title }}</h3>
        <button @click="selectedNode = null" class="close-btn">×</button>
      </div>
      
      <div class="panel-content">
        <p>{{ selectedNode.description }}</p>
        
        <div class="progress-info">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: selectedNode.progress + '%' }"
            ></div>
          </div>
          <span>{{ selectedNode.progress }}% Complete</span>
        </div>
        
        <div class="node-actions">
          <button 
            v-if="selectedNode.status === 'available'"
            @click="startLesson(selectedNode)"
            class="start-btn"
          >
            Start Learning
          </button>
          
          <button 
            v-if="selectedNode.status === 'in-progress'"
            @click="continueLesson(selectedNode)"
            class="continue-btn"
          >
            Continue
          </button>
          
          <button 
            v-if="selectedNode.status === 'completed'"
            @click="reviewLesson(selectedNode)"
            class="review-btn"
          >
            Review
          </button>
        </div>
      </div>
    </div>
    
    <!-- 🎮 地图控制器 -->
    <div class="map-controls">
      <button @click="zoomIn" class="control-btn">
        <Icon name="zoom-in" />
      </button>
      <button @click="zoomOut" class="control-btn">
        <Icon name="zoom-out" />
      </button>
      <button @click="resetView" class="control-btn">
        <Icon name="home" />
      </button>
      <button @click="toggleFullscreen" class="control-btn">
        <Icon name="fullscreen" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SkillNode {
  id: string
  title: string
  description: string
  x: number
  y: number
  radius: number
  icon: string
  status: 'locked' | 'available' | 'in-progress' | 'completed'
  progress: number
  prerequisites: string[]
  category: string
}

interface PathConnection {
  id: string
  from: string
  to: string
  path: string
  status: 'locked' | 'available' | 'completed'
  animated: boolean
}

interface Particle {
  id: string
  x: number
  y: number
  size: number
  color: string
  opacity: number
  velocity: { x: number; y: number }
}

const { userProgress } = useUserProgress()
const selectedNode = ref<SkillNode | null>(null)
const particles = ref<Particle[]>([])
const mapSvg = ref<SVGElement>()

// 🎯 技能节点数据
const skillNodes = computed<SkillNode[]>(() => [
  {
    id: 'basics-voltage',
    title: 'Voltage Basics',
    description: 'Learn about electrical potential and voltage measurement',
    x: 200,
    y: 400,
    radius: 30,
    icon: 'zap',
    status: 'completed',
    progress: 100,
    prerequisites: [],
    category: 'fundamentals'
  },
  {
    id: 'basics-current',
    title: 'Current Flow',
    description: 'Understand how electrical current works',
    x: 350,
    y: 350,
    radius: 30,
    icon: 'activity',
    status: 'in-progress',
    progress: 65,
    prerequisites: ['basics-voltage'],
    category: 'fundamentals'
  },
  {
    id: 'components-resistor',
    title: 'Resistors',
    description: 'Master resistor behavior and Ohm\'s law',
    x: 500,
    y: 400,
    radius: 35,
    icon: 'minus',
    status: 'available',
    progress: 0,
    prerequisites: ['basics-current'],
    category: 'components'
  },
  {
    id: 'circuits-series',
    title: 'Series Circuits',
    description: 'Build and analyze series circuits',
    x: 650,
    y: 300,
    radius: 35,
    icon: 'link',
    status: 'locked',
    progress: 0,
    prerequisites: ['components-resistor'],
    category: 'circuits'
  },
  // ... 更多节点
])

// 🛤️ 路径连接数据
const pathConnections = computed<PathConnection[]>(() => [
  {
    id: 'voltage-to-current',
    from: 'basics-voltage',
    to: 'basics-current',
    path: 'M 230 400 Q 290 375 320 350',
    status: 'completed',
    animated: false
  },
  {
    id: 'current-to-resistor',
    from: 'basics-current',
    to: 'components-resistor',
    path: 'M 380 350 Q 440 375 470 400',
    status: 'available',
    animated: true
  },
  // ... 更多连接
])

// 🎯 选择节点
const selectNode = (node: SkillNode) => {
  if (node.status === 'locked') return
  
  selectedNode.value = node
  
  // 🎆 触发选择特效
  createSelectionEffect(node.x, node.y)
}

// 🎆 创建选择特效
const createSelectionEffect = (x: number, y: number) => {
  const particleCount = 12
  const newParticles: Particle[] = []
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    const velocity = 2
    
    newParticles.push({
      id: `selection-${i}-${Date.now()}`,
      x,
      y,
      size: 3,
      color: '#00ff88',
      opacity: 1,
      velocity: {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity
      }
    })
  }
  
  particles.value.push(...newParticles)
  
  // 🧹 清理粒子
  setTimeout(() => {
    particles.value = particles.value.filter(p => 
      !p.id.startsWith('selection-')
    )
  }, 1000)
}

// 🚀 开始课程
const startLesson = async (node: SkillNode) => {
  await navigateTo(`/lesson/${node.id}`)
}

// 🔄 继续课程
const continueLesson = async (node: SkillNode) => {
  await navigateTo(`/lesson/${node.id}`)
}

// 📖 复习课程
const reviewLesson = async (node: SkillNode) => {
  await navigateTo(`/lesson/${node.id}?mode=review`)
}

// 🎮 地图控制
const zoomLevel = ref(1)
const panOffset = ref({ x: 0, y: 0 })

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
  updateMapTransform()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
  updateMapTransform()
}

const resetView = () => {
  zoomLevel.value = 1
  panOffset.value = { x: 0, y: 0 }
  updateMapTransform()
}

const updateMapTransform = () => {
  if (mapSvg.value) {
    mapSvg.value.style.transform = `
      scale(${zoomLevel.value}) 
      translate(${panOffset.value.x}px, ${panOffset.value.y}px)
    `
  }
}

// 🎆 粒子动画循环
const animateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.velocity.x
    particle.y += particle.velocity.y
    particle.opacity *= 0.98
    particle.size *= 0.99
  })
  
  // 移除消失的粒子
  particles.value = particles.value.filter(p => p.opacity > 0.1)
  
  requestAnimationFrame(animateParticles)
}

onMounted(() => {
  animateParticles()
})
</script>
<style scoped>
.skill-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f23 100%);
  overflow: hidden;
}

.skill-map {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
  cursor: grab;
}

.skill-map:active {
  cursor: grabbing;
}

.connection-line {
  fill: none;
  stroke-width: 3;
  transition: all 0.3s ease;
}

.connection-line.locked {
  stroke: #333;
  stroke-dasharray: 5,5;
}

.connection-line.available {
  stroke: #00ff88;
  animation: flow 2s linear infinite;
}

.connection-line.completed {
  stroke: #00ccff;
}

@keyframes flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 15; }
}

.skill-node {
  cursor: pointer;
  transition: all 0.3s ease;
}

.skill-node:hover {
  transform: scale(1.1);
}

.node-bg {
  transition: all 0.3s ease;
}

.node-bg.locked {
  fill: #333;
  stroke: #555;
  stroke-width: 2;
}

.node-bg.available {
  fill: #1a1a2e;
  stroke: #00ff88;
  stroke-width: 3;
}

.node-bg.in-progress {
  fill: #2e1a1a;
  stroke: #ffaa00;
  stroke-width: 3;
}

.node-bg.completed {
  fill: #1a2e1a;
  stroke: #00ff88;
  stroke-width: 3;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
}

.progress-ring {
  fill: none;
  stroke: #00ff88;
  stroke-width: 4;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
}

.node-label {
  fill: #fff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}

.node-details-panel {
  position: absolute;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ff88;
  border-radius: 10px;
  padding: 20px;
  z-index: 100;
  backdrop-filter: blur(10px);
  transform: translate(-50%, -100%);
  margin-top: -20px;
}

.panel-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3 {
  color: #00ff88;
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-content p {
  color: #ccc;
  margin-bottom: 15px;
  line-height: 1.5;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00ccff);
  transition: width 0.3s ease;
}

.node-actions {
  display: flex;
  gap: 10px;
}

.start-btn, .continue-btn, .review-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: #00ff88;
  color: #000;
}

.continue-btn {
  background: #ffaa00;
  color: #000;
}

.review-btn {
  background: #00ccff;
  color: #000;
}

.start-btn:hover, .continue-btn:hover, .review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-btn {
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #00ff88;
  border-radius: 50%;
  color: #00ff88;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #00ff88;
  color: #000;
  transform: scale(1.1);
}
</style>
```

## 🔬 Wokwi 仿真器集成

### Wokwi 通信组件

```vue
<!-- components/WokwiSimulator.vue -->
<template>
  <div class="wokwi-simulator">
    <!-- 🖥️ 仿真器界面 -->
    <div class="simulator-container">
      <iframe
        ref="wokwiFrame"
        :src="wokwiUrl"
        class="wokwi-iframe"
        @load="onWokwiLoad"
      />
      
      <!-- 🎮 控制面板 -->
      <div class="control-panel">
        <div class="simulation-controls">
          <button 
            @click="startSimulation"
            :disabled="!isWokwiReady || isRunning"
            class="control-btn start-btn"
          >
            <Icon name="play" />
            {{ isRunning ? 'Running...' : 'Start' }}
          </button>
          
          <button 
            @click="stopSimulation"
            :disabled="!isRunning"
            class="control-btn stop-btn"
          >
            <Icon name="stop" />
            Stop
          </button>
          
          <button 
            @click="resetSimulation"
            class="control-btn reset-btn"
          >
            <Icon name="refresh" />
            Reset
          </button>
        </div>
        
        <!-- 📊 状态指示器 -->
        <div class="status-indicators">
          <div class="indicator" :class="{ active: isWokwiReady }">
            <div class="led"></div>
            <span>Wokwi Ready</span>
          </div>
          
          <div class="indicator" :class="{ active: isRunning }">
            <div class="led"></div>
            <span>Simulation</span>
          </div>
          
          <div class="indicator" :class="{ active: hasSerialOutput }">
            <div class="led"></div>
            <span>Serial Output</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 📺 串口监视器 -->
    <div class="serial-monitor">
      <div class="monitor-header">
        <h3>Serial Monitor</h3>
        <div class="monitor-controls">
          <button @click="clearSerial" class="clear-btn">Clear</button>
          <button @click="toggleAutoScroll" class="auto-scroll-btn" :class="{ active: autoScroll }">
            Auto Scroll
          </button>
        </div>
      </div>
      
      <div 
        ref="serialOutput"
        class="serial-output"
        :class="{ 'auto-scroll': autoScroll }"
      >
        <div 
          v-for="(line, index) in serialLines"
          :key="index"
          class="serial-line"
          :class="line.type"
        >
          <span class="timestamp">{{ line.timestamp }}</span>
          <span class="content">{{ line.content }}</span>
        </div>
      </div>
      
      <!-- 📝 串口输入 -->
      <div class="serial-input">
        <input
          v-model="serialInputText"
          @keyup.enter="sendSerialInput"
          placeholder="Type command and press Enter..."
          class="input-field"
        />
        <button @click="sendSerialInput" class="send-btn">Send</button>
      </div>
    </div>
    
    <!-- 🎯 任务面板 -->
    <div class="task-panel" v-if="currentTask">
      <div class="task-header">
        <h3>{{ currentTask.title }}</h3>
        <div class="task-progress">
          {{ completedSteps }}/{{ currentTask.steps.length }}
        </div>
      </div>
      
      <div class="task-steps">
        <div 
          v-for="(step, index) in currentTask.steps"
          :key="index"
          class="task-step"
          :class="{ 
            completed: step.completed,
            active: index === currentStepIndex 
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
            
            <!-- ✅ 验证状态 -->
            <div v-if="step.verification" class="verification-status">
              <Icon 
                :name="step.completed ? 'check-circle' : 'clock'"
                :class="step.completed ? 'text-green-500' : 'text-yellow-500'"
              />
              <span>{{ step.verification.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SerialLine {
  timestamp: string
  content: string
  type: 'input' | 'output' | 'error' | 'info'
}

interface TaskStep {
  title: string
  description: string
  completed: boolean
  verification?: {
    type: 'serial' | 'component' | 'timing'
    pattern?: string
    message: string
  }
}

interface Task {
  id: string
  title: string
  description: string
  steps: TaskStep[]
}

interface Props {
  projectId: string
  task?: Task
}

const props = defineProps<Props>()

const wokwiFrame = ref<HTMLIFrameElement>()
const serialOutput = ref<HTMLElement>()
const isWokwiReady = ref(false)
const isRunning = ref(false)
const hasSerialOutput = ref(false)
const serialLines = ref<SerialLine[]>([])
const serialInputText = ref('')
const autoScroll = ref(true)
const currentTask = ref<Task | null>(props.task || null)
const currentStepIndex = ref(0)

// 🔗 Wokwi URL 构建
const wokwiUrl = computed(() => {
  const baseUrl = 'https://wokwi.com/projects'
  const params = new URLSearchParams({
    embed: '1',
    theme: 'dark'
  })
  return `${baseUrl}/${props.projectId}?${params.toString()}`
})

// 📊 任务进度计算
const completedSteps = computed(() => {
  return currentTask.value?.steps.filter(step => step.completed).length || 0
})

// 🔄 Wokwi 加载完成
const onWokwiLoad = () => {
  isWokwiReady.value = true
  setupWokwiCommunication()
}

// 📡 设置 Wokwi 通信
const setupWokwiCommunication = () => {
  if (!wokwiFrame.value?.contentWindow) return
  
  // 🎧 监听来自 Wokwi 的消息
  window.addEventListener('message', handleWokwiMessage)
  
  // 📤 发送初始化消息
  wokwiFrame.value.contentWindow.postMessage({
    type: 'wokwi-init',
    config: {
      enableSerial: true,
      enableDebug: true
    }
  }, '*')
}

// 📨 处理 Wokwi 消息
const handleWokwiMessage = (event: MessageEvent) => {
  if (event.origin !== 'https://wokwi.com') return
  
  const { type, data } = event.data
  
  switch (type) {
    case 'wokwi-ready':
      console.log('✅ Wokwi simulator ready')
      // 🔧 初始化 Custom Chip 和 X-Ray 功能
      initializeCustomChips()
      setupXRayView()
      break
      
    case 'simulation-started':
      isRunning.value = true
      addSerialLine('Simulation started', 'info')
      startXRayMonitoring()
      break
      
    case 'simulation-stopped':
      isRunning.value = false
      addSerialLine('Simulation stopped', 'info')
      stopXRayMonitoring()
      break
      
    case 'serial-output':
      handleSerialOutput(data.text)
      break
      
    case 'component-changed':
      handleComponentChange(data)
      break
      
    case 'gpio-state-changed':
      // 🔍 X-Ray 视图 GPIO 状态更新 (节流处理)
      handleGPIOStateChange(data)
      break
      
    case 'custom-chip-event':
      // 🔧 Custom Chip 事件处理
      handleCustomChipEvent(data)
      break
      
    case 'error':
      addSerialLine(`Error: ${data.message}`, 'error')
      break
  }
}

// 🔧 初始化 Custom Chip 功能
const initializeCustomChips = () => {
  if (!wokwiFrame.value?.contentWindow) return
  
  // 📤 注册虚拟逻辑分析仪芯片
  wokwiFrame.value.contentWindow.postMessage({
    type: 'register-custom-chip',
    data: {
      chipId: 'knzn-logic-analyzer',
      definition: {
        name: 'KNZN Logic Analyzer',
        pins: [
          { name: 'CH0', type: 'input' },
          { name: 'CH1', type: 'input' },
          { name: 'CH2', type: 'input' },
          { name: 'CH3', type: 'input' },
          { name: 'CLK', type: 'input' },
          { name: 'TRIGGER', type: 'input' }
        ],
        behavior: `
          // Custom Chip 逻辑分析仪实现
          class KNZNLogicAnalyzer {
            constructor() {
              this.samples = [];
              this.sampleRate = 1000000; // 1MHz
              this.triggerLevel = 1;
              this.isTriggered = false;
            }
            
            onPinChange(pin, value, timestamp) {
              // 🎯 复杂判题逻辑：检测特定波形模式
              if (pin === 'TRIGGER' && value === this.triggerLevel && !this.isTriggered) {
                this.isTriggered = true;
                this.startCapture(timestamp);
              }
              
              if (this.isTriggered) {
                this.samples.push({
                  pin,
                  value,
                  timestamp: timestamp - this.triggerTime
                });
                
                // 📊 分析波形模式
                this.analyzePattern();
              }
            }
            
            analyzePattern() {
              // 🎯 检测 SPI 通信模式
              if (this.detectSPIPattern()) {
                this.sendEvent('spi-detected', { samples: this.samples });
              }
              
              // 🎯 检测 I2C 通信模式
              if (this.detectI2CPattern()) {
                this.sendEvent('i2c-detected', { samples: this.samples });
              }
            }
            
            detectSPIPattern() {
              // SPI 模式检测逻辑
              const clockEdges = this.samples.filter(s => s.pin === 'CLK');
              return clockEdges.length > 16; // 至少16个时钟周期
            }
          }
        `
      }
    }
  }, '*')
}

// 🔍 设置 X-Ray 视图 (防内存泄漏优化)
const xrayState = ref({
  isActive: false,
  updateLock: false,
  lastUpdate: 0,
  gpioStates: new Map(),
  animationFrame: null
})

const setupXRayView = () => {
  // 🔒 状态锁初始化
  xrayState.value.updateLock = false
  xrayState.value.gpioStates.clear()
}

// 🔍 X-Ray 视图 GPIO 状态处理 (节流 + 状态锁)
const handleGPIOStateChange = (data: any) => {
  const now = performance.now()
  
  // 🚫 防止高频更新导致内存泄漏 (最小间隔 16ms = 60fps)
  if (now - xrayState.value.lastUpdate < 16) {
    return
  }
  
  // 🔒 状态锁检查
  if (xrayState.value.updateLock) {
    return
  }
  
  xrayState.value.updateLock = true
  xrayState.value.lastUpdate = now
  
  // 📊 使用 requestAnimationFrame 优化渲染
  if (xrayState.value.animationFrame) {
    cancelAnimationFrame(xrayState.value.animationFrame)
  }
  
  xrayState.value.animationFrame = requestAnimationFrame(() => {
    try {
      // 🔄 更新 GPIO 状态
      xrayState.value.gpioStates.set(data.pin, {
        value: data.value,
        timestamp: data.timestamp,
        voltage: data.voltage || 0
      })
      
      // 🎨 更新 X-Ray 视觉效果
      updateXRayVisualization(data)
      
    } finally {
      // 🔓 释放状态锁
      xrayState.value.updateLock = false
    }
  })
}

// 🎨 X-Ray 视觉效果更新 (优化版)
const updateXRayVisualization = (data: any) => {
  const xrayContainer = document.querySelector('.xray-overlay')
  if (!xrayContainer) return
  
  // 🔍 创建或更新 GPIO 指示器
  let indicator = xrayContainer.querySelector(`[data-pin="${data.pin}"]`)
  if (!indicator) {
    indicator = document.createElement('div')
    indicator.className = 'gpio-indicator'
    indicator.setAttribute('data-pin', data.pin)
    xrayContainer.appendChild(indicator)
  }
  
  // 🎨 根据电压值设置颜色和亮度
  const voltage = data.voltage || 0
  const intensity = Math.min(voltage / 5.0, 1.0) // 假设最大5V
  
  indicator.style.cssText = `
    position: absolute;
    left: ${data.x || 0}px;
    top: ${data.y || 0}px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: radial-gradient(circle, 
      rgba(0, 255, 136, ${intensity}) 0%, 
      rgba(0, 255, 136, ${intensity * 0.3}) 70%, 
      transparent 100%);
    box-shadow: 0 0 ${intensity * 10}px rgba(0, 255, 136, ${intensity});
    transition: all 0.1s ease;
    pointer-events: none;
  `
}

// 🔧 Custom Chip 事件处理
const handleCustomChipEvent = (data: any) => {
  switch (data.eventType) {
    case 'spi-detected':
      addSerialLine('🔍 SPI communication detected!', 'info')
      // 🎯 触发 SPI 相关任务验证
      checkTaskVerification('SPI_DETECTED')
      break
      
    case 'i2c-detected':
      addSerialLine('🔍 I2C communication detected!', 'info')
      checkTaskVerification('I2C_DETECTED')
      break
      
    case 'pattern-match':
      addSerialLine(`🎯 Pattern matched: ${data.pattern}`, 'info')
      checkTaskVerification(`PATTERN_${data.pattern}`)
      break
  }
}

// 🚀 启动 X-Ray 监控
const startXRayMonitoring = () => {
  xrayState.value.isActive = true
  
  // 📤 启用 GPIO 状态监控
  if (wokwiFrame.value?.contentWindow) {
    wokwiFrame.value.contentWindow.postMessage({
      type: 'enable-xray-mode',
      data: {
        monitorPins: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
        sampleRate: 60 // 60fps 最大更新率
      }
    }, '*')
  }
}

// 🛑 停止 X-Ray 监控
const stopXRayMonitoring = () => {
  xrayState.value.isActive = false
  
  // 🧹 清理动画帧
  if (xrayState.value.animationFrame) {
    cancelAnimationFrame(xrayState.value.animationFrame)
    xrayState.value.animationFrame = null
  }
  
  // 🧹 清理状态
  xrayState.value.gpioStates.clear()
  xrayState.value.updateLock = false
  
  // 📤 禁用监控
  if (wokwiFrame.value?.contentWindow) {
    wokwiFrame.value.contentWindow.postMessage({
      type: 'disable-xray-mode'
    }, '*')
  }
}

// 📺 处理串口输出
const handleSerialOutput = (text: string) => {
  hasSerialOutput.value = true
  addSerialLine(text, 'output')
  
  // 🎯 检查任务验证
  if (currentTask.value) {
    checkTaskVerification(text)
  }
}

// 📝 添加串口行
const addSerialLine = (content: string, type: SerialLine['type'] = 'output') => {
  const timestamp = new Date().toLocaleTimeString()
  serialLines.value.push({ timestamp, content, type })
  
  // 🔄 自动滚动
  if (autoScroll.value) {
    nextTick(() => {
      if (serialOutput.value) {
        serialOutput.value.scrollTop = serialOutput.value.scrollHeight
      }
    })
  }
  
  // 📏 限制行数
  if (serialLines.value.length > 1000) {
    serialLines.value = serialLines.value.slice(-500)
  }
}

// 🎯 检查任务验证
const checkTaskVerification = (output: string) => {
  if (!currentTask.value) return
  
  const currentStep = currentTask.value.steps[currentStepIndex.value]
  if (!currentStep || currentStep.completed) return
  
  const verification = currentStep.verification
  if (!verification) return
  
  switch (verification.type) {
    case 'serial':
      if (verification.pattern && new RegExp(verification.pattern).test(output)) {
        completeCurrentStep()
      }
      break
      
    case 'component':
      // 组件状态验证逻辑
      break
      
    case 'timing':
      // 时序验证逻辑
      break
  }
}

// ✅ 完成当前步骤
const completeCurrentStep = () => {
  if (!currentTask.value) return
  
  const currentStep = currentTask.value.steps[currentStepIndex.value]
  currentStep.completed = true
  
  // 🎆 播放完成特效
  playStepCompletionEffect()
  
  // ➡️ 移动到下一步
  if (currentStepIndex.value < currentTask.value.steps.length - 1) {
    currentStepIndex.value++
  } else {
    // 🏆 任务完成
    completeTask()
  }
}

// 🎆 播放步骤完成特效
const playStepCompletionEffect = () => {
  // 实现完成特效动画
  addSerialLine('✅ Step completed!', 'info')
}

// 🏆 完成任务
const completeTask = () => {
  addSerialLine('🎉 Task completed! Well done!', 'info')
  
  // 🚀 触发任务完成事件
  emit('taskCompleted', currentTask.value)
}

// 🎮 仿真控制方法
const startSimulation = () => {
  if (!wokwiFrame.value?.contentWindow) return
  
  wokwiFrame.value.contentWindow.postMessage({
    type: 'start-simulation'
  }, '*')
}

const stopSimulation = () => {
  if (!wokwiFrame.value?.contentWindow) return
  
  wokwiFrame.value.contentWindow.postMessage({
    type: 'stop-simulation'
  }, '*')
}

const resetSimulation = () => {
  if (!wokwiFrame.value?.contentWindow) return
  
  wokwiFrame.value.contentWindow.postMessage({
    type: 'reset-simulation'
  }, '*')
  
  // 🧹 清理状态
  isRunning.value = false
  hasSerialOutput.value = false
}

// 📤 发送串口输入
const sendSerialInput = () => {
  if (!serialInputText.value.trim() || !wokwiFrame.value?.contentWindow) return
  
  wokwiFrame.value.contentWindow.postMessage({
    type: 'serial-input',
    data: { text: serialInputText.value }
  }, '*')
  
  addSerialLine(serialInputText.value, 'input')
  serialInputText.value = ''
}

// 🧹 清理串口
const clearSerial = () => {
  serialLines.value = []
  hasSerialOutput.value = false
}

// 🔄 切换自动滚动
const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value
}

// 🧹 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('message', handleWokwiMessage)
})

// 📤 组件事件
const emit = defineEmits<{
  taskCompleted: [task: Task]
  simulationStarted: []
  simulationStopped: []
}>()
</script>