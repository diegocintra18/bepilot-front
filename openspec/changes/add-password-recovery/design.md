# Design: Recuperação de Senha (Esqueci minha senha)

## Context

A API BePilot já expõe `POST /auth/forgot-password` e `POST /auth/reset-password` (Swagger). O frontend ainda não os consome. A base de código já possui:

- `src/api/auth.js` com `authApi` (usando `api.post(...).then(unwrapData)`); endpoints autenticados usam `{ auth: true }`.
- `src/stores/auth.js` (Pinia) onde views delegam chamadas ao store; ações que não alteram sessão (ex.: `changePassword`) são pass-through para o `authApi`.
- `src/api/client.js` normaliza erros: 422 vira `{ kind: 'validation', message, fieldErrors: [{ field, message }] }`; outros erros viram `{ kind, message }`. `unwrapData` extrai `body.data`.
- Views `LoginView.vue` / `RegisterView.vue` com padrão: `reactive` form + `reactive` `fieldErrors` + `ref` `apiError` + `loading`, validação local com `EMAIL_PATTERN`, mapeamento de `error.fieldErrors` por campo, e componentes `AuthLayout`, `AuthCard`, `FormField`, `PasswordInput`, `SubmitButton`, `ValidationMessages` (com `variant="success"` já suportado).
- Router com `meta: { guestOnly: true }` (redireciona autenticados para `/dashboard`).

Ver proposal.md para motivação e specs/auth/spec.md para requisitos.

## Goals / Non-Goals

**Goals:**
- Reusar integralmente os componentes/auth e o padrão de view existente (sem HTML novo, sem tokens visuais novos).
- Manter as chamadas de API como pass-through no store, seguindo o padrão de `changePassword`.
- Garantir resposta uniforme na solicitação de recuperação (anti-enumeração) via mensagem fixa no cliente.
- Tratar token ausente/inválido/expirado sem redirecionamentos inesperados.

**Non-Goals:**
- Não alterar o layout de autenticação nem introduzir dependências novas.
- Não implementar auto-login após redefinição (o fluxo termina no login).
- Não tocar no fluxo de "trocar senha logado" (`/me/password`), que permanece no ProfileView.
- Não introduzir expiração de token no cliente; a validação de expiração é responsabilidade da API.

## Decisions

### 1. Métodos `forgotPassword` e `resetPassword` em `src/api/auth.js`

Novos métodos públicos (sem `{ auth: true }`), seguindo o padrão existente com `unwrapData`:

- `forgotPassword(payload)` → `api.post('/auth/forgot-password', payload).then(unwrapData)`
- `resetPassword(payload)` → `api.post('/auth/reset-password', payload).then(unwrapData)`

Payloads seguem exatamente `ForgotPasswordDto` (`{ email }`) e `ResetPasswordDto` (`{ token, password, passwordConfirmation }`). Token é string de 64 caracteres.

*Alternativa:* chamar `api` diretamente na view. Rejeitada para manter a separação de camadas já usada em todo o app.

### 2. Ações `forgotPassword` e `resetPassword` no store `src/stores/auth.js`

Ações pass-through delegando ao `authApi`, exatamente como `changePassword`. Não alteram estado de sessão nem `localStorage`. Necessárias para que as views sigam o padrão de sempre chamar `useAuthStore()`.

### 3. Rotas `guestOnly` e origem do token

Duas rotas novas em `src/router/index.js`:

- `/forgot-password` → `name: 'forgot-password'`, `meta: { guestOnly: true }`
- `/reset-password` → `name: 'reset-password'`, `meta: { guestOnly: true }`

O token é lido de `route.query.token` (link do e-mail). Usuário autenticado já tem meios de trocar senha pelo perfil, então `guestOnly` redirecionar para o dashboard é comportamento desejado e reusa a guard existente (nenhuma mudança no `beforeEach`).

### 4. Views `ForgotPasswordView.vue` e `ResetPasswordView.vue`

Ambas usam `AuthLayout`, `AuthCard` (via layout), `FormField`, `PasswordInput` (reset), `SubmitButton` e `ValidationMessages`, replicando o padrão de `LoginView`/`RegisterView` (form `reactive`, `fieldErrors`, `apiError`, `loading`, `validate()` com `EMAIL_PATTERN`).

**ForgotPasswordView:**
- Sucesso: exibe mensagem uniforme fixa via `ValidationMessages variant="success"` e permanece na página (não navega). A mensagem é uma constante local no componente — mesma para e-mails cadastrados e não cadastrados — em vez de confiar na resposta da API, garantindo anti-enumeração mesmo se a API variar.
- Erro de validação local (e-mail vazio/malformado): bloqueia submit, não chama API, mostra erro inline no campo.
- 422 da API: mapeia `error.fieldErrors` (campo `email`) para o `fieldErrors` do formulário e, se houver `error.message`, exibe no topo.

**ResetPasswordView:**
- Token ausente: na montagem, se `route.query.token` não for string não-vazia, exibe aviso "use o link enviado por e-mail" e não chama a API (form desabilitado/oculto).
- Validação local: senha ≥ 8 caracteres, confirmação igual, campos obrigatórios.
- 422 da API (inclui `E_INVALID_RESET_TOKEN` para token inválido/expirado/usado): mapeia `error.fieldErrors` e exibe `error.message` no topo, mantendo o usuário na página. Não loga o usuário.
- Sucesso: exibe `ValidationMessages variant="success"` com link "Ir para o login" (`RouterLink` para `/login`). Não navega automaticamente e não loga o usuário (spec: "user is not automatically logged in").

*Alternativa considerada:* usar a mensagem retornada pela API no sucesso do forgot. Rejeitada porque a uniformidade é um requisito de segurança e não deve depender do contrato da resposta.

### 5. Link "Esqueci minha senha?" no login

Adicionado no rodapé de `LoginView.vue` (dentro do slot `#footer`, junto ao link de cadastro): `RouterLink` para `/forgot-password` com as mesmas classes de link já usadas.

## Risks / Trade-offs

- [Erro 422 com shape de `PasswordResetTokenError` não mapeado] → O `client.js` já normaliza 422 para `{ kind: 'validation', message, fieldErrors }`; a view sempre mostra `error.message` no topo, então qualquer shape cai em mensagem exibível sem quebrar o fluxo. O usuário permanece na página e pode solicitar novo link.
- [Redirecionamento `guestOnly` de usuário autenticado que clica num link de reset do próprio e-mail] → Aceito: usuário logado troca senha pelo perfil; o redirecionamento evita um fluxo redundante. Pode re-solicitar recuperação após logout se necessário.
- [Mensagem uniforme fixa divergir do texto da API] → Baixo risco: o contrato Swagger documenta a mensagem; a constante será copiada do Swagger. Divergência futura é trivial de corrigir em um único local.
- [Token no `query` ficar exposto em histórico/analytics] → Aceito: é o padrão usual de links de reset por e-mail; o token é de uso único e expira (validação da API).
