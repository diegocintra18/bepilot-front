<script setup>
import { onMounted, watch } from 'vue'
import { useAiCreditsStore } from '@/stores/aiCredits'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import AiCreditsHistory from '@/components/aiCredits/AiCreditsHistory.vue'
import AiCreditsSummaryTable from '@/components/aiCredits/AiCreditsSummaryTable.vue'

const store = useAiCreditsStore()

// TODO: Substituir a URL do pagamento quando definida.
const PAYMENT_URL = 'https://wa.me/5516991353306'

onMounted(async () => {
  await store.fetchBalance()
  await store.fetchHistory()
})

// Auto-clear error after 5 seconds
watch(
  () => store.errorHistory,
  () => {
    if (store.errorHistory) {
      setTimeout(() => {
        // keeps errorHistory scoped to history UI
        store.clearHistoryError()
      }, 5000)
    }
  },
)
</script>

<template>
  <AppLayout title="Créditos de IA">
    <div class="space-y-stack-lg">
      <!-- Header -->
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface">Créditos de IA</h2>
          <p class="text-body-md font-body-md text-on-surface-variant">
            Acompanhe seu saldo de créditos e histórico de movimentações.
          </p>
        </div>

        <div class="flex justify-end">
          <a
            :href="PAYMENT_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <AppIcon name="credit-card" :size="20" />
            Comprar créditos
          </a>
        </div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <AiCreditsSummaryTable
          :snapshot="{ plan: store.plan, aiCreditsLimit: store.aiCreditsLimit, aiCreditsRemaining: store.balance }"
        />

        <!-- Info Section -->
        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <h3 class="mb-3 text-headline-sm font-headline-sm text-on-surface">O que são créditos de IA?</h3>
          <p class="text-sm text-on-surface-variant">
            Créditos de IA são utilizados para gerar análises personalizadas de seu desempenho, incluindo planos de
            estudo adaptados com base em suas respostas. Cada análise consome um crédito.
          </p>
        </section>
      </div>

      <!-- History Section -->
      <AiCreditsHistory
        :history="store.history"
        :is-loading="store.isLoadingHistory"
        :error="store.errorHistory"
      />

      <!-- Tips Section -->
      <section class="rounded-xl border border-outline-variant bg-secondary-container-fixed p-6 shadow-lift">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
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
