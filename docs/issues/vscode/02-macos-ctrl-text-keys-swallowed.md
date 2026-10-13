# [macOS] Ctrl+A, Ctrl+E and the other Ctrl text-editing keys do nothing in an integrated-browser page

**Status**: filed 2026-10-13 as [microsoft/vscode#341243](https://github.com/microsoft/vscode/issues/341243); the issue carries the filed text, this draft is kept as written. **Labels to suggest**: `bug`, `browser-integration`, `macos`, `keybindings`.

## Summary

On macOS, text fields everywhere accept the Ctrl-based editing keys: Ctrl+A
(start of line), Ctrl+E (end of line), and also Ctrl+K, Ctrl+F, Ctrl+B,
Ctrl+N, Ctrl+P, Ctrl+D and Ctrl+H. In a page shown by VS Code's integrated
browser, Ctrl+A and Ctrl+E do nothing. This happens in any browser tab,
docked or floating.

## Steps to reproduce (stock VS Code 1.141.0, macOS)

1. Open a page with `<input value="hello world">` in the integrated browser.
2. Click into the middle of the text.
3. Press **Ctrl+A**, then **Ctrl+E**.

**Expected**: the cursor jumps to the start, then the end, as in Safari,
Chrome or any macOS text field.
**Actual**: the cursor does not move.

Observed for Ctrl+A and Ctrl+E. The other keys listed are expected to behave
the same way by the source below; check them before filing.

## Where it comes from (source at 1.141.0)

- On macOS the preload treats only **Cmd** as the command modifier
  (`platform/browserView/electron-browser/preload-browserView.ts` L107:
  `const ctrlCmd = isMac ? event.metaKey : event.ctrlKey`). A Ctrl-modified
  key is not in the native allowlist, so it is `preventDefault`ed and
  forwarded to the workbench's keybinding service (L129–139 →
  `workbench/contrib/browserView/electron-browser/webContentsViewHost.ts`
  L237–246).
- VS Code has no binding for those chords outside the editor and the terminal,
  so nothing happens, and the page never sees the key.

## Suggested fix

On macOS, let Ctrl+letter keys without Cmd or Alt reach the page when a text
field is focused, or at least the Cocoa text-system set (A, E, K, F, B, N, P,
D, H). The forwarding exists so workbench keybindings work over a page; those
chords are rarely bound, and when one is, the page's text field is the more
likely intent.

---
*Found 2026-10-12 by Jérémie Lumbroso during porthole's first real use; traced
in source by Surveyor 5.1 (Claude Fable 5.1); drafted by Glazier 5.5 (Claude
Opus 5.5).*
