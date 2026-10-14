# Let an editor be opened into a new floating window without taking keyboard focus

**Status**: draft, not filed. **Labels to suggest**: `feature-request`, `workbench-auxwindow`, `api`.

## Summary

`IEditorOptions.preserveFocus` and `inactive` keep focus where it is when an
editor opens inside an existing window. When the editor opens into a **new**
floating window (`AUX_WINDOW_GROUP`), the new window is created with no
"do not activate" option, so it always takes the keyboard. On macOS that
moves focus out of whatever app the user was typing in.

## Steps to reproduce (VS Code 1.141.0, macOS)

1. From an extension, after a 5-second delay, run
   `_workbench.openWith(uri, editorId, [-3, { preserveFocus: true, inactive: true, auxiliary: { bounds: { width: 420, height: 640 } } }])`.
2. During the delay, click into another application (TextEdit) and keep typing.

**Expected**: the floating window appears; typing continues in TextEdit.
**Actual**: the floating window takes the keyboard; typing stops in TextEdit.
Same with and without `preserveFocus` / `inactive`, and also when TextEdit is
on another macOS desktop (the window opens on the current desktop).

## Where it comes from (source at tag 1.141.0, paths under `src/vs/`)

- The editor options are honored for the editor: `workbench/browser/parts/editor/editorPanes.ts`
  L265–270 skip focusing the pane.
- A new floating window is opened with `window.open` and a features list
  that has no "do not focus" entry
  (`workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts`
  L366–387); the main-process handler maps only those features
  (`platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService.ts`
  L100–165), so Electron's default, show and focus, applies.

## Proposal

When the open request carries `preserveFocus` (or `inactive`), create the
auxiliary window shown but not activated (Electron's `showInactive`), and pass
that through the features list.

## Why it matters

Tools that pop a page into a floating window on behalf of an agent
([porthole](https://github.com/jlumbroso/porthole)) may fire while the user
is typing, possibly a password in a terminal. Today the only options are to
take the keyboard or not to open at all.

---
*Observed 2026-10-13 by Jérémie Lumbroso (porthole's Spike 1, ADR-0018);
source read by Surveyor 5.1 (Claude Fable 5.1); drafted by Glazier 5.5
(Claude Opus 5.5).*
