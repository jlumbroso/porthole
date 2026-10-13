import * as vscode from 'vscode';
import { sizes, useInternalCommand, type Size } from './config';
import { log } from './log';
import { fallbackPopOut, keepToOneTab, openInMiniWindow, resetTextWarning, warnIfOpenedAsText } from './miniWindow';

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
}

/** Forgets each floating window as soon as VS Code closes its group. Call once, from `activate`. */
export function trackWindows(): vscode.Disposable {
  return vscode.window.tabGroups.onDidChangeTabGroups(event => {
    for (const group of event.closed) { windows.delete(group); }
  });
}

/**
 * The porthole window that Cycle Size should act on.
 *
 * Normally that is VS Code's active tab group. But VS Code does not always mark
 * the floating window's group active when the window gains focus: on
 * 2026-10-13 Jérémie saw "pop a page out first" from inside an open porthole
 * window, now and then, with no reliable repro. (Likely cause, not yet
 * confirmed: a click that lands inside the page itself is not seen by the
 * workbench as focusing the group.) So when the active group is not one of
 * ours and exactly one porthole window is open, that one is meant.
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

const isHtmlPath = (path: string) => /\.html?$/i.test(path);

function asLocalHtmlFile(value: unknown): vscode.Uri | undefined {
  if (!value || typeof value !== 'object') { return undefined; }
  const candidate = value as Partial<vscode.Uri>;
  return candidate.scheme === 'file' && typeof candidate.fsPath === 'string' && isHtmlPath(candidate.fsPath)
    ? (value as vscode.Uri)
    : undefined;
}

async function open(file: vscode.Uri, sizeIndex: number, size: Size): Promise<void> {
  let group = useInternalCommand() ? await openInMiniWindow(file, size) : undefined;
  if (!group) { group = await fallbackPopOut(file); }
  if (group) {
    windows.set(group, { file, sizeIndex });
    await warnIfOpenedAsText(group, file);
    await keepToOneTab(group);
  }
}

/**
 * Pops an HTML file out into a floating window. The file is the command's
 * argument (Explorer, editor title) or, from the keyboard, the active editor.
 */
export async function popOut(arg?: unknown): Promise<void> {
  const file = asLocalHtmlFile(arg) ?? asLocalHtmlFile(vscode.window.activeTextEditor?.document.uri);
  if (!file) {
    void vscode.window.showInformationMessage('Porthole: open or select a local HTML file first.');
    return;
  }
  await open(file, 0, sizes()[0]);
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
  await open(current.file, next, presets[next]);
}

/** Merges the focused floating window back into the main window. */
export async function dockBack(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.restoreEditorsToMainWindow');
}

/** Pins or unpins the focused floating window. */
export async function togglePin(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.toggleWindowAlwaysOnTop');
}
