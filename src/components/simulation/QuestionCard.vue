<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  questionNumber: {
    type: Number,
    default: 1,
  },
  selectedOptionId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['select'])

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const options = computed(() =>
  (props.question.options || []).map((option, index) => ({
    ...option,
    letter: letters[index] || String(index + 1),
  })),
)
</script>

<template>
  <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lift md:p-8">
    <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">
      Questão {{ questionNumber }}
    </p>
    <p class="mt-stack-sm whitespace-pre-line font-body-lg text-body-lg text-on-surface">
      {{ question.statement }}
    </p>

    <div
      role="radiogroup"
      :aria-label="`Opções da questão ${questionNumber}`"
      class="mt-stack-lg space-y-3"
    >
      <label
        v-for="option in options"
        :key="option.id"
        class="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
        :class="
          selectedOptionId === option.id
            ? 'border-primary bg-primary-fixed'
            : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
        "
      >
        <input
          type="radio"
          class="sr-only"
          :name="`question-${question.id}`"
          :value="option.id"
          :checked="selectedOptionId === option.id"
          @change="emit('select', option.id)"
        >
        <span
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-label-caps text-label-caps"
          :class="
            selectedOptionId === option.id
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-variant text-on-surface-variant'
          "
        >
          {{ option.letter }}
        </span>
        <span class="font-body-md text-body-md text-on-surface">{{ option.description }}</span>
      </label>
    </div>
  </section>
</template>
