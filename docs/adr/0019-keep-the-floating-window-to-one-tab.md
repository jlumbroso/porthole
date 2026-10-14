<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Keep the floating window to one tab

- **Date**: 2026-10-13
- **Iteration**: 2
- **Status**: Accepted
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
- Status: answered
- Why asking: The current method is unreliable and, by Surveyor's reading, can lock your main window's group by mistake. Each replacement trades something different.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — stop locking**: porthole never locks. If you open a file while a floating window has focus, it may open inside that window, which then shows tabs and a status bar again.
- **B — keep the command, but later**: wait until the page's tab exists and a short moment has passed, then lock. Narrows the race; does not remove it, so the main window can still be locked occasionally.
- **C — VS Code's auto-lock setting, set by porthole once with your consent**: the first time you pop out a page, porthole asks "Let VS Code keep Porthole's floating windows to one tab? This also locks any browser tab you open first in a new group." On yes, it turns on `workbench.editor.autoLockGroups` for the integrated browser in your user settings; on no, it does not lock.
- **D — the same setting, but you turn it on yourself**: porthole stops locking, and the README says how to add the one line to your settings.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — VS Code's auto-lock setting, with your consent once.** *Rationale*: it is the only option where VS Code locks the right group itself, at the moment it opens, so neither failure Surveyor found can happen; asking once respects that it changes a setting of yours and affects browser tabs outside porthole; and A gives back the behavior the lock was added to prevent, which the 0.1.0 test showed working. *Confidence*: 0.6 — because the setting's code path is read, not run, and whether it fires for a group created in a new floating window (the "more than one group" condition counts groups across windows, by my reading) needs one run. *If wrong*: if the setting does not fire for floating windows, B is the fallback; if the side effect on your other browser tabs is unwelcome, D, or A.

**ANS:** (by Jérémie Lumbroso)
Yes, Option C, this should be asked on install, and on first use at each session, and the dialog should have a checkbox for "Don't ever ask me again" and then that setting is saved in user settings. You're right to be following on this, if the floating window is not compact, there's no point.

Note that we are talking of *multiple tabs in the same floating window*, which is problematic as it makes the floating window not compact — but I see no problem (and in fact welcome) multiple floating windows (possibly floating windows from different workspaces, as the human context switches, etc.).

---

### QST-TABAPI-REPRO: Does VS Code keep reporting the wrong window as active until a window opens or closes? (step by step)
- Status: answered
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

**ANS:** (by Jérémie Lumbroso)
Option A. I hope I did it correctly. I wasn't sure what you were trying to see. Let me know if you need to rerun this (new QST). Here's the log:

```log
[2026-10-14T00:34:18.585Z] --- activated: Visual Studio Code 1.141.0 on darwin arm64 ---
[2026-10-14T00:34:18.586Z] page under test: /Users/jlumbroso/Programming/porthole/spike/.run/tasks.html
[2026-10-14T00:34:18.588Z] === step 1 (run 1): one-shot _workbench.openWith into group -3 ===
[2026-10-14T00:34:18.588Z] before: 1 group(s) [{"viewColumn":1,"active":true,"tabs":[]}]
[2026-10-14T00:34:18.697Z] +109ms groups changed: opened=1 closed=0 changed=1
[2026-10-14T00:34:18.699Z] +111ms tabs changed: opened=[tasks.html] closed=[] changed=[]
[2026-10-14T00:34:18.700Z] +112ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:34:18.729Z] +141ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:34:18.729Z] +141ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:34:18.736Z] +148ms step returned: undefined
[2026-10-14T00:34:18.809Z] +221ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:34:18.823Z] +235ms tabs changed: opened=[] closed=[] changed=[tasks]
[2026-10-14T00:34:18.831Z] +243ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 36 · 2 …]
[2026-10-14T00:34:18.835Z] +247ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 36 · 2 …]
[2026-10-14T00:34:18.836Z] +248ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 36 · 2 …]
[2026-10-14T00:34:18.987Z] after ~0.25s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:34:19.739Z] after ~1s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:34:21.739Z] after ~3s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:35:31.048Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:36:23.911Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:37:21.410Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 36 · 2 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:27.410Z] === step 1 (run 2): one-shot _workbench.openWith into group -3 ===
[2026-10-14T00:38:27.411Z] before: 1 group(s) [{"viewColumn":1,"active":true,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]}]
[2026-10-14T00:38:27.504Z] +92ms groups changed: opened=1 closed=0 changed=1
[2026-10-14T00:38:27.513Z] +101ms tabs changed: opened=[tasks.html] closed=[] changed=[]
[2026-10-14T00:38:27.514Z] +102ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:27.541Z] +129ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:27.542Z] +130ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:27.546Z] +134ms step returned: undefined
[2026-10-14T00:38:27.603Z] +191ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:27.620Z] +208ms tabs changed: opened=[] closed=[] changed=[tasks]
[2026-10-14T00:38:27.626Z] +214ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 37 · 4 …]
[2026-10-14T00:38:27.639Z] +227ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 37 · 4 …]
[2026-10-14T00:38:27.640Z] +228ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 37 · 4 …]
[2026-10-14T00:38:27.799Z] after ~0.25s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 4 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:28.550Z] after ~1s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 4 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:30.552Z] after ~3s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 4 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:31.918Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 4 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:37.001Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:45.134Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 37 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:50.526Z] === step 1 (run 3): one-shot _workbench.openWith into group -3 ===
[2026-10-14T00:38:50.526Z] before: 1 group(s) [{"viewColumn":1,"active":true,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]}]
[2026-10-14T00:38:50.614Z] +88ms groups changed: opened=1 closed=0 changed=1
[2026-10-14T00:38:50.615Z] +89ms tabs changed: opened=[tasks.html] closed=[] changed=[]
[2026-10-14T00:38:50.616Z] +90ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:50.639Z] +113ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:50.640Z] +114ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:50.644Z] +118ms step returned: undefined
[2026-10-14T00:38:50.720Z] +194ms tabs changed: opened=[] closed=[] changed=[tasks.html]
[2026-10-14T00:38:50.734Z] +208ms tabs changed: opened=[] closed=[] changed=[tasks]
[2026-10-14T00:38:50.737Z] +211ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 38 · 1 …]
[2026-10-14T00:38:50.768Z] +242ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 38 · 1 …]
[2026-10-14T00:38:50.768Z] +242ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 38 · 1 …]
[2026-10-14T00:38:50.894Z] after ~0.25s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:51.645Z] after ~1s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:38:53.648Z] after ~3s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:01.383Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:04.914Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:12.444Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:16.157Z] === step 1 (run 4): one-shot _workbench.openWith into group -3 ===
[2026-10-14T00:39:16.158Z] before: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:16.247Z] +89ms groups changed: opened=1 closed=0 changed=2
[2026-10-14T00:39:16.249Z] +91ms tabs changed: opened=[tasks · 414×567 · load 38 · 1 …] closed=[] changed=[]
[2026-10-14T00:39:16.249Z] +91ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 38 · 1 …]
[2026-10-14T00:39:16.256Z] +98ms tabs changed: opened=[] closed=[tasks · 414×567 · load 38 · 1 …] changed=[]
[2026-10-14T00:39:16.263Z] +105ms step returned: undefined
[2026-10-14T00:39:16.290Z] +132ms groups changed: opened=0 closed=1 changed=2
[2026-10-14T00:39:16.291Z] +133ms groups changed: opened=0 closed=0 changed=2
[2026-10-14T00:39:16.514Z] after ~0.25s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:17.266Z] after ~1s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:19.267Z] after ~3s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:23.220Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:30.258Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:33.132Z] === step 1 (run 5): one-shot _workbench.openWith into group -3 ===
[2026-10-14T00:39:33.132Z] before: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:33.202Z] +69ms groups changed: opened=1 closed=0 changed=2
[2026-10-14T00:39:33.203Z] +70ms tabs changed: opened=[tasks · 414×567 · load 38 · 1 …] closed=[] changed=[]
[2026-10-14T00:39:33.203Z] +70ms tabs changed: opened=[] closed=[] changed=[tasks · 414×567 · load 38 · 1 …]
[2026-10-14T00:39:33.209Z] +76ms tabs changed: opened=[] closed=[tasks · 414×567 · load 38 · 1 …] changed=[]
[2026-10-14T00:39:33.215Z] +82ms step returned: undefined
[2026-10-14T00:39:33.256Z] +123ms groups changed: opened=0 closed=1 changed=2
[2026-10-14T00:39:33.256Z] +123ms groups changed: opened=0 closed=0 changed=2
[2026-10-14T00:39:33.466Z] after ~0.25s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:34.217Z] after ~1s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:36.218Z] after ~3s: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:36.268Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
[2026-10-14T00:39:39.896Z] dump: 2 group(s) [{"viewColumn":1,"active":false,"tabs":[{"label":"tasks.html","active":true,"pinned":false,"input":{"type":"zd","uri":"file:///Users/jlumbroso/Programming/porthole/samples/tasks.html"}}]},{"viewColumn":2,"active":true,"tabs":[{"label":"tasks · 414×567 · load 38 · 1 …","active":true,"pinned":false,"input":"undefined"}]}]
```

---

## Decision

### Chosen: VS Code's auto-lock setting, asked for with consent; Surveyor's explanation confirmed

From Jérémie's answers (2026-10-13):

- **Method (QST-LOCK-METHOD, C)**: porthole asks to turn on `workbench.editor.autoLockGroups` for the integrated browser, so that VS Code locks each new floating window's group itself. It asks at the first pop-out after installing, and again at the first pop-out of each VS Code session until the person answers. The question offers "Don't ask me again", and that answer is saved in the person's user settings. Jérémie's reason: *"if the floating window is not compact, there's no point."* VS Code's notifications cannot show a checkbox, so "Don't ask me again" will be a third button beside Yes and No.
- **The scope of "one tab"**: the problem is several tabs inside *one* floating window. Several floating windows at once, including from different workspaces as the person moves between projects, are welcome.
- **The repro (QST-TABAPI-REPRO, A)**: the log confirms the frozen half of Surveyor's reading. In all five rounds, after Jérémie clicked the main window, VS Code still told extensions that the floating window's group was the active one; that answer changed only when a group was opened or closed. (The other half, a new window reported *not* active, did not occur in this run; it is the race behind the three skipped locks in ADR-0010.) The rewritten issue 05 can go upstream.

Whatever is built gets a regression test that fails if porthole ever issues a lock while the active group is not its own window.

Whatever is chosen gets a regression test that fails if porthole ever issues a lock while the active group is not its own window.

---

## Action Items

- [x] Answer both questions — Owner: Jérémie (2026-10-13)
- [ ] Implement the chosen method, with the regression test — Owner: Glazier
- [x] Rewrite and file issue 05 — Owner: Glazier (2026-10-13, microsoft/vscode#341430)

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Surveyor's revised answer to QST-CYCLE-MISS, and the skipped locks in Jérémie's log
- Contributors: Surveyor 5.1 (Claude Fable 5.1) — the source reading; Glazier 5.5 (Claude Opus 5.5) — the auto-lock route and this record
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-13)
- Trigger: Jérémie answered both questions, with the spike log
- Contributors: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5) — the log reading
- Changes: Decision filled; log kept at `attachments/logs/2026-10-13-spike-1-test/spike.log` (from 00:34Z)
- Outcome: `Draft → Accepted`

---

## Links

- Related: [ADR-0010](0010-first-hands-on-test-of-porthole-0-1-0.md) (QST-CYCLE-MISS, QST-CYCLE-REPRO, iteration 4), [ADR-0007](0007-resize-means-re-open-with-new-bounds.md) (resizing re-opens the page, which also rebuilds VS Code's view of the groups)
- Draft issue: `docs/issues/vscode/05-active-group-ignores-window-activation.md`
