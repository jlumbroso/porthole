<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Floating windows across editor kinds and VS Code windows

- **Date**: 2026-10-18
- **Iteration**: 1
- **Status**: Partially Implemented
- **Deciders**: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Two bugs Jérémie found while staging the product page's screenshots taught us that VS Code treats a browser tab and a Markdown preview differently when one is opened again, and that every VS Code window runs its own copy of Porthole sharing one stylesheet; Porthole now decides itself what a second pop-out does, and the stylesheet records each window's files, both built and tested, waiting on a hand check.

---

## Originating Context

**Source**: Jérémie's answer to QST-SITE-SCREENSHOTS (ADR-0023, 2026-10-18), and his words in chat the same day:

> "When I trigger the 'pop out' event before, it seemed like it would just 'refocus' the existing window if there was one. Now it opens a second window." … "So the issue is not that there's a phantom retrigger, it's that when I exercise the trigger consecutively expecting the second to be idempotent it isn't."

and, from the ADR-0023 answer: "When I changed the setting from dark to light, I tried to refresh the floating window, because it did not spontaneously change (as I thought we had ascertained)." Then: "If you think you've caught a bug and it led you to understand VSCode internals and our architecture better, it definitely deserves some recording in our substrate!"

**Agency Grant**: fix both; record what we learned.

---

## Explicitation

**Finding 1 — a browser tab and a Markdown preview answer "open again" differently** (read at 1.141.0).

- The integrated browser's editor input declares `EditorInputCapabilities.ForceReveal`: *"the editor should be revealed when being opened if it is already opened in any editor group"* (`src/vs/workbench/contrib/browserView/common/browserEditorInput.ts` L214–216; `src/vs/workbench/common/editor.ts` L857–861). Opened again into a new floating window, VS Code moves the tab there and closes the empty old window. That is what ADR-0008's repeat-open run saw on 2026-10-17, three times, with HTML.
- The Markdown preview is a custom editor (`vscode.markdown.preview.editor`), and a custom editor's input declares only `Singleton` (*"can only be shown in one group and not be split"*), not `ForceReveal` (`src/vs/workbench/contrib/customEditor/browser/customEditorInput.ts` L157–165). Opened again into a new floating window, the preview opens there afresh and the old window stays: two windows of one document.
- So "Pop Out is idempotent" had only ever been true for HTML, by courtesy of VS Code. Porthole's own logs show one internal call per pop-out every time (no fallback, no retrigger), which is how the "phantom retrigger" hypothesis was ruled out before any code was read.

**Finding 2 — one stylesheet, many copies of Porthole.**

- Each VS Code window runs its own extension host, so its own copy of Porthole, which knows only its own floating windows. The Markdown colors live in one file in the extension's folder (`media/markdown-color-scheme.css`, ADR-0022), shared by all of them.
- Each copy rewrote the whole file from its own list. A window with no Markdown floating windows, rewriting for any reason (activation, a setting change), wiped the rules another window had written. The evidence was the installed file itself, read on 2026-10-18: `colorScheme is "light": nothing to override.`, written for zero files while `checklist.md` floated in the staging window.
- The setting can also differ per workspace: the staging workspace sets `porthole.markdown.colorScheme` in its `.code-workspace` file, so two windows can want different schemes at once.
- ADR-0022's hand check passed because it ran in one window. Sounder 6 had foreseen the clash: QST-SITE-SCREENSHOTS told Jérémie to close other Porthole Markdown windows "so they do not compete for the extension's shared color stylesheet".

**What was built** (commits `755cd77`, `5d2f0e9`; 65 tests; three regression tests, each failing on the old code):

1. **A second Pop Out of a file already floating brings that window forward**, where it is and at its size: the public `vscode.openWith` aimed at the window's own tab group (`viewColumn`), so VS Code shows the page there and focuses that window. A link with no size does the same. A re-open at a *new* size (Cycle Size, or a link with `width` and `height`) opens the new window and then closes the old one if VS Code left it open (`tabGroups.close`).
2. **The stylesheet records, in a comment, each window's scheme and files, keyed by its extension host's process id.** A window rewrites only its own entry, drops entries whose process has ended (`process.kill(pid, 0)`), and writes the rules of every entry. Two windows writing at once therefore write the same rules.

**Read, not run**: that `vscode.openWith` with a floating window's `viewColumn` reaches that window (the column-to-group mapping uses all editor groups in grid order, `editorGroupColumn.ts` L18–23, and so does the tab API's own `viewColumn`, `mainThreadEditorTabs.ts` L522); that the window then comes to the front on macOS; and that `markdown.preview.refresh` in one window is enough when the other window's file changed (each window refreshes its own previews on its own events).

**Known limit**: if two windows show the *same* Markdown file with different schemes, the later rule in the file wins in both.

**Confirm**: Jérémie, through the check below.

---

## Questions

### QST-CHECK-TWO-WINDOWS: With two VS Code windows open, does a second Pop Out bring the window forward, and do the colors follow the setting?
- Status: unanswered
- Why asking: **What this finds out.** Both fixes pass against a mocked VS Code, but three links have never run: that Porthole can bring an existing floating window forward by aiming VS Code's public open command at that window's group; that Cycle Size on Markdown now leaves one window, not two; and that the colors follow the setting in one VS Code window while another VS Code window is open and reloads. Only two real VS Code windows can show these. Each outcome below names what it would change. **Safe**: step 5 changes the staging workspace's own color setting and step 7 puts it back to **light**, as QST-SITE-SCREENSHOTS asked; your User settings are not touched. Porthole 0.3.0, with both fixes, is installed in your VS Code but not published.
- Need: pick a letter (or override — any shape answers). About five minutes.

**Where to do this.** Two VS Code windows:
- **Your porthole workspace window**: the folder `porthole` is open; its title bar ends with `porthole`.
- **The Porthole screenshot window**: the staged workspace from ADR-0023. If it is not open, open it from the integrated terminal of your porthole workspace window with `code --new-window ~/Programming/porthole/samples/site-capture/porthole-screenshot.code-workspace`; its title is **Porthole screenshot**.

No debug window (none titled `[Extension Development Host]`).

**Before you start.** Close every floating window. Then, in **each** of the two windows, run **Developer: Reload Window** (press **Shift+Cmd+P**, type `Reload Window`, press **Enter**), so both run the new build. "The Explorer" is the file list in a window's left side bar (**Shift+Cmd+E**).

**Steps.** One action each.

1. **Pop out the checklist.** In the Porthole screenshot window's Explorer, right-click `checklist.md` and choose **Pop Out to Floating Window**. A floating window shows the checklist with **light** colors (the workspace's setting).
2. **Pop it out again.** Click back into the Porthole screenshot window, right-click `checklist.md` in its Explorer again, and choose **Pop Out to Floating Window** again. **The same floating window should come forward; no second floating window should appear.** Note whether it stayed where it was.
3. **Cycle its size.** Click into the floating window. Press **Shift+Cmd+P**, type `Porthole: Cycle Window Size`, press **Enter**. The checklist should reappear in a larger floating window, and **only one** floating window of it should remain.
4. **Reload the other window.** Click into your porthole workspace window and run **Developer: Reload Window** there. (Before the fix, this reload could wipe the checklist's colors.)
5. **Change the staging workspace's setting to dark.** Back in the Porthole screenshot window, press **Cmd+,** (Settings), click the **Workspace** tab under the search box, type `porthole.markdown.colorScheme`, and choose **dark**. Within a second or two, the checklist's floating window should turn **dark**, without any refresh.
6. **Look at the main window.** The Porthole screenshot window itself should stay in its own theme throughout.
7. **Put it back.** In the same Workspace setting, choose **light**. The floating window should turn light again. Close the Settings tab and the floating window.

I read Porthole's logs in both windows afterwards ("brought it forward", "closed the earlier floating window"); nothing needs copying.

Options:
- **A — all as described**: one window in step 2, brought forward; one window after step 3; dark in step 5 within seconds, despite the reload in step 4; light again in step 7.
- **B — step 2 opened a second window again**: bringing the window forward does not work, and Porthole fell back to opening a new one.
- **C — step 2 left one window, but it did not come to the front** (it stayed behind the main window, or another app).
- **D — step 3 left two windows.**
- **E — step 5 did not turn the floating window dark**, or only after reopening it.
- **F — something else**: say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**A — all as described** (a prediction). *Rationale*: the column a tab group reports and the column `vscode.openWith` resolves are computed from the same list of groups in grid order (`mainThreadEditorTabs.ts` L522; `editorGroupColumn.ts` L18–23), so aiming at a floating window's column reaches that window; VS Code's own `tabGroups.close` closes a group in any window; and the stylesheet logic is covered by three tests, one of them replaying the 2026-10-18 failure. *Confidence*: 0.55 — because the column-to-window route has never run, and whether macOS brings that window in front of the main one is a separate fact. *If wrong*: B means the column does not reach a floating window, and the route must change (an internal command naming the group, read in source first); C means focus moved inside VS Code but the operating system did not raise the window, which may be the same limit as Spike 1's focus findings (ADR-0018); D means `tabGroups.close` failed on a floating window's group, which the log will say; E means the stylesheet logic still loses an entry, and the log and the installed file will show which window wrote last.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: Porthole decides what a second pop-out does; the shared stylesheet holds every window's entry

As built (Explicitation, "What was built"). The behavior follows Jérémie's answer to QST-REOPEN-SEMANTICS (ADR-0008): a repeat open refocuses, and the page follows its file.

---

## Action Items

- [x] Fix both, with regression tests — Owner: Glazier (2026-10-18, `755cd77`, `5d2f0e9`)
- [ ] Run the check — Owner: Jérémie
- [ ] Teach models the repeat-open contract in the skill for outside `open` — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-18)
- Trigger: Jérémie's two bugs, found while staging the product page's screenshots
- Contributors: Jérémie Lumbroso (found and described both), Sounder 6 (foresaw the stylesheet clash in QST-SITE-SCREENSHOTS), Glazier 5.5 (Claude Opus 5.5)
- Changes: both fixed; this record
- Outcome: `Partially Implemented` (built and installed locally; not run, not published)

---

## Links

- Related: [ADR-0007](0007-resize-by-re-opening-the-page-at-a-new-size.md) (resize by re-opening), [ADR-0008](0008-expose-a-vscode-link-handler-with-an-allowlist.md) (QST-REOPEN-SEMANTICS), [ADR-0015](0015-markdown-in-a-floating-window.md), [ADR-0022](0022-markdown-colors-in-floating-windows-0-2-1.md) (the stylesheet), [ADR-0023](0023-a-small-product-website-for-porthole.md) (QST-SITE-SCREENSHOTS)
- Code: `src/commands.ts` (`openNow`, `windowsShowing`), `src/markdownColors.ts` (`updateMarkdownColors`)
