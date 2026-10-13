#!/usr/bin/env node
// Purpose: Surveyor 5.1, 2026-10-13. Purser's MARKETPLACE-SKILL-FEEDBACK.md §2.2 says (Read,
// not Ran) that `vsce package` 4.0.0 scans the files it packages for secrets and refuses on a
// hit or on a `.env` file, and leaves open whether the scan would catch an Azure DevOps PAT
// (the one credential this release actually mints). This runs vsce's own scanner module on
// DUMMY strings of the right shapes, in memory, without packaging anything and without
// touching a tracked file. Nothing here is a real credential.
//
// Usage (from the repo root, with node on PATH):
//   node scripts/ephemeral/2026-10-13-vsce-secret-scan-probe.mjs

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { lintText } = require('@vscode/vsce/out/secretLint.js');

// Classic Azure DevOps PAT: 52 lowercase letters/digits. Newer (2024+) ones are 84 chars.
const adoClassic = Array.from({ length: 52 }, (_, i) => 'abcdefghijklmnopqrstuvwxyz0123456789'[(i * 7) % 36]).join('');
const adoNew = Array.from({ length: 84 }, (_, i) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[(i * 11) % 62]).join('');

const probes = [
  ['README.md', 'github classic token', 'token: ghp_' + 'A'.repeat(36)],
  ['README.md', 'github fine-grained', 'token: github_pat_' + 'B'.repeat(22) + '_' + 'c'.repeat(59)],
  ['README.md', 'ADO PAT (52 lowercase alnum)', 'VSCE_PAT=' + adoClassic],
  ['README.md', 'ADO PAT (84 mixed alnum)', 'VSCE_PAT=' + adoNew],
  ['README.md', 'ADO PAT in basic-auth URL', 'https://user:' + adoClassic + '@dev.azure.com/org/project'],
  ['README.md', 'AWS access key id', 'AKIA' + 'IOSFODNN7EXAMPLE'],
  ['README.md', 'slack bot token', 'xoxb-' + '1234567890-1234567890123-' + 'x'.repeat(24)],
  ['.env', 'a .env file with a harmless line', 'FOO=bar'],
  ['README.md', 'control: plain prose', 'porthole pops a page into a floating window'],
];

for (const [fileName, label, text] of probes) {
  const result = await lintText(text, fileName, true, true);
  const hits = result.ok ? [] : result.results.map(r => r.ruleId);
  console.log(`${result.ok ? 'pass ' : 'FLAG '} ${label.padEnd(36)} ${hits.join(', ')}`);
}

// --- Outcome (Surveyor 5.1, 2026-10-13, vsce 4.0.0, node 22) ----------------------------
// FLAG  github classic token      secretlint-rule-github
// FLAG  github fine-grained       secretlint-rule-github
// pass  ADO PAT (52 lowercase alnum)
// pass  ADO PAT (84 mixed alnum)
// pass  ADO PAT in basic-auth URL        (basicauth rule is configured off: allowMessageIds)
// pass  AWS access key id                (AWS's documented example key; presumably allow-listed)
// FLAG  slack bot token           secretlint-rule-slack
// FLAG  a .env file               secretlint-rule-no-dotenv
// pass  control: plain prose
// Conclusion: vsce's packaging scan does not detect an Azure DevOps PAT in any shape tried.
// The skill's "where may the value live" rule (§IV) is the only net for that credential.
// Recorded in docs/reviews/2026-10-13-version-floor-and-readme-check.md, section 5.
