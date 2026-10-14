<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Drive open floating windows from outside VS Code

- **Date**: 2026-10-13
- **Iteration**: 4
- **Status**: Accepted
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), with Purser 5.5, Surveyor 5.1 and Sounder 6 in the seed's thread

**TL;DR**: After `open` (ADR-0013), models want to list, refresh, focus, resize, pin and close floating windows; five questions decide how answers come back, what a model is given to run, what a list contains, what happens after a restart, and which actions need your setting.

---

## Originating Context

**Source**: `Seed: docs/adr/seed-2026-10-13-porthole-for-models.md` — Jérémie: *"I want them to be able to list all the ones open, what they have, be able to refresh a window. Those kinds of things."* The verb table, the channel options A to D, and the five doubts are in the thread, with answers from Purser, Surveyor and Sounder.

**Agency Grant**: Chunk the seed into ORRCF questions, fully in template.

---

## Explicitation

**What I understand**:

1. **A link goes in, but nothing comes back.** A `vscode://` link returns no answer, so "list" and "did my open work?" need a way back.
2. **Porthole knows less than it seems.** It remembers which file it asked to open in which window; it does not see the page, its real size, or whether it is pinned now. After VS Code restarts it remembers nothing, and VS Code's restored windows can only be matched to pages by their title (Surveyor).
3. **"Which window" is hard.** Each VS Code window runs its own copy of porthole. Actions that VS Code applies to "the focused window" (pin, dock) can hit the wrong one, as Cycle Window Size did (ADR-0010).

**What the source says, not yet run** (Surveyor):

| Verb | Route | Caveat |
| --- | --- | --- |
| refresh | rewrite or touch the file; auto-reload does the rest | VS Code's own reload command reloads only the active editor, so it could reload the wrong window |
| focus | re-open the file into its window with `vscode.openWith(file, 'workbench.editor.browser', { viewColumn })` | raises the window and activates its group; whether macOS gives it the keyboard needs a run |
| close | `vscode.window.tabGroups.close(group)` | closes the window when its last tab goes |
| resize | re-open with new bounds (ADR-0007) | works today |
| pin, dock | VS Code commands that act on the focused window | need a reliable focus step first |

**Sounder's main point**: knowing *an* open happened is not knowing *my* open happened. With overlapping requests, porthole today could credit the wrong window to a request (`watchForOpenedGroup` takes the first group opened). Answers must say what was actually observed, and "unknown" when it is.

**Confirm**: Jérémie, through the five questions below.

---

## Questions

### QST-DRIVE-CHANNEL: How should answers come back to a model that sent porthole a request?
- Status: answered
- Why asking: Everything after `open` needs a reply: the list of windows, or whether a refresh happened. A `vscode://` link carries no reply. This choice decides whether porthole ever listens on the machine.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — links in, a state file out**: requests arrive as links; porthole writes a small JSON file (one per VS Code window) listing its windows and the outcome of each recent request, by request id. The model reads the file. Nothing listens on the machine.
- **B — a local socket or HTTP endpoint in porthole**: real request and reply, immediately. Adds something listening on your machine, a token to protect it, and discovery of where it is.
- **C — an MCP server**: models that support MCP get native tools such as `porthole_list`. It still needs A or B underneath to reach VS Code.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — links in, a state file out, with results tied to request ids.** *Rationale*: it is the smallest step from ADR-0013's link and keeps "porthole listens on no port", which a static check on the bundle now guards (not a runtime proof); Purser agrees; Sounder agrees as the first experiment, on the condition that each result names the request that caused it (not just a snapshot), which this option includes. *Confidence*: 0.6 — because nobody has measured how slow or racy "send a link, then read a file" feels to a model. *If wrong*: if the file approach needs an elaborate poller and recovery logic to be reliable, this flips to B (Sounder: compare it with B rather than keep "no listener" at any cost). C can be added later over either.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A now, and then Option C on top of it (stable intermediate forms). And the format seems more appropriate for JSONL, i.e., an append-only list of events, each a JSON dictionary/object.

---

### QST-DRIVE-CLIENT: What should a model actually run to drive porthole?
- Status: answered
- Why asking: Purser and Sounder disagree. Purser: no separate tool, because another package means another registry, token and release pipeline. Sounder: once requests need waiting, retries, quoting of paths and readable errors, a small maintained program does it better than instructions every model re-implements.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — instructions only**: the skill documents the link format and a one-line command (`open "vscode://…"` on macOS); each model builds links itself.
- **B — a small script shipped with each porthole release**: one file (for example `porthole.mjs`, run with Node) attached to the GitHub Release and kept in the repo, which builds the link, sends it, waits for the result and prints it. No new registry or token.
- **C — a published command-line package** (`npm install -g porthole-cli`), with its own release.
- **D — the same script, shipped inside the extension package**: `porthole.mjs` installed with porthole itself, so it always matches the porthole version receiving its requests; the skill finds it in the extension's install folder. *Qualified by Sounder, 2026-10-13*: shipping together reduces version mismatch, but does not by itself say which running VS Code window receives a request; the script still checks it is talking to a compatible running instance. No download and no new registry. Costs: the package grows from six files to seven, and the install folder differs per editor (VS Code, Insiders, Cursor, VSCodium), so the skill must look it up. (Option added by Purser, 2026-10-13, before any answer.)

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A for `open` now, B once results come back.** *Rationale*: for `open` alone a link is one line, and Purser is right that a package is a real cost; but as soon as QST-DRIVE-CHANNEL's results exist, the waiting and request-matching Sounder describes are exactly what models would each get slightly wrong, and B ships it through the release workflow that already exists, with no new account. *Confidence*: 0.6 — because the cost of keeping B in step with the extension is unknown. *If wrong*: if models handle the waiting reliably from instructions alone (the skill's stranger test would show it), stay at A; if B is used beyond this machine and needs updating independently, C.

**Recommendation, revised** (by Glazier 5.5, Claude Opus 5.5, 2026-10-13, before any answer — a stated revision): **A for `open` now, D once results come back.** Purser's option D solves the one thing B left open, whether the script on a model's disk matches the porthole it talks to, by shipping them together. (Sounder's qualification: it reduces the mismatch; it does not settle routing to a running instance, which still needs checking.) Purser accepts B or D; the objection was only ever to a new registry. *Confidence*: 0.65 — because finding the install folder per editor is new work the skill must get right. *If wrong*: if the skill cannot find the folder reliably across editors, B, with the script's version checked against porthole's.

**ANS:** (by Jérémie Lumbroso)
A for now, D once results come back, and eventually C (CLI and/or MCP as package), and all of these gracefully degrading. Agreed with the skill idea that must know editor install folders, etc.

---

### QST-DRIVE-LIST: What should "list" say about each floating window?
- Status: answered
- Why asking: You asked for "what they have". Porthole can report what it asked for and some of what VS Code reports; it cannot read the page. A list that mixes the two would mislead a model.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — what porthole knows, labelled**: an id, the file, the page title, the size preset asked for, whether pin was asked for, which VS Code window owns it; anything not observed is marked "unknown", and asked-for values are kept apart from observed ones.
- **B — A plus the page's own state** (ticked boxes, typed notes), through a convention pages follow, such as writing their state to a file beside themselves.
- **C — the file only**: the list says which files are shown, nothing more.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — what porthole knows, labelled.** *Rationale*: it answers "what they have" without claiming anything porthole cannot see; Sounder's point that asked-for and observed values must stay distinct is built in; and B can be added later as a page convention taught by the skill without changing porthole. *Confidence*: 0.75 — because some of it is already in porthole's memory: the file asked for and the size preset. (Corrected at Sounder's request, 2026-10-13: the pin asked for, and identities that stay stable for a session, are not recorded today and must be added; real size, pin state and page contents stay "unknown" unless observed.) *If wrong*: if what you mean by "what they have" is a page's progress (which boxes are ticked), B becomes the point of the feature, not an extra.

**ANS:** (by Jérémie Lumbroso)
Yes, let's start thinking about Option B, not as a requirements of pages, but as a possible feature. It should be a very flexible mechanism that anything can be built on top of.

---

### QST-DRIVE-RESTART: After VS Code restarts, what should porthole say about the floating windows VS Code brought back?
- Status: answered
- Why asking: VS Code restores floating windows with their size and pin, but porthole forgets them, and a restored browser tab can only be recognised by its title. A list that silently left them out would be wrong; one that claimed them confidently could be wrong in the other direction.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — list them separately as "restored, not verified"**: matched by page title, shown apart from windows opened since the restart; models may look but not resize, retarget or close them.
- **B — match by title and treat them as porthole's own**: they behave like any other window in the list.
- **C — leave them out**, and say plainly that the list covers only windows opened since VS Code started.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — listed separately, read-only.** *Rationale*: Sounder's line: a title match can help find a window but must not authorize closing it — two pages can share a title. A keeps them visible, and C hides real windows from you. *Confidence*: 0.7 — because it is the cautious middle, but adds a category to explain. *If wrong*: if restarts are rare in your day, C is simpler and honest enough.

**ANS:** (by Jérémie Lumbroso)
Option A is great!

---

### QST-DRIVE-PERMISSION: Which actions may a model take on a floating window without your having turned on a setting?
- Status: answered
- Why asking: Opening a window is what you asked for. Closing, moving or resizing one you have arranged is different, and so is refresh, which can lose what you typed into a page.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — open and list freely; everything else behind one setting**, off by default: refresh, focus, resize, pin, dock and close.
- **B — open, list, refresh and focus freely; resize, pin, dock and close behind the setting.**
- **C — any action, but only on windows opened through the outside interface**; windows you popped out yourself are off limits.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**B — open, list, refresh and focus freely.** *Rationale*: refresh and focus are what make "pull it up again" useful and change nothing you arranged; resize, pin, dock and close change your layout, which is Purser's line: "porthole will not move, resize or close a window you arranged unless you turn on one setting". *Confidence*: 0.6 — because Sounder warns that refresh can lose unsaved state in a page, which argues for A, and because C's "owned by the workflow" depends on knowing who sent a request, which a link cannot prove. *If wrong*: if your task pages keep typed notes that a refresh would erase, this flips to A.

**ANS:** (by Jérémie Lumbroso)
Yes, Option B, but each action should have its own setting that can be changed independent from this default we both agree on, so the power user can fine tune how they attention is interacted with very precisely.

---

## Decision

### Context

These verbs come after ADR-0013's `open` and depend on its answers.

### Chosen: an append-only JSONL event file now, MCP on top later; a client that grows in stable steps; labelled lists; restored windows read-only; per-action settings

From Jérémie's answers (2026-10-13):

- **Channel (QST-DRIVE-CHANNEL, A, then C)**: links in, a file out, now; an MCP server on top later, each step usable on its own. The file is **JSONL**: an append-only list of events, one JSON object per line (a request received, a window opened, a refresh done), rather than a snapshot rewritten in place. Appending also suits Sounder's request-correlated results: every event can carry the request id that caused it.
- **Client (QST-DRIVE-CLIENT, A, then D, eventually C)**: instructions only for `open` now; the script shipped inside the extension once results come back; eventually a published CLI and/or MCP package. Each step degrades gracefully to the one before. The skill knows where each editor installs extensions.
- **List (QST-DRIVE-LIST, A now, B to explore)**: what porthole knows, labelled, with asked-for and observed values apart. A page's own state (option B) is to be explored, not as a requirement on pages but as **a flexible mechanism others can build on**.
- **Restart (QST-DRIVE-RESTART, A)**: windows VS Code restored are listed separately as "restored, not verified", matched by title, read-only.
- **Permissions (QST-DRIVE-PERMISSION, B, with one setting per action)**: open, list, refresh and focus are allowed by default; resize, pin, dock and close are not. **Each action has its own setting**, so a person can tune exactly how their attention may be interrupted.

Settled regardless, from the thread:

- Results say what was observed, with "submitted", "accepted" and "window seen" kept apart, and "unknown" where nothing was seen (Sounder).
- Within an advertised retention window, a repeated request with the same id **and payload** returns its recorded result without acting again; reusing the id with a different payload is rejected. After a restart or once the window has expired, porthole says it cannot guarantee deduplication. A timeout is not a cancellation, and exactly-once effects across a crash are not promised (Sounder; wording corrected 2026-10-13 at their request, after the answers — the first version dropped these bounds).
- The state file, if chosen, lives in VS Code's per-extension storage, readable only by you, with no page contents (Purser).
- Before 0.2.0 claims any of these verbs, a by-hand spike runs them, including two VS Code windows, two overlapping opens, and a restart (Sounder, Purser).

---

## Action Items

- [x] Answer the five questions — Owner: Jérémie (2026-10-13)
- [ ] Put the event names, file name and per-action setting names through the naming review — Owner: Glazier
- [ ] Fix the request-matching weakness Sounder found in `watchForOpenedGroup` before any of this is built — Owner: Glazier
- [ ] Spike the verbs by hand once built — Owner: Jérémie, with Surveyor
- [ ] Before 0.2.0 ships any verb: an "experimental" label in the changelog; a README section "Control from outside VS Code" stating the verbs, the allowlist, which verbs are off by default, what VS Code's first-use dialog does (it shows only part of the address and offers "Do not ask me again"), and that outside control has been run only on macOS; and the changelog naming which verbs were run on which VS Code version, "read, not run" for the rest — Owner: Purser (wording), once the verbs exist
- [x] Static guard on the built bundle against network and process modules and network API names — Owner: Glazier (done 2026-10-13, `scripts/check-package-contents.mjs`). It catches the listed imports and spellings; it does not observe runtime network behavior, nor traffic from the page a window displays (scope narrowed at Sounder's request).

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5), from the thread entries of Purser 5.5, Surveyor 5.1 and Sounder 6
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-13)
- Trigger: Purser's review of the chunking (`docs/inbox/archive/2026-10-13-1408-purser-to-glazier-chunked-seed-nothing-misstated-four-additions.md`), before any answer
- Contributors: Purser 5.5 (Claude Sonnet 5.5) — the additions; Glazier 5.5 (Claude Opus 5.5) — folding them in
- Changes: see the notes marked "Purser, 2026-10-13" in this file
- Outcome: stays `Draft`

### Iteration 3 (2026-10-13)
- Trigger: Jérémie answered all five questions
- Contributors: Jérémie Lumbroso — the answers (JSONL, per-action settings, page state as an open mechanism); Glazier 5.5 (Claude Opus 5.5) — this record
- Changes: Decision filled
- Outcome: `Draft → Accepted`

### Iteration 4 (2026-10-13)
- Trigger: Sounder's review of the chunking (`docs/inbox/archive/2026-10-13-1416-sounder-to-glazier-chunking-qualifications.md`), read after the answers
- Contributors: Sounder 6 (gpt-6-astra) — the corrections; Glazier 5.5 (Claude Opus 5.5) — applying them
- Changes: four passages restored to Sounder's actual claims: the retry bounds, what shipping the script together does and does not settle, what porthole records today, and the network check's scope. None changes Jérémie's decisions.
- Outcome: stays `Accepted`

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0010](0010-first-hands-on-test-of-porthole-0-1-0.md) (the focus miss), [ADR-0017](0017-words-for-the-model-facing-surface.md)
