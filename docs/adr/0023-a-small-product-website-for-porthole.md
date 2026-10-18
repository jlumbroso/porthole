<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# A small product website for Porthole

- **Date**: 2026-10-14
- **Iteration**: 4
- **Status**: Accepted
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
- Status: answered
- Why asking: The address goes into the Marketplace listing's homepage link and into anything people share, so changing it later breaks links. GitHub Pages serves a repository's site at `https://jlumbroso.github.io/porthole/` with no setup beyond the repository's settings; a custom domain needs a DNS record and a name you own.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — GitHub's address**: `https://jlumbroso.github.io/porthole/`, as the Peacock site does (`johnpapa.github.io/vscode-peacock/`). Free, nothing to renew, works the day the workflow runs.
- **B — a custom domain**: for instance a subdomain of a domain you already own, pointed at GitHub Pages. Shorter and independent of GitHub, but it needs a DNS record and lapses if the domain does.
- **C — no public site yet**: the page is built in `site/` and previewed locally, and the address is decided when it is done.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)
**A — GitHub's address.** *Rationale*: the repository is already public on GitHub, the GitHub Release and README links already point there, and a domain adds a renewal nobody has asked for. *Confidence*: 0.7 — because this is a preference about your name on the web, which I cannot see. *If wrong*: if you already keep a domain for your projects, B.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A, for now, with `https://jlumbroso.github.io/porthole/`

(Not to worry, but making a mental note: At some later point, we may move this project to the [Lumbroso Commons](https://github.com/lumbroso-commons). I am waiting for publisher verification to be approved for this GitHub organization — it would be appropriate if we expect others to want to contribute to this.)

Also, we are proud of any association with GitHub! A `github.io` subdomain is nothing to sneeze at! A website subsidized by the best, and only meritorious, constructive and largely epistemic social media in the world! "independent of GitHub" is not a virtue in its own, in my opinion. We could create subdomains like `porthole.lumbroso.computer` or `porthole.projects.lumbroso.computer`, but I think association with GitHub, the place where things get built, is not bad — see @johnpapa illustrating just that with his amazing `vscode-peacock` extension and website.

---

### QST-SITE-SCREENSHOTS: Can we show a clean Markdown checklist beside the work, in light and dark?
- Status: answered
- Why asking: **Give the page a picture of the current product.** The draft uses the README's real HTML screenshot. A new, deliberately staged Markdown picture would show the checklist use case without real account instructions or another project's content. Markdown and its color setting already passed your check in ADR-0022; this asks for two usable pictures, not another feature test. Only your installed VS Code can supply them. If either picture fails, we keep the existing image and fix the staging before asking again.
- Need: pick a letter (or override — any shape answers). About six minutes. Save the two PNGs named below on your Desktop; we will inspect and import them.

**Where to do this.** Start in **your porthole workspace window**: the VS Code window with the repository folder `porthole` open. The first command opens a separate window titled **Porthole screenshot**; below, this is the **large sample window**, showing source text or Settings. Its **floating window** is the smaller window showing the rendered checklist. Both may have the same title, so distinguish them by their contents and size. Use your installed Porthole 0.2.1 or later, not a window titled `[Extension Development Host]`.

**Before you start — what changes, and undo.** The prepared workspace at `samples/site-capture/porthole-screenshot.code-workspace` contains only sample files. It chooses VS Code's built-in **Default Dark Modern** theme, 16-pixel text, a 480 × 640 floating window, and light Markdown colors. Those settings belong to this sample workspace; your User settings stay as they are. It enables Porthole's internal-command path for this workspace so an existing User override does not bypass the size preset, and suppresses the compactness prompt without changing auto-lock settings. The dark shot changes only this workspace's `porthole.markdown.colorScheme`; restore **light** before closing it. If you have other Porthole Markdown floating windows open, close those first so they do not compete for the extension's shared color stylesheet. The capture replaces your clipboard, so save anything you need from it first. Closing the sample workspace and its floating window restores your normal working context. A Workspace Trust grant persists for the sample folder; to remove it later, open that workspace, run **Workspaces: Manage Workspace Trust** from **Shift+Cmd+P**, and remove the `site-capture` entry from **Trusted Folders & Workspaces**.

**Steps.** A command or save is one action; its exact keys and text are given in place. Do not use macOS full-screen mode: the picture needs two overlapping windows.

1. **Open the staged workspace.** In the integrated terminal of **your porthole workspace window**, run `code --new-window ~/Programming/porthole/samples/site-capture/porthole-screenshot.code-workspace`. A separate window titled **Porthole screenshot** should open. If the command is unavailable or that window does not appear, stop with C.
2. **Trust the sample workspace if asked.** If VS Code displays its Workspace Trust dialog, choose **Yes, I trust the authors**. The sample folder contains only the two Markdown files and this settings file, with no tasks or executable code. If there is no dialog, skip this step.
3. **Size the large sample window.** Drag its lower-right corner until it is roughly 1,100 pixels wide and 740 pixels tall, or as large as comfortably fits your screen. Exact pixels are unnecessary; leave room for the floating window to overlap its right-hand side.
4. **Open the checklist source.** In the **large sample window**, press **Cmd+P**, type `checklist.md`, then press **Enter**. You should see source beginning `# A small page, kept in view`.
5. **Pop out the checklist.** With that source tab focused, press **Ctrl+Alt+M**. The floating window should show **A small page, kept in view**, two checked boxes and three unchecked boxes, and the note underneath, on a light background. It should have no tabs or status bar.
6. **Focus the large sample window.** Click the title bar of the **large sample window**. The floating checklist should remain above it.
7. **Open the work notes.** In the **large sample window**, press **Cmd+P**, type `work-notes.md`, then press **Enter**. The large sample window should show `# Work notes` as source; the floating window should still show the rendered checklist.
8. **Hide the sample file list if visible.** In the **large sample window**, run **View: Toggle Primary Side Bar Visibility** from **Shift+Cmd+P**. The editor should now have room for the work notes. If the file list is already hidden, skip this step.
9. **Place the floating window.** Drag its title bar so it overlaps the right-hand third of the **large sample window**, with both title bars visible and the work notes readable to its left. Leave the checklist at its top; its full note should fit. If the note is cut off, stop with C and we will adjust the fixture's height.
10. **Start the light capture.** Press **Ctrl+Shift+Cmd+4**. The pointer should become a crosshair; this copies a selected rectangle to the clipboard instead of choosing a save location.
11. **Select the composition.** Drag a rectangle enclosing the work notes and the entire floating window, including its title bar. Keep the Desktop, macOS menu bar, other windows, personal paths and notifications outside the rectangle. After releasing the pointer, the image is on the clipboard.
12. **Open Preview.** Press **Cmd+Space**, type `Preview`, then press **Enter**. macOS Preview should be frontmost.
13. **Dismiss Preview's Open dialog if shown.** Press **Esc** if Preview is asking you to open a file. Otherwise skip this step.
14. **Make the image document.** In **Preview**, press **Cmd+N** (**File → New from Clipboard**). You should see the composition you selected.
15. **Save the light image.** In **Preview**, press **Cmd+S**. Use **Save As** `porthole-site-light.png`, **Where** Desktop, and **Format** PNG if shown; then click **Save**. If that name exists, use `porthole-site-light-2.png` and report that name rather than overwriting it.
16. **Hide Preview.** In **Preview**, press **Cmd+H**. Its windows should disappear, leaving the sample composition accessible.
17. **Return to the sample workspace.** Click the title bar of the **large sample window**. Its work notes should be visible beside the light floating window again.
18. **Open Settings.** In the **large sample window**, press **Cmd+,**. Settings should open in the large sample window.
19. **Choose the Workspace tab.** At the top of Settings, click **Workspace**, not **User**. This keeps the change in the sample workspace.
20. **Find the color setting.** In the Settings search box, type `porthole.markdown.colorScheme`. **Porthole › Markdown: Color Scheme** should appear with **light** selected.
21. **Choose dark.** In the drop-down, choose **dark**. Within about two seconds, the floating checklist should have a dark background and light text. The sample editor stays dark.
22. **Return to the work notes.** In the **large sample window**, press **Cmd+P**, type `work-notes.md`, then press **Enter**. The arrangement should match the light capture, now with a dark checklist.
23. **Start the dark capture.** Press **Ctrl+Shift+Cmd+4**. The pointer should become a crosshair again.
24. **Select the composition.** Drag a rectangle enclosing the work notes and the entire floating window, with the same bounds as closely as practical. The clipboard now holds the dark version.
25. **Return to Preview.** Press **Cmd+Space**, type `Preview`, then press **Enter**. Preview should come to the front.
26. **Make the second image document.** In **Preview**, press **Cmd+N**. You should see the dark composition in a new document.
27. **Save the dark image.** Press **Cmd+S**. Use **Save As** `porthole-site-dark.png`, **Where** Desktop, and **Format** PNG if shown; then click **Save**. If it exists, use `porthole-site-dark-2.png` and report that name.
28. **Hide Preview.** In **Preview**, press **Cmd+H**. Its windows should disappear again.
29. **Return to the sample workspace.** Click the title bar of the **large sample window**.
30. **Reopen Settings.** Press **Cmd+,**. Settings should still show the workspace color setting. If it does not, choose **Workspace** and search `porthole.markdown.colorScheme` again.
31. **Restore light.** In that setting's drop-down, choose **light**. The sample workspace should be back to its starting value. Your User setting has not changed.
32. **Close the floating window.** Click its red close button. The large sample window should remain open.
33. **Close the large sample window.** Click its red close button. Your original porthole workspace window is still available; the two PNG files remain on your Desktop.

Options:
- **A — both pictures ready**: the light and dark PNGs show the complete checklist floating over the work notes, with no unrelated content. We inspect them, replace the draft's HTML image with this pair, and let the website choose the image that matches its light or dark appearance.
- **B — only one usable picture**: name light or dark and what prevented the other. We use the usable picture in both website appearances, if it is clear, and do not ask you to repeat the successful capture.
- **C — staging did not work**: a command, window, color or save differed from the steps. Say which step and what appeared; we fix the instructions or fixture before scheduling another capture.
- **D — something else**: say what you saw, or prefer the existing HTML picture. We keep the current image until your preference is clear.

**Recommendation**: (by Sounder 6, gpt-6-astra, 2026-10-14)
**A — both pictures ready** (a prediction). *Rationale*: your answer to ADR-0022's QST-CHECK-MD-COLORS confirms that the installed product shows light and dark Markdown and updates an open window within about two seconds. The sample files are short, contain no account information, and the workspace gives the picture a clean title and explicit size. *Confidence*: 0.75 — the color behavior has been run, but I cannot run your installed VS Code or verify the final framing here. *If wrong*: B changes the page to a single inspected picture; C withdraws this staging procedure for a corrected one rather than asking you to improvise; D follows your observed result or image preference. An incomplete checklist, unexpected extra tab, unreadable composition or unrelated content in either saved PNG falsifies A even if the color switch worked.

**ANS:** (by Jérémie Lumbroso)
Mostly Option A, but with some caveats:
- In my understanding of the instructions, `checklist.md` is what is in the floating window.
- The instructions are about having VSCode in dark mode, while the floating window is first in light mode, then dark mode, with the same document.
- When I changed the setting from dark to light, I tried to refresh the floating window, because it did not spontaneously change (as I thought we had ascertained). I could not refresh, or refreshing did not change the color mode from light to dark on the existing floating window.
- I then called "Pop Out to Floating Window" on `checklist.md` again, from the treeview, and this opened a second floating window of the same document, this new one in dark mode.

Screenshots:
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.14.23 PM.png` porthole workspace and staging workspace side-by-side
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.16.38 PM.png` about to select "Pop Out to Floating Window" on `checklist.md`
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.17.09 PM.png` floating window of the checklist in light mode
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.18.42 PM.png` same, with wider staging workspace
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.19.10 PM.png` same, cropped around the staging workspace (for as deliverable 1a)
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.19.20 PM.png` same, tightly cropped (for as deliverable 1b)
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.21.10 PM.png` opening in dark mode, expecting to replace the floating window, but opening a second one
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.21.40 PM.png` cropped around staging workspace in dark mode (deliberable 2a)
- See: `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 1.21.46 PM.png` same, tightly cropped (deliverable 2b)

---

## Decision

### Chosen: one static page, offered to Sounder 6

As in the Explicitation: one page in `site/`, no framework, every claim from the README, deployed by GitHub Pages, screenshots through one ORRCF QST. Offered to Sounder 6 by brief (`docs/inbox/2026-10-14-1923-glazier-to-sounder-invitation-product-page.md`); a new seat if it declines.

**Address (QST-SITE-ADDRESS, A)**: `https://jlumbroso.github.io/porthole/`, "for now". Jérémie's note for later: the project may move to the Lumbroso Commons GitHub organization once its publisher verification is approved, which would move the address with it. And a correction to my framing: "independent of GitHub" is not a virtue in itself; being associated with the place where things get built is a good thing.

**Screenshot placement — Sounder 6 (gpt-6-astra), 2026-10-18.** Jérémie reviewed the rendered draft and praised its existing lead image, information selection and layout; his record is `docs/adr/attachments/screenshots/2026-10-18-testing/Screenshot 2026-10-18 at 4.28.51 PM.png`. I have inspected that screenshot. It shows the desktop light appearance of the opening section, not the phone or dark layout. His direct feedback also approves the four highlights, installation links, internal-command caveat and footer.

Following that feedback, the original HTML image stays in the lead. The new Markdown pair is placed under the four highlights in an expandable **Light or dark Markdown** example, using the README's existing wording. This revises my earlier plan to replace the lead image: the added example is closed initially to preserve the short path from the four highlights to installation. It uses native HTML disclosure, with no JavaScript; its picture follows the website's light/dark appearance, and **Light** and **Dark** links open both full-size captures.

I inspected all six captures offered in Glazier's 2026-10-18 handoff and copied the following without editing their pixels:

| Source under `docs/adr/attachments/screenshots/2026-10-18-testing/` | Site asset |
| --- | --- |
| `Screenshot 2026-10-18 at 1.19.20 PM.png` (deliverable 1b) | `site/assets/porthole-markdown-light.png` |
| `Screenshot 2026-10-18 at 1.21.46 PM.png` (deliverable 2b) | `site/assets/porthole-markdown-dark.png` |

These tight captures show the checklist beside the work notes. The dark capture followed the accidental second window described in Jérémie's answer; it establishes a dark appearance, not live switching or repeat-open correctness. The later 3:53:56 and 3:54:23 captures include the Settings editor and unpublished outside-link controls, so they stay in the test record. New page copy covers only the released Markdown preview, read-only behavior and choice of colors; the README remains its authority. The website's image selection is not a demonstration of the extension changing a live window's colors.

The initial draft and its answer are committed as `e3b9ebc` and `fe0ea63`. This screenshot placement is a subsequent saved change for Glazier's path-specific commit. A fresh browser attempt here again failed at Chromium's sandbox-denied process bootstrap, before page load; the revised disclosure, phone layout and theme selection still need browser inspection. This does not reopen the completed screenshot request.

---

## Action Items

- [x] Accept or decline the invitation — Owner: Sounder 6 (2026-10-14: accepted, with a four-section sketch and two screenshots; `docs/inbox/2026-10-14-1925-sounder-to-glazier-accept-product-page.md`)
- [x] Draft the page and the screenshot QST — Owner: Sounder 6 (2026-10-14; `site/`, `samples/site-capture/`, QST-SITE-SCREENSHOTS)
- [x] Commit the initial site draft and screenshot answer — Owner: Glazier (`e3b9ebc`, `fe0ea63`, 2026-10-18)
- [x] Commit the screenshot placement and add the Pages workflow (pinned action SHAs, as in `release.yml`) — Owner: Glazier (2026-10-18: `4089a5e`; `.github/workflows/pages.yml`; live at https://jlumbroso.github.io/porthole/)
- [ ] Inspect the rendered page at desktop and phone widths, in light and dark, before publishing — Owner: Glazier (Sounder's browser launch was sandbox-denied)
- [x] Check the page's claims against the README — Owner: Purser (2026-10-18: all hold, `docs/inbox/2026-10-18-2058-purser-to-glazier-0-3-0-wording-done-page-claims-checked.md`)
- [x] Take the screenshots — Owner: Jérémie (2026-10-18, QST-SITE-SCREENSHOTS answer and its named captures)
- [x] Inspect and place the selected screenshot pair — Owner: Sounder 6 (2026-10-18, selection and caveat recorded above)

---

## Iterations

### Iteration 1 (2026-10-14)
- Trigger: Jérémie's request, quoted above
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-14)
- Trigger: Sounder 6 accepted; Jérémie answered QST-SITE-ADDRESS (A)
- Contributors: Jérémie Lumbroso, Sounder 6, Glazier 5.5 (Claude Opus 5.5)
- Changes: address recorded
- Outcome: `Accepted`

### Iteration 3 (2026-10-14)
- Trigger: the accepted website assignment is drafted.
- Contributors: Sounder 6 (gpt-6-astra).
- Changes: `site/index.html`, local CSS and unchanged copies of the icon and README's `porthole-beside-the-editor.png`; the README's four feature names, install destinations and compatibility limits; a separate sample workspace and QST-SITE-SCREENSHOTS for two Markdown captures. No framework, scripts, remote fonts or runtime services.
- Outcome: the decision remains `Accepted`; the page is saved as a draft. Light/dark CSS and phone breakpoints are written, but rendering is unverified here: Chromium's process bootstrap was sandbox-denied. Human captures, Glazier's browser check and deployment, and Purser's independent claim check remain outstanding.

### Iteration 4 (2026-10-18)
- Trigger: Jérémie supplies the screenshot set and endorses the rendered draft; Glazier commits the initial work and hands the captures back for placement.
- Contributors: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5); Sounder 6 (gpt-6-astra).
- Changes: preserved the endorsed lead image; added the unedited light/dark Markdown pair in a native disclosure beneath the highlights; recorded source filenames and the dark capture's duplicate-window caveat; completed the screenshot action items.
- Outcome: `Accepted`; placement saved for commit. The original desktop light opening has been seen by the human and in his screenshot; the revised page's browser check, Purser's claims review and deployment remain outstanding.

---

## Links

- Model: <https://johnpapa.github.io/vscode-peacock/> (its front page only)
- Related: `README.md` (the source of every claim), [ADR-0011](0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md) (the listing), `.claude/skills/human-run-checks/SKILL.md`
