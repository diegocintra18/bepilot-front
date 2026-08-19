<script setup>
import { onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

let timeoutId = setTimeout(() => {
  router.push({ name: 'dashboard' })
}, 3000)

function goToDashboard() {
  clearTimeout(timeoutId)
  router.push({ name: 'dashboard' })
}

onBeforeUnmount(() => {
  clearTimeout(timeoutId)
})
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-background px-margin-mobile">
    <div class="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
      <p class="mb-stack-lg font-body-md text-body-md text-on-surface">
        Seu cadastro foi realizado com sucesso! Você será redirecionado para o painel
      </p>

      <button
        type="button"
        class="w-full rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="goToDashboard"
      >
        Acessar dashboard
      </button>
    </div>
  </div>
</template>
