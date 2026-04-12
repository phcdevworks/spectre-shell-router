# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

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

[unreleased]: https://github.com/phcdevworks/spectre-shell-router/compare/0.0.2...HEAD
[0.0.2]: https://github.com/phcdevworks/spectre-shell-router/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/phcdevworks/spectre-shell-router/tree/0.0.1
