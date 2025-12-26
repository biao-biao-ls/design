<template>
  <div class="bg-page min-h-screen p-8">
    <div class="container-cyber">
      <h1 class="text-cyber-title mb-8">
        组件测试页面
      </h1>
      
      <!-- 测试按钮组件 -->
      <section class="mb-8">
        <h2 class="text-xl text-accent mb-4">
          按钮测试
        </h2>
        <div class="flex gap-4">
          <CyberButton @click="showMessage('默认按钮被点击')">
            默认按钮
          </CyberButton>
          <CyberButton 
            variant="primary" 
            @click="showMessage('主要按钮被点击')"
          >
            主要按钮
          </CyberButton>
        </div>
      </section>

      <!-- 测试卡片组件 -->
      <section class="mb-8">
        <h2 class="text-xl text-accent mb-4">
          卡片测试
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <CyberCard>
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                测试卡片 1
              </h3>
            </template>
            <p class="text-secondary">
              这是一个测试卡片，用于验证组件是否正常工作。
            </p>
          </CyberCard>
          
          <CyberCard :glowing="true">
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                发光卡片
              </h3>
            </template>
            <p class="text-secondary">
              这个卡片具有发光效果。
            </p>
          </CyberCard>
        </div>
      </section>

      <!-- 消息显示 -->
      <section v-if="message" class="mb-8">
        <CyberCard class="bg-cyber-neon bg-opacity-10">
          <p class="text-accent">
            {{ message }}
          </p>
        </CyberCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 响应式数据
const message = ref<string>('')

// 显示消息函数
const showMessage = (msg: string) => {
  message.value = msg
  // 3秒后清除消息
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 页面元数据
useSeoMeta({
  title: '组件测试 - KNZN 平台',
  description: '测试 UnoCSS 主题组件是否正常工作',
})
</script>