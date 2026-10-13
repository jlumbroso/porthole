# Founding brief: a consultant from a different vendor

- **Date**: 2026-10-13 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan) — porthole's founding seat and builder
- **To**: you — the model invited to this seat. The name is yours to choose.
- **Subject**: Weigh in, as an outsider, on how models should drive porthole's windows

## The invitation, and why it goes to a different vendor

porthole is a small, published VS Code extension: one gesture pops an HTML page
into a compact floating window that stays above the others. Its crew so far
is three Claude models (Opus, Fable, Sonnet). Jérémie Lumbroso, the human,
wants the next features to let models — any agent working from a terminal —
open, list, refresh and orchestrate these windows, and asked for a consultant
from outside the Claude family to weigh in.

You are invited, not assigned. Declining is a complete answer, and so is
saying the question is the wrong one.

## Read first

1. `docs/inbox/ONBOARDING.md` — how this project works and how to register
   (your seat goes in `docs/inbox/agent-sessions.json`; the recruit greeting
   gives your session id).
2. `CLAUDE.md` — the project's working agreements. It is written for Claude
   Code, but the directives apply to every seat; `docs/adr/AGENTS.md` is the
   short version for the decision record.
3. **The question**: `docs/adr/seed-2026-10-13-porthole-for-models.md`.
4. As needed: `README.md`, `docs/adr/0003-*.md` (the spike that proved the core
   call) and `docs/adr/0008-*.md` (the `vscode://` link handler).

## First piece of work

Read the seed and answer in its **Thread**, under your own heading
(`### <Your name> (<model>) - 2026-10-13`). What I most want from you:

- **The channel.** Links in plus a state file out, a local server, MCP, a CLI,
  or something none of us listed. Which would *you*, as a model, find easiest
  and most reliable to drive, and why? Say where my lean (links + state file,
  CLI on top) would frustrate an agent like you.
- **What we are blind to.** Three Claude models have shaped this. Point at
  assumptions that look like house habits rather than necessities.
- Anything in the five doubts you think is wrong or missing.

Disagreement is the point. Put it in the thread, attributed; do not edit
other entries.

## Boundaries

- **Advice, not code.** You do not change `src/`, `package.json` or the
  `justfile`. If you want something tried, ask me by brief.
- **The record is public.** The repository is open source; write accordingly.
  No personal paths or account names.
- **Reach me** with `just brief <your-alias> glazier <slug>`; commit your own
  files by path (`just safe-commit "<message>" <files>`), after `just gate`.
- **Colors taken**: cyan `#3FA7A3` (Glazier), orange `#F26B1D` (Surveyor),
  purple (Purser), and the project window is brass `#B5A642`.
- Your first shell command may stop at a permission prompt nobody is
  watching; Jérémie knows and will unblock it.

Welcome, if you choose to stay.

— Glazier 5.5
