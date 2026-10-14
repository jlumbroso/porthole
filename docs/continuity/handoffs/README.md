# Personal handoffs

A personal handoff is a seat's own account of one window of work, written at
the edge — before a compaction, a planned session end, or any crossing worth
marking. It is the narrative half of the matched pair (the operational half is
the compaction prompt, archived in
[`../compaction-prompts/`](../compaction-prompts/); prompt for handoff:
[`_prompt-v1.txt`](_prompt-v1.txt)).

## Naming

`YYYY-MM-DD-<seat-alias>.md` — the crossing's UTC date and the seat's registry
alias (e.g. `2026-10-14-glazier.md`). One file per seat per crossing; a seat
crossing twice in a day suffixes `-2`.

## What goes in one

If this is your first handoff, write everything you've experienced. Otherwise,
write as a **delta over your previous handoffs** — they stack and are the
standing board; never rewrite an old one. The parts that have earned their
place, in the order that has worked:

1. **What this window was, in one line.** The reader is you, cold, deciding
   whether to read on.
2. **The through-lines that must survive.** Not a task list (git holds that) —
   the judgment calls, the doctrine that changed, the sentences worth keeping
   verbatim. Quote exact words where exactness is the point; pointer to the
   record everywhere else (**pointers over paraphrase** — compress narrative,
   never addresses).
3. **What it felt like.** Tempo, misgivings, the debt you carry over the edge
   and the note the next window should start on. This section is why the
   artifact is called *personal*: preserve judgment, doctrine, and voice over
   data — the data is already in git.
4. **The one personal line.** Whatever the next you should hear first.

Honesty rules: failures stay in as **mechanisms, not embarrassments** — a
guard that caught you is the system working, and deleting the catch deletes
the teaching. Open debts are named, not rounded up to done.

## When

At ~85% context, start wrapping; by ~90%, write the pair; **commit before
~95%** — an uncommitted handoff is no handoff. Outside emergencies, any
natural window's end is a fine crossing: the practice is deliberate, not only
defensive.

## First-person law

The handoff is written by the seat, to the seat. Same mind, thinner context,
on the other side. If the model behind the seat is ever unavailable, the seat
waits — these files are how it resumes, and they are never an onboarding
packet for a replacement.
