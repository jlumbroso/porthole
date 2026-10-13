# The active editor group does not follow OS window activation into a floating window

**Status**: draft, not filed. Waiting on the one-minute repro below being run by hand; the cause is read in source, not observed. **Labels to suggest**: `bug`, `workbench-auxwindow`, `api`.

## Summary

When a floating (auxiliary) window becomes the OS-active window without
focus landing inside one of its editor groups — a click on its title bar,
Cmd+\`, Mission Control or the Dock — VS Code's active editor group stays the
one in the previously focused window. Context keys say the floating window is
focused (`isAuxiliaryWindowFocusedContext` is true), while
`vscode.window.tabGroups.activeTabGroup`, and every command that acts on the
active group, still target the other window.

## Steps to reproduce (stock VS Code 1.141.0, macOS)

1. Open any file, right-click its tab → **Move into New Window**. Then, in the
   floating window's title bar, enable compact mode (there is then no tab
   strip to click).
2. Click into the main window's editor.
3. Click the floating window's **title bar**.
4. Run any command that acts on the active group, for example **View: Lock
   Editor Group**, from the floating window's command palette.

**Expected**: it acts on the floating window's group.
**Actual (from source; to be confirmed)**: it acts on the main window's group.
Clicking *into* the floating window's editor before step 4 makes it act on
the floating window.

## Where it comes from (source at tag 1.141.0, paths under `src/vs/`)

- `isAuxiliaryWindowFocusedContext` follows the OS-active window:
  `workbench/browser/contextkeys.ts` L241, from
  `layoutService.onDidChangeActiveContainer`, derived from
  `hostService.onDidChangeActiveWindow` (`workbench/browser/layout.ts` L494,
  L584–594).
- The active group is the active group of the most recently *focused* editor
  part: `workbench/browser/parts/editor/editorParts.ts` L297–305 updates it on
  `part.onDidFocus`, which fires only on focus inside an editor group
  (`editorPart.ts` L707–710; `editorGroupView.ts` L487–527).
- Nothing in `editorParts.ts` listens to the active window, so the two signals
  can disagree. Compact mode removes the tab strip, which is the click target
  that would otherwise re-activate the group.

## Suggested fix

In `editorParts.ts`, listen to `hostService.onDidChangeActiveWindow` and mark
the part of the newly active window as the most recently active, firing
`onDidActiveGroupChange` as `part.onDidFocus` already does.

## Why it matters

Any extension that acts on "the window the user is in" gets the wrong one,
intermittently, depending on how the user switched windows. For
[porthole](https://github.com/jlumbroso/porthole), it made **Cycle Window
Size** report that no porthole window was open, from inside one.

---
*Seen intermittently by Jérémie Lumbroso on VS Code 1.134.0, 2026-10-13;
cause traced in source by Surveyor 5.1 (Claude Fable 5.1); drafted by
Glazier 5.5 (Claude Opus 5.5).*
