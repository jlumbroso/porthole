<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# First hands-on test of porthole 0.1.0

- **Date**: 2026-10-12
- **Iteration**: 4
- **Status**: Implemented
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Passed — all five answers A, 15 pop-outs in the log with no fallback and no error; the lock and the single chord stay. (Written before the run:) Version 0.1.0 pops out a file, cycles sizes, docks back and toggles the pin; it passes 21 tests against a mocked VS Code, and five things only a real window can show are asked below, one letter each.

---

## Originating Context

**Source**: `docs/INITIAL-DESIGN-BRIEF.md`, Build plan, milestones M1 (pop out files) and M3 (dock back, cycle size, toggle pin), and its acceptance checklist. Spike 0 passed ([ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md)), so the real extension was built the same day.

**Agency Grant**: Implement as you see fit; Jérémie offered to test.

---

## Explicitation

**What I understand**:

1. **The spike proved the call, not the product.** The product adds three things the spike did not do: it locks the new window to one tab, it remembers which file each window shows, and it binds a key, a title-bar button and an Explorer entry.
2. **Locking is the part I am least sure of.** The spike resized by re-opening an *unlocked* window. Whether VS Code still moves the tab out of a *locked* one is untested, and it is the first thing this run should show.
3. **M1 and M3 are tested together** to spend one sitting of your attention instead of two. Not built yet: popping out a page that is already open in a browser tab (M2), and the outside trigger (M4).

**How to run it** (about five minutes):

1. Open **Run and Debug** (⇧⌘D), choose **Run Porthole** in the drop-down at the top, and press **F5**. A second VS Code window opens on `samples/`, with your other extensions enabled this time. Nothing is installed into your VS Code.
2. In that window, open `tasks.html` from the Explorer (it opens as text). Press **Ctrl+Alt+M**. → QST-V1-POPOUT
3. Click into the mini window. Open its command palette and run **Porthole: Cycle Mini Window Size**, three times. → QST-V1-RESIZE
4. With the mini window focused, press **⌘P** and open any other file, for example `tasks.html` again as text. → QST-V1-LOCK
5. Focus the mini window and press **Ctrl+Alt+M**. → QST-V1-DOCK
6. Close the docked browser tab. Back in the Explorer, right-click `tasks.html` → **Pop Out to Mini Window**. Then, in the mini window's palette, run **Porthole: Toggle Always on Top** and click another application. → QST-V1-PIN
7. Close the second window and tell me.

**What I read afterwards**: the extension writes each step to VS Code's own log files (the "Porthole" channel), so I expect to read the timings and any fallback or error there. If I cannot find the file, I will ask you to copy the "Porthole" output.

**How ready this is**:

- `just gate` is green: typecheck, 21 tests, bundle, and a check that the package would ship exactly five files. I broke the code on purpose in two places and the right two tests failed.
- A `.vsix` builds (7 files, about 11 KB). I have **not** installed it, and I have **not** run the extension in a real VS Code.
- Surveyor has been asked to review the code; no review had arrived when this was written.

**What Surveyor's review adds, at iteration 2** (`docs/inbox/archive/2026-10-12-2219-surveyor-to-glazier-review-porthole-0-1-0.md`). The run procedure is unchanged. My five predictions below are left as written; Surveyor's, from VS Code's source at 1.141.0, are:

| Question | Surveyor | Why, in one line |
| --- | --- | --- |
| POPOUT | A, 0.8 | — |
| RESIZE | A, 0.85 | a lock is consulted only when VS Code picks a group to open *into*; moving a tab *out* never checks it, and the emptied locked group is removed like any other |
| LOCK | A, 0.85 | a locked active group makes VS Code take the first unlocked group, which is the main window's; compact mode also redirects any new group to the main window |
| DOCK | A, 0.75 | the browser forwards modified key presses from inside the page to VS Code; the page-side half of that rule was not read |
| PIN | A, 0.8 | — |

So the question I was least sure of (RESIZE, 0.55) is the one the source is clearest about, and the one to watch is DOCK.

Two things were fixed before this test because of the review, each with a regression test:

- **`Ctrl+Alt+M` no longer fires on a docked browser tab.** There it could only answer "open or select a local HTML file first", on the very page you wanted popped out. The title-bar button on such a tab should work, since it passes the file; that is worth one click if you are curious, but it belongs to M2.
- **Cycle Size no longer falls back to "the last file popped out".** After Dock Back it would have pulled the page straight out again.

**Assumptions**:

- Your other extensions being enabled does not change the result. If something looks off, the Spike 0 configuration (extensions disabled) is still there to compare.
- `Ctrl+Alt+M` is free in your keybindings.

**Confirm**: Jérémie, by answering the five questions.

---

## Questions

### QST-V1-POPOUT: After step 2, what did Ctrl+Alt+M do?
- Status: answered
- Why asking: The spike was run from the palette. A key binding depends on a `when` clause that only a real editor evaluates.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — the porthole**: the same small, compact, on-top window as in the spike, showing the sample page.
- **B — a window, but different from the spike**: say what differs (size, tabs showing, not on top).
- **C — nothing happened**: the key did nothing, or VS Code said the command was not found.
- **D — an error message**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — the porthole** (a prediction). *Rationale*: the call is the one the spike ran five times, with the same arguments (`src/miniWindow.ts`), and the `when` clause uses context keys Surveyor found declared with exactly these spellings (source check, note 8). *Confidence*: 0.7 — because the call is proven, but the binding and the title-bar button have never been evaluated by a real VS Code. *If wrong*: C means the `when` clause or the key is wrong and the palette command should still work — try **Porthole: Pop Out to Mini Window** and tell me; B or D means something in the product's additions changed the call.

**ANS:** (by Jérémie Lumbroso)
First, here's a screenshot for the developer log: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.01.20 PM.png` it is a conversation with Glazier 5.5 about to prepare for this experimentation.

Option A.

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.10.01 PM.png` about to run the Porthole debug;
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.10.47 PM.png` host open and `tasks.html` code tab is open;
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.10.58 PM.png` after pressing Ctrl+Alt+M, the porthole opens to the foreground and stays there persistently.

---

### QST-V1-RESIZE: After step 3, what did cycling the size do?
- Status: answered
- Why asking: The window is now locked to one tab, which the spike's window was not. This shows whether VS Code still moves a tab out of a locked window.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — one window each time, changing size**: bigger, bigger again, then back to the small one, with the page's ticks kept.
- **B — the windows pile up**: each cycle leaves an extra window, empty or showing the page.
- **C — nothing changes**: the window stays as it is.
- **D — an error message**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — one window each time** (a prediction). *Rationale*: the spike showed the move and the automatic close for an unlocked window (ADR-0003); a lock in VS Code stops editors opening *into* a group, and I know of nothing that stops one leaving. *Confidence*: 0.55 — because that last clause is my reading of how locks behave, not something anyone here has run or read in source. *If wrong*: B or C means the lock interferes with the move, and porthole should unlock before re-opening, or not lock at all and accept that compact mode can be lost.

**ANS:** (by Jérémie Lumbroso)
Option A.

Cycling of the size of the window, one window each time, changing size until it gets its initial size back:

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.11.09 PM.png` the screenshot where the palette is selected with Cmd+P in the porthole window, and the option `Cycle Mini Window Size` is selected;
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.11.22 PM.png` window was resized, and option is reselected;
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.11.27 PM.png` window was resized again (much noticeable as much larger), and option is again reselected;
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.11.38 PM.png` seems like it cycles back to the initial size (the one from `7.11.09 PM`).

---

### QST-V1-LOCK: After step 4, where did the other file open?
- Status: answered
- Why asking: This is what the lock is for. Compact mode switches itself off when a second tab enters the window.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — in the main window**: the mini window still shows only the page.
- **B — inside the mini window**: it gained a tab bar or a second tab.
- **C — somewhere else**: a third window, or nothing opened.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — in the main window** (a prediction). *Rationale*: this is the documented purpose of a locked editor group, and the brief cites the command for exactly this use. *Confidence*: 0.65 — because I have not seen how a locked group in a *floating* window redirects an open. *If wrong*: B means the lock did not take (the log will say whether porthole skipped it) or does not do what the brief says, and the "one tab" promise needs another mechanism.

**ANS:** (by Jérémie Lumbroso)
I had to add a new file to the project, because otherwise, the only option possible was `tasks.html` and it did not provide the right conditions to test this (trying to open to `tasks.html` while in the mini-window displaying that file does not work, it doesn't open that specific file in the code editor). So I created `other-file.html`. 

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.32.17 PM.png` From the mini window, invoking the palette and trying to open `other-file.html`

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.32.07 PM.png` This file then opens in the editor area, leaving the mini window alone.

This was not requested but I wanted to note that it is possible to do Ctrl+Alt+M from the alternate file to launch a second mini window:

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.26.51 PM.png`

---

### QST-V1-DOCK: After step 5, what did Ctrl+Alt+M do in the mini window?
- Status: answered
- Why asking: The same key is meant to pop out and to put back, depending on which window has focus.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — docked**: the page became a tab in the second VS Code window and the mini window closed.
- **B — docked, but the mini window stayed**, empty.
- **C — nothing happened**.
- **D — it opened another mini window** instead of docking.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — docked** (a prediction). *Rationale*: the command behind it is public (`workbench.action.restoreEditorsToMainWindow`) and the key is bound on `isAuxiliaryWindowFocusedContext`, a real context key (Surveyor's source check, note 8). *Confidence*: 0.65 — because the two bindings share one chord and I have not seen VS Code choose between them. *If wrong*: D means the pop-out binding won the chord, so its `when` clause must exclude the mini window more strictly; C means focus inside the page does not count as the window being focused, and docking needs the palette.

**ANS:** (by Jérémie Lumbroso)
[Note to Glazier: The ORRCF QST are better if self-contained: So it is better if in the QST itself, you provider a refresher for what "step 5" is — for every single question now, I have had to go back and forth between the QST and the top of the ADR — several dozen times, because of this design choice. This is typical failure of architecture of complexity design, giving coupled questions.]

Option A.

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.29.48 PM.png` -> when pressing Ctrl+Alt+M on the mini window itself, it docks. This docked window can no longer be cycled: Doing Ctrl+Alt+M doesn't do anything further, the window must be closed and then reinstantiated from the HTML file.

---

### QST-V1-PIN: After step 6, did the Explorer entry work, and did the pin come off?
- Status: answered
- Why asking: Two small things in one step: the right-click entry on a file that is not open, and unpinning.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — both worked**: the right-click popped the page out, and after toggling, the mini window went behind the other application.
- **B — the right-click entry is missing or did nothing**.
- **C — the pin did not come off**: the window stayed in front.
- **D — neither worked**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — both worked** (a prediction). *Rationale*: the Explorer entry uses the same command with the file passed as its argument, which the tests cover; the toggle is one public command. *Confidence*: 0.7 — because menu placement is declared in the manifest and never exercised. *If wrong*: B points at the menu's `when` clause; C means the toggle acts on a different window than the one that looks focused.

**ANS:** (by Jérémie Lumbroso)
Option A.

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 7.37.57 PM.png` this is the right-click context menu with the mini browser option. BTW, you use the "Mini Browser" terminology — we should make an index of all user-facing terminology and then submit it to the naming authority for unification/coherence pass.

The `Toggle Always on Top` works perfectly.

---

## Decision

### Context

Version 0.1.0 is not installed into daily use until a real window has shown these five things.

### Chosen: 0.1.0 stands as built — the lock stays, the single chord stays

Run by Jérémie on 2026-10-12 between 7:10 and 7:40 PM ET, VS Code 1.141.0, with his other extensions enabled. **All five answers were A**, with screenshots. Surveyor's predictions and mine were all A as well.

The extension's own log (VS Code's log folder, "Porthole" channel, seven windows) agrees and adds:

- **15 pop-outs, all by the internal call**, the new window reported 123–236 ms after the command started. No fallback ran, nothing threw, and porthole never skipped the lock.
- **The size cycle**: S → M → L → S, one window each time, 123–170 ms per step.
- **Two mini windows can be open at once**: Jérémie popped a second file out while the first was showing (QST-V1-LOCK, his extra note). Nothing in the design forbids it, and Cycle Size acts on whichever one is focused, which is why the "last opened" fallback had to go.

**What this decides**:

1. **The lock stays.** It kept the second file out of the mini window, and it did not stop resizing (Surveyor's source reading, now seen).
2. **One chord for both directions stays.** `Ctrl+Alt+M` popped out from the text editor and docked from the mini window.
3. **M2 and M4 can build on this as it is.**

**Found by the run** (not predicted by anyone):

- **A docked page cannot be popped back out with the chord.** After Dock Back the page is a browser tab, and the chord is deliberately inert there (fixed before this run, from Surveyor's review). The title-bar button should still work on such a tab, since it passes the file; that is milestone M2's first test.
- **⌘P cannot open a file as text while that same file is showing in the mini window.** Jérémie had to add `other-file.html` to test the lock. I do not know yet whether this is VS Code's quick-open preferring the existing browser editor or something porthole causes. Recorded, not investigated.
- **The user-facing words are not unified.** The menu says "Pop Out to **Mini Window**" while the project is porthole (QST-V1-PIN, Jérémie's note). He asked for an index of every user-facing term, to be put to Mint for a coherence pass. Action item below.

### Consequences

- 0.1.0 can be installed for daily use with `just install-local` whenever Jérémie wants it.
- **How I write questions changes** (Jérémie's note on QST-V1-DOCK): each question restates the step it asks about, so it can be answered without scrolling back to the procedure. These five made him go back and forth several dozen times; that is a coupling I built in, and the next run's questions will not have it.

---

## Open Follow-ups

**First real use** (2026-10-12, ~8:20–8:48 PM ET, after the install): Jérémie walked Lintel's ten-card PAT-refresh page from `vscode-adrs-for-ai` in a porthole window, start to finish. Two things it showed about porthole itself, from his notes in the page's export:

- **Downloads work.** The page's Export button saved its JSON file to `~/Downloads`, twice. I had not known whether the integrated browser would allow it.
- **Keyboard editing inside the page is broken in places.** "Cmd+V didn't work, I had to right-click and select Paste in the contextual menu. Ctrl+A and Ctrl+E … don't work." The question below is mine to settle before asking him anything.

### QST-PASTE: Why does Cmd+V not paste into a page in the mini window, and is it porthole's doing?
- Status: answered — from source by Surveyor (`docs/inbox/2026-10-13-0050-glazier-to-surveyor-paste-in-mini-window.md`); one prediction left for a docked tab to confirm
- Why deferring: The answer decides whether porthole can fix it (for example, a keybinding of its own that pastes into the focused browser page) or whether it is the integrated browser's behavior everywhere, docked tabs included, to work around or report upstream. Text fields in task pages make this matter: tokens, names and notes all get pasted.

**ANS:** (by Surveyor 5.1, Claude Fable 5.1, 2026-10-12)
Two different causes, neither porthole's doing. Lines are at tag 1.141.0, paths under `src/vs/`.

**Cmd+V: floating windows only (Glazier's case 2).** The page does receive the key: the browser view's preload lets Cmd+A/C/V/X/Z through to the page instead of forwarding them to the workbench (`platform/browserView/electron-browser/preload-browserView.ts` L45–51, L107–120). But on macOS a web page pastes on Cmd+V through the application's Edit menu, which is why VS Code gives its Edit → Paste item the Electron role `paste` (`platform/menubar/electron-main/menubar.ts` L712–718; Electron's documented requirement, not VS Code source). While an auxiliary window has focus, VS Code rebuilds that menu with every action **disabled** (`onDidChangeWindowFocus` L253–260 sets `noActiveMainWindow` when the focused window is auxiliary; `setMenu` L525–533 then creates each item with `enabled: false` unless it has a fallback handler, and only a few File-menu actions do, L126–151). A disabled menu item's key equivalent does nothing, so Cmd+V dies in the mini window. Right-click → Paste works because the browser's context menu builds its own enabled `role: 'paste'` item (`platform/browserView/electron-main/browserViewMainService.ts` L668–670). Prediction, if Jérémie tries a docked tab: Cmd+V pastes there, because the main window has focus and the item is enabled. Cmd+C and Cmd+X in the mini window are expected to fail the same way.

**Ctrl+A and Ctrl+E: the integrated browser everywhere (case 1).** On macOS the preload treats only Cmd as the command modifier (L107); a Ctrl-modified key is not in the native allowlist, so it is `preventDefault`ed and forwarded to the workbench's keybinding service (L129–139 → `contrib/browserView/electron-browser/webContentsViewHost.ts` L237–246). The page's text field never sees it, docked or floating. VS Code has no binding for those chords outside the terminal, so nothing happens.

**Can porthole fix it? No.** A keybinding of its own cannot fire for Cmd+V: the preload hands that key to the page and the workbench never sees it. There is no API to paste into a page: the proposed `browser` API exposes neither clipboard nor key injection (`vscode-dts/vscode.proposed.browser.d.ts`, nothing matching paste, clipboard or key). The fix is upstream, in `menubar.ts` L525–533: keep the role-bearing Edit items enabled when an auxiliary window has focus, since a role acts on the focused web contents and needs no renderer. For Ctrl+A/Ctrl+E the upstream fix is the preload's allowlist. Until then: right-click → Paste, or dock, paste, pop out again.

---

**Second real use, on VS Code 1.134.0** (2026-10-13, just after midnight ET): every feature worked, but Cycle Window Size now and then answered "pop a page out first" from inside an open porthole window, with no reliable repro. Porthole's log from the first 1.134 session shows one pop-out by the internal call (139 ms) and no resize at all.

### QST-CYCLE-MISS: Why does VS Code sometimes not report the focused floating window's group as active?
- Status: answered — cause re-read by Surveyor on 2026-10-13 after QST-CYCLE-REPRO came back B: the Tab API's active group crosses a window boundary only when a group is added or removed; read, not run; the one-window mitigation holds ("resolved" corrected to "answered" by Glazier: the parser knows only answered, withdrawn, superseded, moot)
- Why deferring: porthole now copes (below), so nothing waits on the answer. The answer decides whether the mitigation is enough when several porthole windows are open.

**ANS:** (by Surveyor 5.1, Claude Fable 5.1, 2026-10-13; read at tag 1.141.0, not run. **Revised the same day** after QST-CYCLE-REPRO came back B: my first answer put the miss in the workbench's focus tracking and predicted a title-bar click would reproduce it; it did not. The log Jérémie attached shows where the miss really is, one layer further out. The first answer's claims that survive are kept; the rest is replaced.)

**What porthole reads is the Tab API, and the Tab API is told about a floating window's group only twice.** `vscode.window.tabGroups.activeTabGroup` is the extension host's `_activeGroupId` (`api/common/extHostEditorTabs.ts` L277–280), which changes in exactly two places: a full model rebuild (`$acceptEditorTabModel`, L309–345), which the main thread sends only when a group is **added or removed** anywhere (`api/browser/mainThreadEditorTabs.ts` L75–77, with `isActive: group.id === editorGroupsService.activeGroup.id` at L521); and a group update (`$acceptTabGroupUpdate`, L350–358), which the main thread sends on a `GROUP_ACTIVE` model event **only if that group is already the workbench's active group** (L552–557, L249–257).

**A floating window's single group never produces a usable `GROUP_ACTIVE`.** Its one group is set active inside its own part at creation (`browser/parts/editor/editorPart.ts` L1300 → `editorGroupView.ts` L966–985, `model.setActive`), before the editor service has registered listeners on it: the service registers on `onDidAddGroup` (`services/editor/browser/editorService.ts` L108, L168–172), and that event fires only after the part's `create()` has returned (`editorParts.ts` L164–172). So the creation event is never forwarded. When the part later becomes the workbench's active part through focus (`editorParts.ts` L297–305, on `part.onDidFocus`), the editor service fires only `onDidActiveEditorChange` (L107), which the Tab API does not consume, and inside the part nothing changes (`editorPart.ts` L743–744), so no `GROUP_ACTIVE` fires again. Net: **the extension host's idea of the active group crosses a window boundary only when some group, anywhere, is added or removed.** The rebuild caused by the floating window's own creation reports it active only if focus had already reached the new part while `create()` was still pending (Electron focuses the new window → the pane asks the native view for focus → `electron-main/browserView.ts` L461–467 → `browserEditor.ts` L605–610 → part active). That race is the three-of-five `not locking` lines in the log, and it is what `keepToOneTab` (`src/miniWindow.ts` L142) is measuring.

**Why the title-bar test showed B, and why the misses were intermittent.** After a rebuild has marked the floating group active, the flag is frozen there: clicking the main window activates the main part for the workbench, but if the main window has one group no `GROUP_ACTIVE` fires, and the Tab API keeps saying the floating group. So runs 1 and 2 both hit. Conversely a window whose rebuild said "not active" stays "not active" for the Tab API whatever the human clicks, including a click into the page (that activates the workbench's group, as the first answer said, but tells the extension host nothing), until another window opens or closes. Cycle Window Size on such a window misses; Cycle itself re-opens, which is a rebuild, after which the new window is usually reported correctly. The first answer's "two signals, two sources" stands, with a third source added: the context key follows the OS window, the workbench's `activeGroup` follows focus inside a part, and the Tab API's `activeTabGroup` follows neither between rebuilds.

**Consequences for porthole, read not run.**

- **A lock can land on the main window's group.** `workbench.action.lockEditorGroup` with no argument locks the **workbench's** active group (`editorCommands.ts` L1350–1353 via `editorCommandsContext.ts` L74), which is `activePart.activeGroup`, a different signal from the one `keepToOneTab` checks. When the Tab API says the new group is active (focus raced in before the rebuild) but the native focus round trip has not completed at the moment the command runs, the lock goes to the main window's group. Not seen in any log; worth a test that fails if the lock command runs while no porthole group is the workbench's active one, which porthole cannot observe directly, so the practical guard is to lock only after the new window's tab is present *and* a short settle, or not to lock at all.
- **The lock cannot be aimed.** The command accepts an `{ groupId }` context (`editorCommandsContext.ts` L109–115) but the Tab API exposes no group id; a URI argument goes through `findEditors`, whose observer indexes a browser tab under its `vscode-browser:` resource (`editorsObserver.ts` L210–224), not the file, so `lockEditorGroup(fileUri)` finds nothing and falls back to the active group. Do not try that route.
- **"Which floating window is focused" has no extension-visible signal**, as before: `window.state` is application-wide, the context key is `when`-only, and the proposed `browser` API's `activeBrowserTab` mirrors `editorService.activeEditorPane` (`api/browser/mainThreadBrowsers.ts` L45, L81), the workbench signal, not the Tab API's. **The one-window mitigation is right.** For a named window, re-opening its file into its group (`vscode.openWith(file, 'workbench.editor.browser', { viewColumn })`; `singlePerResource`, so no second tab; `editorGroupView.ts` L1239–1245; `editorPart.ts` L414–421 raises the window) makes it the workbench's active group after the native round trip, but still does not update the Tab API's flag until the next rebuild.

**Repro, with the existing spike, deterministic if this is right:** pop a page out and read porthole's log; if the line `not locking: the new window is not the active tab group` appears, click into the page, open the floating window's palette and run a command that prints `tabGroups.activeTabGroup.viewColumn` (the spike's `dump` logs every group): it still names the main window's group. Open any second window or close one, and it changes. **Upstream (replaces draft 05):** "`vscode.window.tabGroups.activeTabGroup` does not follow the active editor group across windows: only a `GROUP_ACTIVE` event within a part and structural rebuilds update it; `IEditorGroupsService.onDidChangeActiveGroup` is never forwarded to the extension host." The fix is a listener on that event in `mainThreadEditorTabs.ts` next to L75–77.

---

What porthole now does (commit "fix: Cycle Window Size finds the porthole window when VS Code misreports focus"): it forgets a window the moment VS Code closes it, and when the active group is not one of its windows but exactly one is open, it resizes that one. With several open it says so and asks for a click on the right window's title bar. My hypothesis, unconfirmed: the workbench marks a group active from DOM focus inside it (`workbench/browser/parts/editor/editorParts.ts` L297–305, at 1.141.0), and a click that lands inside the page goes to a native view the DOM does not see.

### QST-CYCLE-REPRO: Does a title-bar click leave VS Code's active group in the other window (the cause Surveyor read for QST-CYCLE-MISS)?
- Status: answered — B (never misreported); issue 05 is therefore not filed, and the cause of the original misses is open again (Glazier, 2026-10-13)
- Why asking: Surveyor read in VS Code's source that clicking a floating window's **title bar** makes it the focused window but does **not** make its tab group the "active" one, while clicking **inside the page** does. That is the cause of the intermittent "pop a page out first" from Cycle Window Size. It has only been read, not seen. If you see it, the fifth upstream issue (`docs/issues/vscode/05-active-group-ignores-window-activation.md`) gets filed; if not, it does not.
- Need: pick a letter (or override — any shape answers). About two minutes. Screenshots welcome but not needed.

**Before you start.** You need VS Code 1.141.0 with Porthole installed: open the Extensions view (the four-squares icon in the left bar, or Cmd+Shift+X), and check that "Porthole" is listed and enabled. If you installed or updated it today and have not restarted VS Code since, run **Developer: Reload Window** first (Cmd+Shift+P, type "Reload Window", press Enter).

**Steps.** Do them in this order, one action each.

1. **Open Porthole's log.** In the main VS Code window, open the menu **View → Output**. A panel opens at the bottom. At its top right is a drop-down list of channels; choose **Porthole**. Leave this panel open for the whole test. Each thing Porthole does adds one line at the bottom.
2. **Open a page.** In the main window's Explorer (left side), open `samples/tasks.html` from the porthole repository, or any other `.html` file. It opens as text. Click once anywhere in that text.
3. **Pop it out.** Press **Ctrl+Alt+M** (Control, Option, and the M key). A small floating window appears showing the rendered page. The Output panel gains a line starting `internal open: new window after`.
4. **Click the main window.** Click once anywhere in the text of the main window's editor (not in the floating window).
5. **Click the floating window's title bar.** Click once on the thin strip across the very top of the floating window, where its name is written. Do not click the page, the address bar, or the buttons below the strip.
6. **Run Cycle Window Size.** With the floating window in front, press **Cmd+Shift+P** to open its command palette, type `Cycle Window Size`, and press **Enter**.
7. **Write down what you saw for run 1:** (a) did the floating window change size? (b) in the main window's Output panel, does a new line contain the words `is not a Porthole window; using the only one open`?
8. **Click inside the page.** Click once on the white body of the page in the floating window (not on a checkbox or button, and not on the address bar).
9. **Run Cycle Window Size again**, exactly as in step 6.
10. **Write down what you saw for run 2**, the same two things as in step 7.

Options:
- **A — as Surveyor read it**: run 1 resized the window **and** added a line with `using the only one open`; run 2 resized the window **without** adding such a line (only lines starting `cycle size:` and `internal open:`).
- **B — never misreported**: neither run added a `using the only one open` line. Both resized.
- **C — always misreported**: both runs added a `using the only one open` line. Both resized.
- **D — something else**: a run did not resize the window, a message appeared at the bottom right of VS Code, or the lines differ from both patterns. Say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — as Surveyor read it** (a prediction). *Rationale*: Surveyor traced both paths at tag 1.141.0 — the title bar lies outside the editor part, so nothing activates the group (`workbench/browser/parts/editor/editorGroupView.ts` L487–527), while a click into the page reaches the workbench through the browser view's native focus event (`platform/browserView/electron-main/browserView.ts` L461–467) — and it explains your intermittent misses. The resize itself should succeed in both runs, because porthole now falls back to the only open window. *Confidence*: 0.7 — because the reading is detailed and consistent with what you saw, but it has not been run. *If wrong*: **B** means the title-bar click does activate the group on macOS, so issue 05 is not filed and the cause of your misses is still open; **C** means the click into the page does not activate it either, so the native-focus reading is wrong and issue 05 must be rewritten before filing; **D** means a new bug, and the Output lines tell me where.

**ANS:** (by Jérémie Lumbroso)
Option B. I am fairly confident that I followed these instructions precisely, but I may not have fully understood them. We should distinguish terms a bit more, like "editor code tab" vs "floating window" — you should use "floating window" consistently to refer to the window generated by Porthole.

Here is the full log:
```
2026-10-13 01:02:11.564 [info] Porthole 0.1.0 activated on Visual Studio Code 1.141.0
2026-10-13 01:02:11.687 [info] internal open: new window after 124 ms at 420×640
2026-10-13 01:02:11.687 [info] not locking: the new window is not the active tab group
2026-10-13 01:02:21.232 [info] internal open: new window after 101 ms at 420×640
2026-10-13 01:02:21.232 [info] not locking: the new window is not the active tab group
2026-10-13 09:24:53.503 [info] Porthole 0.1.0 activated on Visual Studio Code 1.141.0
2026-10-13 09:47:16.480 [info] internal open: new window after 122 ms at 420×640
2026-10-13 09:47:16.480 [info] not locking: the new window is not the active tab group
2026-10-13 09:47:46.053 [info] internal open: new window after 107 ms at 420×640
2026-10-13 09:48:20.167 [info] cycle size: M (480×720)
2026-10-13 09:48:20.264 [info] internal open: new window after 97 ms at 480×720
2026-10-13 09:48:23.724 [info] cycle size: L (640×900)
2026-10-13 09:48:23.829 [info] internal open: new window after 106 ms at 640×900
2026-10-13 09:48:26.028 [info] cycle size: S (420×640)
2026-10-13 09:48:26.132 [info] internal open: new window after 104 ms at 420×640
2026-10-13 09:49:05.865 [info] cycle size: M (480×720)
2026-10-13 09:49:05.977 [info] internal open: new window after 112 ms at 480×720
2026-10-13 09:49:07.930 [info] cycle size: L (640×900)
2026-10-13 09:49:08.034 [info] internal open: new window after 104 ms at 640×900
2026-10-13 09:49:09.863 [info] cycle size: S (420×640)
2026-10-13 09:49:09.989 [info] internal open: new window after 126 ms at 420×640
2026-10-13 09:49:31.814 [info] internal open: new window after 100 ms at 420×640
2026-10-13 09:49:36.763 [info] cycle size: M (480×720)
2026-10-13 09:49:36.860 [info] internal open: new window after 97 ms at 480×720
2026-10-13 09:49:37.778 [info] cycle size: L (640×900)
2026-10-13 09:49:37.883 [info] internal open: new window after 105 ms at 640×900
2026-10-13 09:49:38.852 [info] cycle size: S (420×640)
2026-10-13 09:49:38.977 [info] internal open: new window after 126 ms at 420×640
2026-10-13 09:49:49.666 [info] cycle size: M (480×720)
2026-10-13 09:49:49.777 [info] internal open: new window after 111 ms at 480×720
2026-10-13 09:49:56.523 [info] internal open: new window after 105 ms at 420×640
2026-10-13 09:49:58.329 [info] cycle size: M (480×720)
2026-10-13 09:49:58.435 [info] internal open: new window after 106 ms at 480×720
2026-10-13 09:50:00.430 [info] cycle size: L (640×900)
2026-10-13 09:50:00.544 [info] internal open: new window after 114 ms at 640×900
```

I tried it also on 1.134.0, and it seemed to work just as well. When I open the command palette attached to the main window, I only get the "Porthole: Pop Out to Floating Window" option (as expected).

I am happy to follow up with more testing, if it is issued as a separate ORRCF QST.

---

The other notes in that export (copy buttons, clickable addresses) are about the page, not porthole, and belong to Lintel, its author.

---

## Action Items

- [x] Run the test and answer the five questions — Owner: Jérémie (2026-10-12, all A, 17 screenshots)
- [x] Read the log and record the result — Owner: Glazier (iteration 3)
- [x] Review `src/` — Owner: Surveyor (done before the run; two fixes adopted)
- [ ] Index every user-facing term (command titles, menu entries, settings descriptions, messages, README) for Mint's coherence pass — Owner: to be assigned (see the crew question in the founding seat's report of 2026-10-12)
- [ ] Find out why ⌘P will not open a file as text while it is showing in a mini window — Owner: Glazier, at M2

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: Spike 0 passed; version 0.1.0 written
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-12)
- Trigger: Surveyor's review of `src/` arrived before the test was run
- Contributors: Surveyor 5.1 (Claude Fable 5.1) — the review and predictions; Glazier 5.5 (Claude Opus 5.5) — the two fixes and this note
- Changes: Surveyor's predictions added beside mine; two fixes recorded; test count is now 23
- Outcome: stays `Draft`; the questions are still open

### Iteration 3 (2026-10-12)
- Trigger: Jérémie ran the test and answered all five questions (A each), with screenshots
- Contributors: Jérémie Lumbroso — the run, the answers, and two notes (self-contained questions; unified terminology); Glazier 5.5 (Claude Opus 5.5) — the reading of the extension's log
- Changes: Decision and Consequences filled; two follow-ups found by the run; two action items added
- Outcome: `Draft → Implemented`

### Iteration 4 (2026-10-13)
- Trigger: Jérémie answered QST-CYCLE-REPRO: B, on 1.141.0 and 1.134.0, with the full Porthole log
- Contributors: Jérémie Lumbroso — the run and the log; Surveyor 5.1 (Claude Fable 5.1) — the reading under test; Glazier 5.5 (Claude Opus 5.5) — this record
- Changes: (1) Surveyor's title-bar reading did not reproduce on macOS: neither run fell back to "the only one open". Issue draft 05 stays unfiled and is marked so. The original intermittent miss is unexplained again; the one-window mitigation stays. (2) **New, from the same log**: three of five pop-outs logged `not locking: the new window is not the active tab group`, so those floating windows were not locked to one tab. The new group was not yet active when porthole checked, contrary to the reading that the active id is set before the event fires. Glazier's to fix. (3) Jérémie asked that the questions use "floating window" consistently for the window porthole opens, and distinguish it from the text editor tab; carried into the terminology ADR (ADR-0017).
- Outcome: stays `Implemented`; two items open, both Glazier's

---

## Links

- Related ADRs: [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md), [ADR-0005](0005-open-with-the-internal-one-shot-call-guarded-by-a-stable-fallback.md), [ADR-0007](0007-resize-means-re-open-with-new-bounds.md)
- Code: `src/commands.ts`, `src/miniWindow.ts`, `package.json` (`contributes`)
