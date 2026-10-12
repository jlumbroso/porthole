<!-- adr template version: "adr-madr 3.10.0" -->

# Reuse the integrated browser; build no webview

* Status: proposed — confirmed by evidence (Spike 0, ADR-0003; hands-on test, ADR-0010), not yet ratified by Jérémie
* Deciders: proposed by Claude Opus 5.5 in the design brief; recorded by Glazier 5.5 (Claude Opus 5.5); awaiting Jérémie Lumbroso (corrected 2026-10-12: I first listed him as a decider of a decision he had not made)
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0001; confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md).

## Context and Problem Statement

porthole has to show a rendered HTML page in a small window. Should it render the page itself in a webview, or hand the page to the browser VS Code already ships?

## Decision Drivers

* The page must stay live: reload when the file changes, keep checkboxes and stored state working.
* The extension should stay small enough for one person to maintain.

## Considered Options

* Reuse VS Code's integrated browser as the renderer
* Build a webview panel that loads the HTML

## Decision Outcome

Chosen option: "Reuse VS Code's integrated browser", because it already does everything the page needs and the spike saw it do so: it rendered a local file, reloaded about 0.4 s after the file was rewritten, and kept `localStorage` across reloads, closing the window, and restarting VS Code's second window.

### Positive Consequences

* porthole renders nothing. It only opens, sizes and moves a window.
* Zoom, permissions, cookies and storage are VS Code's to maintain.

### Negative Consequences

* VS Code desktop only, version 1.134 or later for local HTML files (Surveyor's source check); remote and virtual workspaces are out of scope.
* The integrated browser brings its own toolbar into the window (ADR-0003, QST-BROWSER-TOOLBAR).
* An extension cannot identify a browser tab afterwards: its `input` is `undefined` and its label follows the page title (ADR-0003).

## Pros and Cons of the Options

### Build a webview panel

* Good, because the extension would control every pixel, including having no toolbar.
* Bad, because a webview is sandboxed: local scripts, storage and reload-on-change would all have to be rebuilt.
* Bad, because a webview cannot be opened directly into a compact, pinned floating window by any call we know of.

## Links

* Confirmed by [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md)
* Source evidence: [`docs/reviews/2026-10-12-design-brief-source-check.md`](../reviews/2026-10-12-design-brief-source-check.md)
