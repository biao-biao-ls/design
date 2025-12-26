<template>
  <div class="bg-page min-h-screen p-8">
    <div class="container-cyber">
      <h1 class="text-cyber-title mb-8">
        组件导入测试
      </h1>
      
      <div class="space-y-4">
        <!-- 测试 CyberButton 组件 -->
        <div>
          <h2 class="text-xl text-accent mb-4">
            CyberButton 测试
          </h2>
          <CyberButton variant="primary" @click="handleClick">
            点击测试
          </CyberButton>
        </div>

        <!-- 测试 CyberCard 组件 -->
        <div>
          <h2 class="text-xl text-accent mb-4">
            CyberCard 测试
          </h2>
          <CyberCard>
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                测试卡片
              </h3>
            </template>
            <p class="text-secondary">
              这是一个测试卡片，用于验证组件是否正常导入和工作。
            </p>
          </CyberCard>
        </div>

        <!-- 显示点击结果 -->
        <div v-if="message" class="mt-4">
          <div class="bg-cyber-neon bg-opacity-10 border border-neon p-4 rounded">
            <p class="text-accent">
              {{ message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 响应式数据
const message = ref<string>('')

// 处理点击事件
const handleClick = () => {
  message.value = '✅ CyberButton 组件工作正常！'
  
  // 3秒后清除消息
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 页面元数据
useSeoMeta({
  title: '组件测试 - KNZN 平台',
  description: '测试组件自动导入是否正常工作',
})
</script>