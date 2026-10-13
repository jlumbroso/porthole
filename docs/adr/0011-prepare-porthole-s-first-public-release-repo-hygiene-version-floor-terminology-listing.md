<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Prepare porthole's first public release: repo hygiene, version floor, terminology, listing

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human), Purser 5.5 (Claude Sonnet 5.5)

**TL;DR**: The repo is clean of secrets and its history stays whole; the real floor for the primary path is VS Code 1.134.0 (read in source, never run below 1.141.0); the README, changelog and release documents are written; six questions below decide the last cuts, the engines field, the name, the screenshots and the icon before anything is published.

---

## Originating Context

**Source**: `docs/inbox/2026-10-13-0053-glazier-founding-brief-release-seat.md` (the release seat's founding brief), [ADR-0009](0009-ship-as-a-personal-vsix.md) (publish to the Marketplace and Open VSX, decided 2026-10-12), and Jérémie's rulings to Purser 5.5 on 2026-10-13, summarised here because they change the brief:

1. **Keep the whole record.** The process of making this software is itself an exhibit. Local paths are acceptable; **no history rewrite**; completeness outranks tidiness for briefs and other deliberation. Going forward, a notice in `CLAUDE.md`: a seat from a private hive writes in its hive of origin. Deleting files is only for what is superfluous (a placeholder, a template leftover, a build or temporary file), and the repo should be exemplar and clean.
2. **ADRs are authoritative and most recent**, so the README must follow them (it said porthole would not go on the Marketplace).
3. **The floor is probably 1.134.0**; confirm it, and explain precisely and with its epistemic status what porthole depends on that requires that version.
4. **Publishing has not ramped up yet.** Lintel's draft release playbook is installed; its condition of use is written feedback for Lintel.
5. The terminology pass goes to a naming review.

**What was done in response** (documents in `docs/release/` unless noted):

| Piece | Where |
| --- | --- |
| Cleanliness pass, scans, candidate list | [`REPO-HYGIENE.md`](../release/REPO-HYGIENE.md), [`SCREENSHOT-CATALOG.md`](../release/SCREENSHOT-CATALOG.md) |
| Version floor, with evidence tiers | [`VERSION-FLOOR.md`](../release/VERSION-FLOOR.md), script `scripts/ephemeral/2026-10-13-version-floor-check.sh` |
| Terminology index | [`TERMINOLOGY-INDEX.md`](../release/TERMINOLOGY-INDEX.md) |
| Plan for the listing and the publishing mechanics | [`RELEASE-PLAN.md`](../release/RELEASE-PLAN.md) |
| Feedback for Lintel | [`docs/MARKETPLACE-SKILL-FEEDBACK.md`](../MARKETPLACE-SKILL-FEEDBACK.md) |
| README rewritten, changelog updated, `.env` ignored, `CLAUDE.md` notice | the repo root |

**Agency Grant**: the founding brief: propose, do not delete; what leaves the record is Jérémie's call, through a question he can answer in place.

---

## Explicitation

**What I understand**:

1. **The privacy pass became a cleanliness pass.** No secret, token or private message was found in any tracked file or in the history (shapes scanned: provider token prefixes, `VSCE_PAT`/`OVSX_PAT`, "password", "secret", every opaque string of 32+ characters). What remains is clutter: byte-identical backups, a generated file, two template leftovers that the template itself still maintains.
2. **The version floor is two numbers.** 1.134.0 is where the source says porthole *could* work (the first release that registers the integrated browser for local `.html`); 1.141.0 is where it has been *run*. `engines.vscode` is `^1.141.0` today.
3. **The name is permanent once published.** `jlumbroso.porthole` is free on the Marketplace, but a different extension, `Lando-00.porthole-companion`, already uses the word, and the README used to call the name provisional.
4. **The listing needs images and an icon that do not exist yet.** None of the 24 screenshots fits as is: almost all show `[Extension Development Host]` in the title bar, and 13 show `/Users/jlumbroso/…` inside the page window itself.

**Assumptions**:

- Jérémie's phrase "the local paths are okay" covers the 13 screenshots in the record, but may not extend to images *chosen for a public listing*. `QST-SHOTS` asks.
- Nothing is published until Jérémie says so; every question here is answerable without any registry access.

**Confirm**: Jérémie, by answering the six questions; Surveyor, for the version-floor document and the README's factual claims (a brief is sent).

---

## Questions

### QST-HYGIENE-CUT: Which files that add nothing should leave the repo's current files? (history stays)
- Status: answered
- Why asking: Before porthole goes public, the repo should be exemplar and clean, but you ruled that nothing recorded may be lost and history is not rewritten. A scan found four kinds of file that add nothing a reader needs: (1) two **byte-identical backup copies** the ADR extension writes on every save (`docs/adr/.working/drafts-archive.json.bak`, `docs/adr/.working/drafts.json.bak`; checked with `cmp`); (2) `.vscode/terminals.json`, **generated** by `just refresh-terminals`, whose own header says do not hand-edit and regenerate before use, and which shows as modified in `git status` whenever a seat opens; (3) `.vscode/vscode-optimization-guide.md`, a generic 319-line guide dated 2026-01-04 that never mentions porthole; (4) `scripts/unwrap-adrs/`, optional ADR-line-unwrapping tools used by nothing here. Items (3) and (4) were **kept on purpose at adoption** (`docs/TEMPLATE-FEEDBACK.md` L172: "method and tooling, not content") and are `stencil` rows in `kintsugi.yaml`, so removing them also needs a `kintsugi.yaml` entry recording the removal.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — duplicates and generated only**: stop tracking and add to `.gitignore`: both `.bak` files and `.vscode/terminals.json`. Nothing authored is lost; the template's stencils stay.
- **B — A, plus the two template leftovers**: also remove `.vscode/vscode-optimization-guide.md` and `scripts/unwrap-adrs/`, recording both in `kintsugi.yaml` as deliberate removals (the file already does this for `README.md`, `CHANGELOG.md`, `QUICK-START.md`). The repo then contains only what porthole uses or exhibits.
- **C — change nothing**: everything stays; the clutter is part of the exhibit. Choose this if you read the template's files as part of the process record.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — duplicates and generated only.** *Rationale*: items (1) and (2) are mechanically redundant or regenerable, so removing them loses nothing (`cmp` shows the `.bak` pair identical to the originals; the terminals file regenerates). Items (3) and (4) were consciously kept by the adoption and are tracked by `kintsugi.lock`; removing them is a taste decision with a kintsugi bookkeeping cost, not a hygiene necessity. *Confidence*: 0.7 — because I have verified (1) and (2) directly but judge (3) and (4) only by their content, and I do not know whether the template's maintainers want downstream repos to carry them. *If wrong*: if you would rather the public repo contain only what porthole uses or exhibits, this flips to B.

**ANS:** (by Jérémie Lumbroso)
Option B, but keep `.vscode/terminals.json`. I get the point that this should be not public eventually, but for now it would be a bit of a inconvenience to constantly regenerate, but the rest are good ideas, and yes, feel free to add entries to `.gitignore`. I am all for removing the `.vscode/vscode-optimization-guide.md` guide: Let's look at it, and see if anything applies to us, then ditch it. Surveyor has already configured the Vitest tests in the VSCode testing sidebar.

---

### QST-DRAFTS-TRACKING: Should the ADR extension's autosaved answer drafts stay tracked in git?
- Status: answered
- Why asking: The ADR extension autosaves what you type in an answer box into `docs/adr/.working/` (the live `drafts.json`, plus `drafts-archive.json`, 73 KB holding 13 superseded drafts of your answers). All of it is tracked, and it is rewritten whenever the box changes, so it is always "modified" in `git status`. Lintel's incident (vscode-adrs-for-ai ADR-0045) came from exactly this: an access token typed into an answer draft was autosaved into a **tracked** `.working/` file and was exposed when that repo briefly went public. I scanned all porthole's tracked files, these included, for token shapes and long opaque strings and found nothing; but a scan for shapes cannot prove absence, and you will soon be guided through minting registry tokens near these very boxes. You also want the repo to contain all deliberations, and the archive records how some answers were reached.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — keep tracking all, and add a scan to the gate**: nothing changes in git; `just gate` gains a check that fails if any tracked `.working/` file contains a token-shaped string. The record stays complete; the vector stays open but is watched.
- **B — track the archive, ignore the live drafts**: `drafts-archive.json` (superseded drafts, the deliberation path) stays tracked; `drafts.json` and the backups are ignored. The in-progress text you are typing right now is never committed by accident; the archive still gets any draft that was later filed or superseded.
- **C — ignore the whole `.working/` directory**: nothing in it is tracked from now on. The filed answers are in the ADRs; the draft trail stays only in past commits. The vector is closed and `git status` is quiet.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**B — track the archive, ignore the live drafts.** *Rationale*: the live draft is by definition unfinished text and is exactly where an in-progress secret would sit (Lintel's incident; `docs/MARKETPLACE-SKILL-FEEDBACK.md` §2.8), while the archive is the trail of drafts that were superseded, which fits your rule that deliberations are kept. B costs one `.gitignore` edit. It does not fully close the vector, since a secret typed in a draft that is later archived would still land in the tracked archive, which is why the scan from A is worth adding either way. *Confidence*: 0.65 — because I know the incident and the files' contents today, but not how often drafts get archived with unfinished text, and Lintel may have a better rule. *If wrong*: if you expect to type anything sensitive into an answer box while publishing, this flips to C; if you want unfiled drafts visible to the crew as they are written, to A.

**ANS:** (by Jérémie Lumbroso)
Option A, with some exceptions: Let's ignore `errors.jsonl` (which is used to report problems with the VSCode _ADRs for AI_ Manager which are collected here by the crew working on it), and let's ignore the `*.bak` files as redundant, but useful locally. I made a feature request with the VSCode _ADRs for AI_ Manager team, to create an efficient, and basic, "token redaction" heuristics in the drafts saved, based on the tokens we've encountered that other programmers are likely to encounter, and which we can update. That way, the drafts cache is not a vector for tokens to be leaked. (Tokens that are sensitive shouldn't be drafts or answers to ADRs/seeds.)

For the epistemic justification, beyond my eccentricity: In the same way as there is value as watching a model's thinking trace before the answer comes out, there is value to see the answers coalesce, be corrected, slow down, etc.. It is not a lot of data, it is in a dot folder which is invisible to users. This repository is one of the first few that we are building in public using this methodology, so, showing people how we think is part of the project.

---

### QST-ENGINES-FLOOR: Which VS Code versions should the package claim to support?
- Status: answered
- Why asking: `package.json` says `engines.vscode: ^1.141.0`, the version porthole has been **run** on (Spike 0, five of five, and 15 pop-outs in the hands-on test). Reading VS Code's source at six release tags shows the primary path could start working at **1.134.0**, the first release whose integrated browser is registered for local `.html`; 1.131.0 to 1.133.0 and 1.130.0 do not have it. The identifiers porthole calls exist unchanged from 1.130.0, so the HTML registration is the only thing that sets the floor. What is **not** known: nothing below 1.141.0 has been run, 1.135 to 1.140 were not read, and the browser editor changed by about 2,350 added and 790 removed lines between 1.134.0 and 1.141.0. The Marketplace blocks installs on versions below `engines`, and the field cannot be loosened later without a release. Evidence: [`VERSION-FLOOR.md`](../release/VERSION-FLOOR.md).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — keep `^1.141.0`**: claim only what has been run. Users of 1.134.0 to 1.140.x cannot install it; everyone else can. The listing says "tested on VS Code 1.141.0".
- **B — `^1.134.0` now**: the claim matches the source. Users of 1.134 to 1.140 can install it and are running something nobody has run, so a bug report from them may be impossible to reproduce without installing their version.
- **C — run Spike 0 on 1.134.0 first, then `^1.134.0`**: you install VS Code 1.134.0 alongside, run the spike once (about 15 minutes of your attention), and the listing says "tested on 1.134.0 and 1.141.0".

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — keep `^1.141.0` for 0.1.0.** *Rationale*: VS Code updates itself for most people, so the population on 1.134 to 1.140 is small and shrinking, while the cost of a wrong claim is reports nobody can reproduce, and the floor can be lowered later (never raised without breaking installs) after a real test. *Confidence*: 0.8 — because the argument rests on update behavior I have not measured, but the asymmetry (lowering is free later, raising is not) does not depend on it. *If wrong*: if users on older versions ask for support, or you want reach more than caution, this flips to C and then B.

**ANS:** (by Jérémie Lumbroso)
Option B, now, and deploy, with a caveat, we can officially support the latest version. The first response to a bug report should be: "Can you update to the latest version?" The second caveat is that you must change the version number first, as I get error messages that the extension is not supported in the VSCode 1.134.0 that I downloaded for macOS Apple Silicon. I will test and report back.

---

### QST-NAME-FINAL: Is the name "Porthole" (ID `jlumbroso.porthole`) final, before an ID that can never change is created?
- Status: answered
- Why asking: The first publish makes the extension ID permanent: renaming later means unpublishing and republishing under a new ID, and installs, reviews and update paths do not migrate (Lintel's playbook §V.5). The README used to call the name "provisional and can still change"; I removed that sentence from the public README but nobody has said the name is final. `jlumbroso.porthole` is free on the Marketplace (`vsce show` returned "not found"), and Open VSX has nothing named porthole, but a different Marketplace extension, `Lando-00.porthole-companion` ("porthole companion", a Copilot CLI companion), already uses the word, so searches for "porthole" will show both. The terminology pass is already going to a naming review.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — final; publish as "Porthole"**: no further step; the collision with the other extension is accepted.
- **B — ask the naming review for a collision read first**: the review that is already looking at porthole's terms is also asked whether the name survives a scan against the neighbour above. Costs waiting for that answer, which is already being awaited.
- **C — rename now**, before anything exists on a registry. Cheapest it will ever be; but it touches the extension ID, the `porthole.*` command and setting names, the repo name and the docs.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**B — ask for a collision read first.** *Rationale*: the ID is the one irreversible decision in publishing, B adds no work beyond a paragraph in a brief that is already being written, and the answer arrives with the terminology answer. The neighbour is not a collision of IDs, only of a word, so I do not expect it to force a rename. *Confidence*: 0.75 — because the cost is near zero, but I have not read the other extension and cannot judge from the name alone whether Marketplace moderation would object. *If wrong*: if you are already settled on the name, the wait is wasted and this is A; if the review finds the neighbour confusing, C.

**ANS:** (by Jérémie Lumbroso)
Yes, Option B as part of the entire naming review.

---

### QST-SHOTS: Which screenshots should the listing use?
- Status: answered
- Why asking: The listing page needs two to four images showing the product, and a stranger reads them first. The 24 screenshots from the Spike 0 and hands-on tests are the record behind ADR-0003 and ADR-0010, and they stay in the repo. Reviewed one by one ([`SCREENSHOT-CATALOG.md`](../release/SCREENSHOT-CATALOG.md)), the useful ones all share three problems: the title bar reads `[Extension Development Host]` (confusing to a user); the macOS menu bar, clock and your main VS Code window (ADR text, git-blame lines, a time tracker) show behind the floating window in 17 full-desktop captures; and in 13 of the 24 a `/Users/jlumbroso/…` path is inside the page window's own toolbar, so cropping to the window does not remove it. The best existing candidates are #24 (the Explorer menu entry, cleanest), #16/#17 (a small floating page above code) and #22 (code beside the page).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — retake from the installed extension**: four images (the result beside code, the right-click entry, the page live after a tick, the command palette), taken with the page at a neutral path such as `/Users/Shared/porthole-demo/tasks.html`, nothing else on screen. About 10 minutes of your time; Purser supplies the shot list and prepares the files.
- **B — crop the existing ones**: use #24, #16/#17 and #22 cropped to the window. No retake. The dev-host title and the `/Users/jlumbroso` fragment in the page's address bar remain, as does the "18 hrs" tracker in some.
- **C — no images for 0.1.0**: text-only listing; add screenshots in a later patch release.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — retake from the installed extension.** *Rationale*: the catalog shows that cropping cannot remove the home-directory path (it is inside the window being shown) or the dev-host label, and a retake also verifies the installed build end to end, which the release needs anyway. *Confidence*: 0.8 — because the 13-of-24 count comes from a model's reading of the images, but even if half were wrong, the dev-host title alone justifies a retake. *If wrong*: if you do not mind your username or the dev-host label on a public page, this flips to B, which is 20 minutes cheaper.

**ANS:** (by Jérémie Lumbroso)
Option B for now, and I'm happy to crop. Option A, later, if you give me specific scenarios to stage.

---

### QST-ICON: Who makes the extension's icon?
- Status: answered
- Why asking: The Marketplace and Open VSX list every extension with an icon, and `package.json` has none, so the listing would show a generic placeholder. The format is fixed: a **PNG** (the packaging tool rejects SVG icons), conventionally 128×128 or larger. The project's own colours are brass (`#B5A642`, the project window) and sea-glass cyan (`#3FA7A3`, Glazier's seat); the name is a porthole.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Purser draws a draft**: a simple geometric porthole (a brass ring around a sea-glass pane), made as an SVG and rendered to a 256×256 PNG, for you to accept, change or reject. It goes into `docs/images/` and Glazier is briefed to add the `icon` field.
- **B — you supply one**: from your own image tools or a designer; Purser prepares and checks the file (PNG, size, transparency).
- **C — ship 0.1.0 without an icon**: add one in 0.1.1. Costs a visibly unfinished listing; the field can be added later without anything else changing.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — Purser draws a draft.** *Rationale*: it costs you only a yes or no on an image, keeps the listing from looking unfinished, and a first draft can be replaced at any time since the icon is not part of the identifier. *Confidence*: 0.6 — because I can make a clean geometric mark but cannot see whether it looks good on a marketplace card at 32 pixels, which is your call. *If wrong*: if you would rather have a hand-made or designer mark, this is B; if the first draft disappoints, C until a better one exists.

**ANS:** (by Jérémie Lumbroso)
Option A, and then let's also try:
https://pypi.org/project/batch-renderer/

---

## Decision

*Pending: nothing here is decided until the questions above are answered. Two things are already settled by rulings recorded under "Originating Context": the history is kept whole, and the README follows ADR-0009.*

### Action Items

- [x] Cleanliness scans, version-floor check, terminology index, release plan, README and changelog rewritten, feedback for Lintel written - Owner: Purser (done 2026-10-13)
- [x] `.env` added to `.gitignore`; hive-of-origin notice added to `CLAUDE.md` - Owner: Purser (done 2026-10-13)
- [ ] Brief to Glazier: manifest fields (`icon`, `keywords`, `bugs`, `homepage`, `galleryBanner`), remove `"private": true`, consider `capabilities` for virtual and untrusted workspaces, and the `porthole.useInternalApi` naming question - Owner: Purser, after the answers
- [ ] Brief to Surveyor: check the version-floor document and the README's claims; re-run Spike 0 at release time - Owner: Purser
- [ ] Apply the naming review's decisions to the README, changelog and listing copy - Owner: Purser, when the review is routed back
- [ ] Build `just publish-check` - Owner: Purser, after the answers
- [ ] Make the repository public; mint tokens; publish to both registries - Owner: Jérémie (his acts)

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: the release seat's founding brief, and Jérémie's rulings of the same day on the privacy pass, the README, the floor and Lintel's skill.
- Contributors: Purser 5.5 (Claude Sonnet 5.5); a read-only subagent catalogued the screenshots.
- Changes: first draft; six questions opened.
- Outcome: Draft.

---

## Links

- Related ADRs: [ADR-0009](0009-ship-as-a-personal-vsix.md) (the decision to publish), [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md) (what was proven), [ADR-0010](0010-first-hands-on-test-of-porthole-0-1-0.md) (the hands-on test and its known limits), [ADR-0002](0002-scaffold-follow-the-house-extension-conventions.md) (the package allowlist)
- Related documents: `docs/release/` and `docs/MARKETPLACE-SKILL-FEEDBACK.md` as listed above
