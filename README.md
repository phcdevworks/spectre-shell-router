# @phcdevworks/spectre-shell-router

A minimal, framework-agnostic client-side router for vanilla TypeScript apps. Designed to support the Spectre platform's app shell with simple URL-to-page mapping and lifecycle management.

🤝 **[Contributing Guide](CONTRIBUTING.md)** | 📝 **[Changelog](CHANGELOG.md)**

## Overview

`@phcdevworks/spectre-shell-router` is **not a full routing framework**. It intentionally solves one problem: mapping URLs to page modules and managing page lifecycle in a vanilla web app.

- ✅ Maps URL paths to async page module loaders
- ✅ Supports path parameters (e.g., `/users/:id`)
- ✅ Uses the browser History API (`pushState`, `popstate`)
- ✅ Loads pages dynamically via `import()`
- ✅ Calls page `render(ctx)` and optional `destroy()` lifecycle hooks
- ✅ Minimal surface area—easy to delete or replace

## Installation

```bash
npm install @phcdevworks/spectre-shell-router
```

## Usage

### 1. Define Your Routes

```typescript
import { Router } from '@phcdevworks/spectre-shell-router'

const routes = [
  { path: '/', loader: () => import('./pages/home') },
  { path: '/users/:id', loader: () => import('./pages/user') },
  { path: '/about', loader: () => import('./pages/about') },
]

const router = new Router(routes, document.getElementById('app'))
```

### 2. Create Page Modules

Each page module must export a `render` function:

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

### 3. Navigate

```typescript
// Programmatic navigation
router.navigate('/users/123')

// Or use standard links with History API interception
<a href="/about">About</a>
```

## Page Contract

Each page module must export:

```typescript
export function render(ctx: RouteContext): void
export function destroy?(): void  // optional
```

Where `RouteContext` contains:

- `path` – the matched URL path
- `params` – route parameters (e.g., `{ id: '123' }`)
- `query` – URLSearchParams object
- `root` – the DOM element where the page should render

## What It Does

✅ Maps URL paths to page loaders  
✅ Path parameter extraction (`/users/:id`)  
✅ History API integration  
✅ Dynamic page imports  
✅ Lifecycle hooks (`render`, `destroy`)

## What It Does NOT Do

❌ No nested routing  
❌ No layouts or middleware  
❌ No guards or data fetching  
❌ No global state management  
❌ No SSR or hydration  
❌ No transitions or animations  
❌ No framework lifecycle integration

## Development Philosophy

This router follows a **minimal by design** approach:

### 1. Core Routing

**Purpose**: Map URLs to pages and manage lifecycle

**Rules**:

- Keep the API surface minimal and predictable
- No framework dependencies or assumptions
- Router only maps paths and manages lifecycle
- TypeScript strict mode with proper type exports

### 2. Page Contract

**Purpose**: Simple interface for pages to integrate

**Contains**:

- `render(ctx)` - Required page entry point
- `destroy()` - Optional cleanup handler
- `RouteContext` - Type-safe context object

**Rules**:

- Pages handle their own rendering
- No magic or hidden behavior
- Clear separation of concerns

### Golden Rule (Non-Negotiable)

**Routing should be boring, small, explicit, and replaceable.**

This router exists to define a navigation and page lifecycle contract, not to compete with full-featured frameworks.

## Design Principles

1. **Minimal surface area** - Only essential routing features
2. **Framework-agnostic** - Works with any rendering approach
3. **Type-safe** - Full TypeScript support with proper exports
4. **Disposable by design** - Easy to replace if a framework is adopted later
5. **Production-ready** - Simple, tested, and reliable

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import type { Router, RouteContext, Route } from '@phcdevworks/spectre-shell-router'
```

## Part of the Spectre Suite

- **Spectre Tokens** - Design token foundation
- **Spectre UI** - Core styling layer
- **Spectre Shell Router** - Client-side routing (this package)
- **Spectre Shell** - Application shell framework
- **Spectre Blocks** - WordPress block library
- **Spectre Astro** - Astro integration

## Contributing

Issues and pull requests are welcome. For detailed contribution guidelines, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## License

MIT © PHCDevworks — See **[LICENSE](LICENSE)** for details.

---

## ❤️ Support Spectre

If Spectre Shell Router helps your workflow, consider sponsoring:

- [GitHub Sponsors](https://github.com/sponsors/phcdevworks)
- [Buy Me a Coffee](https://buymeacoffee.com/phcdevworks)
