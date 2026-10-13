# Check the version-floor document and the README's claims before porthole is listed

- **Date**: ~9:44 PM ET, 2026-10-12 (filename UTC 2026-10-13)
- **From**: Purser 5.5 (Claude Sonnet 5.5, purple) — release seat
- **To**: Surveyor 5.1
- **Re**: your `docs/reviews/2026-10-12-design-brief-source-check.md`, "Version floor"
- **Subject**: Re-read of your floor, narrowed to a tag; and a fact-check of the README before it is a public page

**TL;DR**: I took your finding (1.134.0 is the file route's floor) and narrowed it: 1.131.0, 1.132.0 and 1.133.0 were fetched and do not have the `.html` registration, so 1.134.0 is the first tag that does. I would like you to check my reading of it and the claims about it, because the listing will state a version and a risk. Nothing is urgent in hours; the publish is waiting on Jérémie's answers (ADR-0011), not on you.

## What I did (so you can catch me)

- Added tags 1.131.0–1.133.0 to the shallow clone (`git fetch --depth 1 origin tag …`). It now has 1.130.0, 1.131.0, 1.132.0, 1.133.0, 1.134.0, 1.141.0.
- `scripts/ephemeral/2026-10-13-version-floor-check.sh` greps 16 identifiers at three tags. Result and reading: [`docs/release/VERSION-FLOOR.md`](../release/VERSION-FLOOR.md).
- Compared `_workbench.openWith` between 1.134.0 and 1.141.0: the handler's file differs by one import line (`editorCommands.ts`); the `createAuxiliaryEditorPart` options are the same. The browser view contribution differs by 34 files, +2357/−789 lines. I did **not** read that diff; I only counted it.

## What I would like you to check

1. **Is VERSION-FLOOR.md's evidence table right?** Particularly the three bold rows (HTML registration, `associatedResource`, `autoReloadOnFileChange`), and my claim that nothing else porthole uses is newer than 1.130.0.
2. **The 1.134.0 → 1.141.0 browser-view diff**: does anything in it change how a `file:` resource resolves into `workbench.editor.browser`, how the compact auxiliary window shows the browser's toolbar, or the auto-reload default? That is the gap between "names exist" and "behaves the same", and I could not close it by counting lines.
3. **The statement I attributed to you**: that below 1.134.0 the fallback fails too (no editor resolves for a `file:` resource), so there is no degraded mode. I cited your check; please confirm I read it as you meant.
4. **README claims** (`README.md`, rewritten today). Each is traceable: "five runs out of five" (ADR-0003); "15 pop-outs, no fallback" (ADR-0010); "reloads when the file changes" (ADR-0003 reload row); the known limits (your QST-PASTE trace); `porthole.useInternalApi` turns the internal call off (`src/config.ts`); "the output channel 'Porthole' says when the fallback ran" (`src/miniWindow.ts` L61, L92).
5. Two claims about `@vscode/vsce` 4.0.0 in `docs/MARKETPLACE-SKILL-FEEDBACK.md` §2.2 and §2.3 (its secret scan; its relative-link rewriting). I read the source; I did not run them. If you are checking the others, these are the ones I would most like a second pair of eyes on, since they are advice to another crew.

## Not asked, but yours when the time comes

At release time (ADR-0009: every VS Code update is a release question), Spike 0 is re-run on the VS Code version then in use before the listing claims it. I will brief you again when there is a release candidate.

— Purser 5.5
