import { beforeEach, describe, expect, it } from 'vitest';
import type * as vscode from 'vscode';
import { stylesheetFor } from '../markdownColors';
import { activateFresh, command } from './helpers/activate';
import {
  changeSetting, closeFloatingGroup, executedCommands, openFloatingGroup, setCommandBehavior, setConfig,
  seedFile, Uri, writtenFile, type MockTabGroup,
} from './helpers/vscodeMock';

// 0.2.1 (ADR-0022): light or dark Markdown in Porthole's floating windows,
// whatever VS Code's theme. Porthole rewrites one stylesheet that VS Code adds
// to every Markdown preview; its rules name only the files shown in Porthole's
// windows, so other previews keep following VS Code's theme.

const STYLE = '/ext/media/markdown-color-scheme.css';
const plan = Uri.file('/work/plan.md');
const other = Uri.file('/work/notes.md');
const opened: MockTabGroup[] = [];
// The mock's Uri carries only what porthole reads; the stylesheet function takes the real type.
const asUri = (uri: unknown) => uri as vscode.Uri;

beforeEach(() => {
  activateFresh();
  opened.length = 0;
  setCommandBehavior('_workbench.openWith', () => { opened.push(openFloatingGroup()); });
});

describe('the stylesheet', () => {
  it('overrides nothing when the setting is auto', () => {
    expect(stylesheetFor([asUri(plan)], 'auto')).not.toContain('html:has(');
  });

  it('targets each file by the source the preview page names, and only those files', () => {
    const css = stylesheetFor([asUri(plan)], 'light');
    expect(css).toContain(`html:has(meta#vscode-markdown-preview-data[data-settings*='"source":"file:///work/plan.md"'])`);
    expect(css).toContain('color-scheme: light');
    expect(css).not.toContain('notes.md');
  });

  it('escapes a quote in a file name, so one odd name cannot break every rule', () => {
    const css = stylesheetFor([asUri(Uri.file("/work/Jérémie's plan.md"))], 'dark');
    expect(css).toContain("Jérémie\\'s plan.md");
  });
});

describe('keeping the stylesheet in step with Porthole\'s windows', () => {
  it('names a Markdown file before its preview opens, then refreshes previews', async () => {
    setConfig({ 'markdown.colorScheme': 'dark' });

    await command('porthole.popOut')(plan);

    expect(writtenFile(STYLE)).toContain('/work/plan.md');
    expect(writtenFile(STYLE)).toContain('color-scheme: dark');
    const calls = executedCommands();
    expect(calls.indexOf('markdown.preview.refresh')).toBeLessThan(calls.indexOf('_workbench.openWith'));
  });

  it('drops a file from the stylesheet when its floating window closes', async () => {
    setConfig({ 'markdown.colorScheme': 'light' });
    await command('porthole.popOut')(plan);
    await command('porthole.popOut')(other);

    closeFloatingGroup(opened[0]);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(writtenFile(STYLE)).not.toContain('/work/plan.md');
    expect(writtenFile(STYLE)).toContain('/work/notes.md');
  });

  it('rewrites the stylesheet when the setting changes', async () => {
    await command('porthole.popOut')(plan);
    expect(writtenFile(STYLE) ?? '').not.toContain('html:has(');

    changeSetting('porthole.markdown.colorScheme', 'light');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(writtenFile(STYLE)).toContain('/work/plan.md');
  });

  it('leaves HTML pages alone and refreshes nothing while the setting is auto', async () => {
    await command('porthole.popOut')(Uri.file('/work/tasks.html'));
    await command('porthole.popOut')(plan);

    expect(executedCommands()).not.toContain('markdown.preview.refresh');
  });
});

describe('several VS Code windows sharing the one stylesheet', () => {
  // Each VS Code window runs its own copy of Porthole, and all of them write the
  // same file in the extension's folder. The file says which window shows which
  // files, keyed by the window's extension-host process.
  const othersPlan = 'file:///other/plan.md';
  const writtenBy = (owners: Record<string, string[]>) =>
    `/* an earlier stylesheet */\n/* porthole-windows: ${JSON.stringify(owners)} */\n`;

  describe('Regression tests', () => {
    it('keeps the rule another window wrote, when this window shows no Markdown of its own', async () => {
      // Bug (Jérémie, 2026-10-18, second VS Code window): changing the setting
      // did not recolor checklist.md's floating window. Every window rewrote
      // the shared file from its own list, and one with no Markdown windows
      // wrote "nothing to override" over the other's rule.
      seedFile(STYLE, writtenBy({ [String(process.ppid)]: [othersPlan] })); // a live process: the test runner's parent

      changeSetting('porthole.markdown.colorScheme', 'dark');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(writtenFile(STYLE)).toContain('"source":"file:///other/plan.md"');
    });
  });

  it('drops the files of a window whose VS Code has closed', async () => {
    seedFile(STYLE, writtenBy({ '2147483646': [othersPlan] })); // no such process

    changeSetting('porthole.markdown.colorScheme', 'dark');
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(writtenFile(STYLE)).not.toContain('other/plan.md');
  });
});
