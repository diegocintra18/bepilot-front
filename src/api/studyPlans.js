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
    return api.post(`/simulations/${simulationId}/study-plan`, null, { auth: true }).then(unwrapData)
  },
  getBySimulation(simulationId) {
    return api.get(`/simulations/${simulationId}/study-plan`, { auth: true }).then(unwrapData)
  },
  list(params = {}) {
    return api.get(`/study-plans${toQueryString(params)}`, { auth: true }).then(unwrapData)
  },
  get(id) {
    return api.get(`/study-plans/${id}`, { auth: true }).then(unwrapData)
  },
}
