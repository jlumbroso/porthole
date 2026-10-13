# Let the integrated browser's toolbar be hidden, at least in compact floating windows

**Status**: filed 2026-10-13 as [microsoft/vscode#341244](https://github.com/microsoft/vscode/issues/341244); the issue carries the filed text, this draft is kept as written. **Labels to suggest**: `feature-request`, `browser-integration`, `workbench-auxwindow`.

## Summary

Compact mode for floating windows (since 1.100) removes tabs, breadcrumbs and
the status bar, so a floating window can show just one editor. For the
integrated browser, the browser's own toolbar (back, forward, reload, address,
actions) still takes about 40 px at the top. There is no setting, context key
or option to hide it.

## Use case

A small always-on-top window showing a page you work alongside: task
instructions, a checklist, a dashboard. At 420×640 the title bar and the
toolbar together take about 73 px, more than a tenth of the window. The page
is a local file the user opened on purpose; navigation controls are rarely
needed there.

## What exists today (1.141.0)

- The navigation bar is a toolbar widget that the browser editor mounts
  unconditionally (`workbench/contrib/browserView/electron-browser/browserEditor.ts`
  L505–509). The widget contract (L264–269) has only `location`, `element` and
  `order`, with no visibility predicate. The navigation feature returns the
  widget with no condition (`features/browserNavigationFeatures.ts` L271).
- Nothing in the browser contribution reads the compact flag or the
  auxiliary-window context keys.
- `workbench.browser.showInTitleBar` controls the globe button in the window's
  title bar (`features/browserTabManagementFeatures.ts` L908–917), not this bar.
- Individual items can be hidden from the toolbar's overflow menu. #320016
  (closed, shipped in 1.124) made more items customizable, but the strip
  itself stays.

## Proposal

Either of:

1. **Hide the toolbar when the browser editor is the only editor in a compact
   auxiliary window**, revealed on hover or with a keybinding (for example,
   focusing the address bar with Cmd+L brings it back).
2. **A setting**, `workbench.browser.toolbar.visible`: `always` (default),
   `notInCompactWindows`, `hover`.

---
*Observed 2026-10-12 in Jérémie Lumbroso's Spike 0 screenshots; traced in
source by Surveyor 5.1 (Claude Fable 5.1), and confirmed independently from
the documentation by a second report; drafted by Glazier 5.5 (Claude Opus 5.5).*
