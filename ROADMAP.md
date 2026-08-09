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

This document tracks what's next. For what already shipped and why, see
[CHANGELOG.md](CHANGELOG.md) (release-by-release detail) and git history — this file does not
restate delivered work.

---

## Delivered Phases

| Phase   | Summary                                                                                                                                                                                                                                                  | Shipped in  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1       | Foundation — Router class, `currentNavId` race-condition guard, `:param`/query matching, History API integration, lifecycle enforcement, link interception, TypeScript strict mode, Vitest suite, CI, npm publishing, multi-agent docs                   | 1.0.0       |
| 2       | Routing contract — hash mode, `beforeNavigate` guards, scroll restoration, named routes + `router.href()`, stable `RouterOptions`                                                                                                                        | 1.0.0–1.1.0 |
| 3       | Ecosystem integration — `router.subscribe()`, `onNavigationStart`/`onNavigationEnd`, per-route `meta`, `afterNavigate`, full README API docs for the signals/loading/title patterns                                                                      | 1.1.0       |
| 4 P0/P1 | Production readiness — `errorRoute` + `onError` for deterministic error handling, `router.back()`/`forward()`/`replace()` history helpers                                                                                                                | 1.2.0       |
| 4 P2    | Nested routing — `Route.routes?: Route[]` with `[data-router-outlet]` mounting, cross-level param merging, ancestor-layout persistence across sibling navigations; implemented 2026-08-10 after a vendor confirmed a concrete layout + child-outlet need | Unreleased  |

### What will not change

- `src/index.ts` remains the single source of truth. Zero runtime dependencies is a hard
  constraint — browser APIs only.
- The `npm run check` gate is the release standard. All steps must pass before handoff.
- `destroy()` must always run before the next `render()` at every level of a route chain. This
  invariant is non-negotiable.
- This package does not own application state, reactive primitives, styling, or SSR.

---

## What's Next

No active phase is currently open. Phase 4 P2 (nested routing) is implemented and tested;
the remaining step is a CHANGELOG entry and version bump, owned by Codex per the release
checklist in `CODEX.md`.

New routing surface beyond what's shipped opens on demand, when a downstream consumer or
vendor surfaces a concrete need — see [TODO.md](TODO.md).

---

## Explicitly Out of Scope

- Application state management — owned by `spectre-shell-signals`
- Rendering logic or DOM helpers beyond clearing/mounting route outlets
- Framework-specific adapters (React, Vue, etc.)
- Styling or token definitions — owned by `spectre-tokens` / `spectre-ui`
- SSR / server-side routing
