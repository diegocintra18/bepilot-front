<script setup>
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  id: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      :name="name"
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 pr-12 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
      @input="emit('update:modelValue', $event.target.value)"
    >
    <button
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-on-surface-variant transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <AppIcon :name="visible ? 'eye-off' : 'eye'" :size="20" />
    </button>
  </div>
</template>
