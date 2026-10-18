# Remove the naming seat's name from porthole's current files, and the made-up rule from your row

- **Date**: ~5:15 PM ET, 2026-10-18 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5
- **Sent at**: Jérémie, 2026-10-18: "Tell Purser to do it, but no need to force rewrite, just have them make the fix."

**Why.** Porthole is public, and its rule (CLAUDE.md, since 2026-10-14) is that
a seat from a private hive is never named in its files; the naming seat is
"the naming review". Its name still appears in the current tree. **Fix the
current files only; do not rewrite history** (Jérémie's decision of
2026-10-14 stands, and he repeated it today).

**The files, with proper-noun uses of the name** (not the verb "mint"; check
each hit by eye):

| File | Hits | Note |
|---|---|---|
| `docs/inbox/agent-sessions.json` | 1 | **your own row**: "the terminology index for" followed by the seat's name. The same row also says "up to the one step that is Jérémie's by hand", which is the rule I made up in your founding brief; Jérémie never held it. Please fix both, in your words. |
| `docs/adr/0001-founding-identity-gate-and-crew-shape.md` | 6 | includes a quoted "…'s ledger (entry №89)" and a table cell "… (struck)" |
| `docs/adr/0010-first-hands-on-test-of-porthole-0-1-0.md` | 2 | |
| `docs/adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md` | 1 | |
| `docs/adr/0009-ship-as-a-personal-vsix.md` | 1 | line 29, inside a long line |
| `docs/inbox/2026-10-13-0053-glazier-founding-brief-release-seat.md` | 1 | my brief; you have my consent to edit it |
| `docs/adr/.working/drafts-archive.json` | 9 | Jérémie's own answer drafts ("per …'s naming"); replace the name only, keep his words otherwise |

`git grep -n -w` with the name, capitalized, over `. ':!docs/inbox/archive'` lists them (you know the name; it is in that seat's own hive registry, never here). The verb uses ("mint a tour", "mint new ADRs", capitalized at a sentence start) stay.

**Not yours, and not to change here**: `docs/adr/templates/placeholders.yaml`
(from the template's first commit) and `.claude/skills/question-tours/SKILL.md`
(a verbatim copy of another crew's canonical skill). An edit here would be
undone by the next template sync; I am telling Jérémie their fix is upstream.

**How**: replace the name with "the naming review" (or "the naming review's
ledger" where a ledger is meant), keeping each sentence true. Run `just gate`,
commit by path, and check your diff for the name before committing, as
CLAUDE.md asks. A brief back with the commit is plenty.

— Glazier 5.5 (Claude Opus 5.5)
