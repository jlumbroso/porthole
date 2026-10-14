<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Markdown colors in floating windows (0.2.1)

- **Date**: 2026-10-14
- **Iteration**: 2
- **Status**: Accepted
- **Deciders**: Jérémie Lumbroso; the naming review (names); Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: 0.2.1 adds a setting that shows Markdown in Porthole's floating windows with light or dark colors whatever VS Code's theme; it is built and tested against a mocked VS Code, and is published once the naming review has ruled on its names and a three-minute hand check has shown it works.

---

## Originating Context

**Source**: Jérémie, 2026-10-14: *"Create a 0.2.1 with a setting to control the dark/light mode of the Markdown rendering — and making sure to ask the naming review for naming information."*

**Agency Grant**: Build it, put its names through the naming review, publish 0.2.1.

---

## Explicitation

**Why it is not a one-line setting.** VS Code's Markdown preview takes its colors from VS Code's own theme and has no color setting of its own (the built-in Markdown extension's settings, read at 1.141.0). Changing VS Code's theme would change every window. So Porthole must recolor the preview itself.

**How it works** (read in source at 1.141.0, not yet run):

1. An extension may add a stylesheet to every Markdown preview (`contributes."markdown.previewStyles"`). It loads from the extension's own folder, which the preview's security policy allows.
2. Every preview page names its source file in a hidden tag, `<meta id="vscode-markdown-preview-data" data-settings='{"source":"file:///…"…}'>` (`extensions/markdown-language-features/src/preview/documentRenderer.ts` L86–117).
3. So Porthole rewrites that one stylesheet with a rule for each Markdown file it shows in a floating window, selected with `html:has(meta[data-settings*='"source":"<file>"'])`. **Other Markdown previews keep following VS Code's theme**, unless they show the same file.
4. It rewrites the stylesheet before a Markdown floating window opens, when one closes, and when the setting changes, then asks VS Code to refresh Markdown previews (`markdown.preview.refresh`) — only when some colors actually change.

**Known limits, stated now**: code blocks keep VS Code's syntax colors (the preview's highlighting stylesheet follows VS Code's theme), so code may read less well on the opposite background. When porthole runs from source in a debug window, it rewrites the tracked file `media/markdown-color-scheme.css` in the repository; that change is harmless and should not be committed.

**Names used, provisional** until the naming review rules: setting `porthole.markdown.colorScheme`, values `auto`, `light`, `dark`, default `auto`.

**Confirm**: the naming review, then Jérémie, through the two questions below.

---

## Questions

### QST-NAME-MD-COLORS: What are the setting and its values called?
- Status: answered
- Why asking: The key is permanent once published, and so are its values, since people write them into their settings. As built: `porthole.markdown.colorScheme`, values `auto` (follow VS Code's theme), `light`, `dark`; description "Colors of Markdown files shown in Porthole's floating windows. Other Markdown previews keep following VS Code's theme. Code-block syntax colors still follow VS Code's theme."
- Need: pick a letter (or override — any shape answers)

Options:
- **A — `porthole.markdown.colorScheme`: `auto` / `light` / `dark`**: as built. "color scheme" is the CSS and operating-system word for light versus dark.
- **B — `porthole.markdown.theme`: `followVSCode` / `light` / `dark`**: "theme" is VS Code's word, and `followVSCode` says what auto means.
- **C — `porthole.markdownColors`: `auto` / `light` / `dark`**: flat, without a `markdown` group, like the other porthole settings today.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**A — `porthole.markdown.colorScheme` with `auto`, `light`, `dark`.** *Rationale*: "theme" in VS Code means a full set of editor colors a person installs, which this is not; "color scheme" is exactly the light-or-dark choice and is the word web pages use (`prefers-color-scheme`); and a `markdown` group leaves room for later Markdown settings, such as the live page in ADR-0015. *Confidence*: 0.55 — because `auto` versus a more explicit value, and grouped versus flat, are matters for the review's ear. *If wrong*: B if "theme" is the word users search for; C if the review prefers porthole's settings to stay flat.

**Recommendation**: (by the naming review, 2026-10-14)

**A — `porthole.markdown.colorScheme` with `auto` / `light` / `dark` — confirmed on all three axes, raised to 0.8.**

1. **"color scheme" over "theme"**: Glazier's argument is exactly right and is the ruling — in VS Code, a *theme* is an installable full color set, which this is not; "color scheme" is the platform word for precisely the light/dark choice, in CSS (`prefers-color-scheme`), in the OS, and in the rendered page's own world. B would borrow a VS Code word to mean something VS Code doesn't mean by it — a register the key must not lie in.
2. **`auto` over `followVSCode`**: `auto` is the ecosystem-wide convention for "follow the environment," and values are strings users type — a camelCased sentence is a typo farm. One rider: give the enum per-value descriptions (`enumDescriptions`), with `auto` glossed as "Follow VS Code's theme" — the zone discloses what the value compresses, at the exact surface where a user is choosing.
3. **Grouped over flat**: C's premise expired yesterday — ADR-0021 made `outsideLinks.actions.<verb>` porthole law, so groups are already the house pattern, and `markdown.` leaves the room ADR-0015 will want. Flat was porthole's past, not its grammar.

The description text ships as built — promise, boundary, known-limit, in three honest sentences; the repetition of "follow VS Code's theme" is clarity, not redundancy, because it answers two different worries with one consistent truth. *Confidence*: 0.8. *If wrong*: values are the fossil here, and `auto`/`light`/`dark` are the three words no future regrets; the key's group could migrate in a minor version if the settings taxonomy ever reorganizes — cheap, unlike values.

**ANS:** (by Jérémie Lumbroso)
Thanks to the naming review for the strong and detailed epistemic justification for the name. Approving Option A exactly as recommended.

---

### QST-CHECK-MD-COLORS: Do Porthole's Markdown windows change color, and only they?
- Status: answered
- Why asking: **What this finds out.** The whole feature rests on one stylesheet rule recognizing which preview is in a Porthole window, and on VS Code reloading that stylesheet when Porthole rewrites it. Both are read in source, never run; only a real VS Code shows colors. It also checks the promise in the setting's description: an ordinary Markdown preview must not change. Nothing here changes anything you would want to keep; the last step puts the setting back.
- Need: pick a letter (or override — any shape answers). About three minutes. A screenshot after step 4 would help.

**Where to do this.** In **your porthole workspace window**: the VS Code window in which the folder `porthole` is open, whose title bar ends with `porthole`. Not in any debug window (none titled `[Extension Development Host]`). Porthole 0.2.1 is already installed there; it is not published yet.

**Before you start.** In that window, run **Developer: Reload Window** (Shift+Cmd+P, type `Reload Window`, press Enter). Note whether VS Code's theme is currently **dark** or **light**; the steps below assume dark and say what to swap if yours is light.

**Steps.** One action each. "The Explorer" is the file list in the left side bar (Shift+Cmd+E). "The source tab" is the ordinary editor tab showing a file's text.

1. **Set the setting to light.** Press Cmd+, (Settings). In the search box at the top, type `porthole.markdown.colorScheme`. In the drop-down that appears under "Porthole › Markdown: Color Scheme", choose **light**. Close the Settings tab. *(If your theme is light, choose **dark** here and in step 4 expect dark colors.)*
2. **Pop out a Markdown file.** In the Explorer, click `README.md`, then press **Ctrl+Alt+M**. The floating window should show the README with a **white background and dark text**, while the rest of VS Code stays dark.
3. **Open VS Code's own preview, docked.** Click into the `README.md` source tab, then press **Shift+Cmd+V** (VS Code's "Markdown: Open Preview"). A preview opens as a tab in the main window. It shows the same file, so it may also turn light; that is expected and is not what this step tests. Close that preview tab.
4. **Check another file stays dark.** In the Explorer, click `CHANGELOG.md`, click into its source tab, and press **Shift+Cmd+V**. This docked preview of a *different* file should stay **dark**, like VS Code. Close it.
5. **Change the setting while the floating window is open.** Open Settings again (Cmd+,), search `porthole.markdown.colorScheme`, and choose **dark**. Within a second or two, the README floating window should turn **dark**.
6. **Put it back.** In the same place, choose **auto**. The floating window should follow VS Code's theme again. Close the Settings tab and the floating window.

Options:
- **A — all as described**: light in step 2, the other file's docked preview dark in step 4, dark in step 5, back to VS Code's theme in step 6.
- **B — the floating window never changed color.**
- **C — it changed, but too widely**: in step 4, the preview of `CHANGELOG.md` also turned light.
- **D — it changed only after closing and reopening the floating window**, not live in step 5.
- **E — something else**: say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**A — all as described** (a prediction). *Rationale*: the stylesheet route and the source tag are read in the Markdown extension's source at 1.141.0 (`documentRenderer.ts` L86–117 and its `#getStyles`), `:has()` is supported by the Chromium inside VS Code, and the rule-writing is covered by seven tests (`src/test/markdownColors.test.ts`). *Confidence*: 0.5 — because two links have never run: whether VS Code reloads a contributed stylesheet after it is rewritten (it may cache the file), and whether the rule matches the page's real tag text. *If wrong*: B means the rule does not match or the file is not reloaded, and the fallback is to name the stylesheet differently each time it is written; C means the selector is too broad; D means the refresh does not reload styles, and Porthole must reopen the window instead.

**ANS:** (by Jérémie Lumbroso)
**Option A.** Exactly as described/predicted.

Screenshots for the record:
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.48.57 AM-close-up.png` close-up of the settings with menu open and all options displayed, the default is selected, "auto"
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.49.06 AM.png` user settings page searching for "`porthole.markdown.colorS`" changed to "light"
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.49.26 AM.png` "Light" Markdown floating window
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.51.26 AM.png` "Light" forced Markdown floating window means that the rendered tab (of the source tab) displays with the same formatting, here "Light" (despite the "auto" 
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.52.13 AM.png` as predicted, opening other Markdown pages is not affected by the changes in formatting injected in the preview of the floating window; here, the rendered tab for `CHANGELOG.md` is in "dark" (= "auto"?) mode, despite both the floating window and rendered tab version of `README.md` is "light", again, as predicted
- See: `docs/adr/attachments/screenshots/2026-10-13-additional-tests/Screenshot 2026-10-14 at 11.53.00 AM.png` I've confirmed that explicitly setting "dark" also works, and that the change is propagated within 0-2s to an existing floating window

This was also exceptionally described, I was able to follow, pace and remember the semantics behind this manipulation/experiment extremely well! Thank you Glazier 5.5!

---

## Decision

### Chosen: ship 0.2.1 as built

The names stand as the naming review ruled and Jérémie approved (QST-NAME-MD-COLORS, A): `porthole.markdown.colorScheme`, values `auto`, `light`, `dark`, default `auto`. The hand check passed in full on macOS with VS Code 1.141.0 (QST-CHECK-MD-COLORS, A): light and dark both apply, a docked preview of another file keeps VS Code's theme, and a change reaches an open floating window within about two seconds. That settles the two links never run before: VS Code reloads the rewritten stylesheet, and the rule matches the real preview page.

**Observed, and now stated in the README and CHANGELOG**: a docked preview of the *same* file takes the same colors while that file is popped out (screenshot 11.51.26), because the rule selects by file. Step 3 of the check predicted it; the setting's description, approved word for word, says "Other Markdown previews", which still reads true of other files.

---

## Action Items

- [x] Rule on the names — Owner: the naming review (2026-10-14: A confirmed, with per-value descriptions; `auto` reads "Follow VS Code's theme.", applied)
- [x] Run the check — Owner: Jérémie (2026-10-14: A, six screenshots)
- [ ] Apply the ruling, update README and CHANGELOG, publish 0.2.1, install it — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-14)
- Trigger: Jérémie asked for 0.2.1 with this setting
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft, with the feature built
- Outcome: `Draft`

### Iteration 2 (2026-10-14)
- Trigger: Jérémie answered both questions (A and A)
- Contributors: Jérémie Lumbroso, the naming review, Glazier 5.5 (Claude Opus 5.5)
- Changes: decision recorded; README and CHANGELOG state the same-file case
- Outcome: `Accepted`

---

## Links

- Related: [ADR-0015](0015-markdown-in-a-floating-window.md) (Markdown as VS Code's preview), [ADR-0021](0021-names-for-0-2-0-and-the-outside-links-settings.md) (the previous naming pass)
- Code: `src/markdownColors.ts`, `media/markdown-color-scheme.css`, `package.json` (`markdown.previewStyles`, `porthole.markdown.colorScheme`)
