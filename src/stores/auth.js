import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { UserType } from '@/constants/userTypes'

const STORAGE_KEY = 'bepilot.auth'

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function writeStoredSession(token, user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const isRestoring = ref(true)
  let restorePromise = Promise.resolve()

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.userType === UserType.Admin)

  function persistSession({ token: nextToken, user: nextUser }) {
    token.value = nextToken
    user.value = nextUser
    writeStoredSession(nextToken, nextUser)
  }

  async function updateProfile(payload) {
    const updatedUser = await authApi.updateProfile(payload)
    user.value = updatedUser
    writeStoredSession(token.value, updatedUser)
    return updatedUser
  }

  async function changePassword(payload) {
    return authApi.changePassword(payload)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function signup(payload) {
    const data = await authApi.signup(payload)
    persistSession(data)
  }

  async function login(credentials) {
    const data = await authApi.login(credentials)
    persistSession(data)
  }

  async function restoreSession() {
    const stored = readStoredSession()
    if (!stored || !stored.token) {
      isRestoring.value = false
      return
    }
    token.value = stored.token
    user.value = stored.user || null
    restorePromise = (async () => {
      try {
        const profile = await authApi.fetchProfile()
        user.value = profile
        writeStoredSession(stored.token, profile)
      } catch (error) {
        if (error.kind === 'unauthorized') {
          clearSession()
        }
      } finally {
        isRestoring.value = false
      }
    })()
    await restorePromise
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // session is cleared regardless of the API response
    } finally {
      clearSession()
    }
  }

  function handleUnauthorized(router) {
    clearSession()
    const { name } = router.currentRoute.value
    if (name !== 'login' && name !== 'register') {
      router.push({ name: 'login' })
    }
  }

  return {
    token,
    user,
    isRestoring,
    restorePromise,
    isAuthenticated,
    isAdmin,
    signup,
    login,
    updateProfile,
    changePassword,
    restoreSession,
    logout,
    clearSession,
    handleUnauthorized,
  }
})
