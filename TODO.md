# Spectre Shell Router — Execution Todo

Aligned to the current repository and the roadmap in `ROADMAP.md`. Scoped to routing
completeness, ergonomics, and package health.

---

## Phase 1 - Foundation: Completed

All Phase 1 items were delivered in the v1.0.0 release cycle.

### P0: Routing Core

- [x] Router class with hardened navigation behavior
- [x] Path matching and `:param` segment extraction
- [x] Query string parsing via `URLSearchParams`
- [x] History API integration (`pushState` / `popstate`)
- [x] Race-condition protection (`currentNavId` monotonic counter)
- [x] Page lifecycle enforcement — `destroy()` runs before next `render()`
- [x] Same-domain link interception

### P1: Quality Gates

- [x] TypeScript strict mode throughout `src/index.ts`
- [x] Vitest test suite: `router.test.ts`, `reliability.test.ts`, `stress.test.ts`
- [x] ESLint + Prettier configuration
- [x] CI pipeline — GitHub Actions runs `npm run check` on Node 22 and 24 with badge in `README.md`

### P2: Package Setup

- [x] NPM publishing setup with `prepublishOnly` gate
- [x] Multi-agent documentation (`AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `JULES.md`, `COPILOT.md`)

---

## Phase 2 - Mature Operations

Next active phase. Starts from the stable v1.0.0 router foundation and focuses on closing
the remaining routing gaps, ergonomics, and controlled expansion.

### P0: Core Routing Completeness

- [ ] **Hash-based routing mode** (`mode: 'hash'`)
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: `mode: 'hash'` reads/writes `location.hash`; params, query, and navigation work
    in hash mode; test parity with history mode; documented in `README.md`

- [x] **Route guard / `beforeNavigate` hook**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `beforeNavigate(context, next)` on constructor; guard can allow,
    redirect, or cancel; all three paths are tested; documented in `README.md`

### P1: Routing Ergonomics

- [ ] **Scroll position restoration**
  - Files: `src/index.ts`, `tests/router.test.ts`
  - Acceptance: scroll to top on forward navigation; restore saved position on back/forward;
    opt-out available for custom scroll management

- [x] **Named routes + `router.href()` helper**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `name` on route definitions; `router.href('name', params)` generates
    the correct path; tests confirm resolution; documented in `README.md`

### P2: Later / Controlled Improvement

- [ ] **Nested routing proposal** (planning doc only; implement only when a concrete need is proven)

---

## Recommended Execution Order

1. Hash routing (WordPress deployment priority)
2. Scroll position restoration
3. Nested routing proposal (only when a concrete application need is proven)

---

## Explicitly Out of Scope

- Application state management
- Rendering logic or DOM helpers beyond route outlet management
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions
- Signals integration
- Meta tag management
- SSR / server routing
