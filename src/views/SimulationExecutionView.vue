<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useSimulationStore } from '@/stores/simulation'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import CountdownTimer from '@/components/simulation/CountdownTimer.vue'
import QuestionCard from '@/components/simulation/QuestionCard.vue'
import QuestionNavigator from '@/components/simulation/QuestionNavigator.vue'

const route = useRoute()
const router = useRouter()
const store = useSimulationStore()

const sessionId = computed(() => Number(route.params.id))
const loading = ref(true)
const loadFailed = ref(false)
const submitting = ref(false)
const navigatorOpen = ref(false)
const confirmSubmitOpen = ref(false)
const confirmLeaveOpen = ref(false)

const timerSeconds = ref(0)
let timerInterval = null
let allowLeave = false
let pendingLeave = null

const examName = computed(() => store.session?.examName || store.session?.exam?.name || 'Simulado')
const progress = computed(
  () =>
    store.totalQuestions > 0
      ? `Questão ${store.currentIndex + 1} de ${store.totalQuestions}`
      : 'Carregando questões...',
)

const savedLabel = computed(() => {
  if (store.autosavePending) return 'Salvando...'
  if (store.savedAt) {
    const time = new Date(store.savedAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `Salvo às ${time}`
  }
  return 'Salvo'
})

function stopTicking() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function startTicking() {
  timerSeconds.value = store.remainingSeconds
  stopTicking()
  timerInterval = setInterval(() => {
    timerSeconds.value = Math.max(0, timerSeconds.value - 1)
    if (timerSeconds.value === 0) {
      stopTicking()
      handleTimeout()
    }
  }, 1000)
}

function handleBeforeUnload(event) {
  if (store.status === 'in_progress') {
    event.preventDefault()
    event.returnValue = ''
  }
}

function handleSelect(optionId) {
  if (submitting.value) return
  const question = store.currentQuestion
  if (question) store.selectAnswer(question.id, optionId)
}

function goPrevious() {
  if (submitting.value) return
  store.goToQuestion(store.currentIndex - 1)
}

function goNext() {
  if (submitting.value) return
  store.goToQuestion(store.currentIndex + 1)
}

function askSubmit() {
  if (store.hasUnanswered) {
    confirmSubmitOpen.value = true
  } else {
    submitSimulation()
  }
}

async function submitSimulation() {
  if (store.status !== 'in_progress' || submitting.value) return
  submitting.value = true
  confirmSubmitOpen.value = false
  try {
    await store.finishSimulation()
    allowLeave = true
    stopTicking()
    router.replace({ name: 'simulation-result', params: { id: sessionId.value } })
  } catch {
    // store.error exibe a mensagem
  } finally {
    submitting.value = false
  }
}

async function handleTimeout() {
  if (store.status !== 'in_progress') return
  await submitSimulation()
}

function confirmLeave() {
  allowLeave = true
  stopTicking()
  confirmLeaveOpen.value = false
  const target = pendingLeave
  pendingLeave = null
  if (target) router.push(target)
}

function retryLoad() {
  loadFailed.value = false
  loading.value = true
  store.error = ''
  loadSession()
}

async function loadSession() {
  loadFailed.value = false
  try {
    if (store.status !== 'in_progress' || store.session?.id !== sessionId.value) {
      const { action } = await store.resumeSession(sessionId.value)
      if (action === 'result') {
        allowLeave = true
        router.replace({ name: 'simulation-result', params: { id: sessionId.value } })
        return
      }
    }
    startTicking()
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  loadSession()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  stopTicking()
  store.autosave()
})

onBeforeRouteLeave((to, from, next) => {
  if (allowLeave || store.status !== 'in_progress') {
    next()
    return
  }
  pendingLeave = to
  confirmLeaveOpen.value = true
  next(false)
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

    <div v-else-if="loadFailed">
      <ValidationMessages :message="store.error || 'Não foi possível carregar o simulado.'" class="mb-stack-md" />
      <button
        type="button"
        class="rounded-lg bg-primary px-6 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        @click="retryLoad"
      >
        Tentar novamente
      </button>
    </div>

    <template v-else>
      <div
        class="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-5 py-4 md:px-8"
      >
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :aria-expanded="navigatorOpen"
            :aria-controls="'navigator-panel'"
            aria-label="Abrir mapa de questões"
            @click="navigatorOpen = !navigatorOpen"
          >
            <AppIcon :name="navigatorOpen ? 'close' : 'grid'" :size="20" />
          </button>
          <div>
            <p class="font-button-text text-button-text font-bold text-on-surface">{{ progress }}</p>
            <p class="font-body-md text-xs text-on-surface-variant">
              {{ store.answeredCount }} de {{ store.totalQuestions }} respondidas
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="hidden items-center gap-1.5 font-body-md text-xs text-on-surface-variant sm:flex">
            <span
              :class="store.autosavePending ? 'inline-block h-2 w-2 animate-pulse rounded-full bg-secondary' : 'inline-block h-2 w-2 rounded-full bg-tertiary'"
              aria-hidden="true"
            />
            {{ savedLabel }}
          </span>
          <CountdownTimer :seconds="timerSeconds" />
        </div>
      </div>

      <div v-if="navigatorOpen" id="navigator-panel" class="mb-stack-lg lg:hidden">
        <section
          class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift"
          aria-label="Mapa de questões"
        >
          <QuestionNavigator
            :questions="store.questions"
            :answers="store.answers"
            :current-index="store.currentIndex"
            @select="(index) => !submitting && store.goToQuestion(index)"
          />
        </section>
      </div>

      <div class="flex items-start gap-gutter">
        <div class="min-w-0 flex-1 space-y-stack-md">
          <QuestionCard
            v-if="store.currentQuestion"
            :question="store.currentQuestion"
            :question-number="store.currentIndex + 1"
            :selected-option-id="store.answers[store.currentQuestion?.id]?.selectedOptionId ?? null"
            @select="handleSelect"
          />

          <section
            v-else
            class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift"
          >
            <p class="font-body-md text-body-md text-on-surface-variant">
              Nenhuma questão disponível neste simulado.
            </p>
          </section>

          <ValidationMessages :message="store.error" />

          <div class="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              :disabled="submitting || store.currentIndex <= 0"
              class="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
              @click="goPrevious"
            >
              <AppIcon name="chevron-left" :size="18" />
              Anterior
            </button>

            <button
              type="button"
              :disabled="submitting || store.currentIndex >= store.totalQuestions - 1"
              class="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40 md:order-3"
              @click="goNext"
            >
              Próxima
              <AppIcon name="chevron-right" :size="18" />
            </button>

            <button
              type="button"
              :disabled="submitting || store.status !== 'in_progress'"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:order-2 md:w-auto"
              @click="askSubmit"
            >
              <AppIcon name="check-circle" :size="18" />
              {{ submitting ? 'Finalizando...' : 'Finalizar Simulado' }}
            </button>
          </div>
        </div>

        <aside
          class="hidden w-72 shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift lg:block"
          aria-label="Mapa de questões"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-button-text text-button-text font-bold text-on-surface">Questões</h3>
            <span class="font-label-caps text-label-caps text-on-surface-variant">
              {{ store.answeredCount }}/{{ store.totalQuestions }}
            </span>
          </div>
          <QuestionNavigator
            :questions="store.questions"
            :answers="store.answers"
            :current-index="store.currentIndex"
            @select="(index) => !submitting && store.goToQuestion(index)"
          />
          <p class="mt-stack-md border-t border-outline-variant pt-stack-md font-body-md text-xs text-on-surface-variant">
            As respostas são salvas automaticamente.
          </p>
        </aside>
      </div>
    </template>

    <ConfirmDialog
      :open="confirmSubmitOpen"
      title="Finalizar simulado"
      message="Você ainda tem questões sem resposta. Essas questões serão consideradas incorretas. Deseja realmente finalizar o simulado?"
      confirm-label="Finalizar"
      variant="primary"
      :loading="submitting"
      @cancel="confirmSubmitOpen = false"
      @confirm="submitSimulation"
    />

    <ConfirmDialog
      :open="confirmLeaveOpen"
      title="Sair do simulado"
      message="Você tem um simulado em andamento. Sair desta página pode causar perda de progresso. Deseja realmente sair?"
      confirm-label="Sair"
      variant="primary"
      @cancel="confirmLeaveOpen = false"
      @confirm="confirmLeave"
    />
  </AppLayout>
</template>
