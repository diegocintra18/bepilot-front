<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { statisticsApi } from '@/api/statistics'
import { formatDuration, formatPercentage, formatResponseTime } from '@/utils/format'
import { QUESTION_DIFFICULTY_CLASSES, QUESTION_DIFFICULTY_LABELS } from '@/constants/questions'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const courses = ref([])
const questions = ref([])

const hardestPage = ref(1)
const HARDEST_PER_PAGE = 5

function weightedAverage(items, valueKey, weightKey) {
  let totalWeight = 0
  let total = 0
  items.forEach((item) => {
    const value = Number(item.stats?.[valueKey])
    const weight = Number(item.stats?.[weightKey])
    if (Number.isFinite(value) && Number.isFinite(weight) && weight > 0) {
      total += value * weight
      totalWeight += weight
    }
  })
  return totalWeight > 0 ? total / totalWeight : null
}

const totalExams = computed(() => courses.value.reduce((sum, item) => sum + (item.stats?.totalExams || 0), 0))
const averageAccuracy = computed(() => weightedAverage(courses.value, 'averageAccuracy', 'totalExams'))
const averageTime = computed(() => weightedAverage(courses.value, 'averageCompletionTime', 'totalExams'))

const hardestQuestions = computed(() =>
  [...questions.value]
    .filter((item) => Number(item.stats?.totalViews) > 0)
    .sort((a, b) => {
      const accA = Number(a.stats?.accuracyPercentage)
      const accB = Number(b.stats?.accuracyPercentage)
      if (!Number.isFinite(accA)) return 1
      if (!Number.isFinite(accB)) return -1
      return accA - accB
    })
)

const hardestPages = computed(() => Math.max(1, Math.ceil(hardestQuestions.value.length / HARDEST_PER_PAGE)))
const hardestPageItems = computed(() => {
  const start = (hardestPage.value - 1) * HARDEST_PER_PAGE
  return hardestQuestions.value.slice(start, start + HARDEST_PER_PAGE)
})

function openCourseDetail(item) {
  router.push({ name: 'admin-course-stats', params: { courseId: item.course.id } })
}

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const [courseResult, questionResult] = await Promise.all([
      statisticsApi.courses({ page: 1, limit: 100 }),
      statisticsApi.questions({ page: 1, limit: 100 }),
    ])
    courses.value = courseResult.data || []
    questions.value = questionResult.data || []
  } catch (err) {
    loadError.value = err.message || 'Não foi possível carregar as estatísticas.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <AppLayout title="Dashboard Administrativo">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Resumo por Curso</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Acompanhe o desempenho dos alunos em todos os cursos.
          </p>
        </div>
        <button
          type="button"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text text-on-primary transition-colors hover:bg-primary-container"
          @click="loadData"
        >
          <AppIcon name="refresh" :size="18" />
          Atualizar
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
            :value="String(totalExams)"
            hint="simulados concluídos nos cursos"
          />
          <StatCard
            icon="award"
            label="Média Geral"
            :value="formatPercentage(averageAccuracy)"
            :progress="averageAccuracy"
            hint="média ponderada por simulado"
          />
          <StatCard
            icon="clock"
            label="Tempo Médio"
            :value="formatDuration(averageTime)"
            tone="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            bar-class="bg-tertiary-fixed"
            hint="tempo médio de conclusão"
          />
          <StatCard
            icon="help-circle"
            label="Questões Analisadas"
            :value="String(questions.length)"
            tone="bg-error-container text-on-error-container"
            bar-class="bg-error"
            hint="questões com dados de resposta"
          />
        </div>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Desempenho dos Cursos</h3>
            <AppIcon name="book" class="text-primary" :size="20" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-outline-variant">
                <tr class="font-label-caps text-label-caps text-on-surface-variant">
                  <th class="px-2 py-3">CURSO</th>
                  <th class="px-2 py-3">SIMULADOS</th>
                  <th class="px-2 py-3">MÉDIA DE ACERTO</th>
                  <th class="px-2 py-3">TEMPO MÉDIO</th>
                  <th class="px-2 py-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody class="font-body-md">
                <tr v-if="courses.length === 0">
                  <td colspan="5" class="px-2 py-10 text-center">
                    <p class="font-body-md text-body-md text-on-surface-variant">
                      Nenhum curso com dados ainda.
                    </p>
                  </td>
                </tr>
                <tr
                  v-for="item in courses"
                  :key="item.course.id"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4">
                    <p class="font-bold text-on-surface">{{ item.course.name }}</p>
                    <p class="text-xs text-on-surface-variant">{{ item.course.code }}</p>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">{{ item.stats.totalExams }}</td>
                  <td class="px-2 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container">
                        <div
                          class="h-full rounded-full"
                          :class="
                            item.stats.averageAccuracy >= 70
                              ? 'bg-tertiary-fixed'
                              : item.stats.averageAccuracy >= 50
                                ? 'bg-primary'
                                : 'bg-error'
                          "
                          :style="{ width: `${Math.max(0, Math.min(100, Number(item.stats.averageAccuracy ?? 0)))}%` }"
                        ></div>
                      </div>
                      <span class="font-label-caps text-xs font-bold text-on-surface-variant">
                        {{ formatPercentage(item.stats.averageAccuracy) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">
                    {{ formatDuration(item.stats.averageCompletionTime) }}
                  </td>
                  <td class="px-2 py-4 text-right">
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Ver detalhes de ${item.course.name}`"
                      @click="openCourseDetail(item)"
                    >
                      <AppIcon name="eye" :size="18" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Questões Mais Difíceis</h3>
            <AppIcon name="list" class="text-primary" :size="20" />
          </div>
          <div v-if="hardestQuestions.length === 0" class="py-8 text-center">
            <p class="font-body-md text-body-md text-on-surface-variant">
              Nenhuma questão com dados suficientes ainda.
            </p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="item in hardestPageItems"
              :key="item.question.id"
              class="rounded-lg border border-outline-variant bg-surface-container-low p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <p class="line-clamp-2 font-body-md text-body-md text-on-surface" :title="item.question.statement">
                  {{ item.question.statement }}
                </p>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="QUESTION_DIFFICULTY_CLASSES[item.question.difficulty] || 'bg-surface-container text-on-surface-variant'"
                >
                  {{ QUESTION_DIFFICULTY_LABELS[item.question.difficulty] || item.question.difficulty }}
                </span>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant">
                <span class="flex items-center gap-2">
                  <AppIcon name="eye" :size="16" />
                  {{ item.stats.totalViews }} visualizações
                </span>
                <span class="flex items-center gap-2">
                  <AppIcon name="clock" :size="16" />
                  {{ formatResponseTime(item.stats.averageResponseTimeMilliseconds) }} por resposta
                </span>
                <span
                  class="font-bold"
                  :class="
                    item.stats.accuracyPercentage < 40
                      ? 'text-error'
                      : item.stats.accuracyPercentage < 60
                        ? 'text-tertiary'
                        : 'text-on-surface-variant'
                  "
                >
                  {{ formatPercentage(item.stats.accuracyPercentage) }} de acerto
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="hardestPages > 1"
            class="mt-6 flex items-center justify-between gap-4 border-t border-outline-variant pt-stack-md"
          >
            <p class="font-body-md text-body-md text-on-surface-variant">
              Mostrando as mais difíceis
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="hardestPage <= 1"
                @click="hardestPage--"
              >
                <AppIcon name="chevron-left" :size="18" />
                Anterior
              </button>
              <span class="px-2 font-body-md text-body-md text-on-surface-variant">
                Página {{ hardestPage }} de {{ hardestPages }}
              </span>
              <button
                type="button"
                class="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="hardestPage >= hardestPages"
                @click="hardestPage++"
              >
                Próxima
                <AppIcon name="chevron-right" :size="18" />
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
