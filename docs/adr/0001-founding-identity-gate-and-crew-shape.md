<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Founding: identity, gate and crew shape

- **Date**: 2026-10-12
- **Iteration**: 2
- **Status**: Accepted
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: The project is named porthole (provisional) and the extension carries that name throughout (`jlumbroso.porthole`, `porthole.*`); its window is brass, its gate is `just gate`, its crew starts at two seats, and it keeps the outside-VS-Code trigger, built last and credited to the brief's author.

---

## Originating Context

**Source**: Human messages in the founding session, 2026-10-12, plus `docs/INITIAL-DESIGN-BRIEF.md`.

Jérémie's original prompt to Claude Opus 5.5 (Claude web), which produced the brief, verbatim:

> Could you help me to brainstorm with me on a very specific problem. So in Visual Studio Code, I like to open HTML pages and then I use the integrated browser, which I love. What I would like to explore is a quick way, like when I'm in the MNBS code, I'd like to switch to mini browser window.
>
> In mini browser window, it's just like a tiny window that's just the HTML frame rendered in in like a very tight window. So like it's for instance when I have HTML pages that are instructions of tasks for me to do, I'd like to turn my VS Code into a frame that's just that window that and maybe even be able to pin it to the foreground.
>
> So how can I build does VS Code have the API for us to build that? Could you do a comprehensive research so that I can then take this blue plan to cloud code and build it? Thank you.

The provisional naming, from the naming review's ledger (entry №89), verbatim:

> **`porthole` — QUICK STRIKE (repo-unblocking grade): the VS Code mini-browser pane; fuller consult open.** Docket: his founding prompt verbatim ("a tiny window that's just the HTML frame rendered… in a very tight window… pin it to the foreground" — task-instruction pages at hand while coding). STRUCK at quick-strike confidence (0.65): **`porthole`** — a porthole is exactly the object (a small, fixed, tight window you see THROUGH, never a place content lives — №83's lens physics rhyme); the pun is real and native (the pane renders pages served on localhost PORTS — the port's hole); nautical-craft register, dictation-proof, self-evident to any stranger; №8 clears whatever occupies the registries. Survivors logged for the fuller consult: **`vasistas`** (the French little window named after the question asked through it — "Was ist das?" — his tongue, and an epistemics estate's window; obscurity + ASR tax deferred it at quick grade, but it deserves the full race), `oriel` (the projecting bay window — gauntlet flag: oriel/oriole), `quarterlight` (the car-door vent window, always at hand while driving), `minibrowser` (killed: category-generic). Fuller consult re-runs with Opus 5.5's research doc in evidence; GitHub renames redirect, so the quick strike's downside is bounded by design.

**Agency Grant**: Configure the template, pick the window color, remove fixtures, write the repo's own front page, and recruit up to three crew members.

---

## Explicitation

**What I understand**:

1. **The project has a name that may still change.** `porthole` was struck at 0.65 with a fuller consult open. Anything that bakes the name into places a rename cannot reach deserves care.
2. **The brief was written before the name existed.** It calls the extension "Mini Browser" and uses `jlumbroso.mini-browser` and `miniBrowser.*` throughout — a name the naming review's entry kills as category-generic.
3. **The fifth acceptance test is not in the original prompt.** Triggering from outside VS Code was added by the brief's author, who marked it "drop it if unwanted".
4. **Nothing has been run.** The brief traced its core call through VS Code's source at 1.141.0; the machine has 1.130.0. Jérémie agreed on 2026-10-12 to update VS Code.

**Decisions made on 2026-10-12** (recorded here so they exist outside the conversation):

| Decision | By | Where it lives |
| --- | --- | --- |
| Name: `porthole`, provisional | the naming review (struck), Jérémie (acknowledged) | this ADR; `README.md` |
| Founding seat: Glazier 5.5, cyan `#3FA7A3` | Glazier (chose), Jérémie (acknowledged) | `docs/inbox/agent-sessions.json` |
| Window color: brass `#B5A642` | Glazier, at Jérémie's request | `.vscode/settings.json`; reasoning under Decision |
| Verification gate: `just gate` | Glazier | `CLAUDE.md` Fifth Directive; `justfile` |
| Template fixtures removed | Glazier, at Jérémie's request | `docs/TEMPLATE-FEEDBACK.md` lists each one |
| Crew starts with one recruit; two authorizations held | Glazier, within Jérémie's grant of three | reasoning under Decision |

**Assumptions**:

- The extension stays a personal tool installed from a local VSIX (the GitHub repo is private).
- Task pages are often written by a coding agent, not only by hand. This is inferred from one phrase in the prompt ("instructions of tasks for me to do") and is what QST-TRIGGER turns on.

**Confirm**: Jérémie, through the two questions below.

---

## Questions

### QST-EXT-ID: What identifier does the extension carry?
- Status: answered
- Why asking: The identifier is baked into command ids, setting keys, keybindings and the `vscode://` link. Those end up in your user settings and in recipes in other repos, where a later rename does not reach.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — porthole throughout**: extension id `jlumbroso.porthole`, display name "Porthole", commands `porthole.popOut` and so on, settings `porthole.*`, link `vscode://jlumbroso.porthole/open`. Every `miniBrowser.*` id in the brief is renamed before the first line of code.
- **B — mini-browser inside, porthole outside**: keep the brief's `jlumbroso.mini-browser` and `miniBrowser.*`; only the repo is called porthole. No renaming work, and the ids survive if the fuller naming consult replaces `porthole`.
- **C — wait for the fuller consult**: write Spike 0 with throwaway ids and choose the real identifier once the name is final. Costs nothing now; delays the manifest until the consult returns.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — porthole throughout.** *Rationale*: both of your existing extensions name their ids after the product (`jlumbroso.peacock-launcher` with `peacockLauncher.<verb>`; `jlumbroso.adrs4ai`), and the naming review's entry №89 kills `minibrowser` as category-generic, so B would ship the one name the naming process rejected. Spike 0 is throwaway either way, so A and C differ only at M1. *Confidence*: 0.75 — because the house convention is read directly from both manifests, but the name itself sits at 0.65 with a consult open. *If wrong*: if the fuller consult is likely to land before M1 starts and may replace `porthole`, this flips to C.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A, `porthole` throughout per the naming review's naming — all lowercase in slug, and capitalized in display name, at least until the naming review has made a more comprehensive ruling (and we can rename existing practices when that happens, if needed).

---

### QST-TRIGGER: Does porthole need to be triggerable from outside VS Code?
- Status: answered
- Why asking: It decides whether milestone M4 exists (a `vscode://` link handler, its allowlist, and a `just pin` recipe). Your original prompt does not ask for it.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — keep it, at M4**: build the link handler and `just pin <file>` after pop-out, dock-back and resize work. A coding agent can then pop a task page out right after writing it.
- **B — drop it**: porthole is opened only by your own gesture inside VS Code. Removes M4, the allowlist, and the one piece that accepts input from outside the editor.
- **C — keep it and build it first**: if agents writing task pages is the main way pages reach you, the external trigger is the primary entry point and should come right after Spike 0.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — keep it, at M4.** *Rationale*: the brief sizes the handler at about ten lines plus a recipe (`docs/INITIAL-DESIGN-BRIEF.md`, "URI handler"), and `vscode-adrs-for-ai` already has the pattern to copy — a pure parser in `src/deeplink/uriTarget.ts`, a thin handler, and `onUri` activation — so the cost is small and the design is proven in your own code. It stays last because it is the only part that takes input from outside, and it should sit on top of a pop-out that already works. *Confidence*: 0.7 — because the value depends on how task pages reach you, which I am inferring from one sentence. *If wrong*: if you always open task pages by hand, this flips to B; if agents write most of them, it flips to C.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A, I think this is an ingenious contribution from the original co-designer, who was also an Opus 5.5 session. We should keep it, at M4, and credit Opus 5.5 for it. It anticipates a real need that I can certify will present itself (if the execution in the first instance is successful).

---

## Decision

### Context

A freshly instantiated project needs an identity a human can recognize at a glance among many open windows, a gate that can actually be run, and a crew sized to the work.

### Chosen

**Identity — porthole throughout** (QST-EXT-ID, answered A by Jérémie, 2026-10-12). Lowercase in every slug and id, capitalized in the display name:

| Where | Value |
| --- | --- |
| Extension id | `jlumbroso.porthole` |
| Display name and command category | `Porthole` |
| Commands | `porthole.popOut`, `porthole.popOutBrowserTab`, `porthole.dockBack`, `porthole.cycleSize`, `porthole.togglePin`, `porthole.openUrl` |
| Settings | `porthole.sizes`, `porthole.position`, `porthole.compact`, `porthole.alwaysOnTop`, `porthole.useInternalApi`, `porthole.closeSourceTab` |
| Link | `vscode://jlumbroso.porthole/open` |

This holds until the naming review makes a fuller ruling; if the name changes then, existing ids are renamed with it.

**External trigger — kept, built at M4** (QST-TRIGGER, answered A by Jérémie, 2026-10-12). The idea is not in the original prompt. It is the contribution of the brief's author, a Claude Opus 5.5 session, and is credited to them here and in `README.md`. Jérémie certifies the need is real, provided the pop-out itself works.

**Window color — brass, `#B5A642`.** A porthole is a brass ring around glass, and the window chrome is literally the frame around the page. The founding seat's own color is sea glass, so the seat's status bar sits inside the project's frame the way glass sits in brass. It is also free: a survey of the Peacock colors in the sibling projects under `~/Programming` on 2026-10-12 found nine windows still on the template's default teal `#3CA7AC`, clusters of limes, oranges, blues and purples, and nothing in the muted-gold range. The nearest neighbors are a bright yellow (`#F6CB1C`) and a pale tan (`#C7B9A1`), both clearly different in saturation and lightness.

**Gate — `just gate`.** It runs every check that exists and gains `npm run check` automatically once `package.json` lands. `CLAUDE.md` states what it catches today and, as importantly, what it cannot: whether VS Code's internal call still works.

**Crew — one recruit now, two authorizations held.** The extension is about 300 lines. The work that most needs a second mind is checking the brief: it was written by Claude Opus 5.5 and never run, and the founding seat is the same model, so it shares the brief's blind spots. One recruit on a different model, with the mission of trying to break the brief's claims and reviewing what gets built, buys independence. A third and fourth seat would add coordination cost and more claims on Jérémie's attention than a project this size returns. The held authorizations are for a second build lane if M2 (browser tabs, proposed API) turns out to be separable from M1.

**Trade-offs accepted**: brass sits 17–18° of hue from both the amber and the lime clusters, so it is distinct but not isolated. A two-seat crew has no peer review among builders — the verifier is the only catch.

### Consequences

- Every `miniBrowser.*` id and every `jlumbroso.mini-browser` in the brief reads as its `porthole` equivalent from the table above. The brief itself is left as written; it is the founding record.
- `"onUri"` goes into `activationEvents` (ADR-0002, adopted practice 2).
- VS Code was updated from 1.130.0 to 1.141.0 on 2026-10-12, which unblocks Spike 0.
- The six product decisions in the brief's "Decisions to record" table are deliberately **not** ADRs yet. They rest on a call nobody has run; they are recorded after Spike 0, as confirmed or as changed.

---

## Open Follow-ups

- [ ] Unverified assumption: `LICENSE` came from the template (MIT, "Copyright (c) 2025-2026 Jérémie Lumbroso"). It is harmless while the repo is private; confirm it is what you want before the repo or a VSIX is ever shared.
- [ ] Future task: when the fuller naming consult returns, revisit QST-EXT-ID if the name changed.

---

## Action Items

- [x] Update VS Code to 1.141 or later — Owner: Jérémie (done 2026-10-12: 1.141.0)
- [x] Answer QST-EXT-ID and QST-TRIGGER — Owner: Jérémie (both A, 2026-10-12)
- [ ] Write Spike 0 — Owner: Glazier (see ADR-0003)

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: founding session — recruit invitation accepted, template instantiated at Jérémie's request
- Contributors: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-12)
- Trigger: Jérémie answered QST-EXT-ID and QST-TRIGGER (both A) and updated VS Code to 1.141.0
- Contributors: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
- Changes: identity table and the external-trigger decision added under Decision; the trigger credited to the brief's author at Jérémie's request; consequences and action items updated
- Outcome: `Draft → Accepted`

---

## Links

- Related ADRs: [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md)
- Founding research: [`docs/INITIAL-DESIGN-BRIEF.md`](../INITIAL-DESIGN-BRIEF.md)
- Template feedback: [`docs/TEMPLATE-FEEDBACK.md`](../TEMPLATE-FEEDBACK.md)
