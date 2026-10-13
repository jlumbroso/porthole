# Porthole's icon: how it was made

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13
- **Decision**: [ADR-0011](../../adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md), `QST-ICON` (the icon is drawn, not commissioned) and `QST-ICON-PICK` (which one)

## What is here

| Path | What it is |
| --- | --- |
| `porthole-icon.svg` | The first icon, hand-drawn as vector by Purser: brass ring, bolts, sea-green glass, a white page with three lines. Its 256 px render is `media/icon.png`, the placeholder in the package until a pick is made |
| `porthole-icon-concepts.md` | Twelve prompts in [batch-renderer](https://pypi.org/project/batch-renderer/)'s format |
| `round-1/` | The twelve results, reduced to 512 px (originals are 1024 px, 8.6 MB in all), and `contact-sheet.jpg` with all twelve in one view, in prompt order, left to right: 1.1 to 1.4, 1.5 and 2.1 to 2.3, 3.1 to 3.4 |

## How round 1 was run, and what went wrong before it worked

- **Model**: `Nano-Banana-Pro` on Poe, 12 of 12 succeeded (about 18,000 tokens). `Nano-Banana-2` was tried on concept 1.1 only and also works. The model the prompts named, `Nano-Banana`, **is no longer on Poe's list**, which is why the first attempt (pushed to the brand-studio repo's workflow, twice) returned 12 server errors out of 12 and still showed a green check.
- **Tool version matters**: the `batch-renderer` installed on this machine was 1.5.0, which does not know the inline `[TAG]: text` form. It sent the literal text `[ICON_BASE] [BRASS] …` to the model and got an unrelated lightbulb back, with no error. Version 1.12.0 expands the tags. `uv tool upgrade batch-renderer` fixed the install.
- **Command**: `POE_API_KEY=… batch-renderer porthole-icon-concepts.md -m Nano-Banana-Pro -o out --no-confirm`, key from the git-ignored `.env`, never printed.
- **Lesson for the prompts**: concept 2.1 asked for an overlap that "says" a phrase, and the model drew the phrase as text. Prompts should not quote anything that must not appear in the picture. The wording is fixed in the prompt file; the image is kept as the specimen.

## Purser's reading of round 1

- **Strongest at small size**: 1.2 (flat brass tile, thick shapes) and 1.3 (one-colour monoline, the same idiom as the sibling extension's icon).
- **Richest**: 1.1, close to the hand-drawn one but professionally shaded.
- **Surprise**: 2.2 (a brass pin on the ring says "stays on top").
- **Not for us**: 2.1 (baked text), 2.3 (generic "open in new window" glyph), 3.1 (the page disappeared), 3.3 (the porthole is a dot), 3.4 (too ornate and dark at 128 px).
- **Technical to-do after a pick**: the generated image has an opaque white background. A Marketplace icon needs a transparent one so it does not show a white square on a dark theme.
