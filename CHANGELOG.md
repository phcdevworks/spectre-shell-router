# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versioning reflects package releases published to npm.

## [Unreleased]

### Changed
- **Architecture**: Refactored procedural routing logic into a `Router` class with a smaller, routing-focused surface.
- **API Consistency**: Synchronized `Router` initialization with the standard `README.md` constructor pattern.
- **Lifecycle**: Standardized page hooks to `render` and `destroy` so route-module cleanup stays ordered during navigation.
- **Robustness**: Implemented navigation tracking to prevent race conditions and added global link interception for same-domain anchors.

## [0.0.1] - 2026-02-05

### Added
- **Initial Release**: Minimal, framework-agnostic client-side router for Spectre-based applications.
- **Features**: Includes string-based path matching, dynamic parameter extraction, and native History API integration.

[unreleased]: https://github.com/phcdevworks/spectre-shell-router/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/phcdevworks/spectre-shell-router/tree/v0.0.1
