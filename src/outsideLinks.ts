import * as vscode from 'vscode';
import { realpath } from 'node:fs/promises';
import * as nodePath from 'node:path';
import { log } from './log';
import type { Size } from './config';

// Outside `open` (ADR-0013): a terminal, a script or a model asks for a page
// with a link such as
//   vscode://jlumbroso.porthole/v1/open?file=/abs/tasks.html&width=420&height=640
// The words are the naming review's (ADR-0017, ADR-0021). Everything not
// explicitly allowed is refused, and every refusal says why.

export const OPEN_PATHS = ['/v1/open', '/open']; // an unversioned link is read as version 1 (ADR-0017)

export interface OpenRequest {
  file: string;
  size?: Size;
  repo?: string;
}

export type Parsed = { request: OpenRequest } | { refused: string };

const isPage = (path: string) => /\.(html?|md|markdown)$/i.test(path);

function positiveInteger(raw: string | undefined): number | undefined | 'bad' {
  if (raw === undefined) { return undefined; }
  return /^\d{1,5}$/.test(raw) && Number(raw) > 0 ? Number(raw) : 'bad';
}

/**
 * The parameters of a query VS Code has already percent-decoded (it decodes
 * every component of a URI before an extension sees it; `uri.ts` at 1.141.0).
 * Decoding again, as `URLSearchParams` would, turns `+` into a space and
 * `%41` in a file name into `A`. So nothing is decoded here: a new parameter
 * starts only where `&name=` does, and spaces, `+` and `%` in a path survive.
 * A file name containing `&` followed by letters and `=` cannot be sent.
 * Safety does not depend on any of this: the decision is made on the resolved
 * real path, however the text was spelled (`resolveTarget`).
 */
export function readQuery(query: string): Map<string, string> | { refused: string } {
  const params = new Map<string, string>();
  const starts = [...query.matchAll(/(?:^|&)([A-Za-z]+)=/g)];
  for (const [index, start] of starts.entries()) {
    const from = start.index + start[0].length;
    const to = index + 1 < starts.length ? starts[index + 1].index : query.length;
    if (params.has(start[1])) { return { refused: `the link gives ${start[1]} twice` }; }
    params.set(start[1], query.slice(from, to));
  }
  return params;
}

/** Reads a link VS Code handed to Porthole. */
export function parseLink(uri: vscode.Uri): Parsed {
  if (!OPEN_PATHS.includes(uri.path)) {
    return { refused: /^\/v\d+\//.test(uri.path) && !uri.path.startsWith('/v1/')
      ? `this link is for a newer version of Porthole (${uri.path})`
      : `Porthole does not understand ${uri.path} yet; it can only open a page` };
  }
  const query = readQuery(uri.query);
  if (!(query instanceof Map)) { return query; }
  const unknown = [...query.keys()].filter(key => !['file', 'width', 'height', 'repo'].includes(key));
  if (unknown.length > 0) { log(`outside link: ignoring ${unknown.join(', ')}`); }
  const file = query.get('file');
  if (!file) { return { refused: 'the link names no file (expected ?file=…)' }; }
  const width = positiveInteger(query.get('width'));
  const height = positiveInteger(query.get('height'));
  if (width === 'bad' || height === 'bad') { return { refused: 'width and height must be whole numbers of pixels' }; }
  if ((width === undefined) !== (height === undefined)) { return { refused: 'give both width and height, or neither' }; }
  const repo = query.get('repo');
  return { request: { file, repo, size: width && height ? { name: `${width}×${height}`, width, height } : undefined } };
}

const caseInsensitive = process.platform === 'darwin' || process.platform === 'win32';
const comparable = (path: string) => (caseInsensitive ? path.toLowerCase() : path);

/** Whether `path` is `root` or inside it; both are already real paths. */
export function isInside(root: string, path: string): boolean {
  const relative = nodePath.relative(comparable(root), comparable(path));
  return relative === '' || (!relative.startsWith('..') && !nodePath.isAbsolute(relative));
}

async function realOrUndefined(path: string): Promise<string | undefined> {
  try { return await realpath(path); } catch { return undefined; }
}

const localFolders = () => (vscode.workspace.workspaceFolders ?? []).filter(folder => folder.uri.scheme === 'file');

export type Resolved = { path: string; note?: string } | { refused: string };

/**
 * Finds the file a request means, as a real path: `..`, symbolic links and
 * letter case are all settled here, before any allowlist compares paths
 * (ADR-0013). A relative path is looked up in this window's workspace folders;
 * with `repo`, only in the folder of that name. Handing a link on to another
 * VS Code window is not built yet.
 */
export async function resolveTarget(request: OpenRequest): Promise<Resolved> {
  let candidate: string;
  let note: string | undefined;
  if (nodePath.isAbsolute(request.file)) {
    candidate = request.file;
    if (request.repo) {
      const named = localFolders().find(folder => folder.name === request.repo);
      if (!named) { note = `the link names repository ${request.repo}, which is not open in this window`; }
      else if (!isInside(await realOrUndefined(named.uri.fsPath) ?? named.uri.fsPath, await realOrUndefined(candidate) ?? candidate)) {
        note = `the file is not inside ${request.repo}, as the link says it is`;
      }
    }
  } else {
    const folders = request.repo ? localFolders().filter(folder => folder.name === request.repo) : localFolders();
    if (folders.length === 0) {
      return { refused: request.repo
        ? `no workspace folder named ${request.repo} is open in this window`
        : `${request.file} is a relative path, and this window has no workspace folder to look in` };
    }
    const found: string[] = [];
    for (const folder of folders) {
      const real = await realOrUndefined(nodePath.resolve(folder.uri.fsPath, request.file));
      if (real) { found.push(real); }
    }
    if (found.length === 0) { return { refused: `${request.file} is not in ${folders.map(folder => folder.name).join(', ')}` }; }
    if (new Set(found.map(comparable)).size > 1) {
      return { refused: `${request.file} exists in more than one workspace folder; add repo=<folder name> to the link` };
    }
    candidate = found[0];
  }
  const path = await realOrUndefined(candidate);
  if (!path) { return { refused: `${request.file} does not exist` }; }
  if (!isPage(path)) { return { refused: `${nodePath.basename(path)} is not an HTML or Markdown file` }; }
  return { path, note };
}

const cfg = () => vscode.workspace.getConfiguration('porthole.outsideLinks');

/** Which setting lets this real path be opened, or `undefined` when none does. */
export async function allowedBy(path: string): Promise<string | undefined> {
  if (cfg().get<boolean>('allowWorkspaceFolders', true)) {
    for (const folder of localFolders()) {
      const root = await realOrUndefined(folder.uri.fsPath);
      if (root && isInside(root, path)) { return 'allowWorkspaceFolders'; }
    }
  }
  const extra = cfg().get<unknown>('allowedFolders', []);
  for (const entry of Array.isArray(extra) ? extra : []) {
    if (typeof entry !== 'string' || !nodePath.isAbsolute(entry)) { continue; }
    const root = await realOrUndefined(entry);
    if (root && isInside(root, path)) { return 'allowedFolders'; }
  }
  if (cfg().get<boolean>('allowLocalFiles', false)) { return 'allowLocalFiles'; }
  return undefined;
}

export const outsideLinksEnabled = () => cfg().get<boolean>('enabled', true);
export const actionAllowed = (verb: string) => cfg().get<boolean>(`actions.${verb}`, true);

export const OPEN_ONCE = 'Open Once';
export const ALLOW_FOLDER = 'Allow This Folder';

/**
 * A link asks for a file no setting allows: ask, once, and say which setting
 * would allow it (QST-OPEN-CONFIRM, C — the prompt teaches the settings).
 */
async function askToOpen(path: string): Promise<boolean> {
  const folder = nodePath.dirname(path);
  const answer = await vscode.window.showWarningMessage(
    `A link from outside VS Code asks Porthole to open ${path}. Open it?`,
    // Words ruled by the naming review (ADR-0013, QST-NAME-OPEN-WORDS, B).
    { modal: true, detail: `Your settings don't yet cover this file. ${OPEN_ONCE} opens it this time only. ${ALLOW_FOLDER} adds ${folder} to porthole.outsideLinks.allowedFolders, so links can open files there without asking.` },
    OPEN_ONCE, ALLOW_FOLDER,
  );
  if (answer === ALLOW_FOLDER) {
    const current = cfg().inspect<unknown>('allowedFolders')?.globalValue;
    const list = Array.isArray(current) ? current.filter(entry => typeof entry === 'string') : [];
    await cfg().update('allowedFolders', [...list, folder], vscode.ConfigurationTarget.Global);
    log(`outside link: ${folder} added to porthole.outsideLinks.allowedFolders`);
  }
  return answer === OPEN_ONCE || answer === ALLOW_FOLDER;
}

function refuse(reason: string): void {
  log(`outside link refused: ${reason}`);
  void vscode.window.showInformationMessage(`Porthole did not open a link from outside VS Code: ${reason}.`);
}

/**
 * The `vscode://jlumbroso.porthole/…` handler. VS Code asks the person once
 * before it hands Porthole its first link; it does not say which program sent
 * the link, so the log records what the link itself says.
 */
export async function handleLink(uri: vscode.Uri, open: (file: vscode.Uri, size?: Size) => Promise<void>): Promise<void> {
  log(`outside link received: ${uri.path}?${uri.query}`);
  if (!outsideLinksEnabled()) { refuse('outside links are turned off (porthole.outsideLinks.enabled)'); return; }
  const parsed = parseLink(uri);
  if ('refused' in parsed) { refuse(parsed.refused); return; }
  if (!actionAllowed('open')) { refuse('outside links may not open pages (porthole.outsideLinks.actions.open)'); return; }
  const resolved = await resolveTarget(parsed.request);
  if ('refused' in resolved) { refuse(resolved.refused); return; }
  if (resolved.note) {
    log(`outside link: ${resolved.note}`);
    void vscode.window.showWarningMessage(`Porthole: ${resolved.note}; opening ${resolved.path} as given.`);
  }
  const setting = await allowedBy(resolved.path);
  if (setting) {
    log(`outside link: opening ${resolved.path} (allowed by porthole.outsideLinks.${setting})`);
  } else if (!(await askToOpen(resolved.path))) {
    log(`outside link: ${resolved.path} not opened; the person declined`);
    return;
  }
  await open(vscode.Uri.file(resolved.path), parsed.request.size);
}
