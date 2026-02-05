# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

## [0.0.1] - 2026-02-05

### Added

- Minimal, framework-agnostic client-side router for vanilla TypeScript apps ([a3bdfb0]).
- String-based route matching with parameterized path support (e.g., `/users/:id`) ([d971c57]).
- History API integration with `pushState` and `popstate` listener for SPA navigation ([a3bdfb0]).
- Page lifecycle management with `onEnter` and `onExit` hooks for route transitions ([a3bdfb0]).
- TypeScript configuration with ES2022 target and strict type checking ([77fafa9]).
- Vitest testing framework with comprehensive router test suite covering navigation, lifecycle hooks, and parameter extraction ([a05924d]).
- Package exports configuration for ES module compatibility ([a3bdfb0]).
- Repository boilerplate including MIT license, README, VS Code workspace, and project configuration files ([1702ca2]).

### Changed

- Refactored routing implementation from pattern-based to string-based matcher for improved flexibility ([d971c57]).

[unreleased]: https://github.com/phcdevworks/spectre-shell-router/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/phcdevworks/spectre-shell-router/tree/v0.0.1
[a05924d]: https://github.com/phcdevworks/spectre-shell-router/commit/a05924d
[d971c57]: https://github.com/phcdevworks/spectre-shell-router/commit/d971c57
[a3bdfb0]: https://github.com/phcdevworks/spectre-shell-router/commit/a3bdfb0
[77fafa9]: https://github.com/phcdevworks/spectre-shell-router/commit/77fafa9
[1702ca2]: https://github.com/phcdevworks/spectre-shell-router/commit/1702ca2
