function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_\.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function generateStudyPlanPdf(plan, options = {}) {
  // Basic printable HTML fallback. Preferably replace with jsPDF/html2canvas for finer control.
  const title = options.filename || `plano-de-estudos-${plan.simulationId || plan.id}`
  const filename = `${sanitizeFilename(title)}.pdf`

  const utm = 'utm_source=study_plan_pdf&utm_medium=pdf&utm_campaign=study_plan'
  const logoHref = `https://vouserpiloto.com.br/?${utm}`
  const logoUrl = 'https://vouserpiloto.com.br/logo-site.png'

  const content = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; color:#111827; padding:24px }
          header { display:flex; justify-content:space-between; align-items:center }
          header img { height:48px }
          hr { border:none; border-top:1px solid #e5e7eb; margin:16px 0 }
          footer { position:fixed; bottom:20px; left:24px; right:24px; text-align:left; font-size:12px; color:#6b7280 }
          .section { margin-bottom:16px }
          .title { font-size:20px; font-weight:700; margin-bottom:8px }
        </style>
      </head>
      <body>
        <header>
          <a href="${logoHref}"><img src="${logoUrl}" alt="vouserpiloto"/></a>
          <div>${plan.generatedAt || plan.createdAt || ''}</div>
        </header>
        <hr />
        <main>
          <h1 class="title">Plano de Estudos com IA</h1>
          <div class="section">
            <strong>Simulado:</strong> ${plan.simulation?.name || `#${plan.simulationId || plan.id}`}
          </div>
          <div class="section">
            <strong>Resumo do desempenho</strong>
            <p>${(plan.summary && plan.summary.overallAssessment) || ''}</p>
          </div>
          <div class="section">
            <strong>Conteúdos prioritários</strong>
            <ul>${(plan.summary && plan.summary.priorityTopics || []).map((t) => `<li>${t}</li>`).join('')}</ul>
          </div>
          <div class="section">
            <strong>Erros para reforçar</strong>
            ${(plan.errors || []).map(e=>`<div style="margin-bottom:8px"><strong>Questão ${e.questionNumber}</strong><div>${e.explanation || ''}</div></div>`).join('')}
          </div>
          <div class="section">
            <strong>Pontos de atenção</strong>
            ${(plan.attentionPoints || []).map(a=>`<div style="margin-bottom:8px"><strong>Questão ${a.questionNumber}</strong><div>Seu tempo: ${a.userTimeSeconds || ''}s • Tempo médio: ${a.avgTimeSeconds || ''}s</div></div>`).join('')}
          </div>
        </main>
        <footer>
          <hr />
          <a href="${logoHref}">vouserpiloto.com.br</a>
        </footer>
      </body>
    </html>
  `

  const w = window.open('', '_blank')
  if (!w) throw new Error('Não foi possível abrir a janela de impressão.')
  w.document.open()
  w.document.write(content)
  w.document.close()
  // wait a moment for images to load
  await new Promise((r) => setTimeout(r, 500))
  w.focus()
  w.print()
  // note: filename control depends on the PDF generator / browser; advanced generation requires jsPDF/html2canvas
  return filename
}

export function sanitizeFileName(name) {
  return sanitizeFilename(name)
}
