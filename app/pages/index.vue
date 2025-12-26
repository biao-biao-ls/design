<template>
  <div class="container-cyber py-16">
    <!-- 欢迎区域 -->
    <section class="text-center mb-16">
      <h1 class="text-cyber-title mb-6">
        欢迎来到 KNZN 硬件学习平台
      </h1>
      <p class="text-cyber-subtitle mb-8 max-w-2xl mx-auto">
        专业的硬件学习和仿真平台，支持 Arduino、ESP32 等硬件开发，
        集成 Wokwi 仿真器，提供完整的学习体验。
      </p>
      <div class="flex-center gap-4">
        <CyberButton variant="primary">
          开始学习
        </CyberButton>
        <CyberButton variant="default">
          <NuxtLink to="/unocss-demo">
            查看主题演示
          </NuxtLink>
        </CyberButton>
      </div>
    </section>

    <!-- 特性展示 -->
    <section class="grid md:grid-cols-3 gap-8 mb-16">
      <CyberCard hover-effect="pink">
        <template #header>
          <div class="flex-center mb-4">
            <div class="i-heroicons-cpu-chip text-4xl text-accent"></div>
          </div>
          <h3 class="text-xl font-semibold text-accent text-center">
            硬件仿真
          </h3>
        </template>
        <p class="text-secondary text-center">
          集成 Wokwi 仿真器，支持 Arduino、ESP32 等多种硬件平台的在线仿真。
        </p>
      </CyberCard>

      <CyberCard hover-effect="blue">
        <template #header>
          <div class="flex-center mb-4">
            <div class="i-heroicons-academic-cap text-4xl text-accent"></div>
          </div>
          <h3 class="text-xl font-semibold text-accent text-center">
            在线学习
          </h3>
        </template>
        <p class="text-secondary text-center">
          提供完整的硬件开发教程，从基础到进阶，循序渐进的学习路径。
        </p>
      </CyberCard>

      <CyberCard :glowing="true">
        <template #header>
          <div class="flex-center mb-4">
            <div class="i-heroicons-code-bracket text-4xl text-accent"></div>
          </div>
          <h3 class="text-xl font-semibold text-accent text-center">
            代码编辑
          </h3>
        </template>
        <p class="text-secondary text-center">
          内置代码编辑器，支持语法高亮、智能提示等现代开发功能。
        </p>
      </CyberCard>
    </section>

    <!-- 技术栈展示 -->
    <section class="text-center">
      <h2 class="text-2xl font-cyber text-accent mb-8">
        技术栈
      </h2>
      <div class="grid grid-cols-4 md:grid-cols-8 gap-6">
        <div class="flex-center flex-col">
          <div class="i-simple-icons-nuxtdotjs text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">Nuxt 4</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-vue-dot-js text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">Vue 3</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-typescript text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">TypeScript</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-unocss text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">UnoCSS</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-postgresql text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">PostgreSQL</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-drizzle text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">Drizzle ORM</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-docker text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">Docker</span>
        </div>
        <div class="flex-center flex-col">
          <div class="i-simple-icons-pinia text-3xl text-accent mb-2"></div>
          <span class="text-xs text-secondary">Pinia</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 页面元数据
useSeoMeta({
  title: 'KNZN 硬件学习平台 - 专业的硬件开发学习平台',
  description: '专业的硬件学习和仿真平台，支持 Arduino、ESP32 等硬件开发，集成 Wokwi 仿真器',
})
</script>