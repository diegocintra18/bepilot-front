import { ref } from 'vue'
import { defineStore } from 'pinia'
import { questionsApi } from '@/api/questions'

export const useAdminQuestionsStore = defineStore('adminQuestions', () => {
  const questions = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    difficulty: '',
    status: '',
    subjectId: '',
    courseId: '',
    sort: 'created_at',
    order: 'desc',
  })
  const loading = ref(false)
  const error = ref('')

  async function fetchQuestions() {
    loading.value = true
    error.value = ''
    try {
      const result = await questionsApi.listAdmin(filters.value)
      questions.value = result.data
      meta.value = result.meta
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar as questões.'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value.page = 1
    return fetchQuestions()
  }

  function setSearch(search) {
    filters.value.search = search
    return resetFilters()
  }

  function setDifficulty(difficulty) {
    filters.value.difficulty = difficulty
    return resetFilters()
  }

  function setStatus(status) {
    filters.value.status = status
    return resetFilters()
  }

  function setSubject(subjectId) {
    filters.value.subjectId = subjectId
    return resetFilters()
  }

  function setCourse(courseId) {
    filters.value.courseId = courseId
    return resetFilters()
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchQuestions()
  }

  function createQuestion(payload) {
    return questionsApi.create(payload)
  }

  function updateQuestion(id, payload) {
    return questionsApi.update(id, payload)
  }

  function deleteQuestion(id) {
    return questionsApi.remove(id)
  }

  return {
    questions,
    meta,
    filters,
    loading,
    error,
    fetchQuestions,
    setSearch,
    setDifficulty,
    setStatus,
    setSubject,
    setCourse,
    goToPage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  }
})
