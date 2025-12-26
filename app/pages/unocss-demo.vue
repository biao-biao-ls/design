<template>
  <div class="bg-page min-h-screen">
    <!-- 页面头部 -->
    <header class="container-cyber py-8">
      <h1 class="text-cyber-title text-center mb-4">
        KNZN UnoCSS 赛博朋克主题演示
      </h1>
      <p class="text-cyber-subtitle text-center">
        展示 UnoCSS 集成和赛博朋克主题样式
      </p>
    </header>

    <!-- 主要内容区域 -->
    <main class="container-cyber space-y-12 pb-16">
      <!-- 颜色展示区域 -->
      <section>
        <h2 class="text-2xl font-cyber text-accent mb-6">
          主题色彩
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card-dark text-center">
            <div class="w-full h-16 bg-cyber-neon mb-3 rounded" />
            <p class="text-sm">
              霓虹绿 (#00FFC2)
            </p>
          </div>
          <div class="card-dark text-center">
            <div class="w-full h-16 bg-cyber-pink mb-3 rounded" />
            <p class="text-sm">
              霓虹粉 (#FF0080)
            </p>
          </div>
          <div class="card-dark text-center">
            <div class="w-full h-16 bg-cyber-blue mb-3 rounded" />
            <p class="text-sm">
              霓虹蓝 (#0080FF)
            </p>
          </div>
          <div class="card-dark text-center">
            <div class="w-full h-16 bg-cyber-purple mb-3 rounded" />
            <p class="text-sm">
              霓虹紫 (#8000FF)
            </p>
          </div>
        </div>
      </section>

      <!-- 按钮组件展示 -->
      <section>
        <h2 class="text-2xl font-cyber text-accent mb-6">
          按钮组件
        </h2>
        <div class="flex flex-wrap gap-4">
          <CyberButton variant="default">
            默认按钮
          </CyberButton>
          <CyberButton variant="primary">
            主要按钮
          </CyberButton>
          <CyberButton variant="secondary">
            次要按钮
          </CyberButton>
          <CyberButton variant="info">
            信息按钮
          </CyberButton>
          <CyberButton disabled>
            禁用按钮
          </CyberButton>
        </div>
      </section>

      <!-- 卡片组件展示 -->
      <section>
        <h2 class="text-2xl font-cyber text-accent mb-6">
          卡片组件
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CyberCard>
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                基础卡片
              </h3>
            </template>
            <p class="text-secondary">
              这是一个基础的赛博朋克风格卡片组件，具有霓虹边框和悬停效果。
            </p>
          </CyberCard>

          <CyberCard :glowing="true">
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                发光卡片
              </h3>
            </template>
            <p class="text-secondary">
              这个卡片具有持续的霓虹发光效果，适合突出重要内容。
            </p>
          </CyberCard>

          <CyberCard hover-effect="pink">
            <template #header>
              <h3 class="text-lg font-semibold text-accent">
                悬停效果卡片
              </h3>
            </template>
            <p class="text-secondary">
              悬停时会显示粉色霓虹效果，增强交互体验。
            </p>
            <template #footer>
              <CyberButton
                variant="secondary"
                class="w-full"
              >
                查看详情
              </CyberButton>
            </template>
          </CyberCard>
        </div>
      </section>

      <!-- 图标展示 -->
      <section>
        <h2 class="text-2xl font-cyber text-accent mb-6">
          图标系统
        </h2>
        <div class="grid grid-cols-4 md:grid-cols-8 gap-4">
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-home text-2xl text-accent mb-2" />
            <p class="text-xs text-secondary">
              首页
            </p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-user text-2xl text-accent mb-2" />
            <p class="text-xs text-secondary">
              用户
            </p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-cog-6-tooth text-2xl text-accent mb-2" />
            <p class="text-xs text-secondary">
              设置
            </p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-bell text-2xl text-accent mb-2" />
            <p class="text-xs text-secondary">
              通知
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- 页面底部 -->
    <footer class="container-cyber py-8 border-t border-neon border-opacity-30">
      <div class="text-center">
        <p class="text-secondary">
          KNZN 硬件学习平台 - UnoCSS 赛博朋克主题演示
        </p>
        <div class="flex-center gap-4 mt-4">
          <CyberButton
            variant="default"
            @click="scrollToTop"
          >
            返回顶部
          </CyberButton>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 页面元数据
useSeoMeta({
  title: 'UnoCSS 主题演示 - KNZN 平台',
  description: '展示 KNZN 平台的 UnoCSS 赛博朋克主题样式和组件',
})

// 滚动到顶部功能
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>