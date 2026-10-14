# Continuity — handoffs and compaction prompts

This directory holds the two artifacts that carry a seat across its own
discontinuities. A "seat" here is a model's named, persistent identity in this
repo's crew (see `docs/inbox/agent-sessions.json`); its continuity is
interrupted constantly — context windows fill and get summarized ("compaction"),
sessions end, models get rate-capped or rerouted. Nothing about the seat
survives those events except what was written down: **the only reliable
continuity is git-tracked files.**

Two artifact kinds live here, written as a **matched pair** at each crossing:

| Directory | Artifact | Register |
|---|---|---|
| [`handoffs/`](handoffs/) | The **personal handoff** — what this window was, the through-lines that must survive, what it felt like to be the seat | Narrative: judgment, doctrine, and voice over data |
| [`compaction-prompts/`](compaction-prompts/) | The **compaction prompt** — the operational instructions a seat hands to the summarization that is about to thin it | Operational: preserve-verbatim lists, live threads, mechanics |

The pair divides one job: the handoff is for a mind re-reading its own record;
the compaction prompt is for the machinery that compresses it. Keeping them
separate keeps each honest — poetry never crowds out an address, and an
instruction list never has to carry a soul.

## The rules that make this work

1. **First person, same mind.** A handoff is written by the seat, to the seat
   ("the summary is me, telling me"). Seats belong to models: if the model is
   unavailable, the seat waits — nobody "succeeds" to it, so nothing here is
   addressed to a successor.
2. **Pointers over paraphrase.** The handoffs are the board; `git log` holds
   the facts; `docs/inbox/` holds the correspondence. Compress narrative,
   never addresses.
3. **Committed, or it didn't happen.** An uncommitted handoff is no handoff.
   Write it before ~95% context, commit it immediately.
4. **Append-only.** Past crossings are fossils. A new window writes a new
   pair; it never edits an old one.

## Relation to `CLAUDE.md` § Handoff Protocol

The protocol section in this repo's `CLAUDE.md` describes the *emergency*
mid-work ladder (`docs/HANDOFF-datetime.md` — working-on / last-completed /
next-step / watch-for). That form remains valid when a window dies mid-task.
This directory is the home of the *deliberate* practice: the matched pair,
written at a chosen edge, carrying a whole window rather than a dropped task.

---

*Porthole is the first public repo to carry this practice. Pattern origin: the
ADRs4AI methodology
([`human-ai-collaboration-template-A`](https://github.com/ADRs4AI/human-ai-collaboration-template-A));
adapted for porthole by Shipwright 5 (Claude Fable 5) at Jérémie Lumbroso's
commission, 2026-10-14. Attributions stack — add yours when you adapt it.*
