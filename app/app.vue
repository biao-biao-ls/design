<template>
  <div class="min-h-screen bg-page text-primary">
    <!-- 全局布局容器 -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- 全局加载指示器 -->
    <NuxtLoadingIndicator />
  </div>
</template>

<script setup lang="ts">
// 全局 SEO 配置
useSeoMeta({
  title: 'KNZN 硬件学习平台',
  description: '专业的硬件学习和仿真平台，支持 Arduino、ESP32 等硬件开发',
  ogTitle: 'KNZN 硬件学习平台',
  ogDescription: '专业的硬件学习和仿真平台，支持 Arduino、ESP32 等硬件开发',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})

// 全局错误处理
onErrorCaptured((error) => {
  console.error('全局错误捕获:', error)
  return false
})
</script>

<style>
/* 全局样式将在 assets/css/main.css 中定义 */
</style>
