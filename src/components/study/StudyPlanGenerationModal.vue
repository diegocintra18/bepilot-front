<template>
  <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
    <div
      class="modal-content rounded-lg bg-surface-container-low p-6 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="modalDesc"
    >
      <h2 id="modalTitle" class="font-headline-md text-headline-md mb-3">Gerar plano de estudos?</h2>
      <p id="modalDesc" class="mb-4">
        A nossa IA vai analisar os seus erros, e as perguntas em que você teve mais dificuldade para criar um plano de estudos personalizado para aumentar o seu desempenho.
      </p>

    <div v-if="credits.plan === 'limited'">
        <p class="mb-2">Esta análise utilizará 1 crédito de IA.</p>
        <p class="mb-4">Créditos disponíveis: {{ credits.aiCreditsRemaining }}</p>

        <!-- Insufficient Credits Warning -->
        <div
          v-if="!canGenerate"
          class="mb-4 flex items-start gap-3 rounded bg-warning-container p-3 text-warning"
        >
          <span class="text-xl">⚠️</span>
          <p class="text-sm">
            Você não possui créditos suficientes para gerar um plano de estudos. Compre mais créditos para continuar.
          </p>
        </div>
      </div>

      <div v-else>
        <p class="mb-4">Seu plano possui créditos de IA ilimitados.</p>
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          class="flex items-center justify-center rounded-lg border-2 border-primary bg-surface-container-lowest px-5 py-2.5 font-button-text text-button-text text-primary transition-colors hover:bg-primary-fixed disabled:opacity-60"
          @click="$emit('close')"
          :disabled="loading"
          aria-label="Cancelar geração do plano"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
          @click="onGenerate"
          :disabled="loading || !canGenerate"
          :title="!canGenerate ? 'Créditos insuficientes' : 'Gerar plano de estudos'"
          aria-label="Confirmar geração do plano"
        >
          <span v-if="loading" aria-live="polite">Gerando...</span>
          <span v-else>{{ canGenerate ? 'Gerar plano' : 'Créditos insuficientes' }}</span>
        </button>
      </div>

    <p v-if="errorMessage" class="text-error mt-3" role="alert" aria-live="assertive">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  credits: Object,
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['close', 'generate'])

const canGenerate = computed(() => {
  // Se plano é ilimitado, sempre pode gerar
  if (props.credits?.plan === 'unlimited') {
    return true
  }
  // Se plano é limitado, verifica se tem pelo menos 1 crédito
  return (props.credits?.aiCreditsRemaining ?? 0) >= 1
})

async function onGenerate() {
  if (!canGenerate.value) return
  emit('generate')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.4);
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  width: 400px;
  max-width: 90vw;
  outline: none;
}
.btn-outlined {
  background: transparent;
  border: 2px solid var(--md-sys-color-primary);
  color: var(--md-sys-color-primary);
  padding: 4px 12px;
  border-radius: 6px;
}
.btn-primary {
  background-color: var(--md-sys-color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
}
.text-error {
  color: var(--md-sys-color-error);
}
</style>
