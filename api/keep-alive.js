const TARGET_URL = process.env.KEEP_ALIVE_TARGET || 'https://api.vouserpiloto.com.br'
const TIMEOUT_MS = 10000

export default async function handler(req, res) {
  const startedAt = Date.now()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(TARGET_URL, { signal: controller.signal })
    clearTimeout(timeout)
    res.status(200).json({
      ok: true,
      target: TARGET_URL,
      status: response.status,
      durationMs: Date.now() - startedAt,
      at: new Date().toISOString(),
    })
  } catch (error) {
    clearTimeout(timeout)
    res.status(200).json({
      ok: false,
      target: TARGET_URL,
      error: error.name === 'AbortError' ? 'timeout' : error.message,
      durationMs: Date.now() - startedAt,
      at: new Date().toISOString(),
    })
  }
}
