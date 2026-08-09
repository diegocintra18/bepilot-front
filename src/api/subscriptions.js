import { api, unwrapData } from './client'

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export const subscriptionsApi = {
  list(params = {}) {
    return api.get(`/admin/subscriptions${toQueryString(params)}`, { auth: true })
  },
  get(id) {
    return api.get(`/admin/subscriptions/${id}`, { auth: true }).then(unwrapData)
  },
  create(payload) {
    return api.post('/admin/subscriptions', payload, { auth: true }).then(unwrapData)
  },
  update(id, payload) {
    return api.put(`/admin/subscriptions/${id}`, payload, { auth: true }).then(unwrapData)
  },
  activate(id, payload) {
    return api.post(`/admin/subscriptions/${id}/activate`, payload, { auth: true }).then(unwrapData)
  },
  cancel(id, payload) {
    return api.post(`/admin/subscriptions/${id}/cancel`, payload, { auth: true }).then(unwrapData)
  },
  renew(id, payload) {
    return api.post(`/admin/subscriptions/${id}/renew`, payload, { auth: true }).then(unwrapData)
  },
  history(id) {
    return api.get(`/admin/subscriptions/${id}/history`, { auth: true }).then(unwrapData)
  },
}
