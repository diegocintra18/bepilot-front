<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'

const KIWIFY_CHECKOUT_URL = 'https://pay.kiwify.com.br/pNodtu8'

const route = useRoute()
const auth = useAuthStore()

const visible = computed(
  () => auth.needsSubscription && route.name !== 'subscription',
)

function redirectToCheckout() {
  window.location.assign(KIWIFY_CHECKOUT_URL)
}
</script>

<template>
  <div
    v-if="visible"
    class="flex w-full flex-wrap items-center justify-between gap-3 border-b border-secondary bg-secondary-container px-margin-mobile py-3 md:px-12"
    role="status"
  >
    <div class="flex min-w-0 flex-1 basis-64 items-center gap-2.5 font-body-md text-body-md text-on-secondary-container">
      <AppIcon name="info" class="shrink-0" :size="18" />
      <span>Sua assinatura não está ativa. Ative agora para liberar simulados ilimitados.</span>
    </div>
    <button
      type="button"
      class="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="redirectToCheckout"
    >
      <AppIcon name="credit-card" :size="18" />
      Assinar agora
    </button>
  </div>
</template>
