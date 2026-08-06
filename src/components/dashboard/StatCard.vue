<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: '—',
  },
  hint: {
    type: String,
    default: '',
  },
  progress: {
    type: Number,
    default: null,
  },
  tone: {
    type: String,
    default: 'bg-secondary-container text-on-secondary-container',
  },
  barClass: {
    type: String,
    default: 'bg-secondary-container',
  },
})

const progressValue = computed(() => {
  if (props.progress === null || props.progress === undefined) return null
  return Math.max(0, Math.min(100, Number(props.progress)))
})
</script>

<template>
  <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
    <div class="flex items-start justify-between">
      <div>
        <p class="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">{{ label }}</p>
        <h4 class="font-display-lg text-headline-lg text-on-surface">{{ value }}</h4>
        <p v-if="hint" class="mt-1 text-sm text-on-surface-variant">{{ hint }}</p>
      </div>
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full"
        :class="tone"
        aria-hidden="true"
      >
        <AppIcon :name="icon" :size="24" />
      </div>
    </div>
    <div v-if="progressValue !== null" class="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container">
      <div class="h-full rounded-full" :class="barClass" :style="{ width: `${progressValue}%` }"></div>
    </div>
  </section>
</template>
