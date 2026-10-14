import { beforeEach, describe, expect, it } from 'vitest';
import { activateFresh, command } from './helpers/activate';
import {
  answerNextModal, answerNextQuickPick, ConfigurationTarget, openFloatingGroup, quickPicksShown,
  setCommandBehavior, setConfig, setSection, settingUpdates, shownMessages, Uri,
} from './helpers/vscodeMock';

// "Review and Reset Settings…" (ADR-0020, Jérémie's answer to
// QST-SETTINGS-CLEANUP): after Porthole wrote VS Code's defaults into his
// settings by mistake, he asked that whatever Porthole writes can be seen and
// undone, entry by entry, and that the way back is offered when it writes.

const review = () => command('porthole.reviewSettings')();

beforeEach(() => {
  activateFresh();
});

describe('reviewing and resetting the settings Porthole wrote', () => {
  it('lists Porthole\'s settings and its own auto-lock entries, and removes only the ones picked', async () => {
    setConfig({ askToKeepCompact: false, sizes: [{ width: 500, height: 700 }] });
    setSection('workbench.editor', {
      autoLockGroups: { terminalEditor: true, 'workbench.editor.browser': true, 'vscode.markdown.preview.editor': true },
    });
    // The person ticks askToKeepCompact and the browser entry.
    answerNextQuickPick(items => items.filter(item => /askToKeepCompact|editor\.browser/.test(item.label)));

    await review();

    expect(quickPicksShown()[0].labels).toEqual([
      'porthole.sizes',
      'porthole.askToKeepCompact',
      'workbench.editor.autoLockGroups › workbench.editor.browser',
      'workbench.editor.autoLockGroups › vscode.markdown.preview.editor',
    ]);
    expect(quickPicksShown()[0].options).toMatchObject({ canPickMany: true });
    expect(settingUpdates()).toEqual([
      { section: 'porthole', key: 'askToKeepCompact', value: undefined, target: ConfigurationTarget.Global },
      {
        section: 'workbench.editor',
        key: 'autoLockGroups',
        // The person's own entry, which Porthole never listed, is kept.
        value: { terminalEditor: true, 'vscode.markdown.preview.editor': true },
        target: ConfigurationTarget.Global,
      },
    ]);
  });

  it('says there is nothing to reset, rather than showing an empty list', async () => {
    setSection('workbench.editor', { autoLockGroups: { terminalEditor: true } });

    await review();

    expect(quickPicksShown()).toEqual([]);
    expect(shownMessages()[0]).toMatch(/Nothing to reset/);
  });

  it('removes the whole auto-lock entry when Porthole\'s were the only keys in it', async () => {
    setSection('workbench.editor', { autoLockGroups: { 'workbench.editor.browser': true } });
    answerNextQuickPick(items => items);

    await review();

    expect(settingUpdates()).toEqual([
      { section: 'workbench.editor', key: 'autoLockGroups', value: undefined, target: ConfigurationTarget.Global },
    ]);
  });

  it('offers the way back right after Porthole turns auto-lock on', async () => {
    setCommandBehavior('_workbench.openWith', () => { openFloatingGroup(); });
    setSection('workbench.editor', { autoLockGroups: {} });
    answerNextModal('Keep Compact');

    await command('porthole.popOut')(Uri.file('/work/tasks.html'));
    await new Promise(resolve => setTimeout(resolve, 0)); // the notice is shown without waiting

    expect(shownMessages().some(message => /Porthole changed your user settings/.test(message))).toBe(true);
  });
});
