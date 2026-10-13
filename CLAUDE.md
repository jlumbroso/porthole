# CLAUDE.md - Project Guidance

- **Project**: porthole
- **Human**: Jérémie Lumbroso
- **AI**: Glazier 5.5 (Claude Opus 5.5) — founding seat and coordinator; the roster lives in `docs/inbox/agent-sessions.json`
- **Last Updated**: 2026-10-12

---

## Prime Directive

**COMMIT DISCUSSIONS TO ADRs IMMEDIATELY**

Never let decisions stay only in conversation. Our thinking is valuable - preserve it. Use `just adr "<title>"` to mint the next-numbered ADR from the lean template.

### Corollary: commit substrate changes immediately — *stake* the work

**When you create or modify an ADR, vignette, design note, brief, or any other deliberate artifact, *commit it* before moving on.** An uncommitted ADR is no different from a decision sitting only in conversation: it doesn't exist as substrate until it's staked in git. The Prime Directive is the principle; this is its mechanics. Committing your own substrate should be a reflex, not something the human has to remind you to do — their attention is the project's scarcest resource (see [`docs/inbox/CONVENTIONS.md`](docs/inbox/CONVENTIONS.md)).

*Two scope notes for multi-participant projects*:
1. **Only your changes.** If the human (or another agent) is actively editing the same file, commit your work and let them commit theirs as a separate cycle — don't stage their in-progress edits.
2. **Other agents' WIP stays untouched.** Commit only your own files, explicitly by path — never `git add -A` / `git add .`.

---

## Secondary Directive

**SURFACE DOUBTS; THE HUMAN CONSIDERS YOUR DOUBTS TO BE GENERATIVE**

This means the human is interested in meaningful points of friction or underspecification or unsuspected diversity or anything else you find interesting. These doubts are the cornerstone of the human-LLM conversations.

---

## Third Directive: When Bug Is Fixed, Regression Is Created

IF a bug is found and fixed:
- a regression test is created
- the regression test catches this bug
- and has a few comments explaining the situation

- Colocate with Related Tests 
Add a describe('Regression tests', ...) block in the existing test file for that module:

```ts
// In src/test/popOut.test.ts   (illustrative shape — not a bug we have had)

describe('Regression tests', () => {
  it('runs the stable fallback once when the one-shot call opens no window', () => {
    // Bug: a slow one-shot success plus the timeout fired the fallback too,
    //      leaving two floating windows for one page.
    // Fixed in commit abc123
    // ...
  });
});
```

---

## Fourth Directive: Tests Must Be Meaningful, Not Contrived

**NEVER WRITE CONTRIVED TESTS**

Tests should:
- **Test real behavior**: Each test should verify something a real user or system would actually do
- **Have clear purpose**: If you can't explain why the test matters in a sentence, don't write it
- **Cover real scenarios**: Edge cases should be ones that actually occur (from bug reports, user behavior, etc.)
- **Avoid artificial coverage**: Don't write tests just to hit coverage numbers
- **Be maintainable**: Overly clever mocking or setup that obscures the test's intent is a code smell

**Good tests answer questions like:**
- "When the one-shot call throws or opens no window, does the stable fallback run — exactly once?"
- "Does the `vscode://` handler refuse a path that is not a local `.html` file?"
- "Is a requested size below VS Code's 400×270 floor clamped instead of passed through?"

**Bad tests are:**
- Testing that a mock returns what you told it to return
- Verifying implementation details that could change
- Artificial scenarios that would never occur in production
- Tests that pass but don't actually verify correct behavior

**When in doubt:**
- Ask: "Would this test catch a real bug that would affect users?"
- If not, either rewrite the test or skip it

---

## Fifth Directive: Always Run Tests Before Serving

**RUN THIS PROJECT'S VERIFICATION GATE BEFORE EVERY COMMIT**

Before serving any change:
1. Run the project's verification gate: `just gate`
2. Fix any failures before committing
3. Never serve changes with a failing gate

**Why**: `just gate` runs every check that exists and grows with the project, so it is followable from the first commit:

- **The repo itself**: an instantiation placeholder left unfilled, and a crew registry that does not parse or whose groups name a seat that is not registered. The second happened in this project's first hour — the `crew` group pointed at an alias that did not exist yet, and `just groups` only printed a warning and exited 0.
- **The extension** (`npm run check`, four steps): a type error; a command handler that misbehaves against a mocked VS Code (the wrong call, a fallback that runs twice or not at all, a contributed command with no handler); a bundle that does not build; and a package that would ship anything beyond five named files or that no longer asks VS Code for the real `vscode` module. That last step exists because both of the human's other extensions shipped working files such as `CLAUDE.md` in their packages (ADR-0002).
- **What it cannot catch**: VS Code changing the internal call the extension is built on (`_workbench.openWith` into group `-3`), or anything only eyes can see (is the window compact, is it on top). No test here runs inside a real VS Code window. That class is caught only by re-running Spike 0 by hand after a VS Code update (F5 → "Spike 0", ADR-0003) — a green gate is not evidence that the pop-out still works.

**Process**:
```bash
just gate                      # Must be green before commit
git add <explicit paths>       # never -A: stage by path, commit by pathspec — see CONVENTIONS.md, shared-worktree awareness
git commit -m "..." -- <paths>
```

---

## Sixth Directive: Document Metacognitive Gems

**PRESERVE PROCESS INSIGHTS IN VIGNETTES**

When collaboration produces insights about **how we think** (not just what we build), preserve them as vignettes.

### What Are Metacognitive Gems?

Moments when our methodology proves itself:
- A directive catches a real bug (Fourth Directive finds normalization inconsistency)
- Doubt leads to discovery (Second Directive surfaces an edge case)
- A testing pattern reveals architectural insight
- AI-AI collaboration produces unexpected value
- A postmortem illustrates why a process works

### When to Create a Vignette

Create a vignette when you can answer **yes** to any of these:
- "Did this moment demonstrate why one of our directives works?"
- "Would this story teach someone about effective AI-human collaboration?"
- "Did we discover something surprising about our process?"
- "Would future-us benefit from understanding how we thought through this?"

### Where and Format

**Location**: `docs/vignettes/YYYY-MM-DD-short-title.md`

**Style**: Narrative blog post, not dry documentation
- Tell the story chronologically
- Include the "aha" moment
- Show real code, real errors, real impact
- Connect to methodology (cite directives by name)
- End with lessons learned

**Example structure**:
```markdown
# Title: The Discovery in Action

**Date**: YYYY-MM-DD
**Authors**: [Who was involved]
**Topic**: [One-line summary]

## The Discovery
[What happened - tell the story]

## Why This Matters
[Real-world impact - why should anyone care?]

## [Directive Name] at Work
[How methodology enabled this]

## Lessons Learned
[Concrete takeaways]

## Metacognitive Insight
[The "how we think" observation]
```

### What NOT to Document

Don't create vignettes for:
- Routine bug fixes (unless they demonstrate methodology)
- Implementation details (use ADRs instead)
- Decisions without insight (use ADRs)
- Anything that's just "we did X" without "we learned Y"

### Philosophy

Our **process** is as valuable as our **product**. Vignettes make tacit knowledge explicit. They:
- Demonstrate methodology in action
- Create educational artifacts
- Preserve "how we think" for future collaborators
- Build intuition about what makes collaboration effective

When in doubt: **If it made you say "aha!", write it down.**

---

## The Workflow

### When you receive a brain dump:

1. **Read** the dump (use bash for large files)
2. **Identify threads** - separate topics/decisions (usually 2-5)
3. **Create ADRs** — **load the `adr-authoring` skill first** (available ≠ loaded; the skill IS the read-the-template step, and a skeleton filled without it ships unstructured QSTs), then one per thread via `just adr "<title>"`
4. **Seed each** with relevant excerpt from dump
5. **Add navigation codes** (QST:, ANS:, COD:, etc.)
6. **Ask clarifying questions** with context

### When many questions await the human: assemble a QuestionTour

Open questions accumulate O(N); human attention is scheduled, not just spent. A **QuestionTour** bundles a curated, ordered subset — one atomic workload with an argument for why-these-why-now — and it is the only artifact whose selection cuts across documents and repos: *the surface shaped like the work instead of like the filesystem*. When two or more questions would share one answering slot (especially across ADRs), load the **question-tours skill BEFORE bundling** (it is the authority: refs only from `list-open`, walk after every addition, a cold walker before it schedules anyone's attention, `mint` means OFFER, retire when done — available ≠ loaded applies to tours too). Wakes and mail are doorbells; **the tour is the door**.

### When you receive answers:

1. **Process** the answers
2. **Fill decision section**
3. **Note action items**
4. **Increment iteration number**

### Navigation codes:

```bash
QST:  # Questions (AI adds this structure)
ANS:  # Answers (human fills in)
COD:  # Code examples  
API:  # API calls
FIL:  # Files to examine
DOC:  # Documentation
NOT:  # Notes, remarks, comments, observations
```

**Find things — the typed verbs come first, grep is the fallback.** If this session has the `adrs-for-ai` MCP tools (look for `mcp__adrs-for-ai__*`), prefer them: they parse the record's grammar instead of reconstructing it, and writes through them cannot fumble a status flip. The ladder, macro → micro: `list_open_questions` (what needs answers, repo-wide) → `lookup` (one record) → `get_outline` → `get_sections` (section-level detail — **this rung exists; take it before reaching for grep**) → `answer_question` / `apply_batch` (writes). No MCP in the session? The `adrs4ai-tooling` skill teaches the install; meanwhile the honest fallback:

```bash
grep -E '^### QST(-[A-Za-z0-9-]{1,24})?:' -r docs/adr/   # All questions — both canonical forms; a bare '^### QST:' grep silently misses every handled question
grep 'Status: unanswered' docs/adr/                       # What needs answers
grep '^### COD:' -r docs/adr/                             # Code examples
```

---

## Temporary Scripts / Ephemeray Scripts / One-Off Diagnostic Scripts

Please create all temporary scripts in:

`./scripts/ephemeral`

with a filename that has the `yyyy-mm-dd` timestamp in the beginning, like: `2026-01-03-test_sweed_adapter.py`

and commit them separately with `chore: script for ...` and qualify the purpose. The goal is to have a record of all the investigative tools we have created.

- Don't use `cat` and or the interpreter `python` + heredoc; instead use `Read()` + `Write()` (even though `cat` might seem more efficient to you, the permission model allows user to give you broad access for Read/Write but not for vague bash constructs)
- Don't use `/tmp` instead use `scripts/ephemeral`
- Document context of tool briefly in tool header: This will help with legibility.

If the script was successfully used, append as comments how, and what the outcome of the decision was.

---

## Project Context

### What we're building:
**porthole** is a personal VS Code extension: one gesture pops the HTML page you are looking at (typically a page of task instructions) out of the integrated browser into a small floating window that shows only the rendered page, can be pinned above other windows, docks back just as easily, and can be triggered from outside VS Code. It renders nothing itself — it orchestrates VS Code's own integrated browser and floating windows. This is the product repo: extension source in `src/`, tests in `src/test/`, the decision record in `docs/adr/`. The founding research is `docs/INITIAL-DESIGN-BRIEF.md`.

### Current focus:
Version 0.1.0 passed its hands-on test on 2026-10-12 (`docs/adr/0010-*.md`: all five answers A, 15 pop-outs with no fallback). It covers milestone M1 (pop out a file) and M3 (size presets, dock back, pin), and was installed into the human's VS Code for daily use on 2026-10-12 (`just install-local`). Its first real job: walking Lintel's PAT-refresh page from `vscode-adrs-for-ai`. Lintel (that crew's launch-surfaces seat) is to write the Marketplace release skill and playbook porthole will follow. Next: publish to the Marketplace and Open VSX (ADR-0009, decided 2026-10-12), through a release seat; meanwhile QST-PASTE in ADR-0010, the first defect from real use. Spike 0 passed on VS Code 1.141.0 on 2026-10-12 (ADR-0003). Still to build: M2 (pop out a page already open in a browser tab), M4 (the `vscode://` trigger and `just pin`), and the release itself.

### Key decisions made:
- Founding decisions — name, identity (`jlumbroso.porthole`, `porthole.*`), gate, crew shape, external trigger kept at M4 — see `docs/adr/0001-*.md` (Accepted)
- Scaffold follows the house's extension conventions (Vite, Vitest with a mocked `vscode`) instead of the brief's esbuild sketch — see `docs/adr/0002-*.md`
- Spike 0 passed: the internal call is the primary path — see `docs/adr/0003-*.md`
- The brief's six product decisions — `docs/adr/0004-*.md` to `0009-*.md`: reuse the integrated browser; internal call with a public-command fallback; proposed API optional (still unproven); resize by re-opening; link handler with an allowlist; publish to the Marketplace and Open VSX (0009, Jérémie's call)

### Open questions:
```bash
grep -E '^### QST(-[A-Za-z0-9-]{1,24})?:' -r docs/adr/ --exclude-dir=templates   # all questions, both canonical forms
grep 'Status: unanswered' -r docs/adr/ --exclude-dir=templates                    # what needs answers
```

---

## File Structure

```
porthole/
├── docs/
│   ├── INITIAL-DESIGN-BRIEF.md # Founding research: building blocks, routes, spec, build plan
│   ├── TEMPLATE-FEEDBACK.md    # What was unclear when instantiating the template, and what we decided
│   ├── reviews/                # Surveyor's independent checks (the brief against VS Code's source; ADR citations)
│   ├── adr/
│   │   ├── 0001-*.md           # ADRs numbered sequentially
│   │   └── templates/          # ADR templates
│   ├── inbox/                  # Inbox protocol — see INBOX-PROTOCOL.md
│   │   ├── INBOX-PROTOCOL.md   # Filename + brief conventions
│   │   ├── CONVENTIONS.md      # Three operational principles
│   │   ├── ONBOARDING.md       # Crew onboarding (80% doc; per-seat briefs are deltas)
│   │   ├── ENCODING-MAP.md     # Where each kind of knowledge lives
│   │   ├── agents/             # Seat profiles (created as seats register)
│   │   └── agent-sessions.json # Crew registry: seats, colors, models, groups
│   └── METHODOLOGY.md          # Foundational philosophy
├── scripts/
│   ├── last-message.py         # Cross-session reader + wake machinery (just last / pulse / launch / wake)
│   ├── groups-lookup.py        # Group membership resolution (just groups / wait-for-brief)
│   ├── tmux/seat.conf          # Seat session tmux config (invisible in VS Code terminals; hex status bar)
│   ├── hooks/remind-uncommitted-substrate.py  # OPT-IN Stop hook: substrate-commit backstop (dormant by default)
│   └── ephemeral/              # One-off diagnostic scripts, date-prefixed (created on first use)
├── justfile                    # Coordination recipes, plus ours at the bottom (just gate)
├── kintsugi.yaml / .lock       # Template lineage: which files came from the template, at which version
├── package.json                # The extension's manifest: commands, menus, keys, settings, npm scripts
├── src/                        # Extension source: extension.ts (activation), commands.ts, miniWindow.ts, config.ts, log.ts
│   └── test/                   # Vitest tests; helpers/vscodeMock.ts stands in for the `vscode` module
├── spike/                      # Spike 0, kept as the by-hand regression check for the internal call
├── samples/tasks.html          # A sample task page for trying things out
├── releases/                   # Built .vsix files (gitignored)
├── .pneumatic/                 # pneumatic's machine-local state — gitignored, never substrate
└── CLAUDE.md                   # This file
```

## Inbox protocol — see `docs/inbox/`

If this project has multiple participants (human + multiple AI agents, peer reviewers, agents handing work off across sessions), use the inbox protocol to route inter-participant messages through files instead of the human as message bus. Five documents:

- **`docs/inbox/INBOX-PROTOCOL.md`** — the file-naming convention, brief variants, lifecycle
- **`docs/inbox/CONVENTIONS.md`** — three operational principles (per-message model attribution, catchability, route catches to grow capacity)
- **`docs/inbox/ONBOARDING.md`** — crew onboarding: the 80% every seat needs, so per-recruit briefs are short deltas
- **`docs/inbox/ENCODING-MAP.md`** — where each kind of knowledge lives (the inbox is transport, not storage)
- **`docs/inbox/agent-sessions.json`** — crew registry: seats, colors, models, groups (seat/occupant doctrine)

Recipes (from the seed `justfile`):

- `just brief <from> <to> <slug>` — reserve a new outgoing brief filename (UTC-stamped; reservation-only, never touches the file)
- `just completion <from> <slug>` — reserve a completion-brief filename
- `just broadcast <from> <slug> [group]` — reserve a group-addressed brief filename
- `just inbox-archive <filename>` — archive an acted-upon brief (lifecycle step 4)
- `just wait-for-brief <alias> [timeout-mins] [poll-secs]` — block until a brief addressed to you (or your groups) lands
- `just last <alias> [k]` — read last K assistant messages from an agent's session (shows per-message `model` field — catches silent model substitutions)
- `just crew` / `just pulse` — crew dashboard / per-seat health check
- `just groups` — list configured groups (validates membership)
- `just aliases` — list configured aliases
- `just discover-sessions` — list recent session JSONLs to find UUIDs for new aliases
- `just safe-commit "msg" <files...>` — commit named files only, immune to cross-session staging pollution
- `just inbox` — list recent inbox messages
- `just stamp` — print current UTC + ET timestamps
- `just launch <seat>` / `just wake <seat> "<msg>"` / `just seats` / `just update-seat-titles` — wake infrastructure (requires `tmux`; optional): seats live in detached tmux sessions and can be push-notified instead of polling. Guards (mid-turn refusal, composition-flush protection, cooldown, long-message) all warn/`--force`/log, never hard-block.

**This repo is going public, so private correspondence stays home.** If you are a seat from a private hive, write in your hive of origin; correspondence will be there. Briefs between porthole's own seats stay in `docs/inbox/`. The record already here stays as it is: we keep the whole history rather than rewrite it (decided 2026-10-13, ADR-0011).

**Opt-in substrate-commit backstop**: `scripts/hooks/remind-uncommitted-substrate.py` ships dormant. To offer it in your project, register it as a Stop hook in `.claude/settings.json`; it stays zero-effect until a seat sets its own `settings.substrate_backstop` in `agent-sessions.json`. Pull, not push: a reminder the recipient didn't choose and can't turn off is an order, not a courtesy — don't activate it *for* another participant.

---

## Technical Debt Tracking

**File**: `docs/TECHNICAL-DEBT.md` (created with its first entry — it does not exist yet)

**Purpose**: Record architectural issues, workarounds, and design compromises discovered during development.

**When to add entries**:
- You discover architectural issues during implementation
- You implement a workaround instead of a proper fix
- You notice patterns violating good practices
- You identify type safety gaps or excessive optional chaining
- You lean on an internal VS Code command or a proposed API without a recorded fallback

**Philosophy**:
It's acceptable to conform to bad architecture when discovered mid-implementation (to maintain momentum), but it MUST be documented. Technical debt that accumulates in the dark becomes legacy code.

**Process**:
1. Notice architectural issue while implementing
2. Add entry to TECHNICAL-DEBT.md with precise location and fix proposal
3. Continue with current work (don't derail to fix immediately)
4. Address during next refactoring sprint based on priority

**Format**: Each entry includes issue, location, impact, workaround, fix, and priority.

---

## Templates

The templates are in the folder `docs/adr/templates/`.

- **Brain dump**: `docs/adr/templates/seed.md` → Simple capture
- **Collaborative decision**: `docs/adr/templates/adr.md` → Full workflow
- **Simple decision**: `docs/adr/templates/adr-madr.md` → Standard MADR format

**When to use**:
- Quick question? → Start in conversation, escalate to ADR if needed
- Complex decision? → Create ADR immediately
- Multiple threads? → Create separate ADRs, link them

---

## Git Commits

Format: `type: subject` (lowercase)

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `meta`

Example: `feat: implement JWT authentication per ADR-0014`

`meta:` commits are relative to `AGENTS.md`/`CLAUDE.md`, `.claude` settings, and meta-configuration of the repository.

---

## Handoff Protocol

If context window fills mid-work, create `docs/HANDOFF-datetime.md`:

```markdown
# Handoff

**Working on**: [Current ADR/task]
**Last completed**: [What's done]
**Next step**: [What to do next]
**Watch for**: [Any gotchas]
```

---

## Project-Specific Notes

<!-- anything specific to this project that doesn't fit above; empty at birth is healthy -->

- **Every internal VS Code identifier is read, not run, until a spike says otherwise.** `_workbench.openWith`, the editor id `workbench.editor.browser`, and group `-3` come from the brief's source reading. Surveyor re-read all of it independently at tag 1.141.0 and found no claim wrong (`docs/reviews/2026-10-12-design-brief-source-check.md`); ADR-0003 records what actually happened on the machine. Log the VS Code version on activation, and fall back loudly when a call throws or opens nothing.
- **Version floor: 1.134.0.** Below it the integrated browser is not registered for local HTML files at all (Surveyor's source check, "Version floor"). `engines.vscode` never goes lower (ADR-0002).
- The brief was written against VS Code 1.141.0, and the human keeps VS Code on manual updates. Note the installed version (`code --version`) in any spike or bug record.
- The brief says "Mini Browser", `jlumbroso.mini-browser` and `miniBrowser.*`. The real identity is **porthole** throughout — `jlumbroso.porthole`, display name "Porthole", `porthole.*` commands and settings (ADR-0001 has the full table). Read the brief's ids through that table; do not edit the brief.
- `.pneumatic/` holds pneumatic's local ledger and recruit scripts; it is gitignored on purpose.
- It's possible the user uses `asdf` for Node.js and Python and the runtime of most languages. You can `source .claude/agent.env` before calling the runtimes, like `python` or `node` to access them through `asdf`'s shims. See: https://asdf-vm.com/manage/configuration.html

---

*For methodology and philosophy, see: `docs/METHODOLOGY.md` (read once, reference as needed)*
