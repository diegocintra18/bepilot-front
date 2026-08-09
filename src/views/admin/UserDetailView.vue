<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { subscriptionsApi } from '@/api/subscriptions'
import { USER_TYPE_LABELS } from '@/constants/userTypes'
import {
  ACCOUNT_STATUS_CLASSES,
  ACCOUNT_STATUS_LABELS,
  PROVIDER_LABELS,
  SUBSCRIPTION_STATUS_CLASSES,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/constants/statuses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import ModalDialog from '@/components/admin/ModalDialog.vue'

const route = useRoute()
const store = useUsersStore()

const userId = computed(() => Number(route.params.id))

const user = ref(null)
const subscription = ref(null)
const subscriptionsLoading = ref(false)
const loading = ref(true)
const notFound = ref(false)
const apiError = ref('')

const passwordModalOpen = ref(false)
const passwordForm = reactive({ newPassword: '', confirmPassword: '' })
const passwordErrors = reactive({ newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const statistics = computed(() => user.value?.statistics || null)
const subjectStatistics = computed(() => user.value?.subjectStatistics || [])
const examSessionsCount = computed(() => user.value?.examSessionsCount ?? null)

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const datePart = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} • ${timePart}`
}

function formatAccuracy(value) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(1).replace('.', ',')}%`
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const total = Math.round(Number(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

async function loadSubscriptions() {
  subscriptionsLoading.value = true
  try {
    const result = await subscriptionsApi.list({ userId: userId.value, limit: 1 })
    subscription.value = result?.data?.[0] || null
  } catch {
    subscription.value = null
  } finally {
    subscriptionsLoading.value = false
  }
}

onMounted(async () => {
  try {
    user.value = await store.getUser(userId.value)
    await loadSubscriptions()
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar o usuário.'
    }
  } finally {
    loading.value = false
  }
})

function openPasswordModal() {
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
  passwordError.value = ''
  passwordSuccess.value = ''
  passwordModalOpen.value = true
}

function validatePassword() {
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
  let valid = true
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Informe a nova senha.'
    valid = false
  } else if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = 'A senha deve ter no mínimo 8 caracteres.'
    valid = false
  }
  if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordErrors.confirmPassword = 'As senhas não coincidem.'
    valid = false
  }
  return valid
}

async function submitPassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (!validatePassword()) return
  passwordLoading.value = true
  try {
    await store.resetPassword(userId.value, { newPassword: passwordForm.newPassword })
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordSuccess.value = 'Senha alterada com sucesso.'
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in passwordErrors) passwordErrors[field] = message
      })
    }
    passwordError.value = error.message || 'Não foi possível alterar a senha.'
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <AppLayout title="Usuário">
    <div class="space-y-stack-lg">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <RouterLink
          :to="{ name: 'users' }"
          class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para usuários
        </RouterLink>
        <div v-if="user && !notFound" class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            @click="openPasswordModal"
          >
            <AppIcon name="shield" :size="18" />
            Alterar senha
          </button>
          <RouterLink
            :to="{ name: 'user-edit', params: { id: user.id } }"
            class="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <AppIcon name="edit" :size="18" />
            Editar usuário
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
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Usuário não encontrado</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          O usuário que você tentou acessar não existe ou foi removido.
        </p>
      </section>

      <template v-else-if="user">
        <ValidationMessages v-if="apiError" :message="apiError" class="mb-stack-md" />

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-caps text-label-caps font-bold text-on-primary-container"
                aria-hidden="true"
              >
                {{ user.initials || '—' }}
              </span>
              <div>
                <h2 class="font-headline-lg text-headline-lg text-on-surface">{{ user.fullName }}</h2>
                <p class="font-body-md text-body-md text-on-surface-variant">{{ user.email || '—' }}</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  user.userType === 2
                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                    : 'bg-surface-variant text-on-surface-variant'
                "
              >
                {{ USER_TYPE_LABELS[user.userType] || 'Usuário' }}
              </span>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="ACCOUNT_STATUS_CLASSES[user.status] || 'bg-surface-variant text-on-surface-variant'"
              >
                {{ ACCOUNT_STATUS_LABELS[user.status] || user.status || '—' }}
              </span>
            </div>
          </div>

          <dl class="mt-6 grid grid-cols-1 gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">ID</dt>
              <dd class="font-body-md text-body-md text-on-surface">#{{ user.id }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">WhatsApp</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ user.whatsapp || '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Cadastrado em</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatDate(user.createdAt) }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Atualizado em</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatDate(user.updatedAt) }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
                aria-hidden="true"
              >
                <AppIcon name="credit-card" :size="22" />
              </div>
              <div>
                <h3 class="font-headline-md text-headline-md text-on-surface">Assinatura</h3>
                <p class="text-sm text-on-surface-variant">Informações da assinatura mais recente.</p>
              </div>
            </div>
            <RouterLink
              :to="{ name: 'subscription-new', query: { userId: user.id } }"
              class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
            >
              <AppIcon name="plus-circle" :size="18" />
              Nova assinatura
            </RouterLink>
          </div>

          <div v-if="subscriptionsLoading" class="mt-stack-lg py-8 text-center">
            <span
              class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
              role="status"
              aria-label="Carregando"
            />
          </div>

          <div v-else-if="subscription" class="mt-stack-lg">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="SUBSCRIPTION_STATUS_CLASSES[subscription.status] || 'bg-surface-variant text-on-surface-variant'"
              >
                {{ SUBSCRIPTION_STATUS_LABELS[subscription.status] || subscription.status }}
              </span>
              <RouterLink
                :to="{ name: 'subscription-detail', params: { id: subscription.id } }"
                class="inline-flex items-center gap-1 font-button-text text-button-text text-primary hover:underline"
              >
                Ver detalhes
                <AppIcon name="arrow-right" :size="16" />
              </RouterLink>
            </div>

            <dl class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Ativação</dt>
                <dd class="font-body-md text-body-md text-on-surface">{{ formatDateTime(subscription.activatedAt) }}</dd>
              </div>
              <div>
                <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Expiração</dt>
                <dd class="font-body-md text-body-md text-on-surface">{{ formatDateTime(subscription.expiresAt) }}</dd>
              </div>
              <div v-if="subscription.cancelledAt">
                <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Cancelamento</dt>
                <dd class="font-body-md text-body-md text-on-surface">{{ formatDateTime(subscription.cancelledAt) }}</dd>
              </div>
            </dl>
          </div>

          <p v-else class="mt-stack-lg font-body-md text-body-md text-on-surface-variant">
            Este usuário ainda não possui assinaturas registradas.
          </p>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="chart" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Uso e desempenho</h3>
              <p class="text-sm text-on-surface-variant">Resumo de simulados realizados.</p>
            </div>
          </div>

          <div class="mt-stack-lg grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Simulados gratuitos usados</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">{{ user.freeSimulationsUsed ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Sessões de simulado</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">{{ examSessionsCount ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Simulados</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">{{ statistics?.totalExams ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Acertos</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-tertiary">{{ statistics?.totalCorrect ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Precisão média</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">
                {{ formatAccuracy(statistics?.averageAccuracy) }}
              </p>
            </div>
          </div>

          <div v-if="subjectStatistics.length > 0" class="mt-stack-lg overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-outline-variant">
                <tr class="font-label-caps text-label-caps text-on-surface-variant">
                  <th class="px-2 py-3">DISCIPLINA</th>
                  <th class="px-2 py-3 text-right">SIMULADOS</th>
                  <th class="px-2 py-3 text-right">QUESTÕES</th>
                  <th class="px-2 py-3 text-right">ACERTOS</th>
                  <th class="px-2 py-3 text-right">PRECISÃO</th>
                  <th class="px-2 py-3 text-right">TEMPO MÉDIO</th>
                </tr>
              </thead>
              <tbody class="font-body-md">
                <tr
                  v-for="item in subjectStatistics"
                  :key="item.subjectId"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4 font-bold text-on-surface">{{ item.subjectName || '—' }}</td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ item.totalExams ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ item.totalQuestions ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-tertiary">{{ item.totalCorrect ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-primary">{{ formatAccuracy(item.accuracyPercentage) }}</td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ formatTime(item.averageExamTimeSeconds) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="mt-stack-lg font-body-md text-body-md text-on-surface-variant">
            O usuário ainda não possui estatísticas por disciplina.
          </p>
        </section>
      </template>
    </div>

    <ModalDialog
      :open="passwordModalOpen"
      title="Alterar senha"
      description="Defina uma nova senha para este usuário. Mínimo de 8 caracteres."
      confirm-label="Alterar senha"
      :loading="passwordLoading"
      @cancel="passwordModalOpen = false"
      @confirm="submitPassword"
    >
      <ValidationMessages v-if="passwordSuccess" :message="passwordSuccess" variant="success" />
      <ValidationMessages v-if="passwordError" :message="passwordError" class="mt-stack-sm" />
      <form novalidate class="flex flex-col gap-stack-md" @submit.prevent="submitPassword">
        <FormField :error="passwordErrors.newPassword" label="Nova senha" name="newPassword">
          <template #default="{ id, error }">
            <PasswordInput
              :id="id"
              v-model="passwordForm.newPassword"
              name="newPassword"
              autocomplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              :aria-describedby="error ? `${id}-error` : undefined"
            />
          </template>
        </FormField>
        <FormField :error="passwordErrors.confirmPassword" label="Confirmar nova senha" name="confirmPassword">
          <template #default="{ id, error }">
            <PasswordInput
              :id="id"
              v-model="passwordForm.confirmPassword"
              name="confirmPassword"
              autocomplete="new-password"
              placeholder="Repita a nova senha"
              :aria-describedby="error ? `${id}-error` : undefined"
            />
          </template>
        </FormField>
      </form>
    </ModalDialog>
  </AppLayout>
</template>
