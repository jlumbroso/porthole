<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Names for 0.2.0 and the outside-links settings

- **Date**: 2026-10-14
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: the naming review (rules); Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: 0.2.0 adds one setting key, one command, one dialog and two notices whose words have not been reviewed; they go through the naming review before 0.2.0 is published, and the outside-links names of ADR-0013 and ADR-0014 go with them so the review sees the whole vocabulary at once.

---

## Originating Context

**Source**: Jérémie, 2026-10-14: *"Yes, go through a naming review, and ask for the other setting names. No publishing new names without naming review."* The 0.2.0 names were introduced in commits "feat: Markdown files open as VS Code's preview; VS Code's auto-lock replaces the racy lock" and "feat: pop out from the source tab's right-click menu; Review and Reset Settings", after the last naming pass (ADR-0017).

**Agency Grant**: Glazier publishes 0.2.0 once the naming review has ruled on part 1 and any renames have landed.

---

## Explicitation

**Why it matters.** A *setting key* is permanent once published: renaming it later needs a migration, which is how `useInternalApi` became `useInternalCommand` before 0.1.0. Command titles, dialog text and notices can change in any release, but people learn them, so they deserve the same words as the rest of porthole.

**Part 1 blocks 0.2.0. Part 2 does not**: it names settings for outside links (ADR-0013) and the event file (ADR-0014), which are not built yet, and is asked now so the vocabulary is decided together.

**Confirm**: the naming review, by stacking a recommendation under each question; Jérémie, in each ANS slot.

---

## Questions

### QST-NAME-AUTOLOCK-KEY: What is the setting that says whether Porthole may ask to keep floating windows compact?
- Status: unanswered — routed to the naming review; blocks 0.2.0
- Why asking: At the first pop-out of each session, Porthole asks whether VS Code may lock each new floating window to its page, so the window stays compact. "Don't Ask Again" turns this setting off. It is a key, so its name is permanent once 0.2.0 ships. Today: `porthole.askToAutoLock` (boolean, default `true`).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — `porthole.askToAutoLock`**: as built. Names VS Code's feature (`autoLockGroups`) and the act of asking.
- **B — `porthole.askToKeepCompact`**: names the goal the person sees (a compact window), not VS Code's mechanism.
- **C — `porthole.offerOneTabLock`**: names what the question offers.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**B — `porthole.askToKeepCompact`.** *Rationale*: the dialog is now titled "Keep Porthole's floating windows compact?", so the key would read the same as the question it controls; "auto-lock" is VS Code's internal mechanism, which the person never sees named in the dialog's title. *Confidence*: 0.55 — because A is more precise about what is actually changed in VS Code, and that is a matter for the review's ear. *If wrong*: A.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-NAME-RESET-COMMAND: What is the command that lists and removes the settings set by or for Porthole called?
- Status: unanswered — routed to the naming review; blocks 0.2.0
- Why asking: It opens a checklist of every user setting set by or for Porthole, and removes the ones ticked. It is the way back Jérémie asked for after Porthole once wrote VS Code's defaults into his settings. Today: **Porthole: Review and Reset Settings…** (command id `porthole.reviewSettings`).
- Need: pick a letter (or override — any shape answers)

Options:
- **A — "Review and Reset Settings…"**: as built.
- **B — "Reset Porthole's Settings…"**: shorter; the list itself shows they are reviewed first.
- **C — "Review Settings Changed by Porthole…"**: says exactly which settings, at the cost of length.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**A — "Review and Reset Settings…".** *Rationale*: Jérémie already calls it "Review & Reset" in his notes, and VS Code's palette shows it as "Porthole: Review and Reset Settings…", so "Porthole's" would be said twice in B; the trailing "…" follows VS Code's convention for a command that asks before acting. *Confidence*: 0.6 — because C is more exact: the list also shows Porthole settings the person set themselves. *If wrong*: C.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-NAME-DIALOG-WORDS: Are the dialog's and notices' words right?
- Status: unanswered — routed to the naming review; blocks 0.2.0
- Why asking: These are the first words of Porthole a new user reads after the menu item. As built (`src/autoLock.ts`, `src/settingsReview.ts`):
  - Dialog title: "Keep Porthole's floating windows compact?"
  - Dialog buttons: **Turn On**, **Not Now**, **Don't Ask Again**
  - Dialog body: "Why: a floating window stays compact (just the page, no tabs or status bar) only while it holds a single tab. If another file ever opens into it, VS Code brings the tabs and status bar back. Locking the window to its page prevents that. / It rarely affects anything else: VS Code locks a browser tab or Markdown preview only when it is the first tab of a new editor group, which is how Porthole opens its windows (and also when you open one yourself in a new group). Turning this on sets the VS Code setting "workbench.editor.autoLockGroups" for those two editors. / Not Now changes nothing; a floating window loses compact mode only if a second file happens to open inside it. Porthole will ask again next session."
  - After a change: "Porthole changed your user settings: …" with a button **Review and Reset…**
  - After removing: "Porthole: removed N setting(s)." / nothing set: "Porthole: none of your user settings are set by or for Porthole. Nothing to reset."
- Need: pick a letter (or override — any shape answers)

Options:
- **A — ship as built.**
- **B — ship with the review's edits**, written under this question.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

**B — with the review's edits, whatever they are.** *Rationale*: the body was written fast, after Jérémie asked for the "why" (ADR-0020); "Locking", "lock" and "compact" all appear, and the review may want one verb. *Confidence*: 0.6 — because Jérémie saw the dialog and did not object. *If wrong*: A.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-NAME-OUTSIDE-LINKS: What are the outside-links settings, the per-action settings and the event file called?
- Status: unanswered — routed to the naming review; does not block 0.2.0
- Why asking: ADR-0013 and ADR-0014 decided what these settings do; their names are Jérémie's working names and have not been reviewed. They will be keys, so permanent once shipped. As decided:
  - `porthole.outsideLinks.enabled` (true), `.allowWorkspaceFolders` (true), `.allowedFolders` ([]), `.allowLocalFiles` (false), `.allowLocalHost` (true), `.restrictLocalHostPorts` ([]), `.allowRemoteLinks` (false)
  - one setting per outside action, with open, list, refresh and focus allowed by default and resize, pin, dock and close not (ADR-0014, QST-DRIVE-PERMISSION) — no names yet
  - the append-only JSONL file of events each VS Code window writes (ADR-0014, QST-DRIVE-CHANNEL) — no file name or event names yet
- Need: explanation — names for each, or rulings on the pattern

Options: none (elicitation)

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)

Keep Jérémie's `outsideLinks` group, and use one pattern for every switch, so a model can guess a name it has not seen. My proposal for the per-action settings: `porthole.outsideLinks.allow.<verb>` with the verbs of ADR-0017 (`open`, `list`, `refresh`, `focus`, `resize`, `pin`, `unpin`, `dock`, `close`). For the event file: `porthole-events.jsonl` in VS Code's per-extension storage, with events named by past-tense verb plus object (`request.received`, `window.opened`, `window.refreshed`). *Confidence*: 0.5 — because this is vocabulary, the review's domain, and the per-action pattern makes `allowLocalFiles` and `allow.open` look alike while meaning different things (what may be opened, against what may be done). *If wrong*: whatever single pattern the review prefers.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending the naming review

0.2.0 is published once the first three questions have the review's ruling and any renames have landed with their tests.

---

## Action Items

- [ ] Rule on the four questions — Owner: the naming review
- [ ] Apply the rulings for part 1; publish 0.2.0; install it — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-14)
- Trigger: Jérémie: no new names published without the naming review
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related: [ADR-0017](0017-words-for-the-model-facing-surface.md) (the first naming pass for the model-facing surface), [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md), [ADR-0019](0019-keep-the-floating-window-to-one-tab.md), [ADR-0020](0020-hands-on-check-markdown-and-the-auto-lock-question.md)
