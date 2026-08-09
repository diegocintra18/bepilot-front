import { api, unwrapData } from './client'

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export const usersApi = {
  list(params = {}) {
    return api.get(`/users${toQueryString(params)}`, { auth: true })
  },
  get(id) {
    return api.get(`/users/${id}`, { auth: true }).then(unwrapData)
  },
  adminList(params = {}) {
    return api.get(`/admin/users${toQueryString(params)}`, { auth: true })
  },
  adminGet(id) {
    return api.get(`/admin/users/${id}`, { auth: true }).then(unwrapData)
  },
  adminUpdate(id, payload) {
    return api.put(`/admin/users/${id}`, payload, { auth: true }).then(unwrapData)
  },
  adminResetPassword(id, payload) {
    return api.put(`/admin/users/${id}/password`, payload, { auth: true }).then(unwrapData)
  },
  create(payload) {
    return api.post('/users', payload, { auth: true }).then(unwrapData)
  },
  update(id, payload) {
    return api.put(`/users/${id}`, payload, { auth: true }).then(unwrapData)
  },
  remove(id) {
    return api.delete(`/users/${id}`, { auth: true }).then(unwrapData)
  },
  listStats(params = {}) {
    return api.get(`/admin/statistics/users${toQueryString(params)}`, { auth: true })
  },
  getStats(userId) {
    return api.get(`/admin/statistics/users/${userId}`, { auth: true }).then(unwrapData)
  },
}
