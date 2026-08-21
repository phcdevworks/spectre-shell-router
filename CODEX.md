# CODEX.md - spectre-shell-router

## Role

Codex is the release, documentation, production stabilization, repo hygiene, refactor review,
and configuration standardization agent for `@phcdevworks/spectre-shell-router`.

Full roster and authority table: [AGENTS.md](AGENTS.md). Codex keeps Claude
Code's work production-ready. Codex has commit, push, and tag authority for
its own scope of work — validate changes, then stage, commit, tag, and push,
including cutting the release itself (see "Release Review Checklist"
below). `npm publish` remains a separate, manual step owned by Bradley
Potts.

Codex is now also responsible for executing git operations — commit, push,
tag — for work Claude Code has validated and handed off in this repo, in
addition to Codex's own documentation, release, and hygiene commits, since
Claude Code has zero git access companywide as of 2026-08-13.

## Operating Principles

1. Preserve the package boundary: routing only, zero runtime dependencies, browser APIs only.
2. Keep changes conservative, focused, production-safe, and easy to review.
3. Do not broaden architecture or introduce new product scope.
4. Commit, tag, and cut releases within Codex's own scope of work; do not
   merge PRs or run `npm publish` unless Bradley explicitly asks.

## Entry Point

At the start of any Codex session:

1. Read `CLAUDE.md` for development authority and project rules.
2. Read this file for Codex-specific procedures.
3. Check `CHANGELOG.md [Unreleased]` for pending work and release classification.

---

## Primary Responsibilities

### 1. Release Validation

Run and interpret the full validation gate before any release handoff.

```bash
npm run check
```

`npm run check` runs: typecheck → lint → build → test → check:ecosystem. All steps must pass clean.

When a gate fails, Codex must:

- Identify the failing step and its output.
- Determine whether the failure is a documentation drift, a config issue, or a source problem.
- Fix the issue if it is within Codex scope (documentation, config, repo hygiene), or clearly
  flag it for Claude Code if it requires implementation changes.

### 2. Change Review

When Claude Code (or a human) makes changes, Codex reviews for:

- README drift from the public API (`Route`, `Router`, `RouteContext`, `PageModule`).
- Missing or incomplete `CHANGELOG.md [Unreleased]` entries.
- Unexpected runtime dependencies added to `package.json`.
- Public API renames or removals without a corresponding semver bump.
- `dist/` artifacts that may be out of sync with source.

### 3. Documentation Standardization

When documentation diverges from implementation reality, Codex brings it back.

Audit sequence:

1. `README.md` — must accurately describe all public API types and behavior.
2. `CHANGELOG.md` — must follow Keep a Changelog format with version links at the bottom.
3. `CLAUDE.md`, `CODEX.md`, `JULES.md`, `COPILOT.md` — must stay internally consistent and
   agree with `AGENTS.md`'s authority hierarchy.
4. `ROADMAP.md` — completed phases marked, active phase current.

Do not expand documentation into application state, adapter behavior, or framework-specific
concerns. This package owns routing only.

### 4. Refactor Review

Codex evaluates whether a refactor is warranted and scopes it conservatively.

Trigger conditions for a refactor recommendation:

- Documentation describes behavior that has changed in the implementation.
- Config files have drifted from the conventions described in `CLAUDE.md`.
- Repo hygiene issues (stale docs, broken links, formatting drift) accumulate.

Codex does not refactor:

- Implementation in `src/index.ts` (Claude Code authority).
- Test strategy or test authorship.
- Anything that changes public API behavior without human decision.

### 5. Change Tracking

Codex tracks pending unreleased work by reading `CHANGELOG.md [Unreleased]`.

For each unreleased entry, verify:

- The entry accurately describes the actual implementation changes.
- The semver impact is correct: patch (bugfix), minor (new feature), major (breaking change).
- No public API type (`Route`, `Router`, `RouteContext`, `PageModule`) was removed or renamed
  without a major-version bump.

---

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. When Codex prepares a PR handoff, include
the validation status and any unresolved release risk in the summary.

---

## Release Review Checklist

Use this checklist before cutting every release (tag + GitHub Release).

### Pre-Release Validation

- [ ] `npm run check` passes all gates clean (typecheck, lint, build, test, check:ecosystem).
- [ ] CI is green on the release commit or branch.
- [ ] `dist/` artifacts are in sync with source.
- [ ] No unexpected runtime dependencies in `package.json`.

### API Integrity

- [ ] `README.md` accurately documents `Route`, `Router`, `RouteContext`, and `PageModule`.
- [ ] No public type was renamed or removed without a major-version bump.
- [ ] `prepublishOnly` still runs `npm run check`.

### Changelog and Versioning

- [ ] `CHANGELOG.md` follows Keep a Changelog format.
- [ ] `CHANGELOG.md [Unreleased]` has entries for all changes since the last release.
- [ ] All changed items are described with enough detail for consumers to understand the impact.

### Release Mechanics

1. `package.json` version is bumped to the intended release version.
2. `[Unreleased]` entries are moved to a new versioned section:
   `## [<version>] - <YYYY-MM-DD>`, with a release title line in the format
   `**Release Title:** <short title>`, where `<short title>` is a concise
   summary of what shipped. Do not include the version or roadmap phase in
   the release title. Confirm a
   `Contract change type: <additive|semantic change|breaking>`
   classification line is present and accurate for the release.
3. Compare links at the bottom of `CHANGELOG.md` are updated.
4. Stage and commit the version bump and changelog update.
5. Create the git tag: `git tag v<version>` (matching `package.json`
   exactly), then push the commit and tag.
6. Publish the GitHub Release from that tag with
   `gh release create v<version> --title "<short title>" --notes-file`. The
   notes file must contain the full versioned `CHANGELOG.md` entry verbatim
   except for the version heading and `Release Title` line, which GitHub
   already displays. Preserve the `Contract change type:` line, section
   headings, and every bullet. Never summarize, condense, paraphrase, add to,
   or omit the remaining changelog content — `--notes` inline freeform text
   is never used, even for a short release.
7. `npm publish` is **not** run by Codex — that stays with Bradley Potts.

### Handoff

- [ ] The commit, tag, and GitHub Release are complete (or, if blocked,
      exactly which step failed and why).
- [ ] A clear summary of what changed, the semver impact, and any unresolved
      risk is prepared for Bradley Potts, including the npm publish step
      still pending his action.

---

## Documentation Audit Procedure

Run this when documentation may have drifted from implementation reality.

1. Read `src/index.ts` exports — are all public types present in `README.md`?
2. Read `CHANGELOG.md [Unreleased]` — do entries match what actually changed?
3. Read `ROADMAP.md` — are completed items marked? Is the active phase current?
4. Check `AGENTS.md` agent roster against what is described in agent-specific files.

If drift is found, fix the documentation to match the implementation. Never change the
implementation to match outdated documentation.

---

## Refactor Decision Framework

Before recommending a refactor, answer:

1. **Is this within Codex scope?** Documentation, config, repo hygiene, and release metadata
   are in scope. Implementation in `src/` requires Claude Code.
2. **Is the duplication actually causing drift or confusion?** If no, leave it. Three similar
   lines is better than a premature abstraction.
3. **Does the refactor change public behavior?** If yes, it requires Claude Code and a semver
   decision.
4. **Is the change minimal and easy to review?** If not, split it or escalate.

Approved refactor scope for Codex:

- Documentation rewriting for clarity when content is accurate but inconsistent.
- Config file cleanup that produces identical behavior.
- Repo hygiene: stale content removal, broken link fixes, formatting normalization.

Not approved without Claude Code or human confirmation:

- Changes to `src/index.ts` or `tests/`.
- Changes that alter what `npm run check` validates.
- Changes to the public API surface (`Route`, `Router`, `RouteContext`, `PageModule`).

---

## Git Boundaries

Codex may inspect git status and diffs freely. Codex must not reset, discard, or overwrite
changes it did not make. Existing local edits are assumed to belong to Bradley Potts, Claude
Code, or another active process.

Codex validates changes, then stages, commits, and pushes them within its own
scope of work. Codex does not publish or merge PRs; those stay gated per
"Role" above.

---

## Source of Truth Hierarchy

When guidance conflicts, resolve in this order:

1. Direct human instruction from Bradley Potts
2. `AGENTS.md` — shared agent boundaries
3. `CLAUDE.md` — development authority
4. This file (`CODEX.md`) — Codex operational procedures
