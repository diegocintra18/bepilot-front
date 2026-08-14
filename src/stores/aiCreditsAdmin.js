import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { aiCreditsApi } from '@/api/aiCredits'

function normalizeMeta(meta = {}) {
  const total = meta.total ?? 0
  const perPage = meta.perPage ?? meta.limit ?? 10
  const currentPage = meta.page ?? meta.currentPage ?? 1
  return {
    total,
    perPage,
    currentPage,
    lastPage: meta.lastPage ?? Math.max(1, Math.ceil(total / perPage)),
  }
}

export const useAiCreditsAdminStore = defineStore('aiCreditsAdmin', () => {
  // State
  const users = ref([])
  const selectedUser = ref(null)
  const history = ref([])
  const historyMeta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    search: '',
  })
  const loading = ref(false)
  const loadingHistory = ref(false)
  const error = ref('')
  const errorHistory = ref('')

  // Getters
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const isLoadingHistory = computed(() => loadingHistory.value)
  const hasErrorHistory = computed(() => !!errorHistory.value)

  // Actions
  async function fetchUserCredits() {
    loading.value = true
    error.value = ''
    try {
      const result = await aiCreditsApi.getAdminCredits(filters.value)
      users.value = result.data ?? []
      meta.value = normalizeMeta(result.meta)
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar a lista de usuários.'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchUserHistory(userId) {
    loadingHistory.value = true
    errorHistory.value = ''
    try {
      const result = await aiCreditsApi.getHistory(userId)
      history.value = result.data ?? []
      historyMeta.value = normalizeMeta(result.meta)
    } catch (err) {
      errorHistory.value = err.message || 'Não foi possível carregar o histórico.'
      history.value = []
    } finally {
      loadingHistory.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
    filters.value.page = 1
    return fetchUserCredits()
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchUserCredits()
  }

  function selectUser(user) {
    selectedUser.value = user
    if (user?.id) {
      return fetchUserHistory(user.id)
    }
  }

  function deselectUser() {
    selectedUser.value = null
    history.value = []
    historyMeta.value = { total: 0, perPage: 10, currentPage: 1, lastPage: 1 }
  }

  async function addCreditsToUser(userId, amount, reason = '') {
    try {
      const result = await aiCreditsApi.addCredits(userId, amount, reason)
      // Refetch lista para atualizar saldo
      await fetchUserCredits()
      // Refetch histórico se usuário selecionado
      if (selectedUser.value?.id === userId) {
        await fetchUserHistory(userId)
      }
      return result
    } catch (err) {
      error.value = err.message || 'Não foi possível adicionar créditos.'
      throw err
    }
  }

  async function removeCreditsFromUser(userId, amount, reason = '') {
    try {
      const result = await aiCreditsApi.removeCredits(userId, amount, reason)
      // Refetch lista para atualizar saldo
      await fetchUserCredits()
      // Refetch histórico se usuário selecionado
      if (selectedUser.value?.id === userId) {
        await fetchUserHistory(userId)
      }
      return result
    } catch (err) {
      error.value = err.message || 'Não foi possível remover créditos.'
      throw err
    }
  }

  function clearError() {
    error.value = ''
  }

  function clearErrorHistory() {
    errorHistory.value = ''
  }

  return {
    // State
    users,
    selectedUser,
    history,
    historyMeta,
    meta,
    filters,
    loading,
    loadingHistory,
    error,
    errorHistory,
    // Getters
    isLoading,
    hasError,
    isLoadingHistory,
    hasErrorHistory,
    // Actions
    fetchUserCredits,
    fetchUserHistory,
    setFilter,
    goToPage,
    selectUser,
    deselectUser,
    addCreditsToUser,
    removeCreditsFromUser,
    clearError,
    clearErrorHistory,
  }
})
