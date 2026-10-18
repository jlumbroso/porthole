<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Defend floating windows against editors other extensions put there

- **Date**: 2026-10-18
- **Iteration**: 2
- **Status**: Accepted
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
- Status: answered
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
Yes, Option B, with a small tweak:
- We should have one setting with three modes:
   1. Default: "Move it"
   2. Your suggested alternative: Turn off
   3. Ask (with option to "Approve Now [i.e. which keeps the setting at Ask", "Deny Now [i.e. and keep setting]", "Approve Always [i.e. Move it setting]" and "Never Approve [i.e. Turn off]")
- We should default as you suggest to "Move it" — but I think that the third mode is preserving options if somebody ever reports this as an issue, so we can rapidly show that: (a) this was a design choice, (b) contingent on someone not feeling wronged by it, which would be the proof our experiment needs to move the default from 1 to 3.
- This is my implementation-level version of a falsifier. It's me expressing the epistemic humility that I'm not *sure* the right design choice is to make this override (moving a tab that appears, possibly from the user's intent, without asking), and setting a criterion on which to revert this decision.

---

### QST-NAME-GUARD: What are the setting, its three modes and the four buttons called?
- Status: answered
- Why asking: Jérémie's answer above fixes the behavior: **one setting with three modes**, default "move it", plus "turn off" and "ask"; and, when it asks, **four buttons** whose effects he defined: approve this time (the setting stays on "ask"), deny this time (it stays on "ask"), approve always (the setting becomes "move it"), never approve (the setting becomes "turn off"). The key and its values are permanent once published. His reason for the third mode is a falsifier at the level of the product: if someone reports a moved tab as a wrong, "ask" is already there to become the default. Provisional names, to be replaced by the review's ruling before anything ships:
  - setting `porthole.otherEditors`, values `move` (default), `ask`, `off`; description: "What Porthole does when another extension opens an editor inside one of its floating windows (which brings the tab bar back): move it to the main window, ask, or leave it."
  - the question, as a notice: "{file name} opened inside Porthole's floating window. Move it to the main window?"
  - buttons, in Jérémie's words: **Approve Now**, **Deny Now**, **Approve Always**, **Never Approve**
- Need: pick a letter (or override — any shape answers), or rule each name

Options:
- **A — as provisional**: the names above ship as they are.
- **B — the review's names**: the review rules the key, the three values, the notice and the four buttons, line by line.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**B — the review's names.** *Rationale*: by the house rule that a button repeats what it does ("Keep Compact", ADR-0021), "Approve" says less than "Move": the person is asked whether to *move* a tab, and "Approve Now" makes them translate. And `otherEditors` names the thing, not the question the setting controls ("a key that controls a question should read as the question it controls", ADR-0021). *Confidence*: 0.7 — because these are words. *If wrong*: if the review finds Jérémie's four labels clearest as they are, A for the buttons.

**Recommendation**: (by the naming review, 2026-10-18)

**B — ruled line by line, and the house's own prior language supplies the key.**

1. **The key: `porthole.keepToOneTab`**, values **`move`** (default) / **`ask`** / **`off`**. The repo already speaks this name — ADR-0019's own title is "Keep the floating window to one tab" — and it sits beside `askToKeepCompact` as kin: both goal-named keys in the compactness family. Each value is a plain answer to *how it keeps*: by moving, by asking, or not at all (`off` = "don't keep to one tab," true). One scope note on Glazier's citation: ADR-0021's read-as-the-question rule governs *ask-keys* (keys that control whether a question is asked); a behavior-key like this one is **goal-named** instead — `otherEditors` failed not by that rule but by naming the trigger population rather than any goal at all.
2. **The buttons: "Move It" · "Leave It" · "Always Move" · "Never Move".** Glazier's doubt is confirmed — "Approve" makes the person translate at the moment the notice exists to be effortless. The buttons answer the notice's own question ("Move it to the main window?") in its own words, and the contrast pair was already in the house's mouth: the provisional description's last words are *"move it to the main window, ask, or leave it"* — **"leave it" is porthole's own antonym**, found, not minted. Order: the per-time pair first (Move It, Leave It), the setting-writing pair after (Always Move, Never Move) — minimal commitment leads, per the Open Once precedent.
3. **The notice sentence ships as built** ("{file name} opened inside Porthole's floating window. Move it to the main window?") — event then question, the 0013-ruled pattern. **One required addition**: a detail line disclosing that the permanent pair writes the setting — *"Always Move and Never Move set porthole.keepToOneTab (to move / off), so Porthole won't ask again."* Buttons stay clean; the zone discloses — the 0013 law, applied here unchanged.
4. **The description, re-keyed, otherwise as drafted**: "What Porthole does when another extension opens an editor inside one of its floating windows (which brings the tab bar back): move it to the main window, ask, or leave it."

One admiring line for the record: the founder's "ask" mode as *"my implementation-level version of a falsifier"* is the falsifier culture compiled into a settings enum — if a moved tab is ever reported as a wrong, the evidence has a mode waiting for it. *Confidence*: 0.8 on key and buttons; the notice words are release-mutable as ever. *If wrong*: his four labels return at his word — they are his, and the review's case against them is ergonomic, not constitutional.

**ANS:** (by Jérémie Lumbroso)
Thanks to the naming review, and thanks specifically for the admiration towards the coherent application of our falsifier culture — I receive the praise!

Approving Option B as specified by the naming review, thanks Glazier 5.5 for mediating so well and faithfully.

---

### QST-CHECK-GUARD: Does the ADR Manager's "Open in file" now end up in the main window, at the question's line, with the floating window back to one tab?
- Status: answered
- Why asking: **What this finds out.** The guard is built and passes eight tests against a mocked VS Code, one of them replaying the ADR Manager's call (`src/otherEditors.ts`, commit after `4842478`). Three things only a real VS Code shows: whether closing the extra tab and opening it again in the main window works on a floating window's group; whether the cursor lands on the question's line, which the ADR Manager sets a moment after opening (Porthole waits a quarter of a second for it); and whether the floating window's tab bar hides again once it is back to one tab. The setting's name is provisional (QST-NAME-GUARD) and stays at its default, "move", throughout. **Safe**: nothing is written; the ADR file opens in the main window where you can close it.
- Need: pick a letter (or override — any shape answers). About two minutes.

**Where to do this.** In **your porthole workspace window** (title bar ending with `porthole`). No debug window.

**Before you start.** Run **Developer: Reload Window** (press **Shift+Cmd+P**, type `Reload Window`, press **Enter**); the build with the guard is installed. Close any floating window. Make sure the main window shows **one** editor group (no side-by-side split), as it did when this happened.

**Steps.** One action each.

1. **Pop out a page.** In the Explorer (**Shift+Cmd+E**), click `samples/tasks.html`, then press **Ctrl+Alt+M**. The sample task page opens in a floating window with no tab bar.
2. **Open the ADR Manager's questions.** Click back into the main window. Press **Shift+Cmd+P**, type `ADR Manager: Answer Open Questions`, press **Enter**. The **Open Questions** panel opens in the main window.
3. **Click "Open in file ↗"** on the question it shows (the small link near the question's text).
4. **Watch both windows for a second.** The ADR may appear for a moment as a second tab in the floating window. It should then **leave the floating window**, which goes back to **no tab bar**, and **open in the main window**, with the cursor on the question's line.
5. **Tidy up.** Close the ADR's tab in the main window and the floating window.

I read Porthole's log afterwards (a line beginning "other editors: moved").

Options:
- **A — all as described**: the ADR leaves the floating window, which has no tab bar again; it opens in the main window at the question's line.
- **B — the ADR stayed in the floating window**, with its tab bar.
- **C — it moved, but the floating window kept its tab bar**, with one tab.
- **D — it moved, but the cursor was at the top of the file**, not at the question.
- **E — something else**: say what you saw, for instance where the ADR opened.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**A — all as described** (a prediction). *Rationale*: closing a tab with `tabGroups.close` worked on a floating window's group today (ADR-0024, "closed the earlier floating window", three times); the tab event that starts the guard is the one Porthole already relies on in `firstTab`; and the cursor is read after a quarter-second pause from `visibleTextEditors`. *Confidence*: 0.55 — because whether a compact floating window hides its tab bar again when it drops back to one tab has never been observed, and the quarter second is a guess at the ADR Manager's timing. *If wrong*: B means the event never reached the guard or the window was not recognized as Porthole's (the log will say which); C means VS Code shows the tab bar once it has appeared, and the fix is to reopen the page in a fresh window after a move; D means the pause is too short, or the editor was not yet visible, and the guard should wait for the editor's selection to change instead of a fixed time.

**ANS:** (by Jérémie Lumbroso)
Option C. The ADR was never visible (or I did not notice) in the tab bar, but the tab bar was opened. It feels like you had predicted this previously: Even though you move the second tab, the floating window grows a tab bar and is no longer compact.

- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 4.07.05 PM.png` (before)
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 4.07.21 PM.png` (after)

---

NOT: **Reading of the answer** (Glazier 5.5, 2026-10-18). C, and the cause is now read in VS Code's source: a floating window leaves compact mode for good once it holds two editors ("leave compact mode when more than 1 editor is active", `src/vs/workbench/browser/parts/editor/auxiliaryEditorPart.ts` L309–323 at 1.141.0), and nothing returns it to compact mode when it drops back to one. So the move worked, and the window kept its tab bar. **A walk-back, stated:** my falsifier said C would mean reopening the page in a fresh window after a move. I chose instead to turn compact mode back on in the same window (VS Code's own "Turn On Compact Mode", which acts on the focused window): it keeps the window where the person put it and at its size, which a fresh window would not. The cost is a brief change of focus: Porthole focuses the floating window, turns compact mode on, then gives focus to the moved file in the main window. Built in `0bc8c52`, with a regression test that fails without it; checked by hand in QST-CHECK-GUARD-COMPACT below.

NOT: **The naming ruling, applied, with one deviation to report** (QST-NAME-GUARD, B, approved). `porthole.keepToOneTab` (`move`, `ask`, `off`), buttons **Move It**, **Leave It**, **Always Move**, **Never Move**, the description re-keyed, all in `0bc8c52`. The ruling put the disclosure ("Always Move and Never Move set porthole.keepToOneTab …") in a **detail line**, but only a modal dialog has one; the "ask" question is an ordinary notice, which does not stop your work, so the disclosure is its **second sentence** instead. Making it a modal would block VS Code each time a tab lands, which "ask" was not meant to do.

### QST-CHECK-GUARD-COMPACT: After the move, is the floating window compact again, with the ADR in the main window at its question?
- Status: unanswered
- Why asking: **What this finds out.** Whether VS Code's "Turn On Compact Mode" works when Porthole runs it on a floating window right after the extra tab leaves, whether focus ends in the main window on the ADR, and whether the brief change of focus is acceptable to watch. The rest of the guard passed in QST-CHECK-GUARD. **Safe**: nothing is written.
- Need: pick a letter (or override — any shape answers). About two minutes.

**Where to do this.** In **your porthole workspace window** (title bar ending with `porthole`), with **one** editor group in it (no side-by-side split). No debug window.

**Before you start.** Close any floating window. Run **Developer: Reload Window** (press **Shift+Cmd+P**, type `Reload Window`, press **Enter**); the newest build is installed.

**Steps.** One action each.

1. **Pop out a page.** In the Explorer (**Shift+Cmd+E**), click `samples/tasks.html`, then press **Ctrl+Alt+M**. The floating window opens with no tab bar.
2. **Open the ADR Manager's questions.** Click back into the main window. Press **Shift+Cmd+P**, type `ADR Manager: Answer Open Questions`, press **Enter**.
3. **Click "Open in file ↗"** on the question it shows.
4. **Watch for a second.** The floating window may take focus briefly. It should end with **no tab bar** (compact, as in step 1), and the **ADR should be open in the main window, with the cursor on the question's line and the keyboard there**: type nothing, but note where the cursor blinks.
5. **Tidy up.** Close the ADR's tab and the floating window.

Options:
- **A — all as described**: compact again, ADR in the main window at its question, keyboard in the main window.
- **B — the floating window kept its tab bar.**
- **C — compact again, but the keyboard stayed in the floating window.**
- **D — compact again, but the cursor was not at the question.**
- **E — something else**: say what you saw, including whether the change of focus was distracting.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**A** (a prediction). *Rationale*: the fallback path has run the same "Turn On Compact Mode" command after the same 200 ms pause since 0.1.0 and it made floating windows compact (Spike 0, ADR-0003); bringing a floating window forward by its column ran in ADR-0024; and the moved file is opened last, with focus. *Confidence*: 0.6 — because the command acts on whichever window is focused, and macOS may not have moved focus to the floating window within 200 ms. *If wrong*: B with the floating window focused means the command did nothing to a window that already left compact mode (then a fresh window is the fallback, my original falsifier); B with the main window focused means the pause is too short; C means the final open did not take focus, which `preserveFocus: false` should give; D means the quarter-second wait for the ADR Manager's cursor is still too short.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: B with Jérémie's three modes; build now with provisional names

From Jérémie's answer to QST-GUARD-ACTION (2026-10-18): one setting with three modes, default **move it**, plus **turn off** and **ask**; when asking, four answers, two for this time and two that change the setting. In his words, the third mode is *"my implementation-level version of a falsifier"*: the evidence that would move the default from "move it" to "ask" is someone reporting a moved tab as a wrong. Built with the provisional names of QST-NAME-GUARD; nothing ships before the review's ruling.

Settled regardless: the fix at the source is still worth sending to each extension that does this (as for the ADR Manager); a tab with unsaved changes is never closed by Porthole.

---

## Action Items

- [ ] Answer QST-GUARD-ACTION — Owner: Jérémie
- [x] If A or B: build it with regression tests (the ADR Manager's call, replayed against the mock), name any setting through the naming review, and write a hand check that also answers whether the tab bar hides again once the extra tab leaves — Owner: Glazier (2026-10-18: built, eight tests; QST-CHECK-GUARD; names in QST-NAME-GUARD)
- [ ] README known limit: extensions that open by a fixed column number — Owner: Purser, once the behavior is decided

---

## Iterations

### Iteration 1 (2026-10-18)
- Trigger: Jérémie's request, after ADR-0024's finding 3
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-18)
- Trigger: Jérémie answered QST-GUARD-ACTION (B, with three modes)
- Contributors: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
- Changes: decision recorded; QST-NAME-GUARD added for the naming review
- Outcome: `Accepted`

---

## Links

- Related: [ADR-0019](0019-keep-the-floating-window-to-one-tab.md) (auto-lock), [ADR-0024](0024-floating-windows-across-editor-kinds-and-vs-code-windows.md) (finding 3)
- Upstream: microsoft/vscode#341430 (the extension API's active group lags)
