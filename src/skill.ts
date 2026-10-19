import * as vscode from 'vscode';
import { createHash } from 'node:crypto';
import { log } from './log';

// Adding Porthole's skill for models to a project (ADR-0016, iteration 3).
//
// The skill ships inside the extension, as the repository's own
// `.claude/skills/porthole/SKILL.md`, and is written to the same path in a
// workspace folder, where every Claude Code session started there finds it.
// One action, reached from the command palette (a person) or from a link
// (a model in a terminal); Porthole's log names both at startup.
//
// Names ruled by the naming review (QST-NAME-SKILL, B, approved 2026-10-19).

export const SKILL_PATH = ['.claude', 'skills', 'porthole', 'SKILL.md'];
export const INSTALL_IT = 'Install It';
export const REPLACE_IT = 'Replace It';

// Written right after the skill's front matter (which must stay first). It says
// which Porthole wrote the file and a checksum of the whole file without this
// line, so a later Porthole can tell an untouched copy, which it may update,
// from one someone edited, which it never overwrites without asking.
const MARK = /^<!-- written by Porthole (\S+); sha256 of this file without this line: ([0-9a-f]{64}) -->\n/m;

const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

/** The bundled skill with Porthole's mark inserted after its front matter. */
export function stamped(bundled: string, version: string): string {
  const frontMatter = /^---\n[\s\S]*?\n---\n/.exec(bundled);
  const at = frontMatter ? frontMatter[0].length : 0;
  return `${bundled.slice(0, at)}<!-- written by Porthole ${version}; sha256 of this file without this line: ${sha256(bundled)} -->\n${bundled.slice(at)}`;
}

export type CopyState = 'absent' | 'current' | 'untouched' | 'edited';

/** What is already at the skill's place in a folder, compared with what Porthole would write. */
export function stateOf(existing: string | undefined, wanted: string): CopyState {
  if (existing === undefined) { return 'absent'; }
  if (existing === wanted) { return 'current'; }
  const mark = MARK.exec(existing);
  if (!mark) { return 'edited'; } // not written by Porthole, or its mark was removed
  return sha256(existing.replace(MARK, '')) === mark[2] ? 'untouched' : 'edited';
}

let extensionUri: vscode.Uri | undefined;
let version = '0.0.0';
let memory: vscode.Memento | undefined;
const CONSENT = 'porthole.skillLinksAllowed';

/** Call once, from `activate`. */
export function initSkill(context: vscode.ExtensionContext): void {
  extensionUri = context.extensionUri;
  version = String(context.extension.packageJSON.version ?? '0.0.0');
  memory = context.workspaceState;
  log('Models can learn to use Porthole from its skill: run \'Porthole: Install the Skill for Models in This Project\', or send vscode://jlumbroso.porthole/v1/install-skill.');
}

async function readText(uri: vscode.Uri): Promise<string | undefined> {
  try { return new TextDecoder().decode(await vscode.workspace.fs.readFile(uri)); } catch { return undefined; }
}

/** Where the skill goes in a folder, as the path a person reads. */
const placeIn = (folder: vscode.WorkspaceFolder) => `${folder.name}/${SKILL_PATH.join('/')}`;

/**
 * Writes the skill into `folder`. An edited copy is replaced only when the
 * person says so, by the same question from the palette or from a link.
 */
export async function installSkillTo(folder: vscode.WorkspaceFolder, from: 'palette' | 'link'): Promise<void> {
  if (!extensionUri) { return; }
  const bundled = await readText(vscode.Uri.joinPath(extensionUri, ...SKILL_PATH));
  if (bundled === undefined) { log('skill: the copy inside the extension is missing'); return; }
  const wanted = stamped(bundled, version);
  const target = vscode.Uri.joinPath(folder.uri, ...SKILL_PATH);
  const state = stateOf(await readText(target), wanted);
  if (state === 'current') {
    log(`skill: ${placeIn(folder)} is already this version`);
    if (from === 'palette') { void vscode.window.showInformationMessage(`Porthole: ${placeIn(folder)} is already up to date.`); }
    return;
  }
  if (state === 'edited') {
    // The same question whichever route asked: the person decides about their
    // edits, never the route (Jérémie, ADR-0016 QST-CHECK-SKILL-INSTALL: a link
    // used to give up here where the palette asked).
    const answer = await vscode.window.showWarningMessage(
      `${placeIn(folder)} was edited since Porthole wrote it. Replace it with the skill from Porthole ${version}?`,
      { modal: true }, REPLACE_IT,
    );
    if (answer !== REPLACE_IT) {
      log(`skill: ${placeIn(folder)} was edited; left as it is`);
      void vscode.window.showInformationMessage(`Porthole: ${folder.name} already has an edited copy of Porthole's skill; Porthole left it as it is.`);
      return;
    }
  }
  await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(folder.uri, ...SKILL_PATH.slice(0, -1)));
  await vscode.workspace.fs.writeFile(target, new TextEncoder().encode(wanted));
  const what = state === 'absent' ? 'installed' : 'updated';
  log(`skill: ${what} ${placeIn(folder)} (Porthole ${version}, from the ${from === 'link' ? 'link' : 'command palette'})`);
  void vscode.window.showInformationMessage(`Porthole ${what} its skill for models: ${placeIn(folder)}.`);
}

/** The command: adds the skill to this window's workspace folder, asking which when there are several. */
export async function installSkill(): Promise<void> {
  const folders = (vscode.workspace.workspaceFolders ?? []).filter(folder => folder.uri.scheme === 'file');
  if (folders.length === 0) {
    void vscode.window.showInformationMessage('Porthole: open a folder first; the skill is installed in a workspace folder.');
    return;
  }
  let folder = folders[0];
  if (folders.length > 1) {
    const picked = await vscode.window.showQuickPick(folders.map(item => ({ label: item.name, folder: item })), { placeHolder: 'Install Porthole\'s skill for models in which folder?' });
    if (!picked) { return; }
    folder = picked.folder;
  }
  await installSkillTo(folder, 'palette');
}

/**
 * The first link in a project asks before writing (QST-SKILL-LINK-ASK, A as
 * built); after a yes, links there go ahead. Returns true to proceed.
 */
export async function linkMayInstallSkill(folder: vscode.WorkspaceFolder): Promise<boolean> {
  if (memory?.get<boolean>(CONSENT)) { return true; }
  const answer = await vscode.window.showWarningMessage(
    `A link from outside VS Code asks Porthole to install its skill for models in ${folder.name} (${SKILL_PATH.join('/')}). Install it?`,
    { modal: true }, INSTALL_IT,
  );
  if (answer !== INSTALL_IT) { return false; }
  await memory?.update(CONSENT, true);
  return true;
}
