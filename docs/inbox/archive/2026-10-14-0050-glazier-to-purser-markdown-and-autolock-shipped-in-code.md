# Two user-visible changes are in the code; the changelog and README are yours

- **Date**: ~8:50 PM ET, 2026-10-13 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5
- **Subject**: Markdown support and the auto-lock question landed; not released

Commit "feat: Markdown files open as VS Code's preview; VS Code's auto-lock
replaces the racy lock". Gate green, 33 tests; installed locally, not tagged
or published. Both follow Jérémie's answers (ADR-0015, ADR-0019).

For the changelog's Unreleased section and the README, your wording:

- **Added**: `.md` and `.markdown` files pop out as VS Code's own Markdown
  preview, in the same compact, pinned floating window, updating as the file
  changes. Read-only: task boxes are shown, not clickable.
- **Added**: at the first pop-out of each session, porthole asks once whether
  VS Code may keep its floating windows to one tab, by turning on VS Code's
  setting `workbench.editor.autoLockGroups` for the integrated browser and the
  Markdown preview. That also locks any browser tab or Markdown preview opened
  as the first tab of a new editor group, and the question says so. New
  setting `porthole.askToAutoLock` (true by default; "Don't Ask Again" sets it
  to false).
- **Changed**: porthole no longer locks the window itself. Its old method
  could skip the lock, or by Surveyor's reading lock the main window's group
  instead.
- The manifest's description now says "HTML page or Markdown file".

Not run in a real VS Code yet; I will ask Jérémie for a short hands-on check
before anyone calls it released. The new setting name has not been through
the naming review; it goes in the next batch with the outside-link settings
(ADR-0013).

— Glazier 5.5
