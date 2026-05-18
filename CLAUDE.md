# CLAUDE.md — spectre-shell-router

Primary AI maintainer: **Claude Code** (claude-sonnet-4-6, Anthropic)
Human owner: PHCDevworks / brad.potts@coastdigitalgroup.com

## Commit Policy

Claude Code does **not** create git commits, push branches, create tags, merge pull requests,
publish packages, or create releases in this repository. Changes are prepared and validated but
left for human review and approval.

For multi-agent coordination, follow `AGENTS.md`. Claude Code owns implementation,
architecture, tests, and final validation; Codex owns documentation, release preparation,
production stabilization, and repo hygiene.

## AI Team

| Role                   | Agent          | Authority                                                     |
| ---------------------- | -------------- | ------------------------------------------------------------- |
| Human owner            | Bradley Potts  | Final authority — commits, tags, releases                     |
| Lead developer         | Claude Code    | Implementation, architecture, tests, CI                       |
| Release/docs oversight | OpenAI Codex   | Release readiness, changelog, production safety               |
| Development support    | GitHub Copilot | Inline suggestions, IDE support                               |
| Maintenance            | Google Jules   | Bounded micro-maintenance and dependency updates (`JULES.md`) |

See [AGENTS.md](./AGENTS.md) for full role boundaries and per-agent handoff rules.

---

## Claude Code Owns

As the lead development agent, Claude Code is responsible for:

- Feature implementation and bug fixes in `src/index.ts`
- Refactors and architecture improvements within the router boundary
- Test coverage and test quality across `tests/`
- Code quality, TypeScript type safety, and coding standards enforcement
- Build reliability and CI troubleshooting
- Developer workflow improvements
- Final pre-handoff validation — `npm run check` must pass clean

When a task falls outside this list (docs, changelog, release version, config hygiene),
check `AGENTS.md` for the owning agent before acting.

---

## What This Package Is

`@phcdevworks/spectre-shell-router` is a minimal, zero-dependency, framework-agnostic client-side router for Spectre applications. It maps URL paths to lazy page modules, renders into a root `HTMLElement`, and manages page lifecycle via `render` / `destroy` hooks.

Single source file: `src/index.ts` (153 lines). Keep it lean.

## Commands

```bash
npm run check          # Full verification: typecheck + lint + build + test (run before handoff)
npm run typecheck      # tsc --noEmit only
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run build          # tsc emit to dist/
npm test -- --run      # Vitest once (no watch)
npm run format         # Prettier across all source files
```

`npm run check` is the gate. All must pass before handoff.

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
- Keep tool config files in TypeScript where the tool supports it (e.g. `vitest.config.ts`)
- All new behavior needs a test in the appropriate test file

## Test Strategy

- `router.test.ts`: core contract — matching, params, query, lifecycle, link interception, popstate
- `reliability.test.ts`: failure paths — loader throws, destroy throws, trailing slashes, rapid popstate
- `stress.test.ts`: race conditions — rapid-fire navigates, overlapping async loaders, back/forward

Tests run against jsdom (see `vitest.config.ts`). Use `vi.fn()` mocks for render/destroy hooks.

## Handoff Protocol

When implementation is complete, communicate clearly before stepping back:

1. State that `npm run check` passes — never assume it's implied.
2. List which files changed and whether any public API types (`Route`, `Router`, `RouteContext`,
   `PageModule`) were added, changed, or removed.
3. Flag any `README.md` or `CHANGELOG.md` updates needed — Codex owns those.
4. Note remaining risk or deferred items.

This gives Codex and Bradley a clean, reviewable summary to work from.

## Publishing

Codex prepares releases and changelog updates. Before handoff, Codex runs the
release-readiness checklist in `CODEX.md` — verify CI, README/API sync, CHANGELOG format,
semver, and no unexpected runtime dependencies. `prepublishOnly` runs `npm run check`; never
publish or tag without human approval and a passing full check. Versioning follows semver.

## Boundaries Reference

This package is part of the Spectre shell ecosystem. It provides routing primitives only. Consuming packages decide how they render, compose state, and structure application behavior.

## Roadmap

See `ROADMAP.md`. Next priorities: hash-based routing (P0), route guards (P0), scroll restoration (P1), named routes (P1).
