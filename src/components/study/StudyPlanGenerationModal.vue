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
        A IA irá analisar seu desempenho neste simulado, identificando os conteúdos que precisam ser reforçados e os pontos em que você apresentou maior dificuldade.
      </p>

      <div v-if="credits.plan === 'limited'">
        <p class="mb-2">Esta análise utilizará 1 crédito de IA.</p>
        <p class="mb-4">Créditos disponíveis: {{ credits.aiCreditsRemaining }}</p>
      </div>

      <div v-else>
        <p class="mb-4">Seu plano possui créditos de IA ilimitados.</p>
      </div>

      <div class="flex justify-end gap-4">
        <button
          class="btn btn-outlined"
          @click="$emit('close')"
          :disabled="loading"
          aria-label="Cancelar geração do plano"
        >
          Cancelar
        </button>
        <button
          class="btn btn-primary"
          @click="onGenerate"
          :disabled="loading"
          aria-label="Confirmar geração do plano"
        >
          <span v-if="loading" aria-live="polite">Gerando...</span>
          <span v-else>Gerar plano</span>
        </button>
      </div>

      <p v-if="error" class="text-error mt-3" role="alert" aria-live="assertive">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ visible: Boolean, credits: Object })
const emit = defineEmits(['close', 'generate'])

const loading = ref(false)
const error = ref('')

async function onGenerate() {
  loading.value = true
  error.value = ''
  try {
    await emit('generate')
  } catch (err) {
    error.value = err.message || 'Não foi possível gerar seu plano de estudos.'
  } finally {
    loading.value = false
  }
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
