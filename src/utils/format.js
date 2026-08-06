export function formatDuration(totalSeconds) {
  if (totalSeconds === undefined || totalSeconds === null || Number.isNaN(Number(totalSeconds))) return '—'
  const s = Math.max(0, Math.round(Number(totalSeconds)))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`
  return `${sec}s`
}

export function formatResponseTime(milliseconds) {
  if (milliseconds === undefined || milliseconds === null) return '—'
  const s = Math.round(Number(milliseconds) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

export function formatPercentage(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  return `${n.toFixed(1).replace('.', ',')}%`
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} • ${time}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
