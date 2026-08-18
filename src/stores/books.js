import { ref } from 'vue'
import { defineStore } from 'pinia'
import { booksApi } from '@/api/books'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const meta = ref({ total: 0, perPage: 10, currentPage: 1, lastPage: 1 })
  const filters = ref({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    courseId: '',
    subjectId: '',
  })
  const loading = ref(false)
  const error = ref('')

  async function listPublic(params = {}) {
    loading.value = true
    error.value = ''
    try {
      const result = await booksApi.list({
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search,
        status: params.status,
        courseId: params.courseId,
        subjectId: params.subjectId,
      })

      books.value = result.data || []
      meta.value = result.meta || meta.value
      return books.value
    } catch (err) {
      error.value = err.message || 'Não foi possível carregar os livros.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function listAdmin() {
    return listPublic(filters.value)
  }

  function setSearch(search) {
    filters.value.search = search
    filters.value.page = 1
    return listAdmin()
  }

  function setStatus(status) {
    filters.value.status = status
    filters.value.page = 1
    return listAdmin()
  }

  function goToPage(page) {
    filters.value.page = page
    return listAdmin()
  }

  async function getBook(id) {
    return booksApi.get(id)
  }

  async function createBook(payload) {
    return booksApi.create(payload)
  }

  async function updateBook(id, payload) {
    return booksApi.update(id, payload)
  }

  async function deleteBook(id) {
    return booksApi.remove(id)
  }

  async function uploadCover(file) {
    return booksApi.uploadCover(file)
  }

  return {
    books,
    meta,
    filters,
    loading,
    error,
    listPublic,
    listAdmin,
    setSearch,
    setStatus,
    goToPage,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    uploadCover,
  }
})
