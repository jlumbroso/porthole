<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# A small product website for Porthole

- **Date**: 2026-10-14
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5); the site's seat once it accepts

**TL;DR**: Porthole gets one static page explaining what it is, modeled on the Peacock site's front page; it is offered to Sounder 6 as a new, consented assignment, and its screenshots are staged by that seat and taken by Jérémie through a step-by-step QST.

---

## Originating Context

**Source**: Jérémie, 2026-10-14: *"could you deputize Sounder 6 (or recruit a distinct seat) to create a product website? small, but just explaining what Porthole is — happy to take custom screenshots, if they want, but they have to stage everything and give me instructions as precise as yours as a ORRCF QST. do you agree with the web page part? This is sort of what I am thinking of: https://johnpapa.github.io/vscode-peacock/"*

**Agency Grant**: choose the seat (Sounder 6 or a new recruit); say whether a web page is the right thing.

---

## Explicitation

**Why a page, when the README exists.** The README is also the Marketplace listing, so it has to serve as a reference: settings, limits, how it works. A person sent a link by a colleague needs something else: what Porthole is, what it looks like, and how to install it, in one screen. Porthole is a *motion* (a page leaves the editor and floats on top), and a page can show that with a short clip in a way a listing's text cannot. So I agree with the page, on three conditions:

1. **Small: one page.** The Peacock site is a VitePress documentation site with a guide, changelog and many pages. Porthole needs its front page only: name and one sentence, a picture of the floating window, three or four features, install, a link to the README for everything else. No guide, so no second copy of the settings to keep in sync.
2. **No new facts and no drift.** Every claim on the page comes from the README, which Purser owns. Where the page and the README disagree, the README is right and the page is fixed. Any new user-facing name the page introduces goes through the naming review first, like any other.
3. **Static, with nothing to install.** Hand-written HTML and CSS in `site/`, served by GitHub Pages and deployed by a workflow. No site framework: porthole has no build dependency for a web page today, and a framework would add one to keep current. `site/` never enters the `.vsix`; the package check already refuses anything beyond its seven named files.

**Who builds it: Sounder 6, if it accepts.** Sounder's founding terms are "advice only… does not implement", so this is a new assignment it may decline, not a deputization by fiat. Why Sounder first: the page's whole job is explaining Porthole to a stranger, and the crew's one reader from outside the Claude family is the nearest thing it has to one; its reviews in ADR-0013 and ADR-0014 also kept "proposed", "inspected" and "observed" apart, which a product page must not blur. Known costs: its Codex sandbox could not take git's index lock last time, so Glazier commits its work on its behalf; and it may not be able to look at the rendered page, so a check by eye belongs in its QST. If Sounder declines, Glazier recruits a distinct seat for it.

**Screenshots** are staged by the site's seat (sample file, window size, theme, what is open and where) and taken by Jérémie through one ORRCF QST written to the human-run-checks skill (`.claude/skills/human-run-checks/SKILL.md`): every window named exactly, every step one action, and why first. Existing images in `docs/images/` may be reused where they fit.

**Confirm**: Jérémie, through the question below; Sounder 6, by accepting or declining the brief.

---

## Questions

### QST-SITE-ADDRESS: Where does the page live?
- Status: unanswered
- Why asking: The address goes into the Marketplace listing's homepage link and into anything people share, so changing it later breaks links. GitHub Pages serves a repository's site at `https://jlumbroso.github.io/porthole/` with no setup beyond the repository's settings; a custom domain needs a DNS record and a name you own.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — GitHub's address**: `https://jlumbroso.github.io/porthole/`, as the Peacock site does (`johnpapa.github.io/vscode-peacock/`). Free, nothing to renew, works the day the workflow runs.
- **B — a custom domain**: for instance a subdomain of a domain you already own, pointed at GitHub Pages. Shorter and independent of GitHub, but it needs a DNS record and lapses if the domain does.
- **C — no public site yet**: the page is built in `site/` and previewed locally, and the address is decided when it is done.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)
**A — GitHub's address.** *Rationale*: the repository is already public on GitHub, the GitHub Release and README links already point there, and a domain adds a renewal nobody has asked for. *Confidence*: 0.7 — because this is a preference about your name on the web, which I cannot see. *If wrong*: if you already keep a domain for your projects, B.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: one static page, offered to Sounder 6

As in the Explicitation: one page in `site/`, no framework, every claim from the README, deployed by GitHub Pages, screenshots through one ORRCF QST. Offered to Sounder 6 by brief (`docs/inbox/2026-10-14-1923-glazier-to-sounder-invitation-product-page.md`); a new seat if it declines.

---

## Action Items

- [ ] Accept or decline the invitation — Owner: Sounder 6
- [ ] Draft the page and the screenshot QST — Owner: the site's seat
- [ ] Commit the site's seat's work if its sandbox cannot; add the Pages workflow (pinned action SHAs, as in `release.yml`) — Owner: Glazier
- [ ] Check the page's claims against the README — Owner: Purser
- [ ] Take the screenshots — Owner: Jérémie, through the QST

---

## Iterations

### Iteration 1 (2026-10-14)
- Trigger: Jérémie's request, quoted above
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Model: <https://johnpapa.github.io/vscode-peacock/> (its front page only)
- Related: `README.md` (the source of every claim), [ADR-0011](0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md) (the listing), `.claude/skills/human-run-checks/SKILL.md`
