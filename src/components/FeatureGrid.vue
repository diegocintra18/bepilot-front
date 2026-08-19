<script setup>
import router from '@/router/index.js';
import AppIcon from './AppIcon.vue'
</script>

<template>
  <section class="bg-surface-container-low py-stack-lg">
    <div class="mx-auto w-full max-w-container-max-width px-margin-mobile md:px-margin-desktop">
      <div class="mb-12 text-center">
        <h2 class="font-display-lg text-headline-lg mb-2 text-primary">Por que estudar conosco?</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">
          A plataforma mais completa para o seu sucesso na aviação.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div
          class="bento-card flex flex-col items-center gap-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg md:col-span-8 md:flex-row"
        >
          <div class="flex-1">
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary"
            >
              <AppIcon name="chat" :size="24" />
            </div>
            <h3 class="font-headline-md text-headline-md mb-2 text-primary">Questões Comentadas</h3>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Não apenas responda, entenda o porquê. Todas as perguntas possuem respostas comentadas para aumentar seu embasamento teórico.
            </p>
          </div>

          <div class="h-48 w-full flex-1 overflow-hidden rounded-xl bg-surface-variant">
            <div class="flex h-full flex-col justify-center gap-2 bg-surface-container-lowest p-4">
              <div class="flex items-center gap-2">
                <span class="rounded-sm bg-primary px-2 py-0.5 font-label-caps text-label-caps text-on-primary">
                  PPA
                </span>
                <div class="h-1.5 flex-1 rounded-full bg-surface-container-high">
                  <div class="h-full w-1/3 rounded-full bg-primary-container"></div>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="h-2 w-4/5 rounded-full bg-surface-container-high"></div>
                <div class="h-2 w-3/5 rounded-full bg-surface-container-high"></div>
              </div>
              <div class="space-y-1.5 pt-1">
                <div class="flex items-center gap-2 rounded border border-outline-variant px-2 py-1.5">
                  <span class="h-3 w-3 rounded-full border-2 border-outline"></span>
                  <span class="h-2 w-3/4 rounded-full bg-surface-container-high"></span>
                </div>
                <div class="flex items-center gap-2 rounded border-2 border-primary-container bg-primary-fixed px-2 py-1.5">
                  <span class="h-3 w-3 rounded-full border-2 border-primary-container bg-primary-container"></span>
                  <span class="h-2 w-3/4 rounded-full bg-surface-container-high"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bento-card rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg md:col-span-4">
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container"
          >
            <AppIcon name="chart" :size="24" />
          </div>
          <h3 class="font-headline-md text-headline-md mb-2 text-primary">Estatísticas Detalhadas</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Identifique seus pontos fracos por matéria e acompanhe sua evolução gráfica ao longo do tempo.
          </p>
        </div>

        <div class="bento-card rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg md:col-span-4">
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tertiary-container text-on-tertiary-container"
          >
            <AppIcon name="refresh" :size="24" />
          </div>
          <h3 class="font-headline-md text-headline-md mb-2 text-primary">Simulados Ilimitados</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Gere quantos simulados desejar. Nosso banco de dados é atualizado frequentemente com novas questões.
          </p>
        </div>

        <div
          class="bento-card flex flex-col items-center gap-8 rounded-xl bg-primary p-stack-lg text-on-primary md:col-span-8 md:flex-row"
        >
          <div class="order-2 flex-1 md:order-1">
            <h3 class="font-headline-md text-headline-md mb-2">Estude onde quiser</h3>
            <p class="mb-4 font-body-md text-body-md opacity-90">
              Nossa plataforma é 100% adaptável. Pratique no computador, tablet ou celular.
            </p>
            <button
              type="button"
              class="cursor-pointer rounded-lg bg-surface-container-lowest px-6 py-2 font-button-text text-button-text text-primary transition-colors hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary"
              @click="router.push('/register')"
            >
              Começar agora
            </button>
          </div>

          <div class="order-1 flex flex-1 justify-center md:order-2">
            <div class="relative h-64 w-32 overflow-hidden rounded-3xl border-4 border-inverse-on-surface/40 bg-inverse-surface shadow-2xl">
              <div class="absolute top-0 flex h-6 w-full items-center justify-center bg-inverse-on-surface/20">
                <div class="h-1 w-12 rounded-full bg-inverse-on-surface/40"></div>
              </div>
              <div class="flex h-[calc(100%-1.5rem)] flex-col gap-2 px-3 pb-3 pt-7">
                <div class="flex items-center justify-between">
                  <div class="h-2 w-10 rounded-full bg-inverse-on-surface/50"></div>
                  <div class="h-2 w-6 rounded-full bg-inverse-on-surface/30"></div>
                </div>

                <div class="flex justify-center py-1">
                  <div class="relative h-16 w-16 text-on-primary-container">
                    <svg viewBox="0 0 36 36" class="h-16 w-16 -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        stroke-opacity="0.2"
                        stroke-width="3.5"
                      ></circle>
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3.5"
                        stroke-dasharray="75 100"
                        stroke-linecap="round"
                      ></circle>
                    </svg>
                    <span
                      class="absolute inset-0 flex items-center justify-center font-label-caps text-label-caps text-on-primary-container"
                    >
                      75%
                    </span>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <div class="h-2 w-full rounded-full bg-inverse-on-surface/25"></div>
                  <div class="h-2 w-4/5 rounded-full bg-inverse-on-surface/25"></div>
                </div>

                <div class="flex gap-1 pt-1">
                  <div class="h-4 w-1/2 rounded bg-primary-container"></div>
                  <div class="h-4 w-1/2 rounded bg-inverse-on-surface/20"></div>
                </div>

                <div
                  class="mt-auto rounded-lg bg-primary-container py-1.5 text-center font-label-caps text-label-caps text-on-primary"
                >
                  Iniciar Simulado
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
