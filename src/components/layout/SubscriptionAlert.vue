<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const visible = computed(
  () => auth.needsSubscription && route.name !== 'subscription',
)

function goToSubscription() {
  router.push({ name: 'subscription' })
}
</script>

<template>
  <div
    v-if="visible"
    class="flex flex-wrap items-center justify-between gap-3 border-b border-primary bg-primary-fixed px-margin-mobile py-3 md:px-12"
    role="status"
  >
    <div class="flex min-w-0 items-center gap-2.5 font-body-md text-body-md text-on-primary-fixed-variant">
      <AppIcon name="info" class="shrink-0" :size="18" />
      <span class="truncate">
        Sua assinatura não está ativa. Ative agora para liberar simulados ilimitados.
      </span>
    </div>
    <button
      type="button"
      class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="goToSubscription"
    >
      <AppIcon name="credit-card" :size="18" />
      Assinar agora
    </button>
  </div>
</template>
