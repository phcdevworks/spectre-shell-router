# CLAUDE.md — spectre-shell-router

Claude Code is the primary developer for this package. This file is the single source of truth for working on the project.

## What This Package Is

`@phcdevworks/spectre-shell-router` is a minimal, zero-dependency, framework-agnostic client-side router for Spectre applications. It maps URL paths to lazy page modules, renders into a root `HTMLElement`, and manages page lifecycle via `render` / `destroy` hooks.

Single source file: `src/index.ts` (153 lines). Keep it lean.

## Commands

```bash
npm run check          # Full verification: typecheck + lint + build + test (run before every commit)
npm run typecheck      # tsc --noEmit only
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run build          # tsc emit to dist/
npm test -- --run      # Vitest once (no watch)
npm run format         # Prettier across all source files
```

`npm run check` is the gate. All must pass before committing.

## Architecture

```
src/index.ts          — entire router implementation (types + Router class)
tests/
  router.test.ts      — core unit tests
  reliability.test.ts — error path and edge-case tests
  stress.test.ts      — race conditions and rapid-navigation tests
dist/                 — build output (gitignored, published to npm)
```

## What the Router Owns

- URL matching (`:param` segments, exact path matching)
- Query string parsing (`URLSearchParams`)
- Navigation: `navigate(path)`, `popstate` handling, same-domain link interception
- Page lifecycle: calling `render(ctx)` and `destroy()` in order, with race-condition protection

## What the Router Does NOT Own

Do not add to this package:

- Application state management
- Rendering logic or DOM helpers beyond clearing `root.innerHTML`
- Framework-specific adapters (React, Vue, etc.)
- Styling, design tokens, or CSS
- Server-side routing or SSR
- Signals / reactivity
- Meta tag management

## Coding Standards

- TypeScript strict mode — all types must be explicit
- Zero runtime dependencies — browser APIs only
- No comments unless the WHY is non-obvious; never comment the WHAT
- Follow the existing Prettier config (`.prettierrc`): single quotes, no semi, 100-char width
- All new behavior needs a test in the appropriate test file

## Test Strategy

- `router.test.ts`: core contract — matching, params, query, lifecycle, link interception, popstate
- `reliability.test.ts`: failure paths — loader throws, destroy throws, trailing slashes, rapid popstate
- `stress.test.ts`: race conditions — rapid-fire navigates, overlapping async loaders, back/forward

Tests run against jsdom (see `vitest.config.ts`). Use `vi.fn()` mocks for render/destroy hooks.

## Publishing

`prepublishOnly` runs `npm run check`. Never manually publish without passing the full check. Version follows semver; update `CHANGELOG.md` with every release.

## Boundaries Reference

This package is part of the Spectre shell ecosystem. It provides routing primitives only. Consuming packages decide how they render, compose state, and structure application behavior.

## Roadmap

See `ROADMAP.md`. Next priorities: hash-based routing (P0), route guards (P0), scroll restoration (P1), named routes (P1).
