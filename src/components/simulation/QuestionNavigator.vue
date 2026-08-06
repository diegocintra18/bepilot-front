<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  answers: {
    type: Object,
    default: () => ({}),
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['select'])

const items = computed(() =>
  props.questions.map((q, index) => ({
    index,
    number: index + 1,
    answered: props.answers[q.id]?.selectedOptionId != null,
    current: index === props.currentIndex,
  })),
)
</script>

<template>
  <nav :aria-label="'Navegação de questões'">
    <ol class="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-6 xl:grid-cols-8">
      <li v-for="item in items" :key="item.index">
        <button
          type="button"
          :aria-label="`Ir para a questão ${item.number}${item.answered ? ' (respondida)' : ' (não respondida)'}`"
          :aria-current="item.current ? 'true' : undefined"
          class="h-9 w-full rounded-lg border font-button-text text-button-text text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="[
            item.current
              ? 'border-primary bg-primary text-on-primary'
              : item.answered
                ? 'border-secondary-container bg-secondary-container text-on-secondary-container'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary',
          ]"
          @click="emit('select', item.index)"
        >
          {{ item.number }}
        </button>
      </li>
    </ol>
  </nav>
</template>
