// Local rendering check for the proposed Porthole manual. No dependency is installed.
// Usage: node scripts/ephemeral/2026-10-19-preview-manual.cjs <playwright-module> <font-dir> <output-dir>
// Fonts and screenshots stay in the supplied local directories, outside the public tree.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.argv[2] || 'playwright');
const fontDir = process.argv[3];
const output = process.argv[4];
if (!fontDir || !output) throw new Error('Supply a local font directory and screenshot output directory.');
const html = path.resolve(__dirname, '../../docs/design/2026-10-19-manual-study.html');
const url = pathToFileURL(html).href;
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    const remoteRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()); });
    await page.goto(url);
    const fonts = fs.readdirSync(fontDir).filter(name => /^BerkeleyMono-.*\.woff2$/.test(name));
    assert.equal(fonts.length, 6, 'Expect the six purchased faces for this comparison');
    // A convenient PRIVATE copy for the font purchaser; never stage this output.
    const faces = fonts.map(name => {
      const weight = /Thin/.test(name) ? 100 : /Bold/.test(name) ? 700 : 400;
      const style = /Oblique/.test(name) ? 'oblique' : 'normal';
      const data = fs.readFileSync(path.join(fontDir, name)).toString('base64');
      return `@font-face{font-family:'Berkeley Study';src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:${weight};font-style:${style};}`;
    }).join('\n');
    const privateHtml = fs.readFileSync(html, 'utf8')
      .replace('</head>', `<style>${faces}</style></head>`)
      .replace(/(src|href)="(\.\.\/\.\.\/[^\"]+)"/g, (_, attribute, relative) => `${attribute}="${pathToFileURL(path.resolve(path.dirname(html), relative)).href}"`)
      .replace('this page uploads nothing and includes no font binaries.', 'this private copy includes the purchased font data for local viewing. Keep this copy private; it uploads nothing.')
      .replace('System mono until loaded', 'Berkeley Mono · private local preview');
    fs.writeFileSync(path.join(output, 'preview-with-berkeley.html'), privateHtml);
    await page.locator('#fonts').setInputFiles(fonts.map(name => path.join(fontDir, name)));
    await page.locator('#font-status').filter({ hasText: '6 faces loaded locally' }).waitFor();
    assert(await page.evaluate(() => document.fonts.check('14px "Berkeley Study"')));
    assert(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)));
    await page.screenshot({ path: path.join(output, '01-paper-serif.png'), fullPage: true });
    await page.locator('[data-heading-choice="mono"]').click();
    await page.screenshot({ path: path.join(output, '02-paper-mono.png'), fullPage: true });
    await page.locator('[data-chapter-link="outside-open"]').click();
    await page.locator('#outside-open').waitFor({ state: 'visible' });
    assert(await page.locator('#outside-open').isVisible());
    assert(!(await page.locator('#first-window').isVisible()));
    await page.evaluate(() => { location.hash = 'reading'; });
    await page.waitForFunction(() => location.hash === '#reading');
    await page.waitForTimeout(50);
    assert(await page.locator('#outside-open').isVisible(), 'Skip link must preserve the active chapter');
    await page.locator('[data-theme-choice="dark"]').click();
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, '03-dark-reference.png'), fullPage: true });
    await page.locator('.specimen summary').click();
    await page.locator('.specimen').screenshot({ path: path.join(output, '04-font-specimen.png') });
    const checked = [];
    for (const width of [1440, 900, 420, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const chapter of ['first-window', 'outside-open']) {
        await page.evaluate(id => { location.hash = id; }, chapter);
        await page.waitForFunction(id => !document.getElementById(id).hidden, chapter);
        for (const heading of ['serif', 'mono']) {
          await page.locator(`[data-heading-choice="${heading}"]`).click();
          const sizes = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, available: innerWidth }));
          assert(sizes.actual <= sizes.available, `Horizontal overflow: ${JSON.stringify({ width, chapter, heading, sizes })}`);
          checked.push(`${width}/${chapter}/${heading}`);
        }
      }
    }
    await page.setViewportSize({ width: 420, height: 920 });
    await page.locator('[data-theme-choice="light"]').click();
    await page.locator('[data-heading-choice="serif"]').click();
    await page.evaluate(() => { location.hash = 'first-window'; });
    await page.waitForFunction(() => !document.getElementById('first-window').hidden);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, '05-narrow-chapter.png'), fullPage: true });
    const noScript = await browser.newPage({ javaScriptEnabled: false });
    await noScript.goto(url);
    assert(await noScript.locator('#first-window').isVisible());
    assert(await noScript.locator('#outside-open').isVisible());
    await noScript.close();
    assert.deepEqual(errors, [], 'No page JavaScript errors');
    assert.deepEqual(remoteRequests, [], 'The study must make no HTTP requests');
    await page.goto(pathToFileURL(path.join(output, 'preview-with-berkeley.html')).href);
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.fonts.check('14px "Berkeley Study"')));
    assert(await page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)));
    console.log(JSON.stringify({ faces: fonts.length, layoutCases: checked.length, imagesLoaded: true, noJavaScriptChaptersReadable: true, remoteRequests: remoteRequests.length, pageErrors: errors.length, output }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

// Outcome, 2026-10-19: six purchased faces loaded locally; 16 chapter/heading/width
// combinations passed overflow checks; both chapters readable without JavaScript;
// images loaded, no page errors, no automatic HTTP requests under file://.
// Sounder inspected the five captures. An early navigation assertion raced the
// hash-change event; it now waits for visibility. A separate review found that
// #reading reset the selected chapter; the corrected behavior is checked above.
// The private embedded-font preview and screenshots were written outside the repo.
