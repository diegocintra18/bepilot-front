import { ref } from 'vue'
import { defineStore } from 'pinia'
import { subscriptionsApi } from '@/api/subscriptions'

function normalizeMeta(meta = {}) {
  const total = meta.total ?? 0
  const perPage = meta.perPage ?? 10
  const currentPage = meta.page ?? meta.currentPage ?? 1
  return {
    total,
    perPage,
    currentPage,
    lastPage: meta.lastPage ?? Math.max(1, Math.ceil(total / perPage)),
  }
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const subscriptions = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    userId: '',
    status: '',
    provider: '',
    expiresBefore: '',
    providerSubscriptionId: '',
    sort: 'createdAt',
    order: 'desc',
  })
  const loading = ref(false)
  const error = ref('')

  async function fetchSubscriptions() {
    loading.value = true
    error.value = ''
    try {
      const result = await subscriptionsApi.list(filters.value)
      subscriptions.value = result.data
      meta.value = normalizeMeta(result.meta)
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar as assinaturas.'
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
    filters.value.page = 1
    return fetchSubscriptions()
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchSubscriptions()
  }

  function getSubscription(id) {
    return subscriptionsApi.get(id)
  }

  function createSubscription(payload) {
    return subscriptionsApi.create(payload)
  }

  function updateSubscription(id, payload) {
    return subscriptionsApi.update(id, payload)
  }

  function activateSubscription(id, payload) {
    return subscriptionsApi.activate(id, payload)
  }

  function cancelSubscription(id, payload) {
    return subscriptionsApi.cancel(id, payload)
  }

  function renewSubscription(id, payload) {
    return subscriptionsApi.renew(id, payload)
  }

  function fetchHistory(id) {
    return subscriptionsApi.history(id)
  }

  return {
    subscriptions,
    meta,
    filters,
    loading,
    error,
    fetchSubscriptions,
    setFilter,
    goToPage,
    getSubscription,
    createSubscription,
    updateSubscription,
    activateSubscription,
    cancelSubscription,
    renewSubscription,
    fetchHistory,
  }
})
