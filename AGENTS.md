# AGENTS.md — spectre-shell-router

## AI Operating Model

This is the central AI coordination document for the repository. Agent-specific files may add
tool-local guidance, but they must not override the role boundaries below.

This repository uses a five-agent AI operating model with defined, non-overlapping roles:

| Agent              | Role                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| **Claude Code**    | Lead developer — primary implementation, architecture, tests           |
| **OpenAI Codex**   | Documentation, releases, production stabilization, repo hygiene        |
| **GitHub Copilot** | General development assistance (in-editor suggestions)                 |
| **Google Jules**   | Automated maintenance — small fixes, dependency updates, micro-patches |
| **ChatGPT**        | Strategy, coordination, prompt design, and external review             |

Human commit and release authority rests with Bradley Potts (brad.potts@coastdigitalgroup.com).
No AI agent creates git commits, pushes branches, creates tags, merges pull requests, publishes
packages, or creates releases.

## Instruction Map

| File                              | Audience                     | Purpose                                                            |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `AGENTS.md`                       | All agents, especially Codex | Central role model, coordination rules, verification gate          |
| `CLAUDE.md`                       | Claude Code                  | Lead-development guide for implementation, architecture, and tests |
| `CODEX.md`                        | OpenAI Codex                 | Release-readiness, production stabilization, and config posture    |
| `.github/copilot-instructions.md` | GitHub Copilot               | In-editor suggestion boundaries                                    |
| `.claude/settings.json`           | Claude Code runtime          | Local command denies for commit, push, tag, and publish actions    |
| `.coderabbit.yaml`                | CodeRabbit                   | Automated review checks aligned with package boundaries            |
| `.github/dependabot.yml`          | Dependabot / Jules handoff   | Dependency-update cadence for automated maintenance                |

---

## Claude Code — Lead Developer

Claude Code (`claude-sonnet-4-6`) is the designated lead developer. All primary implementation work is driven through Claude Code operating from `CLAUDE.md` as its authoritative working guide.

**Owns:**

- All feature implementation and refactoring in `src/index.ts`
- Test coverage across `tests/`
- Architecture decisions within the router boundary
- Final validation before handoff (`npm run check` must pass)

**Does not own:** documentation publishing, release versioning, changelog authorship, or dependency bump PRs.

---

## OpenAI Codex — Documentation & Releases

Codex handles documentation quality, release preparation, production stabilization, repo hygiene,
config standardization, and release-readiness checks. Codex operates from `AGENTS.md` and
`CODEX.md`.

**Owns:**

- `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, and other root documentation
- Release preparation: version bumps in `package.json`, CHANGELOG entries, and release notes
- Production stabilization: reviewing release-readiness, flagging regressions, ensuring the gate passes
- Repo hygiene: consistent formatting, removing stale content, keeping docs current with code
- PR and issue template maintenance (`.github/`)

**Codex task guidance:**

_Documentation updates_

- Run `npm run check` after any change to verify nothing breaks
- Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format: Added/Changed/Fixed/Removed sections, version links at the bottom
- `README.md` must stay in sync with the public API (`Route`, `Router`, `RouteContext`, `PageModule`)

_Release preparation_

- Version follows semver; bump `package.json` `version` field
- Move `## [Unreleased]` entries into a new `## [X.Y.Z] - YYYY-MM-DD` section in `CHANGELOG.md`
- `prepublishOnly` runs `npm run check` automatically — never skip it
- Do not prepare a release without a passing CI run on the release commit

_Production stabilization_

- Confirm `npm run check` passes clean on the release branch
- Review open issues and PRs for regressions before marking stable
- Flag any `[Unreleased]` CHANGELOG entries that have not been attributed to a version

_Repo hygiene_

- Formatting: Prettier config (`.prettierrc`) governs all source; `npm run format` applies it
- Keep `ROADMAP.md` current: mark completed items, do not add scope that contradicts `CLAUDE.md`
- Do not introduce new root-level files without a clear, documented purpose

**Does not own:** implementation in `src/`, test authorship, architecture decisions, or deployment.

Codex may touch `package.json` only for release preparation or repo-hygiene cleanup. Dependency
updates remain Jules/Dependabot work unless a release task explicitly requires coordination.

Codex may refactor documentation, config, release metadata, and repo organization when required,
but implementation refactors belong to Claude Code unless Bradley explicitly requests a small,
bounded stabilization fix.

---

## GitHub Copilot — Development Assistance

Copilot provides in-editor code suggestions and assists developers during active coding sessions. See `.github/copilot-instructions.md` for Copilot-specific guidance.

**Supports:** inline completions, small code suggestions, test suggestions, TypeScript/API hints, refactor suggestions, pattern-aware implementation help, and developer productivity inside the IDE.

**Owns:** nothing directly — suggestions only, human-reviewed before acceptance.

**Does not own:** lead implementation decisions, architecture direction, release coordination, production stabilization ownership, repo-wide AI governance, automated maintenance workflows, config standardization ownership, or commit authority.

---

## Google Jules — Automated Maintenance

Jules handles small, automated maintenance tasks that do not require architectural judgment.

**Owns:**

- Dependency version bumps (coordinated with Dependabot schedules in `.github/dependabot.yml`)
- Small config file corrections (whitespace, key ordering, obvious typos in non-source files)
- Mechanical doc fixes (broken links, formatting drift in markdown)

**Jules limits:** Jules must not touch `src/index.ts` for anything beyond whitespace or import order. Any change to routing logic, types, or the public API requires Claude Code.

**Does not own:** feature work, API changes, test rewrites, or release decisions.

---

## ChatGPT — Strategy and Coordination

ChatGPT provides strategy, coordination, prompt design, and external review.
It is an advisory layer, not an implementation or release agent.

**Supports:** architecture strategy, AI coordination, prompt refinement,
cross-project review, and high-level technical direction.

**Does not own:** implementation, release execution, commit authority,
production stabilization, or repository changes. ChatGPT input is advisory
and requires human or Claude Code review before acting.

---

## Coordination Rules

- When instructions conflict, follow this priority: direct human request, `AGENTS.md`, agent-specific file, then tool suggestions.
- Claude Code leads any change that alters router behavior, public TypeScript contracts, route matching, navigation, lifecycle, or tests.
- Codex keeps production readiness in check and leads documentation, release notes, release preparation, stabilization review, repo hygiene, and AI/config cleanup.
- Copilot output is advisory only; accepted suggestions still follow the owning agent or human reviewer.
- Jules and Dependabot changes should stay mechanical and easy to review. Escalate behavior changes to Claude Code and release/changelog questions to Codex.
- Keep handoffs short: summarize changed files, validation status, public-behavior impact, and any unresolved risk.

---

## Package Mission

`@phcdevworks/spectre-shell-router` provides minimal, framework-agnostic client-side routing for Spectre applications. It maps URL paths to lazy page modules and enforces the `render` / `destroy` lifecycle contract.

## Responsibility Boundary

- **Own routing only**: URL matching, navigation, params extraction, query parsing, History API, race-condition protection, page lifecycle
- **Do not own**: application state, rendering logic beyond clearing the root element, styling, signals, SSR, framework adapters

## Core Directives

1. **Minimal surface area** — keep `src/index.ts` lean; resist feature creep
2. **Lifecycle enforcement** — `destroy()` must always run before the next `render()`
3. **Zero dependencies** — standard browser APIs only
4. **Async loaders** — dynamic `import()` pattern for page loading
5. **Native History API** — `pushState` / `popstate`; no hash routing by default (hash mode is a planned opt-in)
6. **Race-condition safe** — `currentNavId` monotonic counter guards stale renders

## Verification Gate

All agents: before marking any change done, run:

```bash
npm run check
```

All of typecheck, lint, build, and tests must pass.

## AI Workflow (any agent)

1. Make the smallest focused change that solves the stated problem
2. Run `npm run check` — all green before handing off
3. Update `CHANGELOG.md` and `README.md` when public behavior changes
4. Leave commits, merges, tags, publishing, and releases for Bradley's approval
