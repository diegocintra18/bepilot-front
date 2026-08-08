<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const auth = useAuthStore()

const error = ref('')
const cancelOpen = ref(false)
const cancelReason = ref('')
const cancelError = ref('')
const cancelling = ref(false)
const cancelSuccess = ref('')

const subscription = computed(() => auth.subscription)
const loading = computed(() => auth.subscriptionLoading)

const statusLabel = computed(
  () => ({ inactive: 'Inativa', active: 'Ativa', cancelled: 'Cancelada' })[subscription.value?.subscriptionStatus] || 'Inativa',
)

const isActive = computed(() => subscription.value?.subscriptionStatus === 'active')
const remaining = computed(() => subscription.value?.freeSimulationsRemaining ?? 0)
const limit = computed(() => subscription.value?.freeSimulationsLimit ?? 0)
const used = computed(() => subscription.value?.freeSimulationsUsed ?? 0)

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function progressPercent() {
  if (!limit.value) return 0
  return Math.min(100, Math.round((used.value / limit.value) * 100))
}

function redirectToCheckout() {
  window.location.assign(auth.buildCheckoutUrl())
}

function openCancel() {
  cancelError.value = ''
  cancelSuccess.value = ''
  cancelReason.value = ''
  cancelOpen.value = true
}

function closeCancel() {
  if (cancelling.value) return
  cancelOpen.value = false
}

async function confirmCancel() {
  cancelError.value = ''
  if (!cancelReason.value.trim()) {
    cancelError.value = 'Informe o motivo do cancelamento.'
    return
  }
  cancelling.value = true
  try {
    await auth.cancelSubscription(cancelReason.value.trim())
    cancelOpen.value = false
    cancelReason.value = ''
    cancelSuccess.value = 'Assinatura cancelada com sucesso.'
  } catch (err) {
    if (err.kind === 'validation') {
      cancelError.value = err.fieldErrors?.[0]?.message || 'Verifique o motivo informado.'
    } else {
      cancelError.value = err.message || 'Não foi possível cancelar a assinatura.'
    }
  } finally {
    cancelling.value = false
  }
}

onMounted(async () => {
  try {
    await auth.fetchSubscription()
  } catch {
    error.value = 'Não foi possível carregar sua assinatura. Tente novamente.'
  }
})
</script>

<template>
  <AppLayout title="Minha Assinatura">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Minha Assinatura</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Gerencie seu plano e acompanhe seus simulados gratuitos.
          </p>
        </div>
      </section>

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 font-body-md text-body-md text-on-surface-variant">
        <span
          class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
        Carregando assinatura...
      </div>

      <div v-else-if="error" class="space-y-stack-md">
        <div
          class="rounded-xl border border-primary bg-primary-fixed p-6 shadow-lift md:p-8"
        >
          <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">
                Sua assinatura não está ativa no momento.
              </h3>
              <div class="mt-2 max-w-xl space-y-2 font-body-md text-body-md text-on-surface-variant">
                <p>
                  Se você já realizou o pagamento, aguarde alguns minutos para a ativação.
                </p>
                <p>
                  Ainda não assinou? Ative agora e tenha acesso a simulados ilimitados e
                  questões comentadas para chegar preparado à prova da ANAC.
                </p>
                <p class="font-bold text-on-surface">Decole rumo à aprovação! ✈️</p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              @click="redirectToCheckout"
            >
              <AppIcon name="credit-card" :size="20" />
              Assinar agora
            </button>
          </div>
        </div>
        <button
          type="button"
          class="rounded-lg border border-outline-variant px-4 py-2 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-low"
          @click="error = ''; auth.fetchSubscription().catch(() => (error = 'Não foi possível carregar sua assinatura. Tente novamente.'))"
        >
          Tentar novamente
        </button>
      </div>

      <template v-else>
        <div
          v-if="cancelSuccess"
          role="status"
          class="flex items-center gap-2 rounded-lg border border-tertiary bg-tertiary-fixed px-4 py-3 font-button-text text-button-text text-on-tertiary-fixed-variant"
        >
          <AppIcon name="check-circle" :size="18" />
          {{ cancelSuccess }}
        </div>

        <section
          class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container"
                aria-hidden="true"
              >
                <AppIcon name="credit-card" :size="24" />
              </div>
              <div>
                <p class="font-headline-md text-headline-md text-on-surface">Status da assinatura</p>
                <p class="font-body-md text-body-md text-on-surface-variant">
                  {{ subscription?.subscription?.planName || 'Plano BePilot' }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 font-button-text text-button-text"
              :class="
                isActive
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                  : 'bg-surface-variant text-on-surface-variant'
              "
            >
              <AppIcon name="shield" :size="16" />
              {{ statusLabel }}
            </span>
          </div>

          <div v-if="isActive && subscription?.subscription" class="mt-6 grid grid-cols-1 gap-4 border-t border-outline-variant pt-6 sm:grid-cols-2">
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Plano</p>
              <p class="font-body-md text-body-md text-on-surface">{{ subscription.subscription.planName || 'Plano BePilot' }}</p>
            </div>
            <div>
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Provedor</p>
              <p class="font-body-md text-body-md text-on-surface">{{ subscription.subscription.provider === 'kiwify' ? 'Kiwify' : 'Manual' }}</p>
            </div>
            <div v-if="subscription.subscription.activatedAt">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Ativada em</p>
              <p class="font-body-md text-body-md text-on-surface">{{ formatDate(subscription.subscription.activatedAt) }}</p>
            </div>
            <div v-if="subscription.subscription.expiresAt">
              <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">Vence em</p>
              <p class="font-body-md text-body-md text-on-surface">{{ formatDate(subscription.subscription.expiresAt) }}</p>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="mb-5 flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="timer" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Simulados gratuitos</h3>
              <p class="text-sm text-on-surface-variant">
                {{ used }} de {{ limit }} utilizados
              </p>
            </div>
          </div>

          <div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-variant" role="presentation">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{ width: `${progressPercent()}%` }"
            />
          </div>

          <p v-if="remaining > 0" class="font-body-md text-body-md text-on-surface-variant">
            Você ainda tem <span class="font-bold text-on-surface">{{ remaining }}</span> simulado{{ remaining === 1 ? '' : 's' }} gratuito{{ remaining === 1 ? '' : 's' }}.
          </p>
          <div
            v-else
            class="rounded-lg bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container"
          >
            Você já utilizou todos os seus simulados gratuitos. Ative sua assinatura para continuar praticando.
          </div>
        </section>

        <section v-if="!isActive" class="rounded-xl border border-primary bg-primary-fixed p-6 shadow-lift md:p-8">
          <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Libere simulados ilimitados</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Ative sua assinatura e acesse todos os simulados sem limites.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              @click="redirectToCheckout"
            >
              <AppIcon name="credit-card" :size="20" />
              Assinar agora
            </button>
          </div>
        </section>

        <section v-if="isActive" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8">
          <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Cancelar assinatura</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Ao cancelar, você perde o acesso aos simulados ilimitados.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-error px-6 py-3 font-button-text text-button-text font-bold text-on-error transition-colors hover:bg-error/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              @click="openCancel"
            >
              <AppIcon name="trash" :size="20" />
              Cancelar assinatura
            </button>
          </div>
        </section>
      </template>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-150 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="cancelOpen" class="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile">
          <div class="absolute inset-0 bg-on-background/40" aria-hidden="true" @click="closeCancel" />
          <div
            role="dialog"
            aria-modal="true"
            class="relative w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
          >
            <h2 class="font-headline-md text-headline-md text-on-surface">Cancelar assinatura</h2>
            <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
              Conte-nos o motivo do cancelamento. Esta ação não pode ser desfeita.
            </p>

            <form class="mt-stack-lg" @submit.prevent="confirmCancel">
              <label for="cancel-reason" class="mb-2 block font-label-caps text-label-caps uppercase text-on-surface-variant">
                Motivo do cancelamento
              </label>
              <textarea
                id="cancel-reason"
                v-model="cancelReason"
                name="reason"
                rows="4"
                maxlength="1000"
                placeholder="Ex.: Preço, uso ocasional..."
                class="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
              />

              <ValidationMessages v-if="cancelError" :message="cancelError" class="mt-stack-sm" />

              <div class="mt-stack-lg flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-lg border border-outline-variant px-4 py-2 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="cancelling"
                  @click="closeCancel"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  class="flex items-center gap-2 rounded-lg bg-error px-4 py-2 font-button-text text-button-text font-bold text-on-error transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="cancelling"
                >
                  <span
                    v-if="cancelling"
                    class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                    role="status"
                    aria-label="Carregando"
                  />
                  {{ cancelling ? 'Cancelando...' : 'Confirmar cancelamento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>
