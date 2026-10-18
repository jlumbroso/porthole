# Markdown screenshots placed; the endorsed opening stays

- **From**: Sounder 6 (gpt-6-astra, blue)
- **To**: Glazier 5.5
- **Date**: 2026-10-18 (filename reserved at 20:41 UTC)
- **Record**: ADR-0023, iteration 4
- **State**: saved, checked, uncommitted; not deployed

Thank you for the handoff and for committing the first draft. Jérémie also
spoke to me directly about the page, and I have now viewed his 4:28:51 PM
screenshot. His particular appreciation of the original image and compact
information order guides this revision: the HTML lead image stays.

The Markdown pair is below the four highlights, in a small, initially closed
**Light or dark Markdown** disclosure. Opening it shows a real capture that
follows the browser's light/dark appearance, plus **Light** and **Dark** links
to inspect both images at full size. It uses native HTML, no JavaScript, and
retains the same styles and phone breakpoint. The heading is the README's
existing term; its two sentences describe the released read-only Markdown
preview and color choices. No outside-link or repeat-pop-out behavior is
advertised.

## Selection and provenance

I viewed all six offered captures. The two copied into the site, with bytes
unchanged, are:

| Source under `docs/adr/attachments/screenshots/2026-10-18-testing/` | Destination |
| --- | --- |
| `Screenshot 2026-10-18 at 1.19.20 PM.png` | `site/assets/porthole-markdown-light.png` |
| `Screenshot 2026-10-18 at 1.21.46 PM.png` | `site/assets/porthole-markdown-dark.png` |

These show work notes and the complete floating checklist. The dark capture
followed the accidental second window, as Jérémie's ADR-0023 answer says.
It illustrates a dark appearance; it does not prove a live color transition,
deduplication, or the later fixes. That distinction is recorded in ADR-0023
and the HTML source. The 3:53/3:54 pair shows Settings and unpublished
outside-link controls, so I kept it as diagnostic evidence in the ADR.

The clean pair needs no retouching or another capture. The native disclosure
keeps the initial page short while giving interested readers the Markdown
example. It is a deliberate change from my original replacement plan, made
in response to the human's later endorsement of the existing lead image.

## Checks

- `just gate`: passed, **79 tests in eight files**, typecheck, build, registry,
  credential and package checks. The VSIX still contains only its seven
  allowed files.
- Additional static checks passed: HTML5/CSS parsing, unique IDs and fragment
  targets, nine local asset references, image aspect ratios and alt text,
  closed disclosure with its summary first, no scripts or remote runtime
  assets, and byte-for-byte equality between each source PNG and site copy.
- Credential scan covered the changed text; `git diff --check` passed.
- Supporting read-only reviews found no material claim or source-level
  accessibility/layout defect. They do not replace Purser's claims review.
- A fresh cached Chromium launch was **sandbox-denied before page load**
  (`MachPortRendezvousServer`, `Permission denied (1100)`). I inspected the
  actual product captures and the human's original-page screenshot, but
  have not seen this revised page rendered.

Before deployment, please check the disclosure closed and open at desktop
and narrow phone widths, in light and dark. The keyboard should reach and
open the summary; each full-image link should open its named color; the
inline picture should follow the browser's scheme without cropping or
stretching. Installation remains immediately after the initially closed
disclosure. This is the remaining browser check, not another screenshot
request for Jérémie.

## Exact paths for your commit

- `site/index.html`
- `site/styles.css`
- `site/assets/porthole-markdown-light.png`
- `site/assets/porthole-markdown-dark.png`
- `docs/adr/0023-a-small-product-website-for-porthole.md`
- `docs/inbox/2026-10-18-2041-sounder-to-glazier-markdown-screenshots-placed.md`

The existing modification to the capture workspace and the untracked
4:28:51 PM screenshot are the human's, not part of this patch. No extension
source, manifest, workflow, original capture, or original site image was
changed. I made no git write attempt; the path-specific commit and Pages
workflow remain with you, and the independent claims review with Purser.

Runtime provenance for this contribution was checked directly: the local
Codex turn at `2026-10-18T20:38:19.893Z` records `gpt-6-astra`, turn
`01a150bc-99d3-7bf2-8737-b58dcf788db5`.

— Sounder 6 (gpt-6-astra)
