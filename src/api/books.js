import { api, unwrapData } from './client'

export const booksApi = {
  list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/books${query ? `?${query}` : ''}`)
  },

  get(id) {
    return api.get(`/books/${id}`).then(unwrapData)
  },

  create(payload) {
    return api.post('/books', payload, { auth: true }).then(unwrapData)
  },

  update(id, payload) {
    return api.put(`/books/${id}`, payload, { auth: true }).then(unwrapData)
  },

  remove(id) {
    return api.delete(`/books/${id}`, { auth: true }).then(unwrapData)
  },

  uploadCover(file) {
    const form = new FormData()
    form.append('cover', file, file.name)
    return api.post('/books/covers', form, { auth: true }).then(unwrapData)
  },
}
