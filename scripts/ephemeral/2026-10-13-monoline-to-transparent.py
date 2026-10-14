#!/usr/bin/env python3
"""Purpose: Purser 5.5, 2026-10-13. Turn a generated single-colour line drawing on a white (or very
faintly tinted) background into a tightly cropped, truly transparent PNG, for the icon rounds
(docs/release/icon/). The stroke colour is the mean colour of the darkest pixels; alpha is how far each
pixel sits from the background toward that colour, so antialiased edges stay smooth and no white fringe
remains (a flood fill leaves a fringe; this does not). Needs Pillow only.

Usage: python3 scripts/ephemeral/2026-10-13-monoline-to-transparent.py IN.png OUT.png [size=512] [pad-percent=6]
"""
import sys
from PIL import Image, ImageChops, ImageStat

src, dst = sys.argv[1], sys.argv[2]
size = int(sys.argv[3]) if len(sys.argv) > 3 else 512
pad = float(sys.argv[4]) if len(sys.argv) > 4 else 6.0

im = Image.open(src).convert("RGB")
gray = im.convert("L")

# stroke colour: mean RGB over the pixels in the darkest band (the stroke interior)
lo = min(gray.getdata())
band = gray.point(lambda v: 255 if v <= lo + 18 else 0)
r, g, b = [round(x) for x in ImageStat.Stat(im, mask=band).mean]
stroke_gray = round(0.299 * r + 0.587 * g + 0.114 * b)

# background level: a faint tint counts as background, so use a high percentile, not pure white
hist = gray.histogram()
total, acc, bg = sum(hist), 0, 255
for level in range(256):
    acc += hist[level]
    if acc >= 0.5 * total:   # the median pixel is background in a line drawing
        bg = level
        break
bg = max(bg - 6, stroke_gray + 1)  # a little headroom so tinted paper maps to alpha 0

span = bg - stroke_gray
alpha = gray.point(lambda v: 0 if v >= bg else 255 if v <= stroke_gray else round(255 * (bg - v) / span))

out = Image.new("RGBA", im.size, (r, g, b, 0))
out.putalpha(alpha)

box = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
out = out.crop(box)
w, h = out.size
side = round(max(w, h) * (1 + 2 * pad / 100))
canvas = Image.new("RGBA", (side, side), (r, g, b, 0))
canvas.paste(out, ((side - w) // 2, (side - h) // 2))
canvas = canvas.resize((size, size), Image.LANCZOS)
canvas.save(dst, optimize=True)
print(f"stroke rgb({r},{g},{b}) background gray {bg} -> {dst} ({size}px)")

# --- Outcome (Purser 5.5, 2026-10-13) ---
# Used on round 1's concept 1.3 and all 13 round-2 renders (docs/release/icon/round-2/). Result: clean alpha with no white
# fringe on white and on faintly tinted backgrounds, composited on #1e1e1e and white; recolouring afterwards is one
# `magick in.png -fill '#RRGGBB' -colorize 100 out.png`. Run it with `uvx --with pillow python -I ...` (the system python has no Pillow).
