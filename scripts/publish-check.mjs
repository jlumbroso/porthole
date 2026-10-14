// Read-only pre-publication check: one ✓ / ✗ line per fact the release depends on.
// Usage: node scripts/publish-check.mjs [--no-tokens] [--allow-private-repo]
// Run by `just publish-check` (and by `just publish` before it asks for a confirmation).
// It publishes nothing and never prints a token value.
//
// Where each check comes from: Lintel's playbook (.claude/skills/extension-marketplace-publishing,
// sections III, IV and V) and docs/release/RELEASE-PLAN.md. Written by Purser 5.5, 2026-10-13.
//
// The two token variables are read from .env by this script, which parses the file itself
// instead of sourcing it, hands the values only to the child process that verifies them, and
// reports "set" or "missing". A token in argv would show in `ps`, so neither is ever passed
// as an argument.
//
// Not checkable from here (so printed at the end, not as a pass): that Spike 0 was re-run on
// the VS Code version the listing calls tested (ADR-0009), that the Open VSX publisher
// agreement is signed on the Eclipse account, and that the screenshots show what they claim.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const { publisher, name, version } = pkg;
const id = `${publisher}.${name}`;
const OVSX = 'ovsx@1.2.0'; // pinned: not a devDependency yet (brief to Glazier)

const results = [];
const ok = (what, detail = '') => results.push({ state: 'ok', what, detail });
const bad = (what, detail) => results.push({ state: 'bad', what, detail });
const skip = (what, detail) => results.push({ state: 'skip', what, detail });

const run = (cmd, args, env = {}) => spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });
const gitOk = args => run('git', args).status === 0;
const newer = (a, b) => { // is semver a > b (plain x.y.z)
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) { return (pa[i] || 0) > (pb[i] || 0); } }
  return false;
};

// --- .env: parsed, never sourced, never printed -------------------------------
function readEnvFile() {
  const out = {};
  if (!existsSync(resolve(root, '.env'))) { return out; }
  for (const line of readFileSync(resolve(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) { out[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2'); }
  }
  return out;
}
// `--no-tokens`: never open .env and skip every check that needs a token. For anyone who is not
// the person holding the tokens (the release seat tests with it), and for a machine that has none.
const NO_TOKENS = process.argv.includes('--no-tokens');
const env = NO_TOKENS ? {} : readEnvFile();

// --- the repository ------------------------------------------------------------
const repoUrl = (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url) ?? '';
const slug = repoUrl.match(/github\.com[/:]([^/]+\/[^/.]+)/)?.[1];
// `--allow-private-repo`: Jérémie decided on 2026-10-13 to publish before the repository is made
// public. The listing's relative images and links are rewritten at package time into absolute
// github.com URLs, so they are broken until the repo is public and then work without a new
// version. The check says so instead of passing quietly.
const ALLOW_PRIVATE = process.argv.includes('--allow-private-repo');
if (!slug) {
  bad('repository field names a GitHub repo', `package.json repository is "${repoUrl}"`);
} else {
  const r = run('gh', ['repo', 'view', slug, '--json', 'visibility', '-q', '.visibility']);
  const vis = r.stdout.trim();
  if (vis === 'PUBLIC') { ok(`GitHub repo ${slug} is public (the listing's relative links and images resolve against it)`); }
  else if (vis === 'PRIVATE' && ALLOW_PRIVATE) { skip(`GitHub repo ${slug} is public`, '--allow-private-repo: it is PRIVATE, so the listing\'s images and links will not load for strangers until it is made public (then they work with no new version)'); }
  else { bad(`GitHub repo ${slug} is public`, r.status === 0 ? `it is ${vis}; relative README links would 404 for a stranger (playbook V.2)` : 'could not ask GitHub (gh not installed or not logged in)'); }
}

// --- credentials: where they live, and that they are there ----------------------
if (gitOk(['check-ignore', '-q', '.env']) && !gitOk(['ls-files', '--error-unmatch', '.env'])) { ok('.env is git-ignored and not tracked'); }
else { bad('.env is git-ignored and not tracked', 'playbook IV: it must be ignored (git check-ignore -v .env)'); }

const haveVsce = Boolean(env.VSCE_PAT), haveOvsx = Boolean(env.OVSX_PAT);
if (NO_TOKENS) { skip('VSCE_PAT and OVSX_PAT are set in .env', '--no-tokens: .env was not opened'); }
else {
  (haveVsce ? ok : bad)('VSCE_PAT is set in .env', haveVsce ? '' : 'missing or empty');
  (haveOvsx ? ok : bad)('OVSX_PAT is set in .env', haveOvsx ? '' : 'missing or empty');
}

const scan = run('node', ['scripts/scan-secrets.mjs', '--history']);
if (scan.status === 0) { ok('no credential-shaped string in tracked files or in history (scripts/scan-secrets.mjs)'); }
else { bad('no credential-shaped string in tracked files or in history', (scan.stderr || scan.stdout).trim().split('\n').slice(0, 6).join(' | ')); }

// --- what would ship ------------------------------------------------------------
const gate = run('npm', ['run', 'check', '--silent']);
if (gate.status === 0) { ok('npm run check passes (types, tests, bundle, and `vsce ls` equals the allowlist)'); }
else { bad('npm run check passes', 'run it to see why'); }

const changelog = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
if (new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\] - \\d{4}-\\d{2}-\\d{2}\\s*$`, 'm').test(changelog)) { ok(`CHANGELOG.md has a "## [${version}] - date" heading (hyphen, playbook V.6)`); }
else { bad(`CHANGELOG.md has a "## [${version}] - date" heading`, 'missing, or it uses a character other than " - "'); }

if (!pkg.icon) { bad('package.json names an icon', 'no "icon" field'); }
else if (!existsSync(resolve(root, pkg.icon))) { bad('icon file exists', `${pkg.icon} not found`); }
else {
  const b = readFileSync(resolve(root, pkg.icon));
  const png = b.length > 24 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const w = png ? b.readUInt32BE(16) : 0, h = png ? b.readUInt32BE(20) : 0;
  if (png && w >= 128 && h >= 128) { ok(`icon is a PNG, ${w}x${h} (vsce rejects SVG; the Marketplace wants at least 128 px)`); }
  else { bad('icon is a PNG of at least 128x128', png ? `it is ${w}x${h}` : `${pkg.icon} is not a PNG`); }
}

const floor = pkg.engines?.vscode?.replace(/^[\^~>=\s]+/, '');
const typesPath = resolve(root, 'node_modules/@types/vscode/package.json');
if (floor && existsSync(typesPath)) {
  const installed = JSON.parse(readFileSync(typesPath, 'utf8')).version;
  if (!newer(installed, floor)) { ok(`@types/vscode ${installed} is not newer than engines.vscode ${floor} (vsce refuses otherwise)`); }
  else { bad('@types/vscode is not newer than engines.vscode', `installed ${installed} > floor ${floor}`); }
} else { bad('@types/vscode and engines.vscode can be compared', 'one of them is missing'); }

// --- the identifier, on both registries -----------------------------------------
{
  const r = run(resolve(root, 'node_modules/.bin/vsce'), ['show', id, '--json']);
  let live;
  try { live = JSON.parse(r.stdout).versions?.[0]?.version; } catch { live = undefined; }
  if (r.status !== 0 || !live) { ok(`${id} is free on the VS Code Marketplace (or has no version yet)`); }
  else if (newer(version, live)) { ok(`${id} is on the Marketplace at ${live}; ${version} is new`); }
  else { bad(`${version} is new on the Marketplace`, `${id} is already published at ${live}`); }
}
try {
  const res = await fetch(`https://open-vsx.org/api/${publisher}/${name}`);
  const body = await res.json();
  if (body.error || !body.version) { ok(`${id} is free on Open VSX`); }
  else if (newer(version, body.version)) { ok(`${id} is on Open VSX at ${body.version}; ${version} is new`); }
  else { bad(`${version} is new on Open VSX`, `already published at ${body.version}`); }
} catch (e) { bad('Open VSX could be asked', String(e.message ?? e)); }

// --- tokens actually authenticate (their values go only to the child process) -----
if (haveVsce) {
  const r = run(resolve(root, 'node_modules/.bin/vsce'), ['verify-pat', publisher], { VSCE_PAT: env.VSCE_PAT });
  (r.status === 0 ? ok : bad)(`VSCE_PAT authenticates as publisher ${publisher} (vsce verify-pat)`, r.status === 0 ? '' : 'rejected, or no token reached vsce (an all-"a" GUID in its message means none loaded)');
} else { skip('vsce verify-pat', NO_TOKENS ? '--no-tokens' : 'no VSCE_PAT'); }
if (haveOvsx) {
  const r = run('npx', ['--yes', OVSX, 'verify-pat', publisher], { OVSX_PAT: env.OVSX_PAT });
  (r.status === 0 ? ok : bad)(`OVSX_PAT authenticates for namespace ${publisher} (ovsx verify-pat)`, r.status === 0 ? '' : 'rejected, or ovsx did not read OVSX_PAT from the environment');
} else { skip('ovsx verify-pat', NO_TOKENS ? '--no-tokens' : 'no OVSX_PAT'); }

// --- the tree is the thing that ships --------------------------------------------
// docs/ is excluded on purpose: nothing under it ships (the allowlist check in `npm run check` proves the
// package holds six named files, none of them from docs/), and during any working session it is dirty: the ADR
// Manager autosaves into docs/adr/.working/ and people answer ADRs in place. Met 2026-10-14, when the check
// blocked 0.2.0 and a seat worked around it with `git update-index --assume-unchanged`. Everything outside
// docs/ (src, package.json, README, CHANGELOG, media, the workflows) must still match the tag.
const dirty = run('git', ['status', '--porcelain', '--untracked-files=no', '--', '.', ':(exclude)docs']).stdout.trim();
const label = 'no uncommitted changes to tracked files outside docs/';
if (!dirty) { ok(label); }
else { bad(label, dirty.split('\n').slice(0, 4).join(' | ')); }
const tag = run('git', ['describe', '--exact-match', '--tags', 'HEAD']).stdout.trim();
if (tag === `v${version}`) { ok(`HEAD is tagged v${version}`); }
else { bad(`HEAD is tagged v${version}`, tag ? `HEAD is tagged ${tag}` : 'HEAD has no tag'); }

// --- report ----------------------------------------------------------------------
const mark = { ok: '✓', bad: '✗', skip: '·' };
console.log(`\npublish-check for ${id} ${version}\n`);
for (const r of results) { console.log(`  ${mark[r.state]} ${r.what}${r.detail ? `\n      ${r.detail}` : ''}`); }
const failed = results.filter(r => r.state === 'bad').length;
console.log(`\n${results.filter(r => r.state === 'ok').length} passed, ${failed} failed, ${results.filter(r => r.state === 'skip').length} skipped.`);
console.log(`
Not checkable here, to be done by hand before publishing:
  · Spike 0 re-run on the VS Code version the listing calls "tested" (ADR-0009)
  · the Open VSX publisher agreement signed on the Eclipse account
  · every screenshot looked at by a person (docs/release/SCREENSHOT-CATALOG.md)
`);
process.exit(failed ? 1 : 0);
