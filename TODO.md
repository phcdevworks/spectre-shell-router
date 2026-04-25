# Spectre Shell Router Execution Todo

This todo list is aligned to the current repository and the roadmap in
`ROADMAP.md`. It is scoped to routing completeness, guard middleware, CI, and
ergonomics.

## P0: Core Routing Completeness / Must-Do

- Add hash-based routing mode (`mode: 'hash'`) File targets:
  - `src/index.ts`
  - `tests/router.test.ts`
  - `README.md` Acceptance criteria:
  - `mode: 'hash'` reads/writes `location.hash` instead of `location.pathname`
  - Params, query, and navigation all work in hash mode
  - Test coverage matches history mode parity
  - Documented in README

- Add route guard / `beforeNavigate` hook File targets:
  - `src/index.ts`
  - `tests/router.test.ts`
  - `README.md` Acceptance criteria:
  - Optional `beforeNavigate(context, next)` hook on router constructor
  - Guard can allow, redirect, or cancel navigation
  - Tests cover guard invocation, redirect, and cancellation
  - Documented in README

- Add GitHub Actions CI pipeline File targets:
  - `.github/workflows/ci.yml`
  - `README.md` (badge) Acceptance criteria:
  - CI runs `npm run check` on push and PR
  - Badge visible in README

## P1: Routing Ergonomics

- Add scroll position restoration on navigation File targets:
  - `src/index.ts`
  - `tests/router.test.ts` Acceptance criteria:
  - Scroll to top on forward navigation by default
  - Scroll position restored on back/forward history traversal
  - Opt-out available for custom scroll handling

- Add named routes and `router.href()` helper File targets:
  - `src/index.ts`
  - `tests/router.test.ts`
  - `README.md` Acceptance criteria:
  - Optional `name` field on route definitions
  - `router.href('routeName', params)` generates correct path
  - Tests confirm named route resolution and param interpolation
  - Documented in README

- Add opt-in signals integration for reactive route state File targets:
  - `src/index.ts` or new `src/signals.ts`
  - `tests/`
  - `README.md` Acceptance criteria:
  - `currentRoute` exposed as a readable signal (opt-in)
  - Signal updates on every navigation
  - Documented as optional in README

## P2: Later / Controlled Improvement

- Write nested routing proposal File targets:
  - planning docs Acceptance criteria:
  - Proposal covers outlet API, child route matching, and parent/child
    lifecycle behavior
  - Implement only when a concrete application need is proven

- Evaluate meta tag management File targets:
  - planning docs Acceptance criteria:
  - Document whether page title and meta updates should live in the router or
    in the consuming application

## Explicitly Out of Scope

- Do not add application state management
- Do not add rendering or DOM helpers beyond route outlet management
- Do not add framework-specific adapters
- Do not add styling or token definitions

## Recommended Execution Order

1. Hash routing (priority: WordPress compatibility)
2. Route guards
3. CI pipeline
4. Scroll position restoration
5. Named routes
6. Signals integration
7. Nested routing proposal (only when proven necessary)
