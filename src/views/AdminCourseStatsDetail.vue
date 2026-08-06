<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { statisticsApi } from '@/api/statistics'
import { formatDuration, formatPercentage } from '@/utils/format'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const detail = ref(null)

const course = computed(() => detail.value?.course || null)
const stats = computed(() => detail.value?.stats || null)
const subjects = computed(() => detail.value?.subjects || [])

async function loadDetail() {
  loading.value = true
  loadError.value = ''
  try {
    detail.value = await statisticsApi.courseDetail(route.params.courseId)
  } catch (err) {
    loadError.value = err.message || 'Não foi possível carregar as estatísticas do curso.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <AppLayout title="Detalhe do Curso">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <button
            type="button"
            class="mb-3 flex items-center gap-1 font-button-text text-button-text text-primary transition-colors hover:underline"
            @click="router.push({ name: 'dashboard' })"
          >
            <AppIcon name="chevron-left" :size="18" />
            Voltar ao resumo
          </button>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">
            {{ course?.name || 'Estatísticas do Curso' }}
          </h2>
          <p v-if="course" class="font-body-md text-body-md text-on-surface-variant">
            {{ course.code }} • desempenho por disciplina
          </p>
        </div>
      </section>

      <ValidationMessages v-if="loadError" :message="loadError" />

      <div v-if="loading" class="flex justify-center py-16">
        <span
          class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </div>

      <template v-else-if="course && stats">
        <div class="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon="timer"
            label="Simulados"
            :value="String(stats.totalExams)"
            hint="simulados concluídos neste curso"
          />
          <StatCard
            icon="award"
            label="Média de Acerto"
            :value="formatPercentage(stats.averageAccuracy)"
            :progress="stats.averageAccuracy"
            hint="precisão média dos alunos"
          />
          <StatCard
            icon="clock"
            label="Tempo Médio"
            :value="formatDuration(stats.averageCompletionTime)"
            tone="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            bar-class="bg-tertiary-fixed"
            hint="tempo médio de conclusão"
          />
        </div>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Desempenho por Disciplina</h3>
            <AppIcon name="layers" class="text-primary" :size="20" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-outline-variant">
                <tr class="font-label-caps text-label-caps text-on-surface-variant">
                  <th class="px-2 py-3">DISCIPLINA</th>
                  <th class="px-2 py-3">SIMULADOS</th>
                  <th class="px-2 py-3">MÉDIA DE ACERTO</th>
                  <th class="px-2 py-3">TEMPO MÉDIO</th>
                </tr>
              </thead>
              <tbody class="font-body-md">
                <tr v-if="subjects.length === 0">
                  <td colspan="4" class="px-2 py-10 text-center">
                    <p class="font-body-md text-body-md text-on-surface-variant">
                      Nenhuma disciplina com dados ainda.
                    </p>
                  </td>
                </tr>
                <tr
                  v-for="item in subjects"
                  :key="item.subject.id"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4">
                    <p class="font-bold text-on-surface">{{ item.subject.name }}</p>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">{{ item.stats.totalExams }}</td>
                  <td class="px-2 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container">
                        <div
                          class="h-full rounded-full"
                          :class="
                            item.stats.averageAccuracy >= 70
                              ? 'bg-tertiary-fixed'
                              : item.stats.averageAccuracy >= 50
                                ? 'bg-primary'
                                : 'bg-error'
                          "
                          :style="{ width: `${Math.max(0, Math.min(100, Number(item.stats.averageAccuracy ?? 0)))}%` }"
                        ></div>
                      </div>
                      <span class="font-label-caps text-xs font-bold text-on-surface-variant">
                        {{ formatPercentage(item.stats.averageAccuracy) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">
                    {{ formatDuration(item.stats.averageCompletionTime) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>
