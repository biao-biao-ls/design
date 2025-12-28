<!--
  Wokwi 集成验证概念 (PoC) 页面
  用于全面测试 Wokwi 仿真器在 Nuxt 4 环境中的集成可行性
-->
<template>
  <div class="poc-page bg-page min-h-screen">
    <!-- 页面头部 -->
    <header class="poc-header">
      <div class="container-cyber py-8">
        <div class="text-center">
          <h1 class="text-cyber-title text-4xl mb-4">
            Wokwi 集成验证 PoC
          </h1>
          <p class="text-cyber-subtitle max-w-2xl mx-auto">
            验证 Wokwi 仿真器在 KNZN 硬件学习平台中的集成可行性，
            测试关键交互场景，为后续关卡系统开发提供技术基础。
          </p>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="poc-main">
      <div class="container-cyber">
        <!-- 测试场景选择器 -->
        <section class="test-scenarios mb-8">
          <h2 class="text-2xl font-bold text-accent mb-6">测试场景选择</h2>
          <div class="scenarios-grid">
            <div
              v-for="scenario in testScenarios"
              :key="scenario.id"
              class="scenario-card"
              :class="{ 'active': currentScenario === scenario.id }"
              @click="selectScenario(scenario.id)"
            >
              <div class="scenario-icon">
                <div :class="scenario.iconClass"></div>
              </div>
              <h3 class="scenario-title">{{ scenario.title }}</h3>
              <p class="scenario-description">{{ scenario.description }}</p>
              <div class="scenario-status">
                <span 
                  class="status-badge"
                  :class="getScenarioStatusClass(scenario.id)"
                >
                  {{ getScenarioStatus(scenario.id) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Wokwi 仿真器容器 -->
        <section class="wokwi-container mb-8">
          <div class="section-header flex-between mb-6">
            <h2 class="text-2xl font-bold text-accent">Wokwi 仿真器</h2>
            <div class="controls flex gap-4">
              <button 
                @click="toggleDebugMode" 
                class="btn-cyber"
                :class="{ 'glow-neon': debugMode }"
              >
                {{ debugMode ? '关闭调试' : '开启调试' }}
              </button>
              <button 
                @click="refreshSimulator" 
                class="btn-cyber"
              >
                刷新仿真器
              </button>
            </div>
          </div>

          <!-- 仿真器主体 -->
          <div class="simulator-wrapper">
            <ClientOnly>
              <WokwiIntegration
                ref="wokwiRef"
                :project-id="currentProjectId"
                :enable-debug="debugMode"
                :test-mode="currentScenario"
                @state-change="onWokwiStateChange"
                @error="onWokwiError"
              />
              <template #fallback>
                <div class="simulator-fallback">
                  <div class="fallback-content card-cyber">
                    <div class="text-center py-16">
                      <div class="text-accent text-2xl mb-4">⚡</div>
                      <h3 class="text-xl font-bold mb-2">正在初始化仿真器</h3>
                      <p class="text-secondary">
                        Wokwi 仿真器正在加载中，请稍候...
                      </p>
                      <div class="loading-animation mt-6">
                        <div class="cyber-pulse w-8 h-8 bg-accent-cyber rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </section>

        <!-- 状态监控面板 -->
        <section class="monitoring-panel mb-8">
          <h2 class="text-2xl font-bold text-accent mb-6">状态监控</h2>
          <div class="monitoring-grid">
            <!-- 连接状态 -->
            <div class="monitor-card card-cyber">
              <h3 class="monitor-title">连接状态</h3>
              <div class="monitor-value">
                <span 
                  class="status-indicator"
                  :class="connectionStatusClass"
                ></span>
                {{ connectionStatus }}
              </div>
            </div>

            <!-- 性能指标 -->
            <div class="monitor-card card-cyber">
              <h3 class="monitor-title">加载时间</h3>
              <div class="monitor-value">
                {{ loadTime }}ms
              </div>
            </div>

            <!-- 错误计数 -->
            <div class="monitor-card card-cyber">
              <h3 class="monitor-title">错误计数</h3>
              <div class="monitor-value">
                {{ errorCount }}
              </div>
            </div>

            <!-- 运行时间 -->
            <div class="monitor-card card-cyber">
              <h3 class="monitor-title">运行时间</h3>
              <div class="monitor-value">
                {{ formatUptime(uptime) }}
              </div>
            </div>
          </div>
        </section>

        <!-- 测试结果面板 -->
        <section class="results-panel">
          <h2 class="text-2xl font-bold text-accent mb-6">测试结果</h2>
          <div class="results-container card-dark">
            <div v-if="testResults.length === 0" class="no-results">
              <p class="text-secondary text-center py-8">
                选择测试场景开始验证
              </p>
            </div>
            <div v-else class="results-list">
              <div
                v-for="result in testResults"
                :key="`${result.scenario}-${result.timestamp}`"
                class="result-item"
              >
                <div class="result-header flex-between">
                  <span class="result-scenario">{{ getScenarioTitle(result.scenario) }}</span>
                  <span 
                    class="result-status"
                    :class="result.success ? 'text-green-400' : 'text-red-400'"
                  >
                    {{ result.success ? '✓ 通过' : '✗ 失败' }}
                  </span>
                </div>
                <p class="result-message text-sm text-secondary mt-2">
                  {{ result.message }}
                </p>
                <div class="result-timestamp text-xs text-secondary mt-1">
                  {{ formatTimestamp(result.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { 
  TestScenario, 
  PocValidationResult, 
  WokwiState,
  WokwiError 
} from '~/../../types/wokwi'

// 页面元数据
definePageMeta({
  title: 'Wokwi 集成验证 PoC',
  description: '验证 Wokwi 仿真器集成的可行性和稳定性'
})

// 响应式状态
const wokwiRef = ref()
const debugMode = ref(false)
const currentScenario = ref<TestScenario>('basic-embed')
const currentProjectId = ref('451385811510693889')
const testResults = ref<PocValidationResult[]>([])
const startTime = ref(Date.now())

// 监控状态
const connectionStatus = ref('未连接')
const connectionStatusClass = ref('status-disconnected')
const loadTime = ref(0)
const errorCount = ref(0)
const uptime = ref(0)

// 测试场景配置
const testScenarios = [
  {
    id: 'basic-embed' as TestScenario,
    title: '基础嵌入测试',
    description: '验证 Wokwi 仿真器的基本加载和显示功能',
    iconClass: 'i-heroicons-play text-2xl text-accent'
  },
  {
    id: 'communication' as TestScenario,
    title: '双向通信测试',
    description: '测试主应用与 Wokwi 之间的消息传递',
    iconClass: 'i-heroicons-arrow-path text-2xl text-accent'
  },
  {
    id: 'code-injection' as TestScenario,
    title: '代码注入测试',
    description: '验证动态代码更新功能',
    iconClass: 'i-heroicons-code-bracket text-2xl text-accent'
  },
  {
    id: 'custom-chip' as TestScenario,
    title: '自定义芯片测试',
    description: '测试自定义芯片事件通信',
    iconClass: 'i-heroicons-cpu-chip text-2xl text-accent'
  },
  {
    id: 'performance' as TestScenario,
    title: '性能稳定性测试',
    description: '验证长时间运行的稳定性和性能',
    iconClass: 'i-heroicons-chart-bar text-2xl text-accent'
  }
]

// 计算属性
const formatUptime = (time: number) => {
  const seconds = Math.floor(time / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

// 方法
const selectScenario = (scenarioId: TestScenario) => {
  console.log('选择测试场景:', scenarioId)
  currentScenario.value = scenarioId
  
  // 根据场景切换项目
  switch (scenarioId) {
    case 'basic-embed':
      currentProjectId.value = '451385811510693889'
      break
    case 'communication':
      currentProjectId.value = 'esp32-serial-monitor'
      break
    case 'code-injection':
      currentProjectId.value = 'arduino-led-control'
      break
    case 'custom-chip':
      currentProjectId.value = 'custom-logic-analyzer'
      break
    case 'performance':
      currentProjectId.value = 'complex-circuit-simulation'
      break
  }
  
  // 记录测试结果
  addTestResult(scenarioId, true, `已切换到 ${getScenarioTitle(scenarioId)} 场景`)
}

const toggleDebugMode = () => {
  debugMode.value = !debugMode.value
  console.log('调试模式:', debugMode.value ? '开启' : '关闭')
}

const refreshSimulator = () => {
  console.log('刷新仿真器')
  if (wokwiRef.value) {
    wokwiRef.value.retryLoad()
  }
}

const onWokwiStateChange = (state: WokwiState) => {
  console.log('Wokwi 状态变化:', state)
  
  // 更新监控状态
  if (state.isLoaded) {
    connectionStatus.value = '已连接'
    connectionStatusClass.value = 'status-connected'
    loadTime.value = state.performance.loadTime
  } else {
    connectionStatus.value = '连接中'
    connectionStatusClass.value = 'status-connecting'
  }
  
  errorCount.value = state.errors.length
}

const onWokwiError = (error: WokwiError) => {
  console.error('Wokwi 错误:', error)
  connectionStatus.value = '连接失败'
  connectionStatusClass.value = 'status-error'
  
  addTestResult(
    currentScenario.value, 
    false, 
    `错误: ${error.message}`
  )
}

const getScenarioTitle = (scenarioId: TestScenario) => {
  const scenario = testScenarios.find(s => s.id === scenarioId)
  return scenario?.title || scenarioId
}

const getScenarioStatus = (scenarioId: TestScenario) => {
  const results = testResults.value.filter(r => r.scenario === scenarioId)
  if (results.length === 0) return '未测试'
  
  const lastResult = results[results.length - 1]
  return lastResult.success ? '通过' : '失败'
}

const getScenarioStatusClass = (scenarioId: TestScenario) => {
  const status = getScenarioStatus(scenarioId)
  switch (status) {
    case '通过': return 'status-success'
    case '失败': return 'status-error'
    default: return 'status-pending'
  }
}

const addTestResult = (scenario: TestScenario, success: boolean, message: string) => {
  testResults.value.push({
    scenario,
    success,
    message,
    timestamp: Date.now()
  })
}

// 生命周期
onMounted(() => {
  console.log('PoC 页面已加载')
  
  // 启动运行时间计时器
  const timer = setInterval(() => {
    uptime.value = Date.now() - startTime.value
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped>
.poc-page {
  @apply font-sans;
}

.poc-header {
  @apply border-b border-neon border-opacity-20;
}

.scenarios-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.scenario-card {
  @apply card-cyber cursor-pointer transition-all duration-300 hover:glow-neon;
}

.scenario-card.active {
  @apply border-cyber glow-pink;
}

.scenario-icon {
  @apply text-center mb-4;
}

.scenario-title {
  @apply text-lg font-bold text-primary mb-2;
}

.scenario-description {
  @apply text-sm text-secondary mb-4;
}

.scenario-status {
  @apply text-center;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-medium;
}

.status-success {
  @apply bg-green-900 text-green-300;
}

.status-error {
  @apply bg-red-900 text-red-300;
}

.status-pending {
  @apply bg-gray-900 text-gray-300;
}

.simulator-wrapper {
  @apply relative min-h-[600px];
}

.simulator-fallback {
  @apply w-full h-full min-h-[600px] flex-center;
}

.fallback-content {
  @apply w-full max-w-md;
}

.monitoring-grid {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.monitor-card {
  @apply text-center;
}

.monitor-title {
  @apply text-sm text-secondary mb-2;
}

.monitor-value {
  @apply text-xl font-bold text-primary flex-center gap-2;
}

.status-indicator {
  @apply w-3 h-3 rounded-full;
}

.status-connected {
  @apply bg-green-400;
}

.status-connecting {
  @apply bg-yellow-400 animate-pulse;
}

.status-disconnected {
  @apply bg-gray-400;
}

.status-error {
  @apply bg-red-400;
}

.results-container {
  @apply max-h-96 overflow-y-auto;
}

.results-list {
  @apply space-y-4 p-4;
}

.result-item {
  @apply border-l-4 border-neon border-opacity-30 pl-4 py-2;
}

.result-header {
  @apply items-start;
}

.result-scenario {
  @apply font-medium text-primary;
}

.result-status {
  @apply font-bold;
}

.result-message {
  @apply break-words;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scenarios-grid {
    @apply grid-cols-1;
  }
  
  .monitoring-grid {
    @apply grid-cols-2;
  }
  
  .controls {
    @apply flex-col gap-2;
  }
}
</style>