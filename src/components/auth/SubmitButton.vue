<script setup>
defineProps({
  type: {
    type: String,
    default: 'submit',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <span
      v-if="loading"
      class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
      role="status"
      aria-label="Carregando"
    />
    <slot>{{ loading ? 'Carregando…' : 'Enviar' }}</slot>
  </button>
</template>
