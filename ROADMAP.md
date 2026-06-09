# Spectre Shell Router Roadmap

`@phcdevworks/spectre-shell-router` is the URL routing layer for the Spectre shell ecosystem.
It owns URL resolution, route matching, param and query parsing, history management, navigation
primitives, and page lifecycle. It composes with the rest of the ecosystem — it does not own
signals, state, styling, or rendering beyond clearing the route outlet.

**Ecosystem siblings:**

| Package                              | Role                                                 |
| ------------------------------------ | ---------------------------------------------------- |
| `@phcdevworks/spectre-shell-signals` | Reactive primitives (`signal`, `computed`, `effect`) |
| `@phcdevworks/spectre-tokens`        | Design token authority                               |
| `@phcdevworks/spectre-ui`            | Token-backed CSS recipes and component styling       |
| `@phcdevworks/spectre-ui-astro`      | Astro component layer built on spectre-ui            |

The router is the navigation backbone. Phase 3 is about making it genuinely connectable to
these packages — exposing enough surface that signals can observe route state, components can
react to loading, and apps can manage metadata without building workarounds.

---

## 1. Phase 1 — Foundation — Delivered

All foundation work is complete as of v1.0.0.

### What is in place

- Router class with hardened navigation behavior and monotonic `currentNavId` race-condition
  guard.
- Path matching with `:param` segment extraction and `URLSearchParams` query parsing.
- Browser History API integration (`pushState` / `popstate`).
- Page lifecycle enforcement — `destroy()` always runs before the next `render()`.
- Same-domain `<a>` link interception; modified clicks (ctrl, meta, shift, alt) and external
  links pass through.
- TypeScript strict mode throughout `src/index.ts`. Zero runtime dependencies.
- Vitest test suite across three files: `router.test.ts`, `reliability.test.ts`,
  `stress.test.ts`.
- CI pipeline running `npm run check` (typecheck + lint + build + test) on Node 22 and 24
  for every push and pull request.
- NPM publishing setup with `prepublishOnly` gate.
- Multi-agent documentation: `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `JULES.md`, `COPILOT.md`.

### What will not change

- `src/index.ts` remains the single source of truth. Zero runtime dependencies is a hard
  constraint — browser APIs only.
- The `npm run check` gate is the release standard. All steps must pass before handoff.
- `destroy()` must always run before `render()`. This invariant is non-negotiable.
- This package does not own application state, reactive primitives, styling, or SSR.

---

## 2. Phase 2 — Routing Contract — Delivered

All Phase 2 work is complete.

### What was delivered

- Hash-based routing mode (`mode: 'hash'`) — paths stored after `#/`, `router.href()` returns
  hash-prefixed URLs.
- Route guards via `beforeNavigate` — async, cancellable, redirect-capable. Navigation reverts
  if `next()` is never called.
- Scroll position restoration for push navigation and browser back/forward.
- Named routes with `router.href(name, params?)` for safe path generation. Throws on unknown
  name or missing required `:param` segment.
- Constructor options interface `RouterOptions` as a stable public contract.

---

## 3. Phase 3 — Ecosystem Integration (Active)

The foundation is stable. Phase 3 focuses on making the router connectable to
`spectre-shell-signals`, `spectre-ui`, and application-level concerns like metadata and
analytics.

### P0: Signals Bridge

#### Navigation subscription API

Expose router state reactively without the router owning a signal primitive.

- Add `router.subscribe(callback)` — fires with the current `RouteContext` after each
  completed navigation, returns an unsubscribe function.
- Zero new runtime dependencies.
- `spectre-shell-signals` can wrap this in a `signal()` at the app layer, keeping the router
  itself dependency-free while enabling full reactivity.

#### Navigating state hooks

Enable loading indicators and `navigating$` signal support in `spectre-ui`.

- Add optional `onNavigationStart` and `onNavigationEnd` callbacks to the constructor options.
- Used at the app layer to drive `navigating$` signals and loading indicators in `spectre-ui`
  components.

---

### P1: Application Primitives

#### Per-route metadata

Support document title management, analytics tagging, and route-level guard data.

- Add optional `meta` object to route definitions. Typed but open-ended — apps define their
  own metadata shape.
- `RouteContext` exposes `meta` so page modules and app code can read it at render time.

#### `afterNavigate` hook

Complete the navigation lifecycle surface for a11y, analytics, and side effects.

- Add optional `afterNavigate(context)` to constructor options.
- Fires after render completes; complements `beforeNavigate`.
- Enables a11y focus management, analytics events, and post-navigation side effects.

---

### P2: Controlled Expansion

#### Nested routing

Design-only until a concrete application need is proven. Evaluate alongside
`spectre-ui-astro` layout patterns before committing to an API.

---

### P3: API Documentation — BLOCKING Phase 4

These APIs shipped in v1.1.0 but README examples are missing or incomplete.
This section must be closed before any Phase 4 work ships. `spectre-init`
templates cannot safely scaffold these patterns without documented examples.

#### `meta` + `afterNavigate` — document title and a11y pattern

Add a README example showing:

- A route definition with `meta: { title: string }`.
- An `afterNavigate(context)` handler that reads `context.meta?.title` and
  sets `document.title`.
- A note on a11y focus management as a secondary use case.

#### `onNavigationStart` / `onNavigationEnd` — loading state pattern

Add a README example showing:

- Both callbacks toggling a boolean.
- A note that these drive a `navigating` signal at the app layer via
  `spectre-shell-signals`.

#### `router.subscribe()` — signals bridge pattern

Add a README example showing:

- Wrapping `router.subscribe()` in a `signal()` from `spectre-shell-signals`
  to expose a reactive `currentRoute` at the app layer.
- This is the canonical pattern for reactive route state — one example is
  enough; the goal is a copy-able reference.

---

## 4. Phase 4 — Production Readiness

The routing contract will be complete after Phase 3. Phase 4 closes remaining gaps that
surface in real production applications: explicit error handling, navigation history helpers,
and nested outlet support (promoted from Phase 3 P2 when a concrete need is confirmed).

### P0: Error Routes

Provide deterministic, user-visible error handling instead of silent root-clearing.

- Add an optional `errorRoute` path to `RouterOptions`. When a loader throws or no route
  matches, the router navigates to `errorRoute` rather than silently clearing the outlet.
- Add an optional `onError(error, context)` callback for apps that want to handle errors
  programmatically without a redirect.
- Cover error route behavior in `reliability.test.ts`.

---

### P1: Navigation History Helpers

Expose History API navigation as first-class router methods.

- Add `router.back()` and `router.forward()` wrappers around `history.back()` and
  `history.forward()`.
- Add `router.replace(path)` — navigates to `path` without adding a new history entry.
- Consistent with the existing `router.navigate()` contract and race-condition guard.

---

### P2: Nested Routing

Support child routes rendered inside parent outlet elements.

- Nested route definitions with a child `routes` array on parent route entries.
- Parent page modules declare an inner outlet element; child routes render into it.
- Implement only when a concrete `spectre-ui-astro` layout pattern confirms the API shape.

---

## Recommended Execution Order

1. Navigation subscription API — unblocks `spectre-shell-signals` integration
2. Navigating state hooks — unblocks loading UI in `spectre-ui`
3. Per-route metadata — unblocks title management and analytics
4. `afterNavigate` hook — completes the navigation lifecycle surface
5. Error routes — closes the silent-failure gap for production apps
6. Navigation history helpers — ergonomic, low-risk, additive
7. Nested routing — only when a concrete app need is confirmed

---

## Explicitly Out of Scope

- Application state management — owned by `spectre-shell-signals`
- Rendering logic or DOM helpers beyond clearing the route outlet
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions — owned by `spectre-tokens` / `spectre-ui`
- SSR / server-side routing
