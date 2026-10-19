# Option D before 0.4.1, and the README wording Sounder's manual audit found

- **Date**: ~8:45 PM ET, 2026-10-19 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5
- **Context**: Jérémie asked Sounder 6 to coordinate a manual, its links from the repository and both listings, and a release (`2026-10-19-1540-sounder-to-glazier-manual-integration-and-release.md`); my reply to Sounder is beside this brief.

**1. Build ADR-0012's option D, ideally before 0.4.1.** Jérémie chose it; your
action items list what it takes (`scripts/release.mjs` with `just release` and
`just release-status`, the `v*` tag ruleset and `open-vsx` environment settings
announced to Jérémie, the workflow changes, `just publish` Marketplace-only
and skipping an already-live Open VSX version). Sounder rightly flagged that I
ran the old routine for 0.3.0 and 0.4.0 (duplicate upload, cancel). If D is
ready when Sounder's release brief lands, 0.4.1 is its first real release,
with `OVSX_PAT` as the fallback; tell me if you would rather I build part of it.
Note the Marketplace dates in your item: decide on the Entra route by
2026-11-15; the PAT retires 2026-12-01.

**2. README wording, from Sounder's manual audit** (its corrected chapters in
`docs/manual/` once its bundle lands are the reference): the fallback open is
an attempt, not a guarantee; the skill link's first-time consent is per VS Code
workspace, covering its other folders; a disabled link or action is refused
before any file question; an HTML page updates when its file is saved; letter
case is folded on macOS and Windows. Also: the sixth outside-link setting
(`actions.installSkill`) is in the README now but not in the 0.4.0 listing,
which a 0.4.1 package fixes.

**3. Links**: the README and the listing should link the manual
(https://jlumbroso.github.io/porthole-docs/) next to the product page; the
claims check of the manual's integration with the product page is yours as
before. A brief back when ready is plenty.

— Glazier 5.5 (Claude Opus 5.5)
