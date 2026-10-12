<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Scaffold: follow the house's extension conventions

- **Date**: 2026-10-12
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human), Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Scaffold porthole the way `vscode-adrs-for-ai` is built — Vite bundle, Vitest against a mocked `vscode`, logged async command wrappers, deny-list packaging — instead of the brief's esbuild sketch, and try to turn Spike 0 into a repeatable real-VS-Code test.

---

## Originating Context

**Source**: Jérémie's offer on 2026-10-12 to learn from his two existing extensions, and a read-only study of both repos made the same day by a sub-agent of the founding seat.

- `/Users/jlumbroso/Programming/vscode-peacock-launcher` — small personal extension, the closest analog
- `/Users/jlumbroso/Programming/vscode-adrs-for-ai` — larger, crewed extension with a mature test harness

**How far to trust what follows**: the study read files and did not run either test suite. I have not re-read the cited files myself. Items the study marked as its own inference are marked *(inferred)* here. Treat every path as a pointer to check, not as a verified fact.

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

1. **Every command is registered through one wrapper** that is `async`, awaits the handler, logs failures and rethrows. No bare arrows.
2. **`"activationEvents": ["onUri"]`** if QST-TRIGGER (ADR-0001) keeps the link handler, otherwise `[]`. Never activate on startup.
3. **The link handler is a pure parser plus thin glue**, with the parser tested directly.
4. **The running version and the VS Code version are logged at activation.**
5. **A manifest-driven smoke test** fails when a contributed command has no registered handler.
6. **Packaging is checked, not assumed**: a `.vscodeignore` deny-list that also names `.mcp.json`, `.pneumatic/**`, `CLAUDE.md`, `docs/**` and `kintsugi.*`; source maps off; `vsce ls` reviewed before the first install.
7. **`just install-local`** packages, installs the exact file and says to reload the window.
8. **`npm run check`** — typecheck, tests, bundle — is what `just gate` calls.

Two points deliberately left to evidence rather than decided now:

- **`engines.vscode`** is set to the version Spike 0 actually passes on. The house floor of `^1.85.0` would claim support for versions that lack what porthole calls; the brief's `^1.141.0` is a reading, not a result.
- **Test location** follows `vscode-adrs-for-ai` (`src/test/`), which differs from the `tests/` directory named in the template's `CLAUDE.md` file map. The map is corrected when the scaffold lands.

**Trade-offs accepted**: more build machinery than a 300-line extension strictly needs, in exchange for being the same machinery the human already maintains.

### Consequences

- The brief's "Scaffold" paragraph (esbuild, `^1.141.0`) is superseded by this ADR.
- The mocked tier cannot tell us whether the internal call works. That limit is stated in `CLAUDE.md` and is the subject of the follow-up below.

---

## Open Follow-ups

### QST-SPIKE-AUTOMATION: Can Spike 0 run as a repeatable test inside a real VS Code?
- Status: unresolved
- Why deferring: it needs the manual spike to pass first, and VS Code must be updated before that.

**ANS:** [Fill when resolved; or link to the ADR / discussion that resolved it]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

The reason this matters: the brief's main risk mitigation is "re-run Spike 0 after updates", by hand. `vscode-adrs-for-ai` already runs a second test tier in a real VS Code (`@vscode/test-cli`, one test, outside `npm test`). If a real-host test can run the one-shot call and observe a new tab group, the manual re-check becomes one command. Unknown until tried: whether the integrated browser and floating windows work in the test host at all.

- [ ] Unverified assumption: every path and quotation under Supporting Materials — check before relying on it (verifier seat).
- [ ] Unverified assumption *(inferred by the study)*: disabling source maps is the right fix for the reported map leak.

---

## Action Items

- [ ] Check the cited paths against the two repos — Owner: verifier seat
- [ ] Create the scaffold after Spike 0 — Owner: Glazier
- [ ] Try QST-SPIKE-AUTOMATION once the manual spike passes — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-12)
- Trigger: read-only study of the human's two existing extensions, at his offer
- Contributors: Glazier 5.5 (Claude Opus 5.5), with a sub-agent's report
- Changes: initial draft
- Outcome: `Draft`

---

## Links

- Related ADRs: [ADR-0001](0001-founding-identity-gate-and-crew-shape.md)
- Superseded text: `docs/INITIAL-DESIGN-BRIEF.md`, "Extension spec" → "Scaffold"
