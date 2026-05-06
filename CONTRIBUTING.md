# Contributing

Thanks for helping improve `@phcdevworks/spectre-shell-router`. This package owns browser routing primitives, so changes should keep navigation behavior small, deterministic, and framework-agnostic.

## Workflow

1. Install dependencies with `npm install`.
2. Make the smallest focused change that solves the problem.
3. Update README or changelog notes when public behavior changes.
4. Run `npm run check` before opening a pull request.

## Project Standards

- Keep config files in TypeScript when the tool supports it.
- Keep route matching and navigation semantics explicit.
- Preserve cleanup behavior for replaced or destroyed pages.
- Add or update tests for route matching, link interception, history behavior, and failure paths.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
npm test -- --run
npm run check
```

## Pull Requests

Describe the routing behavior changed, call out compatibility risks, and include the commands you ran.
