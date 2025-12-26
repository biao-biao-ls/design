<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-primary"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-400"
      >*</span>
    </label>

    <input
      :id="inputId"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      v-bind="$attrs"
    >

    <p
      v-if="error"
      class="text-sm text-red-400"
    >
      {{ error }}
    </p>

    <p
      v-else-if="hint"
      class="text-sm text-secondary"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value),
})

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const baseClasses = 'w-full px-3 py-2 bg-card border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-cyber focus:border-transparent transition-all duration-200'

  const stateClasses = props.error
    ? 'border-red-400 focus:ring-red-400'
    : 'border-neon'

  const disabledClasses = props.disabled
    ? 'opacity-50 cursor-not-allowed'
    : ''

  return [baseClasses, stateClasses, disabledClasses].join(' ')
})
</script>
