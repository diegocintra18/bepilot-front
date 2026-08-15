<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  history: {
    type: Array,
    default: () => [],
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

const isEmpty = computed(() => !props.isLoading && !props.error && props.history.length === 0)

const getOperationIcon = (type) => {
  const iconMap = {
    entrada: 'arrow-down-left',
    saida: 'arrow-up-right',
    adição: 'plus-circle',
    adicionado: 'plus-circle',
    remocao: 'minus-circle',
    removido: 'minus-circle',
    consumo: 'zap',
    consumido: 'zap',
  }
  return iconMap[type?.toLowerCase()] || 'minus-circle'
}

const getOperationColor = (type) => {
  if (['entrada', 'adição', 'adicionado', 'plus'].includes(type?.toLowerCase())) {
    return 'text-on-tertiary-fixed-variant'
  } else if (['saida', 'remocao', 'removido', 'consumo', 'consumido'].includes(type?.toLowerCase())) {
    return 'text-on-secondary-container'
  }
  return 'text-on-surface-variant'
}

const getOperationBg = (type) => {
  if (['entrada', 'adição', 'adicionado', 'plus'].includes(type?.toLowerCase())) {
    return 'bg-tertiary-fixed'
  } else if (['saida', 'remocao', 'removido', 'consumo', 'consumido'].includes(type?.toLowerCase())) {
    return 'bg-secondary-container'
  }
  return 'bg-surface-variant'
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateString
  }
}
</script>

<template>
  <div class="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lift">
    <div class="border-b border-outline-variant px-6 py-4">
      <h3 class="text-headline-md font-title-lg text-on-surface">Histórico de Movimentações</h3>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="divide-y divide-outline-variant">
      <div v-for="i in 3" :key="i" class="space-y-2 border-b border-outline-variant p-4">
        <div class="h-4 w-24 animate-pulse rounded bg-outline-variant"></div>
        <div class="h-3 w-32 animate-pulse rounded bg-outline-variant"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-start gap-3 p-6 text-on-error-container">
      <AppIcon name="alert-circle" size="md" class="flex-shrink-0" />
      <div>
        <p class="mb-1 font-title-sm text-error">Erro ao carregar histórico</p>
        <p class="text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="p-12 text-center">
      <AppIcon name="inbox" size="xl" class="mx-auto mb-4 text-on-surface-variant opacity-50" />
      <p class="text-on-surface-variant">Nenhuma movimentação de créditos ainda.</p>
    </div>

    <!-- History List -->
    <div v-else class="divide-y divide-outline-variant">
      <div v-for="item in history" :key="item.id" class="flex flex-col gap-3 p-4 hover:bg-surface-variant/50 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-1 items-start gap-3">
          <div :class="['rounded-full p-2', getOperationBg(item.type)]">
            <AppIcon :name="getOperationIcon(item.type)" :class="getOperationColor(item.type)" size="md" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="break-words font-title-sm text-on-surface">{{ item.type }}</p>
            <p v-if="item.description" class="break-words text-sm text-on-surface-variant">{{ item.description }}</p>
            <p class="text-xs text-on-surface-variant">{{ formatDate(item.createdAt || item.date) }}</p>
          </div>
        </div>
        <div class="flex flex-col items-start gap-1 sm:items-end">
          <span :class="['font-title-md', getOperationColor(item.type)]">
            {{ item.type?.toLowerCase().includes('entrada') || item.type?.toLowerCase().includes('adicion') ? '+' : '-' }}
            {{ Math.abs(item.amount).toLocaleString('pt-BR') }}
          </span>
          <p v-if="item.balance !== undefined" class="text-xs text-on-surface-variant">
            Saldo: {{ item.balance.toLocaleString('pt-BR') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
