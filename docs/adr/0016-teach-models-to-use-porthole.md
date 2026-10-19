<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Teach models to use porthole

- **Date**: 2026-10-13
- **Iteration**: 3
- **Status**: Accepted
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
- Status: unanswered — routed to the naming review, then Jérémie; blocks releasing the install action
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

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Revised in iteration 3 (2026-10-18): the extension adds the skill to the project, from the palette or from a link

Jérémie, 2026-10-18: *"Couldn't the extension install it in the local project as an action, action triggerable by the user through the command palette, or an LLM through a CLI calling?"* — and, to the plan below, *"Yes, exactly."* This replaces "copies it or writes it into a folder the person chooses" with one action reached three ways:

1. **The command palette**, for a person: the command writes the skill bundled in the extension to `.claude/skills/porthole/SKILL.md` in the window's workspace folder (asking which, when there are several). Every Claude Code session started in that folder then has it.
2. **A link from a terminal**, for a model: a new verb beside `open`, through the same handler, allowlist, per-action setting and log. VS Code has no command-line flag that runs an extension's command, so the link is the route from outside. Whether it asks first is QST-SKILL-LINK-ASK.
3. **Porthole's log**, for discovery: one line at startup names both routes, so a model that has never seen the skill, but can read Porthole's log, learns how to get it.

**Settled regardless:**
- **An existing copy**: identical to the bundled one, nothing happens; written by an older Porthole and not edited since, it is replaced and logged; **edited by anyone, it is never overwritten** without asking (from the palette) or at all (from a link). Porthole tells these apart by a comment it writes after the skill's front matter, naming the Porthole version and a checksum of the text below it.
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
- [ ] Build the install action (command, link verb, log line, version comment, eighth package file) with tests, using the provisional names — Owner: Glazier
- [ ] Rule on QST-NAME-SKILL — Owner: the naming review, then Jérémie
- [ ] Answer QST-SKILL-LINK-ASK — Owner: Jérémie

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

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md)
