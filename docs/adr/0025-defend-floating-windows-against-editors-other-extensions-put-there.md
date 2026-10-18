<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Defend floating windows against editors other extensions put there

- **Date**: 2026-10-18
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: When another extension opens a file into one of Porthole's floating windows by its column number, Porthole should notice the extra tab and move it to the main window, so the floating window keeps its one page; one question decides whether that happens automatically, by asking, or not at all.

---

## Originating Context

**Source**: Jérémie, 2026-10-18, after ADR-0024's finding 3 (the ADR Manager's "Open in file ↗" opened an ADR inside a Porthole window): *"we should plan this defensively, because even if we can do better practices in our own development, there are other extensions other that will exhibit this and if we can program defensively, that would be helpful and useful."* The ADR Manager's own fix went to its crew the same day (`vscode-adrs-for-ai/docs/inbox/2026-10-18-1810-glazier-to-gleaner-open-in-file-lands-in-a-floating-window.md`).

**Agency Grant**: plan it; build after the answer.

---

## Explicitation

**The gap auto-lock leaves.** VS Code's `workbench.editor.autoLockGroups`, which Porthole asks to turn on (ADR-0019), keeps a floating window to its page against editors opened *without* a target. An extension that names a column (`ViewColumn.Two`, `Three`, …) reaches a group by its place in the list of all groups, floating windows included, and an explicitly targeted group takes the editor even when locked (ADR-0024, finding 3). Any extension written before floating windows existed may do this. The result is a second tab in the floating window, which brings its tab bar back and hides the page.

**What Porthole can see and do** (read at 1.141.0, not run):

- **See**: `window.tabGroups.onDidChangeTabs` reports each tab opened, with its group. Porthole knows which groups are its windows, and that each holds one page. A tab opened in one of those groups, other than the page, is the case to handle.
- **Move**: VS Code's command for moving one editor to another group (`moveActiveEditor`, behind "Move Editor into First Group") acts on the *active* editor, and an editor opened by another extension "without taking focus" is not the active one. So the public route is to **close the tab in the floating window and reopen it in the main window**: `tabGroups.close(tab)`, then `showTextDocument` for a text file (passing the cursor position and visible lines the other extension had just set, read from `window.visibleTextEditors`), or `vscode.openWith` with its editor type for a custom editor or notebook.
- **Cannot move safely**: a tab with unsaved changes (closing it would ask to save; left alone), and kinds with nothing to reopen from (a webview panel, a terminal; left alone).
- **Where to reopen**: the first editor group that is not a Porthole window, which is the main window's first group. This is not quite where the other extension meant (the ADR Manager meant "beside my panel"); it is the nearest place Porthole can name. `ViewColumn.Beside` would be right when the person had just clicked in the main window, and would split the floating window itself when they had clicked in the floating window; Porthole cannot tell which reliably, because the extension API's active group lags (microsoft/vscode#341430).

**The doubt that shapes the question.** Porthole cannot tell an extension's explicit open from **you dragging a tab into a floating window on purpose**. Both arrive as "a tab opened in that group". An automatic move would also move a tab you placed there.

**Confirm**: Jérémie, through the question below.

---

## Questions

### QST-GUARD-ACTION: When another editor lands in one of Porthole's floating windows, what should Porthole do?
- Status: unanswered
- Why asking: This decides whether Porthole acts on its own each time it happens, asks you, or stays out of it. The case that prompted it: the ADR Manager's "Open in file ↗" put an ADR into your floating window as a second tab, which brought the tab bar back (ADR-0024, finding 3). Other extensions will do the same; the fix at each source helps only that source. Porthole can move the tab to the main window's first editor group (keeping a text file's cursor where the other extension put it), but it cannot tell such a tab from one you dragged in on purpose, and it leaves alone a tab with unsaved changes or one it cannot reopen (a webview, a terminal).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — move it, always**: the tab leaves the floating window at once and opens in the main window; Porthole's log says so. No setting. A tab you dragged in on purpose is moved too.
- **B — move it, with a switch to turn that off**: as A, plus one setting (on by default) for people who put tabs into floating windows themselves. The setting's name goes to the naming review first.
- **C — ask each time**: a notice says "{file} opened inside Porthole's floating window", with a button that moves it. Nothing moves without a click; the tab bar stays until then.
- **D — do nothing**: the README says which extensions do this and why, and you move tabs out by hand.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**B — move it, with a switch.** *Rationale*: the case Jérémie met is the common one (an extension that predates floating windows naming a column), and the move restores what auto-lock and Porthole's one-tab design promise; dragging a second tab into a compact floating window on purpose is rare, since it brings back the very tab bar compactness hides, but it is a real use, and a switch costs one setting where an unwanted move costs trust. C spends your attention each time on a decision that is almost always the same; D leaves the problem with you. *Confidence*: 0.65 — because the close-and-reopen route has never run, and I do not know how often you drag tabs between windows. *If wrong*: if the move proves flickery or loses the other extension's place in the file, C; if you never drag tabs into floating windows, A.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending QST-GUARD-ACTION

Settled regardless: the fix at the source is still worth sending to each extension that does this (as for the ADR Manager); a tab with unsaved changes is never closed by Porthole.

---

## Action Items

- [ ] Answer QST-GUARD-ACTION — Owner: Jérémie
- [ ] If A or B: build it with regression tests (the ADR Manager's call, replayed against the mock), name any setting through the naming review, and write a hand check that also answers whether the tab bar hides again once the extra tab leaves — Owner: Glazier
- [ ] README known limit: extensions that open by a fixed column number — Owner: Purser, once the behavior is decided

---

## Iterations

### Iteration 1 (2026-10-18)
- Trigger: Jérémie's request, after ADR-0024's finding 3
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related: [ADR-0019](0019-keep-the-floating-window-to-one-tab.md) (auto-lock), [ADR-0024](0024-floating-windows-across-editor-kinds-and-vs-code-windows.md) (finding 3)
- Upstream: microsoft/vscode#341430 (the extension API's active group lags)
