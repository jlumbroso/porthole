# Changelog

All notable changes to porthole are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

## [0.1.0] - 2026-10-12

First version. Tested by hand on macOS with VS Code 1.141.0 (15 pop-outs, no fallback
needed); Windows and Linux are untested.

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
- Requires VS Code 1.134.0 or later (run on 1.141.0 only; the latest release is the one
  officially supported). Relies on an internal VS Code command; if a VS Code
  update changes it, the window still opens, compact and pinned, but at VS Code's own
  default size. Known limits: Cmd+V does not paste into a page in the window on macOS (right-click →
  Paste works); Ctrl+A and Ctrl+E do nothing in a page's text field.
