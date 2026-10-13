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
let logged: string[] = [];
const settingsRead = new Set<string>();
let messages: string[] = [];
let activeDocumentUri: unknown;

// ── helpers for tests ────────────────────────────────────────────────────────

export function resetVscodeMock(): void {
  registered.clear();
  behaviors.clear();
  executed = [];
  groupListeners = [];
  groups = [{ viewColumn: 1, isActive: true, tabs: [] }];
  config = {};
  logged = [];
  settingsRead.clear();
  messages = [];
  activeDocumentUri = undefined;
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

export function setActiveDocument(uri: unknown): void {
  activeDocumentUri = uri;
}

/** What VS Code does when a floating window appears: a new, active tab group. */
export function openFloatingGroup(options: { takesFocus?: boolean } = {}): MockTabGroup {
  const takesFocus = options.takesFocus ?? true;
  if (takesFocus) { groups.forEach(group => { group.isActive = false; }); }
  const group: MockTabGroup = { viewColumn: groups.length + 1, isActive: takesFocus, tabs: [{ label: 'tasks.html' }] };
  groups.push(group);
  groupListeners.slice().forEach(listener => listener({ opened: [group], closed: [], changed: [] }));
  return group;
}

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
  async showInformationMessage(message: string) {
    messages.push(message);
    return undefined; // the human pressed Escape
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
  },
};

export const workspace = {
  getConfiguration(section: string) {
    if (section !== 'porthole') { throw new Error(`mock: unexpected configuration section "${section}"`); }
    return {
      get<T>(key: string, fallback?: T): T | undefined {
        settingsRead.add(key);
        return key in config ? (config[key] as T) : fallback;
      },
    };
  },
};

resetVscodeMock();
