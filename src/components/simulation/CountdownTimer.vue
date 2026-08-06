<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  seconds: {
    type: Number,
    default: 0,
  },
})

const text = computed(() => {
  const s = Math.max(0, props.seconds)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
})

const low = computed(() => props.seconds < 300)
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
    :class="low ? 'border-error/40' : ''"
    role="timer"
    :aria-label="`Tempo restante ${text}`"
  >
    <AppIcon name="timer" :size="18" :class="low ? 'text-error' : 'text-secondary'" />
    <span
      class="font-label-caps text-label-caps tabular-nums"
      :class="low ? 'text-error' : 'text-secondary'"
    >
      {{ text }}
    </span>
  </div>
</template>
