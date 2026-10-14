import * as vscode from 'vscode';
import { askToAutoLock } from './config';
import { log } from './log';
import { announceSettingChange } from './settingsReview';
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

const asMap = (value: unknown): Record<string, boolean> =>
  value && typeof value === 'object' ? { ...(value as Record<string, boolean>) } : {};

/** The effective value, defaults included: what VS Code actually does. */
function currentAutoLock(): Record<string, boolean> {
  return asMap(vscode.workspace.getConfiguration('workbench.editor').get<unknown>('autoLockGroups'));
}

/**
 * Only what the person set in their user settings. Writing back the effective
 * value instead copied all of VS Code's ~25 defaults into their settings.json,
 * freezing them against future VS Code changes (seen 2026-10-13, ADR-0020).
 */
function userAutoLock(): Record<string, boolean> {
  return asMap(vscode.workspace.getConfiguration('workbench.editor').inspect<unknown>('autoLockGroups')?.globalValue);
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
    "Keep Porthole's floating windows compact?",
    {
      modal: true,
      detail: 'Why: a floating window stays compact (just the page, no tabs or status bar) only while it holds a single tab. '
        + 'If another file ever opens into it, VS Code brings the tabs and status bar back. Locking the window to its page prevents that.\n\n'
        + 'It rarely affects anything else: VS Code locks a browser tab or Markdown preview only when it is the first tab '
        + 'of a new editor group, which is how Porthole opens its windows (and also when you open one yourself in a new group). Turning this on sets the VS Code setting '
        + '"workbench.editor.autoLockGroups" for those two editors.\n\n'
        + 'Not Now changes nothing; a floating window loses compact mode only if a second file happens to open inside it. '
        + 'Porthole will ask again next session.',
    },
    TURN_ON, NOT_NOW, NEVER);
  if (choice === TURN_ON) {
    const next = userAutoLock();
    for (const id of LOCKED_EDITORS) { next[id] = true; }
    await vscode.workspace.getConfiguration('workbench.editor')
      .update('autoLockGroups', next, vscode.ConfigurationTarget.Global);
    log('auto-lock: turned on workbench.editor.autoLockGroups for the integrated browser and the Markdown preview');
    void announceSettingChange('workbench.editor.autoLockGroups now locks the integrated browser and the Markdown preview to one tab when they open in a new group.');
  } else if (choice === NEVER) {
    await vscode.workspace.getConfiguration('porthole')
      .update('askToAutoLock', false, vscode.ConfigurationTarget.Global);
    log('auto-lock: will not ask again (porthole.askToAutoLock is now false)');
    void announceSettingChange('porthole.askToAutoLock is now false, so Porthole will not ask again.');
  } else {
    log('auto-lock: not now; will ask again next session');
  }
}
