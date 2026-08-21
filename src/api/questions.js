import { api, unwrapData } from './client'

export const questionsApi = {
  list(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/questions${query ? `?${query}` : ''}`)
  },
  listAdmin(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/questions/admin${query ? `?${query}` : ''}`, { auth: true })
  },
  get(id) {
    return api.get(`/questions/${id}`).then(unwrapData)
  },
  create(payload) {
    return api.post('/questions', payload, { auth: true }).then(unwrapData)
  },
  update(id, payload) {
    return api.put(`/questions/${id}`, payload, { auth: true }).then(unwrapData)
  },
  remove(id) {
    return api.delete(`/questions/${id}`, { auth: true }).then(unwrapData)
  },
  generateAIBatch(payload) {
    return api.post('/questions/admin/ai-batch/generate', {
      ...payload,
      aiProvider: payload.aiProvider || 'openai'
    }, { auth: true }).then(unwrapData)
  },
}
