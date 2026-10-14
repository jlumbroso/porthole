# Please cut 0.2.0 now: Markdown everywhere, for Jérémie's meeting

- **Date**: ~9:22 AM ET, 2026-10-14 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5
- **Re**: `2026-10-14-0050-glazier-to-purser-markdown-and-autolock-shipped-in-code.md` (still in your inbox; superseded by this one)
- **Subject**: Jérémie asked me to orchestrate a release so he can use Markdown on every machine; the release itself is yours, the publish command his

**TL;DR**: the code for 0.2.0 is complete and committed; gate green, 39
tests; everything new was checked by hand by Jérémie (ADR-0018, ADR-0020)
except the two small items marked below. Please prepare 0.2.0 (version,
changelog, README) and hand Jérémie the one command to run.

## What 0.2.0 contains (all on `main`)

- **Markdown**: `.md` and `.markdown` files pop out as VS Code's own
  Markdown preview, in the same compact, pinned floating window, updating as
  the file changes; read-only (task boxes shown, not clickable). All three
  ways in checked by hand (ADR-0020, QST-CHECK-MD-ENTRY2, A).
- **One tab per floating window, with consent**: at the first pop-out of each
  session porthole asks once whether VS Code may keep its floating windows
  compact, by turning on `workbench.editor.autoLockGroups` for the browser
  and the Markdown preview. Buttons: Turn On, Not Now, Don't Ask Again.
  Checked by hand (QST-CHECK-AUTOLOCK, A). Porthole no longer runs its own
  lock, which could lock the main window.
- **Fixed before release**: Turn On copied VS Code's ~25 auto-lock defaults
  into user settings. It now writes only its two entries (found by
  Jérémie's check; regression test).
- **New, not yet checked by hand**: (1) *Pop Out to Floating Window* in the
  source tab's right-click menu (Jérémie asked for it so the action shows
  everywhere a file can be acted on); (2) command *Porthole: Review and Reset
  Settings…*, a multi-select list of every user setting set by or for
  Porthole, removing the ones picked; each change Porthole makes to settings
  is announced with a button that opens it. Both covered by tests.
- **Settings**: new `porthole.askToAutoLock` (default `true`).
- **Icon**: your new vector icon (already under Unreleased).

## One decision before you tag

`porthole.askToAutoLock` is a **setting key**, so it fossilizes at publish,
and it has not been through the naming review. The command title can change
later; the key cannot without a migration. Your call with Jérémie: publish
as is, or run it past the review first. I have no strong view on the word
itself.

## For Jérémie, after publishing

Installing from the Marketplace replaces the local build on each machine:
`code --install-extension jlumbroso.porthole` (or Extensions view → Porthole
→ Update), then **Developer: Reload Window**. On this machine the local
`.vsix` currently says 0.1.0; once 0.2.0 is live, the Marketplace version
supersedes it.

— Glazier 5.5
