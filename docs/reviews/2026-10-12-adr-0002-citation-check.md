# Citation check: ADR-0002's sources in the two house extensions

- **Date**: ~3:25 PM ET, 2026-10-12
- **Author**: Surveyor 5.1 (Claude Fable 5.1, orange `#F26B1D`)
- **Re**: `docs/inbox/2026-10-12-1845-glazier-founding-brief-independent-verifier.md`, second piece of work
- **Subject**: Every path and quotation under ADR-0002 "Supporting Materials", confirmed or corrected
- **Checked against**: `~/Programming/vscode-adrs-for-ai` and `~/Programming/vscode-peacock-launcher`
  as on disk at 3:15 PM ET, read only. VSIX contents listed with `unzip -l`; nothing was run.

## Verdict

**Every cited path exists and every quotation matches.** The two leaks the study reported
in the shipped packages are real: I listed both VSIX files and found them. Three items
deserve a refinement before porthole copies them, listed first. ADR-0002's two unverified
checkboxes can be closed as follows: the paths and quotations, verified; the source-map
cause, still inferred (I did not test vsce's ignore semantics).

## Refinements (3)

1. **`registerLoggedCommand` logs only when it can derive an anchor path from the
   command's first argument.** `src/extension.ts` L205–236: the wrapper is `async`, awaits
   the handler and always rethrows, but the ledger write sits inside `if (anchorPath)`.
   A command invoked with no argument, or with an argument that is not a tree item, is
   rethrown silently (VS Code's own popup still fires). porthole's commands take a `Uri` or
   nothing, so a copy of this wrapper would log nothing. Copy the shape, not the
   anchor-path condition.
2. **"Five shipped commands" is the sum of a changelog that does not add up.** 0.7.110
   fixed one command ("Commit ADR changes"); 0.7.111 says "Four more" and then names five
   ("Open ADR", "Create ADR", "Filter Questions", "Change Status", "Go to Answer in File").
   The ADR's point stands either way: the bug class was real and shipped more than once.
3. **The stale files in the peacock VSIX are test source maps, not test code.**
   `peacock-launcher-0.1.1.vsix` carries four `dist/**/*.test.js.map` files dated
   2026-04-06 beside `dist/**/*.js` files dated 2026-08-16; no `*.test.js` ships. The
   ADR's Option C argument ("`tsc` never cleans `dist/`") holds, with the leak being maps.

## Table

| ADR-0002 citation | Verdict | Evidence |
| --- | --- | --- |
| `vscode-adrs-for-ai/CLAUDE.md` house rule, quoted | holds, verbatim | L337: "We want to avoid anything related to Meta. (Avoid React -> Vue, vite/vitest instead.)" |
| `vite.config.ts`: library-mode CJS, `vscode` + Node built-ins external, mock via `test.alias` "so it can never leak into `vite build`" | holds, verbatim | `build.lib.formats: ['cjs']`, `external: ['vscode','path','fs',…]`; comment in `test.alias`: "scoped to `test.alias` (NOT the top-level `resolve.alias` below) so it can never leak into `vite build`" |
| `src/test/helpers/vscodeMock.ts`: `getRegisteredCommand(id)`, `registerUriHandler` no-op, `ViewColumn` only `One`/`Two` | holds | L37 `getRegisteredCommand`; L284 `registerUriHandler: vi.fn(() => ({ dispose: vi.fn() }))` (stores nothing); L128 `enum ViewColumn { One = 1, Two = 2 }`; L370/L374 command registry |
| `src/test/commandSmoke.test.ts`: real `activate()`, commands read from `package.json` | holds | L35 imports `activate`; L57–58 reads `contributes.commands` from `package.json`; L139 test "activate() registers a real handler for every command.command declared in package.json" |
| ADR-0044: a corrupted `main` left Vitest green, failed only in a real host | holds | `docs/adr/0044-…md` L33: `main` pointed at a nonexistent file; real host failed with a module-resolution error, "vitest mock stayed fully green (57/57)" |
| `vscode-peacock-launcher/vitest.config.ts` comment on Vitest 1.x thresholds | holds, verbatim | "flat lines/functions/branches/statements keys here were silently ignored and never failed the build (real coverage was 24%, not the assumed 70%)"; `vitest: ^1.0.0` in `package.json` |
| `CHANGELOG.md` 0.7.110 / 0.7.111: unawaited async command handlers | holds, see refinement 2 | L111–122 |
| `src/extension.ts` ~L205 `registerLoggedCommand`; ~L248 running version logged | holds, see refinement 1 | L205 definition; L250–253 `runningVersion` from `context.extension.packageJSON.version` |
| `DEBRIEF-004-auto-opening-intrusion.md`: don't activate on startup; `[]` suffices | holds | L52 incident was `onStartupFinished`; L92 `"activationEvents": []  // Empty = activate on command invocation only` |
| `src/deeplink/uriTarget.ts` + `src/views/deepLinkUriHandler.ts`, `onUri`, malformed link shows an error | holds | both files exist; `package.json` L38 `"onUri"`; `deepLinkUriHandler.ts` L56–58 `parseUriHandlerTarget` then `showErrorMessage` |
| `src/test/packagingSecrets.test.ts`: "vsce does not fall back to .gitignore once a .vscodeignore exists"; a test pins the list | holds, verbatim | L52–53 comment; L23 reads `.vscodeignore`; L27 asserts `.env` variants |
| `.vscodeignore`: source maps still ship; `.mcp.json` has no line | holds (leaks confirmed; map cause not tested) | `adrs4ai-0.7.134.vsix` (22 files) contains `extension/.mcp.json`, `extension/dist/extension.js.map` (1.1 MB), `extension/dist/mcp-server.js.map`; `.vscodeignore` has `**/*.map`, then `!dist/**`, then `dist/**/*.map`, and no `.mcp.json` line; `.mcp.json` is git-tracked |
| peacock 0.1.1 VSIX contains `CLAUDE.md`, `.mcp.json`, `.pneumatic/events.jsonl`, coverage, test files; packaged minutes before the ignore fix | holds, see refinement 3 | VSIX (178 files, mtime 2026-08-16 20:36) contains all of `extension/CLAUDE.md`, `extension/.mcp.json`, `extension/.pneumatic/events.jsonl`, `extension/coverage/**`; ignore fix is commit `ef03ca4` at 20:50:53 the same day; installed: `~/.vscode/extensions/jlumbroso.peacock-launcher-0.1.1` |
| ADR-0042: `vsce ls` before shipping; `npx @vscode/vsce`, not bare `npx vsce` | holds | L48 ("not the deprecated standalone `vsce` package `npx vsce` resolves to by default"), L318, L320 |
| `justfile` `install-local`: package, install the exact file, say to reload; born from a fix "verified in git" while the running extension was two versions behind | holds | L688–693 comment ("the running extension's own output channel showed it was still two versions behind"); recipe L697–712 ends "reload the VS Code window to activate it" |
| Both house extensions set `engines.vscode: ^1.85.0`; neither uses esbuild; peacock is `tsc` only | holds | `package.json` L9 and L14 respectively; peacock `build: tsc -p ./`; adrs-for-ai builds with Vite |
| Test location `src/test/` in `vscode-adrs-for-ai` | holds | directory listing; 100+ `*.test.ts` files |

## Not checked

- Whether vsce's negation order is what makes `dist/**/*.map` ship. The leak is a fact;
  the cause stays *(inferred)*, as the ADR marks it.
- Neither test suite was run, as the study did not either.
