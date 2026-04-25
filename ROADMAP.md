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
- Route guards and middleware are absent — there is no way to intercept
  navigation for auth checks or redirects.
- Nested routing is not supported — child routes cannot be rendered inside parent
  route modules.
- Named routes are not supported — links must hardcode path strings.
- Scroll position is not restored on navigation — browser-expected behavior is
  missing.
- No CI pipeline for automated build and test validation.
- Integration with `@phcdevworks/spectre-shell-signals` for reactive route state
  is not wired.

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

### P0.2 Route Guards / Navigation Middleware

Objective Add an optional guard hook that can intercept navigation before it
commits.

Why it matters Auth checks, permission gates, and redirect logic need a clean
interception point. Without guards, consumers implement fragile workarounds
inside route modules.

Suggested deliverables

- Add an optional `beforeNavigate(context, next)` hook to the router
- Guard can call `next()` to continue, or `next('/path')` to redirect
- Tests for guard invocation, redirect, and cancellation
- Document guard pattern in `README.md`

Dependency notes

- Depends on hash routing being stable or running in parallel

Risk if skipped

- Auth and permission patterns require consumers to bypass the router

### P0.3 CI Pipeline

Objective Add a CI pipeline that runs build, lint, and tests on every push.

Why it matters Without CI, regressions can ship unnoticed. The router is a
shared dependency across all Spectre applications.

Suggested deliverables

- GitHub Actions workflow running `npm run check` on push and PR
- Badge in `README.md`

Dependency notes

- No blocking dependencies

Risk if skipped

- Regressions ship without automated catch

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

### P1.2 Named Routes

Objective Allow routes to be named so links can reference names instead of
hardcoded path strings.

Why it matters Named routes prevent path-string duplication and make path
refactors safer.

Suggested deliverables

- Optional `name` field on route definitions
- `router.href('routeName', params)` helper for generating paths
- Tests for named route resolution
- Document in `README.md`

Dependency notes

- Low dependencies; can run after P0

Risk if skipped

- Path strings are duplicated across route modules and templates

### P1.3 Signals Integration for Reactive Route State

Objective Expose current route state as a signal from
`@phcdevworks/spectre-shell-signals`.

Why it matters Reactive UI components need to respond to route changes without
polling or manual event wiring. A signal-backed route state makes this clean.

Suggested deliverables

- Optional integration that exposes `currentRoute` as a readable signal
- Document in `README.md` as opt-in behavior
- Tests for reactive route state updates

Dependency notes

- Depends on `@phcdevworks/spectre-shell-signals` being stable

Risk if skipped

- Route-reactive UI must use manual event listeners

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

### P2.2 Meta Tag Management

Objective Allow route modules to declare page title and meta updates.

Suggested deliverables

- Optional `meta` field on route context or module contract
- Implement only if the WordPress theme or Astro integration proves the need

## 3. Explicitly Out of Scope

- Do not add application state management here
- Do not add rendering logic or DOM helpers beyond route outlet management
- Do not add framework-specific adapters (React, Vue, etc.)
- Do not add styling or token definitions
- Do not add server-side routing or SSR rendering

## 4. Recommended Execution Order

1. Hash-based routing (WordPress deployment priority)
2. Route guards / navigation middleware
3. CI pipeline
4. Scroll position restoration
5. Named routes
6. Signals integration for reactive route state
7. Evaluate nested routing only when proven necessary
