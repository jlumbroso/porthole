# Source check: the design brief against VS Code 1.141.0

- **Date**: ~3:20 PM ET, 2026-10-12
- **Author**: Surveyor 5.1 (Claude Fable 5.1, orange `#F26B1D`)
- **Re**: `docs/inbox/2026-10-12-1845-glazier-founding-brief-independent-verifier.md`, first piece of work
- **Subject**: Which of the brief's factual claims about VS Code hold, with the lines actually read
- **Checked against**: a shallow clone of `microsoft/vscode` at tag `1.141.0`
  (commit `2a59476c9bfcb90b3ddc372c36762471b7dfad1c`), kept outside this repo at
  `~/Programming/_vscode-source/vscode`, with tags `1.130.0` and `1.134.0` fetched beside it.
  Every path below is relative to `src/vs/` in that clone; `L` numbers are at `1.141.0`
  unless another tag is named.

## Verdict

**No claim in the brief is wrong.** Every file-and-line citation in the building-blocks
table, the six steps of the one-shot chain and the design facts resolves to code that does
what the brief says. Three citations point a few lines away from the code they describe,
noted in the table. Four claims could not be checked from source, listed first below.
The section after that is the one the brief asked for and could not write itself: what the
source says that the brief does not, including one version floor the project should record.

A verdict of *holds* means the quoted code does what the brief says. It does not mean the
call has been run. Nothing here replaces Spike 0.

## Could not check (4)

| Claim | Why not | What would settle it |
| --- | --- | --- |
| On macOS the pin floats within the current Space but not over another app's full-screen window (brief marks this *inference*) | Electron and macOS behavior, not VS Code source. What the source settles: `setAlwaysOnTop(flag)` is called with no level argument (`platform/native/electron-main/nativeHostMainService.ts` L398–400), and `setVisibleOnAllWorkspaces` appears nowhere under `src/vs`. | Spike 0: pin, switch Spaces, put another app full-screen. |
| "HTML association reached Insiders on Aug 10, 2026 and ships in 1.141" and, in the table, the same feature cited to the 1.134 release notes | Dates and release notes are not in the source. The two statements also disagree with each other. What the source settles: see *Version floor* below — `.html`/`.htm` registration exists at `1.134.0`; `.mhtml`/`.mht` are added by `1.141.0`. | Nothing needed; use the version floor instead of the dates. |
| "about one release a week since August (1.134 to 1.141)" | Release cadence; not checkable from a shallow clone. | Not needed for the design. |
| "the docs say popups are blocked" (Route C) | A statement about the docs page, not the code. The code allows one popup per user gesture within one second (`platform/browserView/electron-main/browserView.ts` L553–567) and denies popups from unlisted views (L188–190). | Spike, Route C button. |

## What the brief did not ask

### Version floor: the file route needs at least 1.134.0

At tag `1.130.0` — the version this machine ran until 15:01 ET today —
`workbench/contrib/browserView/electron-browser/browserView.contribution.ts` registers the
browser only for `vscode-browser:/**` resources. There is no registration for `file:` HTML,
no `associatedResource` anywhere in `browserEditorInput.ts` (0 matches), and no
`workbench.browser.autoReloadOnFileChange` setting. The one-shot call on a file would have
found no editor with id `workbench.editor.browser` for a `file:` resource and the spike
would have failed at resolve time, while the floating-window machinery itself
(`AUX_WINDOW_GROUP`, the `auxiliary` options, compact, always-on-top, the proposed
`browser` API) already existed at 1.130.0.

At tag `1.134.0` the loop registers `['html', 'htm']` (L108), `associatedResource` exists
(14 matches) and auto-reload exists with `default: true` (L331). At `1.141.0` the loop is
`['html', 'htm', 'mhtml', 'mht']` (L111). I did not fetch the tags in between, so the
release that added `.mhtml`/`.mht` is unknown.

**Consequence**: ADR-0002 leaves `engines.vscode` to "the version Spike 0 passes on". The
source puts the honest floor for the file route at `1.134.0`, and for the brief's full
extension list at some tag ≤ `1.141.0`. The house floor `^1.85.0` would be wrong for
porthole by a wide margin.

### The machine

| | |
| --- | --- |
| `code --version` at 15:03 ET | `1.130.0`, commit `1b6a188…` (= tag `1.130.0`) |
| ShipIt update staged | 15:00–15:01 ET (`~/Library/Caches/com.microsoft.VSCode.ShipIt/`) |
| VS Code relaunched | 15:01:58 ET (process start time) |
| Bundle now | `1.141.0`, commit `2a59476c…` (= tag `1.141.0` exactly) |

Jérémie confirmed the update in-session. **No claim fails on the installed version**; the
cited lines are the installed code.

### Behavior the brief's design relies on, confirmed from source

1. **The three `auxiliary` fields are all honored at window creation**, not only
   `bounds`. Compact: `workbench/browser/parts/editor/auxiliaryEditorPart.ts` L130 and
   `workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts` L293. Always on
   top: passed as the window feature `window-always-on-top=yes` (same file L376), parsed in
   `platform/auxiliaryWindow/electron-main/auxiliaryWindowsMainService.ts` L137–138, applied
   as `options.alwaysOnTop = true` in `platform/windows/electron-main/windows.ts` L237–238.
2. **Partial bounds are completed sensibly.** With only `width`/`height` given, `x`/`y`
   center the window on the *active* window (`auxiliaryWindowService.ts` L350–351); the
   30-pixel offset applies only when no bounds are given (L356–364). Width and height are
   clamped to 400×270 for framed windows (L342–347), so `Math.max` in the brief's
   `auxOptions` duplicates what VS Code already does.
3. **`pinned: true` is already the default** of `_workbench.openWith`
   (`workbench/browser/parts/editor/editorCommands.ts` L551:
   `options: { pinned: true, ...optionsArg, override: id }`). Harmless to repeat.
4. **The URL route's `_workbench.open` only takes the editor-service path when options or a
   numeric column are given** (`editorCommands.ts` L468). The brief's call passes both;
   a call with a bare resource would go to the opener service instead. Keep the `[-3, …]`
   argument.
5. **"Re-opening a file moves its tab" rests on `preferredResource`.** The resolver's
   single-per-resource lookup compares `EditorResourceAccessor.getOriginalUri(editor)`
   (`workbench/services/editor/browser/editorResolverService.ts` L917), which returns the
   editor's `preferredResource` when it has one (`workbench/common/editor.ts` L1445–1446);
   `BrowserEditorInput.preferredResource` is `associatedResource ?? resource`
   (`workbench/contrib/browserView/common/browserEditorInput.ts` L222–224). So a tab opened
   through the resolver (which sets `associatedResource`, `browserView.contribution.ts`
   L130) is found and moved (`editorResolverService.ts` L889–895); a tab opened by
   **Open in Integrated Browser** is not, because that command opens a fresh
   `vscode-browser:` id with only `viewState.url` and no `associatedResource`
   (`features/browserTabManagementFeatures.ts` L390–391). This is the source-level answer
   to spike questions 4 and 6: move in the first case, a second tab in the second.
6. **An emptied floating window closes itself — if one setting is at its default.**
   `AuxiliaryEditorPartImpl.removeGroup` closes the window when the last group is removed
   (`auxiliaryEditorPart.ts` L399–406). A group is removed when it empties only if
   `workbench.editor.closeEmptyGroups` is true (`workbench/browser/parts/editor/editorGroupView.ts`
   L1617, L1988); its default is `true` (`workbench/browser/workbench.contribution.ts` L366).
   With that setting off, Cycle Size would leave an empty window behind. Spike question 5
   should be run with the human's real settings.
7. **The success check is sound.** `vscode.window.tabGroups` is fed from
   `editorGroupsService.groups`, which aggregates every part including floating ones, and
   rebuilds on `onDidAddGroup` (`workbench/api/browser/mainThreadEditorTabs.ts` L75, L518).
8. **The `when` clauses use real context keys.** `activeEditor` holds the editor pane id
   (`workbench/common/contextkeys.ts` L89) and the browser's own code compares it to
   `workbench.editor.browser` (`contrib/browserView/electron-browser/browserEditor.ts` L38:
   `BROWSER_EDITOR_ACTIVE = ContextKeyExpr.equals('activeEditor', BrowserEditorInput.EDITOR_ID)`).
   `isAuxiliaryWindowFocusedContext`, `isWindowAlwaysOnTop` and `isAuxiliaryWindow` are
   declared at `contextkeys.ts` L50, L52, L54 with exactly those spellings.
9. **Underscore commands are not filtered on execute.** The extension host sends any id it
   does not own to the main thread (`workbench/api/common/extHostCommands.ts` L180 onward);
   the only underscore check in that file is the `getCommands(true)` filter (L324–328).
   The main thread runs whatever is registered (`workbench/api/browser/mainThreadCommands.ts`
   L81–93).
10. **Route C's popup opens compact but not pinned**, and its bounds come from Electron's
    parsed `window.open` features (`platform/browserView/electron-main/browserView.ts`
    L217–223 → `contrib/browserView/electron-browser/browserViewWorkbenchService.ts`
    L565–567: `{ bounds: options.auxiliaryWindow, compact: true }`). The brief says "you
    then click the pin"; that is right.
11. **Nothing gates the integrated browser** behind a setting or experiment: the
    contribution is imported unconditionally in `workbench/workbench.desktop.main.ts` L177.
    It is desktop-only; the web build imports a different contribution (`workbench.web.main.ts`
    L191). The settings that exist at 1.141.0 under `workbench.browser.*`:
    `autoReloadOnFileChange`, `dataStorage`, `enableChatTools`, `enableRemoteProxy`,
    `favorites`, `maxHistoryEntries`, `newTabPlacement`, `openLocalhostLinks`, `pageZoom`,
    `reloadMenu`, `searchEngine`, `showInTitleBar`, `toggleAutoReload`.
12. **The proposed-API gate is code, not policy.** Any extension named by
    `--enable-proposed-api` (or all, with the bare flag) keeps its proposals
    (`workbench/services/extensions/common/extensionsProposedApi.ts` L104–108); otherwise
    its proposals are nulled with a logged error (L110–114). The argv.json key
    `enable-proposed-api` is in the schema (`workbench/electron-browser/desktop.contribution.ts`
    L442). The docs' "Insiders-only" is a statement of support, not a check in the build.
13. **"Nothing resizes an existing floating window" holds for what an extension can reach.**
    The renderer's `AuxiliaryWindow.setBounds` (`auxiliaryWindowService.ts` L144–147) and the
    main process's `positionWindow` (`nativeHostMainService.ts` L402) exist but no command
    exposes them.
14. **`code --open-url`** is a real CLI flag (`platform/environment/node/argv.ts` L200).

## Claims that hold

### Building blocks (brief's table)

| Row | Verdict | Evidence @1.141.0 |
| --- | --- | --- |
| `workbench.action.browser.openFile` | holds | `features/browserTabManagementFeatures.ts` L340–392: `OpenFileInIntegratedBrowserAction`, id `BrowserViewCommandId.OpenFile`, precondition `file` scheme + `/\.(?:html?\|mht(?:ml)?)$/i`, menus Explorer/EditorTitle/EditorTitleContext |
| Editor id `workbench.editor.browser` | holds | `contrib/browserView/common/browserView.ts` L206 `BrowserViewEditorId = 'workbench.editor.browser'`; pane registered under the same id, `browserView.contribution.ts` L49–58 |
| `workbench.action.browser.open` with string or `{ url, openToSide, reuseUrlFilter }` | holds | `browserTabManagementFeatures.ts` L261–271 `IOpenBrowserOptions`; used at L292–299 |
| `workbench.browser.autoReloadOnFileChange`, default on | holds | `features/browserAutoReloadFeatures.ts` L329–335, `default: true` |
| `workbench.browser.pageZoom`; `zoomIn`/`zoomOut`/`resetZoom` | holds (ids), release-note date not checked | setting id present in the contrib; `browserView.ts` L472–474, L906 |
| `workbench.browser.newTabPlacement: "window"` | holds | `browserTabManagementFeatures.ts` L933–945, enum `['activeGroup','sideGroup','window']`, default `activeGroup` (brief cites L935) |
| `workbench.action.moveEditorToNewWindow` | holds | `editorCommands.ts` L103 |
| `workbench.action.enableCompactAuxiliaryWindow` + disable/toggle | holds | `auxiliaryEditorPart.ts` L71 (enable), L54 (toggle), L92 (disable) |
| `workbench.action.enableWindowAlwaysOnTop` + disable/`toggleWindowAlwaysOnTop` | holds | `workbench/electron-browser/actions/windowActions.ts` L519 (enable), L494 (toggle), L549 (disable) |
| `workbench.action.restoreEditorsToMainWindow` | holds | `editorActions.ts` L2737; precondition `IsAuxiliaryWindowFocusedContext` L2743 |
| `workbench.action.lockEditorGroup` | holds | `editorCommands.ts` L65 |
| Page-initiated pop-out via `window.open(…, 'popup,…')` | holds | `platform/browserView/electron-main/browserView.ts` L187 (`setWindowOpenHandler`), L192–196 (`new-window` disposition), L553–567 (one per gesture per second); `browserViewWorkbenchService.ts` L565–567 (compact) |
| Proposed `browser` API: `activeBrowserTab`, `openBrowserTab`, `BrowserTab.close()` | holds | `vscode-dts/vscode.proposed.browser.d.ts` L75, L90, L27 |
| `window.registerUriHandler`, topmost window handles the link | holds | `vscode-dts/vscode.d.ts` L11707 (comment), L11727 (declaration) |

### How the one-shot call resolves (brief's six steps)

| Step | Verdict | Evidence @1.141.0 |
| --- | --- | --- |
| 1. `_workbench.openWith` passes options through and the column to `columnToEditorGroup` | holds; registered at L543, body at L551 (brief says L544) | `editorCommands.ts` L543–552: `{ pinned: true, ...optionsArg, override: id }`, `columnToEditorGroup(…, columnArg)` |
| 2. `columnToEditorGroup` lets `-3` through; `-3` is `AUX_WINDOW_GROUP` | holds | `services/editor/common/editorGroupColumn.ts` L19–21; `services/editor/common/editorService.ts` L34 |
| 3. For that group a floating window is created from `options.auxiliary`, fields `bounds`, `compact`, `alwaysOnTop` | holds | `services/editor/common/editorGroupFinder.ts` L138–141 (`createAuxiliaryEditorPart(options?.auxiliary)`, `options = input.options` L104); `platform/editor/common/editor.ts` L317–336 inside `IEditorOptions` (L187); same three fields in `editorGroupsService.ts` L681 |
| 4. Browser registers as optional editor for `.html .htm .mhtml .mht` under that id | holds | `browserView.contribution.ts` L111–145: glob `file:/**/*.<ext>`, `RegisteredEditorPriority.option`, `singlePerResource: true`, `associatedResource: resource` |
| 5. Extensions may run underscore commands; underscores only hide from `getCommands(true)` | holds | `mainThreadCommands.ts` L81–93 (`$executeCommand` → `commandService.executeCommand(id)`); `extHostCommands.ts` L324–328 |
| 6. Public `vscode.openWith` maps every column except positive ones and `Beside` to the active group | holds | `workbench/api/common/extHostTypeConverters.ts` L336–347; `extHostApiCommands.ts` L443–453 |

Not in the brief's six steps but on the same path, and confirmed: the finder is invoked from
`editorService.openEditor` with the untyped input that carries `options`
(`services/editor/browser/editorService.ts` L573), so `auxiliary` reaches step 3.

### Facts that shape the design

| Fact | Verdict | Evidence @1.141.0 |
| --- | --- | --- |
| Only floating windows can be pinned; all three actions return early on the main window | holds | `windowActions.ts` L509–511, L539–541, L569–571 |
| Move into New Window opens at 1024×768, centered on the current window | holds | `platform/window/common/window.ts` L573 `DEFAULT_AUX_WINDOW_SIZE`; centering on the *active* window `auxiliaryWindowService.ts` L332–351 |
| A framed window can't go below 400×270 | holds | `window.ts` L23–27 `WindowMinimumSize`; applied `auxiliaryWindowService.ts` L342–347 (framed only) |
| Nothing resizes an existing floating window; re-opening moves the tab (single per resource) | holds, see note 13 above | `editorResolverService.ts` L838–849 |
| Compact mode switches off when a second group or tab enters | holds | `auxiliaryEditorPart.ts` L308–321 |
| Floating windows survive restarts with bounds, zoom, compact; and their pin | holds | `services/auxiliaryWindow/browser/auxiliaryWindowService.ts` L229–240 `createState()`; `…/electron-browser/auxiliaryWindowService.ts` L132–141 adds `alwaysOnTop` |
| Pinning is a plain Electron `setAlwaysOnTop` with no all-Spaces flag | holds | `nativeHostMainService.ts` L398–400; no `setVisibleOnAllWorkspaces` under `src/vs` |
| Extensions can't read a browser tab's URL; the tab arrives as `UnknownInput` | holds; the line a browser tab actually reaches is L225 (L143 is the side-by-side fallback) | `mainThreadEditorTabs.ts` L120–225: no branch for `BrowserEditorInput` |
| Globe-opened tabs don't record their source file; resolver-opened tabs do | holds | `browserTabManagementFeatures.ts` L390–391 vs `browserView.contribution.ts` L130; `browserEditorInput.ts` L222–224 |
| Dock back merges only the focused floating window | holds | `editorParts.ts` L874–876 `mergeAllGroups` → `this.activePart.mergeAllGroups(target)` |
| Proposed API admitted by `--enable-proposed-api` / `argv.json` on any build | holds | `extensionsProposedApi.ts` L104–108; `desktop.contribution.ts` L442 |

## For Spike 0

Nothing above changes the spike's six questions. From source, the expected answers are:
compact and pinned at the requested size (notes 1–2); reload on save (auto-reload default
on); a new tab group visible to `tabGroups` (note 7); the tab *moves* on a second run of
the same file but a globe-opened tab *duplicates* (note 5); the emptied window closes
unless `workbench.editor.closeEmptyGroups` is off (note 6). The macOS Spaces behavior is
the one answer only the machine can give.

## Method notes, for catchability

- Lines were read with `sed -n` on the clone, not through GitHub's renderer; tags were
  resolved with `git rev-parse` (`1.141.0` → `2a59476c`, `1.130.0` → `1b6a188`).
- Version comparisons used `git show <tag>:<path>` on tags `1.130.0`, `1.134.0`, `1.141.0`.
  No tag between 1.134 and 1.141 was fetched.
- I read ADR-0001 and ADR-0002 before finishing this list. The founding brief asked me to
  form the list first; `CLAUDE.md` loads automatically and already named the three
  identifiers to doubt, so full independence was not available. Nothing in the "did not
  ask" list above came from either ADR.
