<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Hands-on check: Markdown and the auto-lock question

- **Date**: 2026-10-13
- **Iteration**: 2
- **Status**: Implemented
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Two short checks of what the installed porthole does that nobody has run: the new one-time question about keeping floating windows to one tab, and reaching a Markdown file through porthole's own entry points (Spike 1 already proved the Markdown window itself).

---

## Originating Context

**Source**: commit "feat: Markdown files open as VS Code's preview; VS Code's auto-lock replaces the racy lock", which implements [ADR-0015](0015-markdown-in-a-floating-window.md) and [ADR-0019](0019-keep-the-floating-window-to-one-tab.md). It passes 33 tests against a mocked VS Code; it has not been run in a real one.

**What is already proven and not re-checked here**: the Markdown preview floating, compact, pinned and live (Spike 1, ADR-0018, QST-SPIKE1-MD). Porthole uses the same call.

**What is new**: (1) a dialog porthole shows itself, and the settings it writes; (2) the chord, title-bar button and Explorer menu now accept `.md` files, which depends on conditions only a real VS Code evaluates.

---

## Questions

### QST-CHECK-AUTOLOCK: Does the one-time question appear once, and does each answer do what it says?
- Status: answered — A, in a different order (Turn On first); the check found a real bug: Turn On copied VS Code's defaults into user settings (fixed, commit "fix: Turn On no longer copies…"); cleanup is QST-SETTINGS-CLEANUP
- Why asking: This dialog is new interface that only appears in a real VS Code. It also writes to your user settings, so what it writes must be right. Without it, a floating window can lose compact mode when a second file opens inside it.
- Need: pick a letter (or override — any shape answers). About four minutes. A screenshot of the dialog would help.

**Before you start.** Porthole was reinstalled in your VS Code tonight. Run **Developer: Reload Window** in each open VS Code window (Shift+Cmd+P, type `Reload Window`, press Enter). Then open your user settings as text: Shift+Cmd+P, type `Preferences: Open User Settings (JSON)`, press Enter. Look for a line `"workbench.editor.autoLockGroups"`. Write down whether it is there and what it contains, then close that tab without changing anything.

**Steps.** One action each.

1. **Open an HTML file as text** in the porthole window: in the Explorer, click `samples/tasks.html`.
2. **Pop it out**: press **Ctrl+Alt+M**. A dialog should appear in the middle of the VS Code window, titled "Keep Porthole's floating windows to one tab?", with three buttons: **Turn On**, **Not Now**, **Don't Ask Again**.
3. **Answer Not Now.** The floating window should then open.
4. **Pop out again**: close the floating window (its red button, top left), click `tasks.html` in the Explorer again, press **Ctrl+Alt+M**. No dialog should appear this time, because you already answered this session.
5. **Reload the window** (Shift+Cmd+P, `Reload Window`, Enter), then repeat step 4. The dialog should appear again.
6. **Answer Turn On** this time. The floating window should open.
7. **Check the setting**: open your user settings as text again, as in "Before you start". The line `"workbench.editor.autoLockGroups"` should now include `"workbench.editor.browser": true` and `"vscode.markdown.preview.editor": true`, and anything it contained before should still be there.
8. **Check the lock works**: click into the floating window's page, press **Cmd+P**, type `README`, press Enter. `README.md` should open in the main window, and the floating window should still show only the page.

Options:
- **A — all as described**: one dialog, three buttons; not asked again in the same session; asked again after a reload; Turn On wrote the two entries without removing yours; README opened in the main window.
- **B — the dialog never appeared**: the window just opened.
- **C — the dialog appeared, but something after it was off**: asked twice in one session, not asked after the reload, the setting wrong or missing, or README opened inside the floating window. Say which step.
- **D — something else**, including an error message.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — all as described** (a prediction). *Rationale*: the four behaviors are covered by tests against a mocked VS Code (`src/test/autoLock.test.ts`), and the lock in step 8 is VS Code's own, which locks a group when a browser tab is the first one opened in it (`workbench/browser/parts/editor/editorGroupView.ts` L1263–1272 at tag 1.141.0, read, not run). *Confidence*: 0.65 — because a modal dialog, a write to user settings, and whether VS Code's auto-lock fires for a group created in a brand-new floating window have never been run. *If wrong*: B means porthole believed auto-lock was already on (step "Before you start" tells me why); C at step 8 means VS Code's auto-lock does not apply to floating windows, and ADR-0019 falls back to its option B.

**ANS:** (by Jérémie Lumbroso)
Mostly Option A, but I answered "Turn On" in the first instance, and wasn't able to reset it.

Here is what I saw in Workbench Editor's auto-lock groups:

```json
"workbench.editor.autoLockGroups": {
  "default": false,
  "workbench.editor.chatSession": false,
  "workbench.editor.chatDebug": false,
  "workbench.editorinputs.searchEditorInput": false,
  "workbench.editor.processExplorer": true,
  "agentSessionsWelcomePage": false,
  "workbench.editor.browser": false,
  "notebookOutputEditor": false,
  "jupyter-notebook": false,
  "repl": false,
  "workbench.editors.gettingStartedInput": false,
  "vscode.markdown.editor": false,
  "imagePreview.previewEditor": false,
  "vscode.audioPreview": false,
  "vscode.videoPreview": false,
  "jsProfileVisualizer.cpuprofile.table": false,
  "jsProfileVisualizer.heapprofile.table": false,
  "jsProfileVisualizer.heapsnapshot.table": false,
  "node-notebook": false,
  "latex-workshop-pdf-hook": false,
  "pdf.preview": false,
  "markdown-preview-enhanced": false,
  "terminalEditor": true,
  "workbench.input.interactive": false,
  "mainThreadWebview-markdown.preview": false,
  "mainThreadWebview-simpleBrowser.view": true,
  "mainThreadWebview-browserPreview": true
}
```

and a screen scrape:
```
Workbench › Editor: Auto Lock Groups

If an editor matching one of the listed types is opened as the first in an editor group and more than one group is open, the group is automatically locked. Locked groups will only be used for opening editors when explicitly chosen by a user gesture (for example drag and drop), but not by default. Consequently, the active editor in a locked group is less likely to be replaced accidentally with a different editor.

Text Editor (default)
Chat (workbench.editor.chatSession)
Debug View (workbench.editor.chatDebug)
Search Editor (workbench.editorinputs.searchEditorlnput)
Process Explorer (workbench.editor.processExplorer)
Agent Sessions Welcome (agentSessionWelcomePage)
Browser (workbench.editor.browser)
Notebook Output Editor (notebookOutputEditor)
Jupyter Notebook (jupyter-notebook)
repl Editor (repl)
Welcome Page (workbench.editors.gettingStartedInput)
Markdown Editor (vscode.markdown.editor)
Image Preview (imagePreview.previewEditor)
Audio Preview (vscode.audioPreview)
Video Preview (vscode.videoPreview)
CPU Profile Table Visualizer (isProfileVisualizer.cpuprofile.table)
Heap Profile Table Visualizer (jsProfileVisualizer.heapprofile.table)
Heap Snapshot Table Visualizer (jsProfileVisualizer.heapsnapshot.table)
Node.js Notebook (node-notebook)
LaTeX Workshop Internal PDF Viewer (latex-workshop-pdf-hook)
Pdf Preview (pdf.preview)
Markdown Preview Enhanced (markdown-preview-enhanced)
Terminal (terminalEditor)
Interactive Window (workbench.input.interactive)
Markdown Preview (mainThreadWebview-markdown.preview)
Simple Browser (mainThreadWebview-simpleBrowser.view)
Live Preview (mainThreadWebview-browserPreview)
```

Took a screenshot here: `docs/adr/attachments/screenshots/2026-10-12-spike-1-test/Screenshot 2026-10-13 at 10.52.38 PM.png`

I think the copy should be more big-picture, just a bit — why are we asking this? Because multiple tabs make the window not compact. Locking prevents that from happening, and it should normally not impact them. If they want to hold off, it is likely not to affect their experience unless somehow a sequence of events ends up with multiple tabs opened. We need to always explain: "Why?" In fact your spike explanation would benefit from giving me a sense of what you are trying to figure out.

---

### QST-CHECK-MD-ENTRY: Do porthole's own ways in work for a Markdown file?
- Status: withdrawn — the steps said "the porthole window", which could mean the porthole workspace window or the debug window; reissued with precise names as QST-CHECK-MD-ENTRY2 (Glazier, 2026-10-13)
- Why asking: Spike 1 opened Markdown from the spike's own command. The real porthole adds three ways in — the chord, the button in the editor's title bar, and the Explorer's right-click menu — each guarded by a condition that only a real VS Code evaluates, and those conditions now include `.md`.
- Need: pick a letter (or override — any shape answers). About two minutes.

**Steps.** One action each. Do QST-CHECK-AUTOLOCK first, so its dialog does not interrupt these.

1. **Chord.** In the porthole window's Explorer, click `README.md` so it opens as text. Press **Ctrl+Alt+M**. A floating window should show the README rendered: headings, lists, no `#` characters.
2. **Close** that floating window (red button, top left).
3. **Title-bar button.** With `README.md` still open as text, look at the top right of the editor, where the editor's own buttons are: a "Pop Out to Floating Window" button (two overlapping windows) should be there. Click it. The same rendered floating window should open.
4. **Close** it again.
5. **Explorer menu.** Right-click `CHANGELOG.md` in the Explorer. The menu should include **Pop Out to Floating Window**. Choose it. `CHANGELOG.md` should open rendered in a floating window.
6. **Close** it.

Options:
- **A — all three worked**: each opened the rendered Markdown in a floating window.
- **B — some worked**: say which way in did nothing or was missing.
- **C — it opened as source**: a floating window showed `#` and `-` characters, possibly with a porthole warning about opening as text.
- **D — something else.**

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — all three worked** (a prediction). *Rationale*: the open call is the one Spike 1 proved for Markdown, and the three conditions use the same pattern that works for `.html` today, widened to `.md` and `.markdown` (`package.json`, `contributes.menus` and `keybindings`). *Confidence*: 0.75 — because only the widened conditions are new, and they have never been evaluated by VS Code. *If wrong*: B points at the one condition that failed; C means the preview was not chosen for this file, and the warning porthole shows names the reason.

**ANS:** (by Jérémie Lumbroso)
I have no idea what "In the porthole window's Explorer" means. You need to write better instructions. Writing instructions using made-up, approximate terminology wastes everyone's time.

---

### QST-CHECK-MD-ENTRY2: Do porthole's three ways in open a Markdown file rendered?
- Status: answered
- Why asking: **What this finds out.** Porthole has three ways to pop a file out: the Ctrl+Alt+M chord, a button in the editor's title bar, and an item in the Explorer's right-click menu. Each one is shown only when VS Code decides the selected file qualifies, and that rule was just widened from HTML files to Markdown files. Only a real VS Code applies these rules, so a mistake in them would mean a way in that is silently missing for Markdown. The Markdown window itself is already proven (Spike 1); this checks only the ways in.
- Need: pick a letter (or override — any shape answers). About two minutes.

**Where to do this.** Everything happens in **your porthole workspace window**: the VS Code window you normally use for this project, in which the folder `porthole` is open, and whose title bar ends with `porthole`. That window runs the Porthole you installed. **Do not use a debug window**: no "Run and Debug", no window whose title starts with `[Extension Development Host]`. If one is open, close it first.

**Before you start.** In your porthole workspace window, run **Developer: Reload Window** (Shift+Cmd+P, type `Reload Window`, press Enter), because Porthole was reinstalled tonight with a fix.

**Steps.** One action each. "The Explorer" means the file list in the left side bar of your porthole workspace window; Shift+Cmd+E shows it.

1. **Chord.** In the Explorer, click `README.md` (top level of the folder). It opens as source text in an editor tab. Click once inside that text, then press **Ctrl+Alt+M**. A floating window should appear showing the README rendered: headings in large type, no `#` characters.
2. **Close** that floating window with its red button, top left.
3. **Title-bar button.** Look at the top right of the `README.md` source tab, on the same line as the tab's name: among the small icons there should be one showing two overlapping windows; hovering it shows "Pop Out to Floating Window". Click it. The same rendered floating window should appear.
4. **Close** it again.
5. **Explorer menu.** In the Explorer, right-click `CHANGELOG.md` (top level of the folder). The menu should include **Pop Out to Floating Window**. Choose it. `CHANGELOG.md` should appear rendered in a floating window.
6. **Close** it.

Options:
- **A — all three worked**: each opened the rendered Markdown in a floating window.
- **B — some did not**: say which step's way in was missing or did nothing.
- **C — source instead of rendered**: a floating window showed `#` and `-` characters, possibly with a Porthole warning saying it opened the file as text.
- **D — something else.**

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — all three worked** (a prediction). *Rationale*: the open is the call Spike 1 proved for Markdown, and the three rules use the same pattern that already works for `.html`, widened to `.md` and `.markdown` (`package.json`, under `contributes.menus` and `keybindings`). *Confidence*: 0.75 — because the widened rules have never been applied by a real VS Code. *If wrong*: B points at the one rule that is wrong; C means VS Code did not choose its Markdown preview for this file, and Porthole's warning will say so.

**ANS:** (by Jérémie Lumbroso)
[Note: The instructions here are so high quality I wanted to cry! Thank you for all the context. This was perfect, thanks for the careful use of terminology.]

After completion, I can answer: **Option A.**

- [X] Opening floating window using chord from the workspace source window
- [X] Action button shows up in tab bar and opens floating window for document (flushed right, with "Split Editor" action, an in my current workspace configuration, the "Enhanced Markdown" extension too)
- [X] Explorer menu: The option "Pop Out to Floating Window" shows up, and open the floating window as expected

[Note: The instructions were extremely clear, the explanations and contextualization of all the terminology was exceptional, as was the pacing.]

This was all excellent, one thing that surprised me (but is not necessarily blocking, especially since it affects both HTML and Markdown, and seems to be intentional/unimportant): I am surprised that, when the HTML or Markdown file is open in VSCode, that right-clicking the tab title of the source tab doesn't show the floating window pop-out option, I do see, for instance, "Open in Integrated Browser [⌘K B]" (reflecting both, I think, that I activated the integrated browser, and that I chose that chord). Why can't we also get the floating window pop-out action there as well? It would be more coherent. However, again, I notice this oversight affects all of our target formats, so if this is a limitation, it is not a problem — if this is something we can fix easily, I think it would be worth it, so our users never have to wonder why the option shows up in some places and not others!

Excellent prep work, Glazier! You should write a skill based on everything you have learned about asking a human to follow meticulous testing instructions, because you've reached the highest level of skill that I have seen in my collaborations — well done, thanks for persisting in taking feedback!

Screenshots:
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.28.34 AM.png` About to investigate the Markdown options for opening the floating window in VS Code.
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.29.11 AM.png` Successfully popped out the floating window for the `README.md` file using the chord
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.30.25 AM.png` Showed that right-clicking on the source tab title for `README.md` doesn't display any option to open to floating window (as expected: This is not one of the 3 approved mechanisms)
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.31.14 AM.png` Hovering over the "Pop Out to Floating Window (⌃⌥M)" button in the tab bar (flush right) for the `README.md` file
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.31.14 AM-close-up.png` Close-up of the button and hover caption (could be used for documentation purposes)
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.33.36 AM.png` Shows the third mechanism, Explorer menu, and floating window going along with it (documentation plausibly?)
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 8.34.39 AM.png` Showing that the contextual menu on the source tab *doesn't* (as expected) include the option — but if possible, we might consider whether we could add it as a fourth mechanism

---

### QST-SETTINGS-CLEANUP: May I remove the VS Code defaults that Porthole wrote into your user settings?
- Status: answered — A, done 2026-10-14 by Glazier (backup kept outside the repo); the reset command he asked for is built and is checked in QST-CHECK-TAB-AND-RESET
- Why asking: **What happened.** When you chose Turn On, the build you had then wrote the whole `workbench.editor.autoLockGroups` value into your user settings file (`~/Library/Application Support/Code/User/settings.json`): VS Code's 25 default entries plus Porthole's two. Written out like that, those defaults no longer follow VS Code: if a future VS Code changes one, your settings keep the old value. The bug is fixed, but the entries are still in your file. It is your settings file, so I will not edit it without your yes.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — reduce it to what anyone asked for**: replace the entry with only `"workbench.editor.browser": true` and `"vscode.markdown.preview.editor": true`, the two Porthole turned on. Everything else returns to following VS Code's defaults. Nothing else in the file changes.
- **B — leave it as it is**: everything keeps working; the defaults stay frozen.
- **C — you clean it up yourself**, in Preferences: Open User Settings (JSON).

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — reduce it to the two entries.** *Rationale*: I checked the file: the entry holds 27 keys, and every value other than Porthole's two matches VS Code's own default (checked against VS Code's source at 1.141.0: only `terminalEditor`, `workbench.editor.processExplorer` and two webview editors are on by default, and those four are the ones set to true), so removing them changes nothing today and keeps future defaults working. *Confidence*: 0.8 — because I cannot tell from the file whether you had set any of those values yourself before; if you had, the value equals the default anyway. *If wrong*: if you deliberately set one of those entries, say which, and A keeps it.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A. We should take this incident as dogfooding: We should introduce an action to revert the user settings; this action should first check (to say whether or not the user settings for Porthole seem to have been modified, explicit what they currently are), then offer to revert them (to undo what may have been done). This "reset user settings" action from Porthole could be surfaced in confirmation notifications, after any setting is changed. In fact the "reset user settings" action could ask for selection of individual setting in a checkbox-choosing step (like when the ADRs4AI Manager asks whether you want to commit files) — I think this option is called ["Quick Pick Input"](https://code.visualstudio.com/api/extension-capabilities/common-capabilities#quick-pick): "Here are the currently configured user settings for Porthole, what would you like to remove?" Or something like that.

---

### QST-CHECK-TAB-AND-RESET: Do the source tab's right-click menu and "Review and Reset Settings…" work?
- Status: answered — A, everything as described, with screenshots (2026-10-14)
- Why asking: **What this finds out.** Two small additions from your answers above are built but have never run in a real VS Code: (1) *Pop Out to Floating Window* in the right-click menu of a source tab, the fourth way in you asked for, so the action shows wherever a file can be acted on; (2) a command that lists every user setting set by or for Porthole and removes the ones you tick, the "way back" you asked for after Porthole wrote VS Code's defaults into your settings. They go into 0.2.0, so it is worth two minutes before Purser tags it. Neither step changes anything you would want to keep: step 7 removes only an entry you can turn back on with one click.
- Need: pick a letter (or override — any shape answers). About three minutes.

**Where to do this.** In **your porthole workspace window**: the VS Code window in which the folder `porthole` is open, whose title bar ends with `porthole`. Not in any debug window (none titled `[Extension Development Host]`).

**Before you start.** In that window, run **Developer: Reload Window** (Shift+Cmd+P, type `Reload Window`, press Enter): Porthole was reinstalled this morning with both additions.

**Steps.** One action each. "The Explorer" is the file list in the left side bar (Shift+Cmd+E). "The source tab" is the ordinary editor tab showing a file's text.

1. **Open a source tab.** In the Explorer, click `README.md` (top level of the folder). It opens in a source tab.
2. **Right-click the tab itself**, on its name `README.md` in the row of tabs at the top of the editor (not inside the text). The menu should include **Pop Out to Floating Window**.
3. **Choose it.** The README should open rendered in a floating window.
4. **Close** the floating window with its red button, top left.
5. **Open the review command.** Press Shift+Cmd+P, type `Review and Reset`, and press Enter on **Porthole: Review and Reset Settings…**. A list should appear titled "Porthole: Review and Reset Settings", with a line for each setting set by or for Porthole. After this morning's cleanup you should see two lines starting `workbench.editor.autoLockGroups ›`, one ending `workbench.editor.browser` and one ending `vscode.markdown.preview.editor`, each marked `is true`.
6. **Tick only the line ending `vscode.markdown.preview.editor`** (click its checkbox), then press **Enter**. A notice should say "Porthole: removed 1 setting."
7. **Run the command again** (as in step 5). Only the `workbench.editor.browser` line should remain. Press **Escape** to close the list without changing anything.
8. **Put the removed entry back** the normal way: pop out any Markdown file (step 1, then Ctrl+Alt+M). Porthole should ask again whether to keep its floating windows compact, since Markdown is no longer locked. Choose **Turn On**. A notice should say "Porthole changed your user settings: …" with a **Review and Reset…** button; you can ignore it.

Options:
- **A — all as described.**
- **B — the tab menu item was missing** (step 2), or did not open the floating window (step 3).
- **C — the review list was wrong**: missing, empty, showing lines it should not, or not removing what was ticked. Say at which step.
- **D — something else**, including an error message.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**A — all as described** (a prediction). *Rationale*: the tab menu uses the same rule as the title-bar button, which you confirmed works for `.md` (QST-CHECK-MD-ENTRY2), and VS Code passes the tab's file to the command the same way; the review command's listing and removal are covered by four tests (`src/test/settingsReview.test.ts`). *Confidence*: 0.7 — because the multi-select list and the announcement notice have only ever run against a mocked VS Code. *If wrong*: B means the tab menu needs a different menu group or condition; C means VS Code reports the user's own values differently from what the tests assume, and the fix goes in `src/settingsReview.ts` before 0.2.0 is tagged.

**ANS:** (by Jérémie Lumbroso)
[Note: Excellent guidance, again, really excellent — no ambiguity and I was able to complete this extremely quickly, and with extreme accuracy!]

Option A: Everything happened exactly as described. I have no notes, but I captured everything in screenshots.

Screenshots:
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.33.28 AM.png` screenshot of the question itself
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.33.51 AM.png` right-clicking source tab title to show contextual menu with floating window option now added
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.33.51 AM-close-up.png` close-up of the contextual menu right-clicking from source tab
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.17 AM.png` summoning the "Review & Reset" action from the command palette
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.17 AM-close-up.png` close-up of the "Review & Reset" option
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.45 AM.png` Quick Pick palette selector for the settings
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.45 AM-close-up.png` close-up of the Quick Pick palette selector for settings
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.58 AM.png` full screen with notification "Porthole: removed 1 setting."
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.34.58 AM-close-up.png` close-up of notification "Porthole: removed 1 setting."
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.16 AM.png` second screenshot of the "Review & Reset" Quick Pick palette selector after one setting has been reset; this shows only one setting (as opposed to two, showing the other one was successfully reset)
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.16 AM-close-up.png` close-up of the second screenshot of the Quick Pick palette
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.36 AM.png` full screen screenshot of the dialog "Keep Porthole's floating windows compact?"
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.36 AM-close-up.png` close-up of the dialog "Keep Porthole's floating windows compact?" (possibly for documentation?)
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.49 AM.png` full screen screenshot displaying "Porthole changed your user settings" notification after approving the "Keep Porthole's floating windows compact?" dialog
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.35.49 AM-close-up.png` close-up of the "Porthole changed your user settings" notification message
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 9.46.28 AM.png` a screenshot of this completed answer with the screenshots

---

## Decision

### Chosen: 0.2.0 is ready, pending only the naming review (ADR-0021)

Every check passed: the auto-lock question and its answers (QST-CHECK-AUTOLOCK), the three Markdown ways in (QST-CHECK-MD-ENTRY2), and the tab menu plus Review and Reset Settings (QST-CHECK-TAB-AND-RESET). The one bug they found, Turn On copying VS Code's defaults into user settings, is fixed with a regression test, and Jérémie's settings were cleaned up with his consent. What still gates the publish is the naming review of the new words (ADR-0021), at Jérémie's instruction.

---

## Action Items

- [ ] Run both checks and answer — Owner: Jérémie
- [ ] Read porthole's log and record the result — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: the two features were built; Jérémie pointed out that the check should have been issued as questions without waiting to be asked
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related: [ADR-0015](0015-markdown-in-a-floating-window.md), [ADR-0018](0018-spike-1-markdown-preview-and-focus.md), [ADR-0019](0019-keep-the-floating-window-to-one-tab.md)
