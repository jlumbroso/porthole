import * as vscode from 'vscode';
import { log } from './log';
import { BROWSER_EDITOR, MARKDOWN_PREVIEW_EDITOR } from './miniWindow';

// "Review and Reset Settings…" (Jérémie's answer to QST-SETTINGS-CLEANUP,
// ADR-0020): Porthole once wrote VS Code's defaults into his settings by
// mistake. Whatever Porthole writes, the person can see it and undo it, one
// entry at a time, from a single command.

const PORTHOLE_KEYS = ['sizes', 'position', 'compact', 'alwaysOnTop', 'useInternalCommand', 'askToKeepCompact', 'markdown.colorScheme',
  'outsideLinks.enabled', 'outsideLinks.allowWorkspaceFolders', 'outsideLinks.allowedFolders', 'outsideLinks.allowLocalFiles', 'outsideLinks.actions.open', 'otherEditors'];
const LOCKED_EDITORS = [BROWSER_EDITOR, MARKDOWN_PREVIEW_EDITOR];

interface Entry extends vscode.QuickPickItem {
  remove: () => Thenable<void>;
}

const show = (value: unknown) => JSON.stringify(value);

function userEntries(): Entry[] {
  const entries: Entry[] = [];
  const porthole = vscode.workspace.getConfiguration('porthole');
  for (const key of PORTHOLE_KEYS) {
    const value = porthole.inspect<unknown>(key)?.globalValue;
    if (value === undefined) { continue; }
    entries.push({
      label: `porthole.${key}`,
      description: `is ${show(value)}`,
      detail: 'Removing it returns this setting to Porthole\'s default.',
      remove: () => porthole.update(key, undefined, vscode.ConfigurationTarget.Global),
    });
  }
  const editor = vscode.workspace.getConfiguration('workbench.editor');
  const autoLock = editor.inspect<unknown>('autoLockGroups')?.globalValue;
  if (autoLock && typeof autoLock === 'object') {
    for (const id of LOCKED_EDITORS) {
      if (!(id in autoLock)) { continue; }
      entries.push({
        label: `workbench.editor.autoLockGroups › ${id}`,
        description: `is ${show((autoLock as Record<string, unknown>)[id])}`,
        detail: 'Set when you allowed Porthole to keep its floating windows to one tab. Removing it returns this entry to VS Code\'s default.',
        remove: async () => {
          const current = { ...(editor.inspect<Record<string, unknown>>('autoLockGroups')?.globalValue ?? {}) };
          delete current[id];
          await editor.update('autoLockGroups', Object.keys(current).length ? current : undefined, vscode.ConfigurationTarget.Global);
        },
      });
    }
  }
  return entries;
}

/** Shows the user settings Porthole has written or reads, and removes the ones the person picks. */
export async function reviewSettings(): Promise<void> {
  const entries = userEntries();
  if (entries.length === 0) {
    void vscode.window.showInformationMessage('Porthole: none of your user settings are set by or for Porthole. Nothing to reset.');
    return;
  }
  const picked = await vscode.window.showQuickPick(entries, {
    canPickMany: true,
    title: 'Porthole: Review and Reset Settings',
    placeHolder: 'These user settings are set by or for Porthole. Tick the ones to remove, then press Enter.',
  });
  if (!picked || picked.length === 0) { return; }
  for (const entry of picked) {
    await entry.remove();
    log(`settings: removed ${entry.label} (was ${entry.description?.replace(/^is /, '')})`);
  }
  void vscode.window.showInformationMessage(`Porthole: removed ${picked.length} setting${picked.length === 1 ? '' : 's'}.`);
}

/** After Porthole changes a setting: say what changed, and offer the way back. */
export async function announceSettingChange(what: string): Promise<void> {
  const choice = await vscode.window.showInformationMessage(`Porthole changed your user settings: ${what}`, 'Review and Reset…');
  if (choice) { await reviewSettings(); }
}
