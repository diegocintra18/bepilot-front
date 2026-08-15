import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { aiCreditsApi } from '@/api/aiCredits'

export const useAiCreditsStore = defineStore('aiCredits', () => {
  // State
  const balance = ref(0)
  const plan = ref('limited')
  const aiCreditsLimit = ref(null)
  const loading = ref(false)
  const error = ref('')

  const history = ref([])
  const historyLoading = ref(false)
  const errorHistory = ref('')

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const isLoadingHistory = computed(() => historyLoading.value)
  const hasErrorHistory = computed(() => !!errorHistory.value)

  const canUseCredits = (amount = 1) => {
    return balance.value >= amount
  }

  // Actions
  async function fetchBalance() {
    loading.value = true
    error.value = ''
    try {
      const result = await aiCreditsApi.getBalance()
      const snapshot = result?.credits ?? result
      plan.value = snapshot?.plan ?? 'limited'
      aiCreditsLimit.value = snapshot?.aiCreditsLimit ?? null
      balance.value = snapshot?.aiCreditsRemaining ?? 0
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar seu saldo de créditos.'
      balance.value = 0
      aiCreditsLimit.value = null
      plan.value = 'limited'
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory() {
    historyLoading.value = true
    errorHistory.value = ''
    try {
      const result = await aiCreditsApi.getMyHistory({ page: 1, limit: 50 })
      history.value = result.data ?? []
    } catch (err) {
      errorHistory.value = err.message || 'Não foi possível carregar seu histórico.'
      history.value = []
    } finally {
      historyLoading.value = false
    }
  }

  async function addCredits(userId, amount, reason = '') {
    try {
      const result = await aiCreditsApi.addCredits(userId, amount, reason)
      // Refetch para garantir sincronização
      await fetchBalance()
      return result
    } catch (err) {
      error.value = err.message || 'Não foi possível adicionar créditos.'
      throw err
    }
  }

  async function removeCredits(userId, amount, reason = '') {
    try {
      const result = await aiCreditsApi.removeCredits(userId, amount, reason)
      // Refetch para garantir sincronização
      await fetchBalance()
      return result
    } catch (err) {
      error.value = err.message || 'Não foi possível remover créditos.'
      throw err
    }
  }

  async function clearError() {
    error.value = ''
  }

  return {
    // State
    balance,
    plan,
    aiCreditsLimit,
    loading,
    error,
    history,
    historyLoading,
    errorHistory,
    // Getters
    isLoading,
    hasError,
    isLoadingHistory,
    hasErrorHistory,
    canUseCredits,
    // Actions
    fetchBalance,
    fetchHistory,
    addCredits,
    removeCredits,
    clearError,
    clearHistoryError: () => {
      errorHistory.value = ''
    },
  }
})
