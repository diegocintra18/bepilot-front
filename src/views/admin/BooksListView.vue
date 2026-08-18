<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import { useBooksStore } from '@/stores/books'

const store = useBooksStore()

const searchInput = ref(store.filters.search)
const statusFilter = ref(store.filters.status)
const confirmDelete = ref(null)
const deleting = ref(false)
const actionError = ref('')

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
]

const pageStart = computed(() => (store.meta.currentPage - 1) * store.meta.perPage + 1)
const pageEnd = computed(() => Math.min(store.meta.currentPage * store.meta.perPage, store.meta.total))

onMounted(() => {
  store.listAdmin().catch(() => {})
})

function applySearch() {
  store.setSearch(searchInput.value).catch(() => {})
}

function changeStatus() {
  store.setStatus(statusFilter.value).catch(() => {})
}

function askDelete(book) {
  actionError.value = ''
  confirmDelete.value = book
}

async function handleDelete() {
  if (!confirmDelete.value) return
  deleting.value = true
  actionError.value = ''
  try {
    await store.deleteBook(confirmDelete.value.id)
    await store.listAdmin()
    if (store.books.length === 0 && store.meta.currentPage > 1) {
      store.goToPage(store.meta.currentPage - 1)
    }
  } catch (error) {
    actionError.value = error.message || 'Não foi possível excluir o livro.'
  } finally {
    deleting.value = false
    confirmDelete.value = null
  }
}
</script>

<template>
  <AppLayout title="Livros">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Gerenciar Livros</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Cadastre livros recomendados para seus alunos.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'book-new' }"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <AppIcon name="plus-circle" :size="20" />
          Novo Livro
        </RouterLink>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form class="flex w-full max-w-md gap-2" role="search" @submit.prevent="applySearch">
            <input
              v-model="searchInput"
              type="search"
              name="search"
              placeholder="Buscar por nome ou autor..."
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
        </div>

        <ValidationMessages :message="actionError" class="mt-stack-md" />

        <div class="mt-stack-lg overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">NOME</th>
                <th class="px-2 py-3">AUTOR</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="4" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="store.books.length === 0">
                <td colspan="4" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">Nenhum livro encontrado.</p>
                </td>
              </tr>
              <tr
                v-for="book in store.books"
                :key="book.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4">
                  <p class="font-bold text-on-surface">{{ book.name }}</p>
                </td>
                <td class="px-2 py-4">
                  <p class="text-on-surface-variant">{{ book.author }}</p>
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="book.status === 'active' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-error-container text-on-error-container'"
                  >
                    {{ book.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-2 py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <RouterLink
                      :to="{ name: 'book-edit', params: { id: book.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Editar ${book.name}`"
                    >
                      <AppIcon name="edit" :size="18" />
                    </RouterLink>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                      :aria-label="`Excluir ${book.name}`"
                      @click="askDelete(book)"
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
          v-if="!store.loading && store.books.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.meta.total }} livros
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

      <ConfirmDialog
        :open="confirmDelete !== null"
        title="Excluir livro"
        :message="confirmDelete ? `Tem certeza que deseja excluir o livro '${confirmDelete.name}'? Esta ação não poderá ser desfeita.` : ''"
        confirm-label="Excluir"
        :loading="deleting"
        @cancel="confirmDelete = null"
        @confirm="handleDelete"
      />
    </div>
  </AppLayout>
</template>
