<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Hands-on check: Markdown and the auto-lock question

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
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
- Status: unanswered
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

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-CHECK-MD-ENTRY: Do porthole's own ways in work for a Markdown file?
- Status: unanswered
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

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending the two checks

Neither feature goes into a release until both questions are answered (Purser has the changelog wording).

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
