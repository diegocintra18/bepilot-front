<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSimulationStore } from '@/stores/simulation'
import { formatDuration, formatPercentage, formatResponseTime, formatDateTime } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import ReviewAccordion from '@/components/simulation/ReviewAccordion.vue'

const route = useRoute()
const router = useRouter()
const store = useSimulationStore()

const sessionId = computed(() => Number(route.params.id))
const loading = ref(true)

const result = computed(() => store.result)
const review = computed(() => store.review)

const examName = computed(
  () => review.value?.exam?.name || result.value?.examName || result.value?.exam?.name || 'Simulado',
)

const percentage = computed(() => {
  if (result.value?.percentage != null) return Number(result.value.percentage)
  return null
})

const score = computed(() => result.value?.score ?? review.value?.session?.score ?? null)

const totalCorrect = computed(() => result.value?.totalCorrect ?? review.value?.session?.totalCorrect ?? 0)
const totalWrong = computed(() => result.value?.totalWrong ?? review.value?.session?.totalWrong ?? 0)

const totalQuestions = computed(
  () =>
    result.value?.totalQuestions ??
    review.value?.exam?.totalQuestions ??
    review.value?.questions?.length ??
    0,
)

const unansweredCount = computed(() => {
  if (result.value?.unansweredCount != null) return Number(result.value.unansweredCount)
  return Math.max(0, totalQuestions.value - totalCorrect.value - totalWrong.value)
})

const minimumPassingScore = computed(
  () => result.value?.minimumPassingScore ?? review.value?.exam?.minimumPassingScore ?? null,
)

const approved = computed(
  () => result.value?.approved ?? review.value?.session?.approved ?? null,
)

const durationSeconds = computed(
  () => result.value?.durationSeconds ?? review.value?.session?.durationSeconds ?? 0,
)

const averageResponseTime = computed(() =>
  result.value?.averageResponseTimeMilliseconds != null
    ? Number(result.value.averageResponseTimeMilliseconds)
    : null,
)

const startedAt = computed(() => review.value?.session?.startedAt ?? null)

const headline = computed(() => {
  if (percentage.value != null) return formatPercentage(percentage.value)
  if (score.value != null) return String(score.value)
  return '—'
})

const statusCard = computed(() => {
  if (approved.value === true) {
    return {
      title: 'Aprovado',
      subtitle: 'Você alcançou a nota mínima exigida.',
      icon: 'check-circle',
      classes: 'border-tertiary bg-tertiary-fixed',
      titleClasses: 'text-on-tertiary-fixed-variant',
    }
  }
  return {
    title: 'Não aprovado',
    subtitle: 'Continue praticando para alcançar a nota mínima exigida.',
    icon: 'x-circle',
    classes: 'border-error bg-error-container',
    titleClasses: 'text-on-error-container',
  }
})

function goToHistory() {
  router.push({ name: 'simulation-history' })
}

function goToStart() {
  router.push({ name: 'simulation-start' })
}

onMounted(async () => {
  try {
    const detail = await store.loadResult(sessionId.value)
    if (detail?.status === 'in_progress') {
      router.replace({ name: 'simulation-execution', params: { id: sessionId.value } })
      return
    }
  } catch {
    // store.error exibe a mensagem
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout :title="examName">
    <div v-if="loading" class="flex justify-center py-20">
      <span
        class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Carregando"
      />
    </div>

    <div v-else class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Resultado do Simulado</h2>
          <p v-if="startedAt" class="font-body-md text-body-md text-on-surface-variant">
            {{ formatDateTime(startedAt) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-4">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border-2 border-primary bg-surface-container-lowest px-5 py-2.5 font-button-text text-button-text text-primary transition-colors hover:bg-primary-fixed"
            @click="goToHistory"
          >
            <AppIcon name="timer" :size="18" />
            Ver Histórico
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
            @click="goToStart"
          >
            <AppIcon name="rocket" :size="18" />
            Novo Simulado
          </button>
        </div>
      </section>

      <ValidationMessages :message="store.error" />

      <section
        class="flex flex-col items-center justify-between gap-6 rounded-xl border p-6 md:flex-row md:p-8"
        :class="statusCard.classes"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest"
            aria-hidden="true"
          >
            <AppIcon :name="statusCard.icon" :size="32" :class="approved ? 'text-tertiary' : 'text-error'" />
          </div>
          <div>
            <h3 class="font-headline-md text-headline-md font-bold" :class="statusCard.titleClasses">
              {{ statusCard.title }}
            </h3>
            <p class="font-body-md text-body-md text-on-surface-variant">{{ statusCard.subtitle }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-display-lg text-4xl font-bold text-on-surface">
            {{ headline }}
          </p>
          <p class="font-label-caps text-label-caps text-on-surface-variant">
            Nota mínima: {{ minimumPassingScore ?? '—' }}
          </p>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-gutter md:grid-cols-3">
        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant"
              aria-hidden="true"
            >
              <AppIcon name="check-circle" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Acertos</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">{{ totalCorrect }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-error-container text-on-error-container"
              aria-hidden="true"
            >
              <AppIcon name="x-circle" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Erros</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">{{ totalWrong }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
              aria-hidden="true"
            >
              <AppIcon name="help-circle" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Não respondidas</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">{{ unansweredCount }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="timer" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Tempo total</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">
                {{ formatDuration(durationSeconds) }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container"
              aria-hidden="true"
            >
              <AppIcon name="clock" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Tempo médio</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">
                {{ averageResponseTime != null ? formatResponseTime(averageResponseTime) : '—' }}
              </p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface"
              aria-hidden="true"
            >
              <AppIcon name="list" :size="20" />
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Questões</p>
              <p class="font-headline-md text-headline-md font-bold text-on-surface">{{ totalQuestions }}</p>
            </div>
          </div>
        </section>
      </div>

      <section
        v-if="review?.questions?.length"
        class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
      >
        <div class="mb-stack-md flex items-center justify-between">
          <h3 class="font-headline-md text-headline-md text-on-surface">Revisão das Questões</h3>
          <span class="font-label-caps text-label-caps text-on-surface-variant">
            {{ review.questions.length }} questões
          </span>
        </div>
        <ReviewAccordion :questions="review.questions" :answers="review.answers || []" />
      </section>
    </div>
  </AppLayout>
</template>
