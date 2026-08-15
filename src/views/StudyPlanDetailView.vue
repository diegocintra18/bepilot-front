<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useStudyPlansStore } from '@/stores/studyPlans'
import StudyPlanPdfButton from '@/components/study/StudyPlanPdfButton.vue'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useStudyPlansStore()
const id = route.params.id

onMounted(() => {
  if (!id) return router.push({ name: 'study-plans' })
  store.getStudyPlanById(id).catch(() => {})
})
</script>

<template>
  <AppLayout title="Plano de Estudos">
    <div class="space-y-stack-lg">
      <section class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <AppIcon name="book-open" :size="20" />
            </div>
            <div>
              <h2 class="font-headline-lg">Plano de Estudos</h2>
              <p class="font-body-md text-on-surface-variant">
                Simulado: {{ store.studyPlan?.simulation?.name || `#${store.studyPlan?.simulationId}` }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
              {{ store.studyPlan?.status === 'completed' ? 'Concluído' : 'Em andamento' }}
            </span>
            <span class="rounded-full bg-error-container px-3 py-1 text-xs font-bold text-on-error-container">
              {{ (store.studyPlan?.content?.errors || []).length }} erros
            </span>
            <span class="rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container">
              {{ (store.studyPlan?.content?.attentionPoints || []).length }} atenção
            </span>
          </div>
        </div>

        <StudyPlanPdfButton v-if="store.studyPlan" :plan="store.studyPlan" />
      </section>

      <section v-if="store.loading" class="py-10 text-center">
        <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando" />
      </section>

      <section v-else-if="store.studyPlan">
        <div class="space-y-stack-lg">
          <div class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <h3 class="font-bold">Resumo do desempenho</h3>
                <p class="text-on-surface">{{ store.studyPlan.content?.summary?.overallAssessment }}</p>
              </div>
              <div class="rounded-xl bg-primary-container p-3 text-on-primary-container">
                <p class="text-xs font-bold">Visão geral</p>
                <p class="mt-1 text-sm">
                  {{ (store.studyPlan.content?.errors || []).length }} erros • {{ (store.studyPlan.content?.attentionPoints || []).length }} atenção
                </p>
              </div>
            </div>

            <div class="mt-6">
              <h4 class="font-semibold">Conteúdos prioritários</h4>
              <div v-if="(store.studyPlan.content?.summary?.priorityTopics || []).length > 0" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="(t, i) in store.studyPlan.content?.summary?.priorityTopics || []"
                  :key="i"
                  class="rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container"
                >
                  {{ t }}
                </span>
              </div>
              <div v-else class="mt-2 text-on-surface-variant">Sem tópicos prioritários no momento.</div>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="rounded-xl border border-error-container bg-error-container/10 p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-error-container text-on-error-container">
                  <AppIcon name="x-circle" :size="20" />
                </div>
                <div>
                  <h4 class="font-semibold">Erros para reforçar</h4>
                  <p class="text-sm text-on-surface-variant">Foque em consolidação de conceitos</p>
                </div>
              </div>

              <div v-if="(store.studyPlan.content?.errors || []).length === 0" class="mt-4 text-on-surface-variant">
                Nenhum erro foi identificado neste simulado.
              </div>

              <div v-else class="mt-4 space-y-4">
                <div
                  v-for="err in store.studyPlan.content?.errors || []"
                  :key="err.questionId"
                  class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-error-container px-2.5 py-1 text-xs font-bold text-on-error-container">
                      Questão {{ err.questionId }}
                    </span>
                    <span class="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                      {{ err.discipline }}
                    </span>
                    <span class="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                      {{ err.topic }}
                    </span>
                  </div>

                  <div class="mt-3">
                    <p class="text-sm font-semibold">O que ocorreu</p>
                    <p class="mt-1 text-sm text-on-surface-variant">{{ err.explanation }}</p>
                  </div>

                  <div class="mt-3">
                    <p class="text-sm font-semibold">Recomendação</p>
                    <p class="mt-1 text-sm text-on-surface">{{ err.recommendation }}</p>
                  </div>

                  <div v-if="(err.recommendationReferences || []).length > 0" class="mt-3">
                    <p class="text-sm font-semibold">Referências de livros</p>
                    <ul class="mt-1 list-disc pl-5 text-sm text-on-surface-variant">
                      <li v-for="(ref, i) in err.recommendationReferences" :key="i">{{ ref }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-tertiary-container bg-tertiary-container/10 p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
                  <AppIcon name="clock" :size="20" />
                </div>
                <div>
                  <h4 class="font-semibold">Pontos de atenção</h4>
                  <p class="text-sm text-on-surface-variant">Acelere sem perder precisão</p>
                </div>
              </div>

              <div
                v-if="(store.studyPlan.content?.attentionPoints || []).length === 0"
                class="mt-4 text-on-surface-variant"
              >
                Não identificamos pontos de atenção relacionados ao tempo de resposta neste simulado.
              </div>

              <div v-else class="mt-4 space-y-4">
                <div
                  v-for="ap in store.studyPlan.content?.attentionPoints || []"
                  :key="ap.questionId"
                  class="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-tertiary-container px-2.5 py-1 text-xs font-bold text-on-tertiary-container">
                      Questão {{ ap.questionId }}
                    </span>
                    <span class="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                      {{ ap.discipline }}
                    </span>
                    <span class="rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                      {{ ap.topic }}
                    </span>
                  </div>

                  <div class="mt-3">
                    <p class="text-sm font-semibold">Tempo de resolução</p>
                    <p class="mt-1 text-sm text-on-surface-variant">
                      Seu tempo: {{ ap.responseTimeSeconds }}s • Média: {{ ap.averageResponseTimeSeconds }}s
                    </p>
                    <p class="mt-2 text-sm text-on-surface-variant">Motivo: {{ ap.reason }}</p>
                  </div>

                  <div class="mt-3">
                    <p class="text-sm font-semibold">Recomendação</p>
                    <p class="mt-1 text-sm text-on-surface">{{ ap.recommendation }}</p>
                  </div>

                  <div v-if="(ap.recommendationReferences || []).length > 0" class="mt-3">
                    <p class="text-sm font-semibold">Referências de livros</p>
                    <ul class="mt-1 list-disc pl-5 text-sm text-on-surface-variant">
                      <li v-for="(ref, i) in ap.recommendationReferences" :key="i">{{ ref }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="py-10 text-center">
        <p class="font-body-md text-on-surface-variant">Plano de estudos não encontrado.</p>
      </section>
    </div>
  </AppLayout>
</template>
