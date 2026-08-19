<script setup>
import { useAuthStore } from '@/stores/auth'
import AppIcon from './AppIcon.vue'
import router from '@/router/index.js'

const auth = useAuthStore()

function redirectToCheckout() {
  router.push('/register')
}

const basicPlan = [
  { label: 'Simulados ilimitados', available: true },
  { label: 'Questões Comentadas', available: true },
  { label: 'Gere até 10 planos de estudos com base nos simulados', available: true },
  { label: 'Suporte via WhatsApp', available: true },
]

const proPlan = [
  { label: 'Simulados ilimitados', available: true },
  { label: 'Questões Comentadas', available: true },
  { label: 'Gere planos de estudos ilimitados com base nos simulados', available: true, benefit: true },
  { label: 'Suporte via WhatsApp', available: true },
]
</script>

<template>
  <section class="bg-surface-container-lowest py-stack-lg">
    <div class="mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
      <div class="mb-12 text-center">
        <h2 class="font-display-lg text-headline-lg mb-2 text-primary">Planos Sob Medida</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Escolha o plano que melhor se adapta à sua jornada de piloto.
        </p>
      </div>

      <div class="mx-auto flex max-w-4xl flex-col items-stretch justify-center gap-gutter md:flex-row">
        <div
          class="flex flex-1 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg"
        >
          <div class="mb-6">
            <h3 class="font-headline-md text-headline-md text-primary">Plano Básico</h3>
            <div class="mt-2 flex items-baseline gap-1">
              <span class="font-body-md text-body-md text-on-surface-variant">R$</span>
              <span class="text-4xl font-bold text-primary">34,90</span>
              <span class="font-body-md text-body-md text-on-surface-variant">/mês</span>
            </div>
          </div>

          <ul class="mb-8 flex-1 space-y-4">
            <li
              v-for="benefit in basicPlan"
              :key="benefit.label"
              class="flex items-center gap-3"
              :class="{ 'opacity-40': !benefit.available }"
            >
              <AppIcon
                :name="benefit.available ? 'check-circle' : 'x-circle'"
                :size="24"
                class="shrink-0"
                :class="benefit.available ? 'text-tertiary' : 'text-on-surface-variant'"
              />
              <span class="font-body-md text-body-md">{{ benefit.label }}</span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full cursor-pointer rounded-lg border-2 border-primary py-3 font-button-text text-button-text text-primary transition-all hover:bg-primary-container hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="redirectToCheckout"
          >
            Fazer teste grátis
          </button>
        </div>

        <div
          class="relative z-10 flex flex-1 scale-105 flex-col rounded-xl border-2 border-secondary-container bg-surface-container-lowest p-stack-lg shadow-xl"
        >
          <div
            class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary-container px-4 py-1 font-label-caps text-label-caps font-bold text-on-secondary-container"
          >
            RECOMENDADO
          </div>

          <div class="mb-6">
            <h3 class="font-headline-md text-headline-md text-primary">Plano Pro</h3>
            <div class="mt-2 flex items-baseline gap-1">
              <span class="font-body-md text-body-md text-on-surface-variant">R$</span>
              <span class="text-4xl font-bold text-primary">79,00</span>
              <span class="font-body-md text-body-md text-on-surface-variant">/mês</span>
            </div>
          </div>

          <ul class="mb-8 flex-1 space-y-4">
            <li v-for="benefit in proPlan" :key="benefit.label" class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span
                class="font-body-md text-body-md"
                :class="{ 'font-bold': benefit.highlighted }"
              >
                {{ benefit.label }}
              </span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full cursor-pointer rounded-lg bg-primary py-4 font-button-text text-button-text text-on-primary shadow-lg transition-all hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="redirectToCheckout"
          >
            Fazer teste grátis
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
