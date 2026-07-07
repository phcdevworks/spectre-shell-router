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

## Phase 3 — Ecosystem Integration: P0/P1/P3 Complete — Phase 4 Unblocked

P0, P1, and P3 (API docs) delivered. P2 (nested routing) remains evaluation-only.
Phase 4 error routes and history helpers are now implemented — see Phase 4 below.

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

- [x] **Per-route metadata support**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `meta` object on route definitions (typed but open-ended);
    `RouteContext` exposes `meta` so page modules and app code can read title, guard data,
    analytics keys, etc.
  - Why: real apps need document title management, analytics tagging, and route-level
    data that does not belong in the page module itself

- [x] **`afterNavigate` hook**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`
  - Acceptance: optional `afterNavigate(context)` on constructor options; fires after
    render completes; complements `beforeNavigate` for analytics, focus management, etc.
  - Why: currently no hook fires after a navigation settles — needed for a11y focus management
    and analytics events in production apps

### P2: Controlled Expansion

- [ ] **Nested routing proposal** (planning doc only; implement only when a concrete need is proven)
  - Evaluate alongside `spectre-ui-astro` layout patterns before committing to an API

### P3: Phase 3 API Documentation — Complete

These APIs shipped in v1.1.0 and README examples are now documented. spectre-init
Phase 6 templates can scaffold these patterns using the documented examples.

Unblocked:

- This repo: Phase 4 P0/P1 delivered (error routes, history helpers)
- `spectre-init`: Phase 6 template modernization (lifecycle, title, loading, plugin)
- `spectre-shell`: P2.5 release readiness (templates need stable examples first)

- [x] **Document `meta: { title: string }` pattern in README**
  - Files: `README.md`
  - Acceptance: route definition shows `meta` field; `afterNavigate` example reads
    `context.meta?.title` and sets `document.title`
  - Why: spectre-init shell-app template needs a copy-able title management pattern

- [x] **Document `afterNavigate` hook in README**
  - Files: `README.md`
  - Acceptance: `RouterOptions` example shows `afterNavigate(context)` reading
    `context.meta?.title`; includes note on a11y focus management use case
  - Why: without a documented example, consumers will not know how to complete
    the navigation lifecycle

- [x] **Document `onNavigationStart` / `onNavigationEnd` loading-state pattern in README**
  - Files: `README.md`
  - Acceptance: `RouterOptions` example shows both callbacks toggling a boolean;
    includes note that these drive a `navigating` signal at the app layer via
    `spectre-shell-signals`
  - Why: spectre-init loading indicator pattern depends on this being documented

- [x] **Document `router.subscribe()` signals integration pattern in README**
  - Files: `README.md`
  - Acceptance: example shows wrapping `router.subscribe()` in a `signal()` from
    `spectre-shell-signals` to get a reactive `currentRoute` at the app layer
  - Why: this is the canonical bridge between the router and signals — consumers
    need a single clear example

---

## Phase 4 — Production Readiness: P0/P1 Complete, Documented

Error routes and navigation history helpers are implemented, tested, and documented
in README.md/CHANGELOG.md. Nested outlet support (P2) remains evaluation-only until
a concrete need is proven.

### P0: Error Routes

- [x] **`errorRoute` option on `RouterOptions`**
  - Files: `src/index.ts`, `tests/reliability.test.ts`, `README.md`, `CHANGELOG.md`
  - Acceptance: when a loader throws or no route matches, the router navigates to `errorRoute`
    rather than silently clearing the outlet; `errorRoute` path must exist in the route list
  - Why: silent root-clearing gives users a blank page with no feedback; named error routes
    make failure states explicit and testable

- [x] **`onError(error, context)` callback**
  - Files: `src/index.ts`, `tests/reliability.test.ts`, `README.md`, `CHANGELOG.md`
  - Acceptance: optional callback on constructor options; fires when a loader throws;
    apps can log, report, or handle programmatically without requiring a redirect
  - Why: not all error handling is a redirect — apps need a seam for error telemetry

### P1: Navigation History Helpers

- [x] **`router.back()` and `router.forward()`**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`, `CHANGELOG.md`
  - Acceptance: thin wrappers around `history.back()` and `history.forward()`; consistent
    with the existing `navigate()` contract
  - Why: exposes common navigation actions as first-class router methods so callers do not
    reach around the router to the History API directly

- [x] **`router.replace(path)`**
  - Files: `src/index.ts`, `tests/router.test.ts`, `README.md`, `CHANGELOG.md`
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

1. ~~Navigation subscription API~~ ✓
2. ~~Navigating state hooks~~ ✓
3. ~~Per-route metadata~~ ✓
4. ~~`afterNavigate` hook~~ ✓
5. ~~Phase 3 P3 API docs~~ ✓
6. ~~Error routes~~ ✓ — Phase 4 P0
7. ~~Navigation history helpers~~ ✓ — Phase 4 P1 (back/forward/replace)
8. ~~README/CHANGELOG updates for Phase 4 P0/P1~~ ✓
9. **Release prep** ← current — version bump, tag, publish (human action)
10. Nested routing — only when a concrete application need is proven

---

---

## spectre-init Consumer Requirements

`@phcdevworks/spectre-init` scaffolds templates against this package. These items
are needed for templates to work correctly and demonstrate the full routing surface.

### P0: Confirmed — Route Array Contract

`bootstrapApp` calls `routes()` and expects `Route[]` as the return value.
Templates have been fixed to return `Route[]` with `{ path, loader }` shape.
No router changes needed — this is confirmed correct.

- [x] `Route` type (`path`, `name?`, `meta?`, `loader`) is the correct shape — templates updated

### P1: Template Showcase Items — Needed for Phase 6

These are shipped in v1.1.0 but not yet used in scaffolded templates. Confirm
they are stable and covered in README examples so spectre-init can reference them.

- [x] Confirm `meta: { title: string }` on route definitions is documented with an example
- [x] Confirm `afterNavigate(context)` usage for `document.title` is documented
- [x] Confirm `onNavigationStart` / `onNavigationEnd` pattern is documented

### P2: Error Routes — Needed for Phase 6 template hardening

- [x] `errorRoute` option on `RouterOptions` (Phase 4 P0) — implemented; spectre-init shell-app template can now add an error route
- [x] `onError(error, context)` callback — implemented; document the pattern for template consumers once README lands

## Explicitly Out of Scope

- Application state management (owned by spectre-shell-signals)
- Rendering logic or DOM helpers beyond route outlet management
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions (owned by spectre-tokens / spectre-ui)
- SSR / server routing
