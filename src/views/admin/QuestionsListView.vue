<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuestionsStore } from '@/stores/questions'
import { useSubjectsStore } from '@/stores/subjects'
import { useCoursesStore } from '@/stores/courses'
import { QUESTION_DIFFICULTY_LABELS, QUESTION_DIFFICULTY_OPTIONS, QUESTION_DIFFICULTY_CLASSES } from '@/constants/questions'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const store = useQuestionsStore()
const subjectsStore = useSubjectsStore()
const coursesStore = useCoursesStore()

const searchInput = ref(store.filters.search)
const difficultyFilter = ref(store.filters.difficulty)
const statusFilter = ref(store.filters.status)
const subjectFilter = ref(store.filters.subjectId)
const courseFilter = ref(store.filters.courseId)
const confirmDelete = ref(null)
const deleting = ref(false)
const actionError = ref('')

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativas' },
  { value: 'inactive', label: 'Inativas' },
]

const pageStart = computed(() => (store.meta.currentPage - 1) * store.meta.perPage + 1)
const pageEnd = computed(() => Math.min(store.meta.currentPage * store.meta.perPage, store.meta.total))

function subjectNames(question) {
  const names = (question.subjects || []).map((subject) => subject.name)
  return names.length ? names.join(', ') : '—'
}

onMounted(async () => {
  store.fetchQuestions()
  try {
    await Promise.all([subjectsStore.fetchAllSubjects(), coursesStore.fetchAllCourses()])
  } catch {
    // filter dropdowns are optional; questions list still loads
  }
})

function applySearch() {
  store.setSearch(searchInput.value)
}

function changeDifficulty() {
  store.setDifficulty(difficultyFilter.value)
}

function changeStatus() {
  store.setStatus(statusFilter.value)
}

function changeSubject() {
  store.setSubject(subjectFilter.value)
}

function changeCourse() {
  store.setCourse(courseFilter.value)
}

function askDelete(question) {
  actionError.value = ''
  confirmDelete.value = question
}

async function handleDelete() {
  if (!confirmDelete.value) return
  deleting.value = true
  actionError.value = ''
  try {
    await store.deleteQuestion(confirmDelete.value.id)
    await store.fetchQuestions()
    if (store.questions.length === 0 && store.meta.currentPage > 1) {
      store.goToPage(store.meta.currentPage - 1)
    }
  } catch (error) {
    actionError.value = error.message || 'Não foi possível excluir a questão.'
  } finally {
    deleting.value = false
    confirmDelete.value = null
  }
}
</script>

<template>
  <AppLayout title="Questões">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Gerenciar Questões</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Crie e organize as questões e associe-as aos assuntos e cursos.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'question-new' }"
          class="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <AppIcon name="plus-circle" :size="20" />
          Nova Questão
        </RouterLink>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form class="flex w-full max-w-md gap-2" role="search" @submit.prevent="applySearch">
            <input
              v-model="searchInput"
              type="search"
              name="search"
              placeholder="Buscar por enunciado..."
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
              Dificuldade
              <select
                v-model="difficultyFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeDifficulty"
              >
                <option value="">Todas as dificuldades</option>
                <option v-for="option in QUESTION_DIFFICULTY_OPTIONS" :key="option.value" :value="option.value">
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
              Assunto
              <select
                v-model="subjectFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeSubject"
              >
                <option value="">Todos os assuntos</option>
                <option v-for="subject in subjectsStore.allSubjects" :key="subject.id" :value="String(subject.id)">
                  {{ subject.name }}
                </option>
              </select>
            </label>

            <label class="flex items-center gap-2 font-button-text text-button-text text-on-surface-variant">
              Curso
              <select
                v-model="courseFilter"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @change="changeCourse"
              >
                <option value="">Todos os cursos</option>
                <option v-for="course in coursesStore.allCourses" :key="course.id" :value="String(course.id)">
                  {{ course.code }} — {{ course.name }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <ValidationMessages :message="actionError" class="mt-stack-md" />
        <ValidationMessages v-if="store.error && !store.loading" :message="store.error" class="mt-stack-md" />

        <div class="mt-stack-lg overflow-x-auto">
          <table class="w-full text-left">
            <thead class="border-b border-outline-variant">
              <tr class="font-label-caps text-label-caps text-on-surface-variant">
                <th class="px-2 py-3">ENUNCIADO</th>
                <th class="px-2 py-3">ASSUNTOS</th>
                <th class="px-2 py-3">DIFICULDADE</th>
                <th class="px-2 py-3">STATUS</th>
                <th class="px-2 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="font-body-md">
              <tr v-if="store.loading">
                <td colspan="5" class="px-2 py-10 text-center">
                  <span
                    class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                </td>
              </tr>
              <tr v-else-if="store.questions.length === 0">
                <td colspan="5" class="px-2 py-10 text-center">
                  <p class="font-body-md text-body-md text-on-surface-variant">
                    Nenhuma questão encontrada.
                  </p>
                </td>
              </tr>
              <tr
                v-for="question in store.questions"
                :key="question.id"
                class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
              >
                <td class="px-2 py-4">
                  <p class="max-w-[360px] truncate text-sm text-on-surface" :title="question.statement">
                    {{ question.statement }}
                  </p>
                </td>
                <td class="px-2 py-4">
                  <p class="max-w-[220px] truncate text-sm text-on-surface-variant" :title="subjectNames(question)">
                    {{ subjectNames(question) }}
                  </p>
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="QUESTION_DIFFICULTY_CLASSES[question.difficulty]"
                  >
                    {{ QUESTION_DIFFICULTY_LABELS[question.difficulty] || question.difficulty }}
                  </span>
                </td>
                <td class="px-2 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="
                      question.status === 'active'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        : 'bg-error-container text-on-error-container'
                    "
                  >
                    {{ question.status === 'active' ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td class="px-2 py-4">
                  <div class="flex justify-end gap-1">
                    <RouterLink
                      :to="{ name: 'question-edit', params: { id: question.id } }"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      :aria-label="`Editar questão ${question.id}`"
                    >
                      <AppIcon name="edit" :size="18" />
                    </RouterLink>
                    <button
                      type="button"
                      class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                      :aria-label="`Excluir questão ${question.id}`"
                      @click="askDelete(question)"
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
          v-if="!store.loading && store.questions.length > 0"
          class="mt-stack-lg flex flex-col items-center justify-between gap-4 border-t border-outline-variant pt-stack-md md:flex-row"
        >
          <p class="font-body-md text-body-md text-on-surface-variant">
            Mostrando {{ pageStart }}–{{ pageEnd }} de {{ store.meta.total }} questões
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
      title="Excluir questão"
      :message="confirmDelete ? 'Tem certeza que deseja excluir esta questão? Esta ação não poderá ser desfeita.' : ''"
      confirm-label="Excluir"
      :loading="deleting"
      @cancel="confirmDelete = null"
      @confirm="handleDelete"
    />
  </AppLayout>
</template>
