# Spectre Shell Router — Execution Todo

Scoped to routing completeness, ergonomics, and CI. Aligned with `ROADMAP.md`.

## P0: Core Routing Completeness

- [ ] **Hash-based routing mode** (`mode: 'hash'`)
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: `mode: 'hash'` reads/writes `location.hash`; params, query, and navigation work in hash mode; test parity with history mode; documented

- [ ] **Route guard / `beforeNavigate` hook**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `beforeNavigate(context, next)` on constructor; guard can allow, redirect, or cancel; tests cover all three; documented

- [x] **CI pipeline** — done; GitHub Actions runs `npm run check` on Node 22 + 24; badge in README

## P1: Routing Ergonomics

- [ ] **Scroll position restoration**
  - Files: `src/index.ts`, `tests/router.test.ts`
  - Acceptance: scroll to top on forward navigation; restore on back/forward; opt-out available

- [ ] **Named routes + `router.href()` helper**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `name` on route definitions; `router.href('name', params)` generates correct path; tests confirm resolution; documented

## P2: Later / Controlled Improvement

- [ ] **Nested routing proposal** (planning doc only; implement only when a concrete need is proven)

## Explicitly Out of Scope

- Application state management
- Rendering or DOM helpers beyond route outlet management
- Framework-specific adapters
- Styling or token definitions
- Signals integration
- Meta tag management
- SSR / server routing

## Recommended Execution Order

1. Hash routing (WordPress deployment priority)
2. Route guards
3. Scroll position restoration
4. Named routes
5. Nested routing proposal (only when proven necessary)
