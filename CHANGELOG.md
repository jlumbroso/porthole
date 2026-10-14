# Changelog

All notable changes to porthole are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

## [0.2.1] - 2026-10-14

- **Light or dark Markdown in floating windows.** New setting `porthole.markdown.colorScheme`:
  `auto` (follow VS Code's theme, the default), `light` or `dark`. It recolors only Markdown
  shown in porthole's floating windows; previews of other files keep following VS Code's theme
  (a docked preview of the same file takes the same colors while it is popped out). Code blocks
  keep VS Code's syntax colors. Named through the naming review (ADR-0022).

## [0.2.0] - 2026-10-14

Markdown, one tab per window, and a new icon. Everything below was checked by hand on macOS
with VS Code 1.141.0 (ADR-0018 and ADR-0020).

- **Markdown files pop out too.** `.md` and `.markdown` files open as VS Code's own
  Markdown preview in the same compact, pinned floating window, and update as the file
  changes. The preview is read-only: task-list boxes are shown, not clickable. Works from
  the shortcut, the editor's title bar and the Explorer's right-click menu.
- **One tab per floating window, with your consent.** At the first pop-out of each session
  porthole asks once whether VS Code may keep floating windows to one tab (it turns on
  `workbench.editor.autoLockGroups` for the integrated browser and the Markdown preview;
  buttons Keep Compact, Not Now, Don't Ask Again). It no longer runs its own lock, which could
  lock the main window. New setting `porthole.askToKeepCompact` (default `true`).
- **Fixed before release:** the affirming button (then "Turn On") copied about 25 of VS Code's default auto-lock entries
  into your user settings; it now writes only its two.
- **Also new:** *Pop Out to Floating Window* in a source tab's right-click menu, and the command *Porthole: Review and Reset Settings…*, a
  multi-select list of every user setting set by or for porthole; each change porthole makes
  to settings is now announced with a button that opens it.
- **New icon:** a teal double ring with eight bolts around a page, drawn as a vector with
  heavier strokes so it stays legible in the extension list, and transparent so it reads on
  light and dark themes.
- Requirements and limits are as in 0.1.0 (VS Code 1.134.0 or later; macOS only so far).

## [0.1.0] - 2026-10-12

First version. Tested by hand on macOS with VS Code 1.141.0 (15 pop-outs, no fallback
needed) and used on 1.134.0; Windows and Linux are untested.

- **Pop Out to Floating Window**: opens a local HTML file in a floating
  window, compact and pinned, from the editor's title bar, the Explorer, or
  `Ctrl+Alt+M`. Uses one internal VS Code call; falls back to public commands
  if that call fails or opens nothing.
- **Cycle Window Size**: re-opens the focused floating window's page at the
  next preset (420×640, 480×720, 640×900 by default).
- **Dock Back into Main Window** (`Ctrl+Alt+M` in the floating window) and
  **Toggle Always on Top**.
- Settings: `porthole.sizes`, `porthole.position`, `porthole.compact`,
  `porthole.alwaysOnTop`, `porthole.useInternalCommand`.
- Requires VS Code 1.134.0 or later (used on 1.134.0 and 1.141.0; the latest release is the one
  officially supported). Relies on an internal VS Code command; if a VS Code
  update changes it, the window still opens, compact and pinned, but at VS Code's own
  default size. Known limits: Cmd+V does not paste into a page in the window on macOS (right-click →
  Paste works); Ctrl+A and Ctrl+E do nothing in a page's text field.

[Unreleased]: https://github.com/jlumbroso/porthole/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/jlumbroso/porthole/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jlumbroso/porthole/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jlumbroso/porthole/releases/tag/v0.1.0
