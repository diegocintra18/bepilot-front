<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubjectsStore } from '@/stores/subjects'
import { useCoursesStore } from '@/stores/courses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useSubjectsStore()
const coursesStore = useCoursesStore()

const isEdit = computed(() => route.name === 'subject-edit')
const subjectId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Assunto' : 'Novo Assunto'))

const form = reactive({
  name: '',
  description: '',
  status: 'active',
  sortOrder: 0,
  courseIds: [],
})
const fieldErrors = reactive({ name: '', courseIds: '' })
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
const loadingCourses = ref(false)
const notFound = ref(false)

const formRef = ref(null)

function autoResizeTextarea(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
  el.style.overflow = 'hidden'
}

function autoResizeAllTextareas() {
  if (!formRef.value) return
  formRef.value.querySelectorAll('textarea').forEach((t) => autoResizeTextarea(t))
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
    const subject = await store.getSubject(subjectId.value)
    form.name = subject.name
    form.description = subject.description || ''
    form.status = subject.status
    form.sortOrder = subject.sortOrder
    form.courseIds = (subject.courses || []).map((course) => course.id)
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar o assunto.'
    }
  } finally {
    fetching.value = false
  }

  await nextTick()
  autoResizeAllTextareas()
})

function validate() {
  fieldErrors.name = ''
  fieldErrors.courseIds = ''
  let valid = true

  if (!form.name.trim()) {
    fieldErrors.name = 'Informe o nome do assunto.'
    valid = false
  }
  if (form.courseIds.length === 0) {
    fieldErrors.courseIds = 'Selecione ao menos um curso.'
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
    description: form.description.trim() || null,
    status: form.status,
    sortOrder: Number(form.sortOrder) || 0,
    courseIds: form.courseIds,
  }
  try {
    if (isEdit.value) {
      await store.updateSubject(subjectId.value, payload)
    } else {
      await store.createSubject(payload)
    }
    router.push({ name: 'subjects' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    apiError.value = error.message || 'Não foi possível salvar o assunto.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'subjects' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para assuntos
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Assunto não encontrado</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          O assunto que você tentou editar não existe ou foi removido.
        </p>
        <RouterLink
          :to="{ name: 'subjects' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para assuntos
        </RouterLink>
      </section>

      <section v-else-if="fetching" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <section v-else class="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">
          {{ isEdit ? 'Editar assunto' : 'Novo assunto' }}
        </h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          {{ isEdit ? 'Atualize as informações do assunto.' : 'Preencha os dados para criar um novo assunto.' }}
        </p>

        <ValidationMessages :message="apiError" class="mt-stack-md" />

        <form
          ref="formRef"
          novalidate
          class="mt-stack-lg flex flex-col gap-stack-md"
          @submit.prevent="submit"
        >
          <FormField :error="fieldErrors.name" label="Nome" name="name">
            <template #default="{ id, error }">
              <input
                :id="id"
                v-model="form.name"
                type="text"
                name="name"
                autocomplete="off"
                placeholder="Ex: Meteorologia"
                :aria-describedby="error ? `${id}-error` : undefined"
                class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              >
            </template>
          </FormField>

          <FormField label="Descrição" name="description">
            <template #default="{ id }">
              <textarea
                :id="id"
                v-model="form.description"
                name="description"
                rows="3"
                placeholder="Descrição opcional do assunto"
                class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @input="autoResizeTextarea($event.target)"
              />
            </template>
          </FormField>

          <div>
            <span class="mb-stack-sm block font-button-text text-button-text text-on-surface">Cursos</span>
            <div
              v-if="loadingCourses"
              class="flex items-center justify-center gap-3 rounded-lg border border-outline-variant px-4 py-8"
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
              class="rounded-lg border border-outline-variant px-4 py-8 text-center font-body-md text-body-md text-on-surface-variant"
            >
              Nenhum curso cadastrado. Crie um curso antes de associar assuntos.
            </div>
            <div
              v-else
              class="grid grid-cols-1 gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2"
              role="group"
              aria-labelledby="courses-label"
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
            <p v-if="fieldErrors.courseIds" id="courseIds-error" role="alert" class="mt-stack-sm text-body-md font-medium text-error">
              {{ fieldErrors.courseIds }}
            </p>
          </div>

          <FormField label="Ordem de exibição" name="sortOrder">
            <template #default="{ id }">
              <input
                :id="id"
                v-model.number="form.sortOrder"
                type="number"
                name="sortOrder"
                min="0"
                class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              >
            </template>
          </FormField>

          <div class="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
            <div>
              <p class="font-button-text text-button-text text-on-surface">Assunto ativo</p>
              <p class="text-sm text-on-surface-variant">Assuntos ativos ficam disponíveis para os alunos.</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="form.status === 'active'"
              :aria-label="form.status === 'active' ? 'Desativar assunto' : 'Ativar assunto'"
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
              :to="{ name: 'subjects' }"
              class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Cancelar
            </RouterLink>
            <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
              {{ isEdit ? 'Salvar alterações' : 'Criar assunto' }}
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  </AppLayout>
</template>
