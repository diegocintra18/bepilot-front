function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_\.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatBrDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

export async function generateStudyPlanPdf(plan, options = {}) {
  // Basic printable HTML fallback. Preferably replace with jsPDF/html2canvas for finer control.
  const title = options.filename || `plano-de-estudos-${plan.simulationId || plan.id}`
  const filename = `${sanitizeFilename(title)}.pdf`

  const utm = 'utm_source=study_plan_pdf&utm_medium=pdf&utm_campaign=study_plan'
  const logoHref = `https://vouserpiloto.com.br/?${utm}`
  const logoUrl = 'https://vouserpiloto.com.br/logo-site.png'

  const errorsCount = (plan.content?.errors || []).length
  const attentionCount = (plan.content?.attentionPoints || []).length
  const overallAssessment = plan.content?.summary?.overallAssessment || ''
  const priorityTopics = plan.content?.summary?.priorityTopics || []

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
          .section { margin-bottom:18px }
          .title { font-size:20px; font-weight:700; margin-bottom:8px }
          .badge { display:inline-block; background:#2563EB22; color:#1D4ED8; font-weight:700; font-size:12px; padding:6px 10px; border-radius:999px; margin-left:10px }
          .list { margin-top:8px; padding-left:18px }
          .item { margin-top:10px; padding-top:10px; border-top:1px solid #e5e7eb }
          .tags { margin-top:6px; font-size:12px; color:#374151 }
          .tag { display:inline-block; background:#F3F4F6; border-radius:999px; padding:4px 8px; margin-right:6px }
          .subhead { font-weight:700; margin-bottom:4px }
          .para { margin:0; margin-top:4px; color:#111827 }
          .muted { color:#6b7280 }
          ul { margin:8px 0 0 0; padding-left:18px }
        </style>
      </head>
      <body>
        <header>
          <a href="${logoHref}"><img src="${logoUrl}" alt="vouserpiloto"/></a>
          <div>${formatBrDate(plan.generatedAt || plan.createdAt) || ''}</div>
        </header>
        <hr />
        <main>
          <h1 class="title">Plano de Estudos com IA</h1>

          <div class="section">
            <strong>Simulado:</strong> ${plan.simulation?.name || `#${plan.simulationId || plan.id}`}
          </div>

          <div class="section">
            <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px">
              <strong style="font-size:16px">Resumo do desempenho</strong>
              <span class="badge">${errorsCount} erros • ${attentionCount} atenção</span>
            </div>
            <p class="para" style="margin-top:10px">${overallAssessment}</p>
          </div>

          <div class="section">
            <strong>Conteúdos prioritários</strong>
            ${
              priorityTopics.length > 0
                ? `<ul>${priorityTopics.map((t) => `<li>${t}</li>`).join('')}</ul>`
                : `<p class="muted" style="margin:8px 0 0 0">Sem tópicos prioritários no momento.</p>`
            }
          </div>

          <div class="section">
            <strong>Erros para reforçar</strong>
            ${(plan.content?.errors || [])
              .map((e) => {
                const refs = Array.isArray(e.recommendationReferences) && e.recommendationReferences.length > 0
                return `
                  <div class="item">
                    <div style="font-weight:700">Questão ${e.questionId}</div>
                    <div class="tags">
                      <span class="tag">${e.discipline}</span>
                      <span class="tag">${e.topic}</span>
                    </div>
                    <div style="margin-top:8px"><div class="subhead">O que ocorreu</div><p class="para">${e.explanation || ''}</p></div>
                    <div style="margin-top:10px"><div class="subhead">Recomendação</div><p class="para">${e.recommendation || ''}</p></div>
                    ${refs ? `<div style="margin-top:10px"><div class="subhead">Referências de livros</div><ul>${e.recommendationReferences.map((r) => `<li>${r}</li>`).join('')}</ul></div>` : ''}
                  </div>
                `
              })
              .join('')}
            ${(plan.content?.errors || []).length === 0 ? `<p class="muted" style="margin-top:8px">Nenhum erro foi identificado neste simulado.</p>` : ''}
          </div>

          <div class="section">
            <strong>Pontos de atenção</strong>
            ${(plan.content?.attentionPoints || [])
              .map((a) => {
                const refs = Array.isArray(a.recommendationReferences) && a.recommendationReferences.length > 0
                return `
                  <div class="item">
                    <div style="font-weight:700">Questão ${a.questionId}</div>
                    <div class="tags">
                      <span class="tag">${a.discipline}</span>
                      <span class="tag">${a.topic}</span>
                    </div>
                    <div style="margin-top:8px"><div class="subhead">Tempo de resolução</div><p class="para">Seu tempo: ${a.responseTimeSeconds || ''}s • Média: ${a.averageResponseTimeSeconds || ''}s</p></div>
                    <div style="margin-top:10px"><div class="subhead">Motivo</div><p class="para">${a.reason || ''}</p></div>
                    <div style="margin-top:10px"><div class="subhead">Recomendação</div><p class="para">${a.recommendation || ''}</p></div>
                    ${refs ? `<div style="margin-top:10px"><div class="subhead">Referências de livros</div><ul>${a.recommendationReferences.map((r) => `<li>${r}</li>`).join('')}</ul></div>` : ''}
                  </div>
                `
              })
              .join('')}
            ${(plan.content?.attentionPoints || []).length === 0 ? `<p class="muted" style="margin-top:8px">Não identificamos pontos de atenção relacionados ao tempo de resposta neste simulado.</p>` : ''}
          </div>
        </main>
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
