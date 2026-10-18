import { beforeEach, describe, expect, it } from 'vitest';
import { activateAgain, activateFresh, command } from './helpers/activate';
import {
  executedCalls, openFloatingGroup, setCommandBehavior, setConfig, Uri, writtenFile, type MockTabGroup,
} from './helpers/vscodeMock';

// Reload Window: VS Code restores Porthole's floating windows, and a fresh copy
// of Porthole starts. It must take its windows back rather than act as if
// none were open (ADR-0024, QST-CHECK-WORKSPACE-DARK).

const INTERNAL = '_workbench.openWith';
const STYLE = '/ext/media/markdown-color-scheme.css';
const notes = Uri.file('/work/notes.md');
const page = Uri.file('/work/tasks.html');
const opened: MockTabGroup[] = [];

/** VS Code's Markdown preview tab names its file; a browser tab names nothing but has the page's title. */
const asOpenedByVsCode = (file: { fsPath: string }) => (file.fsPath.endsWith('.md')
  ? { input: { uri: file, viewType: 'vscode.markdown.preview.editor' }, label: 'Preview notes.md' }
  : { label: 'tasks' });

beforeEach(() => {
  activateFresh();
  opened.length = 0;
  setCommandBehavior(INTERNAL, (file: unknown) => { opened.push(openFloatingGroup(asOpenedByVsCode(file as { fsPath: string }))); });
});

describe('Regression tests', () => {
  it('brings a Markdown window restored after Reload Window forward, instead of opening a second one', async () => {
    // Bug (Jérémie, 2026-10-18): after Reload Window, Pop Out on the file
    // already floating opened a second floating window: the fresh Porthole had
    // forgotten the first.
    await command('porthole.popOut')(notes);
    activateAgain();

    await command('porthole.popOut')(notes);

    expect(executedCalls().filter(call => call.id === INTERNAL)).toHaveLength(1);
    expect(executedCalls().filter(call => call.id === 'vscode.openWith').map(call => call.args[2])).toEqual([opened[0].viewColumn]);
  });

  it('keeps a restored Markdown window\'s colors after Reload Window', async () => {
    // Same bug: the fresh Porthole rewrote the stylesheet with no files, so the
    // restored window lost its colors and stopped following the setting.
    setConfig({ 'markdown.colorScheme': 'dark' });
    await command('porthole.popOut')(notes);
    activateAgain();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(writtenFile(STYLE)).toContain('"source":"file:///work/notes.md"');
  });
});

describe('which restored windows Porthole takes back', () => {
  it('an HTML window, by its page title and its place, since a browser tab names no file', async () => {
    await command('porthole.popOut')(page);
    activateAgain();

    await command('porthole.popOut')(page);

    expect(executedCalls().filter(call => call.id === INTERNAL)).toHaveLength(1);
  });

  it('not a window at the same place that now shows another file', async () => {
    await command('porthole.popOut')(notes);
    const restored = opened[0];
    restored.tabs = [{ label: 'Preview other.md', input: { uri: Uri.file('/work/other.md'), viewType: 'vscode.markdown.preview.editor' } }];
    activateAgain();

    await command('porthole.popOut')(notes);

    expect(executedCalls().filter(call => call.id === INTERNAL)).toHaveLength(2);
  });
});
