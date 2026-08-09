<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  hideConfirm: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'confirm'])

const confirmClasses = computed(() =>
  props.variant === 'danger'
    ? 'bg-error hover:bg-error/90 text-on-error'
    : 'bg-primary hover:bg-primary-container text-on-primary',
)

function onBackdrop() {
  if (props.loading) return
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile">
        <div class="absolute inset-0 bg-on-background/40" aria-hidden="true" @click="onBackdrop" />
        <div
          role="dialog"
          aria-modal="true"
          class="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
        >
          <h2 class="font-headline-md text-headline-md text-on-surface">{{ title }}</h2>
          <p v-if="description" class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            {{ description }}
          </p>

          <div class="mt-stack-md">
            <slot />
          </div>

          <div class="mt-stack-lg flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-outline-variant px-4 py-2 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>
            <button
              v-if="!hideConfirm"
              type="button"
              class="flex items-center gap-2 rounded-lg px-4 py-2 font-button-text text-button-text font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="confirmClasses"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <span
                v-if="loading"
                class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                role="status"
                aria-label="Carregando"
              />
              {{ loading ? 'Processando...' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
