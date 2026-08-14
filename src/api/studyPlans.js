import { api, unwrapData } from './client'

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export const studyPlansApi = {
  generate(simulationId) {
    return api.post(`/exams/${simulationId}/study-plan`, null, { auth: true }).then(unwrapData)
  },
  getBySimulation(simulationId) {
    return api.get(`/exams/${simulationId}/study-plan`, { auth: true }).then(unwrapData)
  },
  list(params = {}) {
    // List endpoints retornam `{ data, meta }` (sem unwrap)
    return api.get(`/study-plans${toQueryString(params)}`, { auth: true })
  },
  get(id) {
    // Backend uses the session/exam id for study plans
    return api.get(`/exams/${id}/study-plan`, { auth: true }).then(unwrapData)
  },
}
