// Smoke run of spike/extension.js against a stub of the `vscode` module.
//
// Context: Spike 0 costs the human a prepared slot of attention. A typo in the
// spike (a bad property name, a throw in the logger) would spend that slot on
// logistics. This script walks every command handler once outside VS Code so
// such mistakes surface here first.
//
// What it does NOT show: anything about VS Code's real behavior. The stub's
// executeCommand does nothing; whether `_workbench.openWith` opens a window is
// exactly what the real spike is for.
//
// Run:  node scripts/ephemeral/2026-10-12-smoke-spike-extension.js
// Logs go to spike/.run/smoke/ (gitignored), never to the real spike log.
//
// Outcome: see the comment block at the end of this file.

const Module = require('node:module');
const path = require('node:path');
const fs = require('node:fs');

const repo = path.resolve(__dirname, '..', '..');
const runDir = path.join(repo, 'spike', '.run', 'smoke');
fs.rmSync(runDir, { recursive: true, force: true });
process.env.PORTHOLE_SPIKE_RUN_DIR = runDir;

const executed = [];
const handlers = new Map();
const listeners = { groups: [], tabs: [] };
const fakeTab = { label: 'tasks · 420×640 · load 1 · 0 ticked', isActive: true, isPinned: true, input: undefined };
const fakeGroups = [{ viewColumn: 1, isActive: true, tabs: [] }];

const vscodeStub = {
  version: 'stub',
  env: { appName: 'vscode-stub' },
  Uri: { file: p => ({ fsPath: p, toString: () => `file://${p}` }) },
  window: {
    state: { focused: true },
    createOutputChannel: () => ({ appendLine() {}, dispose() {} }),
    showInformationMessage: () => Promise.resolve(undefined), // the human pressed Escape
    tabGroups: {
      get all() { return fakeGroups; },
      onDidChangeTabGroups: fn => { listeners.groups.push(fn); return { dispose() {} }; },
      onDidChangeTabs: fn => { listeners.tabs.push(fn); return { dispose() {} }; },
      close: async tabs => { fakeGroups.splice(1); fakeGroups[0].tabs = []; return true; },
    },
  },
  commands: {
    registerCommand: (id, handler) => { handlers.set(id, handler); return { dispose() {} }; },
    executeCommand: async (id, ...args) => {
      executed.push([id, ...args]);
      if (id === '_workbench.openWith') {
        // Pretend a new group appeared, so the change listeners and snapshots run.
        fakeGroups.push({ viewColumn: 2, isActive: true, tabs: [fakeTab] });
        listeners.groups.forEach(fn => fn({ opened: [fakeGroups[1]], closed: [], changed: [] }));
        listeners.tabs.forEach(fn => fn({ opened: [fakeTab], closed: [], changed: [] }));
      }
      return undefined;
    },
  },
};

const realLoad = Module._load;
Module._load = function (request, ...rest) {
  return request === 'vscode' ? vscodeStub : realLoad.call(this, request, ...rest);
};

(async () => {
  const extension = require(path.join(repo, 'spike', 'extension.js'));
  const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'spike', 'package.json'), 'utf8'));
  extension.activate({ extensionPath: path.join(repo, 'spike'), subscriptions: [] });

  const contributed = manifest.contributes.commands.map(c => c.command);
  const missing = contributed.filter(id => !handlers.has(id));
  if (missing.length) { throw new Error(`contributed but not registered: ${missing.join(', ')}`); }

  for (const id of ['portholeSpike.popOut', 'portholeSpike.touch', 'portholeSpike.popOut',
                    'portholeSpike.reset', 'portholeSpike.fallback', 'portholeSpike.dump',
                    'portholeSpike.markdown', 'portholeSpike.markdownRewrite', 'portholeSpike.delayedOpen', 'portholeSpike.delayedOpenQuiet']) {
    await handlers.get(id)();
  }

  const logText = fs.readFileSync(path.join(runDir, 'spike.log'), 'utf8');
  const page = fs.readFileSync(path.join(runDir, 'tasks.html'), 'utf8');
  const oneShot = executed.find(([id]) => id === '_workbench.openWith');
  const checks = {
    'log has no THREW/FAILED line': !/THREW|FAILED/.test(logText),
    'page copy was stamped': !page.includes('never (opened directly'),
    'tracked sample is untouched': fs.readFileSync(path.join(repo, 'samples', 'tasks.html'), 'utf8').includes('never (opened directly'),
    'one-shot call got [-3, {auxiliary}]': !!oneShot && oneShot[2] === 'workbench.editor.browser'
      && oneShot[3][0] === -3 && oneShot[3][1].auxiliary.bounds.width === 420
      && oneShot[3][1].auxiliary.compact === true && oneShot[3][1].auxiliary.alwaysOnTop === true,
    'fallback ran its four commands in order': executed.map(([id]) => id).join(',').includes(
      'vscode.openWith,workbench.action.moveEditorToNewWindow,workbench.action.enableCompactAuxiliaryWindow,workbench.action.enableWindowAlwaysOnTop'),
    'Markdown preview opened with its own editor id into -3': executed.some(([id, , editor, target]) => id === '_workbench.openWith' && editor === 'vscode.markdown.preview.editor' && target[0] === -3),
    'quiet open asked for preserveFocus and inactive': executed.some(([id, , , target]) => id === '_workbench.openWith' && target[1].preserveFocus === true && target[1].inactive === true),
  };
  let failed = false;
  for (const [name, ok] of Object.entries(checks)) {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
    failed = failed || !ok;
  }
  console.log(`log lines: ${logText.trim().split('\n').length}  →  ${path.relative(repo, runDir)}/spike.log`);
  process.exit(failed ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });

// Outcome (2026-10-12, Glazier 5.5): all five checks passed on the first run,
// 41 log lines, node v22.19.0. Decision: the spike was handed to the human
// without a real-VS-Code dry run, because that would have opened windows on
// his screen unannounced. Re-run this after any edit to spike/extension.js.
