# Version floor: which VS Code can porthole run on, and how we know

- **Written by**: Purser 5.5 (Claude Sonnet 5.5), 2026-10-13
- **Answers**: Jérémie's request to confirm the 1.134.0 floor and to say, precisely and with
  its epistemic status, what porthole depends on that forces that number.
- **Question it feeds**: `QST-ENGINES-FLOOR` in [ADR-0011](../adr/0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md).
- **Method, reproducible**: [`scripts/ephemeral/2026-10-13-version-floor-check.sh`](../../scripts/ephemeral/2026-10-13-version-floor-check.sh)
  greps release tags of a local clone of `microsoft/vscode`. The tags read were 1.130.0,
  1.131.0, 1.132.0, 1.133.0, 1.134.0 and 1.141.0. The earlier source check by Surveyor
  ([`docs/reviews/2026-10-12-design-brief-source-check.md`](../reviews/2026-10-12-design-brief-source-check.md),
  "Version floor") is the starting point; this document re-reads it and narrows it.

## The answer in three sentences

1. **1.134.0 is the lowest VS Code release in which porthole's primary path can work**, and
   it is the lowest because it is the first release whose integrated browser is registered
   for local `.html` / `.htm` files. Tags 1.131.0, 1.132.0 and 1.133.0 were read and do not
   have that registration; 1.130.0 does not either.
2. **Run evidence, as of 2026-10-13.** The call was proven five runs out of five on
   VS Code 1.141.0 ([ADR-0003](../adr/0003-spike-0-does-the-one-shot-call-hold.md)) and 15 pop-outs
   without fallback in daily use ([ADR-0010](../adr/0010-first-hands-on-test-of-porthole-0-1-0.md)).
   On 1.134.0 the author installed the rebuilt `.vsix` and reported "Can confirm 1.134.0
   works. Just tried it out. Flawless." That is **use on 1.134.0**, not a recorded Spike 0:
   it is not known which steps were repeated. Versions 1.135 to 1.140 were read by Surveyor (see below), not run.
3. **`package.json` says `^1.134.0`** (changed on 2026-10-13, after the author chose to claim
   the source's floor and then ran it there). The edges of the claim are therefore both
   exercised; the middle is not (see "What the listing may claim").
4. *Before the 1.134.0 run, this document said "nothing below 1.141.0 has ever been run" and
   recommended keeping `^1.141.0`. That was true when written and is superseded by point 2.*

## What porthole depends on

Every row was looked up by name in the source at each tag. A count above 0 means the
identifier appears under the stated path; it does not mean the behavior is unchanged.

| What porthole relies on | Where porthole uses it | Present at 1.130.0 | 1.134.0 | 1.141.0 |
| --- | --- | --- | --- | --- |
| Command `_workbench.openWith` (internal; id defined in `browser/parts/editor/editorCommands.ts`, L121, registered L544) | `src/miniWindow.ts` L58 | yes | yes | yes |
| Command `vscode.openWith` (public alias, the fallback path) | `src/miniWindow.ts` L80 | yes | yes | yes |
| Editor id `workbench.editor.browser` (`contrib/browserView/common/browserView.ts` L185) | `src/miniWindow.ts` L8 | yes | yes | yes |
| Group id `AUX_WINDOW_GROUP = -3` (`services/editor/common/editorService.ts` L34) | `src/miniWindow.ts` L9 | yes | yes | yes |
| Auxiliary-window options `bounds`, `compact`, `alwaysOnTop` (`createAuxiliaryEditorPart`, `services/editor/common/editorGroupsService.ts` L676 at 1.134.0) | `src/miniWindow.ts` L21–24 | yes | yes | yes |
| Commands `restoreEditorsToMainWindow`, `toggleWindowAlwaysOnTop`, `enableWindowAlwaysOnTop`, `enableCompactAuxiliaryWindow`, `moveEditorToNewWindow`, `lockEditorGroup` | `src/commands.ts`, `src/miniWindow.ts` | yes (each) | yes | yes |
| Context key `isAuxiliaryWindowFocusedContext` | `package.json` menus and keybindings | yes | yes | yes |
| **The integrated browser is registered for local `.html` / `.htm`** (`contrib/browserView/electron-browser/browserView.contribution.ts`, loop over extensions at L108) | the whole product: the page is a file | **no** | **yes** | yes (L111, plus `mhtml`, `mht`) |
| **`associatedResource` on the browser editor input** (the link between a file and its browser tab) | the file route; dock back and re-open for resize | **no** (0 matches) | **yes** (51) | yes (51) |
| **Setting `workbench.browser.autoReloadOnFileChange`** (default `true`; `features/browserAutoReloadFeatures.ts` L32) | the promise that the page stays live when the file changes | **no** | **yes** | yes |

The three bold rows are the ones that set the floor. Everything else porthole uses was
already present at 1.130.0.

**Why this matters for the fallback too.** The public-command fallback (`vscode.openWith`
into the browser editor, then `moveEditorToNewWindow`) still needs the browser to be
registered for `.html`. Below 1.134.0 porthole does **not** fail, which is worse: Surveyor
traced it (`docs/reviews/2026-10-13-version-floor-and-readme-check.md`, section 3) and the
resolver finds no browser editor for a `file:` resource, the editor service falls back to the
**text editor**, and the group finder still creates the floating window with our bounds,
compact and pinned. porthole would open the file as text in the floating window and report
success. (Read, not run. No user reaches it, because `engines` blocks installs below 1.134.0;
it is the shape a future break could take, so Glazier has been sent a suggestion to check the
opened tab's type after the open. I had first written that porthole would fail, and attributed
that to Surveyor; they corrected it.)

**Why 1.141.0's extra extensions do not raise the floor.** 1.137.0 adds `.mhtml` and
`.mht`. porthole's menus and keybinding match only `.html` / `.htm`
(`resourceExtname =~ /^\.html?$/i` in `package.json`), so it does not use them.

## What we know, how we know it, and what we do not know

| Statement | Basis | Strength |
| --- | --- | --- |
| Porthole works on 1.141.0 | **Run**: Spike 0, five of five; fifteen pop-outs in daily use | Observed |
| The HTML registration is absent in 1.130.0 through 1.133.0 and present in 1.134.0 | **Read**: the loop is absent in four tags and present in the fifth | Read in source; unambiguous |
| The identifiers porthole calls exist at 1.134.0 | **Read**: grep by name | Names only |
| The internal call behaves at 1.134.0 as it does at 1.141.0 | **Read**: the `_workbench.openWith` handler file differs between the two tags by one import line; the `createAuxiliaryEditorPart` options are unchanged | Strongly suggests it, does not prove it |
| The browser editor itself behaves the same at 1.134.0 as at 1.141.0 | **Read by Surveyor** (not by me), file by file by blob id across all eight tags 1.134.0 to 1.141.0: the editor service, group finder, auxiliary window and part, `browserEditor.ts` (the toolbar), the navigation and auto-reload features and `menubar.ts` are identical at every tag. The 34-file, +2,350/-790 line change I counted earlier is elsewhere: nothing on porthole's path | Strong for the path read; not a run |
| Anything about 1.135.0 through 1.140.x | **Read by Surveyor**: the same comparison covered every tag in the range | Read, not run |
| Anything about patch releases (for example 1.134.1) | **Not read** | Unknown, low risk |
| macOS pin behavior across Spaces and full-screen apps | Electron behavior, not in VS Code's source | Open since Surveyor's check |

So the sentence the project can defend today is:

> The source says porthole could work from VS Code 1.134.0 and nothing on its path changes
> up to 1.141.0. It has been run on VS Code 1.141.0 and used on 1.134.0.

## What the listing may claim

Three honest choices were offered, from most to least conservative. **Jérémie chose the second on 2026-10-13** (`QST-ENGINES-FLOOR`, answer B) and then ran porthole on 1.134.0, which makes the third partly true (used there, no recorded Spike 0). The listing therefore says "used on 1.134.0 and 1.141.0".

- **`engines.vscode: ^1.141.0`, listing says "tested on 1.141.0".** What is in the package now.
  Users on 1.134.0–1.140.x cannot install it, even if it would work for them.
- **`engines.vscode: ^1.134.0`, listing says "built for 1.134.0 and later, tested on 1.141.0".**
  The claim matches the source. Any user between the two versions is running something nobody
  has run. The cost is bug reports from versions we cannot reproduce without installing them.
- **Lower the floor only after running Spike 0 on 1.134.0** (it can be installed alongside,
  `spike/` is the by-hand check). Then the listing can say "tested on 1.134.0 and 1.141.0".

## What would change this document

- A VS Code release that changes `_workbench.openWith`, the editor id, group `-3`, or the
  auxiliary options. Re-run `scripts/ephemeral/2026-10-13-version-floor-check.sh` against the
  new tag, then Spike 0 by hand ([ADR-0003](../adr/0003-spike-0-does-the-one-shot-call-hold.md)).
- (Done 2026-10-13 by Surveyor: tags 1.135.0 to 1.140.0 read.) A *run* on a middle version is still absent.
- A real run on any version below 1.141.0.
