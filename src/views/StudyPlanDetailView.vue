<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useStudyPlansStore } from '@/stores/studyPlans'
import StudyPlanPdfButton from '@/components/study/StudyPlanPdfButton.vue'

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
      <section class="flex items-center justify-between">
        <div>
          <h2 class="font-headline-lg">Plano de Estudos com IA</h2>
          <p class="font-body-md text-on-surface-variant">Simulado: {{ store.studyPlan?.simulation?.name || `#${store.studyPlan?.simulationId}` }}</p>
        </div>
        <div>
          <StudyPlanPdfButton v-if="store.studyPlan" :plan="store.studyPlan" />
        </div>
      </section>

      <section v-if="store.loading" class="py-10 text-center">
        <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando" />
      </section>

      <section v-else-if="store.studyPlan">
        <div class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <h3 class="font-bold">Resumo do desempenho</h3>
          <p class="mt-2">{{ store.studyPlan.summary?.overallAssessment }}</p>

          <div class="mt-4">
            <h4 class="font-semibold">Conteúdos prioritários</h4>
            <ul class="list-disc ml-5 mt-2">
              <li v-for="(t, i) in store.studyPlan.summary?.priorityTopics || []" :key="i">{{ t }}</li>
            </ul>
          </div>

          <div class="mt-6">
            <h4 class="font-semibold">Erros para reforçar</h4>
            <div v-if="(store.studyPlan.errors || []).length === 0" class="text-on-surface-variant mt-2">Nenhum erro foi identificado neste simulado.</div>
            <div v-else class="mt-2 space-y-4">
              <div v-for="err in store.studyPlan.errors" :key="err.questionNumber" class="p-3 rounded-md border border-outline-variant bg-white">
                <div class="font-bold">Questão {{ err.questionNumber }}</div>
                <div class="text-sm text-on-surface-variant">{{ err.discipline }} • {{ err.topic }}</div>
                <div class="mt-2">{{ err.explanation }}</div>
                <div class="mt-2 font-semibold">Recomendação</div>
                <div>{{ err.recommendation }}</div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <h4 class="font-semibold">Pontos de atenção</h4>
            <div v-if="(store.studyPlan.attentionPoints || []).length === 0" class="text-on-surface-variant mt-2">Não identificamos pontos de atenção relacionados ao tempo de resposta neste simulado.</div>
            <div v-else class="mt-2 space-y-4">
              <div v-for="ap in store.studyPlan.attentionPoints" :key="ap.questionNumber" class="p-3 rounded-md border border-outline-variant bg-white">
                <div class="font-bold">Questão {{ ap.questionNumber }}</div>
                <div class="text-sm text-on-surface-variant">{{ ap.discipline }} • {{ ap.topic }}</div>
                <div class="mt-2">Seu tempo: {{ ap.userTimeSeconds }}s • Tempo médio: {{ ap.avgTimeSeconds }}s</div>
                <div class="mt-2 font-semibold">Recomendação</div>
                <div>{{ ap.recommendation }}</div>
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
