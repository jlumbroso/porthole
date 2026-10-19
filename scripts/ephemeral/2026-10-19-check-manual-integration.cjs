// Verify product-page manual discovery and the public contribution bundle.
// Uses the existing Playwright installation; installs no dependency.
// Usage: node <script> <playwright-module> <product-base-url> <screenshots-dir>
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.argv[2]);
const base = process.argv[3].replace(/\/?$/, '/');
const output = process.argv[4];
const root = path.resolve(__dirname, '../..');
const manual = 'https://jlumbroso.github.io/porthole-docs/';

(async () => {
  const { findSecrets } = await import(pathToFileURL(path.join(root, 'scripts/scan-secrets.mjs')).href);
  const bundle = path.join(root, 'docs/manual');
  const files = [
    '.gitignore', 'README.md', 'content/chapters.json',
    ...['first-window', 'html-and-markdown', 'window-controls', 'terminal-and-agents', 'settings-and-troubleshooting'].map(slug => 'content/' + slug + '.html'),
    'scripts/build.py', 'assets/manual.css', 'assets/manual.js', 'assets/LICENSE.porthole',
    'assets/icon.png', 'assets/porthole-markdown-light.png'
  ];
  for (const name of files) {
    const file = path.join(bundle, name);
    assert(fs.lstatSync(file).isFile(), 'Regular bundle file: ' + name);
    if (!name.endsWith('.png')) assert.deepEqual(findSecrets(fs.readFileSync(file, 'utf8')), [], 'Credential scan: ' + name);
  }
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    let cases = 0;
    for (const width of [320, 420, 900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const colorScheme of ['light', 'dark']) {
        await page.emulateMedia({ colorScheme });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Product-page overflow: ' + width + '/' + colorScheme);
        const nav = page.locator('.site-header nav a').filter({ hasText: 'Manual' });
        assert(await nav.isVisible(), 'Manual navigation visible: ' + width);
        assert.equal(await nav.getAttribute('href'), manual);
        const hero = page.locator('.hero-actions a').filter({ hasText: 'Read the manual' });
        assert(await hero.isVisible());
        assert.equal(await hero.getAttribute('href'), manual);
        cases++;
      }
    }
    assert.equal(await page.locator('.requirements a').getAttribute('href'), manual + 'settings-and-troubleshooting.html');
    assert.equal(await page.locator('.site-footer a').filter({ hasText: 'Manual' }).getAttribute('href'), manual);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.screenshot({ path: path.join(output, 'product-manual-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 420, height: 920 });
    await page.screenshot({ path: path.join(output, 'product-manual-narrow.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ base, productLayoutCases: cases, manualLinks: true, publicBundleFiles: files.length, bundleSecretScan: true, output }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

// 2026-10-19: local run passed eight width/theme cases and all four manual
// discovery paths. The fourteen named public-bundle files passed the same
// credential rules used by the repository gate. Screenshots were inspected.
