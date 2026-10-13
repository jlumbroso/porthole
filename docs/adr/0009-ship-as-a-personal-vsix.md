<!-- adr template version: "adr-madr 3.10.0" -->

# Ship as a personal VSIX now; publish to the Marketplace and Open VSX

* Status: accepted
* Deciders: Jérémie Lumbroso (QST-MARKETPLACE, answered B, 2026-10-12); the personal-VSIX half proposed by Claude Opus 5.5 in the design brief; recorded by Glazier 5.5 (Claude Opus 5.5)
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0006, reversed in part by Jérémie's answer to QST-MARKETPLACE below.

## Context and Problem Statement

How does porthole reach the people who use it — first Jérémie, then everyone?

## Considered Options

* Package a `.vsix` locally and install it from the file
* Publish to the Marketplace (and Open VSX)
* Publish the source only, with a release `.vsix`

## Decision Outcome

Chosen option: **publish to the VS Code Marketplace and Open VSX**, with the local `.vsix` as the way Jérémie runs it until the first release. Jérémie's reason, in his answer below: he has needed this for over two years and wants everybody to have it. The brief's original pick, personal-only, is reversed; so is my recommendation (A, then C).

What publishing commits us to, stated now so nobody discovers it at release time:

* **The listing says plainly that porthole relies on an internal VS Code command**, and what happens when VS Code changes it: the window still opens, compact and pinned, but at VS Code's default size.
* **Every VS Code update is a release question.** Spike 0 (`spike/`, F5 → "Spike 0") is re-run on the new version before a release claims to support it.
* **A seat owns the release** (founding brief: `docs/inbox/2026-10-13-0053-glazier-founding-brief-release-seat.md`) — listing copy, screenshots, the pre-publication privacy pass, the terminology pass for Mint, and the publishing mechanics — following the release skill and playbook Lintel is writing for `vscode-adrs-for-ai`.
* **The repo goes public with it**, under the MIT `LICENSE` already in place (ADR-0001, follow-ups).

Until the first release, the local path stays as it is ([ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)):

* `just install-local` builds, packages, installs that exact file, and says to reload the window.
* The package's contents are checked, not assumed: an ignore list that names this repo's working files (`CLAUDE.md`, `docs/`, `.mcp.json`, `.pneumatic/`, `kintsugi.*`, `spike/`), reviewed with `vsce ls` before the first install.
* The running version is logged at activation, so a stale install is visible.

### Positive Consequences

* Everyone who wants a pinned page beside their code can have it, with updates.

### Negative Consequences

* A public promise resting on an internal call that has been seen working on one VS Code version. Each break becomes other people's bug reports until a release follows.
* Release work porthole did not have before: listing, screenshots, two registries, tokens, a privacy pass on a repo that was written as private.

## Open question

### QST-MARKETPLACE: Should porthole go on the Marketplace after all — which reverses this decision?
- Status: answered
- Why asking: On 2026-10-12 Jérémie asked whether to recruit a seat "for publishing to the marketplaces". This ADR, accepted the same day, says porthole stays a personal `.vsix`, because it calls an internal VS Code command (`_workbench.openWith` into group `-3`) that can change in any update, and it has one user. A publishing seat only makes sense if that decision is reversed, so the decision comes first.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — stay personal for now**: keep the `.vsix`; revisit after porthole has been in daily use through at least one VS Code update, so we know how often the internal call breaks. No publishing seat yet.
- **B — publish to the VS Code Marketplace (and Open VSX)**: a public listing, with screenshots, copy and a changelog. Users get an extension that silently drops to the larger fallback window whenever VS Code changes the internal call, and the listing has to say so. Needs a publisher account under your name.
- **C — publish the source, not a listing**: make the GitHub repo public with a release `.vsix` attached, so others can install it knowingly. Less polish needed; no Marketplace review or promise of support.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — stay personal for now.** *Rationale*: the whole value rests on one internal call that has been seen working on exactly one VS Code version (ADR-0003, ADR-0010); VS Code ships about weekly, and nobody yet knows how often an update breaks the call. A public listing turns each break into other people's bug reports. The fallback keeps porthole usable, but at a size that defeats its purpose. *Confidence*: 0.7 — because the risk is real but unmeasured; one or two updates without a break would lower it a lot. *If wrong*: if the call survives two or three VS Code updates unchanged, or you want others using it now and accept the risk, this flips to C first, then B.

**Recommendation, revised** (by Glazier 5.5, Claude Opus 5.5, 2026-10-12, later the same evening — a walk-back, stated as one): **C — publish the source, now; B only after the call has survived an update.** Jérémie then said the project is being built to go open source very soon. That is the "you want others using it now" case my falsifier named, so A no longer fits. C costs nothing extra: the repo is already MIT, and a release `.vsix` is one file. B adds a public promise the internal call cannot yet keep. *Confidence*: 0.75 — because his intent is stated, but whether he also wants a listing is not. *If wrong*: if a Marketplace listing is part of "public" for him, B now, with the fallback stated plainly on the listing.

**ANS:** (by Jérémie Lumbroso)
Yes, Option B. I would like to polish this right-sized project and release it. I have been needing this for over two years, and I just ignored the need until finally I burst. Now I want everybody to have it. We need to recruit a seat dedicated to this.

---

## Links

* Packaging lessons: [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md), Supporting Materials
