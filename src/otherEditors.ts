import * as vscode from 'vscode';
import { describeError, log } from './log';

// Editors other extensions put into Porthole's floating windows (ADR-0025).
//
// VS Code's auto-lock keeps a floating window to its page against editors
// opened without a target, but an extension that names a column number
// reaches a group by its place among all groups, floating windows included,
// and a targeted group takes the editor even when locked (ADR-0024, finding 3:
// the ADR Manager's "Open in file" used ViewColumn.Two). The extra tab brings
// the tab bar back. Porthole moves such a tab to the main window by default;
// one setting turns that off or makes Porthole ask (Jérémie's three modes: "ask"
// is ready to become the default if anyone reports a moved tab as a wrong).
//
// Names are provisional until the naming review rules (QST-NAME-GUARD).

export type GuardMode = 'move' | 'ask' | 'off';

export const MOVE_NOW = 'Approve Now';
export const KEEP_NOW = 'Deny Now';
export const MOVE_ALWAYS = 'Approve Always';
export const MOVE_NEVER = 'Never Approve';

/**
 * How long to wait after the tab appears before reading where its cursor is.
 * The other extension sets the cursor after its open returns (the ADR Manager
 * selects the question's line), which is after VS Code reports the new tab.
 */
export const SETTLE_MS = 250;

export function guardMode(): GuardMode {
  const value = vscode.workspace.getConfiguration('porthole').get<string>('otherEditors', 'move');
  return value === 'ask' || value === 'off' ? value : 'move';
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface Reopenable {
  uri: vscode.Uri;
  reopen: (column: vscode.ViewColumn) => Thenable<unknown>;
}

/**
 * How to open this tab's editor again elsewhere, or `undefined` when Porthole
 * cannot: a webview or a terminal names no file, and a browser tab says nothing
 * about its page. A text file keeps the selection it has in this window.
 */
function reopenable(tab: vscode.Tab): Reopenable | undefined {
  const input = tab.input as { uri?: vscode.Uri; viewType?: unknown; notebookType?: unknown } | undefined;
  const uri = input?.uri;
  if (!uri) { return undefined; }
  const editorType = typeof input.viewType === 'string' ? input.viewType : typeof input.notebookType === 'string' ? input.notebookType : undefined;
  if (editorType) {
    return { uri, reopen: column => vscode.commands.executeCommand('vscode.openWith', uri, editorType, column) };
  }
  const editor = vscode.window.visibleTextEditors.find(shown => shown.document.uri.toString() === uri.toString() && shown.viewColumn === tab.group.viewColumn);
  const selection = editor?.selection;
  return { uri, reopen: column => vscode.window.showTextDocument(uri, { viewColumn: column, selection, preserveFocus: true }) };
}

const nameOf = (uri: vscode.Uri) => uri.path.split('/').filter(Boolean).at(-1) ?? uri.toString();

/** Asks, in "ask" mode; true when the tab should move. The two "always/never" answers change the setting. */
async function askToMove(uri: vscode.Uri): Promise<boolean> {
  const answer = await vscode.window.showInformationMessage(
    `${nameOf(uri)} opened inside Porthole's floating window. Move it to the main window?`,
    MOVE_NOW, KEEP_NOW, MOVE_ALWAYS, MOVE_NEVER,
  );
  if (answer === MOVE_ALWAYS || answer === MOVE_NEVER) {
    const mode: GuardMode = answer === MOVE_ALWAYS ? 'move' : 'off';
    await vscode.workspace.getConfiguration('porthole').update('otherEditors', mode, vscode.ConfigurationTarget.Global);
    log(`other editors: porthole.otherEditors set to ${mode}`);
  }
  return answer === MOVE_NOW || answer === MOVE_ALWAYS;
}

/**
 * Watches for tabs opening in Porthole's floating windows. `pageShownIn` says
 * which file a group's window shows, or `undefined` for a group that is not one
 * of Porthole's windows. Call once, from `activate`.
 */
export function guardFloatingWindows(pageShownIn: (group: vscode.TabGroup) => vscode.Uri | undefined): vscode.Disposable {
  const consider = async (tab: vscode.Tab) => {
    const page = pageShownIn(tab.group);
    if (!page) { return; }
    const mode = guardMode();
    if (mode === 'off') { return; }
    await sleep(SETTLE_MS);
    const target = reopenable(tab);
    if (!target) { return; }                                   // nothing Porthole can open again
    if (target.uri.toString() === page.toString()) { return; } // the window's own page
    if (tab.isDirty) {
      log(`other editors: ${target.uri.toString()} opened in a floating window has unsaved changes; left where it is`);
      return;
    }
    if (mode === 'ask' && !(await askToMove(target.uri))) { return; }
    if (!tab.group.tabs.includes(tab)) { return; }             // closed or moved meanwhile
    const main = vscode.window.tabGroups.all.find(group => !pageShownIn(group));
    if (!main) { log('other editors: no editor group outside Porthole\'s windows to move it to'); return; }
    try {
      await vscode.window.tabGroups.close(tab, true);
      await target.reopen(main.viewColumn);
      log(`other editors: moved ${target.uri.toString()} out of a floating window, into column ${main.viewColumn}`);
    } catch (err) {
      log(`other editors: could not move ${target.uri.toString()}: ${describeError(err)}`);
    }
  };
  return vscode.window.tabGroups.onDidChangeTabs(event => {
    for (const tab of event.opened) { void consider(tab); }
  });
}
