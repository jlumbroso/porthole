import { beforeEach, describe, expect, it } from 'vitest';
import { resetAutoLockPrompt } from '../autoLock';
import { activateFresh, command } from './helpers/activate';
import {
  answerNextModal, ConfigurationTarget, executedCommands, modalsShown, openFloatingGroup,
  setCommandBehavior, setSection, setSectionDefaults, settingUpdates, Uri,
} from './helpers/vscodeMock';

// ADR-0019 (Jérémie's answer to QST-LOCK-METHOD): porthole asks before turning
// on VS Code's own auto-lock, at the first pop-out of each session, until the
// person answers; "Don't Ask Again" is kept in their user settings.

const page = Uri.file('/work/tasks.html');
const popOut = () => command('porthole.popOut')(page);

beforeEach(() => {
  activateFresh();
  setCommandBehavior('_workbench.openWith', () => { openFloatingGroup(); });
  // This person has auto-lock on for one unrelated editor, and not for porthole's.
  setSection('workbench.editor', { autoLockGroups: { 'workbench.editor.terminal': true } });
});

describe('asking to keep floating windows to one tab', () => {
  it('asks once, and on "Keep Compact" adds porthole\'s editors to the user\'s auto-lock without dropping theirs', async () => {
    answerNextModal('Keep Compact');

    await popOut();
    await popOut();

    expect(modalsShown()).toHaveLength(1);
    expect(modalsShown()[0].buttons).toEqual(['Keep Compact', 'Not Now', "Don't Ask Again"]);
    expect(settingUpdates()).toEqual([{
      section: 'workbench.editor',
      key: 'autoLockGroups',
      value: {
        'workbench.editor.terminal': true,
        'workbench.editor.browser': true,
        'vscode.markdown.preview.editor': true,
      },
      target: ConfigurationTarget.Global,
    }]);
    // The page still opened, after the question.
    expect(executedCommands()).toContain('_workbench.openWith');
  });

  it('asks again next session after "Not Now", or after the question was closed, and writes nothing', async () => {
    answerNextModal('Not Now');
    await popOut();
    await popOut();                 // same session: not asked again
    resetAutoLockPrompt();          // VS Code restarted
    answerNextModal(undefined);     // closed without answering
    await popOut();

    expect(modalsShown()).toHaveLength(2);
    expect(settingUpdates()).toEqual([]);
  });

  it('never asks again after "Don\'t Ask Again", and records that in user settings', async () => {
    answerNextModal("Don't Ask Again");
    await popOut();
    resetAutoLockPrompt();          // VS Code restarted
    await popOut();

    expect(modalsShown()).toHaveLength(1);
    expect(settingUpdates()).toEqual([{
      section: 'porthole', key: 'askToKeepCompact', value: false, target: ConfigurationTarget.Global,
    }]);
  });

  describe('Regression tests', () => {
    it('writes only the user\'s own entries and porthole\'s two, never VS Code\'s defaults', async () => {
      // Bug (Jérémie's hands-on check, ADR-0020, 2026-10-13): "Turn On" read the
      // effective setting, which VS Code returns with all its defaults merged in,
      // and wrote all of it back: some 25 default entries landed in his
      // settings.json, frozen there against future VS Code changes.
      setSectionDefaults('workbench.editor', {
        autoLockGroups: { default: false, terminalEditor: true, 'workbench.editor.browser': false },
      });
      answerNextModal('Keep Compact');

      await popOut();

      expect(settingUpdates()[0].value).toEqual({
        'workbench.editor.terminal': true,          // the user's own, from beforeEach
        'workbench.editor.browser': true,
        'vscode.markdown.preview.editor': true,
      });
    });
  });

  it('does not ask when VS Code already locks porthole\'s windows', async () => {
    setSection('workbench.editor', {
      autoLockGroups: { 'workbench.editor.browser': true, 'vscode.markdown.preview.editor': true },
    });

    await popOut();

    expect(modalsShown()).toEqual([]);
  });
});
