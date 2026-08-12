<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useStudyPlansStore } from '@/stores/studyPlans'
import StudyPlanCard from '@/components/study/StudyPlanCard.vue'

const store = useStudyPlansStore()

onMounted(() => {
  store.listStudyPlans().catch(() => {})
})
</script>

<template>
  <AppLayout title="Planos de estudos">
    <div class="space-y-stack-lg">
      <section>
        <h2 class="font-headline-lg text-headline-lg">Planos de estudos</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Seus planos personalizados gerados pela IA.</p>
      </section>

      <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div v-if="store.loading" class="py-10 text-center">
          <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" role="status" aria-label="Carregando" />
        </div>

        <div v-else-if="store.studyPlans.length === 0" class="py-10 text-center">
          <p class="font-body-md text-body-md text-on-surface-variant">Você ainda não possui planos de estudos.</p>
        </div>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <StudyPlanCard v-for="plan in store.studyPlans" :key="plan.id" :plan="plan" />
        </div>
      </section>
    </div>
  </AppLayout>
</template>
