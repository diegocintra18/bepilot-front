import { ref } from 'vue'
import { defineStore } from 'pinia'
import { subjectsApi } from '@/api/subjects'

export const useSubjectsStore = defineStore('subjects', () => {
  const subjects = ref([])
  const allSubjects = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    courseId: '',
    sort: 'sortOrder',
    order: 'asc',
  })
  const loading = ref(false)
  const error = ref('')

  async function fetchAllSubjects() {
    const result = await subjectsApi.list({ limit: 100, sort: 'sortOrder', order: 'asc' })
    allSubjects.value = result.data
    return allSubjects.value
  }

  async function fetchSubjects() {
    loading.value = true
    error.value = ''
    try {
      const result = await subjectsApi.list(filters.value)
      subjects.value = result.data
      meta.value = result.meta
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar os assuntos.'
    } finally {
      loading.value = false
    }
  }

  function setSearch(search) {
    filters.value.search = search
    filters.value.page = 1
    return fetchSubjects()
  }

  function setStatus(status) {
    filters.value.status = status
    filters.value.page = 1
    return fetchSubjects()
  }

  function setCourse(courseId) {
    filters.value.courseId = courseId
    filters.value.page = 1
    return fetchSubjects()
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchSubjects()
  }

  async function getSubject(id) {
    return subjectsApi.get(id)
  }

  function createSubject(payload) {
    return subjectsApi.create(payload)
  }

  function updateSubject(id, payload) {
    return subjectsApi.update(id, payload)
  }

  function deleteSubject(id) {
    return subjectsApi.remove(id)
  }

  return {
    subjects,
    allSubjects,
    meta,
    filters,
    loading,
    error,
    fetchSubjects,
    fetchAllSubjects,
    setSearch,
    setStatus,
    setCourse,
    goToPage,
    getSubject,
    createSubject,
    updateSubject,
    deleteSubject,
  }
})
