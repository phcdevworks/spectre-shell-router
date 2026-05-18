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

## Validation

Before committing or pushing an allowed maintenance change, run:

```bash
npm run check
```

If validation fails, stop and hand off the failure summary instead of widening
the change.
