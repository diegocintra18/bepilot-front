<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  answers: {
    type: Array,
    default: () => [],
  },
})

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const answerByQuestion = computed(() => {
  const map = {}
  for (const answer of props.answers) {
    map[answer.questionId] = answer
  }
  return map
})

function statusOf(question) {
  const answer = answerByQuestion.value[question.id]
  if (!answer || answer.selectedOptionId == null) return 'unanswered'
  return answer.isCorrect ? 'correct' : 'wrong'
}

function optionState(question, optionId) {
  const answer = answerByQuestion.value[question.id]
  const correctId = question.correctOptionId
  const selectedId = answer?.selectedOptionId
  if (correctId != null && optionId === correctId) return 'correct'
  if (selectedId != null && selectedId !== correctId && optionId === selectedId) return 'wrong'
  return 'neutral'
}

function optionClasses(state) {
  if (state === 'correct') return 'border-tertiary bg-tertiary-fixed'
  if (state === 'wrong') return 'border-error bg-error-container'
  return 'border-outline-variant bg-surface-container-lowest'
}

function optionTag(state) {
  if (state === 'correct') return 'Resposta correta'
  if (state === 'wrong') return 'Sua resposta'
  return ''
}

const statusMeta = {
  correct: { label: 'Correta', classes: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'check-circle' },
  wrong: { label: 'Incorreta', classes: 'bg-error-container text-on-error-container', icon: 'x-circle' },
  unanswered: { label: 'Não respondida', classes: 'bg-surface-container text-on-surface-variant', icon: 'help-circle' },
}
</script>

<template>
  <div class="space-y-3">
    <details
      v-for="(question, index) in questions"
      :key="question.id"
      :open="index === 0"
      class="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lift"
    >
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"
      >
        <div class="flex items-center gap-3">
          <span class="font-label-caps text-label-caps text-on-surface-variant">Questão {{ index + 1 }}</span>
          <span
            class="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            :class="statusMeta[statusOf(question)].classes"
          >
            <AppIcon :name="statusMeta[statusOf(question)].icon" :size="14" />
            {{ statusMeta[statusOf(question)].label }}
          </span>
        </div>
        <AppIcon
          name="chevron-right"
          :size="18"
          class="text-on-surface-variant transition-transform group-open:rotate-90"
        />
      </summary>

      <div class="border-t border-surface-container px-5 py-4">
        <p class="whitespace-pre-line font-body-lg text-body-lg text-on-surface">
          {{ question.statement }}
        </p>

        <div class="mt-stack-md space-y-2" role="list">
          <div
            v-for="(option, optionIndex) in question.options || []"
            :key="option.id"
            class="flex items-start gap-3 rounded-lg border px-4 py-3"
            :class="optionClasses(optionState(question, option.id))"
            role="listitem"
          >
            <span
              class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-label-caps text-label-caps"
              :class="
                optionState(question, option.id) === 'correct'
                  ? 'border-tertiary bg-tertiary text-on-tertiary'
                  : optionState(question, option.id) === 'wrong'
                    ? 'border-error bg-error text-on-error'
                    : 'border-outline-variant text-on-surface-variant'
              "
            >
              {{ letters[optionIndex] || optionIndex + 1 }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-body-md text-body-md text-on-surface">{{ option.description }}</span>
              <span
                v-if="optionTag(optionState(question, option.id))"
                class="font-label-caps text-label-caps uppercase"
                :class="
                  optionState(question, option.id) === 'correct'
                    ? 'text-tertiary'
                    : 'text-error'
                "
              >
                {{ optionTag(optionState(question, option.id)) }}
              </span>
            </span>
          </div>
        </div>

        <div
          v-if="question.explanation"
          class="mt-stack-md rounded-lg border-l-4 border-primary bg-surface-container-low px-4 py-3"
        >
          <p class="font-label-caps text-label-caps uppercase text-primary">Explicação</p>
          <p class="mt-stack-sm whitespace-pre-line font-body-md text-body-md text-on-surface">
            {{ question.explanation }}
          </p>
        </div>

        <p v-if="question.reference" class="mt-stack-md font-body-md text-body-md text-on-surface-variant">
          <span class="font-label-caps text-label-caps uppercase text-on-surface-variant">Referência: </span>
          {{ question.reference }}
        </p>
      </div>
    </details>
  </div>
</template>
