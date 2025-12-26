<template>
  <div class="min-h-screen bg-page">
    <!-- 导航栏 -->
    <AppHeader />

    <!-- 主要内容区域 -->
    <main>
      <slot />
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// 默认布局逻辑
</script>
