# Tasks: Recuperação de Senha (Esqueci minha senha)

## 1. Camada de API

- [ ] 1.1 Adicionar método `forgotPassword(payload)` em `src/api/auth.js` chamando `api.post('/auth/forgot-password', payload).then(unwrapData)` (endpoint público, sem `auth: true`).
- [ ] 1.2 Adicionar método `resetPassword(payload)` em `src/api/auth.js` chamando `api.post('/auth/reset-password', payload).then(unwrapData)` (endpoint público, sem `auth: true`).

## 2. Store de autenticação

- [ ] 2.1 Adicionar ação `forgotPassword(payload)` em `src/stores/auth.js` delegando a `authApi.forgotPassword` (sem alterar estado de sessão).
- [ ] 2.2 Adicionar ação `resetPassword(payload)` em `src/stores/auth.js` delegando a `authApi.resetPassword` (sem alterar estado de sessão).
- [ ] 2.3 Expor ambas as ações no retorno do store.

## 3. View de solicitação de recuperação

- [ ] 3.1 Criar `src/views/ForgotPasswordView.vue` com `AuthLayout`, `FormField` (e-mail), `SubmitButton` e `ValidationMessages`, seguindo o padrão de `LoginView.vue`.
- [ ] 3.2 Implementar validação local de e-mail (obrigatório + formato) que bloqueia o submit e não chama a API.
- [ ] 3.3 Implementar submit que chama `auth.forgotPassword({ email })` e exibe mensagem uniforme fixa de sucesso (`ValidationMessages variant="success"`), permanecendo na página.
- [ ] 3.4 Tratar 422 da API mapeando `error.fieldErrors` (campo `email`) para o formulário e exibindo `error.message` no topo.

## 4. View de redefinição de senha

- [ ] 4.1 Criar `src/views/ResetPasswordView.vue` com `AuthLayout`, dois `FormField` de senha (`PasswordInput`), `SubmitButton` e `ValidationMessages`.
- [ ] 4.2 Ler `token` de `route.query.token`; se ausente, exibir aviso de que o link do e-mail é obrigatório e não chamar a API.
- [ ] 4.3 Implementar validação local (senha ≥ 8 caracteres, confirmação obrigatória e igual à senha) que bloqueia o submit e não chama a API.
- [ ] 4.4 Implementar submit que chama `auth.resetPassword({ token, password, passwordConfirmation })`.
- [ ] 4.5 Exibir em caso de sucesso mensagem de sucesso (`variant="success"`) com link "Ir para o login", sem logar o usuário automaticamente.
- [ ] 4.6 Tratar 422 da API (inclui token inválido/expirado/usado) exibindo `error.fieldErrors` e `error.message`, mantendo o usuário na página.

## 5. Rotas

- [ ] 5.1 Adicionar rota `/forgot-password` (name `forgot-password`) com `meta: { guestOnly: true }` em `src/router/index.js`.
- [ ] 5.2 Adicionar rota `/reset-password` (name `reset-password`) com `meta: { guestOnly: true }` em `src/router/index.js`.

## 6. Ponto de entrada no login

- [ ] 6.1 Adicionar link "Esqueci minha senha?" no rodapé de `src/views/LoginView.vue` apontando para `/forgot-password`.

## 7. Verificação

- [ ] 7.1 Rodar `npm run build` e corrigir qualquer erro de build/lint.
