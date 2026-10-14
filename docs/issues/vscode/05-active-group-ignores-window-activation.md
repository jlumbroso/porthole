# `window.tabGroups.activeTabGroup` does not follow the active editor group across windows

**Status**: filed 2026-10-13 as [microsoft/vscode#341430](https://github.com/microsoft/vscode/issues/341430), rewritten after a by-hand repro (ADR-0019, QST-TABAPI-REPRO) confirmed it. The first version of this draft blamed OS window activation; that repro (ADR-0010, QST-CYCLE-REPRO) came back negative, and the cause is the one below. **Labels to suggest**: `bug`, `api`, `workbench-auxwindow`, `workbench-tabs`.

## Summary

With an editor in a floating (auxiliary) window, the extension API's
`vscode.window.tabGroups.activeTabGroup` (and each group's `isActive`) stops
following the workbench's active group when the user moves between the
floating window and the main window. It changes only when some tab group is
added or removed. Extensions that act on "the group the user is in" act on
the wrong window.

## Steps to reproduce (VS Code 1.141.0, macOS)

1. Install any extension with a command that logs
   `vscode.window.tabGroups.all.map(g => ({ viewColumn: g.viewColumn, isActive: g.isActive }))`.
2. Open a file in the main window. Right-click its tab → **Move into New
   Window**.
3. Click into the floating window's editor; run the command.
4. Click into the main window's editor; run the command again.

**Expected**: step 3 reports the floating window's group active; step 4
reports the main window's group active.
**Actual**: both report the same group active. In our run (five rounds, with
the integrated browser in the floating window), the floating window's group
stayed `isActive: true` after clicking the main window, every time. It
changed only when a window was opened or closed.

## Where it comes from (source at tag 1.141.0, paths under `src/vs/`)

- The extension host's active group changes in exactly two places:
  a full model rebuild (`workbench/api/common/extHostEditorTabs.ts`
  `$acceptEditorTabModel`, L309–345), which the main thread sends only when a
  group is **added or removed** (`workbench/api/browser/mainThreadEditorTabs.ts`
  L75–77, computing `isActive` at L521); and a `GROUP_ACTIVE` update for a
  group that is already the workbench's active group (L552–557).
- A floating window's single group fires its only `GROUP_ACTIVE` at creation,
  before the editor service listens to it (`workbench/browser/parts/editor/editorPart.ts`
  L1300; `workbench/services/editor/browser/editorService.ts` L108, L168–172;
  `editorParts.ts` L164–172), and moving between windows changes the active
  *part*, which is forwarded as `onDidActiveEditorChange`, not consumed by the
  tab model.
- A related race: whether the rebuild at a floating window's creation marks
  its group active depends on whether focus reached the new window before
  creation returned. Our extension saw the new group *not* active on three of
  five opens in one session.

## Suggested fix

In `mainThreadEditorTabs.ts`, listen to
`IEditorGroupsService.onDidChangeActiveGroup` (which does fire on part
changes, `editorParts.ts` L297–305) and send the group-active update, next to
the existing listeners at L75–77.

## Why it matters

[porthole](https://github.com/jlumbroso/porthole) pops pages into floating
windows. Its "resize the window I'm in" command intermittently answered that
no window of its was focused, and its lock-to-one-tab step was skipped or
could target the main window's group.

---
*Traced in source by Surveyor 5.1 (Claude Fable 5.1); confirmed by hand by
Jérémie Lumbroso, 2026-10-13; drafted by Glazier 5.5 (Claude Opus 5.5).*
