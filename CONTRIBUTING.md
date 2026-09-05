# Contributing

Thanks for helping improve `@phcdevworks/spectre-shell-router`. This package owns browser routing primitives, so changes should keep navigation behavior small, deterministic, and framework-agnostic.

## Workflow

1. Install dependencies with `npm install`.
2. Make the smallest focused change that solves the problem.
3. Update README or changelog notes when public behavior changes.
4. Run `npm run check` before marking the change complete.
5. Follow [AGENTS.md](AGENTS.md): git-authorized agents commit and push directly
   to `main`; Claude Code hands validated changes to Codex or Bradley Potts.

## Project Standards

- Keep config files in TypeScript when the tool supports it.
- Keep route matching and navigation semantics explicit.
- Preserve cleanup behavior for replaced or destroyed pages.
- Add or update tests for route matching, link interception, history behavior, and failure paths.

## Checks

```bash
npm run check         # Full gate — run before completing a change
npm run typecheck     # Source, tests, scripts, and TypeScript configs
npm run lint          # ESLint only
npm run build         # Build only
npm test -- --run     # Tests only
```

## Release Proposals

Run `npm run release:propose` to inspect the next version without changing files.
The unreleased changelog section must declare `Contract change type: additive`,
`semantic change`, or `breaking`. Breaking changes default to major; the other
classifications default to minor.

For a bug fix that restores the existing contract, include `Release impact: patch`
alongside `Contract change type: semantic change`. Explicit `minor` and `major`
impacts are also supported. Additive changes cannot select patch, and breaking
changes must select major.

## Pull Requests

Pull requests and other branches require an explicit exception from Bradley Potts.
For an explicitly requested PR, describe the routing behavior changed, call out compatibility risks, and include the commands you ran. Populate all sections of the PR template.

## Code of Conduct

By participating in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
