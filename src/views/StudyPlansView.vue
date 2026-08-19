<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useStudyPlansStore } from '@/stores/studyPlans'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const store = useStudyPlansStore()

const router = useRouter()

const page = ref(1)
const limit = ref(10)

const lastPage = computed(() => {
  const total = store.pagination?.total ?? 0
  const perPage = store.pagination?.perPage ?? limit.value
  return perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
})

const pageStart = computed(() => {
  const total = store.pagination?.total ?? 0
  const perPage = store.pagination?.perPage ?? limit.value
  if (total === 0) return 0
  return (page.value - 1) * perPage + 1
})

const pageEnd = computed(() => {
  const total = store.pagination?.total ?? 0
  const perPage = store.pagination?.perPage ?? limit.value
  if (total === 0) return 0
  return Math.min(page.value * perPage, total)
})

function titleOf(plan) {
  return `Simulado #${plan.simulationId}`
}

function statusLabel(plan) {
  if (plan.status === 'completed') return { label: 'CONCLUÍDO', classes: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' }
  if (plan.status === 'failed') return { label: 'FALHOU', classes: 'bg-error-container text-on-error-container' }
  return { label: plan.status?.toUpperCase?.() || 'EM ANDAMENTO', classes: 'bg-surface-container text-on-surface-variant' }
}

function openPlan(plan) {
  // Backend usa o `:id` como `simulationId` no endpoint GET /exams/:id/study-plan
  router.push({ name: 'study-plan-detail', params: { id: plan.simulationId } })
}

async function fetchPlans() {
  await store.listStudyPlans({ page: page.value, limit: limit.value })
}

onMounted(() => {
  fetchPlans().catch(() => {})
})
</script>

<template>
  <AppLayout title="Planos de estudos">
    <div class="space-y-stack-lg">
      <section>
        <h2 class="font-headline-lg text-headline-lg">Planos de estudos</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Seus planos personalizados gerados pela IA.</p>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <ValidationMessages :message="store.error" class="mb-stack-md" />

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">PLANO</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>

            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="3" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>

              <tr v-else-if="store.studyPlans.length === 0">
                <td colspan="3" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">Você ainda não possui planos de estudos.</p>
                </td>
              </tr>

              <tr
                v-for="plan in store.studyPlans"
                :key="plan.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4">
                  <p class="font-bold text-on-surface">{{ titleOf(plan) }}</p>
                  <p class="mt-0.5 text-xs text-on-surface-variant">
                    {{ (plan.content?.errors || []).length }} erros • {{ (plan.content?.attentionPoints || []).length }} pontos de atenção
                  </p>
                </td>
                <td class="px-2 py-4">
                  <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="statusLabel(plan).classes">
                    {{ statusLabel(plan).label }}
                  </span>
                </td>
                <td class="px-2 py-4 text-right">
                  <button
                    type="button"
                    class="p-2 text-on-surface-variant transition-colors hover:text-primary"
                    :aria-label="`Ver detalhes de ${titleOf(plan)}`"
                    @click="openPlan(plan)"
                  >
                    <AppIcon name="eye" :size="18" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!store.loading && store.studyPlans.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.pagination?.total || 0 }} planos
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page <= 1"
              @click="page = page - 1; fetchPlans().catch(() => {})"
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
              @click="page = page + 1; fetchPlans().catch(() => {})"
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
