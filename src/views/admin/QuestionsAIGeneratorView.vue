<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses'
import { useSubjectsStore } from '@/stores/subjects'
import { questionsApi } from '@/api/questions'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import { QUESTION_DIFFICULTY_OPTIONS } from '@/constants/questions'

const router = useRouter()

const coursesStore = useCoursesStore()
const subjectsStore = useSubjectsStore()

const loading = ref(false)
const apiError = ref('')
const submitDisabled = ref(false)

const form = reactive({
  courseId: '',
  subjectId: '',
  quantity: 5,
  difficulty: 'medium',
  topic: '',
})

const filteredSubjects = computed(() => {
  if (!form.courseId) return subjectsStore.allSubjects
  const courseIdNum = Number(form.courseId)
  return subjectsStore.allSubjects.filter((subject) =>
    (subject.courses || []).some((course) => course.id === courseIdNum)
  )
})

function validate() {
  apiError.value = ''

  if (!form.courseId) return (apiError.value = 'Selecione o curso.'), false
  if (!form.subjectId) return (apiError.value = 'Selecione o assunto.'), false
  if (!form.quantity || Number(form.quantity) < 1) return (apiError.value = 'Informe a quantidade de questões.'), false
  if (Number(form.quantity) > 20)
    return (apiError.value = 'A quantidade máxima por lote é 20.'), false
  return true
}

async function submit() {
  if (!validate()) return
  loading.value = true
  submitDisabled.value = true
  try {
    await questionsApi.generateAIBatch({
      courseId: Number(form.courseId),
      subjectId: Number(form.subjectId),
      quantity: Number(form.quantity),
      difficulty: form.difficulty,
      topic: form.topic.trim() ? form.topic.trim() : null,
    })

    // Não precisamos aguardar; direcionamos para a área de revisão (inativas).
    router.push({ name: 'questions', query: { status: 'inactive' } })
  } catch (err) {
    apiError.value = err.message || 'Não foi possível iniciar a geração.'
  } finally {
    loading.value = false
    submitDisabled.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([coursesStore.fetchAllCourses(), subjectsStore.fetchAllSubjects()])
  } catch {
    apiError.value = 'Não foi possível carregar cursos e assuntos.'
  }
})

// Ao trocar o curso, limpamos o assunto se ele não pertencer ao novo curso.
watch(
  () => form.courseId,
  () => {
  if (!form.courseId) {
    form.subjectId = ''
    return
  }
  const courseIdNum = Number(form.courseId)
  const subjectIdNum = Number(form.subjectId)
  const subject = subjectsStore.allSubjects.find((s) => s.id === subjectIdNum)
  if (subject && (subject.courses || []).some((c) => c.id === courseIdNum)) return
  form.subjectId = ''
  }
)
</script>

<template>
  <AppLayout title="Gerar Questões com IA">
    <div class="space-y-6">
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface">Gerar Questões com IA</h2>
          <p class="text-body-md font-body-md text-on-surface-variant">Crie questões em lote para revisão manual.</p>
        </div>
        <RouterLink
          :to="{ name: 'questions' }"
          class="flex w-fit items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar
        </RouterLink>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
        <ValidationMessages :message="apiError" class="mb-4" />

        <form class="grid gap-4 lg:grid-cols-2" @submit.prevent="submit">
          <FormField label="Curso" name="courseId">
            <select
              v-model="form.courseId"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="">Selecione</option>
              <option v-for="course in coursesStore.allCourses" :key="course.id" :value="String(course.id)">
                {{ course.code }} — {{ course.name }}
              </option>
            </select>
          </FormField>

          <FormField label="Assunto" name="subjectId">
            <select
              v-model="form.subjectId"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="">Selecione</option>
              <option v-for="subject in filteredSubjects" :key="subject.id" :value="String(subject.id)">
                {{ subject.name }}
              </option>
            </select>
          </FormField>

          <FormField label="Quantidade" name="quantity">
            <input
              v-model="form.quantity"
              type="number"
              inputmode="numeric"
              min="1"
              max="20"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
          </FormField>

          <FormField label="Dificuldade" name="difficulty">
            <select
              v-model="form.difficulty"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option v-for="opt in QUESTION_DIFFICULTY_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </FormField>

          <FormField label="Tópico específico (opcional)" name="topic">
            <input
              v-model="form.topic"
              type="text"
              placeholder="Ex: Navegação por instrumentos — variações e procedimentos"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
          </FormField>

          <div class="flex items-end lg:justify-end">
            <SubmitButton :loading="loading" :disabled="submitDisabled" class="!w-full lg:!w-auto">
              Gerar questões
            </SubmitButton>
          </div>
        </form>

        <div class="mt-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <div class="flex items-start gap-3">
            <AppIcon name="alert-circle" :size="18" class="mt-0.5" />
            <div>
              <p class="font-body-md text-body-md text-on-surface">As questões geradas entram como <strong>Inativas</strong> para revisão manual.</p>
              <p class="mt-1 text-sm text-on-surface-variant">Os itens sem referência válida podem não ser salvos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
