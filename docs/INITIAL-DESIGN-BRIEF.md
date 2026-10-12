# Mini Browser for VS Code — Build Blueprint

Oct 12, 2026 · Prepared for @Jérémie Lumbroso by **Claude Opus 5.5**

## TL;DR

**Yes, it's buildable today, and VS Code already does most of the work.** Since 1.100, a floating editor window can run in compact mode (no tabs, breadcrumbs or status bar) and stay always on top. The integrated browser renders local `file://` HTML and reloads it when the file changes on disk.

The missing piece is a single call. There is no public API for "open in a new window", but VS Code's internal open command accepts that target plus size, compact and pin flags:

```ts
await vscode.commands.executeCommand(
  '_workbench.openWith',
  vscode.Uri.file('/path/to/tasks.html'),
  'workbench.editor.browser',               // the integrated browser's editor id
  [-3 /* AUX_WINDOW_GROUP */, {
    pinned: true,
    auxiliary: { bounds: { width: 420, height: 640 }, compact: true, alwaysOnTop: true }
  }]
);
```

I traced every step of that call through the 1.141.0 source (see Building blocks), but I have not run it. Claude Code's first job is a 15-minute spike that confirms it on your machine (see Build plan).

**Recommendation:** a small personal extension, "Mini Browser" (working name), built around that call. It adds a stable fallback, Dock back, size presets, and a `vscode://` link so Claude Code or a `just` recipe can pop a freshly written task page straight into the pinned window.

**Today, with no code:** right-click a browser tab, choose **Move into New Window**, then click the compact and pin icons in that window's title bar.

## What you asked for

The build should pass these five tests:

1. **One gesture** turns the HTML page you're looking at into a small window that shows only the rendered page: no tabs, sidebars or status bar. It works from the file and from a page already open in the integrated browser.
2. The window can be **pinned above other windows**, and unpinned.
3. It's **easy to put back** into the main window, and easy to resize to a preset.
4. The page **stays live**: it reloads when the file changes, and its checkboxes, buttons and stored state keep working.
5. *(My addition; drop it if unwanted.)* It can be **triggered from outside VS Code**, for example by Claude Code right after it writes a task page.

## Building blocks VS Code has today

Every piece below exists in VS Code 1.141.0, the current stable release (tagged Oct 6, 2026). Source links point to that tag; `main` on Oct 12 (1.143.0-dev, commit `c0f2e89`) has the same code. **Public** = documented. **Internal** = callable by extensions, undocumented, may change. **Proposed** = unstable API behind an opt-in flag.

| Building block | Identifier | Status | Evidence |
| --- | --- | --- | --- |
| Show a local HTML file in the integrated browser | `workbench.action.browser.openFile` (menu: Open in Integrated Browser) | Public UI; id internal | [docs](https://code.visualstudio.com/docs/debugtest/integrated-browser), [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts#L348) |
| Integrated browser as the editor for `.html .htm .mhtml .mht` | editor id `workbench.editor.browser`, for `vscode.openWith` and `workbench.editorAssociations` | Public mechanism; id from source | [registration](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/browserView.contribution.ts#L111), [id](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/common/browserView.ts#L206), [1.134 notes](https://code.visualstudio.com/updates/v1_134) |
| Open any URL in the browser | `workbench.action.browser.open` with a URL string or `{ url, openToSide, reuseUrlFilter }` | Internal arguments | [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts#L261) |
| Reload when the file changes on disk | `workbench.browser.autoReloadOnFileChange`, default on | Public | [docs](https://code.visualstudio.com/docs/debugtest/integrated-browser), [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/features/browserAutoReloadFeatures.ts#L331) |
| Page zoom separate from the UI | `workbench.browser.pageZoom`; `workbench.action.browser.zoomIn`, `zoomOut`, `resetZoom` | Public, since 1.112 | [1.112 notes](https://code.visualstudio.com/updates/v1_112) |
| New browser tabs open in their own window | `workbench.browser.newTabPlacement: "window"` | Public | [docs](https://code.visualstudio.com/docs/debugtest/integrated-browser), [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts#L935) |
| Move the active editor into a new window | `workbench.action.moveEditorToNewWindow` (menu: Move into New Window) | Public | [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/editorCommands.ts#L103) |
| Compact mode | `workbench.action.enableCompactAuxiliaryWindow`, plus `disable…` and `toggle…` | Public, since 1.100 | [1.100 notes](https://code.visualstudio.com/updates/v1_100#_floating-window-modes), [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/auxiliaryEditorPart.ts#L71) |
| Always on top, floating windows only | `workbench.action.enableWindowAlwaysOnTop`, plus `disable…` and `toggleWindowAlwaysOnTop` | Public, since 1.100 | [1.100 notes](https://code.visualstudio.com/updates/v1_100#_floating-window-modes), [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/electron-browser/actions/windowActions.ts#L519) |
| Dock back | `workbench.action.restoreEditorsToMainWindow` | Public | [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/editorActions.ts#L2737) |
| Keep the window to one tab | `workbench.action.lockEditorGroup` | Public | [source](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/editorCommands.ts#L65) |
| **One-shot: new window, size, compact, pin** | `_workbench.openWith(uri, editorId, [-3, { auxiliary }])` | **Internal** | chain below |
| Page-initiated pop-out | a click that runs `window.open(url, '_blank', 'popup,width=…,height=…')` | Internal behavior | [handler](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/browserView/electron-main/browserView.ts#L187), [one per click](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/browserView/electron-main/browserView.ts#L560), [opens compact](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/browserViewWorkbenchService.ts#L566) |
| Read a browser tab's URL; open or close tabs | `window.activeBrowserTab`, `window.openBrowserTab`, `BrowserTab.close()` (proposal `browser`) | Proposed | [d.ts](https://github.com/microsoft/vscode/blob/1.141.0/src/vscode-dts/vscode.proposed.browser.d.ts#L90) |
| Trigger from outside VS Code | `window.registerUriHandler`, links like `vscode://publisher.name/…` | Public | [API reference](https://code.visualstudio.com/api/references/vscode-api#window.registerUriHandler) |

### How the one-shot call resolves

1. `_workbench.openWith` passes your options through untouched and sends your column to `columnToEditorGroup` ([editorCommands.ts L544](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/editorCommands.ts#L544)).
2. `columnToEditorGroup` lets the special group `-3` through unchanged ([editorGroupColumn.ts L19](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/editor/common/editorGroupColumn.ts#L19)); `-3` is `AUX_WINDOW_GROUP` ([editorService.ts L34](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/editor/common/editorService.ts#L34)).
3. For that group, VS Code creates a floating window from `options.auxiliary` ([editorGroupFinder.ts L139](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/editor/common/editorGroupFinder.ts#L139)), whose fields are `bounds`, `compact` and `alwaysOnTop` ([editor.ts L320](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/editor/common/editor.ts#L320)).
4. The integrated browser registers as an optional editor for local `.html`, `.htm`, `.mhtml` and `.mht` files under id `workbench.editor.browser` ([browserView.contribution.ts L111](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/browserView.contribution.ts#L111)).
5. Extensions may run underscore commands: the main thread executes any registered id ([mainThreadCommands.ts L81](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/api/browser/mainThreadCommands.ts#L81)). Underscores only hide an id from `getCommands(true)`.
6. The public `vscode.openWith` can't do this: it maps every column except positive ones and `Beside` to the active group ([extHostTypeConverters.ts L336](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/api/common/extHostTypeConverters.ts#L336), [extHostApiCommands.ts L443](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/api/common/extHostApiCommands.ts#L443)).

### Facts that shape the design

- **Only floating windows can be pinned.** All three always-on-top actions return early on the main window ([windowActions.ts L510](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/electron-browser/actions/windowActions.ts#L510)). The floating window is the mini frame; the whole VS Code window can't be pinned.
- **"Move into New Window" opens at 1024×768**, centered on the current window ([window.ts L573](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/window/common/window.ts#L573)). A framed window can't go below 400×270 ([window.ts L23](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/window/common/window.ts#L23)). The tight size has to be set at open time.
- **Nothing resizes an existing floating window** in the code I checked. Resizing means re-opening with new bounds. The browser editor is single-per-resource, so re-opening a file moves its tab ([editorResolverService.ts L839](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/editor/browser/editorResolverService.ts#L839)).
- **Compact mode switches itself off** when a second group or tab enters the window ([auxiliaryEditorPart.ts L310](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/auxiliaryEditorPart.ts#L310)). Locking the group keeps it to one tab.
- **Floating windows survive restarts** with their bounds, zoom and compact state ([auxiliaryWindowService.ts L239](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.ts#L239)) and their pin ([L140](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/auxiliaryWindow/electron-browser/auxiliaryWindowService.ts#L140)).
- **Pinning is a plain Electron `setAlwaysOnTop`** with no all-Spaces flag ([nativeHostMainService.ts L400](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/platform/native/electron-main/nativeHostMainService.ts#L400)). On macOS, expect it to float within the current Space but not over another app's full-screen window. *Inference; verify.*
- **Extensions can't read a browser tab's URL** through stable API: the tab arrives as an unknown input ([mainThreadEditorTabs.ts L143](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/api/browser/mainThreadEditorTabs.ts#L143)). Only the proposed `browser` API exposes it.
- **Tabs opened with the globe button don't record their source file** ([browserTabManagementFeatures.ts L390](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/electron-browser/features/browserTabManagementFeatures.ts#L390)); tabs opened through the editor resolver do ([browserEditorInput.ts L222](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/contrib/browserView/common/browserEditorInput.ts#L222)). Popping out a globe-opened tab may duplicate it rather than move it.

## Brainstorm: five routes

**Route D, a small extension on the one-shot call, is the one to build.** The others are cheaper stepping stones or escape hatches.

| Route | Exact size | Pinned | From a file | From a browser tab | External trigger | Breaks when |
| --- | --- | --- | --- | --- | --- | --- |
| A. By hand | drag once | click | open it first | yes | no | not expected |
| B. Keybinding | no, 1024×768 | yes, if focus lands | open it first | yes | no | new window isn't focused in time |
| C. Button in the page | yes | click | the page itself | not applicable | no | the popup rule changes |
| D. Extension | yes | yes | yes | fallback size; exact with proposed API | yes | the internal call changes (falls back to B) |
| E. Native panel | yes | yes, on all Spaces | yes | no | yes | not expected |

**A. By hand (works today).** Right-click the browser tab, choose **Move into New Window**, then click the compact and pin icons in that window's title bar. The [integrated browser docs](https://code.visualstudio.com/docs/debugtest/integrated-browser) describe this under "Standalone window". Use it this week to check that the experience is what you want.

**B. A keybinding, no extension.** Chain the three stable commands with `runCommands`:

```jsonc
// keybindings.json
{
  "key": "ctrl+alt+m",
  "command": "runCommands",
  "when": "activeEditor == 'workbench.editor.browser' && !isAuxiliaryWindowFocusedContext",
  "args": { "commands": [
    "workbench.action.moveEditorToNewWindow",
    "workbench.action.enableCompactAuxiliaryWindow",
    "workbench.action.enableWindowAlwaysOnTop"
  ]}
}
```

The last two commands act on whichever window is active when they run, so they no-op if the new window isn't focused yet. The window opens at 1024×768. Two minutes to try.

**C. A pop-out button inside the page.** The integrated browser turns a click that runs `window.open(…, 'popup,width=…,height=…')` into a compact floating window of that size, one per click. A task page can carry its own button; you then click the pin. It opens a second copy, and the docs say popups are blocked, so test it first. Snippet under "Making task pages mini-window friendly".

**D. A small extension on the one-shot call (recommended).** Exact size, compact and pinned in one step, from a file, the Explorer, a browser tab or an external link. Route B's sequence is its fallback if the internal call ever breaks. The next three sections specify it.

**E. A native floating panel outside VS Code.** For example [Hammerspoon's `hs.webview`](https://www.hammerspoon.org/docs/hs.webview.html) or a small Swift or Tauri app, triggered from the extension. Choose it only if VS Code's pin falls short: needed on every Space, over full-screen apps, transparent or click-through. Not researched in depth here.

**Add-on to D: the proposed `browser` API.** It lets the extension pop out any open browser tab, not only files, at an exact size, then close the original. The [docs](https://code.visualstudio.com/api/advanced-topics/using-proposed-api) call proposed APIs Insiders-only. Yet the 1.141.0 source admits any extension named in `--enable-proposed-api` or `argv.json`, on any build ([extensionsProposedApi.ts L104](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/services/extensions/common/extensionsProposedApi.ts#L104), [argv.json schema L442](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/electron-browser/desktop.contribution.ts#L442)). Verify before relying on it.

## Recommended architecture

**One TypeScript extension orchestrates the integrated browser and floating windows; it renders nothing itself.** Every entry point resolves a target, tries the one-shot call, and falls back to stable commands.

&#91;embedded content: pop-out flow · 3 entry points, 1 internal call, 1 fallback\]

If no new window appears within about a second, the stable fallback runs. Either way, the extension then locks the new group so the window keeps one tab.

- **Pop out a file** (`miniBrowser.popOut`). The target is the command argument (Explorer, editor title) or the active `.html`/`.htm` text editor. Size is the first preset, clamped to at least 400×270. Run the one-shot call; success means a new tab group appears within about a second. Otherwise fall back: `vscode.openWith(uri, 'workbench.editor.browser')`, then Move into New Window, compact, pin. Finally lock the new group so compact mode stays on.
- **Pop out a browser tab** (`miniBrowser.popOutBrowserTab`, shown when `activeEditor == 'workbench.editor.browser'`). With the proposed API, read `window.activeBrowserTab.url` and run the one-shot call: a `file:` URL as a file, an http(s) URL as a `vscode-browser:` resource with `viewState.url`. Then close the original. Without the proposed API, run the fallback on the active tab at 1024×768 and drag it smaller once.
- **Dock back** (`miniBrowser.dockBack`, when `isAuxiliaryWindowFocusedContext`). Run `workbench.action.restoreEditorsToMainWindow`; it merges only the focused floating window into the main window's active group ([editorParts.ts L876](https://github.com/microsoft/vscode/blob/1.141.0/src/vs/workbench/browser/parts/editor/editorParts.ts#L876)).
- **Cycle size** (`miniBrowser.cycleSize`, files only). Re-run the one-shot call with the next preset; the tab moves into the new window. Check in the spike that the emptied window closes.
- **Toggle pin** (`miniBrowser.togglePin`). Runs `workbench.action.toggleWindowAlwaysOnTop`, which works only while the floating window is focused.
- **External trigger** (URI handler). `vscode://jlumbroso.mini-browser/open?path=/abs/tasks.html&w=420&h=640`, or `url=` for a localhost page. From a shell: `code --open-url "<link>"`. With several VS Code windows open, the topmost one handles it.

**Optional convention.** Name task pages `*.task.html` and set:

```jsonc
"workbench.editorAssociations": { "*.task.html": "workbench.editor.browser" }
```

Task pages then open in the browser by default, while other HTML still opens as text. HTML association reached Insiders on Aug 10, 2026 and ships in 1.141; check that the glob matches as expected.

## Extension spec

**About 300 lines of TypeScript, no runtime dependencies, and one internal call behind a stable fallback.**

**Scaffold.** TypeScript bundled with esbuild; `engines.vscode: "^1.141.0"`; publisher `jlumbroso`, name `mini-browser` (rename freely). Package with `vsce package` and install the VSIX locally. It stays off the Marketplace because it calls an internal command.

**Manifest contributions** (`package.json`). One chord pops out and docks back; pick your own and check it against your existing shortcuts.

```jsonc
"activationEvents": ["onUri"],
"contributes": {
  "commands": [
    { "command": "miniBrowser.popOut",           "title": "Pop Out to Mini Window",     "category": "Mini Browser", "icon": "$(pinned)" },
    { "command": "miniBrowser.popOutBrowserTab", "title": "Pop Out Browser Tab",        "category": "Mini Browser", "icon": "$(pinned)" },
    { "command": "miniBrowser.dockBack",         "title": "Dock Back into Main Window", "category": "Mini Browser" },
    { "command": "miniBrowser.cycleSize",        "title": "Cycle Mini Window Size",     "category": "Mini Browser" },
    { "command": "miniBrowser.togglePin",        "title": "Toggle Always on Top",       "category": "Mini Browser" },
    { "command": "miniBrowser.openUrl",          "title": "Open URL in Mini Window…",   "category": "Mini Browser" }
  ],
  "menus": {
    "editor/title": [
      { "command": "miniBrowser.popOut", "group": "navigation",
        "when": "resourceScheme == file && resourceExtname =~ /^\\.html?$/i" },
      { "command": "miniBrowser.popOutBrowserTab", "group": "navigation",
        "when": "activeEditor == 'workbench.editor.browser' && !isAuxiliaryWindow" }
    ],
    "explorer/context": [
      { "command": "miniBrowser.popOut", "group": "navigation@30",
        "when": "resourceScheme == file && resourceExtname =~ /^\\.html?$/i" }
    ]
  },
  "keybindings": [
    { "command": "miniBrowser.popOut", "key": "ctrl+alt+m",
      "when": "resourceScheme == file && resourceExtname =~ /^\\.html?$/i && !isAuxiliaryWindowFocusedContext" },
    { "command": "miniBrowser.popOutBrowserTab", "key": "ctrl+alt+m",
      "when": "activeEditor == 'workbench.editor.browser' && !isAuxiliaryWindowFocusedContext" },
    { "command": "miniBrowser.dockBack", "key": "ctrl+alt+m",
      "when": "isAuxiliaryWindowFocusedContext" }
  ]
}
```

**Settings.**

| Setting | Default | Meaning |
| --- | --- | --- |
| `miniBrowser.sizes` | S 400×560, M 480×720, L 640×900 | Presets for pop-out and Cycle Size; the first is the default |
| `miniBrowser.position` | `null` | `{ "x": …, "y": … }` in screen pixels; `null` lets VS Code center the window on the current one |
| `miniBrowser.compact` | `true` | Open in compact mode |
| `miniBrowser.alwaysOnTop` | `true` | Open pinned |
| `miniBrowser.useInternalApi` | `true` | Use the one-shot call; `false` forces the stable fallback |
| `miniBrowser.closeSourceTab` | `true` | After popping out a docked browser tab, close the original |

**Core logic** (`src/extension.ts`, abridged; `log`, `currentSize` and `activeHtmlFile` are small helpers left out, as is popOutUrl, the URL twin of popOut):

```ts
import * as vscode from 'vscode';
import { randomUUID } from 'node:crypto';

const BROWSER_EDITOR = 'workbench.editor.browser'; // contrib/browserView/common/browserView.ts L206 @1.141.0
const AUX_WINDOW_GROUP = -3;                         // services/editor/common/editorService.ts L34 @1.141.0
const cfg = () => vscode.workspace.getConfiguration('miniBrowser');
type Size = { width: number; height: number };

function auxOptions(size: Size) {
  const pos = cfg().get<{ x: number; y: number } | null>('position', null);
  return {
    pinned: true,
    auxiliary: {
      bounds: { width: Math.max(size.width, 400), height: Math.max(size.height, 270), ...(pos ?? {}) },
      compact: cfg().get<boolean>('compact', true),
      alwaysOnTop: cfg().get<boolean>('alwaysOnTop', true),
    },
  };
}

/** Resolves with the first tab group that wasn't there before, or undefined after `ms`. */
function waitForNewGroup(before: Set<vscode.TabGroup>, ms = 1500): Promise<vscode.TabGroup | undefined> {
  const find = () => vscode.window.tabGroups.all.find(g => !before.has(g));
  const hit = find();
  if (hit) { return Promise.resolve(hit); }
  return new Promise(resolve => {
    const timer = setTimeout(() => { sub.dispose(); resolve(undefined); }, ms);
    const sub = vscode.window.tabGroups.onDidChangeTabGroups(() => {
      const g = find();
      if (g) { clearTimeout(timer); sub.dispose(); resolve(g); }
    });
  });
}

/** Primary path: one internal call opens the page in a sized, compact, pinned window. */
async function openInMiniWindow(target: vscode.Uri | string, size: Size): Promise<vscode.TabGroup | undefined> {
  const before = new Set(vscode.window.tabGroups.all);
  try {
    if (typeof target === 'string') { // a URL read from a browser tab or a vscode:// link
      const resource = vscode.Uri.from({ scheme: 'vscode-browser', path: `/${randomUUID()}` });
      await vscode.commands.executeCommand('_workbench.open', resource,
        [AUX_WINDOW_GROUP, { ...auxOptions(size), viewState: { url: target } }]);
    } else {
      await vscode.commands.executeCommand('_workbench.openWith', target, BROWSER_EDITOR,
        [AUX_WINDOW_GROUP, auxOptions(size)]);
    }
  } catch (err) {
    log(`one-shot open failed: ${err}`);
    return undefined;
  }
  return waitForNewGroup(before);
}

/** Fallback: stable commands only; VS Code picks the window size. */
async function fallbackPopOut(file?: vscode.Uri): Promise<void> {
  if (file) { await vscode.commands.executeCommand('vscode.openWith', file, BROWSER_EDITOR); }
  await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
  await new Promise(r => setTimeout(r, 200)); // let the new window take focus; tune in the spike
  if (cfg().get('compact', true)) { await vscode.commands.executeCommand('workbench.action.enableCompactAuxiliaryWindow'); }
  if (cfg().get('alwaysOnTop', true)) { await vscode.commands.executeCommand('workbench.action.enableWindowAlwaysOnTop'); }
}

export async function popOut(arg?: vscode.Uri, size: Size = currentSize()): Promise<void> {
  const file = arg ?? activeHtmlFile();
  if (!file) { return; }
  const group = cfg().get('useInternalApi', true) ? await openInMiniWindow(file, size) : undefined;
  if (!group) { await fallbackPopOut(file); return; }
  if (vscode.window.tabGroups.activeTabGroup === group) { // never lock a main-window group by mistake
    await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
  }
}
```

**URI handler**, with an allowlist so a stray link can't pin arbitrary pages:

```ts
vscode.window.registerUriHandler({
  async handleUri(uri) {
    if (uri.path !== '/open') { return; }
    const q = new URLSearchParams(uri.query);
    const size = { width: Number(q.get('w') ?? 420), height: Number(q.get('h') ?? 640) };
    const path = q.get('path'), url = q.get('url');
    if (path && /\.html?$/i.test(path)) { return popOut(vscode.Uri.file(path), size); }
    if (url && /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/)/.test(url)) { await popOutUrl(url, size); }
  },
});
```

**`just` recipe** (`open "<link>"` also works on macOS):

```just
# Pop an HTML page into the pinned mini window
pin file w="420" h="640":
    code --open-url "vscode://jlumbroso.mini-browser/open?w={{w}}&h={{h}}&path=$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$(realpath '{{file}}')")"
```

Then one line in your Claude Code instructions closes the loop: after writing an HTML task page, run `just pin <file>`.

## Decisions to record

**Six decisions, each ready to become an ADR under `docs/adr/`.**

| ADR | Decision | Because | Consequence |
| --- | --- | --- | --- |
| 0001 | Reuse the integrated browser; build no webview | It already renders `file://` and http(s), reloads on change, zooms, asks for permissions and keeps cookies and localStorage | Needs VS Code desktop 1.141 or later; local files only, no remote or virtual workspaces |
| 0002 | Primary path: internal `_workbench.openWith` into group `-3`, guarded by a stable fallback | Only this path sets size, compact and pin in one step; the public `vscode.openWith` drops `-3` | May break on an update; the fallback and a setting cover it; re-run the spike after updates |
| 0003 | The proposed `browser` API is optional and feature-detected at runtime | It's needed only to pop out non-file tabs at an exact size and to close the source tab | Without it, URL tabs pop out at 1024×768 |
| 0004 | Resize means re-open with new bounds | No command resizes an existing floating window | A brief flash on resize; fallback windows can't be resized by the extension |
| 0005 | Expose a `vscode://…/open` handler with an allowlist | Task pages are often written by Claude Code, outside the editor's UI | `just pin` and agents can pop pages; only local HTML files and https or localhost URLs pass |
| 0006 | Ship as a personal VSIX | Internal command, possibly proposed API | `vsce package` plus Install from VSIX; no Marketplace |

## Build plan

**A 15-minute spike decides whether the one-shot path holds; everything else follows from it.**

1. **Spike 0: prove the one-shot call.** A throwaway extension with one command that runs the TL;DR snippet on `samples/tasks.html`, launched with F5. Record the answers in `docs/SPIKE.md`, with your VS Code version:
   - Does a 420×640 window appear, compact and pinned, with the page rendered?
   - Does saving the file reload the page?
   - Which tab groups exist before and after? This confirms the success check.
   - Run it twice on the same file: does the tab move, or duplicate?
   - When the last tab leaves a floating window, does the window close?
   - Popping out a tab opened with the globe button: move or duplicate?
2. **M1: pop out files.** `miniBrowser.popOut` from the editor title, Explorer and keybinding; settings; success check; stable fallback; group lock.
3. **M2: pop out browser tabs.** `miniBrowser.popOutBrowserTab` on the fallback path first, then the proposed-API upgrade behind feature detection. On a stable build, F5 alone refuses proposed API; add `--enable-proposed-api=jlumbroso.mini-browser` to the launch arguments.
4. **M3: dock back, cycle size, toggle pin.**
5. **M4: external trigger.** URI handler with its allowlist, the `just pin` recipe, and the line in your Claude Code instructions.
6. **M5: package.** `vsce package` and Install from VSIX; an `argv.json` entry only if you adopt the proposed API.

**Acceptance checklist**, run by hand on your machine:

- [ ] From `tasks.html` in the text editor, one keystroke gives a 420×640 window: no tabs or status bar, pinned, page rendered.
- [ ] Saving `tasks.html`, or Claude Code rewriting it, reloads the mini window.
- [ ] Explorer right-click pops out a file that isn't open yet.
- [ ] From a docked browser tab, pop-out works and the original tab is gone.
- [ ] Cycle Size steps through S, M and L.
- [ ] The same chord inside the mini window docks it back, and the window closes.
- [ ] `just pin tasks.html` from a terminal pops the page out.
- [ ] After restarting VS Code, the mini window returns pinned and compact.
- [ ] With `useInternalApi` off, everything still works except the exact size.

## Making task pages mini-window friendly

**The window is only as useful as the page inside it; four rules for whatever generates the HTML.**

- **Design for about 400 px wide.** One column, no fixed widths, a viewport meta tag, generous tap targets. Use the browser's page zoom for density rather than tiny fonts.
- **Persist progress on purpose.** `localStorage` follows `workbench.browser.dataStorage` (global, workspace or ephemeral), and untrusted workspaces always use ephemeral storage ([docs](https://code.visualstudio.com/docs/debugtest/integrated-browser)). Checkbox progress vanishes there. If progress matters, let the page export it, for example with a copy-to-clipboard button.
- **Expect reloads.** With auto-reload on (the default), every rewrite of the file reloads the page, and state kept outside storage is lost.
- **Clipboard access asks first.** The integrated browser prompts per site for clipboard and other permissions ([docs](https://code.visualstudio.com/docs/debugtest/integrated-browser)).

Route C's pop-out button, for pages viewed in a docked tab. Test it before relying on it, since the docs say popups are blocked:

```html
<button onclick="window.open(location.href, '_blank', 'popup,width=420,height=640')">Pop out</button>
```

## Risks, limits and what to verify

**The one real risk is the internal call; everything else is a known limit with a workaround.**

| Risk or limit | Likelihood | Mitigation | How to verify |
| --- | --- | --- | --- |
| `_workbench.openWith` or the `auxiliary` option changes in an update | Medium; about one release a week since August (1.134 to 1.141) | Stable fallback, the `useInternalApi` setting, the spike as a regression check | Re-run Spike 0 after updates |
| The pin doesn't float over full-screen apps or follow you across macOS Spaces | Likely on macOS | Accept it, or Route E | Pin, switch Spaces, put another app in full screen |
| Fallback: compact and pin run before the new window is active, and no-op | Medium | A short delay plus a retry | Spike, forcing the fallback path |
| Compact mode turns off when a second tab or group enters the window | Certain, by design | Lock the group after pop-out | Open another file while the mini window is focused |
| Popping out a globe-opened tab duplicates it instead of moving it | Medium | Close the source tab (proposed API), or accept the copy | Spike, last item |
| Proposed `browser` API: docs say Insiders-only, source admits a flag on stable | Unknown | Feature-detect; keep it optional | M2 |
| Framed windows can't go below 400×270 | Certain | Page zoom for density | Settled by source |
| Local files only; no remote or virtual workspaces | Certain | Out of scope, or serve the page over localhost | Settled by docs |
| The URI handler could pop arbitrary pages | Low | Allowlist | Open a `vscode://` link from a terminal; note whether VS Code asks first |

## Hand-off prompt for Claude Code

**Export this doc as Markdown into an empty folder as `BLUEPRINT.md`, then paste this prompt.**

```text
Build a personal VS Code extension, "Mini Browser" (publisher jlumbroso, name mini-browser;
TypeScript, esbuild, engines.vscode ^1.141.0, no runtime dependencies), following BLUEPRINT.md.

1. Start with Spike 0: one command that runs
     _workbench.openWith(fileUri, 'workbench.editor.browser',
       [-3, { pinned: true, auxiliary: { bounds: { width: 420, height: 640 },
                                          compact: true, alwaysOnTop: true } }])
   on samples/tasks.html. Write the launch config, then STOP: ask me to run it and report
   the six spike questions. Don't build further until I answer.
2. Then implement M1-M5: commands miniBrowser.popOut, popOutBrowserTab, dockBack, cycleSize,
   togglePin, openUrl; the six miniBrowser.* settings; success detection by new tab group;
   the stable fallback (vscode.openWith -> workbench.action.moveEditorToNewWindow ->
   workbench.action.enableCompactAuxiliaryWindow -> workbench.action.enableWindowAlwaysOnTop);
   the group lock; the vscode://jlumbroso.mini-browser/open URI handler with its allowlist;
   and a justfile recipe `pin`.
3. Record ADRs 0001-0006 from the blueprint under docs/adr/.
4. Treat every internal command id as an assumption: log the VS Code version on activation;
   if an internal call throws or opens nothing, fall back and log why.
5. Package with `vsce package`. Do not publish.
```

## Sources

Pages and code opened for this blueprint, as of Oct 12, 2026:

- [Integrated browser](https://code.visualstudio.com/docs/debugtest/integrated-browser) (VS Code docs): local files, standalone window, settings, storage, permissions.
- [April 2025 (1.100) release notes, Floating window modes](https://code.visualstudio.com/updates/v1_100#_floating-window-modes): compact and always-on-top.
- [1.112 release notes](https://code.visualstudio.com/updates/v1_112): independent browser zoom.
- [1.134 release notes](https://code.visualstudio.com/updates/v1_134): HTML files associated with the integrated browser.
- [Using Proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api): Insiders-only, per the docs.
- [VS Code source at tag 1.141.0](https://github.com/microsoft/vscode/tree/1.141.0): every line link in this doc, cross-checked against [main at c0f2e89](https://github.com/microsoft/vscode/commit/c0f2e898b16593abb270bf06ac9f4256acf3c650).
- [vscode.d.ts, registerUriHandler](https://github.com/microsoft/vscode/blob/1.141.0/src/vscode-dts/vscode.d.ts#L11707): with several windows open, the topmost one handles the link.

*Signed: Claude Opus 5.5*
