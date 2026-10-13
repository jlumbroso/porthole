# Version floor and README check: the 1.134.0 floor holds, the 1.135–1.140 gap is read, one statement of mine corrected

- **Date**: 2026-10-13, ~12:30 AM ET
- **By**: Surveyor 5.1 (Claude Fable 5.1)
- **For**: Purser 5.5's briefs `2026-10-13-0144-purser-to-surveyor-check-version-floor-and-readme-claims.md` and `2026-10-13-0352-…-adr-0011-answered-floor-check-now-matters.md`
- **Checks**: [`docs/release/VERSION-FLOOR.md`](../release/VERSION-FLOOR.md), [`README.md`](../../README.md), [`docs/MARKETPLACE-SKILL-FEEDBACK.md`](../MARKETPLACE-SKILL-FEEDBACK.md) §2.2–2.3
- **Source**: the shallow clone of `microsoft/vscode` at `~/Programming/_vscode-source/vscode`. I fetched tags 1.135.0 through 1.140.0 for this check; the clone now has every release tag from 1.130.0 to 1.141.0. Files are compared by blob id (`git rev-parse <tag>:<path>`), so "identical" below means byte-identical, not "the names still grep".

A verdict of *holds* means the cited source or record says what the document says. Nothing here is a run; the runs on record are ADR-0003 and ADR-0010 on 1.141.0 and Jérémie's use on 1.134.0 ("Flawless", ADR-0011 Decision item 3).

## TL;DR

1. **VERSION-FLOOR.md's evidence table is right.** The three bold rows set the floor and nothing else porthole uses is newer than 1.130.0. One precision: `.mhtml`/`.mht` arrive at **1.137.0**, not 1.141.0.
2. **The gap is closed by reading.** Every file between porthole's call and the window is identical from 1.134.0 to 1.141.0 except four small changes, none on porthole's path. The toolbar, the auto-reload default, the menu-bar Cmd+V limit and the Ctrl-chord limit are the same at every tag. "1.135 to 1.140 are neither read nor run" can become "read, not run" in the README, ADR-0011 and VERSION-FLOOR.md.
3. **The statement Purser attributed to me is wrong in one important way, and the error is mine.** Below 1.134.0 porthole does not fail. It opens the HTML file **as text** in a compact, pinned floating window at the preset size, and reports success. No user can reach that today (`engines` blocks the install), but it is the shape porthole would take if a future VS Code dropped the registration. A cheap check goes to Glazier.
4. **README**: every traceable claim holds. One sentence is now out of date (item 2), and VERSION-FLOOR.md contradicts itself once (section 4).
5. **vsce 4.0.0**: both of Purser's readings hold. I ran the secret scanner on dummy shapes: GitHub and Slack tokens and a `.env` file are caught; **an Azure DevOps PAT passes through undetected**, in both the 52-character and the 84-character shape and in a basic-auth URL.

## 1. The evidence table

| Row in VERSION-FLOOR.md | Checked | Verdict |
| --- | --- | --- |
| HTML registration: absent 1.130.0–1.133.0, loop at `electron-browser/browserView.contribution.ts` L108 at 1.134.0 | Loop at L108 at 1.134.0 (`['html', 'htm']`); L111 at 1.135.0 and 1.136.0 (same list); L111 at 1.137.0 onward with `'mhtml', 'mht'` added. My 2026-10-12 check read 1.130.0 as absent; Purser read 1.131.0–1.133.0 as absent | **Holds.** VERSION-FLOOR.md says 1.141.0 adds the two extra extensions; it is 1.137.0. Harmless, since porthole matches only `.html`/`.htm` |
| `associatedResource`: 0 at 1.130.0, 51 at 1.134.0 and 1.141.0 | 51 matches under `contrib/browserView` at every tag from 1.134.0 to 1.141.0 | **Holds** |
| `workbench.browser.autoReloadOnFileChange`, default `true` | `features/browserAutoReloadFeatures.ts` L328–330 at 1.134.0: `default: true`; the file is byte-identical through 1.141.0 | **Holds** |
| Everything else present at 1.130.0 | Consistent with my 2026-10-12 check (group `-3`, the three `auxiliary` fields, compact, always-on-top, the commands, the context key all read at 1.130.0). I did not re-run Purser's greps | **Holds**, on his counts and my earlier read |
| `_workbench.openWith` handler differs by one import line between 1.134.0 and 1.141.0 | `browser/parts/editor/editorCommands.ts` changes once, at 1.137.0: the `IMultiDiffEditorOptions` import moves from one module to another | **Holds** |
| `createAuxiliaryEditorPart` options unchanged | `services/editor/common/editorGroupsService.ts` changes once, at 1.135.0: an optional `supportsSplitting` on `IEditorDropTargetDelegate`, not on porthole's path | **Holds** |

## 2. The 1.134.0 → 1.141.0 gap, read at every tag

Blob identity across the eight tags 1.134.0, 1.135.0, …, 1.141.0 for the files porthole's behavior runs through:

| File (under `src/vs/`) | Role for porthole | Across the eight tags |
| --- | --- | --- |
| `workbench/browser/parts/editor/editorCommands.ts` | `_workbench.openWith` / `vscode.openWith` handler | one change (1.137.0): import moved |
| `workbench/services/editor/browser/editorService.ts`, `common/editorService.ts` | `openEditor`, group `-3` | identical |
| `workbench/services/editor/common/editorGroupFinder.ts` | `-3` → `createAuxiliaryEditorPart(options.auxiliary)`; the lock check Cycle Size relies on | identical |
| `workbench/services/editor/common/editorGroupsService.ts` | the `bounds`/`compact`/`alwaysOnTop` options | one change (1.135.0): unrelated optional field |
| `workbench/browser/parts/editor/auxiliaryEditorPart.ts`, `editorParts.ts`, `editorActions.ts` | the floating window and the public commands | identical |
| `workbench/services/auxiliaryWindow/browser/…` and `electron-browser/auxiliaryWindowService.ts` | window creation, compact, always-on-top | identical |
| `workbench/contrib/browserView/electron-browser/browserView.contribution.ts` | the `file:` → browser registration | two changes: 1.135.0 (`getOrCreateLazy` takes one data object; `associatedResource` becomes a field instead of a third argument, same value) and 1.137.0 (`mhtml`, `mht`) |
| `workbench/contrib/browserView/electron-browser/browserEditor.ts` | mounts the toolbar unconditionally (ADR-0003, QST-BROWSER-TOOLBAR) | identical |
| `…/features/browserNavigationFeatures.ts` | the toolbar widget | identical |
| `…/features/browserAutoReloadFeatures.ts` | auto-reload, default `true` | identical |
| `platform/menubar/electron-main/menubar.ts` | the Cmd+V limit (ADR-0010, QST-PASTE) | identical |
| `platform/browserView/electron-browser/preload-browserView.ts` | the Ctrl+A/Ctrl+E limit | identical 1.134.0–1.140.0; 1.141.0 adds an early return for the `Insert` and `Help` keys (L87–90), nothing about Cmd or Ctrl |

The 34 files that did change between 1.134.0 and 1.141.0 (about 2,350 added, 790 removed) are the browser editor input's label and title derivation, the common `browserView.ts` interfaces, the workbench service's internals, the renderer feature split into `webContentsViewHost.ts`, chat tools, the welcome page and their tests. Every `associatedResource` line in that diff is the data-shape move above; none changes what a `file:` resource becomes or how the window is created.

**Answer to Purser's item 2.** Nothing in the diff changes how a `file:` resource resolves into `workbench.editor.browser`, how the compact window shows the toolbar, or the auto-reload default. Jérémie's "flawless" on 1.134.0 is what the reading predicts. Patch releases (1.13x.1 and so on) are not read; they branch from the minor and the risk is low.

## 3. Purser's item 3: what happens below 1.134.0, corrected

On 2026-10-12 I wrote that at 1.130.0 "the one-shot call on a file would have found no editor with id `workbench.editor.browser` for a `file:` resource and the spike would have failed at resolve time". Purser read that as "porthole would fail rather than open a larger window". The first clause holds; the conclusion does not. Traced at tag 1.130.0:

1. `_workbench.openWith` opens `{ resource, options: { override: 'workbench.editor.browser', auxiliary } }` into group `-3`.
2. `editorResolverService.ts` `getEditor` (L514) is given an explicit id, so it searches every registered editor by id and applies `canSupportResource` (L532–539). The only registration with that id at 1.130.0 has `canSupportResource: scheme === vscodeBrowser` (`browserView.contribution.ts` L71). A `file:` URI matches nothing. With an explicit override and no editor, the resolver returns `ResolvedStatus.NONE` (L169–170).
3. `editorService.ts` L561–563, "Override is disabled or did not apply: fallback to default": the untyped input becomes a **text editor**. L566–568 then resolves the group from `preferredGroup` `-3`, and `editorGroupFinder.ts` L138–139 calls `createAuxiliaryEditorPart(options.auxiliary)` with porthole's bounds, compact and always-on-top.

So below the floor the primary call opens the HTML **source** in a compact, pinned floating window at the preset size. porthole's watcher sees a new tab group, logs `internal open: new window after N ms`, and never falls back. The fallback would do the same: `vscode.openWith` goes through the same resolver, then `moveEditorToNewWindow` moves the text tab.

What this means:

- "No degraded mode" is right in Purser's sense (no larger-window mode) and wrong in the sense that matters: the failure is silent and wrong-content, not an error.
- No user reaches it today. `engines.vscode: ^1.134.0` makes the Marketplace, Open VSX and `code --install-extension` refuse the package below the floor.
- It is the exact shape porthole would take if a future VS Code release dropped or gated the HTML registration, which is the class the gate cannot catch (CLAUDE.md, Fifth Directive). Today nothing gates it: the resolver contribution is registered unconditionally at `WorkbenchPhase.BlockStartup` (`browserView.contribution.ts` L150 at 1.141.0), and none of the fourteen `workbench.browser.*` settings is an enable switch.
- A cheap check makes the silent case loud: after the window opens, if the active tab of the new group has a `TabInputText` input for the file, the browser did not take it. Routed to Glazier as a suggestion, not a blocker.

## 4. README and VERSION-FLOOR.md claims

| Claim | Where it is backed | Verdict |
| --- | --- | --- |
| "five runs out of five" on 1.141.0 | ADR-0003 result table L219 | holds |
| "15 pop-outs, no fallback" | ADR-0010 L221 | holds |
| "reloads when the file changes (VS Code's own auto-reload)" | ADR-0003 L220 (load count rose ~0.4 s after the rewrite); default `true`, section 1 | holds |
| Known limits: Cmd+V in the floating window, Ctrl+A/Ctrl+E anywhere | ADR-0010 QST-PASTE answer; `menubar.ts` and the preload identical across the supported range (section 2), so the limits hold on every version the package installs on | holds |
| `porthole.useInternalCommand` turns the internal call off | `package.json` L183, `src/config.ts` L58, `src/commands.ts` L36 and L67; `src/test/commandSmoke.test.ts` L44–56 pins the key name after the rename | holds |
| "The output channel 'Porthole' says when the fallback ran" | `src/log.ts` L13 creates the channel; `src/miniWindow.ts` L62, L66 and L92 log the fallback's cause and result | holds |
| `Ctrl+Alt+M` (⌃⌥M), the title-bar icon, the Explorer entry, the command names | `package.json` L51–67 (titles), L88–97 (menus), L104–109 (keys; no `mac` variant, so the same chord) | holds |
| The floating window keeps its title bar and the browser's toolbar | ADR-0003 QST-BROWSER-TOOLBAR; `browserEditor.ts` identical across the range | holds |
| "1.134.0 or later. That is the first release whose integrated browser opens local HTML files" | section 1 | holds |
| "porthole has been run on 1.134.0 and on 1.141.0; the versions in between are neither read nor run" (README L53–54) | the first half holds; the second is now **out of date**: read, not run | update |
| VERSION-FLOOR.md L77–78, the blockquote "It has only been run on VS Code 1.141.0" | contradicts L22–23 and L82 of the same file (used on 1.134.0) | update |
| VERSION-FLOOR.md L71 and L93, ADR-0011 Decision item 3: "1.135 to 1.140 … not read" | superseded by section 2 | update |
| `@types/vscode: ~1.134.0` against `engines.vscode: ^1.134.0` | `@vscode/vsce/out/validation.js` L88 onward compares major and minor; types must not be newer than the engine; equal passes | holds |

Small: the floor script's header says its output feeds `docs/VERSION-FLOOR.md`; the document lives in `docs/release/`.

## 5. The two `@vscode/vsce` 4.0.0 claims

**§2.2, the secret scan.** Holds as read: `out/package.js` L1684–1730, `scanFilesForSecrets`. Three precisions from the source and one from a run:

- The scan skips `node_modules` paths and `.jpg/.jpeg/.png/.gif/.svg` files, and lints only the files going into the package, so with porthole's allowlist it reads five files.
- `--allow-package-all-secrets` switches off the secret rules but **not** the `.env` rule; that needs `--allow-package-env-file` separately (L1685–1689, L1721). Both exit the process with status 1 rather than throw.
- The rule set is secretlint's `preset-recommend` (1password, aws, azure, basicauth, filter-comments, gcp, github, linear, npm, openai, privatekey, sendgrid, shopify, slack) plus `no-dotenv`; the basic-auth rule is configured with `allowMessageIds: ["BasicAuth"]` (`out/secretLint.js` L50–52), which disables its one finding.
- **Ran** (`scripts/ephemeral/2026-10-13-vsce-secret-scan-probe.mjs`, which calls vsce's own `lintText` on dummy strings in memory):

  | Dummy shape | Result |
  | --- | --- |
  | GitHub classic `ghp_…` and fine-grained `github_pat_…` | flagged (`secretlint-rule-github`) |
  | Slack `xoxb-…` | flagged (`secretlint-rule-slack`) |
  | A file named `.env` with `FOO=bar` | flagged (`secretlint-rule-no-dotenv`) |
  | Azure DevOps PAT, 52 lowercase alphanumerics, after `VSCE_PAT=` | **passes** |
  | Azure DevOps PAT, 84 mixed-case alphanumerics | **passes** |
  | The same token as `https://user:<token>@dev.azure.com/…` | **passes** |

  So the one credential this release mints is the one the scan does not see. The answer to Purser's open item in §4 of the feedback is: no, and the skill's §IV (where the value may live) stays the only net for it.

**§2.3, relative links.** Holds as read: `guessBaseUrls` (`out/package.js` L703–731) reads `repository` and matches only GitHub and GitLab; for GitHub it rewrites relative links to `https://github.com/<project>/blob/HEAD/…` and images to `…/raw/HEAD/…` (`--githubBranch` replaces `HEAD`). The "Couldn't detect the repository" error is thrown only when no base URL exists (L587–590 for Markdown links, L605–606 for `<img>`/`<video>`). Anchors (`#install`) and absolute URLs are left alone. So for porthole, whose `repository` is a GitHub URL, the rewrite is silent and the links work the day the repo is public and 404 until then. Purser's reading is exact.

## 6. The support policy, from a verification standpoint

No hole in the listing's claims: by section 2, every claim is the same on every version the package installs on. The forward-looking hole is the one the README already names (L84–85, "until it is re-run on a version, that version is not claimed"), sharpened by section 3: when a VS Code release does break the path, the break may be silent. The tab check closes that.

## What I did not do

- No run below 1.141.0 by me; the 1.134.0 use is Jérémie's report.
- No reading of patch tags.
- The 1.130.0 trace in section 3 is read, not run; its one testable prediction (source text in a floating window) can be confirmed on any VS Code with the browser's HTML registration absent, which today means 1.133.0 or earlier.
