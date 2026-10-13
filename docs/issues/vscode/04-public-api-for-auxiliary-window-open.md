# API: let extensions open an editor in a new floating window, with size, compact and always-on-top

**Status**: filed 2026-10-13 as [microsoft/vscode#341245](https://github.com/microsoft/vscode/issues/341245); the issue carries the filed text, this draft is kept as written. **Labels to suggest**: `feature-request`, `api`, `workbench-auxwindow`.

## Summary

Extensions can move an editor into a new window with
`workbench.action.moveEditorToNewWindow`, but cannot choose the window's size,
cannot make it compact or always-on-top at creation, and cannot open an editor
directly into a new window. The workbench supports all of this internally:
`_workbench.openWith(resource, editorId, [AUX_WINDOW_GROUP, { auxiliary: { bounds, compact, alwaysOnTop } }])`
does exactly that today. The public `vscode.openWith` cannot reach it.

## Use case

porthole, an extension that pops an HTML page into a small, compact, pinned
window beside your code. It calls the internal command above because nothing
public does the job, falling back to public commands when the internal call
fails. The fallback opens at the default 1024×768, shows the page in the main
window first, and runs compact and pin as separate steps that depend on focus
having moved.

## What exists today (1.141.0)

- `_workbench.openWith` passes options through and sends the column to
  `columnToEditorGroup`
  (`workbench/browser/parts/editor/editorCommands.ts` L544), which lets the
  special group `-3`, `AUX_WINDOW_GROUP`, through
  (`workbench/services/editor/common/editorGroupColumn.ts` L19;
  `workbench/services/editor/common/editorService.ts` L34).
- For that group, a floating window is created from `options.auxiliary`
  (`workbench/services/editor/common/editorGroupFinder.ts` L139), whose fields
  are `bounds`, `compact` and `alwaysOnTop`
  (`platform/editor/common/editor.ts` L320).
- The public `vscode.openWith` maps every column except positive ones and
  `Beside` to the active group
  (`workbench/api/common/extHostTypeConverters.ts` L336;
  `workbench/api/common/extHostApiCommands.ts` L443), so `-3` never arrives.
- Floating windows already persist their bounds, compact state and pin across
  restarts (`workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts` L239).

## Proposal

A `ViewColumn`-like target for a new window in `TextDocumentShowOptions` and
`vscode.openWith`, for example:

```ts
await vscode.commands.executeCommand('vscode.openWith', uri, viewType, {
  viewColumn: vscode.ViewColumn.NewWindow,
  window: { width: 420, height: 640, compact: true, alwaysOnTop: true },
});
```

Optionally, a way to resize an existing floating window
(`AuxiliaryWindow.setBounds` exists in the renderer, but no command exposes
it), which would remove the need to re-open a page to resize it.

## Evidence it works

On VS Code 1.141.0, macOS, the internal call opened the window at the
requested size, compact and pinned, in 20 runs out of 20 across a spike and a
hands-on test (new window reported within 84–236 ms).

---
*From porthole's design brief (Claude Opus 5.5, 2026-10-12) and its spike;
the call chain re-checked in source by Surveyor 5.1 (Claude Fable 5.1);
drafted by Glazier 5.5 (Claude Opus 5.5).*
