<template>
  <div class="bg-page min-h-screen p-8">
    <div class="container-cyber">
      <h1 class="text-cyber-title mb-8">
        图标测试页面
      </h1>
      
      <!-- Heroicons 测试 -->
      <section class="mb-8">
        <h2 class="text-xl text-accent mb-4">
          Heroicons 图标
        </h2>
        <div class="grid grid-cols-6 gap-4">
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-home text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">home</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-user text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">user</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-cog-6-tooth text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">settings</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-bell text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">bell</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-heart text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">heart</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-heroicons-star text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">star</p>
          </div>
        </div>
      </section>

      <!-- Simple Icons 测试 -->
      <section class="mb-8">
        <h2 class="text-xl text-accent mb-4">
          Simple Icons 图标
        </h2>
        <div class="grid grid-cols-6 gap-4">
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-vue-dot-js text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">Vue.js</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-nuxtdotjs text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">Nuxt</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-typescript text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">TypeScript</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-github text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">GitHub</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-docker text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">Docker</p>
          </div>
          <div class="card-dark text-center p-4">
            <div class="i-simple-icons-postgresql text-3xl text-accent mb-2" />
            <p class="text-xs text-secondary">PostgreSQL</p>
          </div>
        </div>
      </section>

      <!-- 返回按钮 -->
      <div class="text-center">
        <CyberButton @click="$router.back()">
          返回
        </CyberButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面元数据
useSeoMeta({
  title: '图标测试 - KNZN 平台',
  description: '测试 UnoCSS 图标系统是否正常工作',
})
</script>