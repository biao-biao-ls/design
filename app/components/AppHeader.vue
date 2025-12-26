<template>
  <header class="bg-card border-b border-neon">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <div class="text-accent-cyber text-2xl font-bold">KNZN</div>
        </NuxtLink>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-primary hover:text-accent-cyber transition-colors"
          >
            首页
          </NuxtLink>
          <NuxtLink
            to="/learn"
            class="text-primary hover:text-accent-cyber transition-colors"
          >
            学习
          </NuxtLink>
          <NuxtLink
            to="/simulator"
            class="text-primary hover:text-accent-cyber transition-colors"
          >
            仿真器
          </NuxtLink>
          <NuxtLink
            to="/community"
            class="text-primary hover:text-accent-cyber transition-colors"
          >
            社区
          </NuxtLink>
        </nav>

        <!-- 用户菜单 -->
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/auth/login"
            class="bg-accent-cyber text-black px-4 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
          >
            登录
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 头部组件逻辑
</script>
