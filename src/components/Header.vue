<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()

const mobileOpen = ref(false)

const navLinks = [
  { label: 'Dashboard', active: true },
  { label: 'Simulados', active: false },
]

function goToAccount() {
  router.push(auth.isAuthenticated ? { name: 'dashboard' } : { name: 'login' })
}
</script>

<template>
  <header class="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest">
    <div
      class="mx-auto flex h-16 w-full max-w-container-max-width items-center justify-between px-margin-mobile md:px-margin-desktop"
    >
      <a href="#" class="cursor-pointer" aria-label="Vou ser Piloto - página inicial">
        <img src="/logo-site.png" alt="Vou ser Piloto" class="h-10 w-auto">
      </a>

      <nav class="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
        <template v-for="link in navLinks" :key="link.label">
          <a
            v-if="link.active"
            href="#"
            class="cursor-pointer border-b-2 border-primary pb-1 font-button-text text-button-text font-bold text-primary"
          >
            {{ link.label }}
          </a>
          <a
            v-else
            href="#"
            class="cursor-pointer font-button-text text-button-text text-on-surface-variant transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {{ link.label }}
          </a>
        </template>
      </nav>

      <div class="flex items-center gap-4">
        <button
          type="button"
          class="cursor-pointer rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Minha conta"
          @click="goToAccount"
        >
          <AppIcon name="user" :size="24" />
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-full p-2 text-on-surface-variant md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-nav"
          aria-label="Abrir menu"
          @click="mobileOpen = !mobileOpen"
        >
          <AppIcon :name="mobileOpen ? 'close' : 'menu'" :size="24" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <nav
        v-if="mobileOpen"
        id="mobile-nav"
        class="border-t border-outline-variant bg-surface-container-lowest md:hidden"
        aria-label="Navegação móvel"
      >
        <div class="mx-auto flex max-w-container-max-width flex-col gap-1 px-margin-mobile py-stack-md">
          <template v-for="link in navLinks" :key="link.label">
            <a
              v-if="link.active"
              href="#"
              class="cursor-pointer rounded-lg bg-primary-container px-4 py-3 font-button-text text-button-text font-bold text-on-primary"
              @click="mobileOpen = false"
            >
              {{ link.label }}
            </a>
            <a
              v-else
              href="#"
              class="cursor-pointer rounded-lg px-4 py-3 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
              @click="mobileOpen = false"
            >
              {{ link.label }}
            </a>
          </template>
        </div>
      </nav>
    </Transition>
  </header>
</template>
