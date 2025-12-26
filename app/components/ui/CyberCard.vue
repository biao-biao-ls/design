<template>
  <div
    :class="[
      'card-cyber',
      {
        'glow-neon': glowing,
        'hover:glow-pink': hoverEffect === 'pink',
        'hover:glow-blue': hoverEffect === 'blue',
      }
    ]"
  >
    <header v-if="$slots.header" class="mb-4 pb-4 border-b border-neon/30">
      <slot name="header" />
    </header>
    
    <main>
      <slot />
    </main>
    
    <footer v-if="$slots.footer" class="mt-4 pt-4 border-t border-neon/30">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  glowing?: boolean
  hoverEffect?: 'default' | 'pink' | 'blue'
}

withDefaults(defineProps<Props>(), {
  glowing: false,
  hoverEffect: 'default',
})
</script>