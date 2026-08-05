<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div>
    <label :for="name" class="mb-stack-sm block font-button-text text-button-text text-on-surface">
      {{ label }}
    </label>
    <slot :id="name" :error="error" />
    <p
      v-if="error"
      :id="`${name}-error`"
      role="alert"
      class="mt-stack-sm text-body-md font-medium text-error"
    >
      {{ error }}
    </p>
  </div>
</template>
