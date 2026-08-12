import { api, unwrapData } from './client'

export const authApi = {
  signup(payload) {
    return api.post('/auth/signup', payload).then(unwrapData)
  },
  login(credentials) {
    return api.post('/auth/login', credentials).then(unwrapData)
  },
  forgotPassword(payload) {
    return api.post('/auth/forgot-password', payload).then(unwrapData)
  },
  resetPassword(payload) {
    return api.post('/auth/reset-password', payload).then(unwrapData)
  },
  fetchProfile() {
    return api.get('/account/profile', { auth: true }).then(unwrapData)
  },
  updateProfile(payload) {
    return api.put('/me', payload, { auth: true }).then(unwrapData)
  },
  changePassword(payload) {
    return api.put('/me/password', payload, { auth: true }).then(unwrapData)
  },
  fetchSubscription() {
    return api.get('/me/subscription', { auth: true }).then(unwrapData)
  },
  cancelSubscription(payload) {
    return api
      .post('/subscriptions/cancel-request', payload, { auth: true })
      .then(unwrapData)
      .catch((error) => {
        if (error.kind === 'notfound') {
          return api.post('/subscriptions/cancel', payload, { auth: true }).then(unwrapData)
        }
        throw error
      })
  },
  logout() {
    return api.post('/account/logout', null, { auth: true })
  },
}
