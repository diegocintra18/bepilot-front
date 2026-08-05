<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SubmitButton from '@/components/auth/SubmitButton.vue'

const router = useRouter()
const auth = useAuthStore()
const loggingOut = ref(false)

const userTypeLabels = { 1: 'Aluno', 2: 'Administrador' }

async function logout() {
  loggingOut.value = true
  try {
    await auth.logout()
    router.push({ name: 'login' })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas px-margin-mobile py-12">
    <div class="mx-auto w-full max-w-container-max-width">
      <header class="flex items-center justify-between border-b border-outline-variant pb-stack-lg">
        <RouterLink to="/" class="flex items-center gap-3">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-active"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M20.6 3.4c-1.4-.7-3.1-.2-4.4 1.1L13 7.7 5.4 6c-.6-.1-1.2.1-1.5.6l-.4.6c-.3.5-.2 1.1.3 1.5l6.2 4.3-2.3 3.4H5l-1.3 1.3 3.4 2.3 2.3 3.4 1.3-1.3v-2.7l3.4-2.3 4.3 6.2c.4.5 1 .6 1.5.3l.6-.4c.5-.3.7-.9.6-1.5l-1.7-7.6 3.2-3.2c1.3-1.3 1.8-3 .1-4.4z"
              />
            </svg>
          </span>
          <span class="font-display-lg text-headline-md font-bold text-primary">Vou ser Piloto</span>
        </RouterLink>

        <SubmitButton
          v-if="auth.user"
          type="button"
          class="!w-auto !px-4"
          :loading="loggingOut"
          @click="logout"
        >
          Sair
        </SubmitButton>
      </header>

      <main class="mt-stack-lg">
        <div v-if="auth.user" class="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-lift">
          <div class="flex items-center gap-stack-md">
            <span
              class="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container font-display-lg text-headline-md font-bold text-on-secondary-container"
              aria-hidden="true"
            >
              {{ auth.user.initials }}
            </span>
            <div>
              <h1 class="font-display-lg text-headline-md text-on-background">
                Olá, {{ auth.user.fullName }}
              </h1>
              <p class="text-body-md text-on-surface-variant">{{ auth.user.email }}</p>
            </div>
          </div>
          <p class="mt-stack-lg text-body-lg text-on-surface">
            Sua área de estudos está em construção. Em breve você poderá acessar simulados,
            matérias e seu histórico de desempenho aqui.
          </p>
          <span class="mt-stack-md inline-block rounded-full bg-primary-container px-4 py-1 font-label-caps text-label-caps text-on-primary">
            {{ userTypeLabels[auth.user.userType] || 'Usuário' }}
          </span>
        </div>
      </main>
    </div>
  </div>
</template>
