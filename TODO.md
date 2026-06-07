# Spectre Shell Router — Execution Todo

Aligned to the current repository and the roadmap in `ROADMAP.md`. Scoped to routing
completeness, ergonomics, and package health.

---

## Phase 1 — Foundation: Completed

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

## Phase 2 — Routing Contract: Completed

All Phase 2 items were delivered. The routing contract is stable and complete.

### P0: Core Routing Completeness

- [x] Hash-based routing mode (`mode: 'hash'`)
- [x] Route guard / `beforeNavigate` hook

### P1: Routing Ergonomics

- [x] Scroll position restoration
- [x] Named routes + `router.href()` helper

---

## Phase 3 — Ecosystem Integration

Active phase. The foundation is solid — now the router needs to integrate with the broader
Spectre ecosystem so `spectre-shell-signals`, `spectre-ui`, and `spectre-ui-astro` can build
on top of it. Focus is on exposing router state reactively and supporting real application needs.

### P0: Signals Bridge

- [x] **Navigation subscription API (`router.subscribe()`)**
  - Files: `src/index.ts`, `tests/router.test.ts`
  - Acceptance: `router.subscribe(callback)` fires with current `RouteContext` on every
    completed navigation; returns an unsubscribe function; zero new runtime deps;
    `spectre-shell-signals` can wrap this in a `signal()` at the app layer
  - Why: lets spectre-shell-signals, spectre-ui components, and app-level code react to route
    changes without the router owning the signal primitive

- [x] **Navigating state hooks (`onNavigationStart` / `onNavigationEnd`)**
  - Files: `src/index.ts`, `tests/router.test.ts`
  - Acceptance: optional callbacks on the constructor options for navigation start and end;
    used to drive loading indicators and `navigating$` signals at the app layer
  - Why: apps and component libraries (spectre-ui) need to show/hide loading state

### P1: Application Primitives

- [ ] **Per-route metadata support**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `meta` object on route definitions (typed but open-ended);
    `RouteContext` exposes `meta` so page modules and app code can read title, guard data,
    analytics keys, etc.
  - Why: real apps need document title management, analytics tagging, and route-level
    data that does not belong in the page module itself

- [ ] **`afterNavigate` hook**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `afterNavigate(context)` on constructor options; fires after
    render completes; complements `beforeNavigate` for analytics, focus management, etc.
  - Why: currently no hook fires after a navigation settles — needed for a11y focus management
    and analytics events in production apps

### P2: Controlled Expansion

- [ ] **Nested routing proposal** (planning doc only; implement only when a concrete need is proven)
  - Evaluate alongside `spectre-ui-astro` layout patterns before committing to an API

---

## Phase 4 — Production Readiness

Builds on the complete Phase 3 contract. Closes remaining gaps that surface in real production
applications: explicit error handling, navigation history helpers, and nested outlet support
promoted from Phase 3 when a concrete need is confirmed.

### P0: Error Routes

- [ ] **`errorRoute` option on `RouterOptions`**
  - Files: `src/index.ts`, `tests/reliability.test.ts`, `README.md`
  - Acceptance: when a loader throws or no route matches, the router navigates to `errorRoute`
    rather than silently clearing the outlet; `errorRoute` path must exist in the route list
  - Why: silent root-clearing gives users a blank page with no feedback; named error routes
    make failure states explicit and testable

- [ ] **`onError(error, context)` callback**
  - Files: `src/index.ts`, `tests/reliability.test.ts`
  - Acceptance: optional callback on constructor options; fires when a loader throws;
    apps can log, report, or handle programmatically without requiring a redirect
  - Why: not all error handling is a redirect — apps need a seam for error telemetry

### P1: Navigation History Helpers

- [ ] **`router.back()` and `router.forward()`**
  - Files: `src/index.ts`, `tests/router.test.ts`
  - Acceptance: thin wrappers around `history.back()` and `history.forward()`; consistent
    with the existing `navigate()` contract
  - Why: exposes common navigation actions as first-class router methods so callers do not
    reach around the router to the History API directly

- [ ] **`router.replace(path)`**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: navigates to `path` without adding a new history entry (`replaceState`);
    race-condition guard applies as with `navigate()`
  - Why: redirect flows (post-login, form submission) need replace-not-push semantics

### P2: Nested Routing

- [ ] **Nested route definitions** (implement only when a concrete app need is confirmed)
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: child `routes` array on parent route entries; parent page modules declare an
    inner outlet element; child routes render into it; lifecycle enforced at both levels
  - Why: `spectre-ui-astro` layout patterns will require nested outlets — evaluate the API
    shape against a real layout before committing

---

## Recommended Execution Order

1. Navigation subscription API (unblocks spectre-shell-signals integration)
2. Navigating state hooks (unblocks loading UI in spectre-ui)
3. Per-route metadata (unblocks title management and analytics)
4. `afterNavigate` hook (completes the lifecycle surface)
5. Error routes (closes the silent-failure gap for production apps)
6. Navigation history helpers (ergonomic, low-risk, additive)
7. Nested routing (only when a concrete application need is proven)

---

## Explicitly Out of Scope

- Application state management (owned by spectre-shell-signals)
- Rendering logic or DOM helpers beyond route outlet management
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions (owned by spectre-tokens / spectre-ui)
- SSR / server routing
