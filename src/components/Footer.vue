<script setup>
import BrandLogo from './BrandLogo.vue'
import AppIcon from './AppIcon.vue'

const footerLinks = [
  { label: 'Termos de Uso', href: '#' },
  { label: 'Privacidade', href: '#' },
  { label: 'Ajuda', href: '#' },
  { label: 'Institucional', href: '#' },
]

const socialLinks = [
  { label: 'Site', icon: 'globe', href: '#' },
  { label: 'Contato', icon: 'mail', href: '#' },
]
</script>

<template>
  <footer class="border-t border-outline-variant bg-surface-container-lowest py-stack-lg">
    <div
      class="mx-auto flex w-full max-w-container-max-width flex-col items-center justify-between px-margin-mobile md:flex-row md:px-margin-desktop"
    >
      <div class="mb-6 text-center md:mb-0 md:text-left">
        <div class="mb-2 flex justify-center md:justify-start">
          <BrandLogo />
        </div>
        <p class="max-w-xs font-body-md text-body-md text-on-surface-variant">
          Acelere sua carreira na aviação com o melhor treinamento teórico do Brasil.
        </p>
      </div>

      <nav class="mb-8 flex flex-wrap justify-center gap-6 md:mb-0" aria-label="Links institucionais">
        <template v-for="link in footerLinks" :key="link.label">
          <a
            :href="link.href"
            class="cursor-pointer font-label-caps text-label-caps text-on-surface-variant transition-all hover:text-primary hover:underline decoration-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {{ link.label }}
          </a>
        </template>
      </nav>

      <div class="text-center md:text-right">
        <div class="mb-4 flex justify-center gap-4 md:justify-end">
          <template v-for="social in socialLinks" :key="social.label">
            <a
              :href="social.href"
              class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container-low text-primary transition-colors hover:bg-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              :aria-label="social.label"
            >
              <AppIcon :name="social.icon" :size="20" />
            </a>
          </template>
        </div>
        <p class="font-body-md text-sm text-on-surface-variant">
          © 2024 Vou ser Piloto. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
