import * as vscode from 'vscode';
import { alwaysOnTop, compact, position, type Size } from './config';
import { describeError, log } from './log';

// Internal to VS Code: read at tag 1.141.0 and seen working on 1.141.0
// (ADR-0003, ADR-0005). Either can change in any update, which is why every
// use of them sits behind the fallback below.
export const BROWSER_EDITOR = 'workbench.editor.browser';
// The built-in Markdown extension's preview, registered as an editor of its own
// (read at 1.141.0; seen floating, compact and live in Spike 1, ADR-0018).
export const MARKDOWN_PREVIEW_EDITOR = 'vscode.markdown.preview.editor';

const isMarkdownPath = (path: string) => /\.(md|markdown)$/i.test(path);

/** The editor porthole shows a file in: VS Code's Markdown preview for Markdown, its integrated browser otherwise. */
export function editorFor(file: vscode.Uri): string {
  return isMarkdownPath(file.fsPath) ? MARKDOWN_PREVIEW_EDITOR : BROWSER_EDITOR;
}
export const AUX_WINDOW_GROUP = -3;

/** Spike 0 saw the new group within 142 ms in five runs; this leaves ten times that. */
export const NEW_GROUP_TIMEOUT_MS = 1500;

/** How long the fallback gives the new window to take focus (the brief's guess; clean in four runs). */
export const FALLBACK_FOCUS_PAUSE_MS = 200;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function auxOptions(size: Size) {
  return {
    auxiliary: {
      bounds: { width: size.width, height: size.height, ...(position() ?? {}) },
      compact: compact(),
      alwaysOnTop: alwaysOnTop(),
    },
  };
}

/**
 * How sure porthole is that a tab group is the window it just asked for.
 * `file`: its tab says it shows this file (a Markdown preview, or a page that
 * opened as text). `unverified`: its tab says nothing (a browser tab's input is
 * opaque to extensions, ADR-0003), so it is taken on timing alone.
 */
export type WindowMatch = 'file' | 'unverified';

export interface OpenedWindow {
  group: vscode.TabGroup;
  match: WindowMatch;
}

/** The file a tab says it shows, when its kind of input names one (text, custom editor, notebook). */
function fileShownBy(tab: vscode.Tab | undefined): string | undefined {
  const uri = (tab?.input as { uri?: unknown } | undefined)?.uri;
  return uri ? String(uri) : undefined;
}

/**
 * Resolves with the first tab group VS Code reports as opened that can be the
 * window for `file`, or `undefined` after `timeoutMs`. A group whose tab
 * names a different file is someone else's (a split the person opened at that
 * moment) and is passed over: crediting the first group opened, whatever it
 * showed, was the weakness Sounder 6 found (ADR-0014). Subscribe BEFORE running
 * the command that opens the window: in Spike 0 the group appeared before the
 * command returned.
 */
function watchForOpenedGroup(file: vscode.Uri, timeoutMs: number) {
  let settle!: (opened: OpenedWindow | undefined) => void;
  const promise = new Promise<OpenedWindow | undefined>(resolve => { settle = resolve; });
  let settled = false;
  const finish = (opened: OpenedWindow | undefined) => {
    if (settled) { return; }
    settled = true;
    clearTimeout(timer);
    subscription.dispose();
    settle(opened);
  };
  const consider = async (group: vscode.TabGroup) => {
    const shown = fileShownBy(await firstTab(group));
    if (settled) { return; }
    if (shown === undefined) { finish({ group, match: 'unverified' }); return; }
    if (shown === file.toString()) { finish({ group, match: 'file' }); return; }
    log(`a tab group opened meanwhile with ${shown}; not the window for ${file.toString()}`);
  };
  const subscription = vscode.window.tabGroups.onDidChangeTabGroups(event => {
    for (const group of event.opened) { void consider(group); }
  });
  const timer = setTimeout(() => finish(undefined), timeoutMs);
  return { promise, cancel: () => finish(undefined) };
}

/**
 * Primary path: one internal call opens the page in a sized, compact, pinned
 * floating window. Returns the new tab group, or `undefined` when the call
 * threw or opened nothing; the caller then falls back.
 */
export async function openInMiniWindow(file: vscode.Uri, size: Size): Promise<OpenedWindow | undefined> {
  const started = Date.now();
  const watch = watchForOpenedGroup(file, NEW_GROUP_TIMEOUT_MS);
  try {
    await vscode.commands.executeCommand('_workbench.openWith', file, editorFor(file), [AUX_WINDOW_GROUP, auxOptions(size)]);
  } catch (err) {
    watch.cancel();
    log(`internal open threw; falling back to public commands: ${describeError(err)}`);
    return undefined;
  }
  const opened = await watch.promise;
  log(opened
    ? `internal open: new window after ${Date.now() - started} ms at ${size.width}×${size.height} (matched: ${opened.match})`
    : `internal open returned, but no new window appeared within ${NEW_GROUP_TIMEOUT_MS} ms; falling back to public commands`);
  return opened;
}

/**
 * Fallback: public commands only. VS Code picks the window size (about
 * 1024×768). If the internal call succeeded late, the page is already in a
 * floating window; opening it again finds that tab and moves it, so this never
 * leaves two windows (seen in Spike 0's second fallback run).
 */
export async function fallbackPopOut(file: vscode.Uri): Promise<OpenedWindow | undefined> {
  const watch = watchForOpenedGroup(file, NEW_GROUP_TIMEOUT_MS);
  try {
    await vscode.commands.executeCommand('vscode.openWith', file, editorFor(file));
    await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
    // The next two commands act on whichever window is active, so the new one
    // must have focus first (source check, completion brief of 2026-10-12).
    await sleep(FALLBACK_FOCUS_PAUSE_MS);
    if (compact()) { await vscode.commands.executeCommand('workbench.action.enableCompactAuxiliaryWindow'); }
    if (alwaysOnTop()) { await vscode.commands.executeCommand('workbench.action.enableWindowAlwaysOnTop'); }
  } catch (err) {
    watch.cancel();
    throw err;
  }
  const opened = await watch.promise;
  log(opened ? `fallback: page moved into a new window at VS Code's default size (matched: ${opened.match})` : 'fallback: commands ran, but no new window was reported');
  return opened;
}

/** The group's first tab, waiting briefly: VS Code reports a new group about 5 ms before its tab (Spike 0 log). */
function firstTab(group: vscode.TabGroup, ms = 500): Promise<vscode.Tab | undefined> {
  if (group.activeTab) { return Promise.resolve(group.activeTab); }
  return new Promise(resolve => {
    const done = (tab: vscode.Tab | undefined) => { clearTimeout(timer); subscription.dispose(); resolve(tab); };
    const subscription = vscode.window.tabGroups.onDidChangeTabs(() => { if (group.activeTab) { done(group.activeTab); } });
    const timer = setTimeout(() => done(group.activeTab), ms);
  });
}

let warnedAboutText = false;

/**
 * Says so when the window opened, but with the page's source as plain text.
 *
 * If VS Code ever stops handing `.html` files to its integrated browser, the
 * internal call still opens a correctly sized, compact, pinned window — with
 * the file's source in a text editor — and reports success. Below 1.134.0
 * that is exactly what happens (Surveyor, source at 1.130.0, 2026-10-13). A
 * browser tab's input is opaque to extensions; a text tab's is `TabInputText`,
 * so this one check turns a silent break into a visible one.
 */
export async function warnIfOpenedAsText(group: vscode.TabGroup, file: vscode.Uri): Promise<void> {
  const tab = await firstTab(group);
  if (!(tab?.input instanceof vscode.TabInputText)) { return; }
  const markdown = editorFor(file) === MARKDOWN_PREVIEW_EDITOR;
  const renderer = markdown ? 'its Markdown preview' : 'its integrated browser';
  log(`the window opened ${file.toString()} as text, not in ${renderer} (VS Code ${vscode.version})`);
  if (warnedAboutText) { return; }
  warnedAboutText = true;
  void vscode.window.showWarningMessage(markdown
    ? 'Porthole: VS Code opened the file as text; its Markdown preview did not take it. Check that the built-in Markdown extension is enabled.'
    : 'Porthole: VS Code opened the file as text; its integrated browser did not take it. Porthole needs VS Code 1.134.0 or later with the integrated browser available.');
}

/** For tests: warn again as if freshly activated. */
export function resetTextWarning(): void {
  warnedAboutText = false;
}

