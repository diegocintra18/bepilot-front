<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { usersApi } from '@/api/users'
import { PROVIDER_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/constants/statuses'
import { fromIsoToLocalDateTime, toIsoDateTime } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useSubscriptionsStore()

const isEdit = computed(() => route.name === 'subscription-edit')
const subscriptionId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Assinatura' : 'Nova Assinatura'))

const form = reactive({
  userId: '',
  provider: 'manual',
  providerSubscriptionId: '',
  providerCustomerId: '',
  productId: '',
  planName: '',
  status: 'active',
  activatedAt: '',
  expiresAt: '',
  cancelledAt: '',
  cancellationReason: '',
  justification: '',
})
const fieldErrors = reactive({
  userId: '',
  provider: '',
  providerSubscriptionId: '',
  providerCustomerId: '',
  productId: '',
  planName: '',
  status: '',
  activatedAt: '',
  expiresAt: '',
  cancelledAt: '',
  cancellationReason: '',
  justification: '',
})
const users = ref([])
const usersLoading = ref(false)
const userLoadError = ref('')
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
const notFound = ref(false)

const formRef = ref(null)

function autoResizeTextarea(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
  el.style.overflow = 'hidden'
}

function autoResizeAllTextareas() {
  if (!formRef.value) return
  formRef.value.querySelectorAll('textarea').forEach((t) => autoResizeTextarea(t))
}

const providerOptions = [
  { value: 'kiwify', label: PROVIDER_LABELS.kiwify },
  { value: 'manual', label: PROVIDER_LABELS.manual },
]

const statusOptions = [
  { value: 'pending', label: SUBSCRIPTION_STATUS_LABELS.pending },
  { value: 'active', label: SUBSCRIPTION_STATUS_LABELS.active },
  { value: 'cancelled', label: SUBSCRIPTION_STATUS_LABELS.cancelled },
  { value: 'expired', label: SUBSCRIPTION_STATUS_LABELS.expired },
]

async function loadUsers(preferredUserId) {
  usersLoading.value = true
  userLoadError.value = ''
  try {
    const result = await usersApi.adminList({ limit: 100, sort: 'createdAt', order: 'desc' })
    users.value = result?.data || []
    if (preferredUserId && !users.value.some((user) => String(user.id) === String(preferredUserId))) {
      form.userId = String(preferredUserId)
    } else if (!form.userId && users.value.length > 0) {
      form.userId = ''
    }
  } catch (error) {
    userLoadError.value = error.message || 'Não foi possível carregar a lista de usuários.'
  } finally {
    usersLoading.value = false
  }
}

onMounted(async () => {
  const queryUserId = route.query.userId ? String(route.query.userId) : ''
  await loadUsers(queryUserId)

  if (!isEdit.value) {
    form.userId = queryUserId
    return
  }

  fetching.value = true
  try {
    const subscription = await store.getSubscription(subscriptionId.value)
    form.userId = String(subscription.userId ?? '')
    form.provider = subscription.provider || 'manual'
    form.providerSubscriptionId = subscription.providerSubscriptionId || ''
    form.providerCustomerId = subscription.providerCustomerId || ''
    form.productId = subscription.productId || ''
    form.planName = subscription.planName || ''
    form.status = subscription.status || 'active'
    form.activatedAt = fromIsoToLocalDateTime(subscription.activatedAt)
    form.expiresAt = fromIsoToLocalDateTime(subscription.expiresAt)
    form.cancelledAt = fromIsoToLocalDateTime(subscription.cancelledAt)
    form.cancellationReason = subscription.cancellationReason || ''
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar a assinatura.'
    }
  } finally {
    fetching.value = false
  }

  await nextTick()
  autoResizeAllTextareas()
})

function validate() {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })
  let valid = true

  if (!form.userId) {
    fieldErrors.userId = 'Selecione o usuário dono da assinatura.'
    valid = false
  }
  if (!form.provider) {
    fieldErrors.provider = 'Selecione o provedor.'
    valid = false
  }
  if (form.status !== 'pending' && form.status !== 'active' && form.status !== 'cancelled' && form.status !== 'expired') {
    fieldErrors.status = 'Selecione um status válido.'
    valid = false
  }
  if (!form.justification.trim()) {
    fieldErrors.justification = 'Informe a justificativa.'
    valid = false
  } else if (form.justification.trim().length < 3) {
    fieldErrors.justification = 'A justificativa deve ter no mínimo 3 caracteres.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  const payload = {
    userId: Number(form.userId),
    provider: form.provider,
    providerSubscriptionId: form.providerSubscriptionId.trim() || null,
    providerCustomerId: form.providerCustomerId.trim() || null,
    productId: form.productId.trim() || null,
    planName: form.planName.trim() || null,
    status: form.status,
    activatedAt: toIsoDateTime(form.activatedAt) || null,
    expiresAt: toIsoDateTime(form.expiresAt) || null,
    justification: form.justification.trim(),
  }
  if (isEdit.value) {
    payload.cancelledAt = toIsoDateTime(form.cancelledAt) || null
    payload.cancellationReason = form.cancellationReason.trim() || null
  }
  try {
    if (isEdit.value) {
      await store.updateSubscription(subscriptionId.value, payload)
    } else {
      await store.createSubscription(payload)
    }
    router.push({ name: 'subscriptions' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    apiError.value = error.message || 'Não foi possível salvar a assinatura.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'subscriptions' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para assinaturas
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Assinatura não encontrada</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          A assinatura que você tentou editar não existe ou foi removida.
        </p>
        <RouterLink
          :to="{ name: 'subscriptions' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para assinaturas
        </RouterLink>
      </section>

      <section v-else-if="fetching" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <div v-else class="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <section class="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8 lg:col-span-2">
          <h2 class="font-headline-lg text-headline-lg text-on-surface">
            {{ isEdit ? 'Editar assinatura' : 'Nova assinatura' }}
          </h2>
          <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            {{ isEdit ? 'Atualize as informações da assinatura.' : 'Registre uma assinatura para um usuário.' }}
          </p>

          <ValidationMessages :message="apiError" class="mt-stack-md" />

           <form
             ref="formRef"
             novalidate
             class="mt-stack-lg flex flex-col gap-stack-md"
             @submit.prevent="submit"
           >
            <FormField :error="fieldErrors.userId" label="Usuário" name="userId">
              <template #default="{ id, error }">
                <select
                  :id="id"
                  v-model="form.userId"
                  name="userId"
                  :disabled="usersLoading"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Selecione um usuário...</option>
                  <option v-for="user in users" :key="user.id" :value="String(user.id)">
                    {{ user.fullName }} — {{ user.email }}
                  </option>
                </select>
              </template>
            </FormField>

            <FormField :error="fieldErrors.provider" label="Provedor" name="provider">
              <template #default="{ id, error }">
                <select
                  :id="id"
                  v-model="form.provider"
                  name="provider"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option v-for="option in providerOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>
            </FormField>

            <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
              <FormField :error="fieldErrors.planName" label="Nome do plano" name="planName">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.planName"
                    type="text"
                    name="planName"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>

              <FormField :error="fieldErrors.productId" label="ID do produto" name="productId">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.productId"
                    type="text"
                    name="productId"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>
            </div>

            <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
              <FormField :error="fieldErrors.providerSubscriptionId" label="ID da assinatura no provedor" name="providerSubscriptionId">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.providerSubscriptionId"
                    type="text"
                    name="providerSubscriptionId"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>

              <FormField :error="fieldErrors.providerCustomerId" label="ID do cliente no provedor" name="providerCustomerId">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.providerCustomerId"
                    type="text"
                    name="providerCustomerId"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>
            </div>

            <FormField :error="fieldErrors.status" label="Status" name="status">
              <template #default="{ id, error }">
                <select
                  :id="id"
                  v-model="form.status"
                  name="status"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>
            </FormField>

            <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
              <FormField :error="fieldErrors.activatedAt" label="Data de ativação" name="activatedAt">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.activatedAt"
                    type="datetime-local"
                    name="activatedAt"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>

              <FormField :error="fieldErrors.expiresAt" label="Data de expiração" name="expiresAt">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="form.expiresAt"
                    type="datetime-local"
                    name="expiresAt"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  >
                </template>
              </FormField>
            </div>

            <template v-if="isEdit">
              <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
                <FormField :error="fieldErrors.cancelledAt" label="Data de cancelamento" name="cancelledAt">
                  <template #default="{ id, error }">
                    <input
                      :id="id"
                      v-model="form.cancelledAt"
                      type="datetime-local"
                      name="cancelledAt"
                      :aria-describedby="error ? `${id}-error` : undefined"
                      class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    >
                  </template>
                </FormField>

                <FormField :error="fieldErrors.cancellationReason" label="Motivo do cancelamento" name="cancellationReason">
                  <template #default="{ id, error }">
                    <textarea
                      :id="id"
                      v-model="form.cancellationReason"
                      name="cancellationReason"
                      rows="1"
                      :aria-describedby="error ? `${id}-error` : undefined"
                      class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                      @input="autoResizeTextarea($event.target)"
                    ></textarea>
                  </template>
                </FormField>
              </div>
            </template>

            <FormField :error="fieldErrors.justification" label="Justificativa" name="justification">
              <template #default="{ id, error }">
                  <textarea
                    :id="id"
                    v-model="form.justification"
                    name="justification"
                    rows="3"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                    @input="autoResizeTextarea($event.target)"
                  ></textarea>
              </template>
            </FormField>

            <div class="flex flex-col-reverse gap-3 pt-stack-sm sm:flex-row sm:justify-end">
              <RouterLink
                :to="{ name: 'subscriptions' }"
                class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Cancelar
              </RouterLink>
              <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
                {{ isEdit ? 'Salvar alterações' : 'Criar assinatura' }}
              </SubmitButton>
            </div>
          </form>
        </section>

        <aside class="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift" aria-label="Ajuda">
          <h3 class="font-headline-md text-headline-md text-on-surface">Sobre assinaturas</h3>
          <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            A justificativa é obrigatória e fica registrada no histórico de auditoria da assinatura.
          </p>
          <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            Para ativar, cancelar ou renovar uma assinatura existente, use as ações disponíveis na listagem ou no detalhe.
          </p>
          <ValidationMessages v-if="userLoadError" :message="userLoadError" class="mt-stack-md" />
        </aside>
      </div>
    </div>
  </AppLayout>
</template>
