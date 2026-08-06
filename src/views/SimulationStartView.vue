<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '@/stores/simulation'
import { useCoursesStore } from '@/stores/courses'
import { useSubjectsStore } from '@/stores/subjects'
import { SimulationType, SIMULATION_TYPE_OPTIONS } from '@/constants/simulations'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const router = useRouter()
const simulation = useSimulationStore()
const coursesStore = useCoursesStore()
const subjectsStore = useSubjectsStore()

const courseId = ref('')
const simulationType = ref(SimulationType.Complete)
const subjectId = ref('')
const loading = ref(false)

const selectedCourse = computed(() =>
  coursesStore.allCourses.find((course) => String(course.id) === String(courseId.value)),
)

const courseSubjects = computed(() =>
  subjectsStore.allSubjects.filter((subject) =>
    (subject.courses || []).some((course) => String(course.id) === String(courseId.value)),
  ),
)

const canStart = computed(
  () =>
    courseId.value !== '' &&
    (simulationType.value === SimulationType.Complete || subjectId.value !== ''),
)

const selectedType = computed(() =>
  SIMULATION_TYPE_OPTIONS.find((option) => option.value === simulationType.value),
)

function chooseType(value) {
  simulationType.value = value
  if (value === SimulationType.Complete) {
    subjectId.value = ''
  }
}

async function start() {
  if (!canStart.value || loading.value) return
  loading.value = true
  try {
    const sessionId = await simulation.startSimulation({
      courseId: Number(courseId.value),
      subjectId: simulationType.value === SimulationType.Subject ? Number(subjectId.value) : null,
    })
    router.push({ name: 'simulation-execution', params: { id: sessionId } })
  } catch {
    // store.error já exibe a mensagem
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([coursesStore.fetchAllCourses(), subjectsStore.fetchAllSubjects()])
  } catch {
    // dropdowns opcionais; o usuário pode tentar novamente
  }
})
</script>

<template>
  <AppLayout title="Simulados">
    <div class="mx-auto max-w-3xl space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Iniciar Simulado</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Escolha o curso e o formato do simulado para começar a praticar.
          </p>
        </div>
      </section>

      <section
        class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8"
      >
        <form class="space-y-stack-lg" @submit.prevent="start">
          <div>
            <label for="course" class="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant">
              Curso
            </label>
            <select
              id="course"
              v-model="courseId"
              name="course"
              required
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="" disabled>Selecione o curso</option>
              <option v-for="course in coursesStore.allCourses" :key="course.id" :value="String(course.id)">
                {{ course.code ? `${course.code} — ` : '' }}{{ course.name }}
              </option>
            </select>
          </div>

          <fieldset>
            <legend class="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Tipo de simulado
            </legend>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                v-for="option in SIMULATION_TYPE_OPTIONS"
                :key="option.value"
                type="button"
                role="radio"
                :aria-checked="simulationType === option.value"
                class="rounded-xl border p-5 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                :class="
                  simulationType === option.value
                    ? 'border-primary bg-primary-fixed'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
                "
                @click="chooseType(option.value)"
              >
                <p class="font-button-text text-button-text font-bold text-on-surface">
                  {{ option.label }}
                </p>
                <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
                  {{ option.description }}
                </p>
              </button>
            </div>
          </fieldset>

          <div v-if="simulationType === SimulationType.Subject">
            <label for="subject" class="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant">
              Assunto
            </label>
            <select
              id="subject"
              v-model="subjectId"
              name="subject"
              required
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            >
              <option value="" disabled>Selecione o assunto</option>
              <option v-for="subject in courseSubjects" :key="subject.id" :value="String(subject.id)">
                {{ subject.name }}
              </option>
            </select>
            <p v-if="courseSubjects.length === 0" class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
              Este curso ainda não possui assuntos cadastrados.
            </p>
          </div>

          <ValidationMessages :message="simulation.error" />

          <button
            type="submit"
            :disabled="!canStart || loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              v-if="loading"
              class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              role="status"
              aria-label="Carregando"
            />
            <AppIcon v-else name="rocket" :size="20" />
            {{ loading ? 'Iniciando...' : 'Iniciar Simulado' }}
          </button>

          <p
            v-if="canStart && selectedType"
            class="rounded-lg bg-surface-container-low px-4 py-3 font-body-md text-body-md text-on-surface-variant"
          >
            <span class="font-bold text-on-surface">{{ selectedCourse?.name || 'Curso selecionado' }}</span>
            • {{ selectedType.label }}
            <template v-if="simulationType === SimulationType.Subject">
              • {{ courseSubjects.find((s) => String(s.id) === String(subjectId))?.name }}
            </template>
          </p>
        </form>
      </section>
    </div>
  </AppLayout>
</template>
