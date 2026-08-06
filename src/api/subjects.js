import { api, unwrapData } from './client'

export const subjectsApi = {
  list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/subjects${query ? `?${query}` : ''}`)
  },
  get(id) {
    return api.get(`/subjects/${id}`).then(unwrapData)
  },
  create(payload) {
    return api.post('/subjects', payload, { auth: true }).then(unwrapData)
  },
  update(id, payload) {
    return api.put(`/subjects/${id}`, payload, { auth: true }).then(unwrapData)
  },
  remove(id) {
    return api.delete(`/subjects/${id}`, { auth: true }).then(unwrapData)
  },
}
