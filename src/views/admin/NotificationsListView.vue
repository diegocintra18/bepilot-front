<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const router = useRouter()
const store = useNotificationsStore()

const readFilter = ref('')
const actionError = ref('')

const readOptions = [
  { value: '', label: 'Todas' },
  { value: 'false', label: 'Não lidas' },
  { value: 'true', label: 'Lidas' },
]

const notificationTypeLabels = Object.freeze({
  subscription_cancellation_requested: 'Cancelamento solicitado',
  ai_question_batch_generated: 'Questões geradas',
  ai_question_batch_failed: 'Falha na geração de questões',
})

function typeLabel(type) {
  return notificationTypeLabels[type] || type || '—'
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} • ${timePart}`
}

const pageStart = computed(() => (store.meta.currentPage - 1) * store.meta.perPage + 1)
const pageEnd = computed(() => Math.min(store.meta.currentPage * store.meta.perPage, store.meta.total))

function load() {
  store.fetchNotifications({
    page: store.meta.currentPage,
    limit: store.meta.perPage,
    read: readFilter.value === '' ? undefined : readFilter.value,
  })
}

function changeRead() {
  store.meta.currentPage = 1
  load()
}

function openNotification(notification) {
  if (notification.route && notification.route.startsWith('/admin/')) {
    router.push(notification.route)
  }
}

async function toggleRead(notification) {
  actionError.value = ''
  try {
    if (notification.readAt) {
      await store.markAsUnread(notification)
    } else {
      await store.markAsRead(notification)
    }
  } catch (error) {
    actionError.value = error.message || 'Não foi possível atualizar a notificação.'
  }
}

async function removeNotification(notification) {
  actionError.value = ''
  try {
    await store.removeNotification(notification)
  } catch (error) {
    actionError.value = error.message || 'Não foi possível remover a notificação.'
  }
}

onMounted(load)
</script>

<template>
  <AppLayout title="Notificações">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Notificações</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Acompanhe os avisos e solicitações enviados para você.
          </p>
        </div>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div class="flex flex-col gap-4">
          <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
            Status
            <select
              v-model="readFilter"
              class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              @change="changeRead"
            >
              <option v-for="option in readOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <ValidationMessages :message="actionError" class="mt-stack-md" />
        <ValidationMessages v-if="store.error && !store.loading" :message="store.error" class="mt-stack-md" />

        <div class="mt-stack-lg overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">TIPO</th>
                <th class="px-2 py-3">TÍTULO</th>
                <th class="px-2 py-3">MENSAGEM</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3">RECEBIDA EM</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="6" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="store.notifications.length === 0">
                <td colspan="6" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Nenhuma notificação encontrada.
                  </p>
                </td>
              </tr>
              <tr
                v-for="notification in store.notifications"
                :key="notification.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4 text-sm text-on-surface-variant">
                  {{ typeLabel(notification.type) }}
                </td>
                <td class="px-2 py-4">
                  <p class="font-bold text-on-surface">{{ notification.title }}</p>
                </td>
                <td class="max-w-md px-2 py-4 text-sm text-on-surface-variant">
                  {{ notification.message }}
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="
                      notification.readAt
                        ? 'bg-surface-variant text-on-surface-variant'
                        : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    "
                  >
                    {{ notification.readAt ? 'Lida' : 'Não lida' }}
                  </span>
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">
                  {{ formatDateTime(notification.createdAt) }}
                </td>
                <td class="px-2 py-4">
                  <div class="flex justify-end gap-1">
                    <button
                      v-if="notification.route && notification.route.startsWith('/admin/')"
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Abrir notificação ${notification.id}`"
                      @click="openNotification(notification)"
                    >
                      <AppIcon name="eye" :size="18" />
                    </button>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="notification.readAt ? `Marcar notificação ${notification.id} como não lida` : `Marcar notificação ${notification.id} como lida`"
                      @click="toggleRead(notification)"
                    >
                      <AppIcon name="check-circle" :size="18" />
                    </button>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                      :aria-label="`Remover notificação ${notification.id}`"
                      @click="removeNotification(notification)"
                    >
                      <AppIcon name="trash" :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!store.loading && store.notifications.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.meta.total }} notificações
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="store.meta.currentPage <= 1"
              @click="store.meta.currentPage -= 1; load()"
            >
              <AppIcon name="chevron-left" :size="18" />
              Anterior
            </button>
            <span class="px-2 font-body-md text-body-md text-on-surface-variant">
              Página {{ store.meta.currentPage }} de {{ store.meta.lastPage }}
            </span>
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="store.meta.currentPage >= store.meta.lastPage"
              @click="store.meta.currentPage += 1; load()"
            >
              Próxima
              <AppIcon name="chevron-right" :size="18" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
