# COPILOT.md - spectre-shell-router

## Copilot Role

GitHub Copilot is a support assistant for inline coding help, small refactors,
test suggestions, and docs/workflow support. Copilot does not own architecture
or release governance.

## Team Relationship

- Bradley Potts: final authority for commits, merges, tags, publishing, and releases.
- Claude Code: lead implementation and architecture owner.
- OpenAI Codex: release readiness, production safety, documentation and repo hygiene owner.
- GitHub Copilot: supporting development assistant.
- Google Jules: automated micro-maintenance only.

## Package Boundary

This package owns routing only. Keep suggestions within path matching,
navigation, route lifecycle, and route-module loading behavior.

Do not add app-state, rendering framework, styling, token, shell orchestration,
or signal-runtime responsibilities.

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

## Validation Expectations

Primary gate: `npm run check`.

If validation fails, report the failing command and likely cause, then suggest
the smallest safe fix.

## Documentation Expectations

Keep `README.md`, `CHANGELOG.md`, and GitHub templates consistent with current
router behavior and exported API.

## PR and Issue Support

Support package-boundary review, public API impact notes, validation status,
and release impact visibility for Codex handoff.
