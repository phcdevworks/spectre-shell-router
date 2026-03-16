# Spectre Agent Instructions: @phcdevworks/spectre-shell-router

### **The Sensory Layer (Layer 5 of the Spectre 8-Layer Arsenal)**

You are an autonomous agent responsible for Layer 5 of the Spectre 8-Layer Arsenal. This package is the **Sensory Layer**. Your mission is to provide minimal, framework-agnostic routing and lifecycle management for vanilla TypeScript applications.

## The Golden Rule of Routing
**Routing is a utility, not a framework.** You are strictly legacy-forbidden from defining UI styles, managing global application state (other than URL state), or inventing design tokens in this package. Your responsibility is to map URLs to page loaders and ensure the `render`/`destroy` contract is strictly followed.

## Core Directives
1. **Minimal Surface Area:** The `Router` class should remain lean. Avoid adding features like middleware, nested routes, or complex guards unless requested. If these are needed, they should be implemented as separate "Sensory" plugins.
2. **Lifecycle Enforcement:** You must guarantee that every page module's `destroy()` hook is called before a new `render()` hook is executed. This is the primary defense against memory leaks in vanilla apps.
3. **Async Loaders:** Favor dynamic `import()` for page loading. This ensures optimal bundle splitting and performance for Spectre-powered applications.
4. **Native History:** Use the native History API (`pushState`, `popstate`) for navigation. Do not use hash-based routing unless explicitly required for legacy compatibility.

## Implementation Guardrails
* **Zero Dependencies:** This package must remain dependency-free. It uses standard browser APIs and TypeScript.
* **Separation of Concerns:** The router manages navigation. It does not manage how pages render themselves; it simply calls the `render` hook and provides the context.
* **Type-Safe Context:** The `RouteContext` is the only interface between the router and the page. It must remain strictly typed and exported.

## Testing & Validation Strategy
1. **URL Mapping:** Verify that specific URL patterns correctly map to the corresponding module loaders.
2. **Parameter Extraction:** Test that path parameters (e.g., `:id`) are correctly extracted and passed to the `RouteContext`.
3. **Lifecycle Sequentiality:** Assert that `destroy` always precedes `render` during navigation transitions.
4. **History Integration:** Verify that browser back/forward buttons correctly trigger re-rendering of the appropriate routes.

## Workflow
1. **Reference Sync:** Ensure compatibility with Layer 4 (`@phcdevworks/spectre-shell`) as it is the primary consumer of this router.
2. **Modify Logic:** Update `src/router.ts` or related utility functions.
3. **Verify Types:** Ensure `Route`, `RouteContext`, and `Router` types are exported and correct.
4. **Run Build & Test:** Execute `npm run build` and `npm test` to verify logic and artifacts.
