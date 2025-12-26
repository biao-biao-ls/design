<template>
  <button
    :class="[
      'btn-cyber',
      {
        'btn-primary': variant === 'primary',
        'glow-pink': variant === 'secondary',
        'glow-blue': variant === 'info',
      }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'info'
  disabled?: boolean
}

defineProps<Props>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
/* 组件特定样式可以在这里添加 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

button:disabled:hover {
  box-shadow: none !important;
  text-shadow: none !important;
}
</style>