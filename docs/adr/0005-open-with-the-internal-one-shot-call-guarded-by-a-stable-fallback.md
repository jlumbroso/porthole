<!-- adr template version: "adr-madr 3.10.0" -->

# Open with the internal one-shot call, guarded by a stable fallback

* Status: accepted
* Deciders: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5); proposed by Claude Opus 5.5 in the design brief
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0002; confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md).

## Context and Problem Statement

No public VS Code API opens an editor in a new floating window at a chosen size. An internal command does. Should porthole depend on it?

## Decision Drivers

* The window must open at an exact small size, compact and pinned, in one gesture.
* An internal command can change in any VS Code update, and VS Code updates often.

## Considered Options

* Internal `_workbench.openWith` into group `-3` as the primary path, with a public-command fallback
* Public commands only (`vscode.openWith`, then Move into New Window, compact, pin)
* A keybinding with `runCommands`, no extension

## Decision Outcome

Chosen option: "Internal call as the primary path, with a public-command fallback", because only the internal call sets size, compact and pin at window creation, and the spike showed both paths working on 1.141.0: the internal call in five runs out of five (new tab group within 142 ms), the fallback in four out of four.

The rules that go with it:

* **Success is a new tab group**, observed within a timeout. No new group, or a throw, means fall back, and say why in the log.
* **A late success is still a success.** If a group appears after the fallback has started, porthole must not leave two windows.
* **`porthole.useInternalApi: false`** forces the fallback.
* **The spike is the regression check.** `spike/` stays in the repo and is re-run after VS Code updates until an automated check replaces it (ADR-0002, QST-SPIKE-AUTOMATION).

### Positive Consequences

* One step, no flash, exact size.

### Negative Consequences

* May break on any update. The fallback then gives a working but larger window (about 1024×768), and it shows: the page opens in the main window first and is then moved out.
* The fallback's compact and pin commands act on the active window, so it depends on focus having moved within a 200 ms pause (Surveyor's source check). Clean in four runs; not proven.

## Pros and Cons of the Options

### Public commands only

* Good, because nothing internal is called.
* Bad, because the window opens at VS Code's default size and cannot be resized by an extension.

### A keybinding with `runCommands`

* Good, because it needs no extension at all.
* Bad, because it has the same size limit, cannot be triggered from outside VS Code, and cannot recover when a step fails.

## Links

* Confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md)
* The call chain, read at tag 1.141.0: [`docs/reviews/2026-10-12-design-brief-source-check.md`](../reviews/2026-10-12-design-brief-source-check.md)
