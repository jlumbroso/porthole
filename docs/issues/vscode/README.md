# Issues for microsoft/vscode

Problems porthole met in VS Code itself, written up for upstream. **The first four were
filed on 2026-10-13** by Jérémie's decision; the links are below. The issues
carry the filed text; the drafts here are kept as written, before final edits
(porthole linked, draft-only notes removed, one related issue cited).

| Draft | Filed as | Kind | Found by |
| --- | --- | --- | --- |
| [01 — Cmd+V does not paste into a page in a floating window](01-paste-disabled-in-auxiliary-windows.md) | [#341242](https://github.com/microsoft/vscode/issues/341242) | bug | first real use, 2026-10-12; traced by Surveyor 5.1 |
| [02 — macOS Ctrl text-editing keys never reach a page](02-macos-ctrl-text-keys-swallowed.md) | [#341243](https://github.com/microsoft/vscode/issues/341243) | bug | first real use, 2026-10-12; traced by Surveyor 5.1 |
| [03 — let compact floating windows hide the browser toolbar](03-hide-browser-toolbar-in-compact-windows.md) | [#341244](https://github.com/microsoft/vscode/issues/341244) | feature request | Spike 0 screenshots, 2026-10-12; traced by Surveyor 5.1 |
| [04 — a public way to open an editor in a sized floating window](04-public-api-for-auxiliary-window-open.md) | [#341245](https://github.com/microsoft/vscode/issues/341245) | feature request | the design brief, 2026-10-12 |
| [05 — the active group ignores window activation](05-active-group-ignores-window-activation.md) | not filed: the repro came back B (not reproduced) | bug | Cycle Window Size misses, 2026-10-13; traced by Surveyor 5.1 |

**Conventions for every draft**

- Source lines are at tag `1.141.0`, paths under `src/vs/`. Before filing,
  re-check them on the then-current tag; line numbers drift.
- Repro steps use only stock VS Code. None needs porthole installed.
- No local paths, account names or private-hive names: these files are public.
