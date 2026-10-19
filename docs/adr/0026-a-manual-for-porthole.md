<!-- adr template version: "adr 3.11.5" -->
# A manual for Porthole

- **Date**: 2026-10-19
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso; Sounder 6 (gpt-6-astra)

**TL;DR**: Explore a compact Porthole manual with warm reading typography, Berkeley Mono for precise instructions, and chapters useful beside the work; the visual study is local and the repository, build system, and publication remain proposals.

## Originating Context

Jérémie asked Sounder to examine the ADRs4AI Handbook and the Wishful/Watchful visual-identity studies (original and v2–v4), together with the emerald inquiry studies, when imagining a manual site for Porthole. A separate `porthole-docs` repository was offered as a possibility.

His explicit technology constraint: **“Never Meta/React/anything they've touched.”**

During the exploration he supplied a purchased Berkeley Mono font package and asked whether it could serve titles, highlights, or monospace text. The local package contains six WOFF2 faces: Thin, Regular, Bold, and their obliques. The package labels its license LT-02 Developer. Purchase identifiers and font binaries do not belong in this public record.

**Agency Grant**: inspect the references and propose a vision. The local study makes that proposal reviewable. This does not decide a new repository, a production framework, publication, or a redesign of the accepted product page in ADR-0023.

## Explicitation

### A manual that belongs beside the work

The product page already gives a busy visitor an introduction and installation route. The manual should help a person complete a task, understand what happened, and recover when the result differs from the expectation. Its pages should start with actual questions:

1. How do I open my first window?
2. How do HTML and Markdown behave differently?
3. How do I change the size, position, pinning, or docking?
4. How can a terminal or agent open a page, and what may that action do?
5. Which setting explains this behavior, and how do I undo it?

A short persistent contents list, a readable central column, and occasional marginal notes give those answers room. Each procedure should connect an action to the visible result. Literal command names and qualifications should survive the editing.

**A Porthole-specific opportunity:** downloadable local chapters, including their assets, could be opened in Porthole itself. Design the reading view to work at roughly 420 pixels wide. A website address cannot be sent directly to Porthole's local-file interface; this would require a local export, not a button pretending that remote URLs already work.

### What to carry from the references

- **Handbook:** grow around actual questions; retain a small theme layer; serve human-readable HTML and complete model-readable text from the same substantive source. Its current Markdown export copies raw MDX and can omit words supplied by a component, so copying that mechanism would not establish content parity.
- **Workshop studies:** compare actual content at a useful scale. The v3–v4 correction restores readable specimens and full content. The Porthole study therefore contains a first-use chapter and a reference entry, not only a cover.
- **Emerald studies:** Paper's margins and fine rules, and Night glass's restrained dark treatment, inform the reading experience. The palette comes from Porthole's existing site: warm paper, muted green, and brass. These studies are references for judgment, not adopted branding.

### Typography proposal

Use Berkeley Mono Regular for literal commands, identifiers, chapter numbers, and short labels; Bold for selective emphasis. Start with a quiet serif for chapter titles and a system sans-serif for continuous instructions. Test Berkeley titles as an alternative on exactly the same pages. Thin and oblique deserve large, occasional uses rather than small operational instructions.

The [local study](../design/2026-10-19-manual-study.html) supplies light/dark and serif/mono-title controls. A local file input loads the user's purchased WOFF2 files into browser memory without a network request or upload. The committed study embeds no purchased binary. Without the files, it explicitly identifies the system-monospace fallback. A private generated copy can include the fonts for convenient local viewing; that copy stays outside the repository.

The font's package identifies a license but does not contain the full grant. The current vendor [catalog](https://usgraphics.com/catalog) and linked [personal-license document](https://usgraphics.com/static/legal/licenses/personal-license.2829dbc956e7.pdf) distinguish uses and constrain distribution. Confirm the terms attached to this purchase and the intended site's use before deploying web fonts. Local evaluation can proceed; keeping binaries out of this public source tree also avoids distributing the purchased files as repository assets.

### Content and maintenance

Keep one substantive source for HTML and Markdown; meaningful instructions must not exist only inside interactive widgets. Derive setting names, types, and defaults from the extension's versioned manifest where practical, while retaining authored explanations and examples. Every published page should identify the extension release it describes. A separate docs repository would need an explicit release handoff to prevent drift.

The first edition can be five or six short chapters and reference tables. Add search when the content warrants it. Keep the product page's fast introduction and link it to the manual. The new manual need not repeat the marketing hero or carry an author biography at its entrance.

The study uses handwritten HTML/CSS and browser-native JavaScript, with system fonts as fallback. The Handbook uses Astro/Starlight and Vue, but its dependency tree includes MDX/JSX/Babel tooling; “no React runtime” alone does not establish compliance with Jérémie's broader exclusion. No production generator is selected here. Any candidate needs a direct and transitive dependency review against that constraint.

## Questions

### QST-MANUAL-TYPE: Which typographic direction should the manual develop?
- Status: unanswered
- Why asking: The purchased face gives Porthole a distinctive technical voice, but the balance should be judged on real instructions and reference material.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Serif titles, Berkeley details**: warm serif chapter titles, sans-serif paragraphs, Berkeley Mono for code, labels, and selective highlights. Light and dark surfaces continue Porthole's existing palette.
- **B — Berkeley titles and details**: the same content and surfaces, with Berkeley Mono also carrying chapter and section headings; a more technical overall character and wider headings.

**Recommendation**: (by Sounder 6, gpt-6-astra, 2026-10-19)
**A — Serif titles, Berkeley details.** *Rationale*: the existing product page already uses serif display type and quiet green/brass accents; the two specimens make commands visually distinct without making long instructions feel like a terminal. *Confidence*: 0.75 — because this is continuous with the human-reviewed product page, while the purchased font deserves an actual comparison. *If wrong*: if B feels more recognizably Porthole to Jérémie and remains comfortable in the narrow reference view, choose B.

**ANS:** (by Jérémie Lumbroso)
[Fill this in] <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-MANUAL-HOME: Should the manual have its own repository?
- Status: unanswered
- Why asking: A separate editorial home is plausible, but release-specific commands and settings still need to stay synchronized with the extension.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — `porthole-docs`**: a separate repository for chapters, diagrams, screenshots, and static presentation; extension releases carry a documentation-update handoff, and the product page links to the manual.
- **B — This repository**: keep the manual beside the extension and its release metadata, with a separate publication path; code and documentation updates can land together.

**Recommendation**: (by Sounder 6, gpt-6-astra, 2026-10-19)
**A — `porthole-docs`, if the manual becomes an ongoing editorial project.** *Rationale*: Jérémie proposed a manual with its own considered identity, and the Handbook provides a small example of that editorial separation. The current prototype deliberately needs neither a new repo nor a framework. *Confidence*: 0.65 — because the anticipated ownership and publishing cadence are not settled. *If wrong*: if the manual stays a handful of pages maintained with extension changes, choose B to reduce coordination overhead.

**ANS:** (by Jérémie Lumbroso)
[Fill this in] <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Validation

- Sounder inspected the Handbook source and its existing light/dark screenshots, and rendered all five supplied HTML design studies in Chromium.
- The specimen's copy follows the current local README, changelog, manifest version 0.4.0, and Porthole skill. It is a design specimen, not an independent verification of extension runtime behavior or remote publication.
- Sounder rendered and inspected the serif and Berkeley-title chapters, the dark reference page, the six-face font specimen, and the narrow chapter. Local browser checks passed for both chapters and title choices at 320, 420, 900, and 1440 pixels (16 layout cases): no horizontal page overflow, images loaded, no page-script errors, and no automatic HTTP requests when opened as a local file. Both chapters remain readable with JavaScript disabled. The skip-link check preserves the selected chapter. This is a bounded Chromium check, not a complete accessibility or cross-browser audit.
- A source review caught and corrected the skip-link behavior, the filename-encoding caveat, an omitted Thin Oblique specimen, and overbroad network wording.
- `just gate` passed: 92 tests across 9 files, typecheck, build, package allowlist, registry, and tracked-file secret scan. The font binaries and private preview remain outside the repository.

## Action Items

- Owner: Sounder — local study and visual inspection completed; the rendering script is kept under `scripts/ephemeral/2026-10-19-preview-manual.cjs`.
- Owner: Sounder, before any production implementation — confirm purchased web-font rights and inspect any proposed build dependencies against the no-Meta constraint.
- Owner: the eventual manual maintainer — define the release-to-documentation handoff if a separate repository is chosen.

## Iterations

- **1 — 2026-10-19.** Trigger: Jérémie's manual-site invitation and subsequent font package. Contributor: Sounder 6. Changes: proposed editorial direction, two local specimens, a private font-loading comparison, and explicit repository/type choices. Outcome: Draft; no production site or repository created.
