<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import {
  PROVIDER_LABELS,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/constants/statuses'
import { toIsoDateTime } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import ModalDialog from '@/components/admin/ModalDialog.vue'
import FormField from '@/components/auth/FormField.vue'

const route = useRoute()
const router = useRouter()
const store = useSubscriptionsStore()

const statusFilter = ref(store.filters.status)
const providerFilter = ref(store.filters.provider)
const providerSubscriptionIdFilter = ref(store.filters.providerSubscriptionId)
const expiresBeforeFilter = ref(store.filters.expiresBefore)
const sortFilter = ref(store.filters.sort)
const orderFilter = ref(store.filters.order)
const actionError = ref('')

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: SUBSCRIPTION_STATUS_LABELS.pending },
  { value: 'active', label: SUBSCRIPTION_STATUS_LABELS.active },
  { value: 'cancelled', label: SUBSCRIPTION_STATUS_LABELS.cancelled },
  { value: 'expired', label: SUBSCRIPTION_STATUS_LABELS.expired },
]

const providerOptions = [
  { value: '', label: 'Todos os provedores' },
  { value: 'kiwify', label: PROVIDER_LABELS.kiwify },
  { value: 'manual', label: PROVIDER_LABELS.manual },
]

const sortOptions = [
  { value: 'createdAt', label: 'Criação' },
  { value: 'updatedAt', label: 'Atualização' },
  { value: 'expiresAt', label: 'Expiração' },
]

const pageStart = computed(() => (store.meta.currentPage - 1) * store.meta.perPage + 1)
const pageEnd = computed(() => Math.min(store.meta.currentPage * store.meta.perPage, store.meta.total))

const activeUserId = computed(() => store.filters.userId)

const modal = reactive({
  type: '',
  subscription: null,
})
const activateForm = reactive({ expiresAt: '', justification: '' })
const activateErrors = reactive({ expiresAt: '', justification: '' })
const cancelForm = reactive({ reason: '', scope: 'local' })
const cancelErrors = reactive({ reason: '' })
const renewForm = reactive({ expiresAt: '', justification: '' })
const renewErrors = reactive({ expiresAt: '', justification: '' })
const submitting = ref(false)

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} • ${timePart}`
}

onMounted(async () => {
  if (route.query.userId) {
    await store.setFilter('userId', String(route.query.userId))
    return
  }
  store.fetchSubscriptions()
})

function clearUserFilter() {
  store.setFilter('userId', '')
}

function changeStatus() {
  store.setFilter('status', statusFilter.value)
}

function changeProvider() {
  store.setFilter('provider', providerFilter.value)
}

function changeSort() {
  store.setFilter('sort', sortFilter.value)
}

function toggleOrder() {
  orderFilter.value = orderFilter.value === 'asc' ? 'desc' : 'asc'
  store.setFilter('order', orderFilter.value)
}

function applyProviderSubscriptionId() {
  store.setFilter('providerSubscriptionId', providerSubscriptionIdFilter.value)
}

function applyExpiresBefore() {
  store.setFilter('expiresBefore', expiresBeforeFilter.value)
}

function openActivate(subscription) {
  router.push({ name: 'subscription-choose-plan', params: { id: subscription.id } })
}

function openCancel(subscription) {
  actionError.value = ''
  cancelForm.reason = ''
  cancelForm.scope = 'local'
  cancelErrors.reason = ''
  modal.type = 'cancel'
  modal.subscription = subscription
}

function openRenew(subscription) {
  actionError.value = ''
  renewForm.expiresAt = ''
  renewForm.justification = ''
  renewErrors.expiresAt = ''
  renewErrors.justification = ''
  modal.type = 'renew'
  modal.subscription = subscription
}

function closeModal() {
  if (submitting.value) return
  modal.type = ''
  modal.subscription = null
}

function validateActivate() {
  activateErrors.expiresAt = ''
  activateErrors.justification = ''
  let valid = true
  if (!activateForm.expiresAt) {
    activateErrors.expiresAt = 'Informe a data de expiração.'
    valid = false
  }
  if (!activateForm.justification.trim()) {
    activateErrors.justification = 'Informe a justificativa.'
    valid = false
  } else if (activateForm.justification.trim().length < 3) {
    activateErrors.justification = 'A justificativa deve ter no mínimo 3 caracteres.'
    valid = false
  }
  return valid
}

function validateCancel() {
  cancelErrors.reason = ''
  let valid = true
  if (!cancelForm.reason.trim()) {
    cancelErrors.reason = 'Informe o motivo do cancelamento.'
    valid = false
  } else if (cancelForm.reason.trim().length < 3) {
    cancelErrors.reason = 'O motivo deve ter no mínimo 3 caracteres.'
    valid = false
  }
  return valid
}

function validateRenew() {
  renewErrors.expiresAt = ''
  renewErrors.justification = ''
  let valid = true
  if (!renewForm.expiresAt) {
    renewErrors.expiresAt = 'Informe a nova data de expiração.'
    valid = false
  }
  if (!renewForm.justification.trim()) {
    renewErrors.justification = 'Informe a justificativa.'
    valid = false
  } else if (renewForm.justification.trim().length < 3) {
    renewErrors.justification = 'A justificativa deve ter no mínimo 3 caracteres.'
    valid = false
  }
  return valid
}

async function confirmModal() {
  if (!modal.subscription) return
  actionError.value = ''
  submitting.value = true
  try {
    if (modal.type === 'activate') {
      if (!validateActivate()) return
      await store.activateSubscription(modal.subscription.id, {
        expiresAt: toIsoDateTime(activateForm.expiresAt),
        justification: activateForm.justification.trim(),
      })
    } else if (modal.type === 'cancel') {
      if (!validateCancel()) return
      await store.cancelSubscription(modal.subscription.id, {
        reason: cancelForm.reason.trim(),
        scope: cancelForm.scope,
      })
    } else if (modal.type === 'renew') {
      if (!validateRenew()) return
      await store.renewSubscription(modal.subscription.id, {
        expiresAt: toIsoDateTime(renewForm.expiresAt),
        justification: renewForm.justification.trim(),
      })
    }
    closeModal()
    await store.fetchSubscriptions()
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (modal.type === 'activate' && field in activateErrors) activateErrors[field] = message
        if (modal.type === 'cancel' && field in cancelErrors) cancelErrors[field] = message
        if (modal.type === 'renew' && field in renewErrors) renewErrors[field] = message
      })
    }
    actionError.value = error.message || 'Não foi possível concluir a ação.'
  } finally {
    submitting.value = false
  }
}

const modalTitle = computed(() => {
  if (modal.type === 'activate') return 'Ativar assinatura'
  if (modal.type === 'cancel') return 'Cancelar assinatura'
  if (modal.type === 'renew') return 'Renovar assinatura'
  return ''
})

const modalDescription = computed(() => {
  if (modal.type === 'cancel') {
    return modal.subscription
      ? `Tem certeza que deseja cancelar a assinatura #${modal.subscription.id}?`
      : ''
  }
  return ''
})
</script>

<template>
  <AppLayout title="Assinaturas">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Gerenciar Assinaturas</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Crie, edite e acompanhe as assinaturas dos usuários.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'subscription-new' }"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <AppIcon name="plus-circle" :size="20" />
          Nova Assinatura
        </RouterLink>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div v-if="activeUserId" class="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
          <p class="font-body-md text-body-md text-on-surface-variant">
            Filtrando assinaturas do usuário <span class="font-bold text-on-surface">#{{ activeUserId }}</span>.
          </p>
          <button
            type="button"
            class="flex items-center gap-1 font-button-text text-button-text text-primary hover:underline"
            @click="clearUserFilter"
          >
            <AppIcon name="close" :size="16" />
            Limpar filtro
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
            <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
              Status
              <select
                v-model="statusFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeStatus"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
              Provedor
              <select
                v-model="providerFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeProvider"
              >
                <option v-for="option in providerOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="flex flex-col gap-3 border-t border-outline-variant pt-4 sm:flex-row sm:items-center sm:flex-wrap">
            <form class="flex w-full max-w-xs gap-2" role="search" @submit.prevent="applyProviderSubscriptionId">
              <input
                v-model="providerSubscriptionIdFilter"
                type="search"
                name="providerSubscriptionId"
                placeholder="ID no provedor..."
                class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              >
              <button
                type="submit"
                class="flex shrink-0 items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <AppIcon name="search" :size="18" />
                Buscar
              </button>
            </form>

            <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
              Expira até
              <input
                v-model="expiresBeforeFilter"
                type="datetime-local"
                name="expiresBefore"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="applyExpiresBefore"
              >
            </label>

            <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
              Ordenar por
              <select
                v-model="sortFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeSort"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="flex w-fit items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
              @click="toggleOrder"
            >
              <AppIcon :name="orderFilter === 'asc' ? 'chevron-up' : 'chevron-down'" :size="16" />
              {{ orderFilter === 'asc' ? 'Crescente' : 'Decrescente' }}
            </button>
          </div>
        </div>

        <ValidationMessages :message="actionError" class="mt-stack-md" />
        <ValidationMessages v-if="store.error && !store.loading" :message="store.error" class="mt-stack-md" />

        <div class="mt-stack-lg overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">ID</th>
                <th class="px-2 py-3">USUÁRIO</th>
                <th class="px-2 py-3">PROVEDOR</th>
                <th class="px-2 py-3">PLANO</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3">ATIVAÇÃO</th>
                <th class="px-2 py-3">EXPIRAÇÃO</th>
                <th class="px-2 py-3">CANCELAMENTO</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="9" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="store.subscriptions.length === 0">
                <td colspan="9" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Nenhuma assinatura encontrada.
                  </p>
                </td>
              </tr>
              <tr
                v-for="subscription in store.subscriptions"
                :key="subscription.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4 text-sm text-on-surface-variant">#{{ subscription.id }}</td>
                <td class="px-2 py-4">
                  <p class="font-bold text-on-surface">{{ subscription.user?.fullName || '—' }}</p>
                  <p class="text-xs text-on-surface-variant">{{ subscription.user?.email || `#${subscription.userId}` }}</p>
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">
                  {{ PROVIDER_LABELS[subscription.provider] || subscription.provider || '—' }}
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ subscription.planName || '—' }}</td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="SUBSCRIPTION_STATUS_CLASSES[subscription.status] || 'bg-surface-variant text-on-surface-variant'"
                  >
                    {{ SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status || '—' }}
                  </span>
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDateTime(subscription.activatedAt) }}</td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDateTime(subscription.expiresAt) }}</td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDateTime(subscription.cancelledAt) }}</td>
                <td class="px-2 py-4">
                  <div class="flex justify-end gap-1">
                    <RouterLink
                      :to="{ name: 'subscription-detail', params: { id: subscription.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Ver detalhes da assinatura ${subscription.id}`"
                    >
                      <AppIcon name="eye" :size="18" />
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'subscription-edit', params: { id: subscription.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Editar assinatura ${subscription.id}`"
                    >
                      <AppIcon name="edit" :size="18" />
                    </RouterLink>
                    <button
                      v-if="subscription.status !== 'active' && subscription.status !== 'cancelled'"
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Ativar plano ${subscription.id}`"
                      @click="openActivate(subscription)"
                    >
                      <AppIcon name="check-circle" :size="18" />
                    </button>
                    <button
                      v-if="subscription.status === 'active'"
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Renovar assinatura ${subscription.id}`"
                      @click="openRenew(subscription)"
                    >
                      <AppIcon name="refresh" :size="18" />
                    </button>
                    <button
                      v-if="subscription.status === 'active' || subscription.status === 'pending'"
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                      :aria-label="`Cancelar assinatura ${subscription.id}`"
                      @click="openCancel(subscription)"
                    >
                      <AppIcon name="x-circle" :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!store.loading && store.subscriptions.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.meta.total }} assinaturas
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="store.meta.currentPage <= 1"
              @click="store.goToPage(store.meta.currentPage - 1)"
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
              @click="store.goToPage(store.meta.currentPage + 1)"
            >
              Próxima
              <AppIcon name="chevron-right" :size="18" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <ModalDialog
      :open="modal.type === 'activate'"
      title="Ativar assinatura"
      description="Confirme a ativação da assinatura e informe a data de expiração."
      confirm-label="Ativar"
      :loading="submitting"
      @cancel="closeModal"
      @confirm="confirmModal"
    >
      <form novalidate class="flex flex-col gap-stack-md" @submit.prevent="confirmModal">
        <FormField :error="activateErrors.expiresAt" label="Data de expiração" name="expiresAt">
          <template #default="{ id, error }">
            <input
              :id="id"
              v-model="activateForm.expiresAt"
              type="datetime-local"
              name="expiresAt"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
          </template>
        </FormField>
        <FormField :error="activateErrors.justification" label="Justificativa" name="justification">
          <template #default="{ id, error }">
            <textarea
              :id="id"
              v-model="activateForm.justification"
              name="justification"
              rows="3"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            ></textarea>
          </template>
        </FormField>
      </form>
    </ModalDialog>

    <ModalDialog
      :open="modal.type === 'cancel'"
      title="Cancelar assinatura"
      :description="modalDescription"
      confirm-label="Cancelar assinatura"
      variant="danger"
      :loading="submitting"
      @cancel="closeModal"
      @confirm="confirmModal"
    >
      <form novalidate class="flex flex-col gap-stack-md" @submit.prevent="confirmModal">
        <FormField :error="cancelErrors.reason" label="Motivo do cancelamento" name="reason">
          <template #default="{ id, error }">
            <textarea
              :id="id"
              v-model="cancelForm.reason"
              name="reason"
              rows="3"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            ></textarea>
          </template>
        </FormField>
        <FormField label="Escopo do cancelamento" name="scope">
          <template #default="{ id }">
            <select
              :id="id"
              v-model="cancelForm.scope"
              name="scope"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="local">Somente nesta plataforma</option>
              <option value="provider">Refletir no provedor</option>
            </select>
          </template>
        </FormField>
      </form>
    </ModalDialog>

    <ModalDialog
      :open="modal.type === 'renew'"
      title="Renovar assinatura"
      description="Informe a nova data de expiração para renovar a assinatura."
      confirm-label="Renovar"
      :loading="submitting"
      @cancel="closeModal"
      @confirm="confirmModal"
    >
      <form novalidate class="flex flex-col gap-stack-md" @submit.prevent="confirmModal">
        <FormField :error="renewErrors.expiresAt" label="Nova data de expiração" name="expiresAt">
          <template #default="{ id, error }">
            <input
              :id="id"
              v-model="renewForm.expiresAt"
              type="datetime-local"
              name="expiresAt"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
          </template>
        </FormField>
        <FormField :error="renewErrors.justification" label="Justificativa" name="justification">
          <template #default="{ id, error }">
            <textarea
              :id="id"
              v-model="renewForm.justification"
              name="justification"
              rows="3"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            ></textarea>
          </template>
        </FormField>
      </form>
    </ModalDialog>
  </AppLayout>
</template>
