# Contributing to Spectre Shell Router

Thanks for helping improve Spectre Shell Router!

## About This Project

**Spectre Shell Router** is a minimal, framework-agnostic client-side router designed to support the Spectre platform's vanilla TypeScript app shell.

It is **not a full routing framework**. It intentionally solves only one problem: **mapping URLs to page modules and managing page lifecycle in a vanilla web app.**

### What it does

- Maps URL paths to async page module loaders
- Supports path parameters (e.g. `/users/:id`)
- Uses the browser History API (`pushState`, `popstate`)
- Loads pages dynamically via `import()`
- Calls a page's `render(ctx)` function on navigation
- Calls an optional `destroy()` function when leaving a page

### What it does NOT do

- No nested routing
- No layouts or middleware
- No data fetching or side effects
- No global state or SSR
- No transitions, animations, or framework integration

### Philosophy

**Routing should be boring, small, explicit, and replaceable.**

This router exists to define a navigation and page lifecycle contract, not to compete with full-featured routers.

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/phcdevworks/spectre-shell-router.git
cd spectre-shell-router
```

2. Install dependencies:

```bash
npm install
```

3. Build and develop:

```bash
npm run build
# or for development:
npm run dev
```

## Contribution Guidelines

### Code Standards

- **Keep it minimal** - This router intentionally has a small surface area
- Use TypeScript for type safety
- Follow modern ES module patterns
- Add comments for complex logic
- Use proper types, avoid `any` when possible
- Follow the existing code style

### Page Contract

Pages must export:

```typescript
export function render(ctx: RouteContext): void
export function destroy?(): void  // optional
```

Where `RouteContext` contains:

- `path` – the matched URL path
- `params` – route parameters
- `query` – URLSearchParams
- `root` – the DOM element where the page should render

### Design Constraints

This router is intentionally limited:

- No reactivity model or templating
- No nested routing or layouts
- No guards, middleware, or data loading
- Easy to delete or replace if a framework is adopted later

### Code Quality

- Use modern TypeScript + ES modules
- Run linting with `npm run lint` (if available)
- Add comments for complex logic
- Run `npm run build` before committing
- Test your changes thoroughly
- Keep the API surface minimal

### Documentation

- Update README.md when adding features
- Include code examples for new features
- Document breaking changes in commit messages
- Keep inline comments clear and concise

## Pull Request Process

1. **Branch from `main`**
2. **Make your changes** and test locally
3. **Run build** to ensure compilation works (`npm run build`)
4. **Update documentation** (README.md, comments) to reflect changes
5. **Open a PR** describing:
   - The motivation for the change
   - What was changed
   - Testing notes
6. **Respond to feedback** and make requested changes

## Questions or Issues?

Please open an issue or discussion on GitHub if you're unsure about the best approach for a change.

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
