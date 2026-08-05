import { api } from './client'

export const authApi = {
  signup(payload) {
    return api.post('/auth/signup', payload)
  },
  login(credentials) {
    return api.post('/auth/login', credentials)
  },
  fetchProfile() {
    return api.get('/account/profile', { auth: true })
  },
  logout() {
    return api.post('/account/logout', null, { auth: true })
  },
}
