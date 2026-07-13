# AGENTS.md - spectre-shell-router

## Repository Snapshot

| Field | Value |
|-------|-------|
| Project team | `project-shell` |
| Repository role | Spectre client-side router |
| Package/artifact | `@phcdevworks/spectre-shell-router` |
| Validation gate | `npm run check` |

## Standard Authority Model

| Agent | Role | Authority |
|-------|------|-----------|
| Claude Code | Lead implementation and validation | [CLAUDE.md](CLAUDE.md) |
| OpenAI Codex | Documentation, release readiness, stabilization, and repo hygiene | [CODEX.md](CODEX.md) |
| ChatGPT | Strategy, coordination, prompt design, and external review | Support only |
| GitHub Copilot | Development assistance | [COPILOT.md](COPILOT.md) |
| Google Jules | Bounded automated maintenance | [JULES.md](JULES.md) |

Bradley Potts holds final authority for commits, merges, tags, publishing, and
releases.

## Cross-Repo Access

This repo may be worked on standalone or alongside any combination of other
PHCDevworks repos — do not assume the company root or sibling project areas
are present. The following rules are self-contained and apply whether or not
that broader context is available.

**File access.** An agent working in this repo has full read/write access to
every file in this repo. When this repo is present alongside other
PHCDevworks repos (company root or sibling `project-*` areas), the same full
read/write access extends to those repos too — there is no per-repo access
restriction anywhere in this workspace. What differs repo-to-repo is not
*access*, it's *editorial ownership*: each repo's own `CLAUDE.md`/`AGENTS.md`
still governs what changes make sense there (design-token authority, layer
boundaries, etc.) — being able to open and edit a file is not the same as it
being this repo's job to change it.

**Cross-repo changelog sync.** When a change in this repo has direct
downstream or upstream impact on another present repo (e.g. a breaking token
rename, an API contract change), an agent may append a `CHANGELOG.md
[Unreleased]` entry directly into that other repo's own changelog — not just
leave a note asking its owner to add it. Rules:

1. Only append new `[Unreleased]` entries — never edit, reorder, or remove
   another repo's existing changelog entries, version headers, or release
   history.
2. Every cross-repo entry must be self-contained and attributed: which repo
   caused it and why, what changed from the affected repo's perspective, and
   the date added.
3. Add it in the same change that produced the impact, not a later session.
4. This never grants release authority — cutting a release, bumping a version
   header, or publishing a package stays gated by that repo's own release
   process and the human owner's final sign-off.

**TODO/roadmap requests.** When work here surfaces a need that belongs to
another repo, an agent may append the request directly to that repo's own
`TODO.md` under a clearly labeled "Requested by Downstream" section (create
it if absent), stating which repo is requesting it, why, the date, and a
link back if the other repo's `TODO.md`/`ROADMAP.md` is reachable.

No AI agent creates commits, tags, publishes packages, or merges changes in
this repo or any other unless that repo's own agent guide explicitly grants
that authority or the human owner has explicitly requested the action.

## Standard Handoff

Every AI-prepared change should report files changed, validation performed,
public behavior or contract impact, and unresolved risks. Do not edit generated
outputs directly. Do not update [CHANGELOG.md](CHANGELOG.md) unless the change
is release-relevant.

## Instruction Map

| File                              | Audience                     | Purpose                                                            |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `AGENTS.md`                       | All agents, especially Codex | Central role model, coordination rules, verification gate          |
| `CLAUDE.md`                       | Claude Code                  | Lead-development guide for implementation, architecture, and tests |
| `CODEX.md`                        | OpenAI Codex                 | Release-readiness, production stabilization, and config posture    |
| `JULES.md`                        | Google Jules                 | Bounded automated maintenance guidance                             |
| `COPILOT.md`                      | GitHub Copilot               | Role summary and development boundaries for GitHub Copilot         |
| `.github/copilot-instructions.md` | GitHub Copilot               | In-editor suggestion boundaries                                    |
| `.claude/settings.json`           | Claude Code runtime          | Local command denies for commit, push, tag, and publish actions    |
| `.coderabbit.yaml`                | CodeRabbit                   | Automated review checks aligned with package boundaries            |
| `.github/dependabot.yml`          | Dependabot / Jules handoff   | Dependency-update cadence for automated maintenance                |

---

## Upstream Requests and Roadmap Self-Expansion

Full directive: project-team [AGENTS.md](../AGENTS.md) "Upstream Requests and
Roadmap Self-Expansion." Applied to this repo:

- This repo is an independent peer package — it has no upstream dependency
  within this workspace; do not invent one.
- Downstream repos `spectre-shell` (composes this router) and `spectre-init`
  (scaffolds against it) may append routing-contract requests (e.g. a new
  `subscribe()` event, navigation helper, or `Route`/`Router` type) to this
  repo's own `TODO.md` under `## Requested by Downstream`, dated and linked
  back to the requesting repo's TODO.md/ROADMAP.md. Keep that section visible
  and separate from self-planned routing work.
- This repo's own [ROADMAP.md](ROADMAP.md) may be proactively expanded with new
  or reordered phases by the agent's own analysis — but never mark a phase
  delivered without `npm run check` passing, and never contradict the
  deliberate app-layer router/signals separation documented in
  `project-shell/CLAUDE.md` (router does not import
  `spectre-shell-signals`, and vice versa).
- Surface any new TODO request or roadmap expansion in the handoff for Bradley
  Potts in the same change it was made, and reflect cross-repo-relevant
  changes in the project-team's own ROADMAP.md/TODO.md.

## Shared Source Rules

These rules apply to every agent without exception.

| Path                                                         | Status              | Notes                                                          |
| ------------------------------------------------------------ | ------------------- | -------------------------------------------------------------- |
| `src/index.ts`                                               | Claude Code         | All routing implementation changes start here                  |
| `tests/`                                                     | Claude Code         | Test authorship and strategy                                   |
| `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md` | Codex               | Documentation, release notes, and repo hygiene                 |
| `package.json`                                               | Codex / Jules       | Version bumps for releases; dependency updates for maintenance |
| `dist/`                                                      | Never edit directly | Always regenerated by `npm run build`                          |
| `spectre.manifest.json`                                      | May edit            | Update when exports, Spectre dependencies, or stability change |
| `.github/`                                                   | Codex               | PR templates, issue templates, CI configuration                |

---

## Agent-Specific Guides

- `CLAUDE.md` - primary development authority and implementation workflow.
- `CODEX.md` - documentation, release, stabilization, and repo hygiene workflow.
- `JULES.md` - bounded automated maintenance workflow.
- `COPILOT.md` and `.github/copilot-instructions.md` - support-assistant workflow.

---

## Coordination Rules

- When instructions conflict, follow this priority: direct human request, `AGENTS.md`,
  agent-specific file, then tool suggestions.
- Claude Code leads any change that alters router behavior, public TypeScript contracts, route
  matching, navigation, lifecycle, or tests.
- Codex keeps production readiness in check and leads documentation, release notes, release
  preparation, stabilization review, repo hygiene, and AI/config cleanup.
- ChatGPT provides strategy and coordination support only — no implementation ownership.
- Copilot output is advisory only; accepted suggestions still follow the owning agent or human
  reviewer.
- Jules and Dependabot changes should stay mechanical and easy to review. Escalate behavior
  changes to Claude Code and release/changelog questions to Codex.
- Keep handoffs short: summarize changed files, validation status, public-behavior impact, and
  any unresolved risk.

---

## Pull Request Creation

Every agent that opens a PR must populate every section of the repo's PR template
(`.github/pull_request_template.md`):

- **Linked issue** — issue number (`#N`) or `N/A`.
- **What changed** — one or two bullets describing what changed.
- **Why this change is needed** — brief rationale.
- **Type of Change** — check every box that applies.
- **Package Boundary Check** — confirm the change stays within routing scope.
- **Public API Impact** — flag any contract change to `Route`, `Router`, `RouteContext`, or `PageModule`.
- **Validation** — state that `npm run check` was run and the result.
- **Documentation Updated** — confirm `README.md` and `CHANGELOG.md` are current or unchanged.
- **Release Impact** — patch, minor, major, or none.
- **Codex Review Needed** — yes or no.

Never submit a PR with an empty body or only the template headings left unfilled.

---

## Package Mission

`@phcdevworks/spectre-shell-router` provides minimal, framework-agnostic client-side routing
for Spectre applications. It maps URL paths to lazy page modules and enforces the
`render` / `destroy` lifecycle contract.

## Responsibility Boundary

- **Own routing only**: URL matching, navigation, params extraction, query parsing, History
  API, race-condition protection, page lifecycle
- **Do not own**: application state, rendering logic beyond clearing the root element, styling,
  signals, SSR, framework adapters

## Core Rules

1. **Minimal surface area** — keep `src/index.ts` lean; resist feature creep
2. **Lifecycle enforcement** — `destroy()` must always run before the next `render()`
3. **Zero dependencies** — standard browser APIs only
4. **Async loaders** — dynamic `import()` pattern for page loading
5. **Native History API** — `pushState` / `popstate`; no hash routing by default (hash mode is a planned opt-in)
6. **Race-condition safe** — `currentNavId` monotonic counter guards stale renders
7. **Scripts are TypeScript** — all `scripts/` tooling is `.ts`, run via
   `node --experimental-strip-types`; never add a new `.js`/`.mjs` script.

## Verification Gate

All agents: before marking any change done, run:

```bash
npm run check
```

All of typecheck, lint, build, tests, and `check:ecosystem` must pass.

## AI Workflow (any agent)

1. Make the smallest focused change that solves the stated problem
2. Run `npm run check` — all green before handing off
3. Update `CHANGELOG.md` and `README.md` when public behavior changes
4. Leave commits, merges, tags, publishing, and releases for Bradley's approval

## Ecosystem Manifest

`spectre.manifest.json` at the root is this package's declaration in the Spectre
ecosystem contract, validated by `@phcdevworks/spectre-manifest`. It records role,
layer, exports, and allowed Spectre dependency targets. `check:ecosystem` validates
it as part of `npm run check`.

Keep `spectre.manifest.json` in sync when:

- Package exports in `package.json` are added or removed
- A Spectre package dependency is added or removed
- The package stability changes

Do not add a `consumers` field — that belongs in the central
`@phcdevworks/spectre-manifest` registry.
