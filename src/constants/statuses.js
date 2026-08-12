export const ACCOUNT_STATUS_LABELS = Object.freeze({
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
})

export const ACCOUNT_STATUS_CLASSES = Object.freeze({
  active: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  inactive: 'bg-surface-variant text-on-surface-variant',
  blocked: 'bg-error-container text-on-error-container',
})

export const USER_SUBSCRIPTION_STATUS_LABELS = Object.freeze({
  inactive: 'Inativa',
  active: 'Ativa',
  cancelled: 'Cancelada',
})

export const USER_SUBSCRIPTION_STATUS_CLASSES = Object.freeze({
  inactive: 'bg-surface-variant text-on-surface-variant',
  active: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  cancelled: 'bg-error-container text-on-error-container',
})

export const SUBSCRIPTION_STATUS_LABELS = Object.freeze({
  pending: 'Pendente',
  active: 'Ativa',
  cancelled: 'Cancelada',
  expired: 'Expirada',
  pending_cancellation: 'Cancelamento pendente',
})

export const SUBSCRIPTION_STATUS_CLASSES = Object.freeze({
  pending: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  active: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  cancelled: 'bg-error-container text-on-error-container',
  expired: 'bg-surface-variant text-on-surface-variant',
  pending_cancellation: 'bg-secondary-fixed text-on-secondary-fixed-variant',
})

export const USER_TYPE_STRING_LABELS = Object.freeze({
  student: 'Aluno',
  admin: 'Administrador',
})

export const PROVIDER_LABELS = Object.freeze({
  kiwify: 'Kiwify',
  manual: 'Manual',
})
