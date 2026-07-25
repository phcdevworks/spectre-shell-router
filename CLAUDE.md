# CLAUDE.md - spectre-shell-router

## Project Identity

**Package:** `@phcdevworks/spectre-shell-router`
**Human owner:** Bradley Potts
**Primary AI developer:** Claude Code (claude-sonnet-4-6)

`@phcdevworks/spectre-shell-router` is a minimal, zero-dependency, framework-agnostic client-side router for Spectre applications. It maps URL paths to lazy page modules, renders into a root `HTMLElement`, and manages page lifecycle via `render` / `destroy` hooks.

Single source file: `src/index.ts`. Keep it lean.

This file is the authoritative guide for Claude Code operating in this repository. Read it before touching any source file.

## Multi-Agent Team

Full roster, authority table, and PR requirements: [AGENTS.md](AGENTS.md).
Claude Code is the lead implementation authority for all routing behavior,
source changes, and architecture. Resolve scope conflicts by referencing
`AGENTS.md` first.

## Commit Policy

See [AGENTS.md](AGENTS.md) for the full grant of authority. Changes are
validated, then staged, committed, tagged, and pushed without per-action
confirmation. Publishing packages and creating releases remain with Bradley
Potts.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. Claude Code prepares validated changes for
human review; Bradley Potts handles final commit, merge, tag, and release authority.

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

## Development Workflow

```bash
npm install           # install dependencies
npm run check         # full validation gate — must pass before any handoff
```

Key scripts:

```bash
npm run check          # Full verification: typecheck + lint + build + test + check:ecosystem
npm run typecheck      # tsc --noEmit only
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run build          # tsc emit to dist/
npm test -- --run      # Vitest once (no watch)
npm run format         # Prettier across all source files
npm run check:ecosystem  # spectre-manifest validation only
```

`npm run check` is the gate. All must pass before handoff.

## File Structure

```
src/index.ts          — entire router implementation (types + Router class)
tests/
  router.test.ts      — core unit tests
  reliability.test.ts — error path and edge-case tests
  stress.test.ts      — race conditions and rapid-navigation tests
dist/                 — build output (gitignored, published to npm)
```

## Edit Permissions

Follow the shared edit-permission table in `AGENTS.md`. For Claude Code, the key rule is that
`src/index.ts` is the implementation authority. All routing changes start there. `dist/` is
always regenerated — never hand-edited.

## Package Scope

Router scope and working boundaries are defined in `AGENTS.md` under "Responsibility Boundary"
and "Core Rules". Claude Code must keep this package focused on routing primitives only.

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

## What This Package Does Not Own

Shared ownership boundaries live in `AGENTS.md`. Claude Code must keep this package focused on
routing primitives — URL matching, navigation, lifecycle, and History API. The following are
explicitly out of scope:

- Application state or reactive signals
- Rendering logic beyond clearing the root element
- Styling or design tokens
- Server-side rendering or file-based routing
- Framework-specific adapters

## Gotchas

- `dist/` is always regenerated by `npm run build`. Manual edits are immediately overwritten.
- Race-condition safety is implemented via a monotonic `currentNavId` counter. Any change to
  async navigation flow must preserve this invariant.
- `beforeNavigate` must call `next()` to proceed; if it never calls `next()`, navigation is
  silently cancelled and the URL reverts.
- Hash mode changes how `router.href()` returns paths — include `#/` prefix in hash mode.

## Roadmap

See `ROADMAP.md`. Phases 1-3 are complete. Phase 4 (Production Readiness) is the active
phase — priorities: error routes (P0, `errorRoute` option and `onError` callback), navigation
history helpers (P1, `router.back()` / `router.forward()` / `router.replace()`), and nested
routing (P2, evaluation-only until a concrete need is confirmed).
