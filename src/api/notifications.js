import { api, unwrapData } from './client'

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export const notificationsApi = {
  list(params = {}) {
    return api.get(`/notifications${toQueryString(params)}`, { auth: true })
  },
  get(id) {
    return api.get(`/notifications/${id}`, { auth: true }).then(unwrapData)
  },
  markRead(id) {
    return api.patch(`/notifications/${id}/read`, null, { auth: true }).then(unwrapData)
  },
  markUnread(id) {
    return api.patch(`/notifications/${id}/unread`, null, { auth: true }).then(unwrapData)
  },
  remove(id) {
    return api.delete(`/notifications/${id}`, { auth: true })
  },
  create(payload) {
    return api.post('/notifications', payload, { auth: true }).then(unwrapData)
  },
}
