<!-- adr template version: "adr-madr 3.10.0" -->

# Ship as a personal VSIX

* Status: accepted
* Deciders: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5); proposed by Claude Opus 5.5 in the design brief
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0006.

## Context and Problem Statement

How does porthole get from this repo into the VS Code that Jérémie uses?

## Considered Options

* Package a `.vsix` locally and install it from the file
* Publish to the Marketplace

## Decision Outcome

Chosen option: "Package a `.vsix` locally and install it from the file", because the extension calls an internal command and may use a proposed API, neither of which belongs on the Marketplace, and it has one user.

How, following the house's practice ([ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)):

* `just install-local` builds, packages, installs that exact file, and says to reload the window.
* The package's contents are checked, not assumed: an ignore list that names this repo's working files (`CLAUDE.md`, `docs/`, `.mcp.json`, `.pneumatic/`, `kintsugi.*`, `spike/`), reviewed with `vsce ls` before the first install.
* The running version is logged at activation, so a stale install is visible.

### Positive Consequences

* No review process, no public surface, no promise to other users.

### Negative Consequences

* No automatic updates: each change is a repackage and a reinstall.
* The repo is private and carries an MIT `LICENSE` inherited from the template (ADR-0001, follow-ups); that only matters if the repo or a package is ever shared.

## Links

* Packaging lessons: [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md), Supporting Materials
