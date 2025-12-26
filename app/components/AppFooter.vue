<template>
  <footer class="bg-card border-t border-neon mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 品牌信息 -->
        <div>
          <div class="text-accent-cyber text-xl font-bold mb-4">
            KNZN
          </div>
          <p class="text-secondary text-sm">
            专业的硬件学习和仿真平台
          </p>
        </div>

        <!-- 学习资源 -->
        <div>
          <h3 class="text-primary font-semibold mb-4">
            学习资源
          </h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/tutorials"
                class="text-secondary hover:text-accent-cyber"
              >教程</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/examples"
                class="text-secondary hover:text-accent-cyber"
              >示例</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/docs"
                class="text-secondary hover:text-accent-cyber"
              >文档</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 社区 -->
        <div>
          <h3 class="text-primary font-semibold mb-4">
            社区
          </h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/forum"
                class="text-secondary hover:text-accent-cyber"
              >论坛</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/projects"
                class="text-secondary hover:text-accent-cyber"
              >项目展示</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/events"
                class="text-secondary hover:text-accent-cyber"
              >活动</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 支持 -->
        <div>
          <h3 class="text-primary font-semibold mb-4">
            支持
          </h3>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink
                to="/help"
                class="text-secondary hover:text-accent-cyber"
              >帮助中心</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="text-secondary hover:text-accent-cyber"
              >联系我们</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/privacy"
                class="text-secondary hover:text-accent-cyber"
              >隐私政策</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-neon mt-8 pt-8 text-center text-sm text-secondary">
        <p>&copy; 2024 KNZN 硬件学习平台. 保留所有权利.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 页脚组件逻辑
</script>
