import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateFresh, command } from './helpers/activate';
import {
  executedCalls, mainGroup, openFloatingGroup, openTabIn, setCommandBehavior, setConfig, settingUpdates, showEditor,
  shownMessages, shownTextDocuments, TabInputText, Uri, window as vscodeWindow, type MockTabGroup,
} from './helpers/vscodeMock';

// Editors other extensions put into Porthole's floating windows (ADR-0025).
// An extension that opens a file by column number reaches a floating window's
// group, and the extra tab brings the tab bar back. Porthole moves it to the
// main window by default, can ask instead, or can leave it.

const page = Uri.file('/work/tasks.html');
const adr = Uri.file('/work/docs/adr/0024-floating-windows.md');
const questionLine = { line: 41, character: 0 };

let floating: MockTabGroup;

/** Pops out the page, then plays another extension opening `adr` into that floating window. */
async function anotherExtensionOpensTheAdr(input: unknown = new TabInputText(adr), options: { isDirty?: boolean } = {}) {
  await command('porthole.popOut')(page);
  const tab = openTabIn(floating, input, options);
  showEditor(adr, floating.viewColumn, questionLine); // the other extension then puts the cursor on its line
  await vi.runAllTimersAsync();
  return tab;
}

beforeEach(() => {
  activateFresh();
  vi.useFakeTimers();
  setCommandBehavior('_workbench.openWith', () => { floating = openFloatingGroup(); });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Regression tests', () => {
  it('moves a file another extension opened into a floating window to the main window, at the line it chose', async () => {
    // Bug (Jérémie, 2026-10-18, ADR-0024 finding 3): the ADR Manager's "Open in
    // file" called showTextDocument(doc, ViewColumn.Two). With one group in the
    // main window, column two was Porthole's floating window, so the ADR became
    // a second tab there and the tab bar came back.
    const tab = await anotherExtensionOpensTheAdr();

    expect(floating.tabs).not.toContain(tab);
    expect(shownTextDocuments()).toEqual([{ uri: adr, options: { viewColumn: mainGroup().viewColumn, selection: questionLine, preserveFocus: false } }]);
  });

  it('turns the floating window\'s compact mode back on after the move, then returns focus to the moved file', async () => {
    // Bug (Jérémie, ADR-0025 QST-CHECK-GUARD, C): after the move the window was
    // back to one tab, but its tab bar stayed. VS Code leaves compact mode for
    // good when a second editor arrives, and does not return to it.
    await anotherExtensionOpensTheAdr();

    const order = executedCalls().map(call => call.id).filter(id => ['vscode.openWith', 'workbench.action.enableCompactAuxiliaryWindow'].includes(id));
    expect(order).toEqual(['vscode.openWith', 'workbench.action.enableCompactAuxiliaryWindow']);
    expect(executedCalls().find(call => call.id === 'vscode.openWith')!.args).toEqual([page, 'workbench.editor.browser', floating.viewColumn]);
    expect(shownTextDocuments()).toHaveLength(1); // the moved file, focused, after compact mode
  });

  it('leaves compact mode alone when the compact setting is off', async () => {
    setConfig({ compact: false });
    await anotherExtensionOpensTheAdr();

    expect(executedCalls().map(call => call.id)).not.toContain('workbench.action.enableCompactAuxiliaryWindow');
  });
});

describe('what Porthole leaves alone', () => {
  it('a tab with unsaved changes, which closing would interrupt with a save prompt', async () => {
    const tab = await anotherExtensionOpensTheAdr(new TabInputText(adr), { isDirty: true });

    expect(floating.tabs).toContain(tab);
    expect(shownTextDocuments()).toEqual([]);
  });

  it('a tab it could not open again, such as a webview, which names no file', async () => {
    const tab = await anotherExtensionOpensTheAdr({ viewType: 'someExtension.panel' });

    expect(floating.tabs).toContain(tab);
  });

  it('everything, when the setting is off', async () => {
    setConfig({ keepToOneTab: 'off' });
    const tab = await anotherExtensionOpensTheAdr();

    expect(floating.tabs).toContain(tab);
    expect(shownMessages()).toEqual([]);
  });

  it('tabs in windows that are not Porthole\'s', async () => {
    const tab = openTabIn(mainGroup(), new TabInputText(adr));
    await vi.runAllTimersAsync();

    expect(mainGroup().tabs).toContain(tab);
  });
});

describe('asking first, when the setting is ask', () => {
  // The four answers are Jérémie's (ADR-0025): two for this time only, two that change the setting.
  const answerNotice = (answer: string | undefined) => {
    vi.spyOn(vscodeWindow, 'showInformationMessage').mockImplementationOnce(async (message: string) => {
      shownMessages().push(message);
      return answer as never;
    });
  };

  beforeEach(() => { setConfig({ keepToOneTab: 'ask' }); });

  it('moves it on "Move It" and keeps asking next time', async () => {
    answerNotice('Move It');
    const tab = await anotherExtensionOpensTheAdr();

    expect(shownMessages()).toEqual(['0024-floating-windows.md opened inside Porthole\'s floating window. Move it to the main window? Always Move and Never Move set porthole.keepToOneTab (to move / off), so Porthole won\'t ask again.']);
    expect(floating.tabs).not.toContain(tab);
    expect(settingUpdates()).toEqual([]);
  });

  it('leaves it on "Leave It", or when the notice is closed', async () => {
    answerNotice('Leave It');
    const tab = await anotherExtensionOpensTheAdr();

    expect(floating.tabs).toContain(tab);
    expect(settingUpdates()).toEqual([]);
  });

  it('"Always Move" moves it and sets the setting to move; "Never Move" leaves it and sets off', async () => {
    answerNotice('Always Move');
    const moved = await anotherExtensionOpensTheAdr();
    expect(floating.tabs).not.toContain(moved);

    setConfig({ keepToOneTab: 'ask' });
    answerNotice('Never Move');
    const kept = openTabIn(floating, new TabInputText(Uri.file('/work/other.md')));
    await vi.runAllTimersAsync();

    expect(floating.tabs).toContain(kept);
    expect(settingUpdates().map(update => [update.key, update.value])).toEqual([['keepToOneTab', 'move'], ['keepToOneTab', 'off']]);
  });
});
