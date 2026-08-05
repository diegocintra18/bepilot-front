<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'

const auth = useAuthStore()

const firstName = computed(() => auth.user?.fullName?.split(' ')[0] || 'Piloto')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

const week = [
  { label: 'SEG', pct: 65 },
  { label: 'TER', pct: 72 },
  { label: 'QUA', pct: 68 },
  { label: 'QUI', pct: 85 },
  { label: 'SEX', pct: 78 },
  { label: 'SÁB', pct: 70 },
  { label: 'HOJE', pct: 92, today: true },
]

const topics = [
  { title: 'Cálculo de Deriva', pct: 30, fill: 'bg-error', label: 'text-error' },
  { title: 'Regras de Tráfego VFR', pct: 55, fill: 'bg-secondary-fixed-dim', label: 'text-secondary' },
]

const simulations = [
  {
    title: 'Simulado PPA #242',
    meta: '60 questões • 1h 20m',
    date: '14 Out, 2024',
    result: 'APROVADO (88%)',
    pass: true,
  },
  {
    title: 'Meteorologia Avançada',
    meta: '20 questões • 25m',
    date: '12 Out, 2024',
    result: 'REPROVADO (65%)',
    pass: false,
  },
  {
    title: 'Simulado PPA #241',
    meta: '60 questões • 1h 45m',
    date: '10 Out, 2024',
    result: 'APROVADO (78%)',
    pass: true,
  },
]
</script>

<template>
  <AppLayout title="Dashboard do Estudante">
    <div class="space-y-stack-lg">
      <section
        class="flex flex-col justify-between gap-6 border-b border-outline-variant pb-8 md:flex-row md:items-end"
      >
        <div>
          <h2 class="font-headline-lg mb-2 text-headline-lg text-on-surface">
            {{ greeting }}, {{ firstName }}!
          </h2>
          <p class="font-body-lg text-body-lg text-on-surface-variant">
            Seu progresso nos simulados PPA está
            <span class="font-bold text-tertiary">12% superior</span>
            à semana passada. Mantenha o foco!
          </p>
        </div>
        <div class="flex flex-wrap gap-4">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-button-text text-button-text text-on-primary transition-all hover:bg-primary-container"
          >
            <AppIcon name="rocket" :size="20" />
            Novo PPA Exam
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border-2 border-primary bg-surface-container-lowest px-6 py-2.5 font-button-text text-button-text text-primary transition-all hover:bg-primary-fixed"
          >
            <AppIcon name="clock" :size="20" />
            Revisar Erros
          </button>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <section
          class="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:col-span-8"
        >
          <div class="absolute left-0 top-0 h-1 w-full bg-primary" aria-hidden="true"></div>
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Evolução de Performance</h3>
            <span
              class="rounded-full bg-surface-container px-3 py-1 font-label-caps text-label-caps text-on-surface-variant"
            >
              Últimos 7 dias
            </span>
          </div>
          <div class="flex h-[200px] items-end justify-between gap-4">
            <div
              v-for="bar in week"
              :key="bar.label"
              class="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                class="relative w-full rounded-t-lg"
                :class="bar.today ? 'bg-primary-container' : 'bg-surface-container-low'"
                :style="{ height: `${bar.pct}%` }"
              >
                <span
                  class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-on-background px-2 py-1 font-label-caps text-label-caps text-white transition-opacity"
                  :class="bar.today ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                >
                  {{ bar.pct }}%
                </span>
              </div>
              <span
                class="font-label-caps text-label-caps"
                :class="bar.today ? 'font-bold text-primary' : 'text-on-surface-variant'"
              >
                {{ bar.label }}
              </span>
            </div>
          </div>
        </section>

        <div class="flex flex-col gap-gutter md:col-span-4">
          <section
            class="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-highest p-6"
          >
            <div>
              <p class="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
                Tempo de Estudo
              </p>
              <h4 class="font-display-lg text-headline-lg text-primary">12h 45m</h4>
            </div>
            <div class="mt-4 flex items-center gap-2 text-tertiary">
              <AppIcon name="trending-up" :size="20" />
              <span class="text-sm font-bold">+2.4h esta semana</span>
            </div>
          </section>

          <section
            class="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Média Geral
                </p>
                <h4 class="font-display-lg text-headline-lg text-on-surface">84%</h4>
              </div>
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
                aria-hidden="true"
              >
                <AppIcon name="award" :size="24" />
              </div>
            </div>
            <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div class="h-full w-[84%] rounded-full bg-secondary-container"></div>
            </div>
          </section>
        </div>

        <section
          class="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:col-span-5"
        >
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Tópicos Recomendados</h3>
            <AppIcon name="info" class="cursor-pointer text-primary" :size="20" />
          </div>
          <p class="mb-6 font-body-md italic text-on-surface-variant">
            Baseado nos seus erros recentes em Navegação Visual.
          </p>
          <div class="space-y-3">
            <div
              v-for="topic in topics"
              :key="topic.title"
              class="group cursor-pointer rounded-lg border border-outline-variant bg-surface-container-low p-4 transition-colors hover:border-primary"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="font-button-text text-button-text text-primary">{{ topic.title }}</span>
                <AppIcon name="arrow-right" class="text-outline transition-colors group-hover:text-primary" :size="16" />
              </div>
              <div class="flex items-center gap-4">
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-variant">
                  <div class="h-full rounded-full" :class="topic.fill" :style="{ width: `${topic.pct}%` }"></div>
                </div>
                <span class="font-label-caps text-xs font-bold" :class="topic.label">
                  {{ topic.pct }}% Acerto
                </span>
              </div>
            </div>
          </div>
          <button type="button" class="mt-auto pt-6 text-center font-bold text-primary hover:underline">
            Ver plano de estudos completo
          </button>
        </section>

        <section
          class="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:col-span-7"
        >
          <div class="mb-6 flex items-center justify-between">
            <h3 class="font-headline-md text-headline-md text-on-surface">Simulados Recentes</h3>
            <button type="button" class="font-button-text text-sm text-primary-container">
              Ver Histórico
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="border-b border-outline-variant">
                <tr class="font-label-caps text-label-caps text-on-surface-variant">
                  <th class="px-2 py-3">SIMULADO</th>
                  <th class="px-2 py-3">DATA</th>
                  <th class="px-2 py-3">RESULTADO</th>
                  <th class="px-2 py-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody class="font-body-md">
                <tr
                  v-for="sim in simulations"
                  :key="sim.title"
                  class="border-b border-surface-container transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td class="px-2 py-4">
                    <p class="font-bold text-on-surface">{{ sim.title }}</p>
                    <p class="text-xs text-on-surface-variant">{{ sim.meta }}</p>
                  </td>
                  <td class="px-2 py-4 text-sm text-on-surface-variant">{{ sim.date }}</td>
                  <td class="px-2 py-4">
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-bold"
                      :class="
                        sim.pass
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                          : 'bg-error-container text-on-error-container'
                      "
                    >
                      {{ sim.result }}
                    </span>
                  </td>
                  <td class="px-2 py-4 text-right">
                    <button
                      type="button"
                      class="p-2 text-on-surface-variant transition-colors hover:text-primary"
                      :aria-label="`Ver detalhes de ${sim.title}`"
                    >
                      <AppIcon name="eye" :size="18" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer
        class="mt-24 flex flex-col items-center justify-between gap-6 border-t border-outline-variant pb-8 pt-8 md:flex-row"
      >
        <p class="font-body-md text-on-surface-variant">
          © 2026 Vou ser Piloto. Todos os direitos reservados.
        </p>
        <div class="flex gap-8">
          <a
            href="#"
            class="font-label-caps text-label-caps text-on-surface-variant decoration-secondary transition-all hover:text-primary hover:underline"
          >
            Termos de Uso
          </a>
          <a
            href="#"
            class="font-label-caps text-label-caps text-on-surface-variant decoration-secondary transition-all hover:text-primary hover:underline"
          >
            Privacidade
          </a>
          <a
            href="#"
            class="font-label-caps text-label-caps text-on-surface-variant decoration-secondary transition-all hover:text-primary hover:underline"
          >
            Ajuda
          </a>
        </div>
      </footer>
    </div>
  </AppLayout>
</template>
