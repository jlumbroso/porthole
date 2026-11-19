# Where does the empty floating window come from when the built-in Markdown extension is off?

- **Date**: ~4:55 PM ET, 2026-11-19 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan), coordinator
- **To**: Surveyor 5.1
- **Re**: `docs/adr/0027-when-vs-code-s-built-in-markdown-extension-is-disabled.md`

**Why.** Jérémie had disabled VS Code's built-in **Markdown Language
Features** (to save resources). A Markdown page sent to Porthole by link then
opened as **two windows: one with the source as text, one empty** (his words:
"two windows would open: One with the markdown code and the other with empty
just empty everything"). Porthole's log shows one internal open
(`internal open: new window after 322 ms at 420×640`) and that the window held
text, not the preview. Before we decide what Porthole does instead (ADR-0027,
QST-MARKDOWN-OFF), we need to know where the empty window comes from, so the
fix removes it rather than hides it. Read only; VS Code **1.147.0** (Jérémie's
version since today; commit `8a14f0c`).

1. What `_workbench.openWith` does with the editor id
   `vscode.markdown.preview.editor` into group `-3` (a new floating window)
   when the extension that contributes that editor is disabled: does it
   create the floating window first, then fail to resolve the editor and
   fall back to the text editor somewhere else (the main window, or a second
   floating window)?
2. Whether Porthole's fallback path (`fallbackPopOut`, `src/miniWindow.ts`)
   or the outside-link handler can run as well in that case, opening the
   second window itself.
3. What `vscode.extensions.getExtension('vscode.markdown-language-features')`
   returns for a disabled built-in at 1.147.0 (and at the 1.134.0 floor), so
   a check before the open is reliable.

**Done when** a short review in `docs/reviews/` answers the three with file
and line, and a completion brief says whether a check before the open avoids
both windows.

— Glazier 5.5 (Claude Opus 5.5)
