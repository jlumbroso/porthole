<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Markdown in a floating window

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), with Sounder 6 in the seed's thread

**TL;DR**: Let porthole open a `.md` file rendered, not as source — most simply by putting VS Code's own Markdown preview into the floating window, which Spike 1 tests; one question decides whether that read-only view is enough.

---

## Originating Context

**Source**: `Seed: docs/adr/seed-2026-10-13-porthole-for-models.md`, Jérémie, verbatim: *"Another thing I'm thinking: Why not allow the opening of Markdown file in the porthole — but rendered in HTML?"* Models write plans and checklists in Markdown far more often than in HTML.

**Agency Grant**: Chunk the seed into ORRCF questions, fully in template.

---

## Explicitation

**Two routes, read in source at 1.141.0, neither run:**

1. **VS Code's own Markdown preview.** The built-in Markdown extension registers its preview as an editor of its own, `vscode.markdown.preview.editor`. The same internal call porthole uses for HTML should open that preview into a floating window, sized, compact and pinned. It updates as the file changes, follows your theme, and has **no browser toolbar**. It is not a web page: a page's scripts and storage do not apply there.
2. **Render to HTML, show in the integrated browser.** Porthole asks the Markdown extension to render (`markdown.api.render`), writes the HTML to a temporary file, and opens that as today, re-rendering on every save. Everything a page can do works, at the cost of temporary files and rewriting relative links and images.

Spike 1 ([ADR-0018](0018-spike-1-markdown-preview-and-focus.md), QST-SPIKE1-MD) tests route 1.

**Confirm**: Jérémie, through the question below and Spike 1.

---

## Questions

### QST-MD-MODE: When porthole opens a `.md` file, should the floating window be read-only, or a live page?
- Status: unanswered
- Why asking: The two routes above differ in exactly this. A read-only view is nearly free if Spike 1 works. A live page, where you can tick a task's box and have it stay ticked, needs the second route and a way for ticks to reach the file.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — read-only, VS Code's preview**: the rendered Markdown, updating as the file changes. Task boxes are shown but clicking them does nothing; you or a model edit the file.
- **B — a live page in the integrated browser**: rendered to HTML, with clickable boxes; making a tick change the `.md` file itself is a further step.
- **C — A now, B later if wanted**: ship A when Spike 1 passes, keep B as a possible follow-up.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — read-only now, a live page later if wanted.** *Rationale*: A solves "pull up that plan" for the cost of a few lines if Spike 1 passes, and Sounder agrees ("a readable plan solves much of the named need without an interactive page protocol"); B is a separate design, because a tick in a rendered page must find its way back into the Markdown source to mean anything. *Confidence*: 0.7 — because it depends on Spike 1's outcome. *If wrong*: if Spike 1 shows the preview cannot float correctly, or if ticking boxes in a plan is what you actually want, this flips to B.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending QST-MD-MODE and Spike 1

Settled regardless: what porthole reports about a Markdown window keeps the source file and the rendered view distinct, and says whether the view is interactive (Sounder).

---

## Action Items

- [ ] Answer QST-MD-MODE — Owner: Jérémie
- [ ] Run Spike 1's Markdown question — Owner: Jérémie ([ADR-0018](0018-spike-1-markdown-preview-and-focus.md))

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0004](0004-reuse-the-integrated-browser-build-no-webview.md) (route 1 is a webview, which ADR-0004 decided against for HTML), [ADR-0018](0018-spike-1-markdown-preview-and-focus.md)
