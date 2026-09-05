# @phcdevworks/spectre-shell-router

`@phcdevworks/spectre-shell-router` is the client-side router package of the
Spectre system. It maps URL paths to lazy page modules, renders into a root
element, and keeps navigation behavior framework-agnostic for Spectre-based
applications.

Maintained by [PHCDevworks](https://go.phcdev.co). It is an independent peer
package with zero runtime dependencies, deliberately separate from
`spectre-shell-signals`, and is consumed by `spectre-shell` (which composes
it) and `spectre-init` (which scaffolds new apps against it).

## Repository Snapshot

| Field                  | Value                               |
| ---------------------- | ----------------------------------- |
| Project team           | `project-shell`                     |
| Repository role        | Spectre client-side router          |
| Package/artifact       | `@phcdevworks/spectre-shell-router` |
| Current version/status | 1.4.1                               |

## Standard Workflow

1. Read [AGENTS.md](AGENTS.md), then the agent-specific guide for the task.
2. Check [TODO.md](TODO.md) and [ROADMAP.md](ROADMAP.md) for current scope.
3. Make the smallest repo-local change that satisfies the task.
4. Run `npm run check` before marking any change complete.
5. Update docs and [CHANGELOG.md](CHANGELOG.md) only when behavior, public
   contracts, or release-relevant metadata changed.

## Documentation Map

| Guide       | Path                         |
| ----------- | ---------------------------- |
| Agent rules | [AGENTS.md](AGENTS.md)       |
| Claude Code | [CLAUDE.md](CLAUDE.md)       |
| Codex       | [CODEX.md](CODEX.md)         |
| Copilot     | [COPILOT.md](COPILOT.md)     |
| Jules       | [JULES.md](JULES.md)         |
| Roadmap     | [ROADMAP.md](ROADMAP.md)     |
| Todo        | [TODO.md](TODO.md)           |
| Changelog   | [CHANGELOG.md](CHANGELOG.md) |
| Security    | [SECURITY.md](SECURITY.md)   |

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-shell-router.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-shell-router)
[![CI](https://img.shields.io/github/actions/workflow/status/phcdevworks/spectre-shell-router/ci.yml?branch=main&label=CI)](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-router)](LICENSE)
[![Node](https://img.shields.io/node/v/@phcdevworks/spectre-shell-router)](https://nodejs.org)

Minimal browser router for Spectre applications. It maps URL paths to lazy page modules, renders into a root element, and keeps navigation behavior framework-agnostic.

Part of the [PHCDevworks Spectre shell ecosystem](https://github.com/phcdevworks) — composable, zero-dependency packages for client-side shell applications.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Roadmap](ROADMAP.md) | [Security Policy](SECURITY.md)

## When To Use This Package

- You need a framework-agnostic client-side router with zero runtime dependencies
- You want `:param` URL matching, query string access, and lazy page loading via dynamic `import()`
- You want a clean `render` / `destroy` lifecycle with race-condition safety built in
- You need history or hash-based routing with optional navigation guards and scroll restoration
- You are building on top of a Spectre shell or a similar minimal shell pattern

## When Not To Use This Package

- You need a framework-integrated router (React Router, Vue Router, TanStack Router, etc.)
- You need server-side rendering or file-based routing
- You need application state management or design tokens

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
- `errorRoute` and `onError` for deterministic error handling instead of a silently cleared outlet.
- `router.back()`, `router.forward()`, and `router.replace()` navigation history helpers.
- Nested routing — a `routes` array on a `Route` renders child pages into a parent-declared
  `[data-router-outlet]` element, with the parent layout kept mounted across child navigations.

## Requirements

- Node.js `^22.12.0 || >=24.0.0`

## Installation

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
  loader: (signal: AbortSignal) => Promise<PageModule>
  routes?: Route[] // optional; nested child routes, paths relative to this route
}

type NavigationContext = {
  from: string | null
  to: string
}

type RouterOptions = {
  mode?: 'history' | 'hash'
  basePath?: string // optional; deploy under a URL prefix, e.g. '/portal'
  scrollRestoration?: boolean
  errorRoute?: string
  beforeNavigate?: (
    context: NavigationContext,
    next: (redirect?: string) => void
  ) => void | Promise<void>
  onNavigationStart?: (context: NavigationContext) => void
  onNavigationEnd?: (context: NavigationContext) => void
  afterNavigate?: (context: RouteContext) => void
  onError?: (error: unknown, context: NavigationContext) => void
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

  // Navigate to path without adding a new history entry (uses replaceState).
  replace(path: string): void

  // Thin wrappers around history.back() / history.forward().
  back(): void
  forward(): void

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

### Deploying under a base path

Pass `basePath` when an app is served under a URL prefix, such as behind a reverse proxy at
`/portal/`:

```ts
const router = new Router(routes, root, { basePath: '/portal' })
```

Routes are declared exactly as if the app were served from `/` — `basePath` is stripped before
matching and re-applied by `navigate()`, `replace()`, `href()`, and link interception:

```ts
// window.location.pathname === '/portal/users/42'
// matches the '/users/:id' route with params.id === '42'

router.navigate('/users/7')  // -> pushes '/portal/users/7'
router.href('user', { id: '7' })  // -> '/portal/users/7'
```

Clicks on `<a>` links whose `href` falls outside `basePath` are left alone (not intercepted), so
links to sibling apps hosted outside the prefix behave as normal browser navigations. `basePath`
only applies in `history` mode; in `hash` mode the routable path lives entirely in the URL hash
and is unaffected by the page's own base path.

### Cancellable loaders

`Route.loader` receives an `AbortSignal` as its first argument. When a navigation is superseded
by another one before its loader resolves, the router aborts that signal — use it to cancel
in-flight `fetch()` calls or otherwise bail out of expensive work that's no longer needed:

```ts
const routes: Route[] = [
  {
    path: '/report/:id',
    loader: async (signal) => {
      const data = await fetch('/api/reports', { signal }).then((r) => r.json())
      return {
        render({ root }) {
          root.textContent = data.title
        },
      }
    },
  },
]
```

A loader that ignores the signal still works — cancellation is opt-in. The signal is also
aborted on `router.destroy()`.

### Nested routing

A route can declare a `routes` array of child routes. Child `path` values are **relative** to
the parent — `''` matches the parent's own path (an index route), a plain segment like
`'profile'` matches `<parent>/profile`, and `:param` segments work the same as top-level routes.

The parent's page module renders a persistent layout and marks its mount point for children
with a `data-router-outlet` attribute on an element inside `ctx.root`. The router finds that
element after the parent renders and mounts the matching child page into it.

```ts
const routes: Route[] = [
  {
    path: '/app',
    loader: async () => ({
      render({ root }) {
        root.innerHTML = `
          <nav>...</nav>
          <main data-router-outlet></main>
        `
      },
    }),
    routes: [
      {
        path: '', // index route: /app
        loader: async () => ({
          render({ root }) {
            root.textContent = 'Dashboard'
          },
        }),
      },
      {
        path: 'profile', // /app/profile
        loader: async () => ({
          render({ root }) {
            root.textContent = 'Profile'
          },
        }),
      },
    ],
  },
]
```

Params from every level in the chain are merged into `ctx.params` for the matched child, and
`name` / `router.href()` work the same for nested routes — the generated path is the parent's
path joined with the child's.

Navigating between sibling children (`/app/profile` → `/app` in the example above) reuses the
already-rendered parent — its `render`/`destroy` hooks are not called again, so layout state
(scroll position inside the layout, open menus, etc.) survives the navigation. Only the matched
leaf page's `render`/`destroy` runs on every navigation, same as the non-nested case. Navigating
to a route outside the parent's subtree destroys the whole chain, deepest first.

If a route with children renders without a `[data-router-outlet]` element, the router treats it
as a navigation error: `onError` fires and, if configured, `errorRoute` handles it — the same
path used when a loader throws. The rendered parent is cleaned up through its `destroy()`
hook when the failed chain is removed.

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

**Deterministic error handling with `errorRoute` / `onError`:**

```ts
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
    path: '/error',
    loader: async () => ({
      render({ root }) {
        root.textContent = 'Something went wrong.'
      },
    }),
  },
]

const router = new Router(routes, root, {
  errorRoute: '/error',
  onError(error, context) {
    console.error(`Navigation to "${context.to}" failed:`, error)
  },
})
```

When a `loader` throws, path decoding fails, or no route matches, the router navigates to `errorRoute`
(via `replace()`, so the failing URL is not pushed onto history) instead of
silently clearing the outlet. `onError` fires first regardless of whether
`errorRoute` is configured, so apps can log or report errors without a redirect.
`errorRoute` must match an existing route path or the constructor throws.

**Navigation history helpers:**

```ts
router.replace('/login') // navigate without adding a history entry
router.back() // wraps history.back()
router.forward() // wraps history.forward()
```

### Behavior

- `destroy()` on the current page is always called before the next `render()` runs.
- If a `loader` throws: `onError` fires (if configured), then the router
  navigates to `errorRoute` if configured and the failing path is not already
  `errorRoute`; otherwise the root is cleared and the navigation is abandoned.
- If a path contains malformed percent encoding: `onError` receives the decoding error, then
  `errorRoute` handles it if configured; otherwise the current page is destroyed and the root is cleared.
- If a faster navigation supersedes a pending one, the stale result is discarded (race-safe via monotonic counter).
- If no route matches: `onError` fires (if configured), then the router
  navigates to `errorRoute` if configured and the unmatched path is not already
  `errorRoute`; otherwise the root is cleared and `destroy()` is called on the current page.
- If `beforeNavigate` does not call `next()`, navigation is cancelled and the full URL reverts to the current route, preserving its query string and fragment in both history and hash modes.
- If `beforeNavigate` calls `next('/path')`, the router redirects to that path.
- Same-domain `<a>` clicks are intercepted automatically; modified clicks (ctrl, meta, shift, alt) and external links pass through.
- In hash mode, router paths are stored after `#/` and `router.href()` returns hash-prefixed URLs.

## Boundaries

This package owns client-side routing only. It does not own application bootstrapping, reactive state, persistence, layout markup, design tokens, or server routing.

## Development

```bash
npm install
npm run check
```

Useful scripts:

- `npm run typecheck` validates source, tests, scripts, and TypeScript configuration files without emitting files.
- `npm run lint` runs ESLint.
- `npm test -- --run` runs the Vitest suite once.
- `npm run build` emits declarations and JavaScript to `dist`.
- `npm run check` runs the full verification gate (typecheck + lint + build + test + check:version-sync + check:ecosystem).

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

## AI And Automation Boundaries

Claude Code (`claude-sonnet-4-6`) is the primary development agent for this
repository. Codex handles releases, including cutting tagged releases and
GitHub Releases, and production stabilization. Jules handles small automated
fixes and dependency updates. GitHub Copilot provides development support.

Codex, Copilot, and Jules have commit, push, and tag authority and work directly
on `main`. Claude Code has no git access and hands validated changes to Codex
or Bradley Potts. Pull requests require an explicit exception from Bradley Potts. Publishing to npm
remains Bradley Potts's sole authority. See [AGENTS.md](AGENTS.md) for the
full commit-policy and release-authority grant.

**Protected from automated change:** the routing-only scope (no application
bootstrapping, reactive state, persistence, layout markup, or design tokens added
locally). See [AGENTS.md](AGENTS.md) for full agent governance and boundary
rules.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `npm run check` — all of typecheck, lint, build, tests, and `check:ecosystem` must pass before a change is complete.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
