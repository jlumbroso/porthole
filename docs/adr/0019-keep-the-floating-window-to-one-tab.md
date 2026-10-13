<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Keep the floating window to one tab

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), from Surveyor 5.1's source reading

**TL;DR**: Porthole's way of locking a floating window to one tab is unreliable — it was skipped on three of five opens in your log, and by Surveyor's reading it can lock the main window instead — so one question decides the replacement, and one step-by-step run confirms the cause before it goes upstream.

---

## Originating Context

**Source**: ADR-0010, iteration 4 (Jérémie's log: three of five pop-outs logged `not locking: the new window is not the active tab group`), and Surveyor's revised answer to QST-CYCLE-MISS in ADR-0010, with their brief `docs/inbox/archive/2026-10-13-1416-surveyor-to-glazier-…`.

**Agency Grant**: Decide the fix with Jérémie; the code is Glazier's.

---

## Explicitation

**Why porthole locks at all.** VS Code switches compact mode off when a second tab enters a floating window: the tab bar and status bar come back. Locking the window's tab group makes VS Code open other files elsewhere. In the 0.1.0 test (ADR-0010, QST-V1-LOCK) a locked window did keep a second file out.

**What Surveyor found, read in source at 1.141.0, not run:**

1. **Porthole asks the wrong question.** It checks `vscode.window.tabGroups.activeTabGroup` before locking. VS Code tells extensions which group is active only when a tab group is added or removed somewhere; a floating window's group is reported active only if keyboard focus happened to reach it before VS Code finished creating it. That race explains the three skipped locks, and the earlier Cycle Window Size misses (ADR-0010, QST-CYCLE-MISS).
2. **The lock command cannot be aimed.** `workbench.action.lockEditorGroup` locks VS Code's *own* idea of the active group, a different signal from the one porthole checks. When the two disagree, it can lock **the main window's** group, which would make files you open there go somewhere else. Not seen in any log.

**What VS Code offers instead** (read by Glazier in source at 1.141.0, not run): a setting, `workbench.editor.autoLockGroups`, keyed by editor type. When an editor of a listed type is the first one opened in a new group, and more than one group exists, VS Code locks *that* group itself, at the moment it opens (`workbench/browser/parts/editor/editorGroupView.ts` L1263–1272). For porthole the type would be `workbench.editor.browser`. No race and no aiming problem. The catch: it applies to every integrated-browser tab you open as the first tab of a new group, not only porthole's, for example a browser tab you split to the side.

**Confirm**: Jérémie, through the two questions below.

---

## Questions

### QST-LOCK-METHOD: How should porthole keep its floating window to one tab?
- Status: unanswered
- Why asking: The current method is unreliable and, by Surveyor's reading, can lock your main window's group by mistake. Each replacement trades something different.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — stop locking**: porthole never locks. If you open a file while a floating window has focus, it may open inside that window, which then shows tabs and a status bar again.
- **B — keep the command, but later**: wait until the page's tab exists and a short moment has passed, then lock. Narrows the race; does not remove it, so the main window can still be locked occasionally.
- **C — VS Code's auto-lock setting, set by porthole once with your consent**: the first time you pop out a page, porthole asks "Let VS Code keep Porthole's floating windows to one tab? This also locks any browser tab you open first in a new group." On yes, it turns on `workbench.editor.autoLockGroups` for the integrated browser in your user settings; on no, it does not lock.
- **D — the same setting, but you turn it on yourself**: porthole stops locking, and the README says how to add the one line to your settings.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — VS Code's auto-lock setting, with your consent once.** *Rationale*: it is the only option where VS Code locks the right group itself, at the moment it opens, so neither failure Surveyor found can happen; asking once respects that it changes a setting of yours and affects browser tabs outside porthole; and A gives back the behavior the lock was added to prevent, which the 0.1.0 test showed working. *Confidence*: 0.6 — because the setting's code path is read, not run, and whether it fires for a group created in a new floating window (the "more than one group" condition counts groups across windows, by my reading) needs one run. *If wrong*: if the setting does not fire for floating windows, B is the fallback; if the side effect on your other browser tabs is unwelcome, D, or A.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-TABAPI-REPRO: Does VS Code keep reporting the wrong window as active until a window opens or closes? (step by step)
- Status: unanswered
- Why asking: This is Surveyor's explanation of the skipped locks and the Cycle Window Size misses. If the log shows it, a rewritten upstream issue (`docs/issues/vscode/05-…`, replacing the current draft) can be filed. You only follow the steps; I read the log afterwards.
- Need: pick a letter (or override — any shape answers). About three minutes.

**Steps.** One action each. "Floating window" means the small window the spike opens.

1. **Open the Run and Debug view** in the porthole VS Code window: press **Shift+Cmd+D**.
2. **Choose the spike.** In the drop-down at the top of that view, choose **Spike 0 — one-shot pop-out**.
3. **Start it.** Click the green ▶ next to the drop-down. A second VS Code window opens, titled `[Extension Development Host]`. Do the rest there.
4. **Pop out the sample page.** Press **Shift+Cmd+P**, type `Pop out the sample`, press **Enter** on "Porthole Spike: 1 — Pop out the sample page". The floating window appears.
5. **Click into the page** in the floating window: once on its white body, not on a checkbox.
6. **Write the tab groups to the log, from the floating window.** With the floating window in front, press **Shift+Cmd+P**, type `Write the current tab groups`, press **Enter**.
7. **Click the second VS Code window** (the `[Extension Development Host]` one), on its empty editor area.
8. **Write the tab groups to the log again, from that window**: **Shift+Cmd+P**, type `Write the current tab groups`, **Enter**.
9. **Repeat steps 4 to 8 two more times.** Each repeat of step 4 opens the page again, which moves it into a fresh floating window.
10. Close the second VS Code window.

Options:
- **A — done**: all steps worked; I read the log.
- **B — a step did not work**: say which, and what happened instead.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — done**, with my prediction of what the log will show: in at least one of the three rounds, the group marked active stays the same between step 6 and step 8, even though you moved between windows. *Rationale*: Surveyor's reading says the reported active group changes only when a group is added or removed, which happens in step 4 and never in steps 5 to 8 (`workbench/api/browser/mainThreadEditorTabs.ts` L75–77, at tag 1.141.0). *Confidence*: 0.65 — because the reading is detailed and explains every log line we have, but it is Surveyor's second reading of this behavior and the first did not reproduce. *If wrong*: if the active group follows your clicks in every round, the cause is elsewhere again, draft 05 stays unfiled, and QST-LOCK-METHOD's C still stands on its own merits.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending the two answers

Whatever is chosen gets a regression test that fails if porthole ever issues a lock while the active group is not its own window.

---

## Action Items

- [ ] Answer both questions — Owner: Jérémie
- [ ] Implement the chosen method, with the regression test — Owner: Glazier
- [ ] Rewrite and file issue 05 if the run confirms Surveyor's reading — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Surveyor's revised answer to QST-CYCLE-MISS, and the skipped locks in Jérémie's log
- Contributors: Surveyor 5.1 (Claude Fable 5.1) — the source reading; Glazier 5.5 (Claude Opus 5.5) — the auto-lock route and this record
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related: [ADR-0010](0010-first-hands-on-test-of-porthole-0-1-0.md) (QST-CYCLE-MISS, QST-CYCLE-REPRO, iteration 4), [ADR-0007](0007-resize-means-re-open-with-new-bounds.md) (resizing re-opens the page, which also rebuilds VS Code's view of the groups)
- Draft issue: `docs/issues/vscode/05-active-group-ignores-window-activation.md`
