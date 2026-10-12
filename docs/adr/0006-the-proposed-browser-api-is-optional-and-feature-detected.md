<!-- adr template version: "adr-madr 3.10.0" -->

# The proposed browser API is optional and feature-detected

* Status: proposed
* Deciders: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5); proposed by Claude Opus 5.5 in the design brief
* Date: 2026-10-12

Technical Story: `docs/INITIAL-DESIGN-BRIEF.md`, "Decisions to record", row 0003. Not yet tested; belongs to milestone M2.

## Context and Problem Statement

Popping out a page that is already open in a browser tab needs the tab's URL. Stable API does not expose it; the proposed `browser` API does. Should porthole require that API?

## Decision Drivers

* Popping out a file must work on a stock VS Code with no flags.
* Proposed APIs are unstable and need an opt-in launch flag or `argv.json` entry.

## Considered Options

* Use the proposed API when present, detect it at runtime, and degrade without it
* Require the proposed API
* Never use it

## Decision Outcome

Chosen option: "Use it when present, detect at runtime, degrade without it", because the file route — the main use — never needs it, and the tab route still works without it at VS Code's default window size.

This stays **proposed** until M2 runs it. Two things are known only from source so far (Surveyor's check): the gate is code, not policy, so a named extension keeps its proposals on a stable build; and a tab opened with the globe button would be duplicated rather than moved, because it carries no link to its source file.

### Positive Consequences

* No flag is needed for the main use.

### Negative Consequences

* Without the API, a browser tab pops out at about 1024×768 and the original tab stays open.
* Two code paths for one command.

## Links

* Source evidence: [`docs/reviews/2026-10-12-design-brief-source-check.md`](../reviews/2026-10-12-design-brief-source-check.md), notes 5 and 12
* To be run at M2; see the follow-ups in [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md)
