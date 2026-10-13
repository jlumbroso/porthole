# Terminology index: every user-facing word, and where the words disagree

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13
- **Purpose**: one place that lists each user-facing term porthole uses, where, and how many
  times, so the words can be put through a naming review and then changed in one pass. It is
  an inventory with observations. It decides nothing; the "My lean" column is a starting
  point for the review, not a ruling.
- **Not covered**: the founding brief (`docs/INITIAL-DESIGN-BRIEF.md`) still says "Mini
  Browser", `jlumbroso.mini-browser` and `miniBrowser.*`. That is deliberate and recorded
  (`CLAUDE.md`, "Project-Specific Notes"); the brief is not edited.
- **Counts** are case-insensitive line counts across `README.md`, `package.json`,
  `CHANGELOG.md` and `src/*.ts` at commit `0ef1287`. They show where a word lives, not
  how important it is.

## 1. The surfaces a user reads

| Surface | Where it lives | Strings |
| --- | --- | --- |
| Extension name | `package.json` `displayName`; id `jlumbroso.porthole` | "Porthole" |
| One-line description (Marketplace subtitle) | `package.json` `description` | "Pop the HTML page you are looking at into a small floating window: only the rendered page, pinned above your other windows." |
| Command titles (palette shows "Porthole: …") | `package.json` `contributes.commands` | "Pop Out to Mini Window", "Dock Back into Main Window", "Cycle Mini Window Size", "Toggle Always on Top" |
| Menus | `package.json` `menus` | Editor title bar button (icon only), Explorer right-click: "Pop Out to Mini Window" |
| Settings page heading | `package.json` `configuration.title` | "Porthole" |
| Setting descriptions | `package.json` | `sizes`: "Size presets for the mini window… **Cycle Mini Window Size**… VS Code will not make a window smaller than 400×270." / `position`: "Where the mini window opens…" / `compact`: "Open the mini window in compact mode: no tabs, breadcrumbs or status bar." / `alwaysOnTop`: "Open the mini window pinned above other windows." / `useInternalApi`: "Open the mini window with one internal VS Code call, at the exact preset size…" |
| Notifications | `src/commands.ts` L51, L64, L68 | "Porthole: open or select a local HTML file first." / "Porthole: pop a page out first; this then steps through the size presets of the window Porthole opened." / "Porthole: size presets need the "porthole.useInternalApi" setting turned on." |
| Output channel | `src/log.ts` | "Porthole" |
| Keyboard shortcut | `package.json` `keybindings` | `Ctrl+Alt+M` (pop out, and dock back from the window itself) |
| README | `README.md` | the "Using it" table, "What it is for", "How it works", "Known limits" |
| Changelog | `CHANGELOG.md` | the 0.1.0 entry |
| Listing (not yet written) | Marketplace and Open VSX pages | will reuse the above; see `RELEASE-PLAN.md` |

## 2. One object, several names

The thing porthole makes (the small, compact, pinned window that shows a page) is called:

| Name | Count | Where |
| --- | --- | --- |
| **mini window** / **Mini Window** | README 6, package.json 8, CHANGELOG 4 (two more in code comments) | two command titles ("Pop Out to Mini Window", "Cycle Mini Window Size"), all five setting descriptions, the Explorer menu entry |
| **floating window** | README 4, package.json 1 (four more in code comments) | the one-line description, the README intro and "How it works" |
| **small window** | README 2 | the README intro |
| **the window**, **pop-out** | passim | prose |
| *auxiliary window* | not user-facing, appears in code | VS Code's internal name; the menu says "Move into New Window" |

**Why it matters:** the first sentence a stranger reads (the Marketplace subtitle) says
"floating window"; the menu item they click says "Mini Window"; the setting page says "mini
window" again. Nothing is wrong in any one place, but a reader has to work out that these
are one thing. The shortcut letter `M` and the legacy brief title "Mini Browser" are the
origin of "Mini"; the product is no longer a "browser".

| Candidate direction | What it would change | Trade-off |
| --- | --- | --- |
| Keep "mini window" everywhere | The description and README intro say "mini window" instead of "floating window" | Cheapest. "Mini" says nothing about floating or staying on top |
| Use "floating window" everywhere | Two command titles, the Explorer menu entry, five setting descriptions | Matches the description and the README intro. VS Code's own source comments say "floating windows" too, but it is developer vocabulary there, not a UI label. "Pop Out to Floating Window" is long |
| Name the object after the product ("a porthole") | "Pop Out" with the noun implied, or "Pop Out to Porthole" | Short and on theme; "Porthole: Pop Out to Porthole" repeats itself, and the noun may confuse a first-time reader |

My lean (for the review to overturn): one noun used everywhere, chosen for a stranger who has
never heard of the product; "floating window" is the one that already carries the meaning.

## 3. Pinned, always on top, pin

| Term | Count | Where |
| --- | --- | --- |
| **pinned** / **pin** | README 9, package.json 4, extension.ts 3, commands.ts 1 | description, README, the setting's prose |
| **Always on Top** | README 2, package.json 1, CHANGELOG 1 | command title "Toggle Always on Top" and the setting key `alwaysOnTop` |

VS Code's own command titles say **Always on Top**: "Toggle Window Always on Top" and "Turn On
Always on Top" (`electron-browser/actions/windowActions.ts` L499 and L524, tag 1.141.0).
"Pin" is the README's and ADRs' word (and the project-brief's), not a label read in VS Code's
command titles. The inconsistency is that the description promises "pinned above your other
windows" while the command that does it says "Always on Top". My lean: say "always on top" in
controls, so a user searching the palette for VS Code's own phrase finds it, and use "pinned"
only as explanatory prose, or pick one.

## 4. Pop out, dock back, put it back

| Term | Where |
| --- | --- |
| **Pop Out** (verb, title case) | command title and menu |
| **pop out / popped out / pop-out** (verb, noun) | README, notifications, CHANGELOG |
| **Dock Back into Main Window** | command title |
| **Put it back** | README "Using it" table |
| **dock back** (verb phrase) | README status note, CHANGELOG |

"Dock" is a metaphor VS Code itself uses ("Move into Main Window" is its closest command).
The README table's "Put it back" is a plain-language gloss for a command whose title says
"Dock Back"; a user searching the palette for "put back" finds nothing.

## 5. Size

| Term | Where |
| --- | --- |
| **size presets** / **presets** / **preset size** | setting descriptions, notifications, README |
| **Cycle Mini Window Size** | command title |
| `porthole.sizes` | setting key; presets are named S, M, L |
| **default size** | "VS Code's default size" for the fallback; "the first one" for porthole's |

Two senses of "default" collide: the first preset (porthole's default) and VS Code's own
default window size (what the fallback gives you). The README uses both in one section.

## 6. The page, the file

| Term | Where |
| --- | --- |
| **the HTML page you are looking at** | description |
| **page** | README, notifications ("pop a page out first") |
| **local HTML file** | notification ("open or select a local HTML file first") |
| **task page / task instructions** | README "What it is for" |

The user pops out a *file* but sees a *page*. The menus act on files (`.html`, `.htm`), the
messages talk about pages. Probably fine, but the "task instructions" framing in the README
is the project's origin story, not the only use; a stranger may not have "task instructions".

## 7. The word "internal"

| Term | Where |
| --- | --- |
| **internal call** | README (3), CHANGELOG, miniWindow.ts comments |
| **internal command** | package.json setting description ("one internal VS Code call") |
| **internal API** | the setting's key, `porthole.useInternalApi` |

VS Code has no internal *API* here: the thing used is an undocumented *command*
(`_workbench.openWith`), a different object with a different stability promise. The listing
must say plainly that porthole relies on it (ADR-0009). The setting key says "API" and the
prose says "call" or "command". A setting key cannot be renamed after release without a
migration, so this one is worth settling **before** 0.1.x goes public. (Code change: Glazier's.)

## 8. Words borrowed from VS Code, to use exactly

| Word | Where VS Code uses it | Porthole's usage |
| --- | --- | --- |
| **integrated browser** | the feature name, README | consistent (README only) |
| **compact** | window-toolbar "compact" icon; `enableCompactAuxiliaryWindow` | consistent; the README explains it as "no tabs, breadcrumbs or status bar" |
| **Move into New Window** | the tab context-menu entry | used in the "Try the idea today" section |

## 9. Open terms, one line each, for the review

1. What is the one noun for the window porthole makes? (section 2)
2. "Pinned" or "Always on Top" in controls and in prose? (section 3)
3. Does "Dock Back" stay, or does it become the README's own "Put back"? (section 4)
4. Is the object named after the product? (section 2, third row)
5. `useInternalApi`: should the key say what it is, a command? (section 7; has a migration cost)
6. The shortcut letter `M` and the legacy "Mini" origin: if the noun changes, does the key's
   mnemonic matter? (the chord cannot be assumed free on every platform either way)

## 10. How the answers get applied

The review returns a table of the form *term → decision → where*. Each row is then one edit to
the files in section 1, made by the code's owner for `package.json` and `src/`, and by Purser
for the README, changelog and listing copy. The gate then runs; `package.json` titles are
checked by the command-smoke test (every contributed command has a handler).
