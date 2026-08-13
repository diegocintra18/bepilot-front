<template>
  <article class="border rounded p-4 shadow hover:shadow-lg transition cursor-pointer" @click="viewPlan">
    <h2 class="text-lg font-semibold mb-2">Plano de Estudos</h2>
    <p class="mb-1 font-semibold">Simulado {{ plan.simulationName || plan.simulationId }}</p>
    <p class="mb-1">Gerado em: {{ formattedDate }}</p>
    <p class="mb-1">{{ plan.content.errors.length }} erros para reforçar</p>
    <p class="mb-4">{{ plan.content.attentionPoints.length }} pontos de atenção</p>
    <button @click.stop="viewPlan" class="btn btn-primary">Visualizar plano</button>
  </article>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({ plan: Object })
const emit = defineEmits(['viewPlan'])

const formattedDate = computed(() => {
  if (!props.plan || !props.plan.generatedAt) return 'Data não disponível'
  return new Date(props.plan.generatedAt).toLocaleDateString('pt-BR')
})

function viewPlan() {
  emit('viewPlan', props.plan.id)
}
</script>

<style scoped>
.btn-primary {
  background-color: #2563EB;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #1D4ED8;
}
</style>
