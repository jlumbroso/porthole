import * as vscode from 'vscode';
import { describeError, log } from './log';

// Light or dark Markdown in Porthole's floating windows, whatever VS Code's own
// theme is (0.2.1, Jérémie's request; names provisional until the naming
// review rules, ADR-0022).
//
// How, and why this way (read at 1.141.0, run by hand in ADR-0022):
// - VS Code's Markdown preview takes its colors from VS Code's theme; it has no
//   color setting of its own (extensions/markdown-language-features/package.json).
// - An extension may add a stylesheet to every Markdown preview, through
//   `contributes."markdown.previewStyles"`; the file loads from the extension's
//   own folder, which the preview's security policy allows (style-src 'self').
// - Every preview page carries its source file in a meta tag:
//   <meta id="vscode-markdown-preview-data" data-settings='{"source":"file:///…"…}'>
//   (documentRenderer.ts L86–117). So one stylesheet, rewritten by Porthole,
//   can hold one rule per file shown in a Porthole window, selected with
//   `html:has(meta[data-settings*='"source":"<uri>"'])`, and leave every
//   other Markdown preview alone.

export const STYLE_FILE = ['media', 'markdown-color-scheme.css'];
type Scheme = 'auto' | 'light' | 'dark';

const PALETTES: Record<Exclude<Scheme, 'auto'>, Record<string, string>> = {
  light: { scheme: 'light', bg: '#ffffff', fg: '#1f2328', link: '#0969da', code: '#f6f8fa', border: '#d0d7de', quote: '#59636e' },
  dark: { scheme: 'dark', bg: '#0d1117', fg: '#e6edf3', link: '#4493f8', code: '#161b22', border: '#30363d', quote: '#9198a1' },
};

let styleUri: vscode.Uri | undefined;
let lastWritten: string | undefined;
let shownFiles: () => vscode.Uri[] = () => [];

export function colorScheme(): Scheme {
  const value = vscode.workspace.getConfiguration('porthole').get<string>('markdown.colorScheme', 'auto');
  return value === 'light' || value === 'dark' ? value : 'auto';
}

/** Escapes a string for use inside a single-quoted CSS string. */
const cssString = (value: string) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\a ');

/** The stylesheet for these files under this scheme. Exported for tests. */
export function stylesheetFor(files: vscode.Uri[], scheme: Scheme): string {
  const header = '/* Written by Porthole; rewritten whenever its Markdown windows or porthole.markdown.colorScheme change. */\n';
  if (scheme === 'auto' || files.length === 0) { return `${header}/* colorScheme is "${scheme}": nothing to override. */\n`; }
  const p = PALETTES[scheme];
  const rules = files.map(file => {
    const sel = `html:has(meta#vscode-markdown-preview-data[data-settings*='${cssString(`"source":"${file.toString()}"`)}'])`;
    return [
      `${sel} { color-scheme: ${p.scheme}; --vscode-editor-background: ${p.bg}; --vscode-editor-foreground: ${p.fg};`
        + ` --vscode-textLink-foreground: ${p.link}; --vscode-textLink-activeForeground: ${p.link};`
        + ` --vscode-textCodeBlock-background: ${p.code}; --vscode-widget-border: ${p.border}; }`,
      `${sel} body { background: ${p.bg}; color: ${p.fg}; }`,
      `${sel} a { color: ${p.link}; }`,
      `${sel} code, ${sel} pre { background: ${p.code}; color: ${p.fg}; }`,
      `${sel} blockquote { color: ${p.quote}; border-left-color: ${p.border}; background: transparent; }`,
      `${sel} table th, ${sel} table td, ${sel} hr { border-color: ${p.border}; }`,
    ].join('\n');
  });
  return `${header}/* colorScheme is "${scheme}", for ${files.length} file(s) in Porthole windows. */\n${rules.join('\n\n')}\n`;
}

/** Rewrites the stylesheet for the Markdown files Porthole shows, plus `extra`, then refreshes previews. */
export async function updateMarkdownColors(extra: vscode.Uri[] = []): Promise<void> {
  if (!styleUri) { return; }
  const seen = new Map<string, vscode.Uri>();
  for (const file of [...shownFiles(), ...extra]) { seen.set(file.toString(), file); }
  const css = stylesheetFor([...seen.values()], colorScheme());
  if (css === lastWritten) { return; } // nothing changed: no rewrite, no refresh of every preview
  const hadRules = lastWritten?.includes('html:has(') ?? false;
  lastWritten = css;
  try {
    await vscode.workspace.fs.writeFile(styleUri, new TextEncoder().encode(css));
    // Refresh open previews only when colors actually change for some of them.
    if (hadRules || css.includes('html:has(')) { await vscode.commands.executeCommand('markdown.preview.refresh'); }
  } catch (err) {
    log(`markdown colors: could not update the stylesheet: ${describeError(err)}`);
  }
}

/**
 * Call once, from `activate`. `markdownFiles` lists the Markdown files Porthole
 * currently shows. Rewrites the stylesheet at start (it may hold a previous
 * session's files) and whenever the setting changes.
 */
export function initMarkdownColors(extensionUri: vscode.Uri, markdownFiles: () => vscode.Uri[]): vscode.Disposable {
  lastWritten = undefined;
  styleUri = vscode.Uri.joinPath(extensionUri, ...STYLE_FILE);
  shownFiles = markdownFiles;
  void updateMarkdownColors();
  return vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('porthole.markdown.colorScheme')) { void updateMarkdownColors(); }
  });
}
