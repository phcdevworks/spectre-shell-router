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

## Phase 1 — Foundation: Complete

Router class, path matching, params, query parsing, History API, race-condition safety,
page lifecycle, CI, TypeScript strict mode, test suite. Shipped in v1.0.0.

---

## Phase 2 — Routing Contract: Complete

Hash-based routing (`mode: 'hash'`), route guards (`beforeNavigate`), scroll position
restoration, named routes (`router.href()`). All delivered and documented.

---

## Phase 3 — Ecosystem Integration (Active)

The foundation is stable. Phase 3 focuses on making the router connectable to
`spectre-shell-signals`, `spectre-ui`, and application-level concerns like metadata and
analytics.

### P0: Signals Bridge

#### Navigation subscription API

Add `router.subscribe(callback)` — fires with the current `RouteContext` after each completed
navigation, returns an unsubscribe function. Zero new runtime dependencies. This is the seam
that lets `spectre-shell-signals` wrap router state in a `signal()` at the app layer, keeping
the router itself dependency-free while enabling full reactivity.

#### Navigating state hooks

Add `onNavigationStart` and `onNavigationEnd` callbacks to the constructor options. Used at
the app layer to drive `navigating$` signals and loading indicators in `spectre-ui` components.

### P1: Application Primitives

#### Per-route metadata

Add an optional `meta` object to route definitions. `RouteContext` exposes it so page modules
and app code can read document title, analytics keys, guard data, etc. Typed but open-ended —
apps define their own metadata shape.

#### `afterNavigate` hook

Add an optional `afterNavigate(context)` to constructor options. Fires after render completes.
Complements `beforeNavigate` and enables a11y focus management, analytics events, and
post-navigation side effects in production apps.

### P2: Controlled Expansion

#### Nested routing

Support child routes rendered inside parent outlet elements. Design-only until a concrete
application need is proven — evaluate alongside `spectre-ui-astro` layout patterns first.

---

## Recommended Execution Order

1. Navigation subscription API — unblocks `spectre-shell-signals` integration
2. Navigating state hooks — unblocks loading UI in `spectre-ui`
3. Per-route metadata — unblocks title management and analytics
4. `afterNavigate` hook — completes the navigation lifecycle surface
5. Nested routing — only when a concrete app need is confirmed

---

## Explicitly Out of Scope

- Application state management — owned by `spectre-shell-signals`
- Rendering logic or DOM helpers beyond clearing the route outlet
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions — owned by `spectre-tokens` / `spectre-ui`
- SSR / server-side routing
