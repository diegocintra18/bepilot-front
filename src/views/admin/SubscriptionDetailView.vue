<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import {
  PROVIDER_LABELS,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/constants/statuses'
import { formatDateTime, toIsoDateTime } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import FormField from '@/components/auth/FormField.vue'
import ModalDialog from '@/components/admin/ModalDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useSubscriptionsStore()

const subscriptionId = computed(() => Number(route.params.id))

const subscription = ref(null)
const loading = ref(true)
const notFound = ref(false)
const apiError = ref('')
const actionError = ref('')
const actionSuccess = ref('')

const modal = reactive({ type: '' })
const activateForm = reactive({ expiresAt: '', justification: '' })
const activateErrors = reactive({ expiresAt: '', justification: '' })
const cancelForm = reactive({ reason: '', scope: 'local' })
const cancelErrors = reactive({ reason: '' })
const renewForm = reactive({ expiresAt: '', justification: '' })
const renewErrors = reactive({ expiresAt: '', justification: '' })
const submitting = ref(false)

const history = computed(() => subscription.value?.history || [])

function formatIso(value) {
  return value ? formatDateTime(value) : '—'
}

async function load() {
  loading.value = true
  apiError.value = ''
  try {
    subscription.value = await store.getSubscription(subscriptionId.value)
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar a assinatura.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

function actionLabel(action) {
  const labels = {
    'subscription.created': 'Assinatura criada',
    'subscription.activated': 'Assinatura ativada',
    'subscription.cancelled': 'Assinatura cancelada',
    'subscription.cancellation_requested': 'Cancelamento solicitado',
    'subscription.renewed': 'Assinatura renovada',
    'subscription.updated': 'Assinatura atualizada',
    'subscription.expired': 'Assinatura expirada',
    'subscription.payment_received': 'Pagamento recebido',
    'subscription.provider_webhook': 'Webhook do provedor',
  }
  return labels[action] || action || 'Ação'
}

function openActivate() {
  if (!subscription.value) return
  router.push({ name: 'subscription-choose-plan', params: { id: subscription.value.id } })
}

function openCancel() {
  actionError.value = ''
  actionSuccess.value = ''
  cancelForm.reason = ''
  cancelForm.scope = 'local'
  cancelErrors.reason = ''
  modal.type = 'cancel'
}

function openRenew() {
  actionError.value = ''
  actionSuccess.value = ''
  renewForm.expiresAt = ''
  renewForm.justification = ''
  renewErrors.expiresAt = ''
  renewErrors.justification = ''
  modal.type = 'renew'
}

function closeModal() {
  if (submitting.value) return
  modal.type = ''
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
  if (!subscription.value) return
  actionError.value = ''
  actionSuccess.value = ''
  submitting.value = true
  try {
    if (modal.type === 'activate') {
      if (!validateActivate()) return
      await store.activateSubscription(subscription.value.id, {
        expiresAt: toIsoDateTime(activateForm.expiresAt),
        justification: activateForm.justification.trim(),
      })
      actionSuccess.value = 'Assinatura ativada com sucesso.'
    } else if (modal.type === 'cancel') {
      if (!validateCancel()) return
      await store.cancelSubscription(subscription.value.id, {
        reason: cancelForm.reason.trim(),
        scope: cancelForm.scope,
      })
      actionSuccess.value = 'Assinatura cancelada com sucesso.'
    } else if (modal.type === 'renew') {
      if (!validateRenew()) return
      await store.renewSubscription(subscription.value.id, {
        expiresAt: toIsoDateTime(renewForm.expiresAt),
        justification: renewForm.justification.trim(),
      })
      actionSuccess.value = 'Assinatura renovada com sucesso.'
    }
    closeModal()
    await load()
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

function changedValue(record, key) {
  const before = record.previousData?.[key]
  const after = record.newData?.[key]
  if (before === undefined && after === undefined) return null
  if (String(before) === String(after)) return null
  const format = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    if (key === 'status') return SUBSCRIPTION_STATUS_LABELS[value] || value
    if (key === 'expiresAt' || key === 'activatedAt' || key === 'cancelledAt') return formatIso(value)
    return String(value)
  }
  return { before: format(before), after: format(after) }
}
</script>

<template>
  <AppLayout title="Assinatura">
    <div class="space-y-stack-lg">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <RouterLink
          :to="{ name: 'subscriptions' }"
          class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para assinaturas
        </RouterLink>
          <div v-if="subscription && !notFound" class="flex flex-wrap items-center gap-2">
            <button
              v-if="subscription.status !== 'active' && subscription.status !== 'cancelled'"
              type="button"
              class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
              @click="openActivate"
            >
              <AppIcon name="check-circle" :size="18" />
              Ativar plano
            </button>
          <button
            v-if="subscription.status === 'active'"
            type="button"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            @click="openRenew"
          >
            <AppIcon name="refresh" :size="18" />
            Renovar
          </button>
          <button
            v-if="subscription.status === 'active' || subscription.status === 'pending'"
            type="button"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-error-container hover:text-on-error-container"
            @click="openCancel"
          >
            <AppIcon name="x-circle" :size="18" />
            Cancelar
          </button>
          <RouterLink
            :to="{ name: 'subscription-edit', params: { id: subscription.id } }"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <AppIcon name="edit" :size="18" />
            Editar
          </RouterLink>
        </div>
      </div>

      <section v-if="loading" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <section v-else-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Assinatura não encontrada</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          A assinatura que você tentou acessar não existe ou foi removida.
        </p>
      </section>

      <template v-else-if="subscription">
        <ValidationMessages v-if="apiError" :message="apiError" class="mb-stack-md" />
        <ValidationMessages v-if="actionSuccess" :message="actionSuccess" variant="success" class="mb-stack-md" />
        <ValidationMessages v-if="actionError" :message="actionError" class="mb-stack-md" />

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
                aria-hidden="true"
              >
                <AppIcon name="credit-card" :size="24" />
              </div>
              <div>
                <h2 class="font-headline-lg text-headline-lg text-on-surface">Assinatura #{{ subscription.id }}</h2>
                <p v-if="subscription.user" class="font-body-md text-body-md text-on-surface-variant">
                  <RouterLink
                    :to="{ name: 'user-detail', params: { id: subscription.user.id } }"
                    class="text-primary hover:underline"
                  >
                    {{ subscription.user.fullName }}
                  </RouterLink>
                  {{ subscription.user.email ? `— ${subscription.user.email}` : '' }}
                </p>
              </div>
            </div>
            <span
              class="w-fit rounded-full px-3 py-1 text-xs font-bold"
              :class="SUBSCRIPTION_STATUS_CLASSES[subscription.status] || 'bg-surface-variant text-on-surface-variant'"
            >
              {{ SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status }}
            </span>
          </div>

          <dl class="mt-6 grid grid-cols-1 gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Provedor</dt>
              <dd class="font-body-md text-body-md text-on-surface">
                {{ PROVIDER_LABELS[subscription.provider] || subscription.provider || '—' }}
              </dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Plano</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ subscription.planName || '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">ID no provedor</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ subscription.providerSubscriptionId || '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">ID do produto</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ subscription.productId || '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">ID do cliente no provedor</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ subscription.providerCustomerId || '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Criado em</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatIso(subscription.createdAt) }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Ativação</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatIso(subscription.activatedAt) }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Expiração</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatIso(subscription.expiresAt) }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Cancelamento</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatIso(subscription.cancelledAt) }}</dd>
            </div>
            <div v-if="subscription.cancellationReason" class="sm:col-span-2 lg:col-span-3">
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Motivo do cancelamento</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ subscription.cancellationReason }}</dd>
            </div>
            <div v-if="subscription.metadata && Object.keys(subscription.metadata).length > 0" class="sm:col-span-2 lg:col-span-3">
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Metadados</dt>
              <dd class="mt-1">
                <pre class="overflow-x-auto rounded-lg bg-surface-container-low p-4 font-body-md text-body-md text-on-surface">{{ JSON.stringify(subscription.metadata, null, 2) }}</pre>
              </dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="list" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Histórico</h3>
              <p class="text-sm text-on-surface-variant">Ações administrativas registradas na assinatura.</p>
            </div>
          </div>

          <ol v-if="history.length > 0" class="mt-stack-lg space-y-0">
            <li
              v-for="record in history"
              :key="record.id"
              class="relative border-l-2 border-outline-variant pl-6 pb-6 last:pb-0"
            >
              <span
                class="absolute top-0 left-0 h-3 w-3 -translate-x-1/2 rounded-full bg-primary"
                aria-hidden="true"
              />
              <p class="font-bold text-on-surface">{{ actionLabel(record.action) }}</p>
              <p class="text-sm text-on-surface-variant">{{ formatIso(record.createdAt) }}</p>

              <div v-if="changedValue(record, 'status')" class="mt-2 flex items-center gap-2 text-sm">
                <span class="text-on-surface-variant">Status:</span>
                <span class="rounded-full bg-surface-variant px-2 py-0.5 text-xs font-bold text-on-surface-variant">
                  {{ changedValue(record, 'status').before }}
                </span>
                <AppIcon name="arrow-right" :size="14" />
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-bold"
                  :class="SUBSCRIPTION_STATUS_CLASSES[record.newData?.status] || 'bg-surface-variant text-on-surface-variant'"
                >
                  {{ changedValue(record, 'status').after }}
                </span>
              </div>

              <div v-if="changedValue(record, 'expiresAt')" class="mt-1 flex items-center gap-2 text-sm">
                <span class="text-on-surface-variant">Expiração:</span>
                <span class="text-on-surface">{{ changedValue(record, 'expiresAt').before }}</span>
                <AppIcon name="arrow-right" :size="14" />
                <span class="text-on-surface">{{ changedValue(record, 'expiresAt').after }}</span>
              </div>

              <p v-if="record.justification" class="mt-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
                {{ record.justification }}
              </p>
              <p v-if="record.admin" class="mt-2 text-sm text-on-surface-variant">
                Por <span class="font-bold text-on-surface">{{ record.admin.fullName }}</span>
                <span v-if="record.admin.email" class="text-on-surface-variant"> — {{ record.admin.email }}</span>
              </p>
              <p v-else class="mt-2 text-sm text-on-surface-variant">Por Sistema / Provedor</p>
            </li>
          </ol>

          <p v-else class="mt-stack-lg font-body-md text-body-md text-on-surface-variant">
            Nenhum evento registrado no histórico desta assinatura.
          </p>
        </section>
      </template>
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
      description="Tem certeza que deseja cancelar esta assinatura?"
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
