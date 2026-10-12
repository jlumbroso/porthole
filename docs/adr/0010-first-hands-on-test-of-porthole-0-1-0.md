<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# First hands-on test of porthole 0.1.0

- **Date**: 2026-10-12
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Version 0.1.0 pops out a file, cycles sizes, docks back and toggles the pin; it passes 21 tests against a mocked VS Code, and five things only a real window can show are asked below, one letter each.

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

**Assumptions**:

- Your other extensions being enabled does not change the result. If something looks off, the Spike 0 configuration (extensions disabled) is still there to compare.
- `Ctrl+Alt+M` is free in your keybindings.

**Confirm**: Jérémie, by answering the five questions.

---

## Questions

### QST-V1-POPOUT: After step 2, what did Ctrl+Alt+M do?
- Status: unanswered
- Why asking: The spike was run from the palette. A key binding depends on a `when` clause that only a real editor evaluates.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — the porthole**: the same small, compact, on-top window as in the spike, showing the sample page.
- **B — a window, but different from the spike**: say what differs (size, tabs showing, not on top).
- **C — nothing happened**: the key did nothing, or VS Code said the command was not found.
- **D — an error message**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — the porthole** (a prediction). *Rationale*: the call is the one the spike ran five times, with the same arguments (`src/miniWindow.ts`), and the `when` clause uses context keys Surveyor found declared with exactly these spellings (source check, note 8). *Confidence*: 0.7 — because the call is proven, but the binding and the title-bar button have never been evaluated by a real VS Code. *If wrong*: C means the `when` clause or the key is wrong and the palette command should still work — try **Porthole: Pop Out to Mini Window** and tell me; B or D means something in the product's additions changed the call.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-V1-RESIZE: After step 3, what did cycling the size do?
- Status: unanswered
- Why asking: The window is now locked to one tab, which the spike's window was not. This shows whether VS Code still moves a tab out of a locked window.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — one window each time, changing size**: bigger, bigger again, then back to the small one, with the page's ticks kept.
- **B — the windows pile up**: each cycle leaves an extra window, empty or showing the page.
- **C — nothing changes**: the window stays as it is.
- **D — an error message**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — one window each time** (a prediction). *Rationale*: the spike showed the move and the automatic close for an unlocked window (ADR-0003); a lock in VS Code stops editors opening *into* a group, and I know of nothing that stops one leaving. *Confidence*: 0.55 — because that last clause is my reading of how locks behave, not something anyone here has run or read in source. *If wrong*: B or C means the lock interferes with the move, and porthole should unlock before re-opening, or not lock at all and accept that compact mode can be lost.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-V1-LOCK: After step 4, where did the other file open?
- Status: unanswered
- Why asking: This is what the lock is for. Compact mode switches itself off when a second tab enters the window.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — in the main window**: the mini window still shows only the page.
- **B — inside the mini window**: it gained a tab bar or a second tab.
- **C — somewhere else**: a third window, or nothing opened.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — in the main window** (a prediction). *Rationale*: this is the documented purpose of a locked editor group, and the brief cites the command for exactly this use. *Confidence*: 0.65 — because I have not seen how a locked group in a *floating* window redirects an open. *If wrong*: B means the lock did not take (the log will say whether porthole skipped it) or does not do what the brief says, and the "one tab" promise needs another mechanism.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-V1-DOCK: After step 5, what did Ctrl+Alt+M do in the mini window?
- Status: unanswered
- Why asking: The same key is meant to pop out and to put back, depending on which window has focus.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — docked**: the page became a tab in the second VS Code window and the mini window closed.
- **B — docked, but the mini window stayed**, empty.
- **C — nothing happened**.
- **D — it opened another mini window** instead of docking.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — docked** (a prediction). *Rationale*: the command behind it is public (`workbench.action.restoreEditorsToMainWindow`) and the key is bound on `isAuxiliaryWindowFocusedContext`, a real context key (Surveyor's source check, note 8). *Confidence*: 0.65 — because the two bindings share one chord and I have not seen VS Code choose between them. *If wrong*: D means the pop-out binding won the chord, so its `when` clause must exclude the mini window more strictly; C means focus inside the page does not count as the window being focused, and docking needs the palette.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-V1-PIN: After step 6, did the Explorer entry work, and did the pin come off?
- Status: unanswered
- Why asking: Two small things in one step: the right-click entry on a file that is not open, and unpinning.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — both worked**: the right-click popped the page out, and after toggling, the mini window went behind the other application.
- **B — the right-click entry is missing or did nothing**.
- **C — the pin did not come off**: the window stayed in front.
- **D — neither worked**.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-12)

**A — both worked** (a prediction). *Rationale*: the Explorer entry uses the same command with the file passed as its argument, which the tests cover; the toggle is one public command. *Confidence*: 0.7 — because menu placement is declared in the manifest and never exercised. *If wrong*: B points at the menu's `when` clause; C means the toggle acts on a different window than the one that looks focused.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Context

Version 0.1.0 is not installed into daily use until a real window has shown these five things.

### Chosen: pending the run

The answers decide whether the lock stays, whether the single chord works for both directions, and whether M2 and M4 can build on this as it is.

---

## Action Items

- [ ] Run the test and answer the five questions — Owner: Jérémie
- [ ] Read the log and record the result — Owner: Glazier
- [ ] Review `src/` — Owner: Surveyor

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: Spike 0 passed; version 0.1.0 written
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related ADRs: [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md), [ADR-0005](0005-open-with-the-internal-one-shot-call-guarded-by-a-stable-fallback.md), [ADR-0007](0007-resize-means-re-open-with-new-bounds.md)
- Code: `src/commands.ts`, `src/miniWindow.ts`, `package.json` (`contributes`)
