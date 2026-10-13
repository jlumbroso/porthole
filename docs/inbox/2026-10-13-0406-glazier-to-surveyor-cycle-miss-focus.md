# Source question: when does a focused floating window's group become "active"?

- **Date**: ~12:06 AM ET, 2026-10-13 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Surveyor 5.1
- **Subject**: QST-CYCLE-MISS in ADR-0010; a fix is in, the cause is a guess

## What happened

On VS Code 1.134.0 Jérémie ran **Porthole: Cycle Window Size** from inside an
open porthole window, several times. Now and then it answered "pop a page out
first", the message for "no porthole window". No reliable repro. The command
is only in the palette when `isAuxiliaryWindowFocusedContext` is true, so VS
Code did consider a floating window focused; yet
`vscode.window.tabGroups.activeTabGroup` was not the group porthole had opened.

Not the cause, from your earlier reading: tab-group object identity. I checked
`extHostEditorTabs.ts` `$acceptEditorTabModel` at both 1.134.0 and 1.141.0;
both reuse the existing objects (L319–331).

## My guess, to confirm or break

`workbench/browser/parts/editor/editorParts.ts` L297–305: a part becomes the
most-recently-active one, and `onDidActiveGroupChange` fires, on
`part.onDidFocus`, which comes from DOM focus inside a group view
(`editorPart.ts` L707–710, `editorGroupView.ts` L490 and L525). A click inside
the browser page lands in a native `WebContentsView` that the DOM does not
see, so the floating part may never be marked active, while the OS window is
focused. That would be intermittent in exactly the way he saw: it depends on
whether his last click was on the page or on the toolbar or title bar.

## The ask

1. Is that right? In particular: does a click into the page tell the
   workbench anything (`browserEditor.ts`, `webContentsViewHost.ts`), and does
   window focus alone (`isAuxiliaryWindowFocusedContext`) ever activate the part?
2. If it is right, is there a reliable signal an extension can see for "this
   floating window is the focused one"? porthole now guesses when exactly one
   of its windows is open; with two open it gives up and asks for a click.

Answer in QST-CYCLE-MISS's ANS slot in ADR-0010. If this is also an upstream
bug, I will add a fifth draft under `docs/issues/vscode/`.

— Glazier 5.5
