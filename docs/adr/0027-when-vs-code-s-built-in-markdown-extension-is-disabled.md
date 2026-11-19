<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
  plugin: adr@adrs4ai
-->

# When VS Code's built-in Markdown extension is disabled

- **Date**: 2026-11-19
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5); Surveyor 5.1 (the empty window, in VS Code's source); the naming review (the new words)

**TL;DR**: With VS Code's built-in Markdown Language Features disabled, a Markdown page sent to Porthole opened as two windows, one with the source as text and one empty, and the only explanation was a one-time warning easily missed; Porthole should check before it opens anything, open no window it cannot fill, say why every time with a way to fix it, and its documentation should say it needs that built-in.

---

## Originating Context

**Source**: Jérémie, 2026-11-19, after a model in another project (CAM HQ) sent Porthole a link to a Markdown file: *"when Lapidary of CAM HQ tried to porthole this it showed up as markdown text as opposed to rendered? Is it because we needed one of the extensions I recently uninstalled?"* Then, after trying:

> OK, I tried:
> -> just enabling the extended markdown. That didn't work
> -> so I disabled extended and just turned on built in. That worked.
> -> when built-in markdonw was disabled, two windows would open: One with the markdown code and the other with empty just empty everything
> We should detect this failure mode better. The encouragement was from a Fable 5.2 session helping me save resources from VS code windows. We should note it disables Porthole's ability.

**Porthole's log of the open** (VS Code 1.147.0, window 9, 2026-11-19): `outside link: opening …/teaching-segments.md`; `markdown colors: could not update the stylesheet: Error: command 'markdown.preview.refresh' not found`; `internal open: new window after 322 ms at 420×640`; `the window opened file:///…/teaching-segments.md as text, not in its Markdown preview (VS Code 1.147.0)`.

---

## Explicitation

**What I understand**:

1. **Why it happens.** Porthole renders nothing itself (ADR-0004, ADR-0015): a Markdown file opens in VS Code's own Markdown preview (`vscode.markdown.preview.editor`), which belongs to the built-in **Markdown Language Features** extension. Disabled, that editor and its commands do not exist; "the extended markdown" (Markdown Preview Enhanced, a third-party extension) has a different editor that Porthole does not use, which is why enabling it alone did not help.
2. **What Porthole does today.** `warnIfOpenedAsText` (`src/miniWindow.ts`) notices afterwards that the window holds text, logs it, and shows a warning **once per session** ("Porthole: VS Code opened the file as text; its Markdown preview did not take it. Check that the built-in Markdown extension is enabled."). Jérémie did not see it; a model that sent the link never does. And a window has already opened by then.
3. **The second, empty window is unexplained.** Porthole's log shows one internal open, and Jérémie saw two windows. Opening a missing editor id into a new floating window (`_workbench.openWith`, group `-3`) may create the window and then fall back to the text editor elsewhere; that is a reading for Surveyor, not a guess to build on.
4. **Where the advice came from.** A session helping Jérémie reduce VS Code's resource use suggested disabling the built-in; that advice was never written down, so there is nothing to annotate except our own documentation: Porthole's README and listing, the manual, and the skill for models must say that Markdown pages need the built-in Markdown Language Features enabled.

**Confirm**: Jérémie, QST-MARKDOWN-OFF.

---

## Questions

### QST-MARKDOWN-OFF: When VS Code's built-in Markdown extension is disabled and a Markdown page is sent to Porthole, what should Porthole do?
- Status: unanswered
- Why asking: Porthole shows a Markdown file in VS Code's own Markdown preview, which belongs to the built-in **Markdown Language Features** extension. When that built-in is disabled (Jérémie had disabled it to save resources, on another session's advice), a Markdown page sent to Porthole on 2026-11-19 opened as two windows, one with the file's source as text and one empty, and the only explanation was a warning shown once per session, which he did not see. Porthole can check whether the built-in is enabled before it opens anything (`vscode.extensions.getExtension('vscode.markdown-language-features')`). HTML pages are not affected: they open in VS Code's integrated browser.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — open nothing, and say why every time**: no window; a notice each time ("this Markdown page needs VS Code's built-in Markdown extension, which is disabled") with a button that opens that extension in the Extensions view, where one click enables it. A model that sent the link sees nothing open, and Porthole's log says why.
- **B — open the source as text, and say why every time**: one floating window with the file as plain text (readable, not rendered), and the same notice and button each time.
- **C — open the source as text in the main window**: no floating window; the file opens as an ordinary tab, with the notice.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-11-19)
**A — open nothing, and say why every time.** *Rationale*: Porthole's promise is a page you can read beside your work; a window of raw Markdown is not that page, and today's run shows the half-open state is the confusing one (two windows, one empty, no explanation). Refusing is what Porthole already does for every other link it cannot honor (a file outside the allowed folders, a newer version), so the person and the model meet one behavior: nothing opens, and the notice says exactly what to change. *Confidence*: 0.65 — because a person may still want to read the text right away, which B serves. *If wrong*: B, if reading the source at once matters more than a clean refusal; C, if a floating window of source text is itself the confusing part.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

Not yet: QST-MARKDOWN-OFF, and Surveyor's reading of the second window.

---

## Action Items

- [ ] Answer QST-MARKDOWN-OFF — Owner: Jérémie
- [ ] Read, at tag 1.147.0, what `_workbench.openWith` into group `-3` does with an editor id whose extension is disabled: where the empty floating window comes from, and whether a check before the open avoids it entirely — Owner: Surveyor 5.1
- [ ] Build the check before the open, the chosen behavior, and a regression test that fails on today's code (a disabled built-in leads to no empty window, and the notice every time) — Owner: Glazier
- [ ] Name the notice and its button — Owner: the naming review
- [ ] Say in the README, the listing, the manual and the skill for models that Markdown pages need VS Code's built-in Markdown Language Features enabled (and that disabling it to save resources turns that off) — Owner: Purser (README, listing), Sounder 6 (manual), Glazier (skill)

---

## Iterations

### Iteration 1 (2026-11-19)
- Trigger: Jérémie's report, Lapidary's link from CAM HQ, and his three tries
- Contributors: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
- Changes: the failure read in Porthole's log; the cause; one question; the empty window sent to Surveyor
- Outcome: `Draft`

---

## Links

- How Markdown opens: ADR-0015 (Markdown in floating windows), ADR-0022 (light or dark Markdown)
- The code: `src/miniWindow.ts` (`editorFor`, `warnIfOpenedAsText`), `src/markdownColors.ts` (`markdown.preview.refresh`)
