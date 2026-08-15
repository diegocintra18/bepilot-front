<script setup>
import { computed } from 'vue'

const props = defineProps({
  snapshot: {
    type: Object,
    default: () => ({}),
  },
})

const planBalance = computed(() => {
  // Unlimited plans don't have a numeric limit.
  if (props.snapshot?.aiCreditsLimit === null || props.snapshot?.aiCreditsLimit === undefined) return 'Ilimitado'
  return Number(props.snapshot.aiCreditsLimit).toLocaleString('pt-BR')
})

const availableBalance = computed(() => {
  if (props.snapshot?.aiCreditsRemaining === null || props.snapshot?.aiCreditsRemaining === undefined) return 'Ilimitado'
  return Number(props.snapshot.aiCreditsRemaining).toLocaleString('pt-BR')
})
</script>

<template>
  <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
    <h3 class="mb-4 text-headline-md font-title-lg text-on-surface">Créditos de IA</h3>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-outline-variant bg-surface-variant text-left">
          <tr>
            <th class="px-2 py-3 font-title-sm text-on-surface">Saldo padrão do plano</th>
            <th class="px-2 py-3 font-title-sm text-on-surface">Saldo disponível</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          <tr>
            <td class="px-2 py-4">{{ planBalance }}</td>
            <td class="px-2 py-4">{{ availableBalance }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
