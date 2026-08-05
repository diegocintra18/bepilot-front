# Proposal: Autenticação (Login & Cadastro de Aluno)

## Why

O frontend "Vou ser Piloto" é hoje uma landing page pública, sem qualquer noção de usuário autenticado. Para que alunos possam assinar planos, realizar simulados e acompanhar seu histórico, o produto precisa de um fluxo de autenticação completo, integrado à API BePilot já existente, que expõe os endpoints em `https://api.vouserpiloto.com.br/docs`.

## What Changes

- Página de **Login** (`/login`) com validação de campos e exibição dos erros retornados pela API.
- Página de **Cadastro de Aluno** (`/register`) com nome, e-mail, senha e confirmação de senha.
- **Módulo de API dedicado** consumindo exatamente o contrato do Swagger: `POST /auth/signup`, `POST /auth/login`, `GET /account/profile` e `POST /account/logout`.
- **Authentication Provider** global (estado centralizado via Pinia): sessão persistente, usuário atual, estado de autenticação e logout.
- **Proteção de rotas**: redireciona usuários não autenticados para `/login` e usuários autenticados para a área privada quando acessarem `/login`/`/register`.
- **Persistência de sessão** após refresh do navegador (restauração via token armazenado + `GET /account/profile`).
- **Logout** limpando o estado local e invalidando o token na API.
- **Componentes reutilizáveis** de formulário alinhados ao design system do projeto (referência: `examples/`), sem copiar o HTML literal.
- Arquitetura preparada para futuras features (forgot/reset password, verificação de e-mail, social login, remember me, refresh token, navegação por papel) sem refatoração.

## Capabilities

### New Capabilities

- `auth`: Autenticação de alunos — cadastro, login, logout, sessão persistente, restauração de sessão, proteção de rotas e perfil do usuário autenticado, consumindo a API BePilot conforme o contrato Swagger.

### Modified Capabilities

<!-- Nenhuma capability existente tem requisitos alterados. -->

## Impact

- `src/router/index.js` — novas rotas (`/login`, `/register`, `/app`) e navigation guards.
- `src/stores/auth.js` — novo store Pinia de autenticação (estado global).
- `src/api/` — novo módulo de API: cliente HTTP (fetch nativo), injeção de cabeçalho `Authorization: Bearer <token>` e normalização de erros (422/401/rede).
- `src/views/` — `LoginView.vue`, `RegisterView.vue` e uma view autenticada placeholder.
- `src/components/auth/` — componentes reutilizáveis (layout de autenticação, card, campo de formulário, input de senha, botão de submit, mensagens de erro).
- **Sem novas dependências**: Pinia já está no projeto; requisições via `fetch` nativo.
- **Base URL da API**: `https://api.vouserpiloto.com.br/api/v1`, configurável via variável de ambiente `VITE_API_BASE_URL` (arquivo `.env`).
- **Refresh token**: não há endpoint de refresh no Swagger; o fluxo trata 401 como expiração e redireciona para login.
