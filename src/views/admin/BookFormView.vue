<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useCoursesStore } from '@/stores/courses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useBooksStore()
const coursesStore = useCoursesStore()

const isEdit = computed(() => route.name === 'book-edit')
const bookId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Livro' : 'Novo Livro'))

const form = reactive({
  name: '',
  author: '',
  coverImageUrl: '',
  link: '',
  status: 'active',
  courseIds: [],
})

const fieldErrors = reactive({ name: '', author: '', link: '', coverImageUrl: '', courseIds: '' })
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
const loadingCourses = ref(false)
const notFound = ref(false)
const uploading = ref(false)

async function uploadCover(file) {
  if (!file) return
  uploading.value = true
  apiError.value = ''
  try {
    const result = await store.uploadCover(file)
    form.coverImageUrl = result.coverImageUrl || ''
  } catch (error) {
    apiError.value = error.message || 'Não foi possível fazer upload da capa.'
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  loadingCourses.value = true
  try {
    await coursesStore.fetchAllCourses()
  } catch {
    apiError.value = 'Não foi possível carregar os cursos disponíveis.'
  } finally {
    loadingCourses.value = false
  }

  if (!isEdit.value) return
  fetching.value = true
  try {
    const book = await store.getBook(bookId.value)
    form.name = book.name
    form.author = book.author
    form.coverImageUrl = book.coverImageUrl || ''
    form.link = book.link
    form.status = book.status
    form.courseIds = (book.courses || []).map((c) => c.id)
  } catch (error) {
    if (error.kind === 'notfound') notFound.value = true
    else apiError.value = error.message || 'Não foi possível carregar o livro.'
  } finally {
    fetching.value = false
  }
})

function validate() {
  fieldErrors.name = ''
  fieldErrors.author = ''
  fieldErrors.link = ''
  fieldErrors.coverImageUrl = ''
  fieldErrors.courseIds = ''

  let valid = true
  if (!form.name.trim()) {
    fieldErrors.name = 'Informe o nome do livro.'
    valid = false
  }
  if (!form.author.trim()) {
    fieldErrors.author = 'Informe o autor.'
    valid = false
  }
  if (!form.coverImageUrl.trim()) {
    fieldErrors.coverImageUrl = 'Faça upload da imagem de capa.'
    valid = false
  }
  if (!form.link.trim()) {
    fieldErrors.link = 'Informe o link.'
    valid = false
  }
  if (!form.courseIds.length) {
    fieldErrors.courseIds = 'Selecione ao menos um curso recomendado.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  const payload = {
    name: form.name.trim(),
    author: form.author.trim(),
    coverImageUrl: form.coverImageUrl.trim() || null,
    link: form.link.trim(),
    status: form.status,
    courseIds: form.courseIds,
  }
  try {
    if (isEdit.value) {
      await store.updateBook(bookId.value, payload)
    } else {
      await store.createBook(payload)
    }
    router.push({ name: 'books' })
  } catch (error) {
    if (error.kind === 'validation') {
      // backend retorna `errors: [{ field, message }]`
      if (Array.isArray(error.fieldErrors)) {
        error.fieldErrors.forEach(({ field, message }) => {
          if (field in fieldErrors) fieldErrors[field] = message
        })
      }
    }
    apiError.value = error.message || 'Não foi possível salvar o livro.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'books' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para livros
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Livro não encontrado</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">O livro que você tentou editar não existe ou foi removido.</p>
        <RouterLink
          :to="{ name: 'books' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para livros
        </RouterLink>
      </section>

      <section v-else-if="fetching" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando" />
      </section>

      <section v-else class="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">{{ isEdit ? 'Editar livro' : 'Novo livro' }}</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">{{ isEdit ? 'Atualize as informações do livro.' : 'Preencha os dados para criar um novo livro.' }}</p>

        <ValidationMessages :message="apiError" class="mt-stack-md" />

        <form novalidate class="mt-stack-lg flex flex-col gap-stack-md" @submit.prevent="submit">
          <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
            <FormField :error="fieldErrors.name" label="Nome" name="name">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.name"
                  type="text"
                  name="name"
                  autocomplete="off"
                  placeholder="Ex: Manual de Voo - Parte 1"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField :error="fieldErrors.author" label="Autor" name="author">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.author"
                  type="text"
                  name="author"
                  autocomplete="off"
                  placeholder="Ex: John Doe"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>
          </div>

          <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
            <FormField label="Link" name="link" :error="fieldErrors.link">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.link"
                  type="url"
                  name="link"
                  autocomplete="off"
                  placeholder="https://..."
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <div class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <p class="font-button-text text-button-text text-on-surface">Status</p>
              <p class="text-sm text-on-surface-variant">Livros ativos ficam disponíveis para os alunos.</p>
              <div class="mt-stack-sm flex items-center gap-3">
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                  :class="form.status === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'"
                  @click="form.status = 'active'"
                >
                  Ativo
                </button>
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-bold transition-colors"
                  :class="form.status === 'inactive' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'"
                  @click="form.status = 'inactive'"
                >
                  Inativo
                </button>
              </div>
            </div>
          </div>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">Imagem de capa</span>
            <div class="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  class="w-full text-on-surface-variant"
                  @change="(e) => uploadCover(e.target.files?.[0])"
                >
                <p v-if="fieldErrors.coverImageUrl" class="mt-stack-sm text-sm font-medium text-error">{{ fieldErrors.coverImageUrl }}</p>
                <p v-if="uploading" class="mt-stack-sm text-sm text-on-surface-variant">Enviando imagem...</p>
              </div>
              <div class="shrink-0">
                <img
                  v-if="form.coverImageUrl"
                  :src="form.coverImageUrl"
                  alt="Capa do livro"
                  class="h-28 w-28 rounded-lg object-cover"
                >
                <div v-else class="h-28 w-28 rounded-lg bg-surface-container" />
              </div>
            </div>
          </div>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">Cursos recomendados</span>
            <div
              v-if="loadingCourses"
              class="flex items-center justify-center gap-3 rounded-lg border border-outline-variant px-4 py-8"
            >
              <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando cursos" />
              <span class="font-body-md text-body-md text-on-surface-variant">Carregando cursos...</span>
            </div>
            <div
              v-else-if="coursesStore.allCourses.length === 0"
              class="rounded-lg border border-outline-variant px-4 py-8 text-center font-body-md text-body-md text-on-surface-variant"
            >
              Nenhum curso cadastrado.
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2"
              role="group"
            >
              <label
                v-for="course in coursesStore.allCourses"
                :key="course.id"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-surface-container-low"
              >
                <input
                  v-model="form.courseIds"
                  type="checkbox"
                  name="courseIds"
                  :value="course.id"
                  class="h-4 w-4 shrink-0 accent-primary"
                >
                <span class="min-w-0">
                  <span class="block truncate font-body-md text-body-md text-on-surface">{{ course.name }}</span>
                  <span class="block text-xs text-on-surface-variant">{{ course.code }}</span>
                </span>
              </label>
            </div>
            <p v-if="fieldErrors.courseIds" class="mt-stack-sm text-sm font-medium text-error">{{ fieldErrors.courseIds }}</p>
          </div>

          <div class="flex flex-col-reverse gap-3 pt-stack-sm sm:flex-row sm:justify-end">
            <RouterLink
              :to="{ name: 'books' }"
              class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Cancelar
            </RouterLink>
            <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
              {{ isEdit ? 'Salvar alterações' : 'Criar livro' }}
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  </AppLayout>
</template>
