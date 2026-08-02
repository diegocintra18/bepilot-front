<script setup>
import AppIcon from './AppIcon.vue'
</script>

<template>
  <section class="relative flex h-[600px] items-center overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-b from-primary-fixed-dim via-primary-fixed to-surface-container-low"
      aria-hidden="true"
    ></div>
    <div
      class="absolute -left-24 top-16 h-72 w-96 rounded-full bg-white/60 blur-3xl"
      aria-hidden="true"
    ></div>
    <div
      class="absolute right-10 top-8 h-64 w-80 rounded-full bg-white/50 blur-3xl"
      aria-hidden="true"
    ></div>
    <div
      class="absolute bottom-6 left-1/3 h-56 w-96 rounded-full bg-white/40 blur-3xl"
      aria-hidden="true"
    ></div>

    <div class="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/60" aria-hidden="true"></div>

    <div
      class="relative z-10 mx-auto grid w-full max-w-container-max-width grid-cols-1 gap-gutter px-margin-mobile md:grid-cols-12 md:px-margin-desktop"
    >
      <div class="flex flex-col justify-center text-on-primary md:col-span-7">
        <div
          class="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container"
        >
          <AppIcon name="star" :size="16" class="shrink-0" />
          <span class="font-label-caps text-label-caps uppercase tracking-wider">Aprovação Garantida</span>
        </div>

        <h1 class="font-display-lg text-display-lg mb-4 text-on-primary">
          Prepare-se para a prova da ANAC com quem entende.
        </h1>

        <p class="font-body-lg text-body-lg mb-8 max-w-lg text-on-primary-container">
          Simulados atualizados para PPA, PPH, PC e IFR. Estude com questões reais e análise de desempenho avançada.
        </p>

        <div class="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            class="cursor-pointer rounded-lg bg-secondary-container px-8 py-4 font-button-text text-button-text text-on-secondary-container shadow-lg transition-transform hover:bg-secondary-fixed-dim active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-secondary-container"
          >
            Começar Agora
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-lg border border-white/30 bg-white/10 px-8 py-4 font-button-text text-button-text text-on-primary backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
          >
            Ver Planos
          </button>
        </div>
      </div>

      <div class="hidden items-center justify-end md:flex md:col-span-5">
        <div
          class="flex h-80 w-80 flex-col items-center justify-center rounded-full border-2 border-primary/10 bg-white/90 p-stack-lg text-center shadow-xl backdrop-blur-md"
        >
          <AppIcon name="timer" :size="56" class="mb-2 text-primary" />
          <div class="font-label-caps text-label-caps mb-1 text-secondary">TEMPO REAL</div>
          <div class="font-display-lg text-headline-lg text-primary">01:45:00</div>
          <p class="mt-2 px-6 font-body-md text-body-md text-on-surface-variant">
            Cronômetro idêntico ao da prova oficial ANAC.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
