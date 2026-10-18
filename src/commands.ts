import * as vscode from 'vscode';
import { sizes, useInternalCommand, type Size } from './config';
import { describeError, log } from './log';
import { offerAutoLock, resetAutoLockPrompt } from './autoLock';
import { updateMarkdownColors } from './markdownColors';
import { editorFor, fallbackPopOut, MARKDOWN_PREVIEW_EDITOR, openInMiniWindow, resetTextWarning, warnIfOpenedAsText } from './miniWindow';

interface MiniWindow {
  file: vscode.Uri;
  sizeIndex: number;
}

// A browser tab cannot be recognized afterwards: its `input` is undefined and
// its label follows the page title (ADR-0003). So each window is remembered by
// the tab group VS Code handed back when it opened.
//
// There is deliberately no "the last file popped out" fallback. With one, Cycle
// Size in a window porthole did not open, or after Dock Back, re-opened the last
// file and pulled it out of wherever it was (Surveyor's review, 2026-10-12).
// Instead the map only holds windows that are still open: a group is dropped
// the moment VS Code reports it closed (see trackWindows).
const windows = new Map<vscode.TabGroup, MiniWindow>();

/** For tests: forget every window opened so far. */
export function resetState(): void {
  windows.clear();
  resetTextWarning();
  resetAutoLockPrompt();
}

/** Forgets each floating window as soon as VS Code closes its group. Call once, from `activate`. */
export function trackWindows(): vscode.Disposable {
  return vscode.window.tabGroups.onDidChangeTabGroups(event => {
    let closedMarkdown = false;
    for (const group of event.closed) {
      const shown = windows.get(group);
      if (shown && editorFor(shown.file) === MARKDOWN_PREVIEW_EDITOR) { closedMarkdown = true; }
      windows.delete(group);
    }
    if (closedMarkdown) { void updateMarkdownColors(); }
  });
}

/** The Markdown files currently shown in Porthole's floating windows. */
export function markdownFilesShown(): vscode.Uri[] {
  return [...windows.values()].map(shown => shown.file).filter(file => editorFor(file) === MARKDOWN_PREVIEW_EDITOR);
}

/**
 * The porthole window that Cycle Size should act on.
 *
 * Normally that is VS Code's active tab group. But the extension API's active
 * group follows the person only when a tab group opens or closes somewhere, so
 * it can name the wrong window (confirmed by hand, ADR-0019; filed upstream as
 * microsoft/vscode#341430). When the active group is not one of ours and
 * exactly one porthole window is open, that one is meant.
 */
function windowToResize(): MiniWindow | undefined {
  const active = vscode.window.tabGroups.activeTabGroup;
  const hit = windows.get(active);
  if (hit) { return hit; }
  if (windows.size === 1) {
    log(`cycle size: the active tab group (column ${active.viewColumn}) is not a Porthole window; using the only one open`);
    return windows.values().next().value;
  }
  log(`cycle size: the active tab group (column ${active.viewColumn}) is not a Porthole window, and ${windows.size} are open`);
  return undefined;
}

const isPagePath = (path: string) => /\.(html?|md|markdown)$/i.test(path);

function asLocalPageFile(value: unknown): vscode.Uri | undefined {
  if (!value || typeof value !== 'object') { return undefined; }
  const candidate = value as Partial<vscode.Uri>;
  return candidate.scheme === 'file' && typeof candidate.fsPath === 'string' && isPagePath(candidate.fsPath)
    ? (value as vscode.Uri)
    : undefined;
}

// Porthole's opens run one at a time. A browser tab says nothing about the page
// it shows, so a new window is matched to its request by timing; two opens in
// flight together would both take the first window to appear (Sounder 6,
// ADR-0014). Requests from outside VS Code make overlapping opens ordinary.
let openQueue: Promise<void> = Promise.resolve();

/**
 * What a pop-out does when the file is already in one of Porthole's floating
 * windows. `reveal`: bring that window forward, where it is and at its size
 * (Pop Out, or a link with no size). `replace`: open a new window at the asked
 * size and close the old one (Cycle Size, or a link with a size).
 */
type IfAlreadyOpen = 'reveal' | 'replace';

function open(file: vscode.Uri, sizeIndex: number, size: Size, ifAlreadyOpen: IfAlreadyOpen): Promise<void> {
  const run = openQueue.then(() => openNow(file, sizeIndex, size, ifAlreadyOpen));
  openQueue = run.catch(() => undefined);
  return run;
}

/** Porthole's floating windows still open that show `file`, other than `except`. */
function windowsShowing(file: vscode.Uri, except?: vscode.TabGroup): vscode.TabGroup[] {
  const open = new Set(vscode.window.tabGroups.all);
  return [...windows.entries()]
    .filter(([group, shown]) => group !== except && open.has(group) && shown.file.toString() === file.toString())
    .map(([group]) => group);
}

// Pop Out twice must not leave two windows (Jérémie, 2026-10-18). VS Code
// reveals an integrated-browser tab wherever it is already open (its input is
// "ForceReveal"), but a Markdown preview is not marked so: opened again into a
// new floating window, it gives a second window (read at 1.141.0,
// browserEditorInput.ts and customEditorInput.ts). So Porthole decides itself.
async function openNow(file: vscode.Uri, sizeIndex: number, size: Size, ifAlreadyOpen: IfAlreadyOpen): Promise<void> {
  const [existing] = windowsShowing(file);
  if (existing && ifAlreadyOpen === 'reveal') {
    try {
      // The public command, aimed at the group the window holds: the page is already there, so VS Code shows it and focuses that window.
      await vscode.commands.executeCommand('vscode.openWith', file, editorFor(file), existing.viewColumn);
      log(`${file.toString()} is already in a floating window; brought it forward`);
      return;
    } catch (err) {
      log(`could not bring the floating window forward, opening a new one instead: ${describeError(err)}`);
    }
  }
  // The stylesheet must name this file before its preview renders (ADR-0022).
  if (editorFor(file) === MARKDOWN_PREVIEW_EDITOR) { await updateMarkdownColors([file]); }
  let opened = useInternalCommand() ? await openInMiniWindow(file, size) : undefined;
  if (!opened) { opened = await fallbackPopOut(file); }
  if (opened) {
    windows.set(opened.group, { file, sizeIndex });
    // An HTML page was moved out of its old window, which VS Code then closed; a Markdown preview was copied, so its old window is closed here.
    for (const old of windowsShowing(file, opened.group)) {
      try {
        await vscode.window.tabGroups.close(old);
        log(`closed the earlier floating window of ${file.toString()}`);
      } catch (err) {
        log(`could not close the earlier floating window of ${file.toString()}: ${describeError(err)}`);
      }
    }
    await warnIfOpenedAsText(opened.group, file);
  }
}

/**
 * Pops an HTML file (shown in the integrated browser) or a Markdown file (shown
 * as VS Code's Markdown preview) out into a floating window. The file is the command's
 * argument (Explorer, editor title) or, from the keyboard, the active editor.
 */
export async function popOut(arg?: unknown): Promise<void> {
  const file = asLocalPageFile(arg) ?? asLocalPageFile(vscode.window.activeTextEditor?.document.uri);
  if (!file) {
    void vscode.window.showInformationMessage('Porthole: open or select a local HTML or Markdown file first.');
    return;
  }
  await offerAutoLock();
  await open(file, 0, sizes()[0], 'reveal');
}

/**
 * Opens a page an outside link asked for (ADR-0013), at the link's size or the
 * first preset. Same path as Pop Out, consent question included.
 */
export async function openRequested(file: vscode.Uri, size?: Size): Promise<void> {
  await offerAutoLock();
  // A size from the link is not a preset; Cycle Size then starts from the first.
  await open(file, size ? -1 : 0, size ?? sizes()[0], size ? 'replace' : 'reveal');
}

/**
 * Re-opens the focused floating window's page at the next size preset. VS Code
 * moves the tab into the new window and closes the old one (ADR-0007).
 */
export async function cycleSize(): Promise<void> {
  const current = windowToResize();
  if (!current) {
    void vscode.window.showInformationMessage(windows.size === 0
      ? 'Porthole: pop a page out first; this then steps through the size presets of the window Porthole opened.'
      : 'Porthole: several floating windows are open. Click the title bar of the one to resize, then try again.');
    return;
  }
  if (!useInternalCommand()) {
    void vscode.window.showInformationMessage('Porthole: size presets need the "porthole.useInternalCommand" setting turned on.');
    return;
  }
  const presets = sizes();
  const next = (current.sizeIndex + 1) % presets.length;
  log(`cycle size: ${presets[next].name} (${presets[next].width}×${presets[next].height})`);
  await open(current.file, next, presets[next], 'replace');
}

/** Merges the focused floating window back into the main window. */
export async function dockBack(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.restoreEditorsToMainWindow');
}

/** Pins or unpins the focused floating window. */
export async function togglePin(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.toggleWindowAlwaysOnTop');
}
