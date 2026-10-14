# Release plan: from "installed on one machine" to "public, listed, and right"

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13. **Status: executed.** 0.1.0 was published on 2026-10-13 and 0.2.0 on 2026-10-14; this plan is kept as the record of the first release, so tables below describe who was asked for what *then*
- **Scope**: the founding brief's items 3 (the listing) and 4 (the publishing mechanics).
  Items 1 and 2 are [`REPO-HYGIENE.md`](REPO-HYGIENE.md) and [`TERMINOLOGY-INDEX.md`](TERMINOLOGY-INDEX.md);
  the version floor is [`VERSION-FLOOR.md`](VERSION-FLOOR.md).
- **Rule that frames it** (corrected 2026-10-14): any seat publishes once a release is decided, using the tokens in `.env`; no new user-facing name ships without the naming review first. The earlier line here, "publishing, and anything touching a token, is Jérémie's act, by his hand", came from Glazier's founding brief and was never Jérémie's rule.
  Everything else is prepared so that act is one clear step.
- **Questions waiting on Jérémie** are in [ADR-0011](../adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md).

## What is already true (checked 2026-10-13)

| Fact | Basis |
| --- | --- |
| The Marketplace publisher `jlumbroso` exists (it publishes `jlumbroso.adrs4ai`); no new account is needed | Ran: public gallery query |
| The Open VSX namespace `jlumbroso` exists | Ran: `GET /api/jlumbroso` → 200 |
| The ID `jlumbroso.porthole` is free on the Marketplace | Ran: `vsce show` → "not found" |
| A different extension, `Lando-00.porthole-companion`, exists on the Marketplace; Open VSX has nothing named porthole | Ran: both registries' search |
| `vsce package` succeeds today: 7 files, 10.8 KB, 5 payload files | Ran |
| The GitHub repository `jlumbroso/porthole` is **private** | Ran: `gh repo view` |
| `vsce` ignores `"private": true`, but refuses to package a `.env` or detected secrets | Read: `vsce` 4.0.0 source |

## 3. The listing

| Piece | State | Owner | Needs |
| --- | --- | --- | --- |
| README (the page a stranger reads) | **Rewritten** 2026-10-13: honest about the internal command, what falls back, tested platform, known limits | Purser | Surveyor to check every factual claim; terms may change after the naming review |
| CHANGELOG | **Updated**: 0.1.0 entry now truthful; heading uses `-` | Purser | none |
| Description (Marketplace subtitle) | Exists (`package.json`): "Pop the HTML page you are looking at into a small floating window: only the rendered page, pinned above your other windows." | Glazier owns the file | Wording waits on the naming review |
| Terminology coherence | Index done; **sent for a naming review** | Purser | Review's answer, returned as a filepath by Jérémie |
| Manifest fields | **Missing**: `icon`, `keywords`, `bugs`, `homepage`, `galleryBanner`; `"private": true` is misleading; possibly `capabilities` for virtual/untrusted workspaces (the README says remote and virtual are out of scope, but nothing declares it) | Glazier (code) | A brief from Purser (below) |
| Icon | **None** | Jérémie decides who draws it | `QST-ICON` |
| Screenshots | 24 exist; none fit the listing as is | Jérémie takes them; Purser writes the shot list | `QST-SHOTS` |
| Honest-risk statement | In the README; to be repeated in the first lines of the listing description | Purser | none |
| Support path | `bugs` field to the issue tracker; an issue template asking for VS Code version, OS, and the "Porthole" output channel | Purser | repository must be public |

### The shot list (if `QST-SHOTS` is A)

Taken from the **installed** extension, not the Extension Development Host, with the page file
at a neutral path such as `/Users/Shared/porthole-demo/tasks.html` so the page's own URL bar
does not show a home directory. Hide other windows. Four images, in this order:

1. **The result**: a small floating page window beside a code editor (the promise in one image).
2. **The gesture**: the Explorer right-click with **Pop Out to Mini Window** highlighted (existing screenshot #24 is
   already close; a retake removes the dev-host title and the status-bar clutter).
3. **The page is live**: the same window after ticking a box (before/after, or a short recording).
4. **The controls**: the command palette filtered to "Porthole".

Optional: a 5–8 second recording of the whole gesture; the README can embed a GIF. Final
files go in `docs/images/` with plain ASCII names (the originals' names contain a narrow
no-break space and break URLs), referenced by absolute `https://` paths or by relative paths
once the repository is public.

## 4. The publishing mechanics

Follows Lintel's playbook (`.claude/skills/extension-marketplace-publishing`), with the
feedback condition honoured in [`docs/MARKETPLACE-SKILL-FEEDBACK.md`](../MARKETPLACE-SKILL-FEEDBACK.md).

### Order of events

1. Jérémie answers the questions in ADR-0011.
2. Glazier lands the manifest changes and any setting rename from the naming review; gate green.
3. Purser finishes README, listing copy and changelog; Surveyor checks the claims.
4. Surveyor or Glazier re-runs Spike 0 on the VS Code version in use at release time
   (a commitment of ADR-0009: "every VS Code update is a release question").
5. Purser builds `just publish-check` (see below) and runs it.
6. **Jérémie makes the repository public** (relative links in the README depend on it).
7. **Jérémie publishes** to both registries with his token. This is the only step that touches a credential.
8. Purser verifies each registry **separately** (`vsce show`, the Open VSX API), and Jérémie
   installs from the listing into a clean profile and pops a page out. Search indexing lags
   (hours on the Marketplace); a missing search result is not a failed publish.
9. A second feedback note to Lintel: what the real run showed.

### `just publish-check` (to build, Purser; recipe at the bottom of the `justfile`, "ours")

One command that prints green or red for each fact the playbook states:

- the repository is public; `.env` is gitignored; no `.env` exists in the working tree outside `.gitignore`'s reach;
- `vsce ls` equals the five-file allowlist (the gate already does this; here it is repeated against the *release* build);
- `CHANGELOG.md` has a heading for the `package.json` version;
- the icon is a PNG; `engines.vscode` is compatible with `@types/vscode`;
- the ID is free, or, if published, the version is new;
- the working tree is clean and the commit is tagged.

It stops short of publishing. `just publish` is a separate recipe that reads the token from
the environment and runs the two commands; it is Jérémie's to run, and it is written, but
nobody else runs it.

### Credentials (Jérémie's, by hand)

Not prepared by me beyond the walkthrough: mint a dated, Marketplace-scoped token
(`porthole-2026-10`) and an Open VSX token; each goes into a gitignored `.env` or a file
outside the repository, typed in a plain editor and **never in a chat, an ADR answer box or
any file the repo might commit**. Lintel's playbook §IV is the rule; our `.gitignore` now
lists `.env`. Whether the existing publisher token may be reused is one of the questions to
Lintel.

## What I need, by whom

| From | What | Why |
| --- | --- | --- |
| **Jérémie** | Answers to `QST-HYGIENE-CUT`, `QST-DRAFTS-TRACKING`, `QST-ENGINES-FLOOR`, `QST-NAME-FINAL`, `QST-SHOTS`, `QST-ICON` | Each blocks a piece above |
| **Jérémie** | The screenshots (if `QST-SHOTS` is A), the icon decision, the repository going public, the tokens | His choices and his accounts. **The publish itself is not in this row** (corrected 2026-10-14): any seat runs it once a release is decided |
| **Glazier** | Manifest changes (a brief from Purser); the setting rename if the naming review asks; `engines.vscode` if `QST-ENGINES-FLOOR` changes it; consent to the `justfile` recipes | The code is theirs |
| **Surveyor** | Check [`VERSION-FLOOR.md`](VERSION-FLOOR.md) and the README's claims; re-run Spike 0 at release time | Independent verification (a brief from Purser) |
| **Lintel** | Answers to: may one PAT serve several extensions of the same publisher? is the Open VSX publisher agreement required before first publish? can I read the `release.yml` that enforces the changelog heading? | Items 2.7, 2.10 and 2.4 of the feedback |
| **The naming review** | The term decisions (index §9) and a collision read on the name | Sent; response awaited |
