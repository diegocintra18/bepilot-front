import { ref } from 'vue'
import { defineStore } from 'pinia'
import { studyPlansApi } from '@/api/studyPlans'

export const useStudyPlansStore = defineStore('studyPlans', () => {
  const studyPlans = ref([])
  const studyPlan = ref(null)
  const loading = ref(false)
  const generationStatus = ref('idle') // idle | generating | completed | failed
  const error = ref('')
  const pagination = ref({ page: 1, limit: 10, total: 0 })

  async function listStudyPlans(params = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await studyPlansApi.list({ page: pagination.value.page, limit: pagination.value.limit, ...params })
      studyPlans.value = result.data || []
      pagination.value = result.meta || pagination.value
      return studyPlans.value
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar seus planos de estudos.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getStudyPlanBySimulation(simulationId) {
    loading.value = true
    error.value = ''
    try {
      const result = await studyPlansApi.getBySimulation(simulationId)
      studyPlan.value = result || null
      return studyPlan.value
    } catch (err) {
      error.value = err.message || 'Plano de estudos não encontrado.'
      studyPlan.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getStudyPlanById(id) {
    loading.value = true
    error.value = ''
    try {
      const result = await studyPlansApi.get(id)
      studyPlan.value = result || null
      return studyPlan.value
    } catch (err) {
      error.value = err.message || 'Plano de estudos não encontrado.'
      studyPlan.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function generateStudyPlan(simulationId) {
    generationStatus.value = 'generating'
    error.value = ''
    try {
      const result = await studyPlansApi.generate(simulationId)
      studyPlan.value = result || null
      generationStatus.value = 'completed'
      return studyPlan.value
    } catch (err) {
      generationStatus.value = 'failed'
      error.value = err.message || 'Não foi possível gerar seu plano de estudos.'
      throw err
    }
  }

  function resetGenerationStatus() {
    generationStatus.value = 'idle'
  }

  return {
    studyPlans,
    studyPlan,
    loading,
    generationStatus,
    error,
    pagination,
    listStudyPlans,
    getStudyPlanBySimulation,
    getStudyPlanById,
    generateStudyPlan,
    resetGenerationStatus,
  }
})
