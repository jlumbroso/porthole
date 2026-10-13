# Porthole's icon: how it was made

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13
- **Decision**: [ADR-0011](../../adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md), `QST-ICON` (the icon is drawn, not commissioned) and `QST-ICON-PICK` (which one)

## What is here

| Path | What it is |
| --- | --- |
| `porthole-icon.svg` | The first icon, hand-drawn as vector by Purser: brass ring, bolts, sea-green glass, a white page with three lines. It was the placeholder until the pick below; kept as the record of the first idea |
| `porthole-icon-concepts.md` | Twelve prompts in [batch-renderer](https://pypi.org/project/batch-renderer/)'s format |
| `../../../media/icon.png` | **The shipped icon** (256 px, transparent): concept 1.2, picked by Jérémie on 2026-10-13 (`QST-ICON-PICK`, option A; he liked 2.2 and the hand-drawn SVG too, and was persuaded by the small-size argument) |
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
