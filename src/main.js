import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'

import App from './App.vue'
import router from './router'
import { configureAuth } from './api/client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
configureAuth({
  getToken: () => authStore.token,
  onUnauthorized: () => authStore.handleUnauthorized(router),
})
authStore.restoreSession()

app.mount('#app')
