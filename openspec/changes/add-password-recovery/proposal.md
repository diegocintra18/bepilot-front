# Proposal: Recuperação de Senha (Esqueci minha senha)

## Why

Alunos que esquecem a senha hoje não têm como recuperar a conta sem intervenção manual. A API BePilot já expõe os endpoints `POST /auth/forgot-password` e `POST /auth/reset-password` (contrato documentado no Swagger), permitindo o fluxo completo de recuperação sem novas dependências.

## What Changes

- **Página "Esqueci minha senha"** (`/forgot-password`): formulário de e-mail que envia para `POST /auth/forgot-password` e exibe uma mensagem uniforme de sucesso — a mesma resposta para e-mails cadastrados e não cadastrados (sem vazamento de quais e-mails existem).
- **Página "Redefinir senha"** (`/reset-password?token=...`): formulário com nova senha + confirmação que envia para `POST /auth/reset-password`; trata erros de token inválido/expirado já utilizado e, em caso de sucesso, redireciona o usuário para o login.
- **Link "Esqueci minha senha?"** na página de login, apontando para `/forgot-password`.
- **Métodos de API** `forgotPassword` e `resetPassword` em `src/api/auth.js` (sem autenticação, seguindo o contrato Swagger).
- **Ações no store de autenticação** `forgotPassword` e `resetPassword`, mantendo o padrão de views delegarem ao store.
- **Rotas novas** com `meta: { guestOnly: true }` (usuários autenticados são redirecionados para o dashboard).
- Reuso dos componentes de auth existentes (`AuthLayout`, `AuthCard`, `FormField`, `PasswordInput`, `SubmitButton`, `ValidationMessages`) — sem HTML novo ou nova linguagem visual.

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova: recuperação de senha estende a capability de autenticação. -->

### Modified Capabilities

- `auth`: adiciona os requisitos de solicitação de recuperação de senha e redefinição de senha com token, incluindo resposta uniforme anti-enumeração de contas e tratamento de token inválido/expirado.

## Impact

- `src/api/auth.js` — novos métodos `forgotPassword` e `resetPassword` (endpoints públicos).
- `src/stores/auth.js` — novas ações `forgotPassword` e `resetPassword`.
- `src/views/ForgotPasswordView.vue` — nova view (formulário de e-mail).
- `src/views/ResetPasswordView.vue` — nova view (token + nova senha + confirmação).
- `src/views/LoginView.vue` — link "Esqueci minha senha?".
- `src/router/index.js` — rotas `/forgot-password` e `/reset-password` (guest-only).
- **Sem novas dependências**: fluxo usa `fetch` nativo (client existente) e os componentes de auth já presentes.
- **Sem mudanças de contrato**: payloads seguem exatamente `ForgotPasswordDto` e `ResetPasswordDto` do Swagger.
