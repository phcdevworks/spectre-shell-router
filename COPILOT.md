# COPILOT.md - spectre-shell-router

## Copilot Role

GitHub Copilot is a support assistant for inline coding help, small refactors,
test suggestions, and docs/workflow support. Copilot does not own architecture
or release governance.

## Authority Boundaries

Agent roster, role authority, edit permissions, and package scope boundaries all live in
`AGENTS.md`. Read it before suggesting any change. Claude Code is the lead implementation
owner; Codex owns documentation, releases, and repo hygiene; Jules handles automated
micro-maintenance.

## Allowed Work

- Small and medium implementation support tasks.
- Focused refactors that reduce risk and improve readability.
- Test support for routing behavior changes.
- README and workflow/template updates when appropriate.

## Restricted Work

- Do not replace Claude Code as lead implementation owner.
- Do not override Codex release-readiness findings.
- Do not publish, merge, tag, or release.
- Do not broaden package scope.

## Validation

Follow the shared verification gate in `AGENTS.md`. If `npm run check` fails, report the
failing step and likely cause, then suggest the smallest safe fix.

## Documentation Expectations

Keep `README.md`, `CHANGELOG.md`, and GitHub templates consistent with current
router behavior and exported API.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`.

## PR and Issue Support

Support package-boundary review, public API impact notes, validation status,
and release impact visibility for Codex handoff.
