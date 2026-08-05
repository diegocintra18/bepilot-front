import { ref } from 'vue'
import { defineStore } from 'pinia'
import { coursesApi } from '@/api/courses'

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({ page: 1, limit: 10, search: '', status: '', sort: 'sortOrder', order: 'asc' })
  const loading = ref(false)
  const error = ref('')

  async function fetchCourses() {
    loading.value = true
    error.value = ''
    try {
      const result = await coursesApi.list(filters.value)
      courses.value = result.data
      meta.value = result.meta
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar os cursos.'
    } finally {
      loading.value = false
    }
  }

  function setSearch(search) {
    filters.value.search = search
    filters.value.page = 1
    return fetchCourses()
  }

  function setStatus(status) {
    filters.value.status = status
    filters.value.page = 1
    return fetchCourses()
  }

  function goToPage(page) {
    filters.value.page = page
    return fetchCourses()
  }

  async function getCourse(id) {
    return coursesApi.get(id)
  }

  function createCourse(payload) {
    return coursesApi.create(payload)
  }

  function updateCourse(id, payload) {
    return coursesApi.update(id, payload)
  }

  function deleteCourse(id) {
    return coursesApi.remove(id)
  }

  return {
    courses,
    meta,
    filters,
    loading,
    error,
    fetchCourses,
    setSearch,
    setStatus,
    goToPage,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
  }
})
