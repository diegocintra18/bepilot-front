<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import SubscriptionAlert from '@/components/layout/SubscriptionAlert.vue'
import NotificationBell from '@/components/NotificationBell.vue'

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

onMounted(() => {
  if (auth.isAuthenticated && !auth.isAdmin && !auth.subscription) {
    auth.fetchSubscription().catch(() => {})
  }
})

const navItems = [
  { label: 'Home', icon: 'grid', to: { name: 'dashboard' } },
  { label: 'Gerenciar Cursos', icon: 'book', to: { name: 'courses' }, adminOnly: true },
  { label: 'Gerenciar Assuntos', icon: 'layers', to: { name: 'subjects' }, adminOnly: true },
  { label: 'Gerenciar Questões', icon: 'list', to: { name: 'questions' }, adminOnly: true },
  { label: 'Gerenciar Usuários', icon: 'user', to: { name: 'users' }, adminOnly: true },
  { label: 'Assinaturas', icon: 'credit-card', to: { name: 'subscriptions' }, adminOnly: true },
  { label: 'Notificações', icon: 'bell', to: { name: 'notifications' }, adminOnly: true },
  { label: 'Simulados', icon: 'timer', to: { name: 'simulation-history' } },
]

const visibleNav = computed(() => navItems.filter((item) => !item.adminOnly || auth.isAdmin))

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

function isActive(item) {
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
          v-for="item in visibleNav"
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
      </nav>

      <div class="mt-auto space-y-4 px-4">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-3 font-button-text text-button-text text-on-secondary-container transition-all hover:opacity-90"
          @click="router.push({ name: 'simulation-start' })"
        >
          <AppIcon name="plus-circle" :size="20" />
          Iniciar Simulado
        </button>
        <div class="space-y-1 border-t border-outline-variant pt-4">
          <a
            href="https://wa.me/5516991353306"
            target="_blank"
            rel="noopener noreferrer"
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

    <main class="flex h-dvh flex-1 flex-col md:ml-64">
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
          <h1 class="hidden font-headline-md text-body-lg font-bold text-primary md:block md:text-headline-md">{{ title }}</h1>
        </div>

        <div class="flex items-center gap-6">
          <UserMenu />
          <NotificationBell />
        </div>
      </header>

      <SubscriptionAlert />

      <div class="flex-1 overflow-y-auto overscroll-y-contain overflow-x-hidden p-margin-mobile md:p-12 [-webkit-overflow-scrolling:touch]">
        <div class="mx-auto w-full max-w-container-max-width">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
