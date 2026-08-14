import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { aiCreditsApi } from '@/api/aiCredits'

export const useAiCreditsStore = defineStore('aiCredits', () => {
  // State
  const balance = ref(0)
  const loading = ref(false)
  const error = ref('')

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  const canUseCredits = (amount = 1) => {
    return balance.value >= amount
  }

  // Actions
  async function fetchBalance() {
    loading.value = true
    error.value = ''
    try {
      const result = await aiCreditsApi.getBalance()
      // Mapper: resposta pode vir como 'balance' ou 'aiCreditsRemaining'
      balance.value = result.aiCreditsRemaining ?? result.balance ?? 0
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar seu saldo de créditos.'
      balance.value = 0
    } finally {
      loading.value = false
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
    loading,
    error,
    // Getters
    isLoading,
    hasError,
    canUseCredits,
    // Actions
    fetchBalance,
    addCredits,
    removeCredits,
    clearError,
  }
})
