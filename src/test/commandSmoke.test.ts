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
