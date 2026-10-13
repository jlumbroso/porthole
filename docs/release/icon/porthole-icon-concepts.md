# Porthole VS Code Extension Icon: a dozen concepts

**Format:** Batch Renderer Canonical Specification
**Target Model:** Nano-Banana-Pro
**Purpose:** Concept inventory for porthole's Marketplace icon (ADR-0011, QST-ICON). The incumbent is the hand-drawn SVG in `porthole-icon.svg` (a brass-ringed porthole, sea-green glass, a white page with three lines inside). Concepts below test it against flatter and bolder alternatives, and against a pop-out idea. The winner is redrawn as a clean vector, since a generated bitmap is a poor master for an icon.
**Style contract:** reads at 128 px (the Marketplace page) and at 16 px (a sidebar row); one clear silhouette; the idea is "a small round window you look through, onto a page". Palette leans on brass (warm gold-brown) and sea-glass (teal-green), with white for the page.
**Author:** Purser 5.5 (Claude Sonnet 5.5). Drafted 2026-10-13. **Round 1 run 2026-10-13 by Purser, locally, with `Nano-Banana-Pro` (see `README.md` in this folder). The first attempt, pushed to the brand-studio repo, failed because the model named in the header no longer exists.**
**Date:** 2026-10-13

---

## TAG LIBRARY

[ICON_BASE]: a single app-icon style illustration of a ship's porthole, square 1:1 composition, centered, generous even margin around the subject, plain white background, no text

[BRASS]: a thick brass ring in warm gold with a slightly darker brown inner lip and eight small round bolts evenly spaced around it

[GLASS]: a round pane of sea-green glass, teal-green, lit softly from the upper left with one gentle highlight

[PAGE]: a small white rounded-rectangle page seen through the glass, holding a short teal heading bar and three shorter pale rule lines, like a web page of instructions

[FLAT]: flat vector style, solid color fills, thick even shapes with rounded corners, no gradients, no shadows, extremely simple geometry, legible at sixteen pixels

[NO_EXTRAS]: letters, words, numbers, watermark, photorealism, 3D render, ship, sea, waves, anchor, background scene, drop shadow

---

## 1. The porthole and the page

### Concept 1.1: The Incumbent, Redrawn
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[BRASS]
[GLASS]
[PAGE]

Soft brushed-metal shading on the brass and a glossy glass, the page clearly the brightest thing in the icon: this is the hand-drawn incumbent given a professional render.

### Concept 1.2: Flat Brass
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]
[BRASS]
[GLASS]
[PAGE]

The same idea with no shading at all: three flat tones of brass for ring, lip and bolts, one flat teal for the glass, a flat white page. Built to survive sixteen pixels.

### Concept 1.3: Monoline
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

A single-color line icon in deep teal: a thick circular outline for the porthole with four tiny bolt dots, and inside it a page outline with three rule lines. Only strokes, no fills, even stroke weight throughout.

### Concept 1.4: Ring and Rules Only
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

The most reduced version: a thick brass ring, filled inside with sea-green, and just three white horizontal rule lines inside the glass. No page outline, no bolts. The ring and the three lines must be recognizable at a glance.

### Concept 1.5: Page Fills the Glass
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[BRASS]

The glass is almost entirely taken up by a white page seen close up, a teal heading bar and three rule lines, with only a thin sea-green rim of glass visible around it. The page, not the window, is the subject.

## 2. The pop-out idea

### Concept 2.1: Window Leaving the Frame
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

A large dark-teal rounded-rectangle application window in the background, and overlapping its lower right corner a smaller circular brass-ringed porthole floating out of it, holding a white page. The overlap suggests that the porthole came out of the big window; there is no text anywhere in the image.

### Concept 2.2: The Pin
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]
[BRASS]
[GLASS]

A brass-ringed porthole with a small round brass pin, like a map pin, stuck into the upper right of the ring, to say "stays on top". The glass holds three white rule lines.

### Concept 2.3: Arrow Out
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

A rounded-square window outline in teal with a bold diagonal arrow leaving its top right corner, and at the arrow's tip a small circular brass-ringed porthole with a white page in it. Reads as the familiar "open in new window" glyph made friendly.

## 3. Mood and finish

### Concept 3.1: Night Glow
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[BRASS]

Set on a deep navy rounded-square tile instead of white. The glass glows warm from within, and the white page is lit as if it were a lamp in a dark cabin, with a soft glow spilling slightly onto the inner brass lip.

### Concept 3.2: Sea-Glass Disc
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

A frosted sea-glass disc, pale teal and translucent-looking, with a very thin brass ring outline and a white page with three lines at its center. Lighter and quieter than the thick brass versions.

### Concept 3.3: The Dog-Ear Porthole
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[FLAT]

A white page (portrait rounded rectangle) with its top-right corner folded down as a clean triangular dog-ear, and a large circular brass-ringed porthole cut into the middle of the page, showing sea-green glass. The page is the frame; the window is the feature.

### Concept 3.4: Brass Medallion
- aspect: 1:1
- no: [NO_EXTRAS]

[ICON_BASE]
[BRASS]

A heavier, more ornamental brass ring, double-rimmed like a ship's fitting, with the glass showing a simplified white page with only a heading bar and two lines. The most "object-like" of the set, like a museum piece.
