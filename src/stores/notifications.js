import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificationsApi } from '@/api/notifications'

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

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const loading = ref(false)
  const error = ref('')

  const unreadCount = computed(
    () => notifications.value.filter((notification) => !notification.readAt).length,
  )

  async function fetchNotifications({ page = 1, limit = 10, read } = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await notificationsApi.list({ page, limit, read })
      notifications.value = result.data
      meta.value = normalizeMeta(result.meta)
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar as notificações.'
    } finally {
      loading.value = false
    }
  }

  function getNotification(id) {
    return notificationsApi.get(id)
  }

  async function markAsRead(notification) {
    const updated = await notificationsApi.markRead(notification.id)
    const index = notifications.value.findIndex((item) => item.id === notification.id)
    if (index !== -1) notifications.value[index] = updated
    return updated
  }

  async function markAsUnread(notification) {
    const updated = await notificationsApi.markUnread(notification.id)
    const index = notifications.value.findIndex((item) => item.id === notification.id)
    if (index !== -1) notifications.value[index] = updated
    return updated
  }

  async function removeNotification(notification) {
    await notificationsApi.remove(notification.id)
    notifications.value = notifications.value.filter((item) => item.id !== notification.id)
    if (meta.value.total > 0) meta.value.total -= 1
  }

  function createNotification(payload) {
    return notificationsApi.create(payload)
  }

  return {
    notifications,
    meta,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    getNotification,
    markAsRead,
    markAsUnread,
    removeNotification,
    createNotification,
  }
})
