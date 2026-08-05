<script setup>
import AuthCard from './AuthCard.vue'

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
  <div class="flex min-h-screen flex-col items-center justify-center bg-canvas px-margin-mobile py-12">
    <img
      src="/logo-site.png"
      alt="Vou ser Piloto"
      class="mb-stack-lg h-14 w-auto"
    >
    <AuthCard :title="title" :subtitle="subtitle">
      <slot />
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </AuthCard>
    <p class="mt-stack-lg text-body-md text-on-surface-variant">
      Vou ser Piloto — Preparação para exames da ANAC
    </p>
  </div>
</template>
