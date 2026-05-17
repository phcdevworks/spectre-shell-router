# @phcdevworks/spectre-shell-router

[![CI](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml/badge.svg)](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-shell-router.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-shell-router)

Minimal browser router for Spectre applications. It maps URL paths to lazy page modules, renders into a root element, and keeps navigation behavior framework-agnostic.

Part of the [PHCDevworks Spectre shell ecosystem](https://github.com/phcdevworks) — composable, zero-dependency packages for client-side shell applications.

[Issues](https://github.com/phcdevworks/spectre-shell-router/issues) | [Pull requests](https://github.com/phcdevworks/spectre-shell-router/pulls) | [Security](./SECURITY.md) | [Contributing](./CONTRIBUTING.md)

## When to use this package

- You need a framework-agnostic client-side router with zero runtime dependencies
- You want `:param` URL matching, query string access, and lazy page loading via dynamic `import()`
- You want a clean `render` / `destroy` lifecycle with race-condition safety built in
- You are building on top of a Spectre shell or a similar minimal shell pattern

## When not to use this package

- You need a framework-integrated router (React Router, Vue Router, TanStack Router, etc.)
- You need server-side rendering or file-based routing
- You need hash-based routing — planned, not yet available; see [ROADMAP.md](./ROADMAP.md)
- You need application state management, persistent layouts, or design tokens

## Capabilities

- Route matching with `:param` path segments.
- Lazy page loading through route `loader` functions.
- Browser History API integration for programmatic navigation and link interception.
- Query string access through `URLSearchParams`.
- Page cleanup through optional `destroy` hooks.

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
  loader: () => Promise<PageModule>
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
}
```

### Router class

```ts
class Router {
  constructor(routes: Route[], root: HTMLElement)

  // Push a new path onto history and navigate to it.
  navigate(path: string): void

  // Remove all event listeners, call destroy() on the current page, and release the root reference.
  destroy(): void
}
```

### Behavior

- `destroy()` on the current page is always called before the next `render()` runs.
- If a `loader` throws, the root is cleared and the navigation is silently abandoned.
- If a faster navigation supersedes a pending one, the stale result is discarded (race-safe via monotonic counter).
- If no route matches, the root is cleared and `destroy()` is called on the current page.
- Same-domain `<a>` clicks are intercepted automatically; modified clicks (ctrl, meta, shift, alt) and external links pass through.

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
- `npm run check` runs the full verification gate (typecheck + lint + build + test).

### Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `npm run check` fails on typecheck | Type error in source or tests | Run `npm run typecheck` to isolate the error |
| Tests fail in CI but pass locally | Node version mismatch | CI runs Node 22 and 24; match your local version |
| `dist/` is missing after clone | Build output is gitignored | Run `npm run build` |
| Link clicks are not intercepted | Link is cross-origin, has `target`, `download`, or `rel="external"` | Expected behavior — only same-domain plain links are intercepted |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `npm run check` — all of typecheck, lint, build, and tests must pass before opening a pull request.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
