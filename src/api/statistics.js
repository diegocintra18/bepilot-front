import { api } from './client'

export const statisticsApi = {
  me() {
    return api.get('/statistics/me', { auth: true })
  },
  courses(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/admin/statistics/courses${query ? `?${query}` : ''}`, { auth: true })
  },
  courseDetail(courseId) {
    return api.get(`/admin/statistics/courses/${courseId}`, { auth: true })
  },
  questions(params = {}) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.set(key, value)
    })
    const query = qs.toString()
    return api.get(`/admin/statistics/questions${query ? `?${query}` : ''}`, { auth: true })
  },
}
