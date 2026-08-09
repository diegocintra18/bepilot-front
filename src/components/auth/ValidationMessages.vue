<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'error',
  },
})

const classes = computed(() =>
  props.variant === 'success'
    ? 'bg-tertiary-container text-on-tertiary-container'
    : 'bg-error-container text-on-error-container',
)
</script>

<template>
  <p
    v-if="message"
    role="alert"
    class="rounded-lg px-4 py-3 font-body-md text-body-md"
    :class="classes"
  >
    {{ message }}
  </p>
</template>
