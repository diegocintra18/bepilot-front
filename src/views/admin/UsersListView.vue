<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { USER_TYPE_LABELS } from '@/constants/userTypes'
import {
  ACCOUNT_STATUS_CLASSES,
  ACCOUNT_STATUS_LABELS,
  USER_SUBSCRIPTION_STATUS_CLASSES,
  USER_SUBSCRIPTION_STATUS_LABELS,
} from '@/constants/statuses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const store = useUsersStore()
const auth = useAuthStore()
const router = useRouter()

const searchInput = ref(store.filters.search)
const userTypeFilter = ref(store.filters.userType)
const statusFilter = ref(store.filters.status)
const subscriptionStatusFilter = ref(store.filters.subscriptionStatus)
const sortFilter = ref(store.filters.sort)
const orderFilter = ref(store.filters.order)
const confirmDelete = ref(null)
const deleting = ref(false)
const actionError = ref('')

const userTypeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'student', label: 'Alunos' },
  { value: 'admin', label: 'Administradores' },
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'blocked', label: 'Bloqueados' },
]

const subscriptionStatusOptions = [
  { value: '', label: 'Todas as assinaturas' },
  { value: 'inactive', label: 'Inativas' },
  { value: 'active', label: 'Ativas' },
  { value: 'cancelled', label: 'Canceladas' },
]

const sortOptions = [
  { value: 'createdAt', label: 'Cadastro' },
  { value: 'updatedAt', label: 'Atualização' },
  { value: 'fullName', label: 'Nome' },
]

const pageStart = computed(() => (store.meta.currentPage - 1) * store.meta.perPage + 1)
const pageEnd = computed(() => Math.min(store.meta.currentPage * store.meta.perPage, store.meta.total))

onMounted(() => {
  store.fetchUsers()
})

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function userTypeLabel(value) {
  return USER_TYPE_LABELS[value] || 'Usuário'
}

function applySearch() {
  store.setSearch(searchInput.value)
}

function changeUserType() {
  store.setFilter('userType', userTypeFilter.value)
}

function changeStatus() {
  store.setFilter('status', statusFilter.value)
}

function changeSubscriptionStatus() {
  store.setFilter('subscriptionStatus', subscriptionStatusFilter.value)
}

function changeSort() {
  store.setFilter('sort', sortFilter.value)
}

function toggleOrder() {
  orderFilter.value = orderFilter.value === 'asc' ? 'desc' : 'asc'
  store.setFilter('order', orderFilter.value)
}

function manageSubscription(user) {
  router.push({ name: 'subscriptions', query: { userId: user.id } })
}

function askDelete(user) {
  actionError.value = ''
  confirmDelete.value = user
}

async function handleDelete() {
  if (!confirmDelete.value) return
  deleting.value = true
  actionError.value = ''
  try {
    await store.deleteUser(confirmDelete.value.id)
    await store.fetchUsers()
    if (store.users.length === 0 && store.meta.currentPage > 1) {
      store.goToPage(store.meta.currentPage - 1)
    }
  } catch (error) {
    actionError.value = error.message || 'Não foi possível excluir o usuário.'
  } finally {
    deleting.value = false
    confirmDelete.value = null
  }
}
</script>

<template>
  <AppLayout title="Usuários">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Gerenciar Usuários</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Crie, edite e acompanhe os usuários cadastrados na plataforma.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'user-new' }"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <AppIcon name="plus-circle" :size="20" />
          Novo Usuário
        </RouterLink>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form class="flex w-full max-w-md gap-2" role="search" @submit.prevent="applySearch">
              <input
                v-model="searchInput"
                type="search"
                name="search"
                placeholder="Buscar por nome, e-mail ou WhatsApp..."
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

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
                Tipo
                <select
                  v-model="userTypeFilter"
                  class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  @change="changeUserType"
                >
                  <option v-for="option in userTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>

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
                Assinatura
                <select
                  v-model="subscriptionStatusFilter"
                  class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  @change="changeSubscriptionStatus"
                >
                  <option v-for="option in subscriptionStatusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-outline-variant pt-4 sm:flex-row sm:items-center">
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
                <th class="px-2 py-3">USUÁRIO</th>
                <th class="px-2 py-3">E-MAIL</th>
                <th class="px-2 py-3">WHATSAPP</th>
                <th class="px-2 py-3">TIPO</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3">ASSINATURA</th>
                <th class="px-2 py-3">CADASTRADO EM</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="8" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="store.users.length === 0">
                <td colspan="8" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Nenhum usuário encontrado.
                  </p>
                </td>
              </tr>
              <tr
                v-for="user in store.users"
                :key="user.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container font-label-caps text-label-caps font-bold text-on-primary-container"
                      aria-hidden="true"
                    >
                      {{ user.initials || '—' }}
                    </span>
                    <div>
                      <p class="font-bold text-on-surface">{{ user.fullName }}</p>
                      <p class="text-xs text-on-surface-variant">#{{ user.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-2 py-4 text-on-surface-variant">{{ user.email || '—' }}</td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ user.whatsapp || '—' }}</td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="
                      user.userType === 2
                        ? 'bg-primary-fixed text-on-primary-fixed-variant'
                        : 'bg-surface-variant text-on-surface-variant'
                    "
                  >
                    {{ userTypeLabel(user.userType) }}
                  </span>
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="ACCOUNT_STATUS_CLASSES[user.status] || 'bg-surface-variant text-on-surface-variant'"
                  >
                    {{ ACCOUNT_STATUS_LABELS[user.status] || user.status || '—' }}
                  </span>
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="
                      USER_SUBSCRIPTION_STATUS_CLASSES[user.subscriptionStatus] || 'bg-surface-variant text-on-surface-variant'
                    "
                  >
                    {{ USER_SUBSCRIPTION_STATUS_LABELS[user.subscriptionStatus] || user.subscriptionStatus || '—' }}
                  </span>
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDate(user.createdAt) }}</td>
                <td class="px-2 py-4">
                  <div class="flex justify-end gap-1">
                    <RouterLink
                      :to="{ name: 'user-detail', params: { id: user.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Ver detalhes de ${user.fullName}`"
                    >
                      <AppIcon name="eye" :size="18" />
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'user-edit', params: { id: user.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Editar ${user.fullName}`"
                    >
                      <AppIcon name="edit" :size="18" />
                    </RouterLink>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Gerenciar assinatura de ${user.fullName}`"
                      :title="'Gerenciar assinatura'"
                      @click="manageSubscription(user)"
                    >
                      <AppIcon name="credit-card" :size="18" />
                    </button>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-40"
                      :disabled="user.id === auth.user?.id"
                      :title="user.id === auth.user?.id ? 'Você não pode excluir sua própria conta' : undefined"
                      :aria-label="`Excluir ${user.fullName}`"
                      @click="askDelete(user)"
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
          v-if="!store.loading && store.users.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.meta.total }} usuários
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

    <ConfirmDialog
      :open="confirmDelete !== null"
      title="Excluir usuário"
      :message="confirmDelete ? `Tem certeza que deseja excluir o usuário '${confirmDelete.fullName}'? Esta ação não poderá ser desfeita.` : ''"
      confirm-label="Excluir"
      :loading="deleting"
      @cancel="confirmDelete = null"
      @confirm="handleDelete"
    />
  </AppLayout>
</template>
