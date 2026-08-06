import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { examsApi } from '@/api/exams'

const STORAGE_KEY = 'bepilot.simulation'
const AUTOSAVE_DEBOUNCE_MS = 800

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function writeLocal(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // armazenamento indisponível: autosave no servidor permanece como fonte principal
  }
}

export const useSimulationStore = defineStore('simulation', () => {
  const session = ref(null)
  const questions = ref([])
  const answers = ref({})
  const currentIndex = ref(0)
  const remainingSeconds = ref(0)
  const status = ref('idle') // idle | starting | loading | in_progress | submitting | submitted | expired
  const result = ref(null)
  const review = ref(null)
  const error = ref('')
  const savedAt = ref(null)
  const autosavePending = ref(false)
  const finishedSessionId = ref(null)

  let autosaveTimer = null
  let activeQuestionId = null
  let entryTime = 0

  const totalQuestions = computed(() => session.value?.totalQuestions ?? questions.value.length)
  const answeredCount = computed(
    () => Object.values(answers.value).filter((a) => a.selectedOptionId != null).length,
  )
  const hasUnanswered = computed(() => answeredCount.value < totalQuestions.value)
  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

  function persistLocal() {
    writeLocal({
      sessionId: session.value?.id ?? null,
      session: session.value,
      questions: questions.value,
      answers: answers.value,
      currentIndex: currentIndex.value,
    })
  }

  function clearLocal() {
    localStorage.removeItem(STORAGE_KEY)
  }

  function buildAnswersPayload() {
    return questions.value.map((q) => {
      const a = answers.value[q.id]
      return {
        questionId: q.id,
        selectedOptionId: a?.selectedOptionId ?? null,
        responseTimeMilliseconds: Math.round(a?.responseTimeMilliseconds ?? 0),
      }
    })
  }

  function beginQuestion(index) {
    accumulateCurrentQuestion()
    currentIndex.value = index
    const q = questions.value[index]
    activeQuestionId = q ? q.id : null
    entryTime = q ? Date.now() : 0
  }

  function accumulateCurrentQuestion() {
    if (activeQuestionId == null || !entryTime) return
    const elapsed = Date.now() - entryTime
    if (elapsed > 0) {
      const current =
        answers.value[activeQuestionId] ||
        (answers.value[activeQuestionId] = { selectedOptionId: null, responseTimeMilliseconds: 0 })
      current.responseTimeMilliseconds = Math.round((current.responseTimeMilliseconds || 0) + elapsed)
    }
    activeQuestionId = null
    entryTime = 0
  }

  function selectAnswer(questionId, optionId) {
    if (!answers.value[questionId]) {
      answers.value[questionId] = { selectedOptionId: null, responseTimeMilliseconds: 0 }
    }
    answers.value[questionId].selectedOptionId = optionId
    persistLocal()
    scheduleAutosave()
  }

  function goToQuestion(index) {
    if (index < 0 || index >= questions.value.length) return
    beginQuestion(index)
    persistLocal()
  }

  function scheduleAutosave() {
    autosavePending.value = true
    clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      autosave()
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  async function autosave() {
    clearTimeout(autosaveTimer)
    if (!session.value || status.value !== 'in_progress') {
      autosavePending.value = false
      return
    }
    try {
      await examsApi.saveAnswers(session.value.id, buildAnswersPayload())
      savedAt.value = Date.now()
    } catch {
      // a persistência local continua como reforço; falha de autosave é silenciosa
    } finally {
      autosavePending.value = false
    }
  }

  async function startSimulation({ courseId, subjectId }) {
    status.value = 'starting'
    error.value = ''
    result.value = null
    finishedSessionId.value = null
    try {
      const started = await examsApi.start({
        course_id: courseId,
        subject_id: subjectId || null,
      })
      const { questions: sessionQuestions } = await examsApi.questions(started.id)
      session.value = started
      questions.value = sessionQuestions || []
      answers.value = {}
      currentIndex.value = 0
      remainingSeconds.value = started.durationSeconds ?? 0
      status.value = 'in_progress'
      beginQuestion(0)
      persistLocal()
      return started.id
    } catch (err) {
      status.value = 'idle'
      error.value = err.message || 'Não foi possível iniciar o simulado.'
      throw err
    }
  }

  async function resumeSession(sessionId) {
    status.value = 'loading'
    error.value = ''
    try {
      const data = await examsApi.resume(sessionId)
      if (data.status === 'submitted') {
        status.value = 'submitted'
        return { action: 'result' }
      }
      if (data.status === 'expired') {
        status.value = 'expired'
        result.value = data.result || null
        finishedSessionId.value = sessionId
        return { action: 'result' }
      }
      session.value = data.session
      questions.value = data.questions || []
      answers.value = {}
      for (const a of data.answers || []) {
        answers.value[a.questionId] = {
          selectedOptionId: a.selectedOptionId ?? null,
          responseTimeMilliseconds: Math.round(a.responseTimeMilliseconds ?? 0),
        }
      }
      const local = readLocal()
      let merged = false
      if (local && local.sessionId === sessionId && local.answers) {
        for (const [qid, localAnswer] of Object.entries(local.answers)) {
          const current = answers.value[qid]
          const localSelected = localAnswer.selectedOptionId ?? null
          if (
            !current ||
            current.selectedOptionId !== localSelected ||
            (current.responseTimeMilliseconds || 0) < (localAnswer.responseTimeMilliseconds || 0)
          ) {
            answers.value[qid] = {
              selectedOptionId: localSelected,
              responseTimeMilliseconds: Math.max(
                current?.responseTimeMilliseconds ?? 0,
                localAnswer.responseTimeMilliseconds ?? 0,
              ),
            }
            merged = true
          }
        }
      }
      remainingSeconds.value = data.remainingSeconds ?? session.value?.durationSeconds ?? 0
      status.value = 'in_progress'
      beginQuestion(0)
      persistLocal()
      if (merged) await autosave()
      return { action: 'run' }
    } catch (err) {
      status.value = 'idle'
      error.value = err.message || 'Não foi possível retomar o simulado.'
      throw err
    }
  }

  async function finishSimulation() {
    if (!session.value) return null
    status.value = 'submitting'
    accumulateCurrentQuestion()
    persistLocal()
    try {
      const finish = await examsApi.finish(session.value.id, buildAnswersPayload())
      result.value = finish
      finishedSessionId.value = session.value.id
      status.value = 'submitted'
      clearLocal()
      return finish
    } catch (err) {
      status.value = 'in_progress'
      error.value = err.message || 'Não foi possível finalizar o simulado.'
      throw err
    }
  }

  async function loadResult(sessionId) {
    status.value = 'loading'
    error.value = ''
    if (finishedSessionId.value !== sessionId) {
      result.value = null
    }
    try {
      const detail = await examsApi.get(sessionId)
      review.value = detail
      status.value = 'submitted'
      return detail
    } catch (err) {
      status.value = 'idle'
      error.value = err.message || 'Não foi possível carregar o resultado.'
      throw err
    }
  }

  function reset() {
    clearTimeout(autosaveTimer)
    session.value = null
    questions.value = []
    answers.value = {}
    currentIndex.value = 0
    remainingSeconds.value = 0
    status.value = 'idle'
    result.value = null
    review.value = null
    error.value = ''
    savedAt.value = null
    autosavePending.value = false
    finishedSessionId.value = null
    clearLocal()
  }

  return {
    session,
    questions,
    answers,
    currentIndex,
    remainingSeconds,
    status,
    result,
    review,
    error,
    savedAt,
    autosavePending,
    totalQuestions,
    answeredCount,
    hasUnanswered,
    currentQuestion,
    startSimulation,
    resumeSession,
    finishSimulation,
    loadResult,
    selectAnswer,
    goToQuestion,
    beginQuestion,
    autosave,
    reset,
  }
})
