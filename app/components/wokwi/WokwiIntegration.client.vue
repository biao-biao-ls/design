<!--
  Wokwi 仿真器集成组件
  用于 PoC 验证的核心组件，必须在客户端渲染
-->
<template>
  <div class="wokwi-integration-container">
    <!-- 加载状态显示 -->
    <div v-if="!state.isLoaded" class="loading-container">
      <div class="loading-spinner">
        <div class="cyber-pulse text-accent-cyber text-xl">
          正在加载 Wokwi 仿真器...
        </div>
        <div class="loading-progress mt-4">
          <div class="progress-bar bg-card border border-neon">
            <div class="progress-fill bg-cyber-gradient animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态显示 -->
    <div v-if="state.errors.length > 0" class="error-container">
      <div class="error-message card-cyber text-red-400">
        <h3 class="text-lg font-bold mb-2">仿真器加载失败</h3>
        <p>{{ state.errors[state.errors.length - 1]?.message }}</p>
        <button 
          @click="retryLoad" 
          class="btn-cyber mt-4"
        >
          重试加载
        </button>
      </div>
    </div>

    <!-- Wokwi iframe 容器 -->
    <div 
      v-show="state.isLoaded && state.errors.length === 0"
      class="wokwi-iframe-container"
    >
      <iframe
        ref="wokwiIframe"
        :src="iframeSrc"
        class="wokwi-iframe"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        @load="onIframeLoad"
        @error="onIframeError"
      />
    </div>

    <!-- 调试面板 (仅在调试模式下显示) -->
    <div v-if="enableDebug" class="debug-panel">
      <div class="debug-header">
        <h3 class="text-cyber-title">调试信息</h3>
        <button @click="toggleDebugPanel" class="btn-cyber text-sm">
          {{ showDebugPanel ? '隐藏' : '显示' }}
        </button>
      </div>
      
      <div v-if="showDebugPanel" class="debug-content card-dark mt-4">
        <div class="debug-section">
          <h4 class="text-accent font-bold">状态信息</h4>
          <pre class="text-sm">{{ JSON.stringify(state, null, 2) }}</pre>
        </div>
        
        <div class="debug-section mt-4">
          <h4 class="text-accent font-bold">最近消息</h4>
          <pre class="text-sm">{{ state.lastMessage ? JSON.stringify(state.lastMessage, null, 2) : '暂无消息' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WokwiIntegrationProps, WokwiState, WokwiError } from '~~/types/wokwi'
import { TEST_PROJECTS } from '~~/types/wokwi-test-projects'

// Props 定义
const props = withDefaults(defineProps<WokwiIntegrationProps>(), {
  projectId: TEST_PROJECTS.BASIC_ARDUINO.id, // 使用配置文件中的默认项目
  initialCode: '',
  enableDebug: false,
  testMode: 'basic'
})

// 响应式状态
const wokwiIframe = ref<HTMLIFrameElement>()
const showDebugPanel = ref(false)

// 初始化状态
const state = ref<WokwiState>({
  isLoaded: false,
  isRunning: false,
  currentProject: null,
  lastMessage: null,
  errors: [],
  performance: {
    loadTime: 0,
    messageLatency: [],
    memoryUsage: 0,
    frameRate: 0,
    errorCount: 0,
    uptime: 0
  }
})

// 计算属性
const iframeSrc = computed(() => {
  const baseUrl = 'https://wokwi.com/projects'
  return `${baseUrl}/${props.projectId}`
})

const isReady = computed(() => {
  return state.value.isLoaded && state.value.errors.length === 0
})

// 方法
const onIframeLoad = () => {
  console.log('Wokwi iframe 加载完成')
  state.value.isLoaded = true
  state.value.performance.loadTime = Date.now()
}

const onIframeError = (error: Event) => {
  console.error('Wokwi iframe 加载失败:', error)
  const wokwiError: WokwiError = {
    type: 'load-error',
    message: 'Wokwi 仿真器加载失败，请检查网络连接或稍后重试',
    timestamp: Date.now(),
    context: error
  }
  state.value.errors.push(wokwiError)
}

const retryLoad = () => {
  console.log('重试加载 Wokwi 仿真器')
  state.value.errors = []
  state.value.isLoaded = false
  
  // 重新加载 iframe
  if (wokwiIframe.value) {
    wokwiIframe.value.src = iframeSrc.value
  }
}

const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
}

// 生命周期
onMounted(() => {
  console.log('WokwiIntegration 组件已挂载')
  console.log('测试模式:', props.testMode)
  console.log('项目 ID:', props.projectId)
})

onUnmounted(() => {
  console.log('WokwiIntegration 组件已卸载')
})

// 暴露给父组件的方法和状态
defineExpose({
  state: readonly(state),
  isReady,
  retryLoad
})
</script>

<style scoped>
.wokwi-integration-container {
  @apply w-full h-full min-h-[600px] bg-page border border-neon border-opacity-30 rounded-lg overflow-hidden;
}

.loading-container {
  @apply flex-center h-full flex-col;
}

.loading-progress {
  @apply w-64;
}

.progress-bar {
  @apply w-full h-2 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full w-1/3 rounded-full;
}

.error-container {
  @apply flex-center h-full p-8;
}

.error-message {
  @apply max-w-md text-center;
}

.wokwi-iframe-container {
  @apply w-full h-full relative;
}

.wokwi-iframe {
  @apply w-full h-full border-0;
  min-height: 600px;
}

.debug-panel {
  @apply absolute top-4 right-4 max-w-sm z-10;
}

.debug-header {
  @apply flex-between bg-card border border-neon p-3 rounded-t-lg;
}

.debug-content {
  @apply max-h-96 overflow-y-auto p-4 rounded-b-lg;
}

.debug-section {
  @apply mb-4 last:mb-0;
}

.debug-section pre {
  @apply text-xs bg-dark-100 p-2 rounded border border-dark-200 overflow-x-auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .debug-panel {
    @apply relative top-0 right-0 max-w-full mt-4;
  }
  
  .wokwi-iframe {
    min-height: 400px;
  }
}
</style>