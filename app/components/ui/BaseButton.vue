<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    v-bind="$attrs"
    @click="handleClick"
  >
    <Icon
      v-if="icon"
      :name="icon"
      class="w-4 h-4"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyber focus:ring-offset-2 focus:ring-offset-page'

  const variantClasses = {
    primary: 'bg-accent-cyber text-black hover:opacity-80',
    secondary: 'bg-card text-primary border border-neon hover:bg-accent-cyber hover:text-black',
    outline: 'border border-accent-cyber text-accent-cyber hover:bg-accent-cyber hover:text-black',
    ghost: 'text-primary hover:bg-card',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    disabledClasses,
  ].join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
