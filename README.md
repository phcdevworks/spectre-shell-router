# @phcdevworks/spectre-shell-router

[![CI](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml/badge.svg)](https://github.com/phcdevworks/spectre-shell-router/actions/workflows/ci.yml)

Minimal browser router for Spectre applications. It maps URL paths to lazy page modules, renders into a root element, and keeps navigation behavior framework-agnostic.

[Issues](https://github.com/phcdevworks/spectre-shell-router/issues) | [Pull requests](https://github.com/phcdevworks/spectre-shell-router/pulls) | [Security](./SECURITY.md) | [Contributing](./CONTRIBUTING.md)

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
```

## API

- `Router` manages navigation, route matching, rendering, and cleanup.
- `Route` defines a `path` and async `loader`.
- `PageModule` defines `render(ctx)` and optional `destroy()`.
- `RouteContext` provides `path`, `params`, `query`, and `root`.

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
- `npm run check` runs the standard package verification flow.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
