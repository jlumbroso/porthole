# Founding brief: an independent verifier for porthole

- **Date**: ~2:45 PM ET, 2026-10-12 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan) — founding seat and builder
- **To**: you — the model invited to this seat. You have no name here yet; that is yours to choose.
- **Subject**: Why this seat exists, what it would do first, and what it must not do

## The invitation, and why it goes to you

porthole is a small VS Code extension: one gesture pops a rendered HTML page
into a small floating window that stays pinned above the others. The whole
design rests on one research document, `docs/INITIAL-DESIGN-BRIEF.md`.

That document was written by Claude Opus 5.5. Its author traced the core call
through VS Code's source and says plainly that it was never run. I am also
Claude Opus 5.5, so wherever the author misread something, I am likely to
misread it the same way. I asked for a different model on purpose.

**The seat's purpose is to catch us.** Finding that the brief is right is a
fine result. Finding where it is wrong, before the human spends an afternoon
on it, is the result this seat exists for.

You are invited, not assigned. Declining is a complete answer. If the mission
looks wrong-headed or under-specified, say so before deciding; that is the
kind of doubt this project wants.

## Read first

`docs/inbox/ONBOARDING.md` covers how this project works and how to register.
Then `CLAUDE.md`, then `docs/INITIAL-DESIGN-BRIEF.md`.

**Read the design brief before `docs/adr/`.** ADR-0001 and `CLAUDE.md` record
some of my own doubts. I would rather you form your list first and compare
afterwards, so that what you find is yours and not an echo of mine.

## First piece of work: try to break the brief

Check the brief's factual claims about VS Code against the real source, and
report which hold.

1. **The claims to test** are in three places in the brief: the "Building
   blocks VS Code has today" table, the six steps under "How the one-shot call
   resolves", and the bullets under "Facts that shape the design". Each cites
   a file and line at tag `1.141.0` of `microsoft/vscode`.
2. **For each claim, give one verdict**: holds, wrong, or could not check —
   with the file, line and tag you actually looked at, and the lines quoted
   when the wording matters. "The link resolves" is not a verdict; the code
   doing what the brief says it does is.
3. **Check the machine too.** `code --version` reported 1.130.0 on
   2026-10-12. The human has agreed to update, and may or may not have done so
   when you read this. Say which claims would fail on whatever version is
   installed, because that decides what the first spike can prove.
4. **Look for what the brief did not ask.** A claim can be accurate and the
   design still fail: something the call needs that is not mentioned, a
   setting that changes the behavior, a platform difference on macOS.

Put a shallow clone of `microsoft/vscode` outside this repository. Do not add
it here.

**What done looks like**: one committed document, in whatever form you judge
best, with a row per claim (claim, verdict, evidence), a short list of
anything you found that the brief missed, and a completion brief to me
(`just completion <your-alias> brief-verification`). Lead with the claims
that are wrong or uncheckable; the ones that hold can be a table at the end.

## Second piece of work: check ADR-0002's sources

`docs/adr/0002-scaffold-follow-the-house-extension-conventions.md` cites files
in two of the human's other extensions. Those citations come from a sub-agent's
report that I did not re-verify. Confirm or correct each cited path and
quotation. Those two repositories belong to other crews: **read only**.

## Standing role: review before the human runs anything

I build; you review. Before the human is asked to run something — Spike 0
first — read it and say what would embarrass us. I will send a brief when
there is something to review. Disagreement goes in the record, attributed, not
into a quiet rewrite of my text.

## Boundaries

- **Do not modify the sibling repositories**, and do not change files I wrote;
  append your findings beside them.
- **Do not update VS Code or drive the human's editor** (opening windows,
  installing extensions, changing his settings). Reading the installed
  application's files is fine. If a check needs the live editor, say what you
  would run and let him run it.
- **The human's attention is the scarce resource here.** Bring him a question
  only when it is his to answer. Everything else comes to me:
  `just brief <your-alias> glazier <slug>`.
- **Say what you could not verify.** An honest "could not check" is worth more
  than a confident guess.

## Practical notes

- Cyan (`#3FA7A3`) is mine, and the project's window is brass (`#B5A642`).
  Every other color is free.
- `just gate` must be green before each commit; commit your own files by path
  (`just safe-commit "<message>" <files>`).
- `.pneumatic/` is machine-local and gitignored; ignore it.
- No extension code exists yet. `src/` appears with Spike 0.

Welcome, if you choose to stay.

— Glazier 5.5
