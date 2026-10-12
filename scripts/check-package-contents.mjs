// Checks what would actually ship in the VSIX, and that the bundle is sound.
// Part of `npm run check`, so it runs in `just gate`.
//
// Why: both of the house's other extensions shipped working files in their
// packages (CLAUDE.md, .mcp.json, pneumatic's ledger, coverage output), and
// nothing noticed (ADR-0002). An ignore file is an intention; this is the check.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED = new Set(['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE.txt', 'dist/extension.js']);
const REQUIRED = ['package.json', 'dist/extension.js'];

const vsce = resolve(root, 'node_modules', '.bin', 'vsce');
const listed = execFileSync(vsce, ['ls'], { cwd: root, encoding: 'utf8' })
  .split('\n').map(line => line.trim()).filter(Boolean);

const problems = [];
const unexpected = listed.filter(file => !ALLOWED.has(file));
if (unexpected.length) { problems.push(`would ship files that are not on the allowlist:\n    ${unexpected.join('\n    ')}`); }
const missing = REQUIRED.filter(file => !listed.includes(file));
if (missing.length) { problems.push(`required files are missing from the package: ${missing.join(', ')}`); }

// The real VS Code injects `vscode` at runtime, so the bundle must still ask
// for it, and must contain none of the test mock.
const bundle = readFileSync(resolve(root, 'dist', 'extension.js'), 'utf8');
if (!/require\(["']vscode["']\)/.test(bundle)) { problems.push('dist/extension.js has no require("vscode"): the module was bundled or aliased'); }
if (bundle.includes('resetVscodeMock')) { problems.push('dist/extension.js contains the test mock'); }

if (problems.length) {
  console.error(`✗ package check failed:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ package contents: ${listed.join(', ')}`);
