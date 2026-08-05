const DEFAULT_BASE_URL = 'https://api.vouserpiloto.com.br/api/v1'

const baseURL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL

let getToken = () => null
let onUnauthorized = () => {}

export function configureAuth({ getToken: getter, onUnauthorized: handler }) {
  getToken = getter
  onUnauthorized = handler
}

function firstError(body) {
  return body?.message || body?.errors?.[0]?.message || ''
}

function normalizeError(status, body) {
  if (status === 422) {
    return {
      kind: 'validation',
      message: firstError(body) || 'Verifique os campos informados.',
      fieldErrors: Array.isArray(body?.errors)
        ? body.errors.map(({ field, message }) => ({ field, message }))
        : [],
    }
  }
  if (status === 401) {
    return {
      kind: 'unauthorized',
      message: firstError(body) || 'Sua sessão expirou. Faça login novamente.',
    }
  }
  if (status >= 500) {
    return { kind: 'server', message: 'Ocorreu um erro no servidor. Tente novamente.' }
  }
  return { kind: 'server', message: firstError(body) || 'Não foi possível concluir a requisição.' }
}

async function request(path, { method = 'GET', body, headers = {}, auth = false } = {}) {
  const requestHeaders = { ...headers }
  if (body !== undefined && body !== null) {
    requestHeaders['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${baseURL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw { kind: 'network', message: 'Não foi possível conectar ao servidor. Verifique sua conexão.' }
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null

  if (!response.ok) {
    const error = normalizeError(response.status, data)
    if (error.kind === 'unauthorized') {
      onUnauthorized()
    }
    throw error
  }

  return data?.data !== undefined ? data.data : data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
}
