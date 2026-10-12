import * as vscode from 'vscode';
import { sizes, useInternalApi, type Size } from './config';
import { log } from './log';
import { fallbackPopOut, keepToOneTab, openInMiniWindow } from './miniWindow';

interface MiniWindow {
  file: vscode.Uri;
  sizeIndex: number;
}

// A browser tab cannot be recognized afterwards: its `input` is undefined and
// its label follows the page title (ADR-0003). So each window is remembered by
// the tab group VS Code handed back when it opened.
let windows = new WeakMap<vscode.TabGroup, MiniWindow>();
let lastOpened: MiniWindow | undefined;

/** For tests: forget every window opened so far. */
export function resetState(): void {
  windows = new WeakMap();
  lastOpened = undefined;
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
  let group = useInternalApi() ? await openInMiniWindow(file, size) : undefined;
  if (!group) { group = await fallbackPopOut(file); }
  const opened: MiniWindow = { file, sizeIndex };
  lastOpened = opened;
  if (group) {
    windows.set(group, opened);
    await keepToOneTab(group);
  }
}

/**
 * Pops an HTML file out into the mini window. The file is the command's
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
 * Re-opens the focused mini window's page at the next size preset. VS Code
 * moves the tab into the new window and closes the old one (ADR-0007).
 */
export async function cycleSize(): Promise<void> {
  const current = windows.get(vscode.window.tabGroups.activeTabGroup) ?? lastOpened;
  if (!current) {
    void vscode.window.showInformationMessage('Porthole: pop a page out first; this then steps through the size presets.');
    return;
  }
  if (!useInternalApi()) {
    void vscode.window.showInformationMessage('Porthole: size presets need the "porthole.useInternalApi" setting turned on.');
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
