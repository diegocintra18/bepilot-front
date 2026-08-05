## Context

The app is a Vue 3 SPA (`create-vue` template, Vite) with Pinia and vue-router already installed; today it has a single public route (`/`) rendering a landing page. No axios — native `fetch` is the established dependency-free pattern. Auth styling must follow the existing design tokens (`tailwind.config.cjs` + `DESIGN.md`) and the visual references in `examples/`. The BePilot API contract is defined in `docs/bepilot-openapi.json`, extracted from the embedded spec at `https://api.vouserpiloto.com.br/docs`; the production base URL is `https://api.vouserpiloto.com.br/api/v1`, configurable via the `VITE_API_BASE_URL` environment variable. See `proposal.md` for motivation and `specs/auth/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**
- A single, testable API layer that the whole app (current and future features) can reuse.
- Centralized auth state (Pinia) so any component can read the current user without prop drilling or duplicated requests.
- Full session lifecycle: login, registration, restore-after-reload, logout, and 401 handling.
- Reusable auth form primitives aligned with the design system so future auth screens (forgot/reset password, email verification) reuse them.

**Non-Goals:**
- Implementing forgot/reset password, email verification, social login, or remember-me flows — only architecting so they can be added without refactoring.
- Admin/role-specific dashboards — only route-level protection gating a placeholder private area.
- Token refresh logic — the API has no refresh endpoint (see Risks).
- Server-side rendering, PWA/offline auth, or multi-device session management.

## Decisions

### D1: Dedicated API module with a native `fetch` wrapper
Create `src/api/` with a thin client (e.g. `client.js`) exposing `api.get/post/...` and endpoint functions. The client: prefixes the base URL, injects `Authorization: Bearer <token>` from the store when available, parses JSON, and normalizes failures into a discriminated error object (`{ kind: 'validation'|'unauthorized'|'network'|'server', message, fieldErrors? }`).

- **Why**: Centralizes token injection, base URL, and error normalization in one place; pages/stores never touch `fetch` directly (matches user requirement). Easy to swap for a future `Authorization: Bearer` upgrade or add refresh logic later.
- **Alternatives**: `axios` interceptor (rejected — no new dependencies required by the proposal), direct `fetch` in each page (rejected — duplicated headers/error handling), a composable-only wrapper (weaker — can't share request logic with non-component code).

### D2: Pinia auth store as the single source of auth truth
`src/stores/auth.js` (setup-style, mirroring `src/stores/counter.js`) holds `user`, `token`, `isAuthenticated` (computed), `isRestoring`, and actions `signup()`, `login()`, `fetchProfile()`, `logout()`. It owns the API calls and writes/reads the token from `localStorage`.

- **Why**: Pinia is already installed; setup-style matches the existing store; a global store satisfies "globally accessible current user" and avoids prop drilling.
- **Alternatives**: Vue composable with module-level state (no reactive persistence guarantee across components is fine, but Pinia is the established pattern), plain module singleton (loses reactivity/debuggability).

### D3: Session persistence via `localStorage` + profile restore
Persist `{ token, user }` under a single key on login/signup; on app boot, if a token exists, restore the user via `GET /account/profile` and mark the app as `isRestoring` while in flight.

- **Why**: Stateless JWT-like flow — no server-side session storage; the profile endpoint is the cheap, authoritative way to validate the token on reload. `isRestoring` lets route guards wait (see D4).
- **Alternatives**: `sessionStorage` (rejected — session must survive refresh), cookies (rejected — XSS surface trade-off differs, localStorage + token-in-header matches the Swagger's Bearer contract).

### D4: Route guards via `router.beforeEach`
A single global guard reads the store: private routes require `isAuthenticated` (redirect to `/login` with the target as `redirect` query); `/login` and `/register` redirect authenticated users to `/app`. While `isRestoring` is true, the guard defers (await) instead of redirecting.

- **Why**: Centralizes protection in one place; awaiting restore avoids flashing unauthenticated states on reload.
- **Alternatives**: per-route `meta` + component-level checks (more duplication, less consistent).

### D5: Auth component architecture
Reusable primitives in `src/components/auth/`: `AuthLayout` (centered card + branding + footer), `AuthCard`, `FormField` (label + input + error slot), `PasswordInput` (visibility toggle, reuses AppIcon), `SubmitButton` (disabled/loading via prop), `ValidationMessages` (inline field + API error display). Views `LoginView.vue` and `RegisterView.vue` compose them with `v-model` form state and submit handlers.

- **Why**: Reuse across login/register now and future auth screens; keeps views thin; matches the design-system-first approach already used for the landing page.
- **Alternatives**: single monolithic form component (rejected — duplicated between login/register), duplicated markup in each view (rejected — violates user's reusability requirement).

### D6: Base URL via env config
Default base `https://api.vouserpiloto.com.br/api/v1`, overridable through `VITE_API_BASE_URL` in `.env` (a committed `.env.example` documents the variable). No request proxying in dev.

- **Why**: The production domain is the only reachable API; an env override keeps local/CI flexibility without code changes.
- **Alternatives**: hardcoded constant (rejected — inflexible), Vite dev proxy (rejected — no local API host to proxy to).

## Risks / Trade-offs

- [Token stored in `localStorage` is readable by XSS] → Mitigation: minimal stored payload (only token + user), no secrets; normalize and sanitize rendered error messages; no `v-html` in auth views.
- [No refresh-token endpoint: expired tokens mid-session force re-login] → Mitigation: global 401 handling in the API client clears the store and redirects to `/login`; the restore flow already treats 401 as "logged out".
- [`isRestoring` awaits an external call on every reload, adding latency] → Mitigation: fast-fail (show cached user immediately if present, refresh in background) is a later optimization; initial version gates on the awaited restore to avoid flash.
- [API base URL can be cold/slow] → Mitigation: timeout on requests with a network-kind error surfaced to the user; retry is manual via the form submit.
- [OpenAPI 422 shape could diverge from implementation] → Mitigation: error normalization tolerates missing `fieldErrors` (falls back to `message`), so a schema drift still shows a readable error.

## Migration Plan

No existing auth code to migrate. Steps: (1) land API client, (2) land auth store + persistence, (3) add routes/guards + views/components, (4) wire the private placeholder area. Rollback: remove routes/store files and the guard; the landing page is unaffected since auth is additive. Verification against `docs/bepilot-openapi.json` payloads, then a manual pass against the live API.

## Open Questions

None — remaining unknowns (e.g. exact welcome copy on the private placeholder, whether the private area will later be a dashboard vs. simulado view) are deferrable without changing the spec, design, or task breakdown.
