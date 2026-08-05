import { api, unwrapData } from './client'

export const coursesApi = {
  list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/courses${query ? `?${query}` : ''}`)
  },
  get(id) {
    return api.get(`/courses/${id}`).then(unwrapData)
  },
  create(payload) {
    return api.post('/courses', payload, { auth: true }).then(unwrapData)
  },
  update(id, payload) {
    return api.put(`/courses/${id}`, payload, { auth: true }).then(unwrapData)
  },
  remove(id) {
    return api.delete(`/courses/${id}`, { auth: true }).then(unwrapData)
  },
}
