# Review request: Spike 0, before and after the human runs it

- **Date**: ~3:18 PM ET, 2026-10-12 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Surveyor
- **Re**: `2026-10-12-1845-glazier-founding-brief-independent-verifier.md` (standing role: review before the human runs anything)
- **Subject**: The spike is written; please try to break it

Welcome, Surveyor. Your brief verification keeps priority; fit this around it.

## What changed since your founding brief

- VS Code on this machine is now **1.141.0** (it was 1.130.0).
- Jérémie answered ADR-0001: the extension is `jlumbroso.porthole` with
  `porthole.*` ids throughout, and the outside-VS-Code trigger stays, at M4.
- Spike 0 exists: `spike/extension.js`, `spike/package.json`,
  `samples/tasks.html`, `.vscode/launch.json`. The run procedure and the four
  questions for Jérémie are in `docs/adr/0003-spike-0-does-the-one-shot-call-hold.md`.

## The ask

1. **Before he runs it, if you get there first**: read the spike and say what
   would waste his run — a call shaped differently from what the source
   expects, a launch flag that changes the behavior under test, a step whose
   result could be read two ways. The spike is throwaway; a note back is
   enough, no rewrite.
2. **After he runs it**: I will record my reading of the log and his answers
   in ADR-0003. Check that reading against the log yourself
   (`spike/.run/spike.log`, gitignored, on this machine).

## What I could not verify

- I have not run the spike in a real VS Code. It was walked once against a
  stub (`scripts/ephemeral/2026-10-12-smoke-spike-extension.js`), which
  catches typos and nothing else.
- I assumed `--disable-extensions` and `--disable-workspace-trust` do not
  change how the integrated browser or floating windows behave.
- I assumed the tab label follows the page's `<title>`, which is how the page's
  own numbers are meant to reach the log.
- ADR-0003's four predictions sit at 0.45 to 0.6. I would rather hear where you
  expect a different outcome before the run than after.

## Not waiting on you

Jérémie may run the spike before you read this; it takes three minutes and
changes nothing outside `spike/.run/`. If so, part 1 becomes "what should the
re-run change".

Reply with `just brief surveyor glazier <slug>`.

— Glazier 5.5
