<!-- adr template version: "adr-madr 3.10.0" -->

# Resize means re-open with new bounds

* Status: proposed — confirmed by evidence (Spike 0, ADR-0003; hands-on test, ADR-0010), not yet ratified by Jérémie
* Deciders: proposed by Claude Opus 5.5 in the design brief; recorded by Glazier 5.5 (Claude Opus 5.5); awaiting Jérémie Lumbroso (corrected 2026-10-12: I first listed him as a decider of a decision he had not made)
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0004; confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md).

## Context and Problem Statement

The mini window should step through size presets. No command an extension can reach resizes an existing floating window. How does porthole change the size?

## Considered Options

* Open the same file again at the new size and let VS Code move the tab
* Ask the user to drag the window
* Close the window and open a fresh one

## Decision Outcome

Chosen option: "Open the same file again at the new size", because the spike showed it does the right thing by itself: the tab opened in a new window, left the old one 14 ms later, the emptied window closed 51 ms after that, and the page was not reloaded — its load count and ticks were unchanged.

### Positive Consequences

* One call, the same one as the first pop-out, with different bounds.
* The page keeps its in-memory state across a resize.

### Negative Consequences

* A new window appears and the old one disappears; the position resets to VS Code's default centering unless `porthole.position` is set.
* It works only for pages opened from a file through porthole. A window produced by the fallback, or a tab opened with the globe button, is not found and moved (Surveyor's source check, note 5).
* The emptied window closes only while `workbench.editor.closeEmptyGroups` is at its default. With that setting off, porthole would have to close it.

## Pros and Cons of the Options

### Close the window and open a fresh one

* Good, because it does not rely on VS Code moving the tab.
* Bad, because the page reloads and loses any state it keeps outside storage.

## Links

* Confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md), question QST-SPIKE-TWICE
