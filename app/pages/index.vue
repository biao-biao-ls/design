<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 欢迎页面 -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-accent-cyber mb-4">
        欢迎来到 KNZN 硬件学习平台
      </h1>
      <p class="text-xl text-secondary mb-8">
        专业的硬件学习和仿真平台，支持 Arduino、ESP32 等硬件开发
      </p>

      <!-- 功能特性 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="bg-card border border-neon p-6 rounded-lg">
          <div class="text-accent-cyber text-2xl mb-4">
            🔧
          </div>
          <h3 class="text-lg font-semibold mb-2">
            硬件仿真
          </h3>
          <p class="text-secondary">
            支持多种硬件平台的在线仿真，无需实体硬件即可学习
          </p>
        </div>

        <div class="bg-card border border-neon p-6 rounded-lg">
          <div class="text-accent-cyber text-2xl mb-4">
            📚
          </div>
          <h3 class="text-lg font-semibold mb-2">
            学习资源
          </h3>
          <p class="text-secondary">
            丰富的教程、示例代码和项目案例
          </p>
        </div>

        <div class="bg-card border border-neon p-6 rounded-lg">
          <div class="text-accent-cyber text-2xl mb-4">
            👥
          </div>
          <h3 class="text-lg font-semibold mb-2">
            社区交流
          </h3>
          <p class="text-secondary">
            与其他开发者分享经验，共同学习成长
          </p>
        </div>
      </div>

      <!-- 快速开始按钮 -->
      <div class="mt-12">
        <NuxtLink
          to="/auth/login"
          class="inline-block bg-accent-cyber text-black px-8 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
        >
          开始学习
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面 SEO
useSeoMeta({
  title: '首页 - KNZN 硬件学习平台',
  description: '开始您的硬件学习之旅，掌握 Arduino、ESP32 等硬件开发技能',
})
</script>
