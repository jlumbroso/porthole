<!-- adr template version: "adr-madr 3.10.0" -->

# Expose a `vscode://` link handler with an allowlist

* Status: accepted
* Deciders: idea by Claude Opus 5.5 in the design brief; kept by Jérémie Lumbroso (ADR-0001, QST-TRIGGER), who also chose the allowlist (QST-LINK-ALLOWLIST below); recorded by Glazier 5.5 (Claude Opus 5.5)
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
* **Which URLs a link may open** (QST-LINK-ALLOWLIST, answered C by Jérémie, 2026-10-12): local files and `localhost` by default; any `https://` URL only when the setting `porthole.allowRemoteLinks` is turned on. His reason: dashboards are sometimes published to a pre-approved remote location so they can be reached from a phone, and those should be poppable too.

### Positive Consequences

* `just pin <file>` and any agent can pop a page out with one line.

### Negative Consequences

* It is the only part of porthole that accepts input from outside the editor. Which URLs it accepts is the question below.

## Open question

### QST-LINK-ALLOWLIST: Which URLs may a link open in the pinned window?
- Status: answered
- Why asking: A `vscode://` link can be placed on any web page. Once you have told VS Code not to ask again for this extension, clicking such a link would put whatever it names in a window that stays on top of everything.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — local files and localhost only**: a link may open a local `.html` file or an `http://localhost` / `127.0.0.1` URL. Any other URL is refused with a message. Opening a remote page stays possible from inside VS Code with the "Open URL" command.
- **B — the brief's list**: as A, plus any `https://` URL. Simpler to explain; a link from anywhere can show any secure site in the pinned window.
- **C — A by default, B behind a setting**: `porthole.allowRemoteLinks`, off unless you turn it on.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — local files and localhost only.** *Rationale*: every use named so far — the original prompt, the brief's `just pin` recipe, ADR-0001's answer — is a local task page; nothing has asked for a remote page by link, and an always-on-top window that any web page can fill is the one way this small tool could be turned against its user. *Confidence*: 0.7 — because the uses are read from three documents, but I have not checked how VS Code's own confirmation prompt behaves for this handler. *If wrong*: if you want to pop remote dashboards or docs from scripts, this flips to C.

**ANS:** (by Jérémie Lumbroso)
Option C. We already have mechanisms by which to publish local dashboards in some pre-approved remote location so it can be accessible, for instance, from the phone, on the go — as opposed to just the local machine. So Option C, which is Option A by default, with an opt-in override to remote (secure) links is the most convenient and sensible option.

---

## Field notes from a consuming seat (a seat visiting from another hive, Claude Fable 5 — 2026-10-15, invited by Jérémie)

NOT: Tonight produced a live specimen of the exact failure this handler exists
for. At T-5 before his class, I delivered links and a paste-ready survey in
terminal chat — which scrolls away one message later and (his words) "I can't
select anything in the chat." The repair that worked was one file, re-opened
on every change. Porthole's pop-on-top window is that repair made structural.
One addition to the Context section's cast: the agent writing the page is often
a CLI agent (Claude Code), not a `just` recipe — on macOS it triggers the same
handler with `open "vscode://jlumbroso.porthole/open?path=…"`, so the one-line
contract already covers it; worth a sentence so CLI seats know the door exists.

NOT: QST-LINK-ALLOWLIST's ANS is corroborated by same-day field use: his
"pre-approved remote location" pattern ran today (a deck published to
a pre-approved remote address so he could review on foot). If `allowRemoteLinks`
ever wants tightening without losing that use, a per-host pattern
suggests a host-list refinement of C rather than a
boolean — noted, not asked; the boolean serves today.

### QST-REOPEN-SEMANTICS: What does a second `/open` of the same path do — and does the pinned page follow file edits?
- Status: unanswered
- Why asking: the live-class pattern (tonight: one deck live-patched four times
  in twenty minutes, one links/survey file rewritten twice, each change needing
  to reach his eyes NOW) makes two behaviors load-bearing: (a) re-invoking
  `/open` on an already-pinned path should refresh/refocus the existing window,
  not spawn a sibling; (b) ideally the pinned page reloads when its file
  changes, so the agent's edit IS the delivery. If (b) exists, the agent never
  needs to re-invoke at all.
- Need: a sentence on current behavior (or pick: refocus+reload / refocus only
  / new window each time), and whether (b) is in scope for M4 or a later ADR.

**Recommendation**: (by the consuming seat, Claude Fable 5, 2026-10-15)
**Refocus + reload on repeat `/open`; file-watch reload as a follow-up.**
*Rationale*: idempotent open is cheap and makes the agent's retry loop safe;
file-watching is the full fix for the critical-window use but deserves its own
decision (watcher lifecycle, when the human is mid-read). *Confidence*: 0.6 —
because I have not read porthole's window-management code, only this ADR trail.
*If wrong*: if webview panels are already singletons per path in the house
scaffold, (a) is free and this QST reduces to (b).

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-17) — stacked under the one above, with what was run tonight
**Both already happen; nothing to build for either.** *Rationale*, from a run on Jérémie's machine (macOS, VS Code 1.141.0, Porthole 0.3.0 installed locally, unpublished; outside `open` per ADR-0013), Glazier sending links from a terminal and Jérémie watching:
- **(a) A second `/open` of the same path replaces the window; it does not add a sibling.** Links at 01:01:08 and 01:01:20 for `samples/tasks.html` at 500×700: Porthole's log shows two opens (188 ms and 229 ms); Jérémie saw one window afterwards, "at the same place and size". An earlier pair (00:55:25, 00:59:10) also left one window, the old one closed. This is VS Code moving an open tab into the new floating window, the same mechanism as Cycle Size (ADR-0007). **Ran**, twice.
- **(b) The page follows edits to its file.** At 01:01:32 the page's heading was changed on disk with no link sent; the HTML page in the floating window showed the new heading without a click or a reload (Jérémie: "changed immediately!"). For Markdown, VS Code's own preview has always updated as the file changes (ADR-0015, checked in 0.2.0). **Ran** once for HTML.
So for the live-class pattern, the agent's edit is the delivery, and a repeat `/open` stays safe when the window was closed or the agent cannot tell.
*Confidence*: 0.8 — because both were seen, but (b) only once, on one VS Code version, and no source I have read says why the integrated browser reloads a `file:` page (a file watcher, or something else); a later VS Code could change it. *If wrong*: if a later run shows a stale page after an edit, (b) becomes a follow-up (Porthole calling the browser's reload, which ADR-0014's `refresh` verb needs anyway).
**Also, for CLI seats**: the link parameter is `file=`, not `path=` as in the field note above: `open 'vscode://jlumbroso.porthole/v1/open?file=/abs/page.html'`. A `path=` link is refused with "the link names no file (expected ?file=…)". And outside `open` exists only in Porthole 0.3.0, not yet published.

**ANS:** (by <name>, <date optional>)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Links

* Kept by [ADR-0001](0001-founding-identity-gate-and-crew-shape.md), QST-TRIGGER
* Pattern from [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)
