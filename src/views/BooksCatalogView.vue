<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCoursesStore } from '@/stores/courses'
import { useSubjectsStore } from '@/stores/subjects'
import { useBooksStore } from '@/stores/books'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const coursesStore = useCoursesStore()
const subjectsStore = useSubjectsStore()
const booksStore = useBooksStore()

const courseId = ref('')
const subjectId = ref('')

const subjectOptions = computed(() => {
  if (!courseId.value) return []
  return subjectsStore.allSubjects.filter((subject) =>
    (subject.courses || []).some((course) => String(course.id) === String(courseId.value)),
  )
})

const loading = computed(() => booksStore.loading)
const error = computed(() => booksStore.error)

async function loadBooks() {
  const params = {
    page: 1,
    limit: 30,
    status: 'active',
    courseId: courseId.value ? String(courseId.value) : '',
    subjectId: subjectId.value ? String(subjectId.value) : '',
  }
  await booksStore.listPublic(params)
}

onMounted(async () => {
  await Promise.all([coursesStore.fetchAllCourses(), subjectsStore.fetchAllSubjects()])
  await loadBooks()
})

watch(courseId, async (next) => {
  subjectId.value = ''
  if (!next) {
    await loadBooks()
    return
  }
  await loadBooks()
})

watch(subjectId, async () => {
  await loadBooks()
})

function openLink(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <AppLayout title="Livros">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Catálogo de Livros</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Encontre livros recomendados pelos simulados e aprimore sua prática.
          </p>
        </div>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label class="flex flex-col gap-2">
            <span class="font-button-text text-button-text text-on-surface-variant">Curso</span>
            <select
              v-model="courseId"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="">Todos os cursos</option>
              <option v-for="course in coursesStore.allCourses" :key="course.id" :value="String(course.id)">
                {{ course.code }} — {{ course.name }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span class="font-button-text text-button-text text-on-surface-variant">Assunto</span>
            <select
              v-model="subjectId"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              :disabled="!courseId"
            >
              <option value="">Todos os assuntos</option>
              <option v-for="subject in subjectOptions" :key="subject.id" :value="String(subject.id)">
                {{ subject.name }}
              </option>
            </select>
          </label>
        </div>

        <ValidationMessages v-if="error" :message="error" class="mt-stack-md" />
      </section>

      <section>
        <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 6" :key="n" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-lift">
            <div class="h-40 w-full animate-pulse rounded-lg bg-surface-container" />
            <div class="mt-3 h-4 w-3/4 animate-pulse rounded bg-surface-container" />
            <div class="mt-2 h-3 w-2/3 animate-pulse rounded bg-surface-container" />
          </div>
        </div>

        <div v-else-if="booksStore.books.length === 0" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-10 text-center shadow-lift">
          <p class="font-body-md text-body-md text-on-surface-variant">Nenhum livro encontrado com os filtros selecionados.</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="book in booksStore.books"
            :key="book.id"
            class="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lift"
          >
            <div class="relative">
              <img
                v-if="book.coverImageUrl"
                :src="book.coverImageUrl"
                alt="Capa do livro"
                class="h-48 w-full object-cover"
                loading="lazy"
              >
              <div v-else class="h-48 w-full bg-surface-container" />
            </div>
            <div class="flex flex-col gap-3 p-5">
              <div class="min-h-[52px]">
                <h3 class="font-bold text-on-surface">{{ book.name }}</h3>
                <p class="text-sm text-on-surface-variant">{{ book.author }}</p>
              </div>
              <div class="mt-auto">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
                  @click="openLink(book.link)"
                >
                  <AppIcon name="arrow-up-right" :size="18" />
                  Saiba Mais
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
