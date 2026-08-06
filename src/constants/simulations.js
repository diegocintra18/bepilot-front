export const SimulationType = Object.freeze({
  Complete: 'complete',
  Subject: 'subject',
})

export const SIMULATION_TYPE_OPTIONS = Object.freeze([
  {
    value: SimulationType.Complete,
    label: 'Simulado Completo',
    description:
      'Todas as disciplinas do curso, seguindo os mesmos critérios da prova oficial ANAC (quantidade de questões, tempo e nota de aprovação).',
  },
  {
    value: SimulationType.Subject,
    label: 'Simulado por Assunto',
    description:
      'Questões de uma disciplina específica, com duração proporcional à prova oficial calculada pelo sistema.',
  },
])
