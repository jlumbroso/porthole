import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { activateFresh } from './helpers/activate';
import {
  answerNextModal, executedCalls, followLink, modalsShown, openFloatingGroup, setCommandBehavior, setConfig,
  settingUpdates, setWorkspaceFolders, shownMessages,
} from './helpers/vscodeMock';

// Outside `open` (ADR-0013). The links here are written the way a careless or
// hostile sender would write them, on real folders, because what decides is
// the real path on disk: `..`, symbolic links and letter case (Purser's four
// cases, ADR-0013's Decision).

const INTERNAL = '_workbench.openWith';

let root: string;
let work: string;
let elsewhere: string;

const page = (dir: string, name: string) => { const path = join(dir, name); writeFileSync(path, '<title>t</title>'); return path; };
const link = (file: string, extra = '') => `file=${encodeURIComponent(file)}${extra}`;
const opened = () => executedCalls().filter(call => call.id === INTERNAL).map(call => (call.args[0] as { fsPath: string }).fsPath);
const sizeOfLastOpen = () => (executedCalls().filter(call => call.id === INTERNAL).at(-1)!.args[2] as [number, any])[1].auxiliary.bounds;

beforeEach(() => {
  activateFresh();
  setCommandBehavior(INTERNAL, () => { openFloatingGroup(); });
  root = realpathSync(mkdtempSync(join(tmpdir(), 'porthole-links-')));
  work = join(root, 'work');
  elsewhere = join(root, 'elsewhere');
  mkdirSync(work);
  mkdirSync(elsewhere);
  setWorkspaceFolders([work]);
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('opening a page from a link', () => {
  it('opens a file in the workspace at the size the link gives, without asking', async () => {
    const tasks = page(work, 'tasks.html');
    await followLink('/v1/open', link(tasks, '&width=500&height=700'));

    expect(opened()).toEqual([tasks]);
    expect(sizeOfLastOpen()).toEqual({ width: 500, height: 700 });
    expect(modalsShown()).toEqual([]);
  });

  it('reads a link without a version as version 1, and refuses a newer version it cannot know', async () => {
    const tasks = page(work, 'tasks.html');
    await followLink('/open', link(tasks));
    await followLink('/v2/open', link(tasks));

    expect(opened()).toEqual([tasks]);
    expect(shownMessages().at(-1)).toMatch(/newer version of Porthole/);
  });

  it('finds a relative path in the workspace folder, and asks for repo= when two folders both have it', async () => {
    const other = join(root, 'other');
    mkdirSync(other);
    page(work, 'tasks.html');
    page(other, 'tasks.html');
    setWorkspaceFolders([work, other]);

    await followLink('/v1/open', 'file=tasks.html');
    expect(opened()).toEqual([]);
    expect(shownMessages().at(-1)).toMatch(/more than one workspace folder; add repo=/);

    await followLink('/v1/open', 'file=tasks.html&repo=other');
    expect(opened()).toEqual([join(other, 'tasks.html')]);
  });

  it('keeps spaces and plus signs in a file name, as the sender encoded them', async () => {
    const odd = page(work, 'my tasks+notes.html');
    await followLink('/v1/open', link(odd));

    expect(opened()).toEqual([odd]);
  });

  it('refuses what is not a page, a file that does not exist, and a size that is not a number', async () => {
    setConfig({ 'outsideLinks.allowLocalFiles': true });
    const script = join(work, 'run.sh');
    writeFileSync(script, 'echo hi');
    await followLink('/v1/open', link(script));
    await followLink('/v1/open', link(join(work, 'missing.html')));
    await followLink('/v1/open', link(page(work, 'tasks.html'), '&width=wide&height=700'));

    expect(opened()).toEqual([]);
    expect(shownMessages()).toEqual([
      'Porthole did not open a link from outside VS Code: run.sh is not an HTML or Markdown file.',
      `Porthole did not open a link from outside VS Code: ${join(work, 'missing.html')} does not exist.`,
      'Porthole did not open a link from outside VS Code: width and height must be whole numbers of pixels.',
    ]);
  });

  it('opens nothing, and says which setting is off, when outside links or outside opens are turned off', async () => {
    const tasks = page(work, 'tasks.html');
    setConfig({ 'outsideLinks.enabled': false });
    await followLink('/v1/open', link(tasks));
    setConfig({ 'outsideLinks.enabled': true, 'outsideLinks.actions.open': false });
    await followLink('/v1/open', link(tasks));

    expect(opened()).toEqual([]);
    expect(shownMessages()[0]).toMatch(/porthole\.outsideLinks\.enabled/);
    expect(shownMessages()[1]).toMatch(/porthole\.outsideLinks\.actions\.open/);
  });
});

describe('files no setting allows', () => {
  it('asks, and opens nothing when the person closes the question', async () => {
    const outside = page(elsewhere, 'notes.html');
    answerNextModal(undefined);
    await followLink('/v1/open', link(outside));

    expect(modalsShown()).toHaveLength(1);
    expect(modalsShown()[0].message).toContain(outside);
    expect(opened()).toEqual([]);
  });

  it('"Open Once" opens it and changes no setting; "Allow This Folder" also lets the next link through', async () => {
    const outside = page(elsewhere, 'notes.html');
    answerNextModal('Open Once');
    await followLink('/v1/open', link(outside));
    expect(settingUpdates()).toEqual([]);

    answerNextModal('Allow This Folder');
    await followLink('/v1/open', link(outside));
    await followLink('/v1/open', link(page(elsewhere, 'more.html')));

    expect(opened()).toEqual([outside, outside, join(elsewhere, 'more.html')]);
    expect(modalsShown()).toHaveLength(2); // the third link was not asked about
    expect(settingUpdates()).toEqual([
      { section: 'porthole', key: 'outsideLinks.allowedFolders', value: [elsewhere], target: 1 },
    ]);
  });

  describe('Regression tests', () => {
    // Not bugs we have had: the four ways a path can look inside the workspace
    // while pointing out of it, required as tests before the handler shipped
    // (Purser, ADR-0013). Each must reach the question, never open silently.

    it('does not treat "work/../elsewhere" as inside the workspace', async () => {
      const outside = page(elsewhere, 'notes.html');
      await followLink('/v1/open', link(`${work}/../elsewhere/notes.html`));

      expect(modalsShown()).toHaveLength(1);
      expect(modalsShown()[0].message).toContain(outside);
      expect(opened()).toEqual([]);
    });

    it('does not let an encoded ".." (%2e%2e) slip past', async () => {
      page(elsewhere, 'notes.html');
      await followLink('/v1/open', `file=${work}/%2e%2e/elsewhere/notes.html`);

      expect(modalsShown()).toHaveLength(1);
      expect(opened()).toEqual([]);
    });

    it('does not trust a symbolic link inside the workspace that points out of it', async () => {
      const outside = page(elsewhere, 'notes.html');
      symlinkSync(outside, join(work, 'looks-local.html'));
      await followLink('/v1/open', link(join(work, 'looks-local.html')));

      expect(modalsShown()).toHaveLength(1);
      expect(modalsShown()[0].message).toContain(outside);
      expect(opened()).toEqual([]);
    });

    it.skipIf(process.platform !== 'darwin')('recognizes a differently cased path to a workspace file as inside the workspace (macOS)', async () => {
      page(work, 'tasks.html');
      await followLink('/v1/open', link(join(work.toUpperCase(), 'TASKS.HTML')));

      expect(modalsShown()).toEqual([]);
      expect(opened()).toHaveLength(1);
    });
  });
});
