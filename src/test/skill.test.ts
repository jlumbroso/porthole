import { beforeEach, describe, expect, it } from 'vitest';
import { stamped, stateOf } from '../skill';
import { activateFresh, command, MANIFEST } from './helpers/activate';
import {
  answerNextModal, answerNextQuickPick, followLink, loggedLines, modalsShown, seedFile, setConfig, setWorkspaceFolders,
  shownMessages, writtenFile,
} from './helpers/vscodeMock';

// Adding Porthole's skill for models to a project (ADR-0016, iteration 3): one
// action, from the command palette or from a link, which replaces a copy
// someone edited only when the person says so.

const BUNDLED = '---\nname: porthole\ndescription: Put a page in front of the human.\n---\n\n# Showing a page\n';
const target = (folder: string) => `${folder}/.claude/skills/porthole/SKILL.md`;
const version = MANIFEST.version as string;

beforeEach(() => {
  activateFresh();
  seedFile('/ext/.claude/skills/porthole/SKILL.md', BUNDLED);
  setWorkspaceFolders(['/work']);
});

describe('the copy Porthole writes', () => {
  it('keeps the front matter first, then a mark naming the version and a checksum', () => {
    const text = stamped(BUNDLED, '0.4.0');

    expect(text.startsWith('---\nname: porthole\n')).toBe(true); // Claude Code reads the front matter only at the top
    expect(text).toMatch(/^---\n[\s\S]*?\n---\n<!-- written by Porthole 0\.4\.0; sha256 of this file without this line: [0-9a-f]{64} -->\n\n# Showing a page/);
  });

  it('tells a current copy, an untouched older one and an edited one apart', () => {
    const now = stamped(BUNDLED, '0.4.0');
    const older = stamped(`${BUNDLED}\nAn older paragraph.\n`, '0.3.9');

    expect(stateOf(undefined, now)).toBe('absent');
    expect(stateOf(now, now)).toBe('current');
    expect(stateOf(older, now)).toBe('untouched');
    expect(stateOf(older.replace('older', 'edited'), now)).toBe('edited');
    expect(stateOf(BUNDLED, now)).toBe('edited'); // copied by hand: no mark, so treated as someone's own
  });
});

describe('from the command palette', () => {
  it('adds the skill to the workspace folder', async () => {
    await command('porthole.installSkill')();

    expect(writtenFile(target('/work'))).toBe(stamped(BUNDLED, version));
    expect(shownMessages().at(-1)).toMatch(/installed its skill for models: work\/\.claude\/skills\/porthole\/SKILL\.md/);
  });

  it('asks which folder when the window has several', async () => {
    setWorkspaceFolders(['/work', '/notes']);
    answerNextQuickPick(items => items.find(item => item.label === 'notes'));

    await command('porthole.installSkill')();

    expect(writtenFile(target('/notes'))).toBeDefined();
    expect(writtenFile(target('/work'))).toBeUndefined();
  });

  it('replaces an untouched copy from an older Porthole, and says it updated it', async () => {
    seedFile(target('/work'), stamped(`${BUNDLED}\nAn older paragraph.\n`, '0.3.9'));

    await command('porthole.installSkill')();

    expect(writtenFile(target('/work'))).toBe(stamped(BUNDLED, version));
    expect(shownMessages().at(-1)).toMatch(/updated its skill/);
  });

  it('asks before replacing a copy someone edited, and keeps it unless told otherwise', async () => {
    const edited = `${stamped(BUNDLED, '0.3.9')}\nOur project's own note.\n`;
    seedFile(target('/work'), edited);
    answerNextModal(undefined);

    await command('porthole.installSkill')();

    expect(modalsShown()[0].message).toMatch(/was edited since Porthole wrote it/);
    expect(writtenFile(target('/work'))).toBe(edited);
  });
});

describe('from a link', () => {
  it('asks the first time in a project, then adds it without asking', async () => {
    answerNextModal('Install It');
    await followLink('/v1/install-skill', '');
    expect(modalsShown()).toHaveLength(1);
    expect(writtenFile(target('/work'))).toBe(stamped(BUNDLED, version));

    seedFile(target('/work'), stamped(`${BUNDLED}\nAn older paragraph.\n`, '0.3.9'));
    await followLink('/v1/install-skill', '');

    expect(modalsShown()).toHaveLength(1); // not asked again
    expect(writtenFile(target('/work'))).toBe(stamped(BUNDLED, version));
  });

  it('writes nothing when the person declines', async () => {
    answerNextModal(undefined);
    await followLink('/v1/install-skill', '');

    expect(writtenFile(target('/work'))).toBeUndefined();
  });

  it('keeps an edited copy when the person says no to replacing it, and says so', async () => {
    const edited = `${stamped(BUNDLED, '0.3.9')}\nOur project's own note.\n`;
    seedFile(target('/work'), edited);
    answerNextModal('Install It'); // may links install here?
    answerNextModal(undefined);    // replace the edited copy? no

    await followLink('/v1/install-skill', '');

    expect(writtenFile(target('/work'))).toBe(edited);
    expect(shownMessages().at(-1)).toMatch(/already has an edited copy of Porthole's skill; Porthole left it as it is/);
  });

  describe('Regression tests', () => {
    it('asks a link\'s person the same question as the palette before replacing an edited copy', async () => {
      // Bug (Jérémie, ADR-0016 QST-CHECK-SKILL-INSTALL, 2026-10-19): from the
      // palette, an edited copy brought "Replace it?"; from a link, Porthole
      // asked only whether links may install, then gave up on the edited copy
      // without asking. The person decides about their edits, whichever route.
      const edited = `${stamped(BUNDLED, '0.3.9')}\nOur project's own note.\n`;
      seedFile(target('/work'), edited);
      answerNextModal('Install It');
      answerNextModal('Replace It');

      await followLink('/v1/install-skill', '');

      expect(modalsShown().map(modal => modal.message)).toEqual([
        expect.stringMatching(/asks Porthole to install its skill for models in work/),
        expect.stringMatching(/was edited since Porthole wrote it\. Replace it/),
      ]);
      expect(writtenFile(target('/work'))).toBe(stamped(BUNDLED, version));
    });
  });

  it('needs repo= when the window has several folders, and refuses when its setting is off', async () => {
    setWorkspaceFolders(['/work', '/notes']);
    await followLink('/v1/install-skill', '');
    expect(shownMessages().at(-1)).toMatch(/several workspace folders; add repo=<folder name>/);

    setConfig({ 'outsideLinks.actions.installSkill': false });
    await followLink('/v1/install-skill', 'repo=notes');
    expect(shownMessages().at(-1)).toMatch(/porthole\.outsideLinks\.actions\.installSkill/);
    expect(writtenFile(target('/notes'))).toBeUndefined();
  });
});

describe('how a model finds out', () => {
  it('names both routes in Porthole\'s log at startup', () => {
    expect(loggedLines().join('\n')).toMatch(/Porthole: Install the Skill for Models in This Project.*vscode:\/\/jlumbroso\.porthole\/v1\/install-skill/);
  });
});
