# Spectre Shell Router Roadmap

This roadmap is grounded in the current repository shape and public contract of
`@phcdevworks/spectre-shell-router` as it exists today.

`@phcdevworks/spectre-shell-router` is the minimal, framework-agnostic
client-side router for Spectre applications. It owns URL resolution, route
matching, param and query parsing, history management, and navigation
primitives. It does not own application state, rendering, signals, or styling.

The work below focuses on closing the known gaps in the routing contract and
hardening the package toward a stable v1.0 before expanding scope.

## 1. Current Repo Assessment

### Current strengths

- The router already handles path matching, params, query parsing, navigation,
  and History API integration.
- The `RouteContext` interface provides a stable contract for route modules.
- TypeScript strict mode is in place throughout.
- The minimal-by-design philosophy is documented and enforced.
- v0.0.2 refactored the router into a class with hardened navigation behavior.

### Current gaps to harden

- Hash-based routing (`#/path`) is not supported, limiting compatibility with
  WordPress and Elementor deployments that cannot control server routing.
- ~~Route guards and middleware are absent.~~ **Done** — `beforeNavigate(context, next)` hook added; guard can allow, redirect, or cancel navigation.
- Nested routing is not supported — child routes cannot be rendered inside parent
  route modules.
- ~~Named routes are not supported — links must hardcode path strings.~~ **Done** — optional `name` on route definitions; `router.href('name', params)` generates the correct path.
- Scroll position is not restored on navigation — browser-expected behavior is
  missing.
- ~~No CI pipeline for automated build and test validation.~~ **Done** — GitHub Actions CI runs `npm run check` on push and PR across Node 22 and 24.
## 2. Roadmap

## P0: Core Routing Completeness / Must-Do

### P0.1 Hash-Based Routing

Objective Add support for hash-based routing (`#/path`) as an opt-in mode.

Why it matters WordPress and shared-hosting environments often cannot configure
server-side URL rewriting. Hash routing is the fallback that makes Spectre shell
applications deployable in those environments, which is a core part of the
WordPress strategy.

Suggested deliverables

- Add a `mode: 'hash' | 'history'` option to the router constructor
- Hash mode reads and writes `location.hash` instead of `location.pathname`
- All existing navigation and param behavior works in hash mode
- Tests for hash mode parity with history mode

Dependency notes

- No upstream dependencies; can start immediately
- Required before WordPress theme deep integration

Risk if skipped

- Spectre shell applications cannot be deployed on WordPress/shared hosting
  without custom server configuration

### ~~P0.2 Route Guards / Navigation Middleware~~ — **Complete**

Optional `beforeNavigate(context, next)` hook added to the router constructor.
Guard can call `next()` to continue, `next('/path')` to redirect, or return
without calling `next()` to cancel. All three paths are tested and documented
in `README.md`.

### ~~P0.3 CI Pipeline~~ — **Complete**

GitHub Actions CI runs `npm run check` on every push and PR across Node 22 and
24 with concurrency cancellation. CI badge added to `README.md`.

## P1: Routing Ergonomics

### P1.1 Scroll Position Restoration

Objective Restore scroll position on navigation, matching browser-expected
behavior.

Why it matters Users expect the page to scroll to top on navigation and to
restore position on back/forward. This is a baseline web standard behavior.

Suggested deliverables

- Scroll to top on forward navigation by default
- Restore saved scroll position on history back/forward
- Opt-out available for custom scroll management

Dependency notes

- Low dependencies; can run alongside P0

Risk if skipped

- Navigation feels broken compared to standard browser behavior

### ~~P1.2 Named Routes~~ — **Complete**

Optional `name` field on route definitions. `router.href('routeName', params)`
generates the correct path. Named route resolution is tested and documented in
`README.md`.

## P2: Later / Controlled Improvement

### P2.1 Nested Routing

Objective Support child routes rendered inside parent route outlet elements.

Why it matters Some application layouts require nested routing (e.g. a shell
with persistent navigation and a swappable content area).

Suggested deliverables

- Proposal for nested route API
- Implement only when a concrete application need is proven

Dependency notes

- Only after P0 and P1 are stable
- Evaluate with WordPress theme and Astro adapter use cases

## 3. Explicitly Out of Scope

- Do not add application state management here
- Do not add rendering logic or DOM helpers beyond route outlet management
- Do not add framework-specific adapters (React, Vue, etc.)
- Do not add styling or token definitions
- Do not add server-side routing or SSR rendering
- Do not add signals integration
- Do not add meta tag management

## 4. Recommended Execution Order

1. Hash-based routing (WordPress deployment priority)
2. Scroll position restoration
3. Evaluate nested routing only when a concrete application need is proven
