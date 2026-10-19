// A stand-in for the `vscode` module, aliased in vite.config.ts's `test` block
// only. It covers exactly what src/ imports and nothing more; grow it when a
// real usage demands it (vscode-extension-testing skill, rule 1).
//
// It models VS Code as far as the tests need: commands the extension registers
// are recorded and callable; every executed command is logged in order; and a
// test can say what a workbench command does (throw, open a tab group, nothing).

type Listener<T> = (event: T) => void;
type CommandFn = (...args: unknown[]) => unknown;

export interface MockTabGroup {
  viewColumn: number;
  isActive: boolean;
  tabs: unknown[];
  activeTab?: unknown;
}

/** Stand-in for vscode.TabInputText: what a tab holds when a file opened as plain text. */
export class TabInputText {
  constructor(readonly uri: unknown) {}
}
interface TabGroupChange {
  opened: MockTabGroup[];
  closed: MockTabGroup[];
  changed: MockTabGroup[];
}

// ── state ────────────────────────────────────────────────────────────────────

const registered = new Map<string, CommandFn>();
const behaviors = new Map<string, CommandFn>();
let executed: Array<{ id: string; args: unknown[] }> = [];
let groupListeners: Array<Listener<TabGroupChange>> = [];
let groups: MockTabGroup[] = [];
let config: Record<string, unknown> = {};
// Other sections the extension reads, such as `workbench.editor`. By default
// VS Code's auto-lock is already on, so the one-time consent question
// (ADR-0019) stays out of tests that are not about it.
let otherConfig: Record<string, Record<string, unknown>> = {};
// VS Code's own defaults, per section. `get` merges them under the user's
// values for object settings, as VS Code does; `inspect` keeps them apart.
let defaultConfig: Record<string, Record<string, unknown>> = {};
let updates: Array<{ section: string; key: string; value: unknown; target: unknown }> = [];
let modalAnswers: Array<string | undefined> = [];
let modals: Array<{ message: string; buttons: string[] }> = [];
let writtenFiles = new Map<string, string>();
let configListeners: Array<(event: { affectsConfiguration: (key: string) => boolean }) => void> = [];
let quickPickAnswers: Array<(items: Array<{ label: string }>) => unknown> = [];
let quickPicks: Array<{ labels: string[]; options: unknown }> = [];
let logged: string[] = [];
const settingsRead = new Set<string>();
let messages: string[] = [];
let activeDocumentUri: unknown;
let tabListeners: Array<Listener<{ opened: unknown[]; closed: unknown[]; changed: unknown[] }>> = [];
let visibleEditors: Array<{ document: { uri: unknown }; viewColumn: number; selection: unknown }> = [];
let shownDocuments: Array<{ uri: unknown; options: unknown }> = [];
let uriHandler: { handleUri: (uri: unknown) => unknown } | undefined;
let workspaceFolders: Array<{ name: string; uri: unknown; index: number }> | undefined;

// ── helpers for tests ────────────────────────────────────────────────────────

export function resetVscodeMock(): void {
  registered.clear();
  behaviors.clear();
  executed = [];
  groupListeners = [];
  groups = [{ viewColumn: 1, isActive: true, tabs: [] }];
  config = {};
  otherConfig = { 'workbench.editor': { autoLockGroups: { 'workbench.editor.browser': true, 'vscode.markdown.preview.editor': true } } };
  defaultConfig = {};
  updates = [];
  modalAnswers = [];
  modals = [];
  quickPickAnswers = [];
  writtenFiles = new Map();
  configListeners = [];
  quickPicks = [];
  logged = [];
  settingsRead.clear();
  messages = [];
  activeDocumentUri = undefined;
  uriHandler = undefined;
  workspaceFolders = undefined;
  tabListeners = [];
  visibleEditors = [];
  shownDocuments = [];
}

export const getRegisteredCommand = (id: string) => registered.get(id);
export const registeredCommandIds = () => [...registered.keys()];
export const executedCommands = () => executed.map(call => call.id);
export const executedCalls = () => executed;
export const loggedLines = () => logged;
/** Every `porthole.*` key the extension has read since the last reset. */
export const settingsReadKeys = () => [...settingsRead];
export const shownMessages = () => messages;

/** Says what a command VS Code owns does when the extension executes it. */
export function setCommandBehavior(id: string, behavior: CommandFn): void {
  behaviors.set(id, behavior);
}

/** Sets `porthole.*` settings, by their short names. */
export function setConfig(values: Record<string, unknown>): void {
  config = { ...config, ...values };
}

/** Sets settings outside `porthole.*`, for example `setSection('workbench.editor', { autoLockGroups: {} })`. */
export function setSection(section: string, values: Record<string, unknown>): void {
  otherConfig[section] = { ...(otherConfig[section] ?? {}), ...values };
}

/** Sets VS Code's default values for a section (not the user's). */
export function setSectionDefaults(section: string, values: Record<string, unknown>): void {
  defaultConfig[section] = { ...(defaultConfig[section] ?? {}), ...values };
}

/** Settings the extension wrote, in order. */
export const settingUpdates = () => updates;

/** A file already on disk before the extension reads it (for instance, written by another VS Code window). */
export function seedFile(path: string, content: string): void {
  writtenFiles.set(path, content);
}

/** Files the extension wrote through `workspace.fs`, by path, latest content. */
export const writtenFile = (path: string) => writtenFiles.get(path);

/** What VS Code does when the person changes a setting: tells every listener. */
export function changeSetting(key: string, value: unknown): void {
  setConfig({ [key.replace(/^porthole\./, '')]: value });
  configListeners.slice().forEach(listener => listener({ affectsConfiguration: (k: string) => key === k || key.startsWith(`${k}.`) }));
}

/** The quick picks the extension showed: their item labels and options. */
export const quickPicksShown = () => quickPicks;

/** How the human answers the next quick pick: a function choosing from its items (or returning undefined: Escape). */
export function answerNextQuickPick(choose: (items: Array<{ label: string }>) => unknown): void {
  quickPickAnswers.push(choose);
}

/** The modal questions the extension asked, in order. */
export const modalsShown = () => modals;

/** What the human answers to the next modal question (undefined: they closed it). */
export function answerNextModal(answer: string | undefined): void {
  modalAnswers.push(answer);
}

export function setActiveDocument(uri: unknown): void {
  activeDocumentUri = uri;
}

/** The window's workspace folders, by absolute path; the name is the folder's own, as VS Code shows it. */
export function setWorkspaceFolders(paths: string[]): void {
  workspaceFolders = paths.map((path, index) => ({ name: path.split('/').filter(Boolean).at(-1)!, uri: Uri.file(path), index }));
}

/**
 * What VS Code does with `vscode://jlumbroso.porthole<path>?<query>`: it hands
 * the extension a URI whose query is already percent-decoded, as its `uri.ts`
 * does (1.141.0). Pass the query as a sender would type it, encoded.
 */
export async function followLink(path: string, encodedQuery: string): Promise<void> {
  if (!uriHandler) { throw new Error('mock: no URI handler registered'); }
  await uriHandler.handleUri({ scheme: 'vscode', authority: 'jlumbroso.porthole', path, query: decodeURIComponent(encodedQuery) });
}

/** What VS Code does when a floating window appears: a new, active tab group. */
export function openFloatingGroup(options: { takesFocus?: boolean; asTextOf?: unknown; input?: unknown; label?: string } = {}): MockTabGroup {
  const takesFocus = options.takesFocus ?? true;
  if (takesFocus) { groups.forEach(group => { group.isActive = false; }); }
  // A browser tab's input is opaque to extensions (undefined); a text tab's is a TabInputText.
  const input = options.input ?? (options.asTextOf ? new TabInputText(options.asTextOf) : undefined);
  const tab: Record<string, unknown> = { label: options.label ?? 'tasks.html', input, isDirty: false };
  const group: MockTabGroup = { viewColumn: groups.length + 1, isActive: takesFocus, tabs: [tab], activeTab: tab };
  tab.group = group;
  groups.push(group);
  groupListeners.slice().forEach(listener => listener({ opened: [group], closed: [], changed: [] }));
  return group;
}

/**
 * What VS Code does when another extension opens an editor into an existing
 * group (for instance by its column number): a new tab, reported to listeners.
 * `input` is what the extension API shows, such as `{ uri }` for a text file.
 */
export function openTabIn(group: MockTabGroup, input: unknown, options: { isDirty?: boolean; label?: string } = {}): Record<string, unknown> {
  const tab: Record<string, unknown> = { label: options.label ?? 'tab', input, isDirty: options.isDirty ?? false, group };
  group.tabs.push(tab);
  group.activeTab = tab;
  tabListeners.slice().forEach(listener => listener({ opened: [tab], closed: [], changed: [] }));
  return tab;
}

/** A text editor VS Code shows, with the selection the other extension set. */
export function showEditor(uri: unknown, viewColumn: number, selection: unknown): void {
  visibleEditors.push({ document: { uri }, viewColumn, selection });
}

/** Every `window.showTextDocument` call: the document and its options. */
export const shownTextDocuments = () => shownDocuments;

/** What VS Code does when a floating window goes away: its group closes and the main window is active again. */
export function closeFloatingGroup(target: MockTabGroup): void {
  groups = groups.filter(group => group !== target);
  groups.forEach((group, index) => { group.isActive = index === 0; });
  groupListeners.slice().forEach(listener => listener({ opened: [], closed: [target], changed: [groups[0]] }));
}

/** The main window's tab group (the first one, always present). */
export const mainGroup = (): MockTabGroup => groups[0];

export function focusGroup(target: MockTabGroup): void {
  groups.forEach(group => { group.isActive = group === target; });
}

// ── the module surface src/ imports ──────────────────────────────────────────

export const version = '1.141.0-mock';
export const env = { appName: 'Visual Studio Code (mock)' };

export const Uri = {
  file: (fsPath: string) => ({ scheme: 'file', fsPath, path: fsPath, toString: () => `file://${fsPath}` }),
  joinPath: (base: { fsPath: string }, ...parts: string[]) => Uri.file([base.fsPath, ...parts].join('/')),
  parse: (value: string) => {
    const scheme = value.slice(0, value.indexOf(':'));
    const path = value.replace(/^[a-z-]+:(\/\/[^/]*)?/, '');
    return { scheme, fsPath: path, path, toString: () => value };
  },
};

export const commands = {
  registerCommand(id: string, handler: CommandFn) {
    registered.set(id, handler);
    return { dispose: () => { registered.delete(id); } };
  },
  async executeCommand(id: string, ...args: unknown[]): Promise<unknown> {
    executed.push({ id, args });
    const own = registered.get(id);
    if (own) { return own(...args); }
    const behavior = behaviors.get(id);
    return behavior ? behavior(...args) : undefined;
  },
};

export const window = {
  createOutputChannel(_name: string, _options?: { log: true }) {
    return { info: (line: string) => { logged.push(line); }, dispose() {} };
  },
  async showInformationMessage(message: string, ...rest: unknown[]) {
    const options = rest[0];
    if (options && typeof options === 'object' && (options as { modal?: boolean }).modal) {
      modals.push({ message, buttons: rest.slice(1) as string[] });
      return modalAnswers.shift();
    }
    messages.push(message);
    return undefined; // the human pressed Escape
  },
  async showQuickPick(items: Array<{ label: string }>, options?: unknown) {
    quickPicks.push({ labels: items.map(item => item.label), options });
    const choose = quickPickAnswers.shift();
    return choose ? choose(items) : undefined;
  },
  async showWarningMessage(message: string, ...rest: unknown[]) {
    return window.showInformationMessage(message, ...rest);
  },
  registerUriHandler(handler: { handleUri: (uri: unknown) => unknown }) {
    uriHandler = handler;
    return { dispose: () => { uriHandler = undefined; } };
  },
  get visibleTextEditors() { return visibleEditors; },
  async showTextDocument(uri: unknown, options?: unknown) {
    shownDocuments.push({ uri, options });
    return { document: { uri } };
  },
  get activeTextEditor() {
    return activeDocumentUri ? { document: { uri: activeDocumentUri } } : undefined;
  },
  tabGroups: {
    get all() { return groups; },
    get activeTabGroup() { return groups.find(group => group.isActive) ?? groups[0]; },
    onDidChangeTabGroups(listener: Listener<TabGroupChange>) {
      groupListeners.push(listener);
      return { dispose: () => { groupListeners = groupListeners.filter(entry => entry !== listener); } };
    },
    /** VS Code closes the group's tabs, and with them a floating window's group. */
    async close(target: unknown, _preserveFocus?: boolean) {
      for (const item of Array.isArray(target) ? target : [target]) {
        if (groups.includes(item as MockTabGroup)) { closeFloatingGroup(item as MockTabGroup); continue; }
        const owner = groups.find(group => group.tabs.includes(item));
        if (!owner) { throw new Error('mock: that tab or tab group is already closed'); }
        owner.tabs = owner.tabs.filter(tab => tab !== item);
        owner.activeTab = owner.tabs.at(-1);
        tabListeners.slice().forEach(listener => listener({ opened: [], closed: [item], changed: [] }));
      }
      return true;
    },
    onDidChangeTabs(listener: Listener<{ opened: unknown[]; closed: unknown[]; changed: unknown[] }>) {
      tabListeners.push(listener);
      return { dispose: () => { tabListeners = tabListeners.filter(entry => entry !== listener); } };
    },
  },
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export enum ConfigurationTarget { Global = 1, Workspace = 2, WorkspaceFolder = 3 }

export const workspace = {
  get workspaceFolders() { return workspaceFolders; },
  fs: {
    async readFile(uri: { fsPath: string }) {
      const text = writtenFiles.get(uri.fsPath);
      if (text === undefined) { throw new Error(`mock: no such file ${uri.fsPath}`); }
      return new TextEncoder().encode(text);
    },
    async createDirectory(_uri: { fsPath: string }) { // files are kept by path; folders need no record
    },
    async writeFile(uri: { fsPath: string }, content: Uint8Array) {
      writtenFiles.set(uri.fsPath, new TextDecoder().decode(content));
    },
  },
  onDidChangeConfiguration(listener: (event: { affectsConfiguration: (key: string) => boolean }) => void) {
    configListeners.push(listener);
    return { dispose: () => { configListeners = configListeners.filter(entry => entry !== listener); } };
  },
  getConfiguration(scope: string) {
    // `porthole.<group>` reads the same porthole settings, keys relative to the group.
    const grouped = scope.startsWith('porthole.');
    const section = grouped ? 'porthole' : scope;
    const prefix = grouped ? `${scope.slice('porthole.'.length)}.` : '';
    const values = section === 'porthole' ? config : otherConfig[section];
    if (!values) { throw new Error(`mock: unexpected configuration section "${scope}"`); }
    return {
      get<T>(short: string, fallback?: T): T | undefined {
        const key = prefix + short;
        if (section === 'porthole') { settingsRead.add(key); }
        const user = values[key];
        const byDefault = defaultConfig[section]?.[key];
        if (isPlainObject(user) && isPlainObject(byDefault)) { return { ...byDefault, ...user } as T; }
        if (key in values) { return user as T; }
        return byDefault !== undefined ? (byDefault as T) : fallback;
      },
      inspect<T>(short: string) {
        const key = prefix + short;
        return { key, defaultValue: defaultConfig[section]?.[key] as T, globalValue: values[key] as T };
      },
      async update(short: string, value: unknown, target?: unknown) {
        const key = prefix + short;
        updates.push({ section, key, value, target });
        values[key] = value;
      },
    };
  },
};

resetVscodeMock();
