<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Teach models to use porthole

- **Date**: 2026-10-13
- **Iteration**: 5
- **Status**: Implemented
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), with Purser 5.5 and Sounder 6 in the seed's thread

**TL;DR**: Once the outside verbs work, write a skill that teaches any model to use porthole; one question decides where it lives and how it reaches a model that has never seen this repository.

---

## Originating Context

**Source**: `Seed: docs/adr/seed-2026-10-13-porthole-for-models.md`, Jérémie: *"And if we succeed, I then want to create a little skill to teach models how to get the most out of the Porthole."*

**Agency Grant**: Chunk the seed into ORRCF questions, fully in template.

---

## Explicitation

1. **It waits for the verbs.** A skill must never describe a verb that has not shipped (Purser).
2. **It teaches recovery, not only commands**: what an "unknown" result means, how to ask about the same request again after a timeout, what to do when porthole is not installed (Sounder).
3. **It is tested on strangers**: a fresh model with no project context, following the document alone, before it counts as finished (Purser, after Lintel's practice).

**Confirm**: Jérémie, through the question below.

---

## Questions

### QST-SKILL-HOME: Where should the porthole skill live, and how does a model elsewhere get it?
- Status: answered
- Why asking: "Any local agent" (ADR-0013, QST-OPEN-CALLERS) means more than Claude Code, and a Claude skill is one tool's format. The skill also must not reach into a user's settings without asking.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — a plain document plus a thin Claude skill, both in the repository**: the full text in `docs/for-models.md` that any agent can be pointed at, and a short `.claude/skills/porthole/SKILL.md` that says when to use it and points to the document. Each GitHub Release attaches a copy.
- **B — a Claude skill only**, in the repository.
- **C — shipped inside the extension**, with a porthole command that copies the instructions to the clipboard or writes the skill into a folder you choose.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — a plain document and a thin skill, in the repository.** *Rationale*: Purser's design: the portable core serves every agent and the Claude skill is a pointer; the release workflow already attaches files to each GitHub Release; and C would widen the six-file package and, in its folder-writing form, write into a user's configuration. *Confidence*: 0.75 — because it reuses machinery that exists. *If wrong*: if people install porthole from the Marketplace and never visit the repository, C's copy-to-clipboard command becomes the useful way in.

**ANS:** (by Jérémie Lumbroso)
I doubt people who install this will visit the repo, I think we are better off doing:
- Option B and Option C
- and the release link of the Claude skill publicly disclosed in info messages of the log?

---

### QST-SKILL-LINK-ASK: When a link from outside VS Code asks Porthole to add the skill to a project, should Porthole ask you first?
- Status: answered
- Why asking: **Iteration 3 lets a model install the skill itself**, by sending a link from a terminal, the same way it opens a page. Unlike opening a page, this writes a file into your project: always the same file (the skill bundled in the extension), always at the same place (`.claude/skills/porthole/SKILL.md` in the receiving window's workspace folder), never overwriting a copy someone edited. You would then commit it or ignore it. The question is how much a link may do without you.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — ask the first time in each project**: the first link in a project shows a question (add it, or not); after a yes, links in that project update the file without asking. A per-action setting can turn links off for this entirely.
- **B — never ask**: links add or update the file whenever the setting allows (on by default), like `open` for workspace files. The log and a notice say what was written.
- **C — always ask**: every link that would write the file asks first.
- **D — links may not do it**: only the command palette adds the skill; a link is refused, and its notice names the command.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**A — ask the first time in each project.** *Rationale*: a file appearing in a repository is a change a person should see once, especially in a public one, where it will be committed; after that, a model keeping its own copy current is exactly the convenience the link exists for. B is the `open` rule, but `open` writes nothing; C asks the same question again after it has been answered; D brings back the step this iteration removes, a model asking you to run a command for it. *Confidence*: 0.7 — because how often you want to be asked is your call, and it is cheap to change before release. *If wrong*: if you are content to see the file in the next commit's diff, B.

**ANS:** (by Jérémie Lumbroso)
Yes, agreed with Option A as recommended.

---

### QST-NAME-SKILL: What are the command, the link verb, the setting and the log line called?
- Status: answered
- Why asking: All are new user-facing words, and the verb and the setting's key are permanent once published. ADR-0017's verb list (`open`, `list`, `refresh`, …) asserts states, never deltas, and has no verb for this. Provisional, as built:
  - command: **Porthole: Add the Skill for Models to This Project** (`porthole.addSkill`)
  - link verb: `vscode://jlumbroso.porthole/v1/add-skill` (optional `repo=` to pick the workspace folder, as for `open`)
  - setting: `porthole.outsideLinks.actions.addSkill` (boolean, on), beside `actions.open`
  - the question (if QST-SKILL-LINK-ASK is A or C): "A link from outside VS Code asks Porthole to add its skill for models to {folder} (.claude/skills/porthole/SKILL.md). Add it?", buttons **Add It** and VS Code's **Cancel**
  - the notice when a copy someone edited is found: "{folder} already has an edited copy of Porthole's skill; Porthole left it as it is."
  - the log line at startup: "Models can learn to use Porthole from its skill: run 'Porthole: Add the Skill for Models to This Project', or send vscode://jlumbroso.porthole/v1/add-skill."
- Need: pick a letter (or override — any shape answers), or rule each name

Options:
- **A — as provisional**: every word above ships as it is.
- **B — the review's names**: the review rules each line.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-18)
**B — the review's names.** *Rationale*: ADR-0017's rule (verbs assert states) argues against "add", which names a delta; a state-shaped verb might read better beside `open`. And "Skill for Models" may be the wrong noun for a person reading the palette: the file is a Claude skill, but people may know it as instructions. *Confidence*: 0.65 — because these are words. *If wrong*: if the review finds them right, A.

**Recommendation**: (by the naming review, 2026-10-19)

**B — with the verb corrected to `install-skill`, the noun kept, and everything else blessed modulo the verb.**

1. **The verb: `install-skill`** (command id `porthole.installSkill`, link `/v1/install-skill`, setting `actions.installSkill`). Glazier's instinct about "add" is right, but the diagnosis sharpens: the operation's own contract (identical copy → nothing; unedited old → replaced; edited → never touched) is not an *add* — it is an **idempotent converge**: ensure the skill is present and current, respecting edits. The register already owns the word for that: **`install`**, which in tooling means exactly converge-idempotently (`npm install` is the precedent every model and person carries), and whose never-clobber-edited-files guard is installer convention, not a surprise. "Add" implies append-and-maybe-duplicate — a second add reads as an error; a second install reads as a no-op, which is the truth. The ADR-0017 verb list grows by one, with this contract documented beside it.
2. **The noun stands: "the Skill for Models."** Glazier's doubt resolves *for* the provisional: a stranger in the palette reads "the thing models use" with zero jargon tax, while bare "Skill" taxes non-Claude-Code users and "instructions" underclaims (a skill is load-on-demand instructions with a name). Command title: **"Porthole: Install the Skill for Models in This Project"** — the scoping tail stays because the command writes into the project and asks which folder when there are several.
3. **The question and button, verb-swapped**: "…asks Porthole to install its skill for models in {folder} (.claude/skills/porthole/SKILL.md). Install it?" — button **Install It** (answering in the question's words, per the standing button law), plus Cancel.
4. **The edited-copy notice ships as built** — "{folder} already has an edited copy of Porthole's skill; Porthole left it as it is." is plain, warm, and states the guard exactly.
5. **The startup log line, verb-swapped, is blessed by name**: a model that has never met the skill learns both routes from the output channel — that is the built≠known rung of teaching debt paid at activation, and it is the cheapest such payment this review has seen.

And retroactive blessing for the ADR-0025 deviation Glazier reported: moving the setting-write disclosure from a detail line to the notice's second sentence, because non-blocking notices have no detail line, is a correct field-adaptation — the law's intent (the zone discloses, the button stays clean) was preserved against the surface's real mechanics, and deviations carried with their reasons are exactly how rulings should travel. *Confidence*: 0.8. *If wrong*: `add-skill` is one rename inside a pre-release window — but `install`'s no-op-on-repeat semantics is the one the contract already implements.

**ANS:** (by Jérémie Lumbroso)
Excellent, thank you naming review, approved as recommended.

---

### QST-CHECK-SKILL-INSTALL: Does the command install the skill in a project, and does a link do it after asking once?
- Status: answered
- Why asking: **What this finds out.** The install action passes eleven tests against a mocked VS Code, and the skill is confirmed inside the installed 0.4.0 package (identical to the repository's copy). What only a real VS Code shows: that the command finds the bundled skill in the installed extension and writes it into a workspace folder; that its notices read right; and that a link from a terminal asks once, then goes ahead. **Safe**: it writes one file, `samples/site-capture/.claude/skills/porthole/SKILL.md`, which is not tracked; I delete it afterwards. Porthole 0.4.0 is installed in your VS Code, not published.
- Need: pick a letter (or override — any shape answers). About two minutes.

**Where to do this.** The **Porthole screenshot** window (title **Porthole screenshot**; open it with `code --new-window ~/Programming/porthole/samples/site-capture/porthole-screenshot.code-workspace` from your porthole workspace window's terminal if it is closed). Its one workspace folder is `site-capture`. No debug window.

**Before you start.** In the Porthole screenshot window, run **Developer: Reload Window** (press **Shift+Cmd+P**, type `Reload Window`, press **Enter**).

**Steps.** One action each.

1. **Install from the palette.** Press **Shift+Cmd+P**, type `Porthole: Install the Skill for Models in This Project`, press **Enter**. A notice should say **"Porthole installed its skill for models: site-capture/.claude/skills/porthole/SKILL.md."**, and in the Explorer (**Shift+Cmd+E**) a folder `.claude` should appear in `site-capture`.
2. **Run it again.** The same command again. The notice should say **"Porthole: site-capture/.claude/skills/porthole/SKILL.md is already up to date."** Nothing else changes.
3. **Look at the file.** Open `.claude/skills/porthole/SKILL.md` in the Explorer. Its first lines should be the skill's front matter (`---`, `name: porthole`, …, `---`), then one line beginning `<!-- written by Porthole 0.4.0; sha256 …`.
4. **Edit it, then install from a link.** Add a word anywhere below that line and save (**Cmd+S**). Then click into the Porthole screenshot window's terminal panel (**Ctrl+`**) and paste `open 'vscode://jlumbroso.porthole/v1/install-skill'`, pressing **Enter**. Porthole should first ask **"A link from outside VS Code asks Porthole to install its skill for models in site-capture (.claude/skills/porthole/SKILL.md). Install it?"** with **Install It** and **Cancel**. Click **Install It**. Then a notice should say **"Porthole: site-capture already has an edited copy of Porthole's skill; Porthole left it as it is."**, and your word should still be in the file.
5. **Tidy up.** Close the file. I delete the `.claude` folder afterwards.

Options:
- **A — all as described**: installed in step 1, up to date in step 2, the mark in step 3, asked once and the edit kept in step 4.
- **B — step 1 said nothing, or an error**: the command did not find the skill inside the installed extension.
- **C — step 4 overwrote your edit.**
- **D — step 4 did not ask**, or nothing happened at all.
- **E — something else**: say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-19)
**A — all as described** (a prediction). *Rationale*: the installed package was inspected (the skill is at `.claude/skills/porthole/SKILL.md` inside it, identical to the repository's); the link handler is the one `open` has used since 0.3.0; and the edited-copy rule is tested, with a mutation of it caught by three tests. *Confidence*: 0.7 — because `workspace.fs` writing a new folder and file in a real workspace, and the order of the link's question and the edited-copy notice, have only run against the mock. *If wrong*: B means the extension's own folder is read differently in a real install, which the log line "the copy inside the extension is missing" will confirm; C would be a safety bug, fixed with a regression test before anything ships; D means the link went to the other VS Code window (send it with the Porthole screenshot window used last) or its setting is off.

**ANS:** (by Jérémie Lumbroso)
Option A, all as described, it's excellent.

One thing:
- There's a difference between the palette action and the external link action.
- When the skill as been modified, the first will ask you if you want to revert to whatever is the latest version; the second, the external link, only has a question for whether to allow the external link to trigger the event, but then there isn't the other question. When the file is edited then it just fails. It feels like it is not following the same pathway as the command palette, and it should.

---

NOT: **Reading of the answer** (Glazier 5.5, 2026-10-19). A, with one finding, now fixed: a link that met an edited copy asked only whether links may install in this project, then gave up without the "Replace it?" question the palette asks. Jérémie: *"It feels like it is not following the same pathway as the command palette, and it should."* Both routes now ask the same question; the person decides about their edits, whichever route asked. Regression test: "asks a link's person the same question as the palette before replacing an edited copy", failing on the previous code. The test file the check wrote (`samples/site-capture/.claude/`) was deleted afterwards.

### QST-NAME-REPLACE: Are the words for replacing an edited copy right?
- Status: answered
- Why asking: **These words were left out of QST-NAME-SKILL, which was my slip**: the palette has asked them since the first build, and since the fix above a link shows them too. As built:
  - the question (modal): "{folder}/.claude/skills/porthole/SKILL.md was edited since Porthole wrote it. Replace it with the skill from Porthole {version}?"
  - the button: **Replace It** (and VS Code's **Cancel**); on Cancel, the notice the review already ruled: "{folder} already has an edited copy of Porthole's skill; Porthole left it as it is."
  - the setting's description, changed to match: `porthole.outsideLinks.actions.installSkill` — "Let outside links install Porthole's skill for models in a workspace folder (`.claude/skills/porthole/SKILL.md`). The first link in each project asks first; a copy someone edited is replaced only if you say so."
- Need: pick a letter (or override — any shape answers), or rule each line

Options:
- **A — as built**: the three lines ship as they are.
- **B — the review's words**: the review rules each line.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-19)
**A — as built.** *Rationale*: the button answers the question in its own words ("Replace it?" → **Replace It**), the house's button law since ADR-0021; and "replaced only if you say so" states the rule a person needs. *Confidence*: 0.6 — because "was edited since Porthole wrote it" may read as an accusation of the person who edited it. *If wrong*: B.

**Recommendation**: (by the naming review, 2026-10-19)

**B — three small edits; the button stands.** Glazier's accusation doubt is confirmed, and the fix generalizes: the tone problem in "was edited since Porthole wrote it" is that it narrates an *actor's deed* — when the deed is likely the person's own deliberate customization. The cure is **possession-reversal**: name the change as the project's *property*, not anyone's act. The platform already owns the neutral phrase — VS Code says "local changes" — so:

1. **The question (modal message)**: *"{folder}'s copy of Porthole's skill has local edits. Replace it with the skill from Porthole {version}?"* — "has local edits" states a property of the file; nobody did anything suspicious.
2. **The missing line, added (modal detail)**: *"Replacing discards the edits. Cancel keeps the copy exactly as it is."* — a modal offering **Replace It** over someone's edited file must state the stake where consent happens; this is the Open-Once pattern (each button's contract in one line), and it was the one thing the built words omitted.
3. **The setting description, one word lighter**: "…a copy **someone** edited" → "…**an edited copy** is replaced only if you say so." Same fix, same reason — "someone" imports a suspicious unknown into a sentence about the user's own project.

**"Replace It" stands as built** — it answers the question in its own words, per the standing button law; and the Cancel-path notice already ruled ("Porthole left it as it is") now pairs exactly with the detail line's promise. Mini-doctrine for the guard-copy family, minted here: **never name an actor for a change you are about to destroy — name the change as property.** *Confidence*: 0.8. *If wrong*: the as-built words were already serviceable (Glazier's A was defensible); these edits cost three strings and no code.

**ANS:** (by Jérémie Lumbroso)
Approving the naming review's recommendation exactly as stated, with thanks and gratitude.

---

## Decision

### Revised in iteration 3 (2026-10-18): the extension adds the skill to the project, from the palette or from a link

**Names (QST-NAME-SKILL, B) and the link's question (QST-SKILL-LINK-ASK, A), both answered 2026-10-19 and applied**: the verb is `install-skill` (an idempotent converge, not an add), the command **Porthole: Install the Skill for Models in This Project** (`porthole.installSkill`), the setting `porthole.outsideLinks.actions.installSkill`, the button **Install It**; the first link in each project asks, and after a yes links there go ahead. The provisional names quoted below are history.

**And the words for an edited copy (QST-NAME-REPLACE, B, approved 2026-10-19, applied)**: the question "{folder}'s copy of Porthole's skill has local edits. Replace it with the skill from Porthole {version}?", the detail line "Replacing discards the edits. Cancel keeps the copy exactly as it is.", the button **Replace It**, and the setting's description "…an edited copy is replaced only if you say so." The review's rule, kept for every guard of this kind: *never name an actor for a change you are about to destroy; name the change as property.*

Jérémie, 2026-10-18: *"Couldn't the extension install it in the local project as an action, action triggerable by the user through the command palette, or an LLM through a CLI calling?"* — and, to the plan below, *"Yes, exactly."* This replaces "copies it or writes it into a folder the person chooses" with one action reached three ways:

1. **The command palette**, for a person: the command writes the skill bundled in the extension to `.claude/skills/porthole/SKILL.md` in the window's workspace folder (asking which, when there are several). Every Claude Code session started in that folder then has it.
2. **A link from a terminal**, for a model: a new verb beside `open`, through the same handler, allowlist, per-action setting and log. VS Code has no command-line flag that runs an extension's command, so the link is the route from outside. Whether it asks first is QST-SKILL-LINK-ASK.
3. **Porthole's log**, for discovery: one line at startup names both routes, so a model that has never seen the skill, but can read Porthole's log, learns how to get it.

**Settled regardless:**
- **An existing copy**: identical to the bundled one, nothing happens; written by an older Porthole and not edited since, it is replaced and logged; **edited by anyone, it is replaced only if the person says so**, by the same question from the palette or from a link. (As first written, a link never replaced an edited copy and gave up without asking; Jérémie's hand check found the two routes differed, 2026-10-19, and he asked that they follow one path.) Porthole tells these apart by a comment it writes after the skill's front matter, naming the Porthole version and a checksum of the text below it.
- **Committing is the person's**: Porthole writes the file and does not touch git.
- **Other agents**: the file is plain Markdown; agents that do not read `.claude/skills` can be pointed to it, but no second format is written now.
- The package gains an eighth file, the skill, which the package check names.

### Chosen (iteration 2): a Claude skill in the repository, also shipped inside the extension, and its released address printed in porthole's log

From Jérémie's answer (QST-SKILL-HOME, B and C, 2026-10-13): *"I doubt people who install this will visit the repo."* So:

- **The skill lives in the repository** as `.claude/skills/porthole/SKILL.md` (option B).
- **It also ships inside the extension**, with a porthole command that copies it or writes it into a folder the person chooses (option C). This adds a seventh file to the package allowlist, which the package check will name.
- **Porthole's log names where the released skill lives**: an information line at activation gives the skill's address on the GitHub Release, so a model reading the Porthole output channel learns it exists.

One tension to keep in view, mine: ADR-0013 opened porthole to *any* local agent, and this skill is in Claude's format. A Claude skill is a Markdown file any agent can read, so the content serves everyone; only the trigger is Claude-specific. If a non-Claude agent struggles with it, a plain `docs/for-models.md` (option A) is the cheap addition.

The skill is still written only after the verbs it teaches have shipped.

**Content already decided for the skill:** pages a model writes for porthole set their title to `[<project>] <name>`, for example `<title>[porthole] tasks</title>`. VS Code shows the page's title in the floating window's title bar, so you can tell at a glance which project opened it (ADR-0013, routing follow-up; Surveyor found no way for an extension to set a window's title, 2026-10-13). For HTML porthole did not write, the README can suggest the `window.title` template `[${rootName}] ${activeEditorShort}`.

---

## Action Items

- [x] Answer QST-SKILL-HOME — Owner: Jérémie (2026-10-13)
- [ ] Write the skill after the verbs ship, and run the stranger test — Owner: Glazier (2026-10-18: written for `open`, the one verb built, `.claude/skills/porthole/SKILL.md`, at Jérémie's request ahead of the release; stranger test not yet run; shipping it inside the extension needs a command, whose title goes to the naming review first)
- [ ] Install the skill for Agent Skills too, not only Claude Code: Jérémie learned (2026-10-24, from John Papa) that `~/.agents/skills/` is the vendor-neutral Agent Skills directory (agentskills.io) that Codex and Cursor both read; *"That's an insight we can probably backport to Porthole as well."* Keyhole does it first (keyhole ADR-0008, with Surveyor's reading of the convention: home versus project folder, format, readers); then the same addition here, in `src/skill.ts`, with the home folder as the person's separate choice — Owner: Glazier
- [x] Build the install action (command, link verb, log line, version comment, eighth package file) with tests — Owner: Glazier (`6370252`, renamed to the ruled names after; eleven tests; not yet released)
- [x] Rule on QST-NAME-SKILL — Owner: the naming review, then Jérémie (2026-10-19: B, `install-skill`; applied)
- [x] Answer QST-SKILL-LINK-ASK — Owner: Jérémie (2026-10-19: A, as built)

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-13)
- Trigger: Jérémie answered QST-SKILL-HOME
- Contributors: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5) — this record
- Changes: Decision filled
- Outcome: `Draft → Accepted`

### Iteration 3 (2026-10-18)
- Trigger: Jérémie asked whether the extension could install the skill in the project, from the palette or from a model's CLI call, and approved the plan
- Contributors: Jérémie Lumbroso, Glazier 5.5 (Claude Opus 5.5)
- Changes: Decision revised (three routes, one action); QST-SKILL-LINK-ASK and QST-NAME-SKILL added
- Outcome: stays `Accepted`; two questions open

### Iteration 4 (2026-10-19)
- Trigger: the naming review ruled QST-NAME-SKILL (B: `install-skill`), and Jérémie answered both questions
- Contributors: Jérémie Lumbroso, the naming review, Glazier 5.5 (Claude Opus 5.5)
- Changes: names applied in code, tests, manifest, skill and changelog; ADR-0017's verb list gains `install-skill`
- Outcome: stays `Accepted`; no question open

### Iteration 5 (2026-10-19)
- Trigger: Jérémie's answer to QST-CHECK-SKILL-INSTALL (A, with the finding that a link took another path), then the naming review's ruling on QST-NAME-REPLACE (B), approved
- Contributors: Jérémie Lumbroso, the naming review, Glazier 5.5 (Claude Opus 5.5)
- Changes: both routes ask the same question for an edited copy (`bef61ba`, regression test); the ruled words applied
- Outcome: stays `Accepted`; no question open; ready for 0.4.0

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md)
