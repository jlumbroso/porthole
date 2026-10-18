import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateFresh, command } from './helpers/activate';
import {
  mainGroup, openFloatingGroup, openTabIn, setCommandBehavior, setConfig, settingUpdates, showEditor,
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
    expect(shownTextDocuments()).toEqual([{ uri: adr, options: { viewColumn: mainGroup().viewColumn, selection: questionLine, preserveFocus: true } }]);
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
    setConfig({ otherEditors: 'off' });
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

  beforeEach(() => { setConfig({ otherEditors: 'ask' }); });

  it('moves it on "Approve Now" and keeps asking next time', async () => {
    answerNotice('Approve Now');
    const tab = await anotherExtensionOpensTheAdr();

    expect(shownMessages()).toEqual(['0024-floating-windows.md opened inside Porthole\'s floating window. Move it to the main window?']);
    expect(floating.tabs).not.toContain(tab);
    expect(settingUpdates()).toEqual([]);
  });

  it('leaves it on "Deny Now", or when the notice is closed', async () => {
    answerNotice('Deny Now');
    const tab = await anotherExtensionOpensTheAdr();

    expect(floating.tabs).toContain(tab);
    expect(settingUpdates()).toEqual([]);
  });

  it('"Approve Always" moves it and sets the setting to move; "Never Approve" leaves it and sets off', async () => {
    answerNotice('Approve Always');
    const moved = await anotherExtensionOpensTheAdr();
    expect(floating.tabs).not.toContain(moved);

    setConfig({ otherEditors: 'ask' });
    answerNotice('Never Approve');
    const kept = openTabIn(floating, new TabInputText(Uri.file('/work/other.md')));
    await vi.runAllTimersAsync();

    expect(floating.tabs).toContain(kept);
    expect(settingUpdates().map(update => [update.key, update.value])).toEqual([['otherEditors', 'move'], ['otherEditors', 'off']]);
  });
});
