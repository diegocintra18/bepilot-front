<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionsStore } from '@/stores/questions'
import { useSubjectsStore } from '@/stores/subjects'
import { useCoursesStore } from '@/stores/courses'
import { QUESTION_DIFFICULTY_OPTIONS } from '@/constants/questions'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useQuestionsStore()
const subjectsStore = useSubjectsStore()
const coursesStore = useCoursesStore()

const isEdit = computed(() => route.name === 'question-edit')
const questionId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Questão' : 'Nova Questão'))

function createEmptyOptions() {
  return [
    { description: '', isCorrect: false },
    { description: '', isCorrect: false },
    { description: '', isCorrect: false },
    { description: '', isCorrect: false },
  ]
}

const form = reactive({
  statement: '',
  explanation: '',
  reference: '',
  difficulty: 'medium',
  status: 'active',
  subjectIds: [],
  options: createEmptyOptions(),
})
const correctIndex = ref(-1)
const selectedCourseIds = ref([])
const lastManualSubjectIds = ref([])
const fieldErrors = reactive({ statement: '', explanation: '', subjectIds: '', options: '' })
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
const loadingCourses = ref(false)
const loadingSubjects = ref(false)
const notFound = ref(false)
const initializingCourses = ref(true)
const formRef = ref(null)

function getSubjectIdsForCourseIds(courseIds) {
  if (!courseIds.length) return []
  return subjectsStore.allSubjects
    .filter((subject) => (subject.courses || []).some((course) => courseIds.includes(course.id)))
    .map((subject) => subject.id)
}

function getCourseIdsForSubjectIds(subjectIds) {
  if (!subjectIds.length) return []

  const subjectById = new Map(subjectsStore.allSubjects.map((s) => [s.id, s]))
  const courseIds = new Set()

  subjectIds.forEach((subjectId) => {
    const subject = subjectById.get(subjectId)
    ;(subject?.courses || []).forEach((course) => courseIds.add(course.id))
  })

  return Array.from(courseIds)
}

// Importante: ao selecionar/remover cursos, não auto-selecionamos assuntos.
// Mantemos apenas o que já está associado em `form.subjectIds` e isso fica editável
// apenas na lista de assuntos filtrada.

// Observação: não recalculamos `selectedCourseIds` a partir de `subjectIds`.
// Um mesmo assunto pode pertencer a múltiplos cursos, então isso poderia “expandir”
// a seleção de cursos automaticamente e deixar o usuário sem controle.

const filteredSubjects = computed(() => {
  const all = subjectsStore.allSubjects
  if (selectedCourseIds.value.length === 0) return all
  return all.filter((subject) =>
    (subject.courses || []).some((course) => selectedCourseIds.value.includes(course.id)),
  )
})

// Se o usuário mudar o filtro de cursos, não devemos auto-mudar a seleção de assuntos.
// Mantemos um snapshot do que o usuário marcou e restauramos caso algum re-render cause
// “seleção em massa” de assuntos.
watch(
  () => form.subjectIds,
  (next) => {
    lastManualSubjectIds.value = [...next]
  },
  { deep: true },
)

watch(selectedCourseIds, () => {
  if (initializingCourses.value) return
  form.subjectIds = [...lastManualSubjectIds.value]
})

watch(
  () => [form.statement, form.explanation],
  async () => {
    await nextTick()
    autoResizeAllTextareas()
  },
)

function autoResizeTextarea(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
  // Evita scrollbar interna após expandir
  el.style.overflow = 'hidden'
}

function autoResizeAllTextareas() {
  if (!formRef.value) return
  formRef.value.querySelectorAll('textarea').forEach((t) => autoResizeTextarea(t))
}

function subjectCourses(subject) {
  const names = (subject.courses || []).map((course) => course.name)
  return names.length ? names.join(', ') : 'Sem cursos associados'
}

  onMounted(async () => {
  loadingCourses.value = true
  loadingSubjects.value = true
  try {
    await Promise.all([coursesStore.fetchAllCourses(), subjectsStore.fetchAllSubjects()])
  } catch {
    apiError.value = 'Não foi possível carregar cursos e assuntos disponíveis.'
  } finally {
    loadingCourses.value = false
    loadingSubjects.value = false
  }

  if (!isEdit.value) {
    initializingCourses.value = false
    await nextTick()
    autoResizeAllTextareas()
    return
  }
  fetching.value = true
  try {
    const question = await store.getQuestion(questionId.value)
    form.statement = question.statement
    form.explanation = question.explanation
    form.reference = question.reference || ''
    form.difficulty = question.difficulty
    form.status = question.status
    form.subjectIds = (question.subjects || []).map((subject) => subject.id)
    form.options = (question.options || []).map((option) => ({
      description: option.description,
      isCorrect: option.isCorrect,
    }))
    correctIndex.value = form.options.findIndex((option) => option.isCorrect)

    // Pré-seleciona os cursos correspondentes aos assuntos já associados.
    selectedCourseIds.value = getCourseIdsForSubjectIds(form.subjectIds)

    await nextTick()
    lastManualSubjectIds.value = [...form.subjectIds]
    autoResizeAllTextareas()
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar a questão.'
    }
  } finally {
    fetching.value = false
    initializingCourses.value = false
  }
})

function markCorrect(index) {
  form.options.forEach((option, i) => {
    option.isCorrect = i === index
  })
  correctIndex.value = index
}

function validate() {
  fieldErrors.statement = ''
  fieldErrors.explanation = ''
  fieldErrors.subjectIds = ''
  fieldErrors.options = ''
  let valid = true

  if (!form.statement.trim()) {
    fieldErrors.statement = 'Informe o enunciado da questão.'
    valid = false
  }
  if (!form.explanation.trim()) {
    fieldErrors.explanation = 'Informe a explicação da resposta.'
    valid = false
  }
  if (form.subjectIds.length === 0) {
    fieldErrors.subjectIds = 'Selecione ao menos um assunto.'
    valid = false
  }
  if (form.options.some((option) => !option.description.trim())) {
    fieldErrors.options = 'Preencha todas as 4 opções.'
    valid = false
  } else if (form.options.filter((option) => option.isCorrect).length !== 1) {
    fieldErrors.options = 'Marque exatamente uma opção correta.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  const payload = {
    statement: form.statement.trim(),
    explanation: form.explanation.trim(),
    reference: form.reference.trim() || null,
    difficulty: form.difficulty,
    status: form.status,
    subjectIds: form.subjectIds,
    options: form.options.map((option) => ({
      description: option.description.trim(),
      isCorrect: option.isCorrect,
    })),
  }
  try {
    if (isEdit.value) {
      await store.updateQuestion(questionId.value, payload)
    } else {
      await store.createQuestion(payload)
    }
    router.push({ name: 'questions' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    apiError.value = error.message || 'Não foi possível salvar a questão.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'questions' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para questões
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Questão não encontrada</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          A questão que você tentou editar não existe ou foi removida.
        </p>
        <RouterLink
          :to="{ name: 'questions' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para questões
        </RouterLink>
      </section>

      <section v-else-if="fetching" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <section v-else class="max-w-3xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">
          {{ isEdit ? 'Editar questão' : 'Nova questão' }}
        </h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          {{ isEdit ? 'Atualize as informações da questão.' : 'Preencha os dados para criar uma nova questão.' }}
        </p>

        <ValidationMessages :message="apiError" class="mt-stack-md" />

        <form
          ref="formRef"
          novalidate
          class="mt-stack-lg flex flex-col gap-stack-md"
          @submit.prevent="submit"
        >
          <FormField :error="fieldErrors.statement" label="Enunciado" name="statement">
            <template #default="{ id, error }">
              <textarea
                :id="id"
                v-model="form.statement"
                name="statement"
                rows="3"
                placeholder="Enunciado da questão"
                :aria-describedby="error ? `${id}-error` : undefined"
                class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @input="autoResizeTextarea($event.target)"
              />
            </template>
          </FormField>

          <FormField :error="fieldErrors.explanation" label="Explicação da resposta" name="explanation">
            <template #default="{ id, error }">
              <textarea
                :id="id"
                v-model="form.explanation"
                name="explanation"
                rows="3"
                placeholder="Explicação mostrada ao aluno após responder"
                :aria-describedby="error ? `${id}-error` : undefined"
                class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @input="autoResizeTextarea($event.target)"
              />
            </template>
          </FormField>

          <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
            <FormField label="Referência (opcional)" name="reference">
              <template #default="{ id }">
                <input
                  :id="id"
                  v-model="form.reference"
                  type="text"
                  name="reference"
                  autocomplete="off"
                  placeholder="Ex: Manual de Voo"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField label="Dificuldade" name="difficulty">
              <template #default="{ id }">
                <select
                  :id="id"
                  v-model="form.difficulty"
                  name="difficulty"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option v-for="option in QUESTION_DIFFICULTY_OPTIONS" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>
            </FormField>
          </div>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">
              Filtrar por cursos (opcional)
            </span>
            <div
              v-if="loadingCourses"
              class="flex items-center justify-center gap-3 rounded-lg border border-outline-variant px-4 py-6"
            >
              <span
                class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
                role="status"
                aria-label="Carregando cursos"
              />
              <span class="font-body-md text-body-md text-on-surface-variant">Carregando cursos...</span>
            </div>
            <div
              v-else-if="coursesStore.allCourses.length === 0"
              class="rounded-lg border border-outline-variant px-4 py-6 text-center font-body-md text-body-md text-on-surface-variant"
            >
              Nenhum curso cadastrado.
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2"
              role="group"
              aria-labelledby="course-filter-label"
            >
              <label
                v-for="course in coursesStore.allCourses"
                :key="course.id"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-surface-container-low"
              >
                <input
                  v-model="selectedCourseIds"
                  type="checkbox"
                  name="courseFilter"
                  :value="course.id"
                  class="h-4 w-4 shrink-0 accent-primary"
                >
                <span class="min-w-0">
                  <span class="block truncate font-body-md text-body-md text-on-surface">{{ course.name }}</span>
                  <span class="block text-xs text-on-surface-variant">{{ course.code }}</span>
                </span>
              </label>
            </div>
            <p class="mt-stack-sm text-sm text-on-surface-variant">
              Marque cursos para ver abaixo apenas os assuntos desses cursos.
            </p>
          </div>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">Assuntos</span>
            <div
              v-if="loadingSubjects"
              class="flex items-center justify-center gap-3 rounded-lg border border-outline-variant px-4 py-6"
            >
              <span
                class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
                role="status"
                aria-label="Carregando assuntos"
              />
              <span class="font-body-md text-body-md text-on-surface-variant">Carregando assuntos...</span>
            </div>
            <div
              v-else-if="filteredSubjects.length === 0"
              class="rounded-lg border border-outline-variant px-4 py-6 text-center font-body-md text-body-md text-on-surface-variant"
            >
              {{
                subjectsStore.allSubjects.length === 0
                  ? 'Nenhum assunto cadastrado. Crie um assunto antes de associar questões.'
                  : 'Nenhum assunto encontrado para os cursos selecionados.'
              }}
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2"
              role="group"
              aria-labelledby="subjects-label"
            >
              <label
                v-for="subject in filteredSubjects"
                :key="subject.id"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-surface-container-low"
              >
                <input
                  v-model="form.subjectIds"
                  type="checkbox"
                  name="subjectIds"
                  :value="subject.id"
                  class="h-4 w-4 shrink-0 accent-primary"
                >
                <span class="min-w-0">
                  <span class="block truncate font-body-md text-body-md text-on-surface">{{ subject.name }}</span>
                  <span class="block truncate text-xs text-on-surface-variant">{{ subjectCourses(subject) }}</span>
                </span>
              </label>
            </div>
            <p v-if="fieldErrors.subjectIds" id="subjectIds-error" role="alert" class="mt-stack-sm text-body-md font-medium text-error">
              {{ fieldErrors.subjectIds }}
            </p>
          </div>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">
              Opções (marque a correta)
            </span>
            <div
              class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              role="group"
              aria-labelledby="options-label"
            >
              <div
                v-for="(option, index) in form.options"
                :key="index"
                class="flex items-center gap-3 border-b border-surface-container py-3 last:border-0 last:pb-0"
              >
                <label class="flex shrink-0 items-center gap-2 font-button-text text-button-text text-on-surface-variant">
                  <input
                    type="radio"
                    name="correctOption"
                    class="h-4 w-4 shrink-0 accent-primary"
                    :checked="correctIndex === index"
                    :aria-label="`Marcar opção ${index + 1} como correta`"
                    @change="markCorrect(index)"
                  >
                  Correta
                </label>
                <textarea
                  v-model="option.description"
                  :name="`option-${index}`"
                  rows="1"
                  :placeholder="`Opção ${index + 1}`"
                  class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  @input="autoResizeTextarea($event.target)"
                />
              </div>
            </div>
            <p v-if="fieldErrors.options" id="options-error" role="alert" class="mt-stack-sm text-body-md font-medium text-error">
              {{ fieldErrors.options }}
            </p>
          </div>

          <div class="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
            <div>
              <p class="font-button-text text-button-text text-on-surface">Questão ativa</p>
              <p class="text-sm text-on-surface-variant">Questões ativas ficam disponíveis para os alunos.</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="form.status === 'active'"
              :aria-label="form.status === 'active' ? 'Desativar questão' : 'Ativar questão'"
              class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              :class="form.status === 'active' ? 'bg-primary' : 'bg-surface-variant'"
              @click="form.status = form.status === 'active' ? 'inactive' : 'active'"
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-surface-container-lowest transition-transform"
                :class="form.status === 'active' ? 'translate-x-5' : ''"
              />
            </button>
          </div>

          <div class="flex flex-col-reverse gap-3 pt-stack-sm sm:flex-row sm:justify-end">
            <RouterLink
              :to="{ name: 'questions' }"
              class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Cancelar
            </RouterLink>
            <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
              {{ isEdit ? 'Salvar alterações' : 'Criar questão' }}
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  </AppLayout>
</template>
