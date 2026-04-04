# @phcdevworks/spectre-shell-router

[![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-shell-router)](https://github.com/phcdevworks/spectre-shell-router/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/phcdevworks/spectre-shell-router)](https://github.com/phcdevworks/spectre-shell-router/pulls)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-shell-router)](LICENSE)

`@phcdevworks/spectre-shell-router` is a minimal, framework-agnostic
client-side router for Spectre-based applications.

Maintained by PHCDevworks as part of the Spectre platform, it handles URL
matching, navigation, route params, query parsing, and browser history
integration. It provides resolved route state to consuming shell logic while
remaining responsible only for routing. It does not own sensory behavior,
signals, rendering, or application orchestration.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Security Policy](SECURITY.md)

## Key capabilities

- URL and path matching for client-side routes
- Route parameter extraction from path patterns
- Query string parsing via standard browser APIs
- Programmatic navigation through router helpers
- Browser history integration using the native History API
- Resolved route state for consuming shell logic
- Lightweight, framework-agnostic routing contract

## Installation

```bash
npm install @phcdevworks/spectre-shell-router
```

## Quick start

Define a route table, create the router, and let route modules receive resolved
route state through the routing contract. The router resolves the URL and hands
the matched context to your module; how that module updates the DOM stays
outside the router's responsibility.

```ts
import { Router, type Route, type RouteContext } from '@phcdevworks/spectre-shell-router'

const routes: Route[] = [
  {
    path: '/',
    loader: async () => import('./pages/home')
  },
  {
    path: '/users/:id',
    loader: async () => import('./pages/user-detail')
  }
]

const root = document.getElementById('app')

if (!root) {
  throw new Error('Missing application root element')
}

const router = new Router(routes, root)

router.navigate('/users/42?tab=profile')

// pages/user-detail.ts
export function render(ctx: RouteContext) {
  const userId = ctx.params.id
  const tab = ctx.query.get('tab')

  ctx.root.textContent = `User ${userId} (${tab ?? 'overview'})`
}

export function destroy() {
  // Optional cleanup before the next route renders.
}
```

Depending on how your shell is structured, consuming logic can use the resolved
route context passed to `render(ctx)` as current routing state.

## What this package owns

- Client-side routing behavior
- Route matching and resolution
- Path params and query extraction
- Navigation and history coordination
- Stable routing contract for shell consumers

## What this package does not own

- Rendering or view components
- Framework adapters for UI delivery
- Signals or application state systems
- Data fetching
- Application business logic
- Shell orchestration outside routing concerns

## Package exports / API surface

The root package exposes a small routing surface intended to stay easy to
understand and easy to replace.

- Route definitions
- Router instance for navigation and history coordination
- Route context and page module types
- URL matching, params extraction, and query access

In the current package shape, that surface includes the router class and core
TypeScript types used to describe routes, page modules, and route context.

## Package boundary

`@phcdevworks/spectre-shell-router` stays intentionally narrow:

- it resolves URLs into route modules
- it extracts params and query values
- it coordinates navigation through the browser History API
- it passes resolved routing context into the matched module

Rendering, state management, data loading, styling, animation, and shell
orchestration stay outside this package.

## Development

Install dependencies, then run the package checks:

```bash
npm run build
npm test
```

Key source areas:

- `src/` for router implementation and package exports
- `tests/` for routing and navigation coverage

## Contributing

PHCDevworks maintains this package as part of the Spectre suite.

When contributing:

- keep the routing surface minimal
- preserve framework-agnostic behavior
- keep responsibility boundaries explicit
- run `npm run build` and `npm test` before opening a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## License

MIT © PHCDevworks. See [LICENSE](LICENSE).
