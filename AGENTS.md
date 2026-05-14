# AGENTS.md — spectre-shell-router

**Primary developer: Claude Code (Anthropic)**
**Owner: PHCDevworks**

Claude Code is the primary AI developer for this package. All automated and AI-assisted work on this repository flows through Claude Code using the guidance in `CLAUDE.md`.

## Package Mission

`@phcdevworks/spectre-shell-router` provides minimal, framework-agnostic client-side routing for Spectre applications. It maps URL paths to lazy page modules and enforces the `render` / `destroy` lifecycle contract.

## Responsibility Boundary

- **Own routing only**: URL matching, navigation, params extraction, query parsing, History API, race-condition protection, page lifecycle
- **Do not own**: application state, rendering logic beyond clearing the root element, styling, signals, SSR, framework adapters

## Core Directives

1. **Minimal surface area** — keep `src/index.ts` lean; resist feature creep
2. **Lifecycle enforcement** — `destroy()` must always run before the next `render()`
3. **Zero dependencies** — standard browser APIs only
4. **Async loaders** — dynamic `import()` pattern for page loading
5. **Native History API** — `pushState` / `popstate`; no hash routing by default (hash mode is a planned opt-in)
6. **Race-condition safe** — `currentNavId` monotonic counter guards stale renders

## Verification Gate

Before marking any change done:

```bash
npm run check
```

All of typecheck, lint, build, and tests must pass.

## AI Workflow

1. Read `CLAUDE.md` for project context and coding standards
2. Make the smallest focused change that solves the stated problem
3. Add or update tests in the appropriate test file
4. Update `CHANGELOG.md` and `README.md` when public behavior changes
5. Run `npm run check` — all green before committing
