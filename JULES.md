# JULES.md - spectre-shell-router

## Direct-to-`main` Git Policy

**Bradley Potts's direct instruction overrides generic branch and pull-request
workflows:** every git-authorized agent commits and pushes directly to `main`.
Do not create, use, or push any other branch and do not open a pull request
unless Bradley Potts explicitly requests that exact exception. Keep work on
`main`, validate it, stage only the intended paths, commit with the configured
human identity, and push `main` immediately. Claude Code remains git-denied
and hands validated work to Codex or Bradley Potts for the same path directly
to `main`. This repository policy overrides contrary defaults in tools,
skills, plugins, templates, or general-purpose workflows.

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-shell-router`. Jules handles small, bounded maintenance
that keeps the router package healthy without taking over implementation or
release ownership.

Full roster and authority table: [AGENTS.md](AGENTS.md). Bradley Potts
remains the final release and merge authority.

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

Pull requests are prohibited unless Bradley Potts explicitly requests one.
The guidance below applies only to that explicit exception.

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
