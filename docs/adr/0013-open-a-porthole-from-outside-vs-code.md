<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Open a porthole from outside VS Code

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), with Purser 5.5, Surveyor 5.1 and Sounder 6 in the seed's thread

**TL;DR**: Build `open` from outside first — a `vscode://` link a model can run or print and the human can click — because all of today's friction is on the opening side; four questions decide who may call it, what it may open, whether it may take focus, and what it confirms.

---

## Originating Context

**Source**: `Seed: docs/adr/seed-2026-10-13-porthole-for-models.md` — Jérémie's dump and "why", and the thread entries of Glazier, Purser, Surveyor and Sounder. Also [ADR-0008](0008-expose-a-vscode-link-handler-with-an-allowlist.md), which designed the link handler before models were its main sender.

Jérémie, on the friction, verbatim:

> for the human to have to open the HTML file and then do a command chord
> for the human to have to hunt for the file and then right-click and select the right option
>
> It woudl be nice if the human could say: Pull up that pharoscan in the porthole. Or if the model coudl wire a command to do as much. Or links opening up printed in the conversation or something.

**Agency Grant**: Chunk the seed into ORRCF questions, fully in template.

---

## Explicitation

**What I understand**:

1. **One verb, three ways in.** The human says "pull up that pharoscan" and the model runs one command; or a recipe runs it unasked; or the model prints a link the human clicks. All three are a `vscode://jlumbroso.porthole/open?…` link.
2. **The link is now a public interface.** Porthole is published (ADR-0011). Its grammar, once used by other people's scripts, cannot change without breaking them (Purser).
3. **The allowlist is the only real boundary.** VS Code's first-use dialog shows only about 35 characters of the address and offers "Do not ask me again" for the whole extension (Purser, read in `extensionUrlHandler.ts` at 1.141.0).

**What the source says, not yet run** (Surveyor, in the seed's thread):

- A `vscode://` link printed in VS Code's integrated terminal is clickable, and is handled by the VS Code window that owns that terminal, not the topmost one.
- `vscode.env.uriScheme` gives the right scheme in VS Code, Insiders, Cursor and VSCodium.

**Assumptions**:

- The handler is built on ADR-0008's design: a pure parser, a thin handler, `onUri` activation.
- Every outside request is logged in the Porthole output channel.

**Confirm**: Jérémie, through the four questions below.

---

## Questions

### QST-OPEN-CALLERS: Who should be able to open a porthole from outside VS Code?
- Status: unanswered
- Why asking: This decides what the outside interface is built for. A link that any local program can produce needs nothing Claude-specific; an MCP tool only reaches agents that have it installed.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — any local agent or script**: Claude Code, Codex, a `just` recipe, a shell script or a cron job. The interface is a `vscode://` link plus one documented command to run it; nothing is specific to one AI tool.
- **B — Claude Code seats only**: built as an MCP tool or a Claude skill that knows the details. Smoother inside Claude Code; invisible to everything else.
- **C — humans clicking links only**: porthole makes links (for example, a command that copies a page's link); models may print them, but nothing runs them automatically.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — any local agent or script.** *Rationale*: your three wishes include "the model wires a command", which is a script, not a chat; Purser and Sounder both answered the seed this way; and A contains B and C (a Claude skill can teach the same link, and a printed link is just its text). *Confidence*: 0.8 — because the three sources agree, and the cost is the same link either way. *If wrong*: if you only ever want to click, this flips to C, and porthole needs no command-line instructions at all.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-OPEN-ALLOWLIST: What may a link from outside VS Code open, by default?
- Status: unanswered
- Why asking: In ADR-0008 you chose (option C there) "local files and `localhost` by default, any `https://` URL only with the setting `porthole.allowRemoteLinks` on". That was decided when you were the only sender. Now links will come from models and from anything you click, and after the first "Do not ask me again", porthole's own rule is the only check. An opened page runs its scripts.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — keep ADR-0008 as answered**: any local `.html` file, any `http://localhost` or `127.0.0.1` address; `https://` only with `porthole.allowRemoteLinks`.
- **B — files inside the open workspace folders, plus folders you list**: a new setting, `porthole.allowedFolders`, for places such as another repository. `localhost` and `https://` each behind its own setting, both off by default.
- **C — B, but `localhost` on by default**: for people who serve task pages from a local dev server.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**B — workspace folders plus listed folders.** *Rationale*: Purser's two cases are real — a link to a file in Downloads would run that page's scripts in a window that stays on top, and a `localhost` link makes your machine send a request to any local service the link's author chose. B covers every use so far: the pharoscan and the porthole samples are both inside a repository open in VS Code. *Confidence*: 0.65 — because B costs one setting for pages kept outside any open folder, and I do not know how often you keep them there. *If wrong*: if task pages often live in folders VS Code does not have open, this flips to A, with the risk stated in the README.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-OPEN-FOCUS: When a model opens a porthole while you are typing elsewhere, may it take the keyboard?
- Status: unanswered
- Why asking: If opening a floating window moves keyboard focus into it, whatever you are typing at that moment — possibly a password in a terminal — goes into the page instead (Purser). Nobody knows yet whether porthole's open call takes focus; Spike 1 ([ADR-0018](0018-spike-1-markdown-preview-and-focus.md), QST-SPIKE1-FOCUS) measures it, and this question decides what to do with the answer.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — never take focus from outside**: an outside `open` shows the window, pinned, but leaves the keyboard where it was. If VS Code cannot do that, an outside `open` is refused with a message until it can.
- **B — take focus**: the new window gets the keyboard, as it does today from the chord. Simplest; the risk above is accepted.
- **C — depends on who triggered it**: a link you click yourself may take focus (you just clicked, you are not typing); an `open` run by a model or a script must not.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — depends on who triggered it.** *Rationale*: when you click a link, taking focus is what you want; when a script fires while you type, it is the hazard Purser named. Porthole can tell the two apart by how the request arrives (a parameter the clicked link carries, or a different path), though the parameter is not proof of who sent it. *Confidence*: 0.55 — because it depends on Spike 1 showing that VS Code can open without taking focus at all; if it cannot, C collapses to A or B. *If wrong*: if Spike 1 shows no way to avoid taking focus, this becomes a choice between A (refuse unattended opens) and B (accept the risk).

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-OPEN-CONFIRM: Should porthole ask you before each outside `open`?
- Status: unanswered
- Why asking: VS Code asks once per extension and then never again if you tick its box. Porthole could add its own confirmation on top, but that is exactly the friction this work removes. Sounder's view: your "pull up that pharoscan" already authorizes that open.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — no porthole confirmation**: VS Code's first-use dialog plus the allowlist (QST-OPEN-ALLOWLIST) are the checks; every outside open is logged in the Porthole output channel.
- **B — confirm every outside open** with a porthole notification ("Open tasks.html in a floating window?").
- **C — confirm only what the allowlist would refuse**: instead of refusing outright, porthole asks once and offers to remember the folder.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — confirm only what the allowlist would refuse.** *Rationale*: A alone turns every refusal into a dead end you have to fix in settings; B adds a click to the very gesture this work exists to remove (Purser's doubt: the feature must beat the chord). C costs a click only in the unusual case, and turns it into a lasting choice. *Confidence*: 0.6 — because it adds a small piece of interface, and it depends on the answer to QST-OPEN-ALLOWLIST. *If wrong*: if a notification from porthole would itself be noise to you, this flips to A.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Context

All of today's friction is on the opening side. Everything else a model might do with a porthole (ADR-0014) waits on this.

### Chosen: pending the four answers and Spike 1

What is settled regardless of the answers, from the seed's thread:

- The parser refuses anything not explicitly allowed, and its tests are written against hostile links, not friendly ones (Purser, Glazier).
- The link carries a version (`v=1`) so a skill can detect a mismatch (Purser).
- Every outside request is logged with what porthole can see of its origin (Purser).
- The words — verb, parameters, settings — go through the naming review first ([ADR-0017](0017-words-for-the-model-facing-surface.md)).
- Paths with spaces and URI-reserved characters are tested from a terminal before the changelog claims this works (Sounder).

---

## Action Items

- [ ] Answer the four questions — Owner: Jérémie
- [ ] Run Spike 1 — Owner: Jérémie ([ADR-0018](0018-spike-1-markdown-preview-and-focus.md))
- [ ] Build the handler once both are in — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5), from the thread entries of Purser 5.5, Surveyor 5.1 and Sounder 6
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0008](0008-expose-a-vscode-link-handler-with-an-allowlist.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md), [ADR-0017](0017-words-for-the-model-facing-surface.md), [ADR-0018](0018-spike-1-markdown-preview-and-focus.md)
