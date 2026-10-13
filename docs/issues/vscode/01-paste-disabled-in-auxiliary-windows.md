# [macOS] Cmd+V does not paste into a page in the integrated browser when it is in a floating window

**Status**: filed 2026-10-13 as [microsoft/vscode#341242](https://github.com/microsoft/vscode/issues/341242); the issue carries the filed text, this draft is kept as written. **Labels to suggest**: `bug`, `browser-integration`, `workbench-auxwindow`, `macos`.

## Summary

On macOS, Cmd+V does nothing in a text field of a page shown by the
integrated browser when that browser tab is in a floating (auxiliary) window.
Right-click → **Paste** in the same field works.

## Steps to reproduce (stock VS Code 1.141.0, macOS)

1. Create `form.html` containing `<input placeholder="paste here">` and open it
   in the integrated browser (**Open in Integrated Browser**).
2. Right-click the browser tab → **Move into New Window**.
3. Copy any text from another application.
4. Click into the input in the floating window and press **Cmd+V**.

**Expected**: the text is pasted, as it is in the same tab docked in the main window.
**Actual**: nothing happens. Right-click → **Paste** pastes.

Before filing, confirm the docked case (step 2 skipped) pastes on the current
version; our expectation from source is that it does, but nobody has run it.

## Where it comes from (source at 1.141.0)

- The browser view's preload lets Cmd+A/C/V/X/Z through to the page instead
  of forwarding them to the workbench:
  `platform/browserView/electron-browser/preload-browserView.ts` L45–51
  (`nativeCtrlCmdKeybindings.mac.noShift = ['a','c','v','x','z']`) and L107–120.
- On macOS, a page's Cmd+V is carried out by the application menu's
  **Edit → Paste** item, which VS Code gives the Electron role `paste`
  (`platform/menubar/electron-main/menubar.ts` L712–718).
- While an auxiliary window has focus, the menubar is rebuilt with every
  action disabled: `onDidChangeWindowFocus` (L253–260) sets
  `noActiveMainWindow`, and `setMenu` (L525–533) creates items with
  `enabled: false` unless they have a fallback handler, which only a few
  File-menu actions do (L126–151). A disabled item's key equivalent does
  nothing.
- The browser's context menu builds its own enabled `role: 'paste'` item
  (`platform/browserView/electron-main/browserViewMainService.ts` L668–670),
  which is why right-click works.

## Suggested fix

Keep the role-bearing **Edit** items (`undo`, `redo`, `cut`, `copy`, `paste`,
`selectAll`) enabled when an auxiliary window has focus. A role acts on the
focused web contents and needs no renderer of the main window.

## Probably also affected (not verified)

Cmd+C, Cmd+X, Cmd+A and Cmd+Z in the same situation, since they ride the same
menu roles. Only Cmd+V was observed.

## Why it matters

Floating windows are the natural place for a page you work alongside: a
checklist, a form, a set of instructions. The first real use of such a page
in a floating window needed pasting a value into a text field.

---
*Found 2026-10-12 by Jérémie Lumbroso during porthole's first real use; traced
in source by Surveyor 5.1 (Claude Fable 5.1); drafted by Glazier 5.5 (Claude
Opus 5.5).*
