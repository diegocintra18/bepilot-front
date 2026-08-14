<script setup>
import { onMounted, watch } from 'vue'
import { useAiCreditsStore } from '@/stores/aiCredits'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import AiCreditsBalance from '@/components/aiCredits/AiCreditsBalance.vue'
import AiCreditsHistory from '@/components/aiCredits/AiCreditsHistory.vue'

const store = useAiCreditsStore()

const handleRefresh = async () => {
  await store.fetchBalance()
}

onMounted(async () => {
  await store.fetchBalance()
})

// Auto-clear error after 5 seconds
watch(
  () => store.error,
  () => {
    if (store.error) {
      setTimeout(() => {
        store.clearError()
      }, 5000)
    }
  },
)
</script>

<template>
  <AppLayout title="Créditos de IA">
    <div class="space-y-6">
      <!-- Header -->
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface">Créditos de IA</h2>
          <p class="text-body-md font-body-md text-on-surface-variant">
            Acompanhe seu saldo de créditos e histórico de movimentações.
          </p>
        </div>
      </section>

      <!-- Balance Card -->
      <AiCreditsBalance
        :balance="store.balance"
        :is-loading="store.isLoading"
        :error="store.error"
        @refresh="handleRefresh"
      />

      <!-- Info Section -->
      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <h3 class="mb-3 text-headline-sm font-headline-sm text-on-surface">O que são créditos de IA?</h3>
        <p class="text-sm text-on-surface-variant">
          Créditos de IA são utilizados para gerar análises personalizadas de seu desempenho, incluindo planos de
          estudo adaptados com base em suas respostas. Cada análise consome um crédito.
        </p>
      </section>

      <!-- History Section -->
      <AiCreditsHistory
        :history="[]"
        :is-loading="false"
        error=""
      />

      <!-- Tips Section -->
      <section class="rounded-xl border border-outline-variant bg-secondary-container-fixed p-6">
        <div class="flex gap-3">
          <AppIcon name="lightbulb" size="lg" class="flex-shrink-0 text-on-secondary-container" />
          <div>
            <h4 class="mb-1 font-title-md text-on-secondary-container">Dica</h4>
            <p class="text-sm text-on-secondary-container">
              Use créditos de IA com sabedoria! Cada análise oferece insights valiosos para seu desempenho.
            </p>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
