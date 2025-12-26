<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="bg-card border border-neon p-8 rounded-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">
        登录 KNZN
      </h1>

      <!-- OAuth 登录按钮 -->
      <div class="space-y-4">
        <button
          class="w-full bg-white text-black py-3 px-4 rounded-lg font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          @click="signInWithGoogle"
        >
          <Icon name="simple-icons:google" />
          使用 Google 登录
        </button>

        <button
          class="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          @click="signInWithGitHub"
        >
          <Icon name="simple-icons:github" />
          使用 GitHub 登录
        </button>
      </div>

      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="text-accent-cyber hover:underline"
        >
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面 SEO
useSeoMeta({
  title: '登录 - KNZN 硬件学习平台',
  description: '登录您的 KNZN 账户，开始硬件学习之旅',
})

// 登录方法（将在认证系统实现后完善）
const signInWithGoogle = () => {
  console.log('Google 登录功能将在认证系统实现后启用')
}

const signInWithGitHub = () => {
  console.log('GitHub 登录功能将在认证系统实现后启用')
}
</script>
