import { beforeEach, describe, expect, it } from 'vitest';
import { activateFresh, command, MANIFEST } from './helpers/activate';
import { loggedLines, registeredCommandIds, setCommandBehavior } from './helpers/vscodeMock';

// The manifest is the source of truth for what the extension promises; these
// tests read it instead of keeping a second list that would drift.
const contributed: string[] = MANIFEST.contributes.commands.map((entry: { command: string }) => entry.command);

beforeEach(() => {
  activateFresh();
});

describe('the manifest and the code agree', () => {
  it('registers a handler for every contributed command, and nothing else', () => {
    expect([...registeredCommandIds()].sort()).toEqual([...contributed].sort());
  });

  it('only binds menus and keys to commands that exist', () => {
    // A typo in a menu or keybinding entry fails silently in VS Code: the
    // button or chord simply does nothing.
    const menus = Object.values(MANIFEST.contributes.menus as Record<string, Array<{ command: string }>>).flat();
    const referenced = [...menus, ...MANIFEST.contributes.keybindings].map(entry => entry.command);
    expect(referenced.filter(id => !contributed.includes(id))).toEqual([]);
  });
});

describe('Regression tests', () => {
  it('keeps the pop-out chord off a docked browser tab, where it could only scold', () => {
    // Bug (found in review before 0.1.0 was ever run, Surveyor 5.1, 2026-10-12):
    // on an HTML file shown in a docked *browser* tab the chord's `when` was true
    // (the resource keys follow the file), but a keybinding passes no argument
    // and a browser pane is not a text editor, so Ctrl+Alt+M answered "open or
    // select a local HTML file first" on the very page the human wanted popped
    // out. Until milestone M2 handles browser tabs, the chord is inert there.
    // The mock cannot evaluate a `when` clause, so this pins the clause itself.
    const chord = MANIFEST.contributes.keybindings.find(
      (entry: { command: string }) => entry.command === 'porthole.popOut');
    expect(chord.when).toContain("activeEditor != 'workbench.editor.browser'");
  });
});

describe('every command, run with nothing set up', () => {
  it.each(contributed)('%s settles without rejecting', async id => {
    await expect(command(id)()).resolves.toBeUndefined();
  });
});

describe('the command wrapper', () => {
  it('logs a failure and still rejects, so VS Code can show it', async () => {
    setCommandBehavior('workbench.action.restoreEditorsToMainWindow', () => {
      throw new Error('no floating window is focused');
    });

    await expect(command('porthole.dockBack')()).rejects.toThrow('no floating window is focused');
    expect(loggedLines().join('\n')).toMatch(/porthole\.dockBack failed: .*no floating window is focused/);
  });
});

describe('activation', () => {
  it('logs the extension version and the VS Code version', () => {
    expect(loggedLines()[0]).toContain(`Porthole ${MANIFEST.version} activated on`);
    expect(loggedLines()[0]).toContain('1.141.0-mock');
  });
});
