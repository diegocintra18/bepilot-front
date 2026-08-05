<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <p
    v-if="message"
    role="alert"
    class="rounded-lg bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container"
  >
    {{ message }}
  </p>
</template>
