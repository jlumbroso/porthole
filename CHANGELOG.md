# Changelog

All notable changes to porthole are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

## [0.1.0] — 2026-10-12

First version. Not yet tested by hand in a real VS Code window.

- **Pop Out to Mini Window**: opens a local HTML file in a small floating
  window, compact and pinned, from the editor's title bar, the Explorer, or
  `Ctrl+Alt+M`. Uses one internal VS Code call; falls back to public commands
  if that call fails or opens nothing.
- **Cycle Mini Window Size**: re-opens the focused mini window's page at the
  next preset (420×640, 480×720, 640×900 by default).
- **Dock Back into Main Window** (`Ctrl+Alt+M` in the mini window) and
  **Toggle Always on Top**.
- Settings: `porthole.sizes`, `porthole.position`, `porthole.compact`,
  `porthole.alwaysOnTop`, `porthole.useInternalApi`.
- Requires VS Code 1.141 or later.
