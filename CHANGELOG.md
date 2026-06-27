# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

### Fixed

- Added `@types/node` as a devDependency so `scripts/check-readme-version.ts`
  resolves Node globals correctly (no functional impact — script already ran
  fine via `node --experimental-strip-types`, this only affects editor/IDE
  type-checking and any future widening of `tsconfig.json`'s `include`).

### Added

- Added `@phcdevworks/spectre-manifest` as a devDependency. `spectre.manifest.json`
  at the repo root declares this package's ecosystem role, layer, exports, and
  allowed dependency targets. `check:ecosystem` validates it in the check pipeline.

## [1.1.0] - 2026-06-04

Release Title: Router Options and Navigation Reliability

Contract change type: additive

### Added

- **Router Options**: Added `RouterOptions` with opt-in hash routing mode, route guards via `beforeNavigate`, and configurable scroll restoration.
- **Named Routes**: Added optional route names and `router.href()` path generation, including encoded params and hash-mode paths.
- **Navigation**: Added automatic scroll reset on push navigation and saved-position restoration on browser back/forward navigation.
- **Release Tooling**: Added `scripts/propose-version.ts` and the `release:propose` script to classify unreleased contract changes before proposing a semver bump.
- **Repo Coordination**: Added AI-agent governance docs, issue templates, PR-template requirements, and CI/release-readiness tracking.

### Changed

- **Documentation**: Refreshed README usage, Node.js requirements, CI/package metadata, roadmap, TODO tracking, and contribution guidance.
- **CI**: Expanded GitHub Actions coverage with a Node.js version matrix, concurrency control, and workflow timeouts.
- **Package Metadata**: Added public npm publish config, package manager metadata, Node.js engine requirements, and GitHub-oriented repository/homepage metadata.
- **Dependencies**: Refreshed development dependencies and lockfile entries.

### Fixed

- **Navigation**: Ensured `currentPath` is updated even when no route matches (404), providing correct context for subsequent navigation guards.
- **Navigation**: Implemented automatic URL reversion using `history.replaceState` when a navigation is cancelled by the `beforeNavigate` guard.
- **Route Matching**: Strengthened `matchRoute` to decode URL segments before comparison, ensuring static routes with special characters (like spaces) match correctly.
- **Reliability**: Hardened router boundary behavior, lifecycle cleanup, link interception, and stale async navigation handling.

## [1.0.0] - 2026-04-25

Release Title: Stable Router Release and Navigation Polish

### Added

- **Publish Validation**: Added a `prepublishOnly` check that builds and runs the test suite before publishing.
- **Tooling**: Added a dedicated `typecheck` script and included Prettier in development dependencies.

### Changed

- **Package Version**: Promoted the package to the stable `1.0.0` release line.
- **Navigation**: Preserved native browser behavior for modified or non-primary link clicks so actions like opening links in a new tab are not intercepted.
- **Initialization**: Marked the initial asynchronous navigation call as intentionally fire-and-forget during router construction.
- **Build Output**: Pinned TypeScript `rootDir` to `src` so emitted files stay scoped to the package source tree.
- **Dependencies**: Refreshed development dependencies and lockfile entries.

## [0.0.2] - 2026-04-13

Release Title: Router Class Refactor and Navigation Hardening

### Added

- **Router API**: Introduced the `Router` class as the primary package interface for route registration, navigation, and teardown.
- **Coverage**: Expanded the test suite with stress scenarios for rapid navigation, back transitions, complex params, and query-heavy routes.

### Changed

- **Architecture**: Refactored procedural routing logic into a `Router` class with a smaller, routing-focused surface.
- **API Consistency**: Synchronized `Router` initialization with the standard `README.md` constructor pattern.
- **Lifecycle**: Standardized page hooks to `render` and `destroy` so route-module cleanup stays ordered during navigation.
- **Robustness**: Implemented navigation tracking to prevent race conditions and added global link interception for same-domain anchors.
- **Tooling**: Migrated ESLint to a TypeScript config, refreshed package metadata, and updated development dependencies.
- **Documentation**: Reworked `README.md`, contribution guidance, and project metadata to better reflect package ownership and usage.

## [0.0.1] - 2026-02-05

Release Title: Initial Router Foundation

### Added

- **Initial Release**: Minimal, framework-agnostic client-side router for Spectre-based applications.
- **Features**: Includes string-based path matching, dynamic parameter extraction, and native History API integration.

[unreleased]: https://github.com/phcdevworks/spectre-shell-router/compare/1.1.0...HEAD
[1.1.0]: https://github.com/phcdevworks/spectre-shell-router/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/phcdevworks/spectre-shell-router/compare/0.0.2...1.0.0
[0.0.2]: https://github.com/phcdevworks/spectre-shell-router/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/phcdevworks/spectre-shell-router/tree/0.0.1
