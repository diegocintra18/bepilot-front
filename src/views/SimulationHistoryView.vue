<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { examsApi } from '@/api/exams'
import { formatDate, formatDuration } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const router = useRouter()

const items = ref([])
const meta = ref({ total: 0, perPage: 10, page: 1 })
const page = ref(1)
const loading = ref(false)
const error = ref('')

const lastPage = computed(() =>
  meta.value.perPage > 0 ? Math.max(1, Math.ceil(meta.value.total / meta.value.perPage)) : 1,
)

const pageStart = computed(() => (page.value - 1) * meta.value.perPage + 1)
const pageEnd = computed(() => Math.min(page.value * meta.value.perPage, meta.value.total))

function titleOf(item) {
  if (item.exam?.name) return item.exam.name
  if (item.subject?.name) return item.subject.name
  return `Simulado #${item.id}`
}

function metaOf(item) {
  const parts = []
  const totalQuestions = item.exam?.totalQuestions
  if (totalQuestions != null) parts.push(`${totalQuestions} questões`)
  const minutes = item.exam?.totalTimeMinutes
  if (minutes != null) {
    parts.push(formatDuration(minutes * 60))
  } else if (item.durationSeconds != null) {
    parts.push(formatDuration(item.durationSeconds))
  }
  return parts.length ? parts.join(' • ') : ''
}

function resultLabel(item) {
  if (item.approved == null) return { label: 'Em andamento', classes: 'bg-surface-container text-on-surface-variant' }
  if (item.approved) return { label: 'APROVADO', classes: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' }
  return { label: 'REPROVADO', classes: 'bg-error-container text-on-error-container' }
}

function openSession(item) {
  const name = item.approved == null ? 'simulation-execution' : 'simulation-result'
  router.push({ name, params: { id: item.id } })
}

async function fetchHistory() {
  loading.value = true
  error.value = ''
  try {
    const result = await examsApi.history({ page: page.value, limit: meta.value.perPage })
    items.value = result.data || []
    meta.value = result.meta || meta.value
  } catch (err) {
    error.value = err.message || 'Não foi possível carregar o histórico de simulados.'
  } finally {
    loading.value = false
  }
}

function goToPage(nextPage) {
  if (nextPage < 1 || nextPage > lastPage.value || nextPage === page.value) return
  page.value = nextPage
  fetchHistory()
}

function goToStart() {
  router.push({ name: 'simulation-start' })
}

onMounted(fetchHistory)
</script>

<template>
  <AppLayout title="Simulados">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Histórico de Simulados</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Revise os simulados realizados e acompanhe sua evolução.
          </p>
        </div>
        <button
          type="button"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          @click="goToStart"
        >
          <AppIcon name="rocket" :size="20" />
          Novo Simulado
        </button>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <ValidationMessages :message="error" class="mb-stack-md" />

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">SIMULADO</th>
                <th class="px-2 py-3">DATA</th>
                <th class="px-2 py-3">RESULTADO</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="loading">
                <td colspan="4" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="4" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Nenhum simulado encontrado. Comece agora o seu primeiro simulado!
                  </p>
                </td>
              </tr>
              <tr
                v-for="item in items"
                :key="item.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4">
                  <p class="font-bold text-on-surface">{{ titleOf(item) }}</p>
                  <p v-if="metaOf(item)" class="text-xs text-on-surface-variant">{{ metaOf(item) }}</p>
                </td>
                <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDate(item.startedAt) }}</td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="resultLabel(item).classes"
                  >
                    {{ resultLabel(item).label }}
                  </span>
                </td>
                <td class="px-2 py-4 text-right">
                  <button
                    type="button"
                    class="p-2 text-on-surface-variant transition-colors hover:text-primary"
                    :aria-label="`Ver detalhes de ${titleOf(item)}`"
                    @click="openSession(item)"
                  >
                    <AppIcon name="eye" :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!loading && items.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ meta.total }} simulados
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page <= 1"
              @click="goToPage(page - 1)"
            >
              <AppIcon name="chevron-left" :size="18" />
              Anterior
            </button>
            <span class="px-2 font-body-md text-body-md text-on-surface-variant">
              Página {{ page }} de {{ lastPage }}
            </span>
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page >= lastPage"
              @click="goToPage(page + 1)"
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
