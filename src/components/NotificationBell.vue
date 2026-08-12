<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { notificationsApi } from '@/api/notifications'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const bellOpen = ref(false)
const dropdownRef = ref(null)
const recent = ref([])
const notificationsLoading = ref(false)

const unreadCount = computed(
  () => recent.value.filter((notification) => !notification.readAt).length,
)

async function loadNotifications() {
  if (!auth.isAuthenticated) return
  notificationsLoading.value = true
  try {
    const result = await notificationsApi.list({ limit: 50 })
    recent.value = result.data
  } catch {
    recent.value = []
  } finally {
    notificationsLoading.value = false
  }
}

function toggleBell() {
  if (!auth.isAuthenticated) return
  bellOpen.value = !bellOpen.value
  if (bellOpen.value) loadNotifications()
}

function onDocumentClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    bellOpen.value = false
  }
}

function timeAgo(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h atrás`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} d atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function openNotification(notification) {
  if (notification.route) {
    if (notification.route.startsWith('/admin/') && !auth.isAdmin) return
    router.push(notification.route)
  }
  if (!notification.readAt) {
    try {
      const updated = await notificationsApi.markRead(notification.id)
      const index = recent.value.findIndex((item) => item.id === notification.id)
      if (index !== -1) recent.value[index] = updated
    } catch {
      // ignore: o estado visual é atualizado na próxima carga
    }
  }
  bellOpen.value = false
}

async function toggleRead(notification) {
  try {
    const updated = notification.readAt
      ? await notificationsApi.markUnread(notification.id)
      : await notificationsApi.markRead(notification.id)
    const index = recent.value.findIndex((item) => item.id === notification.id)
    if (index !== -1) recent.value[index] = updated
  } catch {
    // ignore
  }
}

async function removeNotification(notification) {
  try {
    await notificationsApi.remove(notification.id)
    recent.value = recent.value.filter((item) => item.id !== notification.id)
  } catch {
    // ignore
  }
}

function goToAllNotifications() {
  bellOpen.value = false
  if (auth.isAdmin) {
    router.push({ name: 'notifications' })
  }
}

watch(
  () => route.fullPath,
  () => {
    bellOpen.value = false
    loadNotifications()
  },
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  loadNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      class="relative cursor-pointer rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="Notificações"
      :aria-expanded="bellOpen"
      aria-haspopup="true"
      @click="toggleBell"
    >
      <AppIcon name="bell" :size="24" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="bellOpen"
        class="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lift"
        role="dialog"
        aria-label="Notificações recentes"
      >
        <div class="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <p class="font-button-text text-button-text font-bold text-on-surface">Notificações</p>
          <span v-if="unreadCount > 0" class="text-xs font-bold text-on-surface-variant">
            {{ unreadCount }} não lida{{ unreadCount === 1 ? '' : 's' }}
          </span>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <p v-if="notificationsLoading" class="px-4 py-8 text-center text-sm text-on-surface-variant">
            Carregando...
          </p>
          <template v-else-if="recent.length > 0">
            <div
              v-for="notification in recent"
              :key="notification.id"
              role="button"
              tabindex="0"
              class="flex w-full cursor-pointer flex-col gap-1 border-b border-outline-variant px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-container-low"
              :class="notification.readAt ? '' : 'bg-primary-fixed/40'"
              @click="openNotification(notification)"
              @keydown.enter="openNotification(notification)"
            >
              <div class="flex items-start justify-between gap-2">
                <p
                  class="text-sm font-bold"
                  :class="notification.readAt ? 'text-on-surface-variant' : 'text-on-surface'"
                >
                  {{ notification.title }}
                </p>
                <span class="shrink-0 text-[11px] text-on-surface-variant">
                  {{ timeAgo(notification.createdAt) }}
                </span>
              </div>
              <p class="text-xs text-on-surface-variant">{{ notification.message }}</p>
              <div class="flex items-center gap-3" @click.stop>
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline"
                  @click="toggleRead(notification)"
                >
                  {{ notification.readAt ? 'Marcar como não lida' : 'Marcar como lida' }}
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold text-on-surface-variant hover:text-error hover:underline"
                  @click="removeNotification(notification)"
                >
                  Remover
                </button>
              </div>
            </div>
          </template>
          <p v-else class="px-4 py-8 text-center text-sm text-on-surface-variant">
            Nenhuma notificação.
          </p>
        </div>

        <div v-if="auth.isAdmin" class="border-t border-outline-variant p-2">
          <button
            type="button"
            class="w-full rounded-lg px-3 py-2 text-center text-sm font-bold text-primary transition-colors hover:bg-surface-container-low"
            @click="goToAllNotifications"
          >
            Ver todas
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
