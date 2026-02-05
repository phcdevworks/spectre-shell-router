# Contributing to Spectre Shell Router

Thanks for helping improve Spectre Shell Router! This package is a minimal, framework-agnostic client-side router for vanilla TypeScript apps.

## Development Philosophy

This router follows a **minimal by design** approach:

### 1. Core Routing

**Purpose**: Single source of truth for URL mapping and page lifecycle

**Exports**: Type-safe routing functions and interfaces

**Rules**:

- Keep the API surface minimal and predictable
- No framework dependencies or assumptions
- Router only maps paths and manages lifecycle
- All source files must be TypeScript with strict types

**Status**: v0.0.1 initial release with path matching and lifecycle hooks

### 2. Page Contract

**Purpose**: Simple interface for pages to integrate with the router

**Ships**:

- `render(ctx)` (required page entry point)
- `destroy()` (optional cleanup handler)
- `RouteContext` interface with path, params, query, root

**Rules**:

- Keep page contract minimal and well-documented
- No magic or hidden behavior
- Use TypeScript for type safety
- Pages handle their own rendering

**Status**: Basic structure ready for customization

### 3. Build Configuration

**Purpose**: Compile TypeScript to JavaScript with proper types

**Key mechanism**:

- TypeScript compiler generates declarations
- Vitest for testing with jsdom
- ES modules only (no CommonJS)

**Rules**:

- All source code must compile cleanly
- Follow TypeScript strict mode
- Export types alongside runtime code

**Status**: Basic build pipeline ready

### Golden Rule (Non-Negotiable)

**TypeScript compiles. Tests pass. Types ship.**

The router ships compiled JavaScript + type declarations from `dist/`.

- If it's configuration → belongs in `tsconfig.json` or `vitest.config.ts`
- If it's source code → belongs in `src/`
- If it's tests → belongs in `tests/`

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

3. Build the package (compiles TypeScript):

```bash
npm run build
# or for testing with watch mode:
npm run test
```

## Project Structure

```
spectre-shell-router/
├── src/
│   └── index.ts          # Router implementation
├── tests/
│   └── router.test.ts    # Vitest test suite
├── dist/                 # Built assets (generated)
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Vitest configuration
└── package.json
```

**Responsibilities**:

- **Router developers**: Edit `src/` source files
- **Test writers**: Update `tests/` test suite
- **Config maintainers**: Update TypeScript and Vitest configs
- **Build engineers**: Update build pipeline when structure changes

## Contribution Guidelines

### Router Development

1. **Keep it minimal** – This router intentionally has a small surface area
2. **Type everything** – Use TypeScript strict mode, avoid `any`
3. **Document constraints** – Router does NOT do nested routing, layouts, or data loading
4. **Test your changes** – Run `npm test` before committing

### Source File Development

- Use TypeScript for type safety
- Follow modern ES module patterns
- Add comments for complex logic
- Export types alongside runtime code
- Test in Vitest with jsdom

### Configuration Changes

- Follow TypeScript best practices
- Keep configuration minimal
- Document changes in commit messages
- Test that build still works

### Code Quality

- Use modern TypeScript + ES modules
- Run `npm run build` before committing
- Run `npm test` to ensure all tests pass
- Keep the API surface minimal
- Add comments for complex logic

### Documentation

- Update README.md when adding features
- Include code examples for new features
- Document breaking changes in commit messages
- Keep inline comments clear and concise

## Pull Request Process

1. **Branch from `main`**
2. **Make your changes** and test locally (`npm run build` and `npm test`)
3. **Run build** to ensure compilation works (`npm run build`)
4. **Update documentation** (README.md, comments) to reflect changes
5. **Open a PR** describing:
   - The motivation for the change
   - What was changed
   - Testing notes (test coverage, edge cases)
6. **Respond to feedback** and make requested changes

## Known Gaps (Not Done Yet)

- Hash-based routing (`#/path`)
- Nested routing support
- Route guards/middleware
- Named routes
- Programmatic navigation helpers
- Scroll position restoration
- Meta tag management

## Questions or Issues?

Please open an issue or discussion on GitHub if you're unsure about the best approach for a change. Coordinating early avoids conflicts with:

- Router design philosophy (minimal by design)
- API surface area
- TypeScript type safety

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

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
