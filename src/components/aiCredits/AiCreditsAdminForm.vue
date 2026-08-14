<script setup>
import { ref, computed } from 'vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import FormField from '@/components/auth/FormField.vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      id: null,
      fullName: 'Usuário',
      currentBalance: 0,
    }),
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

const emit = defineEmits(['add-credits', 'remove-credits', 'clear-error'])

const operation = ref('add')
const amount = ref('')
const reason = ref('')
const showConfirm = ref(false)
const operationToConfirm = ref(null)

const isFormValid = computed(() => {
  const amt = Number(amount.value)
  return amount.value && !isNaN(amt) && amt > 0 && amt <= 1000000
})

const operationLabel = computed(() => {
  return operation.value === 'add' ? 'Adicionar Créditos' : 'Remover Créditos'
})

const operationDescription = computed(() => {
  if (!isFormValid.value) return ''
  const amt = Number(amount.value)
  if (operation.value === 'add') {
    return `Serão adicionados ${amt} crédito(s) ao usuário.`
  } else {
    const newBalance = (props.user?.currentBalance || 0) - amt
    if (newBalance < 0) {
      return `⚠️ Aviso: saldo resultante será negativo (${newBalance})`
    }
    return `Serão removidos ${amt} crédito(s) do usuário. Novo saldo: ${newBalance}`
  }
})

const handleSubmit = () => {
  if (!isFormValid.value || !props.user?.id) return

  operationToConfirm.value = {
    type: operation.value,
    amount: Number(amount.value),
    reason: reason.value.trim(),
  }
  showConfirm.value = true
}

const handleConfirm = async () => {
  const op = operationToConfirm.value
  if (!op) return

  try {
    if (op.type === 'add') {
      emit('add-credits', { userId: props.user.id, amount: op.amount, reason: op.reason })
    } else {
      emit('remove-credits', { userId: props.user.id, amount: op.amount, reason: op.reason })
    }
    // Reset form após sucesso (quando event handler completa)
    resetForm()
  } catch {
    // Erro tratado via prop 'error'
  } finally {
    showConfirm.value = false
    operationToConfirm.value = null
  }
}

const resetForm = () => {
  amount.value = ''
  reason.value = ''
  operation.value = 'add'
}

const handleErrorClear = () => {
  emit('clear-error')
}
</script>

<template>
  <div class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
    <div class="mb-6">
      <h3 class="text-headline-md font-title-lg text-on-surface">
        {{ operationLabel }}
      </h3>
      <p class="mt-1 text-sm text-on-surface-variant">Usuário: {{ user.fullName }}</p>
      <p class="text-sm text-on-surface-variant">Saldo atual: {{ user.currentBalance ?? 0 }} crédito(s)</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 flex items-start gap-3 rounded bg-error-container p-3 text-on-error-container">
      <p class="flex-1 text-sm">{{ error }}</p>
      <button @click="handleErrorClear" class="flex-shrink-0 font-bold hover:underline">✕</button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <FormField label="Operação" name="operation">
        <select
          v-model="operation"
          :disabled="isLoading"
          class="w-full rounded border border-outline px-3 py-2 text-on-surface placeholder-on-surface-variant hover:border-outline-variant focus:border-primary focus:outline-none"
        >
          <option value="add">Adicionar Créditos</option>
          <option value="remove">Remover Créditos</option>
        </select>
      </FormField>

      <FormField label="Quantidade" name="amount">
        <input
          v-model="amount"
          type="number"
          inputmode="numeric"
          min="1"
          max="1000000"
          :disabled="isLoading"
          placeholder="Ex: 10"
          class="w-full rounded border border-outline px-3 py-2 text-on-surface placeholder-on-surface-variant hover:border-outline-variant focus:border-primary focus:outline-none"
        />
        <p v-if="amount && (Number(amount) < 1 || Number(amount) > 1000000)" class="mt-1 text-xs text-error">
          Quantidade deve estar entre 1 e 1.000.000
        </p>
      </FormField>

      <FormField label="Motivo (opcional)" name="reason">
        <input
          v-model="reason"
          type="text"
          :disabled="isLoading"
          placeholder="Ex: Reembolso por erro no sistema"
          class="w-full rounded border border-outline px-3 py-2 text-on-surface placeholder-on-surface-variant hover:border-outline-variant focus:border-primary focus:outline-none"
        />
      </FormField>

      <!-- Operation Preview -->
      <div v-if="operationDescription" class="rounded bg-secondary-container p-3 text-sm text-on-secondary-container">
        {{ operationDescription }}
      </div>

      <!-- Submit Button -->
      <SubmitButton :loading="isLoading" :disabled="!isFormValid || isLoading || !user?.id">
        {{ isLoading ? 'Processando...' : operationLabel }}
      </SubmitButton>
    </form>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      v-if="showConfirm"
      title="Confirmar Operação"
      :message="`Deseja realmente ${operationToConfirm?.type === 'add' ? 'adicionar' : 'remover'} ${operationToConfirm?.amount} crédito(s)?`"
      :is-loading="isLoading"
      confirm-text="Confirmar"
      cancel-text="Cancelar"
      @confirm="handleConfirm"
      @cancel="showConfirm = false"
    />
  </div>
</template>
