# GitHub Copilot Instructions — spectre-shell-router

Role: general development support assistant in the IDE. Suggestions are reviewed by humans before acceptance.

Read `AGENTS.md` for the multi-agent operating model and role boundaries.
Read `CLAUDE.md` for package boundaries, architecture, and implementation standards.

## Copilot Supports

- Inline code completion
- Small code suggestions
- Test suggestions
- TypeScript assistance
- API usage hints
- Refactor suggestions
- Pattern-aware implementation help
- Developer productivity inside the IDE

## Copilot Does Not Own

- Lead implementation decisions
- Architecture direction or scope changes
- Release coordination, versioning, or changelog ownership
- Production stabilization ownership
- Repo-wide AI governance
- Automated maintenance workflows
- Config standardization ownership
- Commit, push, tag, or publish authority

## Key constraints for suggestions

- Zero runtime dependencies — browser APIs only; never suggest adding packages to `dependencies`
- TypeScript strict mode — all types explicit; never suggest `any` or non-null assertions without justification
- Do not suggest application state, rendering logic, framework adapters, or CSS
- No comments unless the WHY is non-obvious; never comment the WHAT
- Keep implementation suggestions centered on `src/index.ts` and test suggestions in `tests/`
- Keep public API references accurate: `Router`, `Route`, `RouteContext`, `PageModule`
- Preserve lifecycle and navigation guarantees: `destroy()` before next `render()`, race-safe navigation
- The verification gate is `npm run check` (typecheck + lint + build + test)

## Escalation Boundaries

- Route behavior, architecture, public API contract, and test strategy direction are Claude Code-owned
- Documentation, releases, stabilization, repo hygiene, and config standardization are Codex-owned
- Strategy, coordination, prompt design, and external review are ChatGPT-provided
- Mechanical dependency/config micro-updates are Jules/Dependabot-owned
- Copilot output is advisory and should align with the owning agent decisions
