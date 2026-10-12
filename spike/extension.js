// Spike 0 — throwaway. Proves (or breaks) the one internal VS Code call that
// porthole is built on. How to run it and what it answers:
// docs/adr/0003-spike-0-does-the-one-shot-call-hold.md
//
// Plain JavaScript on purpose: no build step between the human and the answer.
// Everything observable from inside the extension is written to a log file
// (spike/.run/spike.log), so nobody has to transcribe tab counts or timings.
// What only eyes can tell (is it compact? is it on top?) is asked in the ADR.

const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');

// Both come from a source reading in docs/INITIAL-DESIGN-BRIEF.md that was never
// run. They are the assumptions under test, not facts.
const BROWSER_EDITOR = 'workbench.editor.browser';
const AUX_WINDOW_GROUP = -3;
const SIZE = { width: 420, height: 640 };

let out;
let logFile;
let pageFile;
let samplePage;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  out.appendLine(stamped);
  fs.appendFileSync(logFile, stamped + '\n');
}

function describeInput(input) {
  if (input === undefined || input === null) { return String(input); }
  const described = { type: input.constructor ? input.constructor.name : typeof input };
  for (const key of ['uri', 'original', 'modified', 'viewType', 'notebookType']) {
    if (input[key] !== undefined) { described[key] = String(input[key]); }
  }
  return described;
}

function snapshot() {
  return vscode.window.tabGroups.all.map(group => ({
    viewColumn: group.viewColumn,
    active: group.isActive,
    tabs: group.tabs.map(tab => ({
      label: tab.label,
      active: tab.isActive,
      pinned: tab.isPinned,
      input: describeInput(tab.input),
    })),
  }));
}

function logSnapshot(label) {
  const groups = snapshot();
  log(`${label}: ${groups.length} group(s) ${JSON.stringify(groups)}`);
}

/** Runs one step, logging tab groups before, every change during, and three snapshots after. */
async function observe(title, action) {
  log(`=== ${title} ===`);
  logSnapshot('before');
  const started = Date.now();
  const since = () => `+${Date.now() - started}ms`;
  const labels = tabs => tabs.map(tab => tab.label).join(' | ');
  const watchers = [
    vscode.window.tabGroups.onDidChangeTabGroups(event => log(
      `${since()} groups changed: opened=${event.opened.length} closed=${event.closed.length} changed=${event.changed.length}`)),
    vscode.window.tabGroups.onDidChangeTabs(event => log(
      `${since()} tabs changed: opened=[${labels(event.opened)}] closed=[${labels(event.closed)}] changed=[${labels(event.changed)}]`)),
  ];
  try {
    const result = await action();
    log(`${since()} step returned: ${result === undefined ? 'undefined' : JSON.stringify(result)}`);
  } catch (err) {
    log(`${since()} step THREW: ${err && err.stack ? err.stack : err}`);
  }
  for (const [wait, label] of [[250, 'after ~0.25s'], [750, 'after ~1s'], [2000, 'after ~3s']]) {
    await sleep(wait);
    logSnapshot(label);
  }
  watchers.forEach(watcher => watcher.dispose());
}

/** Copies the sample page into the run directory with a fresh timestamp, so the tracked sample never changes. */
function writePage() {
  const stamp = new Date().toLocaleTimeString();
  const html = fs.readFileSync(samplePage, 'utf8')
    .replace(/<!--STAMP-->[\s\S]*?<!--\/STAMP-->/, `<!--STAMP-->${stamp}<!--/STAMP-->`);
  fs.writeFileSync(pageFile, html);
  return stamp;
}

function offerNext(message, nextTitle, nextCommand) {
  // Not awaited: the notification stays up while the human looks at the result.
  vscode.window.showInformationMessage(message, nextTitle).then(choice => {
    if (choice) { vscode.commands.executeCommand(nextCommand); }
  });
}

let popOutRuns = 0;

async function popOut() {
  if (!fs.existsSync(pageFile)) { writePage(); }
  popOutRuns += 1;
  const uri = vscode.Uri.file(pageFile);
  await observe(`step 1 (run ${popOutRuns}): one-shot _workbench.openWith into group ${AUX_WINDOW_GROUP}`, () =>
    vscode.commands.executeCommand('_workbench.openWith', uri, BROWSER_EDITOR, [
      AUX_WINDOW_GROUP,
      { pinned: true, auxiliary: { bounds: SIZE, compact: true, alwaysOnTop: true } },
    ]));
  if (popOutRuns === 1) {
    offerNext('Spike step 1 done. Look at the floating window, tick a box in it, then:', 'Step 2 — rewrite the page', 'portholeSpike.touch');
  } else {
    offerNext('Spike step 3 done. Count the floating windows, then:', 'Step 4 — close every tab', 'portholeSpike.reset');
  }
}

async function touch() {
  await observe('step 2: rewrite the page on disk', async () => `stamp ${writePage()}`);
  offerNext('Spike step 2 done. Did the page change by itself? Then:', 'Step 3 — pop out again', 'portholeSpike.popOut');
}

async function reset() {
  await observe('step 4: close every tab', async () => {
    const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
    const closed = await vscode.window.tabGroups.close(tabs);
    return `asked to close ${tabs.length} tab(s); close() returned ${closed}`;
  });
  offerNext('Spike step 4 done. Are any floating windows left? Then:', 'Step 5 — fallback path', 'portholeSpike.fallback');
}

async function fallback() {
  if (!fs.existsSync(pageFile)) { writePage(); }
  const uri = vscode.Uri.file(pageFile);
  await observe('step 5: stable commands only (openWith → move to new window → compact → always on top)', async () => {
    await vscode.commands.executeCommand('vscode.openWith', uri, BROWSER_EDITOR);
    await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow');
    await sleep(200); // the brief's guess at how long the new window needs to take focus
    await vscode.commands.executeCommand('workbench.action.enableCompactAuxiliaryWindow');
    await vscode.commands.executeCommand('workbench.action.enableWindowAlwaysOnTop');
    return 'four commands ran without throwing';
  });
  vscode.window.showInformationMessage('Spike done. The log is in spike/.run/spike.log — answer the questions in ADR-0003.');
}

function activate(context) {
  const runDir = process.env.PORTHOLE_SPIKE_RUN_DIR || path.join(context.extensionPath, '.run');
  fs.mkdirSync(runDir, { recursive: true });
  logFile = path.join(runDir, 'spike.log');
  pageFile = path.join(runDir, 'tasks.html');
  samplePage = path.join(context.extensionPath, '..', 'samples', 'tasks.html');
  out = vscode.window.createOutputChannel('Porthole Spike');

  log(`--- activated: ${vscode.env.appName} ${vscode.version} on ${process.platform} ${process.arch} ---`);
  log(`page under test: ${pageFile}`);

  const register = (id, handler) => context.subscriptions.push(
    vscode.commands.registerCommand(id, async () => {
      try { await handler(); } catch (err) { log(`${id} FAILED: ${err && err.stack ? err.stack : err}`); throw err; }
    }));
  register('portholeSpike.popOut', popOut);
  register('portholeSpike.touch', touch);
  register('portholeSpike.reset', reset);
  register('portholeSpike.fallback', fallback);
  register('portholeSpike.dump', async () => logSnapshot('dump'));
  context.subscriptions.push(out);
}

function deactivate() {}

module.exports = { activate, deactivate };
