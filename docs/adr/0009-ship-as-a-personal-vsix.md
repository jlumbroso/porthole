<!-- adr template version: "adr-madr 3.10.0" -->

# Ship as a personal VSIX

* Status: proposed — reopened by QST-MARKETPLACE below
* Deciders: proposed by Claude Opus 5.5 in the design brief; recorded by Glazier 5.5 (Claude Opus 5.5); awaiting Jérémie Lumbroso (corrected 2026-10-12: I first marked this accepted with him as a decider; he had not decided it)
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

## Open question

### QST-MARKETPLACE: Should porthole go on the Marketplace after all — which reverses this decision?
- Status: unanswered
- Why asking: On 2026-10-12 Jérémie asked whether to recruit a seat "for publishing to the marketplaces". This ADR, accepted the same day, says porthole stays a personal `.vsix`, because it calls an internal VS Code command (`_workbench.openWith` into group `-3`) that can change in any update, and it has one user. A publishing seat only makes sense if that decision is reversed, so the decision comes first.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — stay personal for now**: keep the `.vsix`; revisit after porthole has been in daily use through at least one VS Code update, so we know how often the internal call breaks. No publishing seat yet.
- **B — publish to the VS Code Marketplace (and Open VSX)**: a public listing, with screenshots, copy and a changelog. Users get an extension that silently drops to the larger fallback window whenever VS Code changes the internal call, and the listing has to say so. Needs a publisher account under your name.
- **C — publish the source, not a listing**: make the GitHub repo public with a release `.vsix` attached, so others can install it knowingly. Less polish needed; no Marketplace review or promise of support.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — stay personal for now.** *Rationale*: the whole value rests on one internal call that has been seen working on exactly one VS Code version (ADR-0003, ADR-0010); VS Code ships about weekly, and nobody yet knows how often an update breaks the call. A public listing turns each break into other people's bug reports. The fallback keeps porthole usable, but at a size that defeats its purpose. *Confidence*: 0.7 — because the risk is real but unmeasured; one or two updates without a break would lower it a lot. *If wrong*: if the call survives two or three VS Code updates unchanged, or you want others using it now and accept the risk, this flips to C first, then B.

**Recommendation, revised** (by Glazier 5.5, Claude Opus 5.5, 2026-10-12, later the same evening — a walk-back, stated as one): **C — publish the source, now; B only after the call has survived an update.** Jérémie then said the project is being built to go open source very soon. That is the "you want others using it now" case my falsifier named, so A no longer fits. C costs nothing extra: the repo is already MIT, and a release `.vsix` is one file. B adds a public promise the internal call cannot yet keep. *Confidence*: 0.75 — because his intent is stated, but whether he also wants a listing is not. *If wrong*: if a Marketplace listing is part of "public" for him, B now, with the fallback stated plainly on the listing.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Links

* Packaging lessons: [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md), Supporting Materials
