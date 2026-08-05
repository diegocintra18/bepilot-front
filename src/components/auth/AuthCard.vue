<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-lift">
    <h1 class="font-display-lg text-headline-md text-on-background">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-2 text-body-md text-on-surface-variant">
      {{ subtitle }}
    </p>
    <div class="mt-stack-lg">
      <slot />
    </div>
    <div v-if="$slots.footer" class="mt-stack-lg border-t border-outline-variant pt-stack-md text-center">
      <slot name="footer" />
    </div>
  </div>
</template>
