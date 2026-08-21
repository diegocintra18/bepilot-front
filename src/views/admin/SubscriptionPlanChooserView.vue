<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { usersApi } from '@/api/users'

const BASIC_URL = 'https://pay.kiwify.com.br/pNodtu8'
const PRO_URL = 'https://pay.kiwify.com.br/Jkvo30Q'

const route = useRoute()
const subscriptionsStore = useSubscriptionsStore()

const loading = ref(true)
const error = ref('')
const user = ref(null)

const subscriptionId = computed(() => Number(route.params.id))

function buildCheckoutUrl(baseUrl) {
  const params = new URLSearchParams()
  const fullName = user.value?.fullName
  const email = user.value?.email
  const phone = user.value?.whatsapp

  if (fullName) params.set('name', fullName)
  if (email) params.set('email', email)
  if (phone) params.set('phone', phone)

  const query = params.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
}

function redirectToBasic() {
  window.location.assign(buildCheckoutUrl(BASIC_URL))
}

function redirectToPro() {
  window.location.assign(buildCheckoutUrl(PRO_URL))
}

async function load() {
  loading.value = true
  error.value = ''
  user.value = null

  try {
    const subscription = await subscriptionsStore.getSubscription(subscriptionId.value)
    const userId = subscription?.user?.id
    if (!userId) throw new Error('Usuário da assinatura não encontrado')

    const nextUser = await usersApi.adminGet(userId)
    user.value = nextUser
  } catch (err) {
    error.value = err.message || 'Não foi possível carregar os dados do usuário.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <AppLayout title="Planos Sob Medida">
    <div class="space-y-stack-lg">
      <section class="text-center">
        <h2 class="font-display-lg text-headline-lg mb-2 text-primary">Planos Sob Medida</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">Escolha o plano que melhor se adapta à sua jornada de piloto.</p>
      </section>

      <ValidationMessages v-if="error" :message="error" />
      <section v-if="loading" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <section v-else class="mx-auto flex max-w-4xl flex-col items-stretch justify-center gap-gutter md:flex-row">
        <div class="flex flex-1 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg">
          <div class="mb-6">
            <h3 class="font-headline-md text-headline-md text-primary">Plano Básico</h3>
            <div class="mt-2 flex items-baseline gap-1">
              <span class="font-body-md text-body-md text-on-surface-variant">R$</span>
              <span class="text-4xl font-bold text-primary">34,90</span>
              <span class="font-body-md text-body-md text-on-surface-variant">/mês</span>
            </div>
          </div>

          <ul class="mb-8 flex-1 space-y-4">
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Simulados ilimitados</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Questões Comentadas</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Gere até 10 planos de estudos com base nos simulados</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Suporte via WhatsApp</span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full cursor-pointer rounded-lg border-2 border-primary py-3 font-button-text text-button-text text-primary transition-all hover:bg-primary-container hover:text-on-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="redirectToBasic"
          >
            Ativar plano
          </button>
        </div>

        <div class="relative z-10 flex flex-1 scale-105 flex-col rounded-xl border-2 border-secondary-container bg-surface-container-lowest p-stack-lg shadow-xl">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary-container px-4 py-1 font-label-caps text-label-caps font-bold text-on-secondary-container">
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
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Simulados ilimitados</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Questões Comentadas</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Gere planos de estudos ilimitados com base nos simulados</span>
            </li>
            <li class="flex items-center gap-3">
              <AppIcon name="check-circle" :size="24" class="shrink-0 text-tertiary" />
              <span class="font-body-md text-body-md">Suporte via WhatsApp</span>
            </li>
          </ul>

          <button
            type="button"
            class="w-full cursor-pointer rounded-lg bg-primary py-4 font-button-text text-button-text text-on-primary shadow-lg transition-all hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="redirectToPro"
          >
            Ativar plano
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
