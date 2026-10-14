# Compaction prompts — the archive

A compaction prompt is the **operational twin** of a personal handoff: the
instructions a seat writes for the summarization that is about to thin it.
Where the handoff carries voice and judgment for a mind re-reading its record,
the compaction prompt is a working order addressed to the compressor — what to
preserve verbatim, which threads are live and in exactly what state, which
mechanics bite, and what the next window does first.

## How one is used

1. **Write it at the edge**, from the skeleton:
   [`../handoffs/_prompt-v1.txt`](../handoffs/_prompt-v1.txt).
2. **Hand it to the compaction** — paste it as the instruction when invoking
   the harness's compact/summarize step, so the summary is built to your
   terms instead of a stranger's defaults.
3. **Stake it here** as `YYYY-MM-DD-<seat-alias>.md`, matched to the same
   crossing's handoff in [`../handoffs/`](../handoffs/). The paste serves this
   crossing; the staked file serves every later one — and a prompt that lived
   only in chat is lost to the next window by definition.

## Archive discipline

- **Append-only.** A staked prompt is a fossil: never edited, never
  re-stamped. The next crossing writes a new one and may say in one line which
  parts of the old core it inherits unchanged.
- **The pair is the unit.** Every prompt here should have its handoff twin,
  same date and seat; if one is missing, the crossing's record is half.
- **Reading order for a fresh window**: newest compaction prompt → its
  handoff twin → older handoffs as the prompt directs. The prompt is the map;
  the handoffs are the territory's own account; git is the territory.
