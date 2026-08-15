import { api, unwrapData } from './client'

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value)
  })
  const query = qs.toString()
  return query ? `?${query}` : ''
}

export const aiCreditsApi = {
  /**
   * Obtém o saldo de créditos de IA do usuário autenticado
   * @returns {Promise<{balance: number, aiCreditsRemaining?: number}>}
   */
  getBalance() {
    return api.get('/me/ai-credits', { auth: true }).then(unwrapData)
  },

  /**
   * Lista usuários com seus saldos de créditos (admin)
   * @param {Object} params - Parâmetros de paginação e filtro
   * @param {number} params.page - Número da página (padrão: 1)
   * @param {number} params.limit - Itens por página (padrão: 10)
   * @param {string} params.search - Buscar por nome ou email (opcional)
   * @returns {Promise<{data: Array, meta: Object}>}
   */
  getAdminCredits(params = {}) {
    return api.get(`/admin/ai-credits${toQueryString(params)}`, { auth: true }).then(unwrapData)
  },

  /**
   * Adiciona créditos a um usuário (admin)
   * @param {number} userId - ID do usuário
   * @param {number} amount - Quantidade de créditos a adicionar
   * @param {string} reason - Motivo da adição (opcional)
   * @returns {Promise<{success: boolean, newBalance: number}>}
   */
  addCredits(userId, amount, reason = '') {
    return api
      .post(`/admin/users/${userId}/ia-credits/add`, { amount, reason }, { auth: true })
      .then(unwrapData)
  },

  /**
   * Remove créditos de um usuário (admin)
   * @param {number} userId - ID do usuário
   * @param {number} amount - Quantidade de créditos a remover
   * @param {string} reason - Motivo da remoção (opcional)
   * @returns {Promise<{success: boolean, newBalance: number}>}
   */
  removeCredits(userId, amount, reason = '') {
    return api
      .post(`/admin/users/${userId}/ia-credits/remove`, { amount, reason }, { auth: true })
      .then(unwrapData)
  },

  /**
   * Obtém o histórico de movimentações de créditos de um usuário (admin)
   * @param {number} userId - ID do usuário
   * @param {Object} params - Parâmetros de paginação
   * @param {number} params.page - Número da página (padrão: 1)
   * @param {number} params.limit - Itens por página (padrão: 10)
   * @returns {Promise<{data: Array, meta: Object}>}
   */
  getHistory(userId, params = {}) {
    return api
      .get(`/admin/users/${userId}/ia-credits/history${toQueryString(params)}`, { auth: true })
      .then(unwrapData)
  },

  /**
   * Obtém o histórico do usuário autenticado
   */
  getMyHistory(params = {}) {
    return api
      .get(`/me/ai-credits/history${toQueryString(params)}`, { auth: true })
      .then(unwrapData)
  },
}
