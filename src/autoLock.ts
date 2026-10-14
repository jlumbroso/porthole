import * as vscode from 'vscode';
import { askToAutoLock } from './config';
import { log } from './log';
import { BROWSER_EDITOR, MARKDOWN_PREVIEW_EDITOR } from './miniWindow';

// Keeping a floating window to one tab (ADR-0019).
//
// VS Code switches compact mode off when a second tab enters a floating
// window. Porthole used to lock the new window's group with a command, but
// that command locks VS Code's own idea of the active group, which can differ
// from the new window: the lock was skipped on three of five opens in one
// session, and could land on the main window's group (Surveyor, 2026-10-13).
//
// VS Code's setting `workbench.editor.autoLockGroups` makes VS Code lock the
// right group itself, when the page opens as the first tab of a new group
// (editorGroupView.ts L1263–1272 at 1.141.0). It is the person's own setting
// and affects tabs outside porthole, so porthole asks before turning it on:
// at the first pop-out of each session until answered, with "Don't Ask Again"
// saved in user settings (Jérémie's answer to QST-LOCK-METHOD).

const LOCKED_EDITORS = [BROWSER_EDITOR, MARKDOWN_PREVIEW_EDITOR];
const TURN_ON = 'Turn On';
const NOT_NOW = 'Not Now';
const NEVER = "Don't Ask Again";

let askedThisSession = false;

/** For tests: ask again as if VS Code had restarted. */
export function resetAutoLockPrompt(): void {
  askedThisSession = false;
}

function currentAutoLock(): Record<string, boolean> {
  const value = vscode.workspace.getConfiguration('workbench.editor').get<unknown>('autoLockGroups');
  return value && typeof value === 'object' ? { ...(value as Record<string, boolean>) } : {};
}

export function autoLockIsOn(): boolean {
  const current = currentAutoLock();
  return LOCKED_EDITORS.every(id => current[id] === true);
}

/** Asks, at most once per session, whether VS Code may lock porthole's floating windows to one tab. */
export async function offerAutoLock(): Promise<void> {
  if (autoLockIsOn() || !askToAutoLock() || askedThisSession) { return; }
  askedThisSession = true;
  const choice = await vscode.window.showInformationMessage(
    "Keep Porthole's floating windows to one tab?",
    {
      modal: true,
      detail: 'If another file opens inside a floating window, VS Code shows its tabs and status bar again. '
        + 'VS Code can lock each new floating window to its page. This turns on the VS Code setting '
        + '"workbench.editor.autoLockGroups" for the integrated browser and the Markdown preview, which also locks '
        + 'any browser tab or Markdown preview you open as the first tab of a new editor group.',
    },
    TURN_ON, NOT_NOW, NEVER);
  if (choice === TURN_ON) {
    const next = currentAutoLock();
    for (const id of LOCKED_EDITORS) { next[id] = true; }
    await vscode.workspace.getConfiguration('workbench.editor')
      .update('autoLockGroups', next, vscode.ConfigurationTarget.Global);
    log('auto-lock: turned on workbench.editor.autoLockGroups for the integrated browser and the Markdown preview');
  } else if (choice === NEVER) {
    await vscode.workspace.getConfiguration('porthole')
      .update('askToAutoLock', false, vscode.ConfigurationTarget.Global);
    log('auto-lock: will not ask again (porthole.askToAutoLock is now false)');
  } else {
    log('auto-lock: not now; will ask again next session');
  }
}
