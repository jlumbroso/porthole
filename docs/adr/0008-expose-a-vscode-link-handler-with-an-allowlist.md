<!-- adr template version: "adr-madr 3.10.0" -->

# Expose a `vscode://` link handler with an allowlist

* Status: accepted
* Deciders: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0005. The idea is the brief author's own — a Claude Opus 5.5 session — and was not in the original prompt. Jérémie kept it in [ADR-0001](0001-founding-identity-gate-and-crew-shape.md), QST-TRIGGER: "an ingenious contribution… It anticipates a real need."

## Context and Problem Statement

Task pages are often written by a coding agent working outside the editor's UI. How does that agent, or a `just` recipe, pop a freshly written page into the mini window?

## Considered Options

* A URI handler: `vscode://jlumbroso.porthole/open?path=…&w=…&h=…`
* No outside trigger; the human always opens the page by hand

## Decision Outcome

Chosen option: "A URI handler", built last (milestone M4), because the cost is small and the pattern already exists in `vscode-adrs-for-ai`: a pure parser, a thin handler, and `onUri` activation ([ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)).

What is settled now:

* Only the `/open` path is recognized. A malformed link shows an error; it is never a silent no-op.
* The parser is a pure function, tested directly.
* A local path must end in `.html` or `.htm`.

### Positive Consequences

* `just pin <file>` and any agent can pop a page out with one line.

### Negative Consequences

* It is the only part of porthole that accepts input from outside the editor. Which URLs it accepts is the question below.

## Open question

### QST-LINK-ALLOWLIST: Which URLs may a link open in the pinned window?
- Status: deferred — to be asked when M4 starts; nothing before then depends on it
- Why asking: A `vscode://` link can be placed on any web page. Once you have told VS Code not to ask again for this extension, clicking such a link would put whatever it names in a window that stays on top of everything.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — local files and localhost only**: a link may open a local `.html` file or an `http://localhost` / `127.0.0.1` URL. Any other URL is refused with a message. Opening a remote page stays possible from inside VS Code with the "Open URL" command.
- **B — the brief's list**: as A, plus any `https://` URL. Simpler to explain; a link from anywhere can show any secure site in the pinned window.
- **C — A by default, B behind a setting**: `porthole.allowRemoteLinks`, off unless you turn it on.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — local files and localhost only.** *Rationale*: every use named so far — the original prompt, the brief's `just pin` recipe, ADR-0001's answer — is a local task page; nothing has asked for a remote page by link, and an always-on-top window that any web page can fill is the one way this small tool could be turned against its user. *Confidence*: 0.7 — because the uses are read from three documents, but I have not checked how VS Code's own confirmation prompt behaves for this handler. *If wrong*: if you want to pop remote dashboards or docs from scripts, this flips to C.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Links

* Kept by [ADR-0001](0001-founding-identity-gate-and-crew-shape.md), QST-TRIGGER
* Pattern from [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)
