<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'

const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['refresh'])

const displayBalance = computed(() => {
  if (props.isLoading) return '—'
  return props.balance.toLocaleString('pt-BR')
})

const handleRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <AppIcon name="zap" class="text-primary" size="xl" />
        <div>
          <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Saldo de Créditos IA</p>
          <h4 v-if="!isLoading && !error" class="font-display-lg text-headline-lg text-on-surface">
            {{ displayBalance }}
          </h4>
          <div v-else-if="isLoading" class="h-10 w-24 animate-pulse rounded bg-outline-variant"></div>
          <p v-else class="text-sm text-error">{{ error }}</p>
        </div>
      </div>
      <SubmitButton
        :loading="isLoading"
        :disabled="isLoading"
        class="!p-2"
        @click="handleRefresh"
        title="Atualizar saldo"
      >
        <AppIcon name="refresh-cw" size="md" />
      </SubmitButton>
    </div>

    <div v-if="error" class="flex items-start gap-2 rounded bg-error-container p-3 text-sm text-on-error-container">
      <AppIcon name="alert-circle" size="sm" class="mt-0.5 flex-shrink-0" />
      <button @click="handleRefresh" class="underline hover:no-underline">
        Clique aqui para tentar novamente
      </button>
    </div>
  </section>
</template>
