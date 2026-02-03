# Spectre Shell Router

A minimal, framework-agnostic client-side router designed to support the Spectre platform's vanilla TypeScript app shell.

## What is This?

**Spectre Shell Router** is **not a full routing framework**. It intentionally solves only one problem:

> **Mapping URLs to page modules and managing page lifecycle in a vanilla web app.**

## Design Goals

- Extremely small surface area
- No framework assumptions (React, Svelte, etc.)
- No reactivity model or templating system
- No data loading or side effects
- Easy to delete or replace later

## What It Does

✅ Maps URL paths to async page module loaders  
✅ Supports path parameters (e.g. `/users/:id`)  
✅ Uses the browser History API (`pushState`, `popstate`)  
✅ Loads pages dynamically via `import()`  
✅ Calls a page's `render(ctx)` function on navigation  
✅ Calls an optional `destroy()` function when leaving a page

## What It Does NOT Do

❌ No nested routing  
❌ No layouts  
❌ No guards or middleware  
❌ No data fetching  
❌ No global state  
❌ No SSR  
❌ No transitions or animations  
❌ No framework lifecycle integration

## Page Contract

Each page module must export:

```typescript
export function render(ctx: RouteContext): void
export function destroy?(): void  // optional
```

Where `RouteContext` contains:

- `path` – the matched URL path
- `params` – route parameters
- `query` – URLSearchParams
- `root` – the DOM element where the page should render

## Example Usage

```typescript
// Define routes
const routes = [
  { path: '/', loader: () => import('./pages/home') },
  { path: '/users/:id', loader: () => import('./pages/user') },
  { path: '/about', loader: () => import('./pages/about') },
]

// Initialize router
const router = new Router(routes, document.getElementById('app'))

// Navigate programmatically
router.navigate('/users/123')
```

Example page module:

```typescript
// pages/user.ts
export function render(ctx: RouteContext) {
  const userId = ctx.params.id
  ctx.root.innerHTML = `<h1>User ${userId}</h1>`
}

export function destroy() {
  // Optional cleanup
  console.log('Leaving user page')
}
```

## Intended Usage

Spectre Shell Router is consumed by **Spectre Shell**, which provides:

- Application layout
- Theming
- Component registration
- Error handling
- Auth boundaries

The router exists solely to make pages real in a framework-free environment.

## Architectural Position

- Part of the Spectre platform
- Sits below any app framework
- Disposable by design if a framework router is adopted later
- Exists to define a navigation and page lifecycle contract, not to compete with existing routers

## Philosophy

**Routing should be boring, small, explicit, and replaceable.**

## Installation

```bash
npm install spectre-shell-router
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Run tests (if available)
npm test
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
