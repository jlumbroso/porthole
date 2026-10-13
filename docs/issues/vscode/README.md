# Draft issues for microsoft/vscode

Problems porthole met in VS Code itself, written up to be filed upstream.
**None is filed yet.** Filing is public and is Jérémie's call; each draft says
what to check again on the current VS Code before it goes out.

| Draft | Kind | Found by |
| --- | --- | --- |
| [01 — Cmd+V does not paste into a page in a floating window](01-paste-disabled-in-auxiliary-windows.md) | bug | first real use, 2026-10-12; traced by Surveyor 5.1 |
| [02 — macOS Ctrl text-editing keys never reach a page](02-macos-ctrl-text-keys-swallowed.md) | bug | first real use, 2026-10-12; traced by Surveyor 5.1 |
| [03 — let compact floating windows hide the browser toolbar](03-hide-browser-toolbar-in-compact-windows.md) | feature request | Spike 0 screenshots, 2026-10-12; traced by Surveyor 5.1 |
| [04 — a public way to open an editor in a sized floating window](04-public-api-for-auxiliary-window-open.md) | feature request | the design brief, 2026-10-12 |

**Conventions for every draft**

- Source lines are at tag `1.141.0`, paths under `src/vs/`. Before filing,
  re-check them on the then-current tag; line numbers drift.
- Repro steps use only stock VS Code. None needs porthole installed.
- No local paths, account names or private-hive names: these files are public.
