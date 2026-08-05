## 1. API layer

- [x] 1.1 Create `src/api/client.js`: fetch wrapper that prefixes `VITE_API_BASE_URL` (default `https://bepilot-api.onrender.com/api/v1`), injects `Authorization: Bearer <token>` when a session exists, parses JSON, and normalizes failures into `{ kind: 'validation'|'unauthorized'|'network'|'server', message, fieldErrors? }`
- [x] 1.2 Create `src/api/auth.js` with endpoint functions: `signup(payload)`, `login(credentials)`, `fetchProfile()`, `logout()` matching the schemas in `docs/bepilot-openapi.json`

## 2. Auth store

- [x] 2.1 Create `src/stores/auth.js` (setup-style, like `counter.js`) with state `user`, `token`, `isRestoring` and computed `isAuthenticated`
- [x] 2.2 Implement `signup()` and `login()` actions: call API, persist `{ token, user }` to `localStorage` under a single key, update state
- [x] 2.3 Implement `restoreSession()`: on boot, if a token exists, call `fetchProfile()`, update state, mark restore done; on 401 clear session
- [x] 2.4 Implement `logout()`: call `logout()` API, clear `localStorage` and state regardless of API result
- [x] 2.5 Implement `clearSession()` helper used on 401 to reset state + storage

## 3. Auth UI components

- [x] 3.1 Create `src/components/auth/AuthLayout.vue` (centered layout, branding via `BrandLogo`, footer) and `AuthCard.vue` reusing design tokens
- [x] 3.2 Create `src/components/auth/FormField.vue` (label + input + error slot) with design-system styling
- [x] 3.3 Create `src/components/auth/PasswordInput.vue` (visibility toggle using `AppIcon`)
- [x] 3.4 Create `src/components/auth/SubmitButton.vue` (disabled + loading states via prop)
- [x] 3.5 Create `src/components/auth/ValidationMessages.vue` for inline field errors and API error display

## 4. Views

- [x] 4.1 Create `src/views/LoginView.vue`: form state, pre-submit validation (required, e-mail format), submit → `login()`, loading/disabled states, API error display, redirect via `redirect` query
- [x] 4.2 Create `src/views/RegisterView.vue`: form state (fullName, email, password, passwordConfirmation), pre-submit validation (required, e-mail, password confirmation match), submit → `signup()`, loading/disabled states, field-level API 422 error display
- [x] 4.3 Create `src/views/AppView.vue`: placeholder private area showing current user info and a logout action
- [x] 4.4 Add cross-view links (login ↔ register) and a route to the private area

## 5. Router & guards

- [x] 5.1 Add routes `/login`, `/register` and `/app` (private) to `src/router/index.js`
- [x] 5.2 Add `router.beforeEach` guard: wait for `isRestoring`, redirect unauthenticated users away from `/app`, redirect authenticated users away from `/login`/`/register` to `/app`
- [x] 5.3 Wire `restoreSession()` into app boot (`main.js`) before mount

## 6. Verification

- [x] 6.1 Run `npm run build` and fix any errors
- [x] 6.2 Manually test register, login, invalid credentials, persisted session after reload, logout, and route guard redirects against the live API
