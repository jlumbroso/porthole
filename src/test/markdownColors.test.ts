import { beforeEach, describe, expect, it } from 'vitest';
import type * as vscode from 'vscode';
import { stylesheetFor } from '../markdownColors';
import { activateFresh, command } from './helpers/activate';
import {
  changeSetting, closeFloatingGroup, executedCommands, openFloatingGroup, setCommandBehavior, setConfig,
  Uri, writtenFile, type MockTabGroup,
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
