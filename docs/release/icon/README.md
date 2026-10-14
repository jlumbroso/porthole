# Porthole's icon: how it was made

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13
- **Decision**: [ADR-0011](../../adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md), `QST-ICON` (the icon is drawn, not commissioned) and `QST-ICON-PICK` (which one)

## What is here

| Path | What it is |
| --- | --- |
| `porthole-icon.svg` | The first icon, hand-drawn as vector by Purser: brass ring, bolts, sea-green glass, a white page with three lines. It was the placeholder until the pick below; kept as the record of the first idea |
| `porthole-icon-concepts.md` | Twelve prompts in [batch-renderer](https://pypi.org/project/batch-renderer/)'s format |
| `../../../media/icon.png` | **The icon in the package.** Since 2026-10-13 (round 2) it is **vector A3**, rendered at 256 px with a transparent background (see "Round 2" below). It replaced concept 1.2, which Jérémie had picked earlier (`QST-ICON-PICK`, option A) and then was "not sold" on. It reaches users with the next version, since 0.1.0 shipped with 1.2 |
| `round-1/chosen-1.2-transparent-512.png` | The same, 512 px, transparent background, the master for any later resize |
| `round-1/` | The twelve results, reduced to 512 px (originals are 1024 px, 8.6 MB in all), and `contact-sheet.jpg` with all twelve in one view, in prompt order, left to right: 1.1 to 1.4, 1.5 and 2.1 to 2.3, 3.1 to 3.4 |

## How round 1 was run, and what went wrong before it worked

- **Model**: `Nano-Banana-Pro` on Poe, 12 of 12 succeeded (about 18,000 tokens). `Nano-Banana-2` was tried on concept 1.1 only and also works. The model the prompts named, `Nano-Banana`, **is no longer on Poe's list**, which is the likely reason (inferred; the retired name was not re-tried) that the first attempt (pushed to the brand-studio repo's workflow, twice) returned 12 server errors out of 12 and still showed a green check.
- **Tool version matters**: the `batch-renderer` installed on this machine was 1.5.0, which does not know the inline `[TAG]: text` form. It sent the literal text `[ICON_BASE] [BRASS] …` to the model and got an unrelated lightbulb back, with no error. Version 1.12.0 expands the tags. `uv tool upgrade batch-renderer` fixed the install.
- **Command**: `POE_API_KEY=… batch-renderer porthole-icon-concepts.md -m Nano-Banana-Pro -o out --no-confirm`, key from the git-ignored `.env`, never printed.
- **Lesson for the prompts**: concept 2.1 asked for an overlap that "says" a phrase, and the model drew the phrase as text. Prompts should not quote anything that must not appear in the picture. The wording is fixed in the prompt file; the image is kept as the specimen.

## Purser's reading of round 1

- **Strongest at small size**: 1.2 (flat brass tile, thick shapes) and 1.3 (one-colour monoline, the same idiom as the sibling extension's icon).
- **Richest**: 1.1, close to the hand-drawn one but professionally shaded.
- **Surprise**: 2.2 (a brass pin on the ring says "stays on top").
- **Not for us**: 2.1 (baked text), 2.3 (generic "open in new window" glyph), 3.1 (the page disappeared), 3.3 (the porthole is a dot), 3.4 (too ornate and dark at 128 px).
- **Technical to-do after a pick**: the generated image has an opaque white background. A Marketplace icon needs a transparent one so it does not show a white square on a dark theme.

## What was done to the chosen image

The render had an opaque white background. It was removed by flood-filling from the four corners (8% fuzz), the alpha edge eroded by 1.2 px so no white fringe survives, trimmed, padded 12% and resized. Checked: corners fully transparent at 512 and 128 px, and no fringe when composited on `#1e1e1e` and on white. It is a bitmap made by a model, not a vector: if a crisper master is ever wanted, redraw it as SVG from this one.

## Round 2 (2026-10-13): variations on the monoline, concept 1.3

Jérémie was "not sold" on the shipped icon (1.2) and liked 1.3 (the one-colour double ring with eight bolts and a page). Round 2 asks:
does 1.3 survive being transparent, tightly cropped, and shown at the size of an extension-list row (40 px)? Everything is in `round-2/`.

- **Generated variations**: 13 prompts in `porthole-icon-round-2-monoline.md` (stroke weight, one or two rings, bolts, page shape, a pin, a hinge, colour), all rendered with `Nano-Banana-Pro`: `round-2/generated-contact-sheet.jpg`.
- **Transparency and tight crop**: `scripts/ephemeral/2026-10-13-monoline-to-transparent.py` derives alpha from how far each pixel is from the background towards the stroke colour, so the edges stay smooth and no white fringe remains. `round-2/concept-1.3-transparent-original-colour.png` is the original 1.3 treated that way.
- **Findings, each from looking at the images** (the 40 px strips are in the `.jpg` files):
  1. **The deep teal of 1.3 nearly vanishes on a dark theme**; brass stays visible. The extension list shows the icon on the editor's own background, so this matters. A **mid-tone teal (`#2AA3AE`)** reads on both light and dark (`recolour-test-light-and-dark.jpg`).
  2. **1.3's thin strokes go faint at 40 px.** Only the heavier concepts (bolder, pin, page-breaks-the-frame) hold.
  3. **A generated bitmap is a poor master for a line drawing**, so the strongest ideas were redrawn as SVG with stroke weights chosen for 40 px, which is also exactly transparent at any size.
- **Vectors** (`round-2/vec-*.svg`, with 512 px PNGs): **A** is 1.3 redrawn (double ring, eight bolts) and gets busy at 40 px; **A2** is 1.3 simplified (heavier rings, four bolts, bigger page); **B** and **B2** are a single heavy ring with a page and a pin for "stays on top" (B2's pin is large enough to read); **C** is the page coming out through the ring, the boldest and the least porthole-like.
- **Chosen: A, with the eight bolts** (Jérémie: "the eight bolts are important"). **A3** (`round-2/vec-a3-eight-bolts-tuned.svg`) is A with heavier rings (stroke 32), larger bolts and a larger page, so it stays legible at 40 px: `round-2/a-vs-a3-at-300-128-40-32px.jpg` shows A beside A3. A3 is now `media/icon.png`. Colour is the mid-tone teal `#2AA3AE`, which reads on light and dark themes. 0.1.0 on the registries still shows concept 1.2 until the next version is published.

