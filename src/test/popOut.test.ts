import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateFresh, command } from './helpers/activate';
import {
  closeFloatingGroup, executedCalls, executedCommands, focusGroup, loggedLines, mainGroup, openFloatingGroup,
  setActiveDocument, setCommandBehavior, setConfig, shownMessages, Uri,
} from './helpers/vscodeMock';

const INTERNAL = '_workbench.openWith';
const LOCK = 'workbench.action.lockEditorGroup';
const FALLBACK = [
  'vscode.openWith',
  'workbench.action.moveEditorToNewWindow',
  'workbench.action.enableCompactAuxiliaryWindow',
  'workbench.action.enableWindowAlwaysOnTop',
];

const page = Uri.file('/work/tasks.html');

/** The `[column, options]` pair of every internal open, in order. */
const internalOpens = () => executedCalls()
  .filter(call => call.id === INTERNAL)
  .map(call => ({ file: call.args[0], editor: call.args[1], target: call.args[2] as [number, any] }));

/** Runs a command whose path includes real waits (the fallback), with fake timers. */
async function runThroughTimers(run: Promise<unknown>): Promise<void> {
  await vi.runAllTimersAsync();
  await run;
}

beforeEach(() => {
  activateFresh();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('popping out an HTML file', () => {
  it('opens it with one internal call — first preset, compact, pinned — and locks the new window', async () => {
    setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });

    await command('porthole.popOut')(page);

    expect(internalOpens()).toEqual([{
      file: page,
      editor: 'workbench.editor.browser',
      target: [-3, { auxiliary: { bounds: { width: 420, height: 640 }, compact: true, alwaysOnTop: true } }],
    }]);
    // Nothing from the fallback ran, and the lock came after the window existed.
    expect(executedCommands()).toEqual([INTERNAL, LOCK]);
  });

  it('places the window where the position setting says, and leaves it unlocked when compact mode is off', async () => {
    setConfig({ position: { x: 40, y: 80 }, compact: false, alwaysOnTop: false });
    setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });

    await command('porthole.popOut')(page);

    expect(internalOpens()[0].target[1].auxiliary).toEqual({
      bounds: { width: 420, height: 640, x: 40, y: 80 },
      compact: false,
      alwaysOnTop: false,
    });
    expect(executedCommands()).toEqual([INTERNAL]);
  });

  it('falls back to public commands, exactly once, when the internal call throws', async () => {
    vi.useFakeTimers();
    setCommandBehavior(INTERNAL, () => { throw new Error("command '_workbench.openWith' not found"); });
    setCommandBehavior('workbench.action.moveEditorToNewWindow', () => { openFloatingGroup(); });

    await runThroughTimers(command('porthole.popOut')(page));

    expect(executedCommands()).toEqual([INTERNAL, ...FALLBACK, LOCK]);
    expect(loggedLines().join('\n')).toMatch(/internal open threw; falling back.*not found/);
  });

  it('falls back, exactly once, when the internal call returns but no window appears', async () => {
    vi.useFakeTimers();
    setCommandBehavior('workbench.action.moveEditorToNewWindow', () => { openFloatingGroup(); });
    // The internal command resolves and opens nothing: what a future VS Code
    // that ignores group -3 would look like from here.

    await runThroughTimers(command('porthole.popOut')(page));

    expect(executedCommands()).toEqual([INTERNAL, ...FALLBACK, LOCK]);
    expect(loggedLines().join('\n')).toMatch(/no new window appeared within 1500 ms/);
  });

  it('never touches the internal command when useInternalCommand is off', async () => {
    vi.useFakeTimers();
    setConfig({ useInternalCommand: false });
    setCommandBehavior('workbench.action.moveEditorToNewWindow', () => { openFloatingGroup(); });

    await runThroughTimers(command('porthole.popOut')(page));

    expect(executedCommands()).toEqual([...FALLBACK, LOCK]);
  });

  it('skips the compact and pin commands in the fallback when those settings are off', async () => {
    vi.useFakeTimers();
    setConfig({ useInternalCommand: false, compact: false, alwaysOnTop: false });
    setCommandBehavior('workbench.action.moveEditorToNewWindow', () => { openFloatingGroup(); });

    await runThroughTimers(command('porthole.popOut')(page));

    expect(executedCommands()).toEqual(FALLBACK.slice(0, 2));
  });

  it('does not lock anything when the new window did not take focus', async () => {
    // Locking acts on the ACTIVE group. If that is still the main window's
    // group, locking it would silently stop files opening there.
    setCommandBehavior(INTERNAL, () => { openFloatingGroup({ takesFocus: false }); });

    await command('porthole.popOut')(page);

    expect(executedCommands()).toEqual([INTERNAL]);
    expect(loggedLines().join('\n')).toMatch(/not locking/);
  });

  it('pops out the HTML file in the active editor when run from the keyboard', async () => {
    setActiveDocument(Uri.file('/work/notes.HTM'));
    setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });

    await command('porthole.popOut')();

    expect(internalOpens()[0].file).toMatchObject({ fsPath: '/work/notes.HTM' });
  });

  it('explains, and opens nothing, when there is no local HTML file to pop out', async () => {
    setActiveDocument(Uri.file('/work/README.md'));
    await command('porthole.popOut')();
    await command('porthole.popOut')(Uri.parse('untitled:Untitled-1.html'));

    expect(executedCommands()).toEqual([]);
    expect(shownMessages()).toHaveLength(2);
    expect(shownMessages()[0]).toMatch(/local HTML file/);
  });
});

describe('size presets', () => {
  const widths = () => internalOpens().map(open => open.target[1].auxiliary.bounds.width);

  it('steps through the presets on each cycle and wraps around', async () => {
    setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });

    await command('porthole.popOut')(page);
    await command('porthole.cycleSize')();
    await command('porthole.cycleSize')();
    await command('porthole.cycleSize')();

    expect(widths()).toEqual([420, 480, 640, 420]);
    expect(internalOpens().every(open => open.file === page)).toBe(true);
  });

  it('resizes the page in the focused floating window, not the one opened last', async () => {
    const other = Uri.file('/work/checklist.html');
    const opened: ReturnType<typeof openFloatingGroup>[] = [];
    setCommandBehavior(INTERNAL, () => { opened.push(openFloatingGroup()); });

    await command('porthole.popOut')(page);
    await command('porthole.popOut')(other);
    focusGroup(opened[0]); // the human clicks back into the first window
    await command('porthole.cycleSize')();

    const last = internalOpens().at(-1)!;
    expect(last.file).toBe(page);
    expect(last.target[1].auxiliary.bounds).toEqual({ width: 480, height: 720 });
  });

  describe('Regression tests', () => {
    it('does not pop a docked page back out when Cycle Size runs after Dock Back', async () => {
      // Bug (found in review before 0.1.0 was ever run, Surveyor 5.1, 2026-10-12):
      // cycleSize fell back to "the last file popped out" when the focused group
      // was not a window porthole had opened. After Dock Back that re-opened the
      // file at the next size, pulling the page the human had just put away out
      // of the main window again. The same happened from any floating window
      // porthole did not open. The fallback is gone; an unknown window explains.
      const opened: ReturnType<typeof openFloatingGroup>[] = [];
      setCommandBehavior(INTERNAL, () => { opened.push(openFloatingGroup()); });
      setCommandBehavior('workbench.action.restoreEditorsToMainWindow', () => { closeFloatingGroup(opened[0]); });

      await command('porthole.popOut')(page);
      await command('porthole.dockBack')();
      await command('porthole.cycleSize')();

      expect(internalOpens()).toHaveLength(1); // only the original pop-out
      expect(shownMessages().at(-1)).toMatch(/pop a page out first/);
    });

    it('resizes the only open window even when VS Code still reports the main window as active', async () => {
      // Bug (Jérémie, VS Code 1.134.0, 2026-10-13, intermittent): Cycle Window
      // Size, run from inside a porthole window, sometimes answered "pop a page
      // out first". VS Code had not marked the floating window's group active,
      // so the lookup by active group missed. With one porthole window open,
      // there is no doubt which window is meant.
      setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });
      await command('porthole.popOut')(page);
      focusGroup(mainGroup()); // VS Code's view of focus lags behind the human's

      await command('porthole.cycleSize')();

      expect(widths()).toEqual([420, 480]);
      expect(shownMessages()).toEqual([]);
    });

    it('asks which window to resize when several are open and none is reported active', async () => {
      setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });
      await command('porthole.popOut')(page);
      await command('porthole.popOut')(Uri.file('/work/checklist.html'));
      focusGroup(mainGroup());

      await command('porthole.cycleSize')();

      expect(internalOpens()).toHaveLength(2); // no resize guessed at
      expect(shownMessages().at(-1)).toMatch(/several floating windows are open/);
    });
  });

  it('explains, and opens nothing, when no page has been popped out yet', async () => {
    await command('porthole.cycleSize')();

    expect(executedCommands()).toEqual([]);
    expect(shownMessages()[0]).toMatch(/pop a page out first/);
  });

  it('ignores unusable entries in the sizes setting, and uses the defaults when none is usable', async () => {
    setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });

    setConfig({ sizes: [{ width: 'wide', height: 500 }, null, { name: 'Tall', width: 400, height: 900 }] });
    await command('porthole.popOut')(page);
    setConfig({ sizes: [] });
    await command('porthole.popOut')(page);

    expect(internalOpens().map(open => open.target[1].auxiliary.bounds)).toEqual([
      { width: 400, height: 900 },
      { width: 420, height: 640 },
    ]);
  });
});
