import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usersApi } from '@/api/users'

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

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    userType: '',
    status: '',
    subscriptionStatus: '',
    sort: 'createdAt',
    order: 'desc',
  })
  const loading = ref(false)
  const error = ref('')

  async function fetchUsers() {
    loading.value = true
    error.value = ''
    try {
      const result = await usersApi.adminList(filters.value)
      users.value = result.data
      meta.value = normalizeMeta(result.meta)
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar os usuários.'
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
    filters.value.page = 1
    return fetchUsers()
  }

  function setSearch(search) {
    return setFilter('search', search)
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchUsers()
  }

  function getUser(id) {
    return usersApi.adminGet(id)
  }

  function createUser(payload) {
    return usersApi.create(payload)
  }

  function updateUser(id, payload) {
    return usersApi.adminUpdate(id, payload)
  }

  function resetPassword(id, payload) {
    return usersApi.adminResetPassword(id, payload)
  }

  function deleteUser(id) {
    return usersApi.remove(id)
  }

  return {
    users,
    meta,
    filters,
    loading,
    error,
    fetchUsers,
    setFilter,
    setSearch,
    goToPage,
    getUser,
    createUser,
    updateUser,
    resetPassword,
    deleteUser,
  }
})
