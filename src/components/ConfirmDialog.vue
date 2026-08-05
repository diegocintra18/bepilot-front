<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmar ação',
  },
  message: {
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
})

const emit = defineEmits(['cancel', 'confirm'])
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
        <div class="absolute inset-0 bg-on-background/40" aria-hidden="true" @click="emit('cancel')" />
        <div
          role="dialog"
          aria-modal="true"
          class="relative w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
        >
          <h2 class="font-headline-md text-headline-md text-on-surface">{{ title }}</h2>
          <p v-if="message" class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            {{ message }}
          </p>
          <div class="mt-stack-lg flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-outline-variant px-4 py-2 font-button-text text-button-text text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="emit('cancel')"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg bg-error px-4 py-2 font-button-text text-button-text font-bold text-on-error transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <span
                v-if="loading"
                class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                role="status"
                aria-label="Carregando"
              />
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
