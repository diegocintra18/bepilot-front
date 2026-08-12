<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { examsApi } from '@/api/exams'
import { statisticsApi } from '@/api/statistics'
import { formatDate, formatDuration, formatPercentage } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const overall = ref(null)
const bySubject = ref([])

const recentSimulations = ref([])
const recentLoading = ref(false)
const recentError = ref('')

const firstName = computed(() => auth.user?.fullName?.split(' ')[0] || 'Piloto')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

const subjectBars = computed(() =>
  [...bySubject.value]
    .map((item) => ({ name: item.subject?.name || `Assunto #${item.subjectId}`, accuracy: item.accuracyPercentage }))
    .sort((a, b) => {
      if (a.accuracy == null) return 1
      if (b.accuracy == null) return -1
      return a.accuracy - b.accuracy
    })
)

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
  if (item.approved == null) return { text: 'Em andamento', pass: null }
  return { text: item.approved ? 'APROVADO' : 'REPROVADO', pass: item.approved }
}

function openSimulation(item) {
  const name = item.approved == null ? 'simulation-execution' : 'simulation-result'
  router.push({ name, params: { id: item.id } })
}

async function loadStatistics() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await statisticsApi.me()
    overall.value = result.overall || null
    bySubject.value = result.bySubject || []
  } catch (err) {
    loadError.value = err.message || 'Não foi possível carregar suas estatísticas.'
  } finally {
    loading.value = false
  }
}

async function loadRecentSimulations() {
  recentLoading.value = true
  recentError.value = ''
  try {
    const result = await examsApi.history({ page: 1, limit: 5 })
    recentSimulations.value = result.data || []
  } catch (err) {
    recentError.value = err.message || 'Não foi possível carregar os simulados recentes.'
  } finally {
    recentLoading.value = false
  }
}

onMounted(() => {
  loadStatistics()
  loadRecentSimulations()
})
</script>

<template>
  <AppLayout title="Dashboard do Estudante">
    <div class="space-y-stack-lg">
      <section
        class="flex flex-col justify-between gap-6 border-b border-outline-variant pb-8 md:flex-row md:items-end"
      >
        <div>
          <h2 class="font-headline-lg mb-2 text-headline-lg text-on-surface">
            {{ greeting }}, {{ firstName }}!
          </h2>
          <p class="font-body-lg text-body-lg text-on-surface-variant">
            Acompanhe seu desempenho nos simulados.
          </p>
        </div>
        <button
          type="button"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-button-text text-button-text text-on-primary transition-all hover:bg-primary-container"
          @click="router.push({ name: 'simulation-start' })"
        >
          <AppIcon name="rocket" :size="20" />
          Iniciar um novo simulado
        </button>
      </section>

      <ValidationMessages v-if="loadError" :message="loadError" />

      <div v-if="loading" class="flex justify-center py-16">
        <span
          class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </div>

      <template v-else>
        <div class="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="timer"
            label="Simulados"
            :value="overall ? String(overall.totalExams) : '—'"
            :hint="overall ? (overall.totalExams === 1 ? 'simulado realizado' : 'simulados realizados') : ''"
          />
          <StatCard
            icon="check-circle"
            label="Acertos"
            :value="overall ? String(overall.totalCorrect) : '—'"
            tone="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            bar-class="bg-tertiary-fixed"
          />
          <StatCard
            icon="x-circle"
            label="Erros"
            :value="overall ? String(overall.totalWrong) : '—'"
            tone="bg-error-container text-on-error-container"
            bar-class="bg-error"
          />
          <StatCard
            icon="award"
            label="Média de Acerto"
            :value="formatPercentage(overall?.averageAccuracy)"
            :progress="overall?.averageAccuracy"
            hint="precisão média geral"
          />
        </div>

        <section
          class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
        >
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Desempenho por Assunto</h3>
            <AppIcon name="chart" class="text-primary" :size="20" />
          </div>
          <div v-if="subjectBars.length === 0" class="py-8 text-center">
            <p class="font-body-md text-body-md text-on-surface-variant">
              Realize um simulado para ver seu desempenho por assunto.
            </p>
          </div>
          <div v-else class="space-y-5">
            <div v-for="bar in subjectBars" :key="bar.name" class="flex items-center gap-4">
              <span class="w-40 shrink-0 truncate font-button-text text-button-text text-on-surface" :title="bar.name">
                {{ bar.name }}
              </span>
              <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                <div
                  class="h-full rounded-full"
                  :class="bar.accuracy >= 70 ? 'bg-tertiary-fixed' : bar.accuracy >= 50 ? 'bg-primary' : 'bg-error'"
                  :style="{ width: `${Math.max(0, Math.min(100, Number(bar.accuracy ?? 0)))}%` }"
                ></div>
              </div>
              <span class="w-14 shrink-0 text-right font-label-caps text-xs font-bold text-on-surface-variant">
                {{ formatPercentage(bar.accuracy) }}
              </span>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Simulados Recentes</h3>
            <button
              type="button"
              class="font-button-text text-sm text-primary-container"
              @click="router.push({ name: 'simulation-history' })"
            >
              Ver Histórico
            </button>
          </div>
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
                <tr v-if="recentLoading">
                  <td colspan="4" class="px-2 py-10 text-center">
                    <span
                      class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                      role="status"
                      aria-label="Carregando"
                    />
                  </td>
                </tr>
                <tr v-else-if="recentSimulations.length === 0">
                  <td colspan="4" class="px-2 py-10 text-center">
                    <p class="font-body-md text-body-md text-on-surface-variant">
                      {{ recentError || 'Nenhum simulado realizado ainda.' }}
                    </p>
                  </td>
                </tr>
                <tr
                  v-for="sim in recentSimulations"
                  :key="sim.id"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4">
                    <p class="font-bold text-on-surface">{{ titleOf(sim) }}</p>
                    <p v-if="metaOf(sim)" class="text-xs text-on-surface-variant">{{ metaOf(sim) }}</p>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">{{ formatDate(sim.startedAt) }}</td>
                  <td class="px-2 py-4">
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-bold"
                      :class="
                        resultLabel(sim).pass === null
                          ? 'bg-surface-container text-on-surface-variant'
                          : resultLabel(sim).pass
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                            : 'bg-error-container text-on-error-container'
                      "
                    >
                      {{ resultLabel(sim).text }}
                    </span>
                  </td>
                  <td class="px-2 py-4 text-right">
                    <button
                      type="button"
                      class="p-2 text-on-surface-variant transition-colors hover:text-primary"
                      :aria-label="`Ver detalhes de ${titleOf(sim)}`"
                      @click="openSimulation(sim)"
                    >
                      <AppIcon name="eye" :size="18" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
