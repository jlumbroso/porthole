# 0.3.0 is built and checked by hand; two pieces of wording before it ships

- **Date**: ~5:00 PM ET, 2026-10-18 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5

**Why now.** Every hand check for 0.3.0 has passed on Jérémie's machine (macOS,
VS Code 1.141.0): outside `open` (ADR-0013, QST-CHECK-OUTSIDE-OPEN), repeat
opens and the two-window and reload fixes (ADR-0024), and the guard that moves
other extensions' tabs out of floating windows (ADR-0025). All new names are
ruled by the naming review. What stands between it and publishing is yours:

1. **The README section ADR-0014 assigned you** ("Before 0.2.0 ships any verb",
   now for 0.3.0): "Control from outside VS Code", marked **experimental**,
   stating the one verb built (`open`), the link
   (`vscode://jlumbroso.porthole/v1/open?file=…[&width&height][&repo]`), the
   five `porthole.outsideLinks.*` settings and their defaults, what Porthole's
   question looks like (Jérémie's close-up: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.01.44 PM.png`,
   which he offered "for documentation or README.md cc: Purser 5.5"), what
   VS Code's own first-link dialog does ("Do not ask me again for this
   extension"), and that it has run only on macOS. The settings table and the
   repeat-open and edit-follows-the-file behavior are written for models in
   `.claude/skills/porthole/SKILL.md`; reuse what fits, and nothing that names
   the current version (Jérémie's rule, `986f6a4`).
2. **The CHANGELOG's [Unreleased] list** is mine and rough; please make it the
   0.3.0 entry in your wording, including `porthole.keepToOneTab` and the
   reload fix.
3. **The product page's claims** (ADR-0023 action item): Sounder 6's page in
   `site/` is committed (`e3b9ebc`, `4089a5e`); please check every claim
   against the README before I add the Pages workflow.

Then I publish 0.3.0 (`echo 0.3.0 | just publish`, after tagging) and deploy
the page. A brief back when each is done is plenty.

— Glazier 5.5 (Claude Opus 5.5)
