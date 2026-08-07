import { api, unwrapData } from './client'

export const authApi = {
  signup(payload) {
    return api.post('/auth/signup', payload).then(unwrapData)
  },
  login(credentials) {
    return api.post('/auth/login', credentials).then(unwrapData)
  },
  fetchProfile() {
    return api.get('/account/profile', { auth: true }).then(unwrapData)
  },
  updateProfile(payload) {
    return api.patch('/account/profile', payload, { auth: true }).then(unwrapData)
  },
  changePassword(payload) {
    return api.post('/account/change-password', payload, { auth: true }).then(unwrapData)
  },
  logout() {
    return api.post('/account/logout', null, { auth: true })
  },
}
