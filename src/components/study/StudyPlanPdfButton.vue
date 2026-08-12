<script setup>
import { ref } from 'vue'
import { generateStudyPlanPdf } from '@/utils/pdf'
const props = defineProps({ plan: Object })
const loading = ref(false)

async function downloadPdf() {
  loading.value = true
  try {
    await generateStudyPlanPdf(props.plan, { filename: `plano-de-estudos-${props.plan.simulationId || props.plan.id}` })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="rounded-lg bg-primary px-4 py-2 text-button-text text-on-primary"
    :disabled="loading"
    @click="downloadPdf"
  >
    <span v-if="!loading">Baixar plano em PDF</span>
    <span v-else>Gerando PDF...</span>
  </button>
</template>
