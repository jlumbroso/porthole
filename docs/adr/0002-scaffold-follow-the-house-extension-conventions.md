<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Scaffold: follow the house's extension conventions

- **Date**: 2026-10-12
- **Iteration**: 2
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Scaffold porthole the way `vscode-adrs-for-ai` is built — Vite bundle, Vitest against a mocked `vscode`, logged async command wrappers, deny-list packaging — instead of the brief's esbuild sketch, and try to turn Spike 0 into a repeatable real-VS-Code test.

---

## Originating Context

**Source**: Jérémie's offer on 2026-10-12 to learn from his two existing extensions, and a read-only study of both repos made the same day by a sub-agent of the founding seat.

- `/Users/jlumbroso/Programming/vscode-peacock-launcher` — small personal extension, the closest analog
- `/Users/jlumbroso/Programming/vscode-adrs-for-ai` — larger, crewed extension with a mature test harness

**How far to trust what follows**: the study read files and did not run either test suite. I have not re-read the cited files myself. Items the study marked as its own inference are marked *(inferred)* here.

**Checked since (iteration 2)**: Surveyor 5.1 read every cited path and quotation in both repos on 2026-10-12 and listed the contents of both shipped VSIX files. All hold; three need refining before porthole copies them. The check is [`docs/reviews/2026-10-12-adr-0002-citation-check.md`](../reviews/2026-10-12-adr-0002-citation-check.md), and the refinements are folded in below, marked *(Surveyor)*.

**Agency Grant**: Explore options and decide the scaffold; Jérémie can override anything here.

---

## Explicitation

**What I understand**:

1. **The brief's scaffold and the house's practice disagree.** The brief says "TypeScript bundled with esbuild" and `engines.vscode: ^1.141.0`. Neither house extension uses esbuild; both set `^1.85.0`.
2. **The house has learned things the hard way that a new extension should inherit.** Several are packaging and command-handler mistakes that shipped.
3. **porthole's riskiest parts have no house precedent.** Neither repo uses an internal `_workbench.*` command, a proposed API, floating windows, or `workbench.editorAssociations`.

**Assumptions**:

- The later, post-incident choice in `vscode-adrs-for-ai` is the one to copy wherever the two repos differ.
- porthole keeps zero runtime dependencies, as the brief specifies.

**Confirm**: Jérémie, by reading the Decision section; the verifier seat, by checking the cited paths.

---

## Questions

NOT: no open questions for the human — every choice below has a house precedent or is deferred to evidence from Spike 0; the one genuinely open item is the model's own and sits under Open Follow-ups.

---

## Supporting Materials

### FIL: house-conventions
What the study reported, with the file to check for each.

**Build and test**
- `vscode-adrs-for-ai/CLAUDE.md` — the house rule: "We want to avoid anything related to Meta. (Avoid React -> Vue, vite/vitest instead.)"
- `vscode-adrs-for-ai/vite.config.ts` — library-mode CJS bundle with `vscode` and Node built-ins external; the `vscode` mock is wired through `test.alias` only, "so it can never leak into `vite build`".
- `vscode-adrs-for-ai/src/test/helpers/vscodeMock.ts` — a command registry behind `registerCommand` / `executeCommand`, with `getRegisteredCommand(id)` as the test seam. Its `registerUriHandler` is a no-op and `ViewColumn` has only `One` and `Two`; porthole must extend both.
- `vscode-adrs-for-ai/src/test/commandSmoke.test.ts` — calls the real `activate()`, then invokes each handler; the list of commands is read from `package.json`, so an unregistered command fails the test.
- `vscode-adrs-for-ai/docs/adr/0044-a-second-test-tier-inside-a-real-vs-code-instance.md` — why a mocked tier is not enough: a corrupted `main` left Vitest green and failed only in a real host.
- `vscode-peacock-launcher/vitest.config.ts` — comment: Vitest 1.x silently ignores flat coverage thresholds ("real coverage was 24%, not the assumed 70%").

**Command handlers**
- `vscode-adrs-for-ai/CHANGELOG.md` entries 0.7.110 and 0.7.111 — five shipped commands were non-async arrows calling async functions without `await`, so their errors became invisible unhandled rejections.
- `vscode-adrs-for-ai/src/extension.ts` near line 205 — `registerLoggedCommand`, a wrapper that awaits, logs and rethrows; near line 248, the running version is logged at activation.

**Activation**
- `vscode-peacock-launcher/docs/adr/DEBRIEF-004-auto-opening-intrusion.md` — a summoned tool must not activate on startup; `"activationEvents": []` plus contributed commands is enough.
- `vscode-adrs-for-ai/src/deeplink/uriTarget.ts` and `src/views/deepLinkUriHandler.ts` — the link handler split into a pure parser and thin glue, with `"onUri"` in `activationEvents`. A malformed link shows an error; it is never a silent no-op.

**Packaging**
- `vscode-adrs-for-ai/src/test/packagingSecrets.test.ts` — "vsce does not fall back to .gitignore once a .vscodeignore exists"; a test pins the ignore list.
- `vscode-adrs-for-ai/.vscodeignore` — the deny-list to start from. The study reports two leaks in the current VSIX: source maps still ship *(cause inferred: the `!dist/**` re-include wins over the later `.map` line)*, and `.mcp.json` has no ignore line.
- `vscode-peacock-launcher` — the installed 0.1.1 VSIX is reported to contain `CLAUDE.md`, `.mcp.json`, `.pneumatic/events.jsonl`, coverage output and test files, because it was packaged minutes before the ignore file was fixed and never repackaged.
- `vscode-adrs-for-ai/docs/adr/0042-marketplace-release-runbook.md` — inspect with `vsce ls` before shipping; call `npx @vscode/vsce`, because bare `npx vsce` resolves to a deprecated package.
- `vscode-adrs-for-ai/justfile`, recipe `install-local` — package, install the exact file, reload the window. Written after a fix was "verified in git" while the running extension was two versions behind.

---

## Decision

### Context

The scaffold is about to be created. Copying the brief's sketch would diverge from how the human's other extensions are built, tested and packaged, and would repeat mistakes those projects already paid for.

### Options

**Option A**: the house scaffold — Vite bundle, Vitest with a mocked `vscode`, the `vscode-adrs-for-ai` layout
- Pros: one config file serves build and tests; a working mock and smoke-test pattern to copy; matches the stated house rule
- Cons: Vite's library mode is more machinery than 300 lines need

**Option B**: the brief's scaffold — esbuild bundle
- Pros: smallest build config; what the brief already describes
- Cons: no house precedent; the test alias would need a separate Vitest config anyway

**Option C**: `tsc` only, unbundled, as `vscode-peacock-launcher` does
- Pros: no bundler at all
- Cons: `tsc` never cleans `dist/`, and stale compiled test files are reported to have shipped in that extension's VSIX

### Chosen: Option A — the house scaffold

**Rationale**: the house rule names Vite and Vitest; `vscode-adrs-for-ai`'s config is reported to produce a bundle with exactly one `require("vscode")` and no mock leakage; and the same file wires the test alias, so there is one place to get wrong instead of two. Option C's failure is not hypothetical. esbuild is not excluded by the house rule, but nothing argues for introducing a second bundler into the estate for one small extension.

Adopted along with it, each traced to the materials above:

1. **Every command is registered through one wrapper** that is `async`, awaits the handler, logs failures and rethrows. No bare arrows. *(Surveyor)*: copy the shape of `registerLoggedCommand`, not its body — the original writes its log only when it can derive a path from the command's first argument, so a verbatim copy would log nothing for porthole's commands, which take a `Uri` or nothing. porthole's wrapper logs unconditionally.
2. **`"activationEvents": ["onUri"]`** if QST-TRIGGER (ADR-0001) keeps the link handler, otherwise `[]`. Never activate on startup.
3. **The link handler is a pure parser plus thin glue**, with the parser tested directly.
4. **The running version and the VS Code version are logged at activation.**
5. **A manifest-driven smoke test** fails when a contributed command has no registered handler.
6. **Packaging is checked, not assumed**: a `.vscodeignore` deny-list that also names `.mcp.json`, `.pneumatic/**`, `CLAUDE.md`, `docs/**` and `kintsugi.*`; source maps off; `vsce ls` reviewed before the first install.
7. **`just install-local`** packages, installs the exact file and says to reload the window.
8. **`npm run check`** — typecheck, tests, bundle — is what `just gate` calls.

Two points deliberately left to evidence rather than decided now:

- **`engines.vscode`** is set to the version Spike 0 actually passes on, **and never below `^1.134.0`**. The house floor of `^1.85.0` would claim support for versions that lack what porthole calls; the brief's `^1.141.0` is a reading, not a result. The 1.134 floor is Surveyor's finding from comparing three tags of VS Code's source: at 1.130.0 the integrated browser is not registered for local HTML files at all and has no auto-reload setting; at 1.134.0 it has both. No tag between 1.134 and 1.141 was read, so the version actually run remains the honest claim ([source check](../reviews/2026-10-12-design-brief-source-check.md), "Version floor").
- **Test location** follows `vscode-adrs-for-ai` (`src/test/`), which differs from the `tests/` directory named in the template's `CLAUDE.md` file map. The map is corrected when the scaffold lands.

**Trade-offs accepted**: more build machinery than a 300-line extension strictly needs, in exchange for being the same machinery the human already maintains.

### Consequences

- The brief's "Scaffold" paragraph (esbuild, `^1.141.0`) is superseded by this ADR.
- The mocked tier cannot tell us whether the internal call works. That limit is stated in `CLAUDE.md` and is the subject of the follow-up below.

---

## Open Follow-ups

### QST-SPIKE-AUTOMATION: Can Spike 0 run as a repeatable test inside a real VS Code?
- Status: answered
- Why deferring: it needs the manual spike to pass first, and VS Code must be updated before that.

**ANS:** (by Jérémie Lumbroso)
Yes, it looks like it was repeatable, see adr://v1/repo/jlumbroso/porthole/adr/0003

---

The reason this matters: the brief's main risk mitigation is "re-run Spike 0 after updates", by hand. `vscode-adrs-for-ai` already runs a second test tier in a real VS Code (`@vscode/test-cli`, one test, outside `npm test`). If a real-host test can run the one-shot call and observe a new tab group, the manual re-check becomes one command. Unknown until tried: whether the integrated browser and floating windows work in the test host at all.

- [x] Unverified assumption: every path and quotation under Supporting Materials — verified by Surveyor 5.1, 2026-10-12. Two small corrections to the record: the changelog's count of affected commands does not add up (0.7.110 fixed one; 0.7.111 says "four more" and names five), and the stale files in `vscode-peacock-launcher`'s `dist/` are test source *maps*, not compiled test code. Neither changes a decision here.
- [ ] Unverified assumption *(inferred by the study)*: disabling source maps is the right fix for the reported map leak. Still inferred; nobody has tested vsce's ignore rules.
- [ ] Carry into M1, from Surveyor's source check: `pinned: true` is already `_workbench.openWith`'s default, and VS Code clamps bounds to 400×270 itself, so the brief's `Math.max` and explicit `pinned` are redundant; and resize-by-reopening leaves an empty window behind if the user has turned `workbench.editor.closeEmptyGroups` off.

---

## Action Items

- [x] Check the cited paths against the two repos — Owner: Surveyor (done 2026-10-12)
- [ ] Create the scaffold after Spike 0 — Owner: Glazier
- [ ] Try QST-SPIKE-AUTOMATION once the manual spike passes — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: read-only study of the human's two existing extensions, at his offer
- Contributors: Glazier 5.5 (Claude Opus 5.5), with a sub-agent's report
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-12)
- Trigger: Surveyor's completion brief (`docs/inbox/archive/2026-10-12-1919-surveyor-completion-brief-verification.md`)
- Contributors: Surveyor 5.1 (Claude Fable 5.1) — the findings; Glazier 5.5 (Claude Opus 5.5) — folding them in
- Changes: citations marked verified; the command wrapper is to log unconditionally; `engines.vscode` gains a `^1.134.0` floor; three simplifications carried into M1
- Outcome: stays `Draft` until Jérémie has read the Decision

### Iteration 3 (2026-10-12)
- Trigger: the scaffold was built; `npm install` reported 12 advisories (2 critical) on the house's versions, and Jérémie sent Vite's current troubleshooting page after seeing a deprecation warning in the build output
- Contributors: Jérémie Lumbroso — the pointer; Glazier 5.5 (Claude Opus 5.5) — the change
- Changes, all departures from a verbatim copy of `vscode-adrs-for-ai`, each for a stated reason:
  - **Tool versions are current, not the house's**: Vite 8 (house: 5), Vitest 5 (house: 2), vsce 4 (house: 3). With the house's versions `npm audit` reported 12 advisories, two of them critical (remote code execution through `tinypool`, Vitest's worker pool); with these it reports none. Nothing in the config had to change. These are development tools and never ship, but they do run on this machine. **The two house extensions still carry those advisories**; that is for their crews. *Update, the same night*: `vscode-adrs-for-ai` took this route after a brief from porthole (Lintel 5, by message to Glazier): 39 advisories, 4 critical, down to 0, with npm `overrides` for `serialize-javascript` and `diff` because `@vscode/test-cli` 0.0.15 still bundles an old Mocha; their 1,856 tests, build and package all clean afterwards. Gleaner 5 of the same crew added that `@modelcontextprotocol/sdk`, the one advisory in shipped code (their MCP server), resolved with a plain `npm audit fix`, and that both of their bundles build clean (their commit `c6e6cd6`, 2026-10-12 21:29). `vscode-peacock-launcher` was not briefed (not authorized) and still carries 30.
  - **The build config is ESM** (`vite.config.mts`), which removes the "CJS build of Vite's Node API is deprecated" warning.
  - **The package's contents are checked, not only ignored**: `.vscodeignore` is an allowlist of five files, and `npm run check:package` lists what would really ship and fails on anything else. This replaces the "pin the ignore list in a test" pattern from the Supporting Materials, which checks the intention rather than the result.
  - **Tests live in `src/test/`**, as planned; `CLAUDE.md`'s file map is corrected.
  - **`engines.vscode` is `^1.141.0`**, the version Spike 0 passed on (ADR-0003).
- Outcome: stays `Draft` until Jérémie has read the Decision

### Iteration 4 (2026-10-12, late evening)
- Trigger: Jérémie answered ADR-0011's QST-ENGINES-FLOOR with B (lower the floor) and installed VS Code 1.134.0 to test it
- Contributors: Jérémie Lumbroso — the decision and the run; Purser 5.5 (Claude Sonnet 5.5) — the brief; Glazier 5.5 (Claude Opus 5.5) — the change
- Changes: `engines.vscode` lowered to `^1.134.0`, the floor Surveyor found in source, and `@types/vscode` pinned to `~1.134.0` so the compiler allows only what 1.134 offers. Jérémie then ran the rebuilt extension on 1.134.0: "Flawless." The floor is now run, not only read. Not recorded: whether Spike 0 itself was re-run there, or which steps of ADR-0010 were repeated.
- Outcome: stays `Draft` until Jérémie has read the Decision

### Iteration 5 (2026-10-18)
- Trigger: Dependabot's PR #1 (opened 2026-10-13): `@types/node` 22 → 26 and `typescript` 5.9.3 → 7.0.2; Jérémie asked Glazier to process and close it
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes, and why the PR was closed rather than merged:
  - **`@types/node` follows the Node.js of VS Code at the engines floor, as `@types/vscode` follows its API.** VS Code 1.134.0 runs Node 24 (read in its source: `remote/.npmrc` targets 24.18.1; `.npmrc` targets Electron 42.8.1). Types for Node 26 would let the code call Node APIs that users at the floor do not have, and nothing would fail until it ran. Moved from 22 (safe but behind) to `^24.19.2`; gate green, 79 tests. Dependabot now ignores `@types/node` 25 and up; raise that limit when the floor rises.
  - **TypeScript 7 waits for its own decision.** It is the new, Go-based compiler, not a routine upgrade. The PR's CI failed at once: `error TS5108: Option 'moduleResolution=node10' has been removed` (our `tsconfig.json` says `"node"`). Adopting it means choosing a new module resolution and checking that the new compiler reads the code the same way; and Dependabot noted the release was published by an npm account that had not published our current version. Dependabot now ignores `typescript` 7 and up.
- Outcome: stays `Draft` (unchanged by this iteration)

### Iteration 6 (2026-10-18, same evening)
- Trigger: Dependabot's PR #2, right after the limits above: Vitest and `@vitest/coverage-v8` 5.0.4 → 5.0.5, `typescript` 5.9.3 → 6.0.3; its CI failed with `TS5107: Option 'moduleResolution=node10' is deprecated`
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: **`tsconfig.json` now says what the build really is.** TypeScript only type-checks (`noEmit`); Vite bundles. So `"module": "preserve"` with `"moduleResolution": "bundler"` (available since TypeScript 5.4), replacing `CommonJS` / `node`, which TypeScript 6 deprecates and 7 removes. TypeScript 6 also no longer loads every installed `@types` package by default, so `"types": ["node"]` names the one we use. Checked: `tsc --noEmit` passes with 5.9.3, 6.0.3 and 7.0.2; the gate is green, 79 tests, bundle and package unchanged. **TypeScript 7 now type-checks the code**, but stays excluded from Dependabot until it is adopted on purpose (the new compiler and its new npm publisher, iteration 5). PR #2 was then rebased by Dependabot onto this change and merged on a green CI.
- Outcome: stays `Draft` (unchanged by this iteration)

---

## Links

- Related ADRs: [ADR-0001](0001-founding-identity-gate-and-crew-shape.md)
- Superseded text: `docs/INITIAL-DESIGN-BRIEF.md`, "Extension spec" → "Scaffold"
