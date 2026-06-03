# JULES.md - spectre-shell-router

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-shell-router`. Jules handles small, bounded maintenance
that keeps the router package healthy without taking over implementation or
release ownership.

Claude Code remains the lead implementation agent. Codex owns documentation,
release readiness, production stabilization, repo hygiene, and config
standardization. Bradley Potts remains the final release and merge authority.

## Allowed Maintenance

- Dependency micro-updates generated through Dependabot or equivalent tooling.
- Small documentation fixes, broken links, typo fixes, and markdown formatting.
- Mechanical config cleanup that preserves existing behavior.
- Minor package metadata hygiene that keeps the zero-dependency runtime intact.

## Boundaries

Jules must not change route matching, navigation, lifecycle behavior, race
protection, exported types, or public API. This package must remain routing-only
and must not gain runtime dependencies.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. Jules PRs must also state which maintenance
category was executed: dependency update, config fix, or documentation fix.

## Commit Authority

Jules commits and pushes autonomously when validation is clean. Jules must not:

- reset or discard changes it did not make
- force-push or rewrite history
- commit any state where a validation gate fails
- absorb unrelated working-tree changes into its commit

### Commit message format

- Dependency update: `chore(spectre-shell-router): bump <package> to <version>`
- Config fix: `chore(spectre-shell-router): <description of fix>`
- Doc fix: `docs(spectre-shell-router): <description of fix>`

## Validation

Before committing or pushing an allowed maintenance change, run:

```bash
npm run check
```

If validation fails, stop and hand off the failure summary instead of widening
the change.
