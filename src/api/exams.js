import { api } from './client'

export const examsApi = {
  start(payload) {
    return api.post('/exams/start', payload, { auth: true })
  },
  questions(sessionId) {
    return api.get(`/exams/${sessionId}/questions`, { auth: true })
  },
  resume(sessionId) {
    return api.get(`/exams/${sessionId}/resume`, { auth: true })
  },
  saveAnswers(sessionId, answers) {
    return api.put(`/exams/${sessionId}/answers`, { answers }, { auth: true })
  },
  finish(sessionId, answers) {
    return api.post(`/exams/${sessionId}/finish`, { answers }, { auth: true })
  },
  history(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/exams/history${query ? `?${query}` : ''}`, { auth: true })
  },
  get(sessionId) {
    return api.get(`/exams/${sessionId}`, { auth: true })
  },
}
