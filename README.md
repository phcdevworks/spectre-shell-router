# @phcdevworks/spectre-shell-router

## Repository Snapshot

| Field | Value |
|-------|-------|
| Project team | `project-shell` |
| Repository role | Spectre client-side router |
| Package/artifact | `@phcdevworks/spectre-shell-router` |
| Current version/status | 1.1.0 |

## Standard Workflow

1. Read [AGENTS.md](AGENTS.md), then the agent-specific guide for the task.
2. Check [TODO.md](TODO.md) and [ROADMAP.md](ROADMAP.md) for current scope.
3. Make the smallest repo-local change that satisfies the task.
4. Run `npm run check` when validation is required or practical.
5. Update docs and [CHANGELOG.md](CHANGELOG.md) only when behavior, public
   contracts, or release-relevant metadata changed.

## Documentation Map

| Guide | Path |
|-------|------|
| Agent rules | [AGENTS.md](AGENTS.md) |
| Claude Code | [CLAUDE.md](CLAUDE.md) |
| Codex | [CODEX.md](CODEX.md) |
| Copilot | [COPILOT.md](COPILOT.md) |
| Jules | [JULES.md](JULES.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Todo | [TODO.md](TODO.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Security | [SECURITY.md](SECURITY.md) |

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-shell-router.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-shell-router)
[![CI](https://img.shields.io/github/actions/workflow/status/phcdevworks/spectre-shell-router/ci.yml?branch=main&label=CI)](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-router)](LICENSE)
[![Node](https://img.shields.io/node/v/@phcdevworks/spectre-shell-router)](https://nodejs.org)

Minimal browser router for Spectre applications. It maps URL paths to lazy page modules, renders into a root element, and keeps navigation behavior framework-agnostic.

Part of the [PHCDevworks Spectre shell ecosystem](https://github.com/phcdevworks) — composable, zero-dependency packages for client-side shell applications.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Roadmap](ROADMAP.md) | [Security Policy](SECURITY.md)

## When to use this package

- You need a framework-agnostic client-side router with zero runtime dependencies
- You want `:param` URL matching, query string access, and lazy page loading via dynamic `import()`
- You want a clean `render` / `destroy` lifecycle with race-condition safety built in
- You need history or hash-based routing with optional navigation guards and scroll restoration
- You are building on top of a Spectre shell or a similar minimal shell pattern

## When not to use this package

- You need a framework-integrated router (React Router, Vue Router, TanStack Router, etc.)
- You need server-side rendering or file-based routing
- You need application state management, persistent layouts, or design tokens

## Capabilities

- Route matching with `:param` path segments.
- Lazy page loading through route `loader` functions.
- Browser History API integration for programmatic navigation and link interception.
- Optional hash-based routing mode.
- Route guards with cancellation and redirect support.
- Scroll restoration for push and browser back/forward navigation.
- Query string access through `URLSearchParams`.
- Page cleanup through optional `destroy` hooks.
- Named routes with `router.href()` for safe path generation.
- Per-route `meta` and an `afterNavigate` hook for titles and a11y focus management.
- `onNavigationStart` / `onNavigationEnd` hooks for loading state.
- `router.subscribe()` for reactive route state at the app layer.

## Requirements

- Node.js `^22.12.0 || >=24.0.0`

## Install

```bash
npm install @phcdevworks/spectre-shell-router
```

## Quick Start

```ts
import { Router, type Route } from '@phcdevworks/spectre-shell-router'

const routes: Route[] = [
  {
    path: '/',
    loader: async () => ({
      render({ root }) {
        root.textContent = 'Home'
      },
    }),
  },
  {
    path: '/docs/:slug',
    loader: async () => ({
      render({ params, query, root }) {
        root.textContent = `Doc: ${params.slug}; tab=${query.get('tab') ?? 'intro'}`
      },
    }),
  },
]

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Missing #app root element.')
}

const router = new Router(routes, root)
router.navigate('/docs/getting-started?tab=api')

// Clean up when the shell unmounts (SPA teardown, hot reload, etc.)
// router.destroy()
```

## API

### Types

```ts
type Route = {
  path: string
  name?: string // optional; enables router.href() lookup
  meta?: Record<string, unknown> // optional; available on RouteContext.meta
  loader: () => Promise<PageModule>
}

type NavigationContext = {
  from: string | null
  to: string
}

type RouterOptions = {
  mode?: 'history' | 'hash'
  scrollRestoration?: boolean
  beforeNavigate?: (
    context: NavigationContext,
    next: (redirect?: string) => void
  ) => void | Promise<void>
  onNavigationStart?: (context: NavigationContext) => void
  onNavigationEnd?: (context: NavigationContext) => void
  afterNavigate?: (context: RouteContext) => void
}

type PageModule = {
  render: (ctx: RouteContext) => void
  destroy?: () => void
}

type RouteContext = {
  path: string
  params: Record<string, string>
  query: URLSearchParams
  root: HTMLElement
  meta?: Record<string, unknown>
}

type Unsubscribe = () => void
```

### Router class

```ts
class Router {
  constructor(routes: Route[], root: HTMLElement, options?: RouterOptions)

  // Push a new path onto history and navigate to it.
  navigate(path: string): void

  // Build a path string from a named route and optional params.
  // Throws if the name is unknown or a required :param segment has no matching key.
  href(name: string, params?: Record<string, string>): string

  // Subscribe to completed navigations. Fires with the current RouteContext
  // after every render. Returns an unsubscribe function.
  subscribe(callback: (context: RouteContext) => void): Unsubscribe

  // Remove all event listeners, call destroy() on the current page, and release the root reference.
  destroy(): void
}
```

**`router.href()` examples:**

```ts
// Static route
const routes: Route[] = [
  { name: 'home', path: '/', loader: ... },
  { name: 'user', path: '/users/:id', loader: ... },
]
const router = new Router(routes, root)

router.href('home')              // '/'
router.href('user', { id: '42' })  // '/users/42'
```

**Router options examples:**

```ts
const router = new Router(routes, root, {
  mode: 'hash',
  scrollRestoration: true,
  beforeNavigate({ to }, next) {
    if (to === '/admin' && !sessionStorage.getItem('isAdmin')) {
      next('/login')
      return
    }

    next()
  },
})
```

### Ecosystem integration patterns

**Document titles and a11y focus with `meta` + `afterNavigate`:**

```ts
const routes: Route[] = [
  {
    path: '/',
    meta: { title: 'Home' },
    loader: async () => ({
      render({ root }) {
        root.textContent = 'Home'
      },
    }),
  },
  {
    path: '/docs/:slug',
    meta: { title: 'Docs' },
    loader: async () => ({
      render({ params, root }) {
        root.textContent = `Doc: ${params.slug}`
      },
    }),
  },
]

const router = new Router(routes, root, {
  afterNavigate(context) {
    if (context.meta?.title) {
      document.title = `${context.meta.title} — My App`
    }

    // a11y: move focus to the root after each navigation so screen readers
    // announce the new page.
    context.root.setAttribute('tabindex', '-1')
    context.root.focus()
  },
})
```

**Loading state with `onNavigationStart` / `onNavigationEnd`:**

```ts
let navigating = false

const router = new Router(routes, root, {
  onNavigationStart() {
    navigating = true
    // e.g. show a loading indicator
  },
  onNavigationEnd() {
    navigating = false
    // e.g. hide a loading indicator
  },
})
```

At the app layer, `spectre-shell-signals` can wrap these two callbacks to expose a
reactive `navigating$` signal that `spectre-ui` loading indicators subscribe to.

**Reactive route state with `router.subscribe()`:**

```ts
import { signal } from '@phcdevworks/spectre-shell-signals'

const currentRoute = signal<RouteContext | null>(null)

const unsubscribe = router.subscribe((context) => {
  currentRoute.set(context)
})

// Later, when the shell unmounts:
// unsubscribe()
```

`router.subscribe()` is the canonical bridge between the router and
`spectre-shell-signals` — wrap it once at the app layer to get a reactive
`currentRoute` signal that any component can read from.

### Behavior

- `destroy()` on the current page is always called before the next `render()` runs.
- If a `loader` throws, the root is cleared and the navigation is silently abandoned.
- If a faster navigation supersedes a pending one, the stale result is discarded (race-safe via monotonic counter).
- If no route matches, the root is cleared and `destroy()` is called on the current page.
- If `beforeNavigate` does not call `next()`, navigation is cancelled and the URL reverts to the current route.
- If `beforeNavigate` calls `next('/path')`, the router redirects to that path.
- Same-domain `<a>` clicks are intercepted automatically; modified clicks (ctrl, meta, shift, alt) and external links pass through.
- In hash mode, router paths are stored after `#/` and `router.href()` returns hash-prefixed URLs.

## Boundaries

This package owns client-side routing only. It does not own application bootstrapping, reactive state, persistence, layouts, design tokens, or server routing.

## Development

```bash
npm install
npm run check
```

Useful scripts:

- `npm run typecheck` validates TypeScript without emitting files.
- `npm run lint` runs ESLint.
- `npm test -- --run` runs the Vitest suite once.
- `npm run build` emits declarations and JavaScript to `dist`.
- `npm run check` runs the full verification gate (typecheck + lint + build + test + check:ecosystem).

AI-agent coordination starts in [AGENTS.md](./AGENTS.md), with companion
guidance in [CLAUDE.md](./CLAUDE.md), [CODEX.md](./CODEX.md),
[COPILOT.md](./COPILOT.md), [JULES.md](./JULES.md), and
[.github/copilot-instructions.md](./.github/copilot-instructions.md).

### Troubleshooting

| Problem                            | Likely cause                                                        | Fix                                                              |
| ---------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `npm run check` fails on typecheck | Type error in source or tests                                       | Run `npm run typecheck` to isolate the error                     |
| Tests fail in CI but pass locally  | Node version mismatch                                               | CI runs Node 22 and 24; match your local version                 |
| `dist/` is missing after clone     | Build output is gitignored                                          | Run `npm run build`                                              |
| Link clicks are not intercepted    | Link is cross-origin, has `target`, `download`, or `rel="external"` | Expected behavior — only same-domain plain links are intercepted |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `npm run check` — all of typecheck, lint, build, tests, and `check:ecosystem` must pass before opening a pull request.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
