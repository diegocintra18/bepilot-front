<template>
  <section class="study-plan-list p-4">
    <h1 class="text-2xl font-bold mb-4">Planos de Estudos</h1>
    <div v-if="loading" class="loading">Carregando planos de estudos...</div>
    <div v-else-if="error" class="error text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="studyPlans.length === 0" class="empty-state">
        <p>Você ainda não possui planos de estudos.</p>
        <p>Realize um simulado e gere seu primeiro plano personalizado com IA.</p>
        <router-link to="/simulados" class="btn btn-primary mt-3">Fazer um simulado</router-link>
      </div>
      <div v-else class="plans-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StudyPlanCard
          v-for="plan in studyPlans"
          :key="plan.id"
          :plan="plan"
          @viewPlan="viewPlan"
        />
      </div>
    </div>
    <Pagination
      v-if="pagination.total > pagination.limit"
      :currentPage="pagination.page"
      :totalItems="pagination.total"
      :pageSize="pagination.limit"
      @pageChange="onPageChange"
    />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStudyPlansStore } from '@/stores/studyPlans'
import { useRouter } from 'vue-router'
import StudyPlanCard from '@/components/StudyPlanCard.vue'
import Pagination from '@/components/Pagination.vue'

const store = useStudyPlansStore()
const router = useRouter()

const { studyPlans, loading, error, pagination, listStudyPlans } = store

const fetchPlans = async (page = 1) => {
  store.pagination.page = page
  await listStudyPlans()
}

const viewPlan = (id) => {
  router.push(`/study-plans/${id}`)
}

const onPageChange = (page) => {
  fetchPlans(page)
}

onMounted(fetchPlans)
</script>

<style scoped>
.empty-state {
  text-align: center;
  margin-top: 3rem;
}
.loading {
  text-align: center;
  font-weight: bold;
}
.error {
  text-align: center;
}
</style>
