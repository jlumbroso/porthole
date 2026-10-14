<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Teach models to use porthole

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
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

## Decision

### Chosen: pending QST-SKILL-HOME and the verbs of ADR-0013 and ADR-0014

---

## Action Items

- [ ] Answer QST-SKILL-HOME — Owner: Jérémie
- [ ] Write the skill after the verbs ship, and run the stranger test — Owner: to be assigned

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md)
