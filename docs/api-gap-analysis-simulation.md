# API Gap Analysis — Módulo de Simulados

> **Contexto:** O módulo de simulados do frontend BePilot precisa consumir a API descrita em `https://api.vouserpiloto.com.br/docs` (contrato espelhado em `docs/bepilot-openapi.json`). Este relatório confronta cada requisito da proposta de "Simulation Execution Module" com o contrato atual da API e documenta toda capacidade que falta, seguindo o formato exigido (Endpoint ausente / Campos de requisição ausentes / Campos de resposta ausentes / Regras de negócio ausentes / Alterações de API sugeridas / Análise de impacto). **Nenhuma implementação frontend será feita até que os ajustes abaixo sejam aplicados.**

## 1. Resumo executivo

A API já cobre o núcleo do fluxo: iniciar simulado (`POST /exams/start`), finalizar (`POST /exams/{id}/finish`), detalhar (`GET /exams/{id}`), histórico (`GET /exams/history`) e estatísticas (`GET /statistics/me`). Porém, **8 lacunas** impedem a implementação completa do módulo conforme a proposta. A mais crítica é **G5** (o backend rejeita envio com questões sem resposta — "respostas incompletas" → `422`), que contradiz diretamente o critério de aceite "aluno pode finalizar com questões sem resposta após confirmação". Em seguida, **G1** (o início do exame não retorna as questões selecionadas pelo servidor) bloqueia a tela de execução: o cliente não tem como saber quais questões foram sorteadas. As demais lacunas afetam temporizador, recuperação de sessão, autosave, tela de resultado, revisão e histórico.

**Status global: BLOQUEADO até ajuste do backend.**

## 2. Contrato atual — o que já é suportado

| Requisito da proposta | Suporte atual |
|---|---|
| Iniciar simulado completo / por assunto | `POST /exams/start` `{course_id, subject_id?}` → `201` `{id, examId, startedAt}` |
| Enviar respostas | `POST /exams/{id}/finish` `{answers:[{questionId, selectedOptionId, responseTimeMilliseconds}]}` → `200` `{score, totalCorrect, totalWrong, approved, durationSeconds}` |
| Aprovação/reprovação | Campo `approved` calculado pelo backend |
| Histórico de simulados | `GET /exams/history?page&limit` → `{data: ExamSession[], meta}` |
| Detalhe de sessão | `GET /exams/{id}` → `{session, exam, answers}` |
| Configuração do exame | Schema `Exam` (`totalQuestions`, `totalTimeMinutes`, `minimumPassingScore`) — acessível apenas via `GET /exams/{id}` |
| Conteúdo de questões | `GET /questions` (filtro `courseId`), `GET /subjects/{subjectId}/questions`, `GET /questions/{id}` |
| Estatísticas do aluno | `GET /statistics/me` (`overall` + `bySubject`) |

> Observação de roteamento: tanto `POST /exams/{id}/finish` quanto `GET /exams/{id}` usam como `{id}` o **ID da sessão** (`session.id`), não o `exam.id`.

---

## 3. Lacunas detectadas

### G1 — O payload de início do exame não traz as questões selecionadas

**Endpoint ausente:** não é estritamente um endpoint novo — é uma **resposta incompleta**. O complemento ideal é um endpoint dedicado `GET /exams/{sessionId}/questions` (método `GET`, rota `/exams/{sessionId}/questions`) com a finalidade de retornar as questões efetivamente sorteadas na sessão, em ordem, sem revelar respostas.

**Campos de requisição ausentes:** nenhum (a requisição `POST /exams/start` está correta; as lacunas estão na resposta e no contrato de exposição de conteúdo).

**Campos de resposta ausentes** (`POST /exams/start` → `ExamSessionResponse`):
- `questionIds` (integer[]) — IDs das questões sorteadas;
- `totalQuestions` (integer);
- `durationSeconds` / `totalTimeMinutes` (integer);
- `minimumPassingScore` (number).
- Nenhum objeto de questão é retornado (`ExamSessionResponse` = `{id, examId, startedAt}` apenas).

**Regras de negócio ausentes:**
- O servidor monta a prova dinamicamente ("questões randomizadas seguindo a distribuição de dificuldade"), mas o cliente nunca é informado de **quais** questões foram escolhidas. Sem isso, a tela de execução não pode exibir o mesmo conjunto que será corrigido no backend.
- Exposição insegura de conteúdo: os endpoints públicos de questões retornam `options[].isCorrect` e `explanation` — se o frontend os usasse para montar a prova, a resposta seria revelada ao aluno durante o exame.

**Alterações de API sugeridas:**
1. `POST /exams/start` deve retornar `questionIds`, `totalQuestions`, `durationSeconds` e `minimumPassingScore` (ou o objeto `Exam` completo).
2. Novo `GET /exams/{sessionId}/questions` retornando as questões da sessão em ordem, **sanitizadas** (apenas `id`, `statement`, `options[{id, description}]`) — sem `isCorrect` e sem `explanation`.
3. Revisar a exposição de `QuestionOption.isCorrect`/`explanation` nos endpoints públicos de questões, ou documentar que o frontend deve removê-los do payload antes de renderizar.

**Análise de impacto:**
- **Por que o frontend não pode implementar:** o conjunto de questões é decidido no servidor; o cliente não pode inferi-lo. Baixar todas as questões do curso/assunto e adivinhar o subconjunto exibiria uma prova diferente da que o backend corrige, violando a regra "não assumir payloads".
- **Telas afetadas:** Início do simulado → Execução (fluxo principal).
- **Solução recomendada:** devolver as questões (ou ao menos `questionIds`) já no `POST /exams/start`, eliminando requisições extras e o vazamento de respostas.

---

### G2 — A duração do temporizador não vem na resposta de início

**Endpoint ausente:** nenhum endpoint novo — **campo de resposta ausente**. O tempo total hoje só existe em `Exam.totalTimeMinutes`, acessível via `GET /exams/{id}` (segunda requisição) e apenas se esse endpoint funcionar para sessões em andamento (não verificado).

**Campos de requisição ausentes:** nenhum.

**Campos de resposta ausentes** (`ExamSessionResponse`):
- `durationSeconds` (integer) — ou `totalTimeMinutes` — para que o frontend inicie o countdown sem requisições extras e com valor autoritativo do backend.

**Regras de negócio ausentes:**
- Definir que o tempo restante é calculado como `startedAt + duration − agora` (backend autoritativo), e que o backend aplica o mesmo teto ao aceitar o envio (ver G4/G5).

**Alterações de API sugeridas:** incluir `durationSeconds` na resposta de `POST /exams/start` (ou retornar o objeto `Exam` inteiro nela).

**Análise de impacto:**
- **Por que o frontend não pode implementar:** sem o valor na resposta de início, o timer depende de uma segunda chamada; se `GET /exams/{id}` rejeitar sessões em andamento, o timer não inicia.
- **Telas afetadas:** Execução (temporizador sempre visível — requisito da proposta).
- **Solução recomendada:** `durationSeconds` no `POST /exams/start`.

---

### G3 — Não existe endpoint de rascunho (autosave)

**Endpoint ausente:**
- `PUT /exams/{sessionId}/answers` (ou `PATCH /exams/{sessionId}`) — propósito: persistir respostas parciais durante o simulado, permitindo autosave e recuperação.

**Campos de requisição ausentes:** body com `{answers: [{questionId, selectedOptionId, responseTimeMilliseconds}]}` (uma ou várias respostas por chamada; upsert).

**Campos de resposta ausentes:** estado salvo confirmado (ex.: `{sessionId, savedCount, answers}` ou a sessão atualizada).

**Regras de negócio ausentes:**
- Persistência incremental das respostas por sessão;
- Rascunho acessível apenas ao dono da sessão;
- Rascunho não conta como envio (não altera `approved`/`score`);
- Sessão finalizada deve rejeitar novos rascunhos.

**Alterações de API sugeridas:** implementar o endpoint acima. Alternativa mínima: permitir que `POST /exams/{id}/finish` seja chamado em "modo rascunho" (`{draft: true}`) salvando as respostas sem calcular resultado.

**Análise de impacto:**
- **Por que o frontend não pode implementar:** a proposta exige "persistir a resposta conforme o contrato da API" e "evitar perda de dados após refresh acidental sempre que suportado pelo backend". Sem endpoint de rascunho, o único caminho é `localStorage` — que não sobrevive a troca de dispositivo e pode ser perdido se o backend invalidar sessões em andamento.
- **Telas afetadas:** Execução (autosave), recuperação pós-refresh.
- **Solução recomendada:** endpoint de rascunho + persistência local como reforço (não como substituto).

---

### G4 — Não existe retomada de sessão em andamento

**Endpoint ausente:**
- `GET /exams/{sessionId}/resume` — propósito: restaurar uma sessão em andamento (sessão + exame + respostas salvas + tempo restante). O `GET /exams/{id}` atual é um detalhe de sessão **finalizada** (as `answers` só fazem sentido pós-envio).

**Campos de requisição ausentes:** nenhum (path param `sessionId`).

**Campos de resposta ausentes:** conjunto completo restaurável (análogo a `{session, exam, answers, remainingSeconds}`).

**Regras de negócio ausentes:**
- `status` da sessão: `in_progress` / `submitted` / `expired`;
- Expiração server-side: sessão cujo `startedAt + totalTimeMinutes` passou deve ser tratada como expirada (envio automático com o que foi respondido, ou invalidação), atendendo ao requisito "simulação expirada" da proposta;
- Impedir abertura de sessão expirada/finalizada via resume.

**Alterações de API sugeridas:** novo `GET /exams/{sessionId}/resume` (ou enriquecer `GET /exams/{id}` para funcionar em sessões em andamento, retornando `questionIds`, `answers` salvas e `status`).

**Análise de impacto:**
- **Por que o frontend não pode implementar:** sem resume, um refresh/reenvio não restaura a sessão a partir do servidor — a recuperação fica restrita ao estado local (localStorage), o que não atende ao requisito de robustez e não existe conceito de "simulação expirada" a tratar.
- **Telas afetadas:** Execução (refresh acidental, reabertura), tratamento de erro "simulação inválida/expirada".
- **Solução recomendada:** endpoint de resume + campo `status` na sessão.

---

### G5 — Envio com questões sem resposta é rejeitado (CRÍTICO)

**Endpoint ausente:** o endpoint existe (`POST /exams/{id}/finish`) — a lacuna é de **regra de negócio**.

**Campos de requisição ausentes:** aceitar `answers` incompletas, ou `selectedOptionId: null` para questões sem resposta. Hoje o body exige `answers: [{questionId, selectedOptionId, responseTimeMilliseconds}]` com todos os campos obrigatórios.

**Campos de resposta ausentes:** `unansweredCount` (integer) e, idealmente, a contabilização de não respondidas como incorretas no resultado.

**Regras de negócio ausentes:**
- Permitir finalização com questões sem resposta após confirmação do aluno;
- Tratar questões sem resposta como incorretas no cálculo (critério da proposta);
- Documentar o conflito atual: a especificação lista `422 "respostas incompletas"` como erro válido, o que **contradiz** o critério de aceite "aluno pode finalizar com questões sem resposta após confirmação".

**Alterações de API sugeridas:** aceitar `answers` incompletas (ou `selectedOptionId: null`) e marcar as não respondidas como incorretas; retornar `unansweredCount` no `ExamFinishResponse`.

**Análise de impacto:**
- **Por que o frontend não pode implementar:** não existe `selectedOptionId` válido para "não respondida"; inventar um placeholder ou omitir itens violaria o contrato (`422`). O diálogo de confirmação exigido pela proposta só faz sentido com suporte do backend.
- **Telas afetadas:** Execução → fluxo de finalização (diálogo "Você ainda tem questões sem resposta...").
- **Solução recomendada:** regra de negócio no backend (não respondida = incorreta) + aceite de respostas incompletas. **Prioridade máxima.**

---

### G6 — Resposta do finish incompleta para a tela de resultado

**Endpoint ausente:** nenhum — **campos de resposta ausentes** em `ExamFinishResponse`:
- `totalQuestions` (integer);
- `percentage` (number, 0–100);
- `minimumPassingScore` (number);
- `averageResponseTimeMilliseconds` (integer);
- Documentação explícita da escala de `score` (float — é percentual 0–100? contagem?).

**Campos de requisição ausentes:** nenhum.

**Regras de negócio ausentes:** definir a escala de `score` e a relação `approved = score >= minimumPassingScore`, para que o frontend exiba "percentual final", "nota de aprovação" e "status" sem inferir regra local (a proposta veda cálculo de regras de negócio no cliente).

**Alterações de API sugeridas:** adicionar os campos acima ao `ExamFinishResponse`; recomenda-se `score` = percentual 0–100 consistente com `minimumPassingScore` (70).

**Análise de impacto:**
- **Por que o frontend não pode implementar:** sem `percentage`/`minimumPassingScore`/`totalQuestions` e com escala de `score` ambígua, a tela de resultado não pode exibir "percentual final", "nota de aprovação" e "total de questões" de forma fiel ao backend.
- **Telas afetadas:** Resultado (cards de performance, badge Aprovado/Reprovado).
- **Solução recomendada:** enriquecer `ExamFinishResponse` e documentar a escala de `score`.

---

### G7 — Payload de revisão não traz o conteúdo das questões

**Endpoint ausente:** nenhum — **campos de resposta ausentes**. `ExamAnswer` contém apenas `{id, examSessionId, questionId, selectedOptionId, correctOptionId, isCorrect, responseTimeMilliseconds, answeredAt}`.

**Campos de requisição ausentes:** nenhum.

**Campos de resposta ausentes** (em `GET /exams/{id}` → `ExamSessionDetailResponse`):
- `questions` (array com `id`, `statement`, `options[{id, description}]`, `explanation`, `reference`, `correctOptionId`) — ou campos embutidos em cada `ExamAnswer`.

**Regras de negócio ausentes:** disponibilizar o conteúdo para revisão apenas após a finalização da sessão (controle de acesso por dono e por status `submitted`).

**Alterações de API sugeridas:** em modo revisão (`status = submitted`), retornar as questões completas junto de `answers` (ou um novo `GET /exams/{sessionId}/review`).

**Análise de impacto:**
- **Por que o frontend não pode implementar:** a revisão (Accordion com enunciado, resposta selecionada, resposta correta, explicação e referências) exige texto das questões e opções; hoje só há IDs. Rebuscar via endpoints públicos de questões e cruzar por `questionId` é frágil e depende de conteúdo com dados de resposta.
- **Telas afetadas:** Resultado → Revisão de questões (indicadores 🟢/🔴, estado expandido com enunciado/respostas/explicação/referências).
- **Solução recomendada:** incluir o conteúdo das questões na resposta de detalhe/revisão.

---

### G8 — Histórico sem dados de exibição

**Endpoint ausente:** nenhum — **campos de resposta ausentes** em `ExamSession` (itens de `GET /exams/history`):
- `exam.name` (ou objeto `exam` aninhado);
- `course` (objeto aninhado);
- `subject` (objeto aninhado, quando houver);
- `answers`/resultado por questão (para reabrir a revisão sem N+1).

**Campos de requisição ausentes:** nenhum.

**Regras de negócio ausentes:** nenhuma nova além do enriquecimento da listagem.

**Alterações de API sugeridas:** incluir os objetos aninhados nos itens do histórico.

**Análise de impacto:**
- **Por que o frontend não pode implementar de forma limpa:** o Dashboard ("Simulados Recentes") e a página de Histórico precisam exibir nome do exame, curso/assunto e abrir resultados anteriores. Hoje exigiriam `GET /exams/{id}` por item (N+1) + consultas a `/courses` e `/subjects`, dependendo ainda de `GET /exams/{id}` funcionar para todas as sessões.
- **Telas afetadas:** Dashboard (Simulados Recentes) e nova página de Histórico (escopo confirmado).
- **Solução recomendada:** aninhar `exam`, `course` e `subject` nos itens de `GET /exams/history`.

---

## 4. Inconsistências de contrato (não bloqueantes, mas devem ser resolvidas/documentadas)

1. **`StartExamDto` é o único payload em snake_case** (`course_id`, `subject_id`); todos os demais usam camelCase. Sugere-se unificar para `courseId`/`subjectId` (ou documentar oficialmente o snake_case).
2. **`QuestionOption.isCorrect` e `explanation` expostos** pelos endpoints públicos de questões — vazamento de respostas durante o exame. Mitigação frontend: remover do payload na renderização; correção definitiva: endpoint sanitizado de questões do exame (G1).
3. **`GET /questions`, `GET /questions/{id}`, `GET /subjects/{subjectId}/questions`** declarados públicos, mas listam `401` nas respostas — contrato de autenticação inconsistente.
4. **`GET /exams/{id}` e `POST /exams/{id}/finish`** usam o **ID da sessão**; documentar para não confundir `examId` com `sessionId`.
5. **`ExamPaginatedResponse`** existe no schema, mas nenhum `GET /exams` (listagem de exames) é exposto — não necessário para este módulo.
6. **Sem parâmetro `examType`:** a distinção "Completo vs. Assunto" é feita pela presença/ausência de `subject_id` — suficiente, mas deve ser documentada.

---

## 5. Checklist de verificação antes de implementar (trabalho adiado)

1. `GET /exams/{id}` retorna `session.questionIds` para sessão **em andamento**?
2. `POST /exams/{id}/finish` realmente rejeita respostas incompletas com `422` "respostas incompletas"?
3. Qual é a escala de `score` (percentual 0–100 vs. contagem)?
4. Sessões em andamento expiram no servidor? Existe status/tempo limite?
5. Os `GET /questions` de leitura são realmente não autenticados?
6. Qual é o comportamento ao reenviar/refrescar uma sessão já finalizada?

---

## 6. Arquitetura frontend prevista (referência para o time de backend)

- **Rotas:** `/simulados` (início), `/simulados/:id` (execução), `/simulados/:id/resultado` (resultado + revisão), `/simulados/historico` (histórico); navegação lateral "Simulados" e botão "Iniciar Simulado" conectados.
- **Estado (Pinia):** store `simulation` centralizado (sessão, questões ordenadas, respostas, questão atual, tempo restante, status de envio); persistência em `localStorage` como reforço (medida temporária até G3/G4).
- **Temporizador:** prazo = `startedAt + duration − agora` (backend autoritativo); envio automático ao zerar com mensagem informativa.
- **Rastreio:** `responseTimeMilliseconds` por questão; envio via `POST /exams/{id}/finish`.
- **Resultado:** cards com `score/percentage`, corretas/incorretas, nota de aprovação, status — 100% derivados do backend (G6).
- **Revisão:** accordion 🟢/🔴 com enunciado, resposta selecionada, resposta correta, explicação e referências (G7).
- **Dashboard + Histórico:** "Simulados Recentes" do Dashboard e página de Histórico consumindo `GET /exams/history` (G8).

---

## 7. Tabela priorizada de recomendações

| # | Ajuste | Prioridade | Bloqueia? |
|---|---|---|---|
| G5 | Aceitar respostas incompletas (não respondidas = incorretas) + `unansweredCount` | Crítica | Sim (envio) |
| G1 | Retornar questões/`questionIds` no início + endpoint sanitizado de questões da sessão | Alta | Sim (execução) |
| G2 | `durationSeconds` na resposta de início | Alta | Parcial (timer) |
| G6 | `percentage`, `minimumPassingScore`, `totalQuestions`, `averageResponseTimeMilliseconds` + escala de `score` | Alta | Sim (resultado) |
| G7 | Conteúdo das questões no payload de revisão | Média | Sim (revisão) |
| G4 | `GET /exams/{sessionId}/resume` + `status`/expiração da sessão | Média | Parcial (recuperação) |
| G3 | Endpoint de rascunho (autosave) | Média | Parcial (recuperação) |
| G8 | Aninhar `exam`/`course`/`subject` no histórico | Baixa | Não (degradado) |
| Q | Unificar snake_case, sanitizar questões, documentar autenticação dos GETs | Baixa | Não |
