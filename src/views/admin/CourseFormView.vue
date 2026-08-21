<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const store = useCoursesStore()

const isEdit = computed(() => route.name === 'course-edit')
const courseId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Curso' : 'Novo Curso'))

const form = reactive({
  code: '',
  name: '',
  description: '',
  isActive: true,
  sortOrder: 0,
})
const fieldErrors = reactive({ code: '', name: '' })
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
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
  if (!isEdit.value) return
  fetching.value = true
  try {
    const course = await store.getCourse(courseId.value)
    form.code = course.code
    form.name = course.name
    form.description = course.description || ''
    form.isActive = course.isActive
    form.sortOrder = course.sortOrder

    await nextTick()
    autoResizeAllTextareas()
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar o curso.'
    }
  } finally {
    fetching.value = false
  }
})

function validate() {
  fieldErrors.code = ''
  fieldErrors.name = ''
  let valid = true

  if (!form.code.trim()) {
    fieldErrors.code = 'Informe o código do curso.'
    valid = false
  }
  if (!form.name.trim()) {
    fieldErrors.name = 'Informe o nome do curso.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  const payload = {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder) || 0,
  }
  try {
    if (isEdit.value) {
      await store.updateCourse(courseId.value, payload)
    } else {
      await store.createCourse(payload)
    }
    router.push({ name: 'courses' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    apiError.value = error.message || 'Não foi possível salvar o curso.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'courses' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para cursos
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Curso não encontrado</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          O curso que você tentou editar não existe ou foi removido.
        </p>
        <RouterLink
          :to="{ name: 'courses' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para cursos
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
          {{ isEdit ? 'Editar curso' : 'Novo curso' }}
        </h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          {{ isEdit ? 'Atualize as informações do curso.' : 'Preencha os dados para criar um novo curso.' }}
        </p>

        <ValidationMessages :message="apiError" class="mt-stack-md" />

        <form
          ref="formRef"
          novalidate
          class="mt-stack-lg flex flex-col gap-stack-md"
          @submit.prevent="submit"
        >
          <div class="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
            <FormField :error="fieldErrors.code" label="Código" name="code">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.code"
                  type="text"
                  name="code"
                  autocomplete="off"
                  placeholder="Ex: PP"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField class="sm:col-span-2" :error="fieldErrors.name" label="Nome" name="name">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.name"
                  type="text"
                  name="name"
                  autocomplete="off"
                  placeholder="Ex: Piloto Privado"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>
          </div>

          <FormField label="Descrição" name="description">
            <template #default="{ id }">
              <textarea
                :id="id"
                v-model="form.description"
                name="description"
                rows="3"
                placeholder="Descrição opcional do curso"
                class="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                @input="autoResizeTextarea($event.target)"
              />
            </template>
          </FormField>

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
              <p class="font-button-text text-button-text text-on-surface">Curso ativo</p>
              <p class="text-sm text-on-surface-variant">Cursos ativos ficam disponíveis para os alunos.</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="form.isActive"
              :aria-label="form.isActive ? 'Desativar curso' : 'Ativar curso'"
              class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              :class="form.isActive ? 'bg-primary' : 'bg-surface-variant'"
              @click="form.isActive = !form.isActive"
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-surface-container-lowest transition-transform"
                :class="form.isActive ? 'translate-x-5' : ''"
              />
            </button>
          </div>

          <div class="flex flex-col-reverse gap-3 pt-stack-sm sm:flex-row sm:justify-end">
            <RouterLink
              :to="{ name: 'courses' }"
              class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Cancelar
            </RouterLink>
            <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
              {{ isEdit ? 'Salvar alterações' : 'Criar curso' }}
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  </AppLayout>
</template>
