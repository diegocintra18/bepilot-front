<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USER_TYPE_LABELS } from '@/constants/userTypes'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()

const open = ref(false)
const loggingOut = ref(false)

function handleKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

function handleOutsideClick(event) {
  const el = document.getElementById('user-menu')
  if (el && !el.contains(event.target)) open.value = false
}

function toggle() {
  open.value = !open.value
}

function goToProfile() {
  open.value = false
  router.push({ name: 'profile' })
}

function goToSubscription() {
  open.value = false
  router.push({ name: 'subscription' })
}

function goToAiCredits() {
  open.value = false
  router.push({ name: 'ai-credits' })
}

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await auth.logout()
    open.value = false
    router.push({ name: 'login' })
  } finally {
    loggingOut.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('pointerdown', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('pointerdown', handleOutsideClick)
})
</script>

<template>
  <div id="user-menu" class="relative">
    <button
      type="button"
      class="flex items-center gap-3 rounded-full px-3 py-1.5 transition-all hover:bg-surface-container-low"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="Menu do usuário"
      @click="toggle"
    >
      <div class="hidden text-right sm:block">
        <p class="font-button-text text-button-text leading-tight text-on-surface">
          {{ auth.user?.fullName }}
        </p>
        <p class="font-body-md text-sm leading-tight text-on-surface-variant">
          {{ USER_TYPE_LABELS[auth.user?.userType] || 'Usuário' }}
        </p>
      </div>
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container font-button-text text-button-text font-bold text-primary"
        aria-hidden="true"
      >
        {{ auth.user?.initials }}
      </div>
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="open"
        role="menu"
        class="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lift"
      >
        <div class="border-b border-outline-variant px-4 py-3 sm:hidden">
          <p class="font-button-text text-button-text font-bold text-on-surface">
            {{ auth.user?.fullName }}
          </p>
          <p class="font-body-md text-sm text-on-surface-variant">
            {{ USER_TYPE_LABELS[auth.user?.userType] || 'Usuário' }}
          </p>
        </div>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 px-4 py-3 text-left font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
          @click="goToProfile"
        >
          <AppIcon name="user" :size="18" />
          Editar perfil
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
          @click="goToAiCredits"
        >
          <AppIcon name="zap" :size="18" />
          Créditos de IA
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
          @click="goToSubscription"
        >
          <AppIcon name="credit-card" :size="18" />
          Minha assinatura
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left font-button-text text-button-text text-error transition-colors hover:bg-error-container/40"
          :disabled="loggingOut"
          @click="logout"
        >
          <AppIcon name="log-out" :size="18" />
          {{ loggingOut ? 'Saindo...' : 'Sair' }}
        </button>
      </div>
    </transition>
  </div>
</template>
