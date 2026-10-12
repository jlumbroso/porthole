<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Spike 0: does the one-shot call hold?

- **Date**: 2026-10-12
- **Iteration**: 2
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: A throwaway extension runs the brief's one internal call on a sample page and logs everything it can see; four things only eyes can tell are asked below, one letter each, about three minutes of clicking.

---

## Originating Context

**Source**: `docs/INITIAL-DESIGN-BRIEF.md`, Build plan step 1 ("Spike 0: prove the one-shot call"), and its hand-off prompt: write the spike and the launch config, then stop and ask the human to run it.

The brief asks for the answers in `docs/SPIKE.md`. This ADR takes that role instead, so the questions arrive where questions are answered in this repo and each carries a prediction that can be caught.

**Agency Grant**: Implement as you see fit; stop before building further.

---

## Explicitation

**What I understand**:

1. **Everything rests on one call nobody has run**: `_workbench.openWith(file, 'workbench.editor.browser', [-3, { pinned, auxiliary: { bounds, compact, alwaysOnTop } }])`.
2. **The spike should cost the human as little as possible.** Whatever an extension can observe is logged to a file I read afterwards. The page under test puts its own viewport size, load count and tick count into its title, so they should show up in the log through the tab label.
3. **Some things cannot be observed from code**: whether the window has no tabs or status bar, and whether it stays above other applications. Those are the four questions.

**How to run it** (about three minutes):

1. In this window, press **F5** and choose **Spike 0 — one-shot pop-out**. A second VS Code window opens on the `samples/` folder with every other extension disabled. (`just spike` in a terminal should open the same window; I have not run either.)
2. In that second window, open the command palette and run **Porthole Spike: 1 — Pop out the sample page**. Look at what appears, then answer QST-SPIKE-WINDOW below.
3. Tick a box in the page. A notification in the second window offers **Step 2 — rewrite the page**; click it. Answer QST-SPIKE-RELOAD.
4. Click **Step 3 — pop out again**. Answer QST-SPIKE-TWICE.
5. Click **Step 4 — close every tab**, then **Step 5 — fallback path**. Answer QST-SPIKE-FALLBACK.
6. Close the second window and tell me it is done.

If a notification disappears, every step is also in the palette under "Porthole Spike".

**What I read from the log afterwards** (`spike/.run/spike.log`, nothing for you to copy):

- the VS Code version, and whether any call threw;
- the tab groups before and after each step, and how many milliseconds passed before a new group appeared (this tests the brief's "new tab group within about a second" success check);
- each tab's label, which should carry the page's own numbers;
- whether a pop-out of a page that is already popped out moves the tab or duplicates it;
- whether closing the last tab removes the floating window's group.

**How ready this is**:

- Every command handler was walked once outside VS Code against a stub (`scripts/ephemeral/2026-10-12-smoke-spike-extension.js`, five checks passed). That catches typos; it says nothing about VS Code.
- The ids the spike calls were found as strings in the installed 1.141.0 application bundle. That shows they exist, not that they behave as the brief says.
- **I have not run the spike in a real VS Code**, because that would have opened windows on your screen unannounced.
- Surveyor, the verifier seat, has been asked to review the spike; no review had arrived when this was written.

**What the source says, added at iteration 2** — Surveyor's independent check of the brief against VS Code's source at tag 1.141.0 ([`docs/reviews/2026-10-12-design-brief-source-check.md`](../reviews/2026-10-12-design-brief-source-check.md)) arrived after the four predictions below were written. They are left as I wrote them, so the record shows what I expected before a second mind weighed in. What the source adds:

- **Window**: all three `auxiliary` options (size, compact, always on top) are honored when the window is created. The source expects answer A.
- **Reload**: auto-reload is on by default. The source expects the page to update; where ticks are stored was not part of the check.
- **Twice**: a tab opened through this call is found and *moved* on a second run. The emptied window closes itself only while `workbench.editor.closeEmptyGroups` is at its default (`true`). Neither your user settings nor this workspace's settings set it, and the spike window uses your real settings, so the source expects answer A.
- **Fallback**: both the compact and the pin commands act on whichever window is active when they run. The fallback therefore depends entirely on focus having moved to the new window within the brief's 200 ms pause. The source cannot say whether it does; this is the answer most worth having.
- **Still only the machine can tell**: how the pin behaves across macOS Spaces and over full-screen apps.

So the source and my predictions point the same way on the first three, and on those I would now put confidence nearer 0.8 than 0.5. A reading of source is still not a run.

**Assumptions**:

- Disabling other extensions and workspace trust in the spike window does not change how the integrated browser or floating windows behave.
- The tab label follows the page's title. If it does not, the log still has group counts and timings, and the page shows the numbers on screen.

**Not in this run**:

- Popping out a tab opened with the globe button (the brief's sixth spike question). It concerns browser tabs, which is milestone M2, and it needs a manual setup step.
- Whether the pin holds across macOS Spaces or over a full-screen app. If you happen to notice, say so in any answer.

**Confirm**: Jérémie, by answering the four questions.

---

## Questions

### QST-SPIKE-WINDOW: After step 1, what appeared?
- Status: answered
- Why asking: This is the whole premise. Compact and always-on-top cannot be read from inside an extension.
- Need: pick a letter (or override — any shape answers); add a word if something looked off

Options:
- **A — the porthole**: a small separate window showing only the sample page — no tab bar, no breadcrumbs, no status bar — and it stays in front when you click another application.
- **B — a floating window, but not right**: a separate window with the page, but it shows tabs or a status bar, or it is large, or it goes behind other windows when you click away. Say which.
- **C — a plain tab**: the page opened as an ordinary tab inside the second VS Code window.
- **D — nothing, or an error**: no page appeared, or VS Code showed an error message.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — the porthole** (a prediction, not a preference). *Rationale*: the brief traces the call through six steps of VS Code's source at tag 1.141.0, and I found `_workbench.openWith`, `workbench.editor.browser` and both floating-window commands as strings in the installed 1.141.0 bundle. *Confidence*: 0.6 — because every link in that chain was read and none was run, and the brief's author and I are the same model. *If wrong*: B means the call works and one option is ignored, so that option moves to a follow-up command; C or D means the one-shot path is dead and the stable fallback (step 5) becomes the primary design.

**ANS:** (by Jérémie Lumbroso)
Option A. More precisely:

This is what happened after I pressed F5 (I didn't get a choice of "Spike 0"), a new window opened with a single folder `samples` containing a file `tasks.html`. I opened a palette and typed the chevron and "Spike" and saw the other probes.
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 3.58.05 PM.png`

When I ran "Spike 1", I saw the following window appear in the foreground of the editor:
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 3.59.16 PM.png`
In this image, you can see three layers from frontmost to backmost: (a) the porthole window displaying the tasks, (b) the new window opened by F5, (c) the VSCode workspace of the `porthole` project itself:
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 3.59.21 PM.png`

Note in the bottom of the window, bottom-right, the notification popup with the caption: "_Spike step 1 done. Look at the floating window, tick a box in it, then:_" which invites to click for step 2, which I did, and which works (though note these notices time out and no way to get them back!). Page loads is 1.

I can confirm that this window stays in the foreground no matter which other app is selected. When a desktop is changed, it doesn't follow but it can be moved to other desktops, where it will also stay in the foreground.

Reverse Centaurly Yours,
-- Jérémie

---

### QST-SPIKE-RELOAD: After step 2, did the page update by itself?
- Status: answered
- Why asking: A task page that a coding agent rewrites must refresh without a click, and the boxes you ticked should survive.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — updated, ticks kept**: "File written" changed to a new time, "Page loads" went up, and the box you ticked is still ticked.
- **B — updated, ticks lost**: the time and load count changed, but the box is unticked or "Page loads" went back to 1.
- **C — did not update**: the page still shows the old time.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — updated, ticks kept** (a prediction). *Rationale*: the brief cites `workbench.browser.autoReloadOnFileChange` as on by default, and that setting's name is present in the installed bundle; the page keeps its ticks in `localStorage`. *Confidence*: 0.5 — because the reload is well supported by the brief, but where the integrated browser keeps `localStorage` for a `file://` page in this window is something I have only read about. *If wrong*: B means task pages must not rely on browser storage, so progress has to live in the file or be exported; C means porthole needs its own file watcher.

**ANS:** (by Jérémie Lumbroso)
Option A.

For more detail, see:
- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 3.59.43 PM.png`

The `File written` timestamp has changed, and the `Page loads` has incremented by 1, compared to before the Step 2. The page keeps its data, including ticks.

---

### QST-SPIKE-TWICE: After step 3, how many floating windows are there?
- Status: answered
- Why asking: Resizing is planned as "open again at a new size". That only works if a second pop-out replaces the first window instead of adding one.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — one, showing the page**: the first window went away, or was reused.
- **B — two, one of them empty**: a new window has the page and the old one is left blank.
- **C — two, both showing the page**: the page was duplicated.
- **D — one, and nothing visibly happened**: the existing window stayed as it was.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — one, showing the page** (a prediction). *Rationale*: the brief reads the browser editor as single-per-resource, so re-opening should move the tab; it explicitly leaves "does the emptied window close?" to this spike. *Confidence*: 0.45 — because the move is argued from source and the window closing is not argued at all. *If wrong*: B means the resize command must close the emptied window itself; C means it must close the source tab; D means resize-by-reopening does not work and that part of the design is rethought.

**ANS:** (by Jérémie Lumbroso)
Option A.

Just a single one, showing the page.

- See: `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 4.00.20 PM.png`

---

### QST-SPIKE-FALLBACK: After step 5, what did the stable-commands path produce?
- Status: answered
- Why asking: This path is the safety net if the internal call ever breaks. The brief flags a timing risk: the compact and pin commands may run before the new window has focus and do nothing.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — floating, compact and on top**: a separate window, large (about 1024×768), page only, stays in front.
- **B — floating, but with tabs or not on top**: the window opened, but compact mode or the pin did not take. Say which.
- **C — no new window**: the page stayed in the second VS Code window.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — floating, compact and on top** (a prediction). *Rationale*: all four commands are public and present in the installed bundle, and each is awaited before the next. *Confidence*: 0.5 — because the 200 ms pause before the last two commands is the brief's guess, and the brief itself rates this failure "medium". *If wrong*: B means the fallback must wait for the new window to report focus before running the last two commands; C means the fallback needs a different way to move the tab.

**ANS:** (by Jérémie Lumbroso)
Option A.

Spike 4 closed all windows, and then the window that opened here was larger/wider but had the some foregrounding properties as before.

- See `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 4.00.43 PM.png` for full screen
- See `docs/adr/attachments/screenshots/2026-10-12-spike-0-test/Screenshot 2026-10-12 at 4.00.44 PM.png` for just the float itself

---

## Supporting Materials

### FIL: spike-files
- `spike/extension.js` — the five commands and the logger
- `spike/package.json` — the throwaway manifest (`portholeSpike.*` ids, on purpose not `porthole.*`)
- `samples/tasks.html` — the page under test; the spike works on a stamped copy in `spike/.run/`, so the tracked file never changes
- `.vscode/launch.json` — the F5 configuration
- `scripts/ephemeral/2026-10-12-smoke-spike-extension.js` — the stub walk

---

## Decision

### Context

No product code is written until the call it depends on has been seen to work on this machine.

### Chosen: pending the run

The four answers and the log decide three things: whether the one-shot call is the primary path (the brief's product decision 0002), whether resize-by-reopening stands (0004), and what the fallback needs. They are recorded here at the next iteration, and the brief's six product decisions become ADRs only then.

---

## Action Items

- [ ] Run the spike and answer the four questions — Owner: Jérémie
- [ ] Read the log, record the results and the decisions they force — Owner: Glazier
- [ ] Review the spike and, afterwards, my reading of the results — Owner: Surveyor

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: VS Code updated to 1.141.0; ADR-0001 answered
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft, with the spike it describes
- Outcome: `Draft`

### Iteration 2 (2026-10-12)
- Trigger: Surveyor's source check of the design brief arrived before the spike was run
- Contributors: Surveyor 5.1 (Claude Fable 5.1) — the source reading; Glazier 5.5 (Claude Opus 5.5) — this note
- Changes: added "What the source says" under Explicitation; the four predictions are unchanged on purpose
- Outcome: stays `Draft`; the questions are still open

---

## Links

- Related ADRs: [ADR-0001](0001-founding-identity-gate-and-crew-shape.md), [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md) (QST-SPIKE-AUTOMATION follows this spike)
- Founding research: [`docs/INITIAL-DESIGN-BRIEF.md`](../INITIAL-DESIGN-BRIEF.md), Build plan
