<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const mobileOpen = ref(false)
const loggingOut = ref(false)

const userTypeLabels = { 1: 'Aluno', 2: 'Administrador' }

const navItems = [
  { label: 'Home', icon: 'grid', to: { name: 'dashboard' } },
  { label: 'Meus Cursos', icon: 'book', to: { name: 'courses' }, adminOnly: true },
  { label: 'Simulados', icon: 'timer' },
  { label: 'Performance', icon: 'trending-up' },
  { label: 'Configurações', icon: 'settings' },
]

const visibleNav = computed(() => navItems.filter((item) => !item.adminOnly || auth.isAdmin))
const navRoutes = computed(() => visibleNav.value.filter((item) => item.to))
const navPlaceholders = computed(() => visibleNav.value.filter((item) => !item.to))

function isActive(item) {
  if (!item.to) return false
  if (item.to.name) return route.name === item.to.name
  return route.path === item.to.path || route.path.startsWith(`${item.to.path}/`)
}

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
  <div class="min-h-screen bg-background text-on-background antialiased md:flex">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-on-background/40 md:hidden"
      aria-hidden="true"
      @click="mobileOpen = false"
    />

    <aside
      class="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low py-stack-md transition-transform duration-200 md:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="mb-8 flex justify-center px-6">
        <img src="/logo-site.png" alt="Vou ser Piloto" class="h-16 object-contain">
      </div>

      <nav class="flex-1 overflow-y-auto" aria-label="Navegação do aplicativo">
        <RouterLink
          v-for="item in navRoutes"
          :key="item.label"
          :to="item.to"
          class="mx-2 my-1 flex items-center gap-3 rounded-xl px-4 py-3 transition-transform active:scale-[0.98]"
          :class="
            isActive(item)
              ? 'bg-primary-container text-on-primary-container'
              : 'text-on-surface-variant transition-colors hover:bg-surface-variant'
          "
        >
          <AppIcon :name="item.icon" :size="20" />
          <span class="font-button-text text-button-text">{{ item.label }}</span>
        </RouterLink>
        <a
          v-for="item in navPlaceholders"
          :key="item.label"
          href="#"
          class="mx-2 my-1 flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-transform hover:bg-surface-variant active:scale-[0.98]"
        >
          <AppIcon :name="item.icon" :size="20" />
          <span class="font-button-text text-button-text">{{ item.label }}</span>
        </a>
      </nav>

      <div class="mt-auto space-y-4 px-4">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-3 font-button-text text-button-text text-on-secondary-container transition-all hover:opacity-90"
        >
          <AppIcon name="plus-circle" :size="20" />
          Iniciar Simulado
        </button>
        <div class="space-y-1 border-t border-outline-variant pt-4">
          <a
            href="#"
            class="flex items-center gap-3 rounded-xl px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
          >
            <AppIcon name="help-circle" :size="20" />
            <span class="font-button-text text-button-text">Suporte</span>
          </a>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
            :disabled="loggingOut"
            @click="logout"
          >
            <AppIcon name="log-out" class="text-error" :size="20" />
            <span class="font-button-text text-button-text">{{ loggingOut ? 'Saindo...' : 'Sair' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="flex h-screen flex-1 flex-col md:ml-64">
      <header
        class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile md:px-12"
      >
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :aria-expanded="mobileOpen"
            aria-controls="app-nav"
            aria-label="Abrir menu"
            @click="mobileOpen = !mobileOpen"
          >
            <AppIcon :name="mobileOpen ? 'close' : 'menu'" :size="24" />
          </button>
          <h1 class="font-headline-md text-headline-md font-bold text-primary">{{ title }}</h1>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 rounded-full px-3 py-1.5 transition-all hover:bg-surface-container-low">
            <div class="hidden text-right sm:block">
              <p class="font-button-text text-button-text leading-tight text-on-surface">
                {{ auth.user?.fullName }}
              </p>
              <p class="font-body-md text-sm leading-tight text-on-surface-variant">
                {{ userTypeLabels[auth.user?.userType] || 'Usuário' }}
              </p>
            </div>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container font-button-text text-button-text font-bold text-primary"
              aria-hidden="true"
            >
              {{ auth.user?.initials }}
            </div>
          </div>
          <button
            type="button"
            class="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low"
            aria-label="Notificações"
          >
            <AppIcon name="bell" :size="24" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-margin-mobile md:p-12">
        <div class="mx-auto w-full max-w-container-max-width">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
