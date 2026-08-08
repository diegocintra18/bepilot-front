<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { USER_TYPE_LABELS } from '@/constants/userTypes'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useUsersStore()

const userId = computed(() => Number(route.params.id))

const user = ref(null)
const stats = ref(null)
const bySubject = ref([])
const loading = ref(true)
const notFound = ref(false)
const apiError = ref('')
const statsError = ref('')

const subscriptionStatusLabel = computed(() => {
  const status = user.value?.subscriptionStatus
  if (!status) return null
  const labels = {
    active: 'Ativa',
    inactive: 'Inativa',
    cancelled: 'Cancelada',
    pending: 'Pendente',
  }
  return labels[status] || status
})

const isActive = computed(() => user.value?.subscriptionStatus === 'active')

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatAccuracy(value) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(1)}%`
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '—'
  const total = Math.round(Number(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

onMounted(async () => {
  try {
    user.value = await store.getUser(userId.value)
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar o usuário.'
    }
  }

  try {
    const detail = await store.getStats(userId.value)
    stats.value = detail?.stats || null
    bySubject.value = Array.isArray(detail?.bySubject) ? detail.bySubject : []
  } catch {
    statsError.value = 'Não foi possível carregar as estatísticas deste usuário.'
  } finally {
    loading.value = false
  }
})
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
        <RouterLink
          v-if="user && !notFound"
          :to="{ name: 'user-edit', params: { id: user.id } }"
          class="flex w-fit items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <AppIcon name="edit" :size="18" />
          Editar usuário
        </RouterLink>
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
                v-if="subscriptionStatusLabel"
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  isActive
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                    : 'bg-error-container text-on-error-container'
                "
              >
                Assinatura {{ subscriptionStatusLabel }}
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
          <div class="mb-5 flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="chart" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Desempenho do usuário</h3>
              <p class="text-sm text-on-surface-variant">Resumo de simulados realizados.</p>
            </div>
          </div>

          <ValidationMessages v-if="statsError" :message="statsError" class="mb-stack-md" />

          <div v-if="stats" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Simulados</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">{{ stats.totalExams ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Acertos</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-tertiary">{{ stats.totalCorrect ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Erros</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-error">{{ stats.totalWrong ?? 0 }}</p>
            </div>
            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Precisão média</p>
              <p class="mt-1 font-headline-lg text-headline-lg text-primary">
                {{ formatAccuracy(stats.averageAccuracy) }}
              </p>
            </div>
          </div>

          <div v-if="bySubject.length > 0" class="mt-stack-lg overflow-x-auto">
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
                  v-for="item in bySubject"
                  :key="item.subject?.id"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4">
                    <p class="font-bold text-on-surface">{{ item.subject?.name || '—' }}</p>
                    <p v-if="item.subject?.code" class="text-xs text-on-surface-variant">{{ item.subject.code }}</p>
                  </td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ item.stats?.totalExams ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ item.stats?.totalQuestions ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-tertiary">{{ item.stats?.totalCorrect ?? 0 }}</td>
                  <td class="px-2 py-4 text-right text-primary">{{ formatAccuracy(item.stats?.accuracyPercentage) }}</td>
                  <td class="px-2 py-4 text-right text-on-surface-variant">{{ formatTime(item.stats?.averageExamTimeSeconds) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else-if="stats" class="mt-stack-md font-body-md text-body-md text-on-surface-variant">
            O usuário ainda não possui estatísticas por disciplina.
          </p>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
