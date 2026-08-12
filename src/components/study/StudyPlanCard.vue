<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
const { plan } = defineProps({ plan: Object })
const router = useRouter()

function openPlan() {
  router.push({ name: 'study-plan-detail', params: { id: plan.id } })
}
</script>

<template>
  <div class="rounded-lg border border-outline-variant p-4 bg-surface-container">
    <h3 class="font-bold text-on-surface">Plano de Estudos</h3>
    <p class="text-sm text-on-surface-variant">Simulado: {{ plan.simulation?.name || `#${plan.simulationId}` }}</p>
    <p class="text-sm text-on-surface-variant">Gerado em: {{ plan.generatedAt || plan.createdAt }}</p>
    <p class="mt-2 text-sm">{{ plan.errorsCount || 0 }} erros para reforçar • {{ plan.attentionPointsCount || 0 }} pontos de atenção</p>
    <div class="mt-4 text-right">
      <button type="button" class="rounded-lg bg-primary px-3 py-2 text-button-text text-on-primary" @click="openPlan">
        <AppIcon name="eye" :size="16" />
        <span class="ml-2">Visualizar plano</span>
      </button>
    </div>
  </div>
</template>
