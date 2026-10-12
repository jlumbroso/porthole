import * as vscode from 'vscode';
import { alwaysOnTop, compact, position, type Size } from './config';
import { describeError, log } from './log';

// Internal to VS Code: read at tag 1.141.0 and seen working on 1.141.0
// (ADR-0003, ADR-0005). Either can change in any update, which is why every
// use of them sits behind the fallback below.
export const BROWSER_EDITOR = 'workbench.editor.browser';
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
 * Resolves with the first tab group VS Code reports as opened, or `undefined`
 * after `timeoutMs`. Subscribe BEFORE running the command that opens the
 * window: in Spike 0 the group appeared before the command returned.
 */
function watchForOpenedGroup(timeoutMs: number) {
  let settle!: (group: vscode.TabGroup | undefined) => void;
  const promise = new Promise<vscode.TabGroup | undefined>(resolve => { settle = resolve; });
  const finish = (group: vscode.TabGroup | undefined) => {
    clearTimeout(timer);
    subscription.dispose();
    settle(group);
  };
  const subscription = vscode.window.tabGroups.onDidChangeTabGroups(event => {
    if (event.opened.length > 0) { finish(event.opened[0]); }
  });
  const timer = setTimeout(() => finish(undefined), timeoutMs);
  return { promise, cancel: () => finish(undefined) };
}

/**
 * Primary path: one internal call opens the page in a sized, compact, pinned
 * floating window. Returns the new tab group, or `undefined` when the call
 * threw or opened nothing; the caller then falls back.
 */
export async function openInMiniWindow(file: vscode.Uri, size: Size): Promise<vscode.TabGroup | undefined> {
  const started = Date.now();
  const watch = watchForOpenedGroup(NEW_GROUP_TIMEOUT_MS);
  try {
    await vscode.commands.executeCommand('_workbench.openWith', file, BROWSER_EDITOR, [AUX_WINDOW_GROUP, auxOptions(size)]);
  } catch (err) {
    watch.cancel();
    log(`internal open threw; falling back to public commands: ${describeError(err)}`);
    return undefined;
  }
  const group = await watch.promise;
  log(group
    ? `internal open: new window after ${Date.now() - started} ms at ${size.width}×${size.height}`
    : `internal open returned, but no new window appeared within ${NEW_GROUP_TIMEOUT_MS} ms; falling back to public commands`);
  return group;
}

/**
 * Fallback: public commands only. VS Code picks the window size (about
 * 1024×768). If the internal call succeeded late, the page is already in a
 * floating window; opening it again finds that tab and moves it, so this never
 * leaves two windows (seen in Spike 0's second fallback run).
 */
export async function fallbackPopOut(file: vscode.Uri): Promise<vscode.TabGroup | undefined> {
  const watch = watchForOpenedGroup(NEW_GROUP_TIMEOUT_MS);
  try {
    await vscode.commands.executeCommand('vscode.openWith', file, BROWSER_EDITOR);
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
  const group = await watch.promise;
  log(group ? 'fallback: page moved into a new window at VS Code\'s default size' : 'fallback: commands ran, but no new window was reported');
  return group;
}

/**
 * Compact mode switches itself off when a second tab enters the window, so the
 * new group is locked to keep it to one. Only ever locks the group we were just
 * handed: locking some other group by mistake would be worse than not locking.
 */
export async function keepToOneTab(group: vscode.TabGroup): Promise<void> {
  if (!compact()) { return; }
  // Tab-group objects keep a stable identity across model resyncs at 1.141.0
  // (extHostEditorTabs.ts, $acceptEditorTabModel), so identity is a fair test.
  if (vscode.window.tabGroups.activeTabGroup !== group) {
    log('not locking: the new window is not the active tab group');
    return;
  }
  await vscode.commands.executeCommand('workbench.action.lockEditorGroup');
}
