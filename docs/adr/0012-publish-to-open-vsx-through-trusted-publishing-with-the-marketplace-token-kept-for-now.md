<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Publish to Open VSX through trusted publishing, with the Marketplace token kept for now

- **Date**: 2026-10-13
- **Iteration**: 5
- **Status**: Partially Implemented
- **Deciders**: Jérémie Lumbroso (asked for it); Purser 5.5 (Claude Sonnet 5.5) set it up

**TL;DR**: Open VSX releases go out from a GitHub workflow that proves its identity with a short-lived OIDC token (no stored secret), after Jérémie approves a protected environment; the VS Code Marketplace still uses its token through `just publish`.

---

## Originating Context

**Source**: Jérémie, 2026-10-13, after porthole 0.1.0 was published: "What about setting this up?", with a link to Open VSX's [Trusted Publishing](https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing) page. The release playbook (`.claude/skills/extension-marketplace-publishing`, §II.3) names the option and says it was never wired up in the repo it came from; `docs/MARKETPLACE-SKILL-FEEDBACK.md` 2.7 and 5.4 call it the better answer to "a token per repo".

**Agency Grant**: set it up; Jérémie performs the one step that needs his Open VSX login.

---

## Explicitation

**What I understand**:

1. A classic Open VSX token (`OVSX_PAT` in `.env`) is long-lived, can publish anything its owner can, and must be rotated by hand. Trusted publishing replaces it with a registration saying "this workflow file, in this repository, may publish this extension", and the registry hands the workflow a token that lives about five minutes and covers one extension.
2. The registry's page lists what has to be true first; all four are true here: Jérémie owns the `jlumbroso` namespace, the publisher agreement is signed, `jlumbroso.porthole` exists with an active version (0.1.0), and `publisher` in `package.json` matches the namespace's case exactly (`jlumbroso`; checked against the registry's own answer), which the page lists as a known limitation.
3. The registration cannot be created before the first version exists, which is why 0.1.0 went out with a token.

**Assumptions**:

- GitHub allows a workflow started by a workflow with the repository's own token only through `workflow_dispatch`; events like `release: published` created by that token would not start another workflow. So `release.yml` asks `publish-open-vsx.yml` to run by dispatching it. (Read from GitHub's documented behavior, not tested here.)
- `ovsx` 1.2.0, pinned as a devDependency with Glazier's override, supports `--trusted-publishing`. (**Ran**: the flag is in its `publish --help`; whether the exchange itself works is the test below.)

---

## Questions

### QST-OVSX-PAT: After trusted publishing is proven on a real run, should the classic Open VSX token be revoked?
- Status: answered
- Why asking: the point of trusted publishing is that no long-lived token exists. As long as `OVSX_PAT` stays valid in `.env`, a stolen copy of it can still publish to Open VSX. `just publish` (the local recipe) also still uses it for the Open VSX step today. The token only becomes safe to revoke once a publish has gone through the new route, which is not true yet.
- Need: pick a letter (or override: any shape answers)

Options:
- **A — revoke it after one successful trusted publish**: once a real release (or the rehearsal below) has been published by the workflow, delete the token at open-vsx.org (Settings, Access Tokens), remove `OVSX_PAT` from `.env`, and change `just publish` so it publishes only to the Marketplace. Nothing can publish to Open VSX except the approved workflow.
- **B — keep it as a fallback**: leave the token and the local Open VSX step in place in case the workflow breaks. Publishing to Open VSX keeps working from your machine, and the long-lived token stays exposed.
- **C — keep it for now, decide after two releases**: the same as B for a while, with a dated reminder to choose.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — revoke after one successful trusted publish.** *Rationale*: the token exists only because the first version had to be published the old way; its value is a single publish capability that the approved workflow now has. A fallback that is also an attack surface is worse than one more manual step if the workflow breaks (a token can be minted again in a minute). *Confidence*: 0.7 — because the argument is general and the workflow is not yet proven, so I have not seen the failure mode I am trading against. *If wrong*: if the first trusted publish fails in a way that takes more than a day to fix, this flips to B until it works.

**ANS:** (by Jérémie Lumbroso)
OK, approving Option A, if the trusted publishing works flawlessly.

---

### QST-MS-OIDC: Should I look into publishing to the VS Code Marketplace without a stored token too?
- Status: answered
- Why asking: the Marketplace still needs an Azure DevOps token (`VSCE_PAT`), which expires and is the more sensitive of the two. I believe `vsce` can authenticate with a Microsoft Entra identity (`--azure-credential`), which GitHub's OIDC can feed through a federated credential, but I have not read how, or tried it, and it needs an app registration in your Azure tenant, which is your account to change. I do not know what it would cost to set up or whether the Marketplace accepts such an identity as a publisher.
- Need: pick a letter (or override: any shape answers)

Options:
- **A — research first**: I read vsce's and Microsoft's documentation and write what it would take, with the steps that are yours, without changing anything in Azure. You then decide.
- **B — not now**: keep the token and its rotation by the dated-name rule, and revisit if Microsoft retires personal access tokens for the Marketplace.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — research first.** *Rationale*: a research note costs you nothing and changes nothing; the unknown is large (what the Marketplace accepts) and the benefit is the removal of the one token that expires. *Confidence*: 0.6 — because I know the feature exists in `vsce`'s command line but have not read it, and Azure account changes are where a surprise would hide. *If wrong*: if the research finds it needs paid Azure resources or tenant-wide permissions, this flips to B.

**ANS:** (by Jérémie Lumbroso)
Yes, okay let's research this, Option A.

---

### QST-OVSX-GATE: Should every release still wait for an approval before it reaches Open VSX, and should it reach Open VSX twice?
- Status: answered
- Why asking: Today every release reaches Open VSX **twice, by design**: `just publish` uploads with the classic token (`OVSX_PAT`), and then `release.yml` dispatches `publish-open-vsx.yml`, which waits for your approval in the `open-vsx` environment and could only fail as a duplicate. At 0.2.0 and 0.2.1 that waiting run was cancelled by hand. The approval gate does two real things: the registration on open-vsx.org trusts whoever can run the workflow file, so a reviewer stands between a run and the registry, and a gate stops a duplicate upload. It does **not** keep the publish "a human act": that rule was never yours (it came from a founding brief, and the wording is being corrected). The workflow's real upload, with the short-lived token, has never run for a real new version; only the token exchange was rehearsed.
- Need: pick a letter (or override: any shape answers)

Options:
- **A — stop the automatic dispatch now, keep the workflow for later**: `release.yml` no longer starts `publish-open-vsx.yml`. The workflow stays, run by hand with `gh workflow run` only when we want to try or use it. `just publish` keeps using `OVSX_PAT`. No more cancelled runs; nothing else changes.
- **B — make trusted publishing the only Open VSX route, with the gate**: revoke `OVSX_PAT`, remove the Open VSX step from `just publish`, and let the tag trigger the workflow, which waits for your approval each release. One route, one click per release. This needs one real release to prove the upload first.
- **C — same as B, without the approval**: the tag triggers the workflow and it publishes by itself. Fastest, and anyone who can push a tag to the repository (today only you and the seats working with your login) can publish to Open VSX.
- **D — C with guardrails, and one command for the rest (the most automated)**: a pushed `vX.Y.Z` tag makes CI build, test, create the GitHub Release and publish to Open VSX with the short-lived token, with no approval click. The guardrails replace the click: only you can create `v*` tags (a repository tag ruleset), the `open-vsx` environment accepts only `v*` tags, and the workflow refuses a tag whose commit is not on `main` with green CI. `just publish` becomes Marketplace-only and **skips Open VSX when that version is already live**, so there is no duplicate and nothing to cancel. A new `just release X.Y.Z` does bump check, tag, push and the Marketplace step in one command that a seat can run. While the first real upload is unproven, keep `OVSX_PAT` as a fallback; revoke it after one success. The Marketplace still needs its token on the machine that runs the command until Microsoft's trusted publishing works (ADR-0012's research note), then it joins CI too.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-14, **revised the same day after Jérémie asked for "the most automated thing that burdens human and model the least"; this walks back my earlier lean to A**)

**D — C with guardrails, and one command for the rest.** *Rationale*: the approval click costs a person attention every release and buys little once the guardrails exist (the registration pins workflow, repository and environment; a tag ruleset and an environment restricted to `v*` tags limit who can reach the registry; the CI-green-on-main check stops a bad commit). The per-release burden becomes: the human decides, a seat runs `just release X.Y.Z`, and the model needs one command instead of tag, publish, cancel and remember. Making `just publish` skip an already-live Open VSX version removes the double upload without the cancellation ritual. My earlier A only removed the cancellation and kept the click. *Confidence*: 0.65 — because the guardrails are standard but the upload with the short-lived token has never run for a real version, so the first release through D should be watched and `OVSX_PAT` kept as a fallback until it passes. *If wrong*: if the first real trusted upload fails in a way that is not quickly fixed, this falls back to A (manual workflow, token route) until it works; if you would rather keep a person in the loop for the irreversible step, it becomes B.

**ANS:** (by Jérémie Lumbroso)
Excellent recommendation, thanks for this hard prep and research work: Please, Option D. Additionally, the idempotence of `just release` is really clever — it would be nice if you documented the full process in this ADR. The general idea of trying to make tools as idempotent as possible is really strong and appeals to me. That also connect to the naming review's point about choosing action verbs themselves that are semantically idempotent, rather than indicate a state toggle.

---

## Supporting Materials

### DOC: Publishing to the Marketplace without a stored token (research for QST-MS-OIDC, 2026-10-13)

Jérémie answered A (research first). Nothing in Azure or on the Marketplace was changed. Each line has its basis: **Ran** (I ran it here), **Read** (I read it today), **Reported** (a dated statement by someone else, not verified by me).

- **The deadline.** Microsoft's publishing page says "On December 1, 2026, global Personal Access Tokens (PATs) in Azure DevOps are retired" and tells publishers to use Microsoft Entra ID instead (**Read**: `microsoft/vscode-docs`, `api/working-with-extensions/publishing-extension.md`). That is about seven weeks from now, and `VSCE_PAT` in `.env` is that kind of credential. I do not know whether the token Jérémie minted is "global" in Microsoft's sense (it depends on whether it was created for all accessible organizations); the retirement notice linked from that page says how to tell.
- **Route 1, GitHub OIDC straight to the Marketplace (what we would want).** `@vscode/vsce` 4.0.0 has `vsce publish --oidc`: it asks GitHub Actions for a token with audience `marketplace.visualstudio.com` and exchanges it at `POST /_apis/gallery/token` (**Read**: `node_modules/@vscode/vsce/out/oidc.js`). **But the backend is not ready**: the vsce maintainer wrote on 2026-10-05 that "`--oidc` is not yet fully supported by the marketplace backend. It will be soon" (**Reported**: `microsoft/vscode-vsce` issue 1275); on 2026-10-08 a user reported the endpoint still answers `TrustedPublishingNotSupportedException`; on 2026-10-12 a Marketplace team member was reported as confirming they are working on trusted publishing from GitHub Actions, configured on `marketplace.visualstudio.com`, with no PAT, and no timeline or deadline extension had been given (**Reported**: issue 1275 and `microsoft/vsmarketplace` issue 2121). There is no page to register a trusted publisher yet. I did not probe the endpoint myself.
- **Route 2, Microsoft Entra with a managed identity (documented, works today, heavy).** Microsoft's steps (**Read**): a service connection of type "Azure Resource Manager, Workload Identity Federation (manual)" in an Azure DevOps project; a user-assigned managed identity in an Azure subscription with the Reader role; a federated credential linking the two; reading the identity's resource ID through the Azure CLI; adding that identity as a **Contributor member of the publisher**; then `vsce publish --azure-credential` inside an Azure Pipelines `AzureCLI@2` task. This is written for Azure Pipelines. I did not find documentation for running it from GitHub Actions, and one third-party article I found says that path is "realistically difficult" for personal accounts (**Reported**, not verified). It needs an Azure subscription, which may cost money and is yours to create.
- **What I would do.** Wait for Route 1, which is clearly what Microsoft is building and would make the Marketplace work exactly like Open VSX does now. Watch the two issues named above. Set a decision date: **2026-11-15**. If Route 1 is not live by then, try Route 2 with you at the keyboard for the Azure parts, because the PAT stops on 2026-12-01 and we would not want to discover that on the day of a release.
- **What this does not change today.** `just publish` with `VSCE_PAT` works until the retirement (I just used it).

---

## Decision

### Context

porthole's first release used a classic Open VSX token. Trusted publishing is available and replaces it for later releases.

### Chosen on 2026-10-13: a separate publish workflow with an approval gate

*(Superseded in part on 2026-10-14 by the decision below, which removes the approval and the double upload. The registration, the workflow file and the environment from this section stay.)*

- `.github/workflows/publish-open-vsx.yml` publishes the **`.vsix` attached to a GitHub Release** (downloaded by tag), using `ovsx publish --trusted-publishing`. What is attached is what goes live; the earlier release notes had to say the two were separately built.
- The job runs in a GitHub **environment named `open-vsx` that requires Jérémie's approval** (created 2026-10-13, required reviewer `jlumbroso`). The publish is therefore still his act: one click in GitHub, and no secret stored. *(Correction, 2026-10-14: "his act" echoed a rule from the release seat's founding brief, "publishing is Jérémie's act, by his hand", which Jérémie never held and which was made up when the brief was written. What the gate really does is stand a reviewer between the workflow and the registry, and stop a duplicate; whether it stays is QST-OVSX-GATE.)*
- `release.yml` dispatches the publish workflow after it creates a Release. The publish then waits for the approval.
- The registration on open-vsx.org names this workflow file and pins the environment: owner `jlumbroso`, repository `porthole`, workflow `publish-open-vsx.yml`, environment `open-vsx`. **Jérémie creates it** (it needs his Open VSX session).
- Not done: the VS Code Marketplace (no OIDC route in use; `just publish` keeps the token), and revoking `OVSX_PAT` (see QST-OVSX-PAT).

**Rationale**: the registry says a registration is trust in "this workflow file, run by anyone who can run it", so the file is protected by the approval gate and by being a separate, single-purpose file that is easy to review.

**Trade-offs accepted**: a second workflow to maintain; renaming it breaks publishing until the registration is redone; the Marketplace still needs its token.

### Decided 2026-10-14 (QST-OVSX-GATE, Jérémie chose D): a tag releases, and every step can be re-run

Jérémie: "Please, Option D", and he asked that the full process, and the idea behind it, be documented here. He also tied it to the naming review's rule in [ADR-0017](0017-words-for-the-model-facing-surface.md) that model-facing verbs *assert states, never deltas* (`pin`/`unpin`, not `toggle-pin`), because a destination is idempotent and auditable and a retried script cannot get it wrong.

**What changes.**
- A pushed `vX.Y.Z` tag makes CI build, test, create the GitHub Release with the `.vsix`, and publish **that same file** to Open VSX with the short-lived token. **No approval click.**
- The guardrails that replace the click (each is a setting on the GitHub repository; all are listed to Jérémie before they are changed):
  1. a **tag ruleset** so that only the repository owner can create `v*` tags, and so that nobody can **move or delete** one (this makes "never move a tag" a rule of the repository, not a habit);
  2. the `open-vsx` environment **without reviewers** but restricted to **`v*` tags**;
  3. the workflow refuses a tag whose commit is **not on `main`** or whose commit has **no green CI run**.
- `just publish` becomes Marketplace-only, and the double upload (and the cancelled waiting run) ends. `just release X.Y.Z` runs the whole process and is **idempotent**. `OVSX_PAT` stays as a fallback until one real release has gone through this route, then QST-OVSX-PAT's conditional answer applies (revoke).
- The Marketplace step still runs where the token is (any seat, `.env`) until Microsoft's trusted publishing works (see the research note above), then it moves into CI and a tag does everything.

#### The release process

**The principle: a verb that asserts a destination.** `just release 0.2.2` means "0.2.2 is released everywhere", not "do the next thing". Each step has an **observable post-condition read from the world** (GitHub, the two registries), never from a local file or memory. The command reads each post-condition *before* acting, skips the step if it already holds, acts if not, then reads it again. So a re-run after any failure resumes at the first step that is not done, and running it twice, or from two machines, does no harm. There are no toggles and no "undo" steps; a state is only ever moved forward.

**Order.** Cheapest and most reversible first, the two registries (which cannot be undone) last, so a failure stops before the irreversible part wherever possible:

| # | Step | Done when (read before and after) | Acts by | If it is already done | If it cannot be done |
| --- | --- | --- | --- | --- | --- |
| 0 | **Preconditions** (read-only; failing here **stops**, never "skips") | `package.json` says `X.Y.Z`; `CHANGELOG.md` has `## [X.Y.Z] - date` (hyphen); no uncommitted changes outside `docs/`; HEAD is on `main` and pushed; CI is green for HEAD; `scripts/scan-secrets.mjs` is clean | nothing | n/a | stop with the reason |
| 1 | **Tag** | the remote has `vX.Y.Z` and it points at the commit being released | `git tag -a` and push | skip | **stop** if the tag exists on a *different* commit: a tag is never moved (0.1.0's tag was moved once, only because nobody had used it yet; the ruleset now forbids it) |
| 2 | **CI builds the Release** | a GitHub Release `vX.Y.Z` exists **and** carries `porthole-X.Y.Z.vsix` | the tag push starts `release.yml`; the command waits for the run | skip | read the failed run's log, fix the workflow, re-run the failed run (`gh run rerun`); do not move the tag |
| 3 | **Open VSX** | the Open VSX API shows version `X.Y.Z` | the workflow publishes the Release's `.vsix` with the OIDC token | skip | during the first real release only: publish that same `.vsix` with `OVSX_PAT` as the fallback, then keep the workflow's failure as the thing to fix |
| 4 | **Marketplace** | `vsce show` shows version `X.Y.Z` | download the **Release's** `.vsix` and `vsce publish --packagePath` with `VSCE_PAT` | skip | stop; the usual causes are an invalid or expired token (`vsce verify-pat`) |
| 5 | **Verify** | both registries show `X.Y.Z` | polls both for a few minutes | n/a | reports which is still missing; **lag is not failure** |

**Rules that came out of what went wrong, so far:**
1. **"The tag exists" does not mean "released."** At 0.1.0 the tag existed while the release job had failed on a clean checkout (`ENOTDIR` on `releases/`). Each step therefore checks its own result, not the previous step's.
2. **Registry lag is real.** Both registries showed the old version for about 15 minutes after the 0.2.0 publish, and Open VSX validates a new upload before showing it. A re-run right after a successful publish may *read* "not live" and try again; the registry then answers "already published". **That answer counts as done**, after one more read of the registry, and not as a failure.
3. **One file for both registries.** The `.vsix` attached to the Release (built by CI from the tag) is the file both registries receive, so "what is attached is what is live" is true byte for byte. At 0.1.0 the file published and the file attached were separately built.
4. **Dry run.** `just release X.Y.Z --dry-run`, and the read-only `just release-status X.Y.Z`, print the table above for that version (each step's current state and what would be done) and change nothing. The irreversible steps are the only ones worth a look before running.
5. **Same words for people and models.** `release` asserts a destination and `release-status` reports one, matching ADR-0017's rule for the model-facing surface. A seat, a script and Jérémie all run the same one line.

**How the process itself is tested** (Fourth Directive, real scenarios only): the logic lives in a script with the state reader injected, so tests feed it recorded situations: a tag that points at another commit (must stop); the 0.1.0 case (tag present, Release missing: must wait for CI, not claim done); the registry-lag case (registry says "not live", then "already published": must end as done); everything already done (must act on nothing); and the Marketplace failing after Open VSX succeeded (a re-run must resume at the Marketplace only).

**Not decided here.** What `just release` does about the version bump itself: it only *checks* that `package.json` and the changelog already agree, so the human or the seat that decides a release edits them, and the command never edits the changelog.

---

#### The GitHub settings, as commands (not yet applied; each is listed here before it is changed)

Two rulesets and one environment change. They are repository settings, so they are proposed to Jérémie with their exact commands; each can be undone in Settings, Rules and Environments.

1. **Only the owner can create a `v*` tag** (a ruleset that restricts creation, with the repository admin role allowed to bypass, so Jérémie's login and the seats using it can still tag):
   `gh api -X POST repos/jlumbroso/porthole/rulesets` with `{"name":"release tags: only an admin creates","target":"tag","enforcement":"active","conditions":{"ref_name":{"include":["refs/tags/v*"],"exclude":[]}},"bypass_actors":[{"actor_id":5,"actor_type":"RepositoryRole","bypass_mode":"always"}],"rules":[{"type":"creation"}]}`
2. **Nobody can move or delete a `v*` tag, administrators included** (a second ruleset, because a bypass list applies to every rule in a ruleset, and one ruleset could not forbid moves for admins while allowing creation): `{"name":"release tags: never moved or deleted","target":"tag","enforcement":"active","conditions":{"ref_name":{"include":["refs/tags/v*"],"exclude":[]}},"bypass_actors":[],"rules":[{"type":"update"},{"type":"deletion"}]}`. The way out is deliberate: remove or disable this ruleset in Settings, Rules (an admin act on purpose, not an accident).
3. **The `open-vsx` environment: no reviewers, `v*` tags only.** `gh api -X PUT repos/jlumbroso/porthole/environments/open-vsx` with `{"reviewers":[],"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}`, then `gh api -X POST repos/jlumbroso/porthole/environments/open-vsx/deployment-branch-policies` with `{"name":"v*","type":"tag"}`. A run dispatched on `main` is then refused by the environment, so the registry can only be reached from a tag.

One consequence to know: the rehearsal command in this ADR (`--ref main`) stops working after step 3; a rehearsal is `--ref vX.Y.Z` from then on, against a tag that exists.

### Rehearsal result (2026-10-13, run 38350586673, approved by Jérémie)

**Ran.** The job passed every step up to the publish, where `ovsx publish --trusted-publishing` printed `Trusted publishing token issued for jlumbroso.porthole, expires at <five minutes later>` and then `Extension jlumbroso.porthole 0.1.0 is already published`. That is the outcome the rehearsal predicted: the registration matched, the OIDC claims (repository, workflow file and the `open-vsx` environment) were accepted, and the registry issued a five-minute token scoped to this extension. **What it did not test**: the upload itself with that token, because the version already existed. That is proven by the first real release.

**On QST-OVSX-PAT** (Jérémie's condition was "if trusted publishing works flawlessly"): the exchange worked flawlessly; the upload is untested. My recommendation is to revoke the classic token after the first real release goes through the workflow, not before: the interim exposure is a token that is no more exposed than it was yesterday, and a failed first release with no fallback is a worse day than one more week of an existing token.

### How it is rehearsed without a new version

0.1.0 is already on Open VSX, so a publish of it must fail, but the token exchange happens first. Running `gh workflow run publish-open-vsx.yml --ref main -f tag=v0.1.0` after the registration exists, and approving it, should end with the exchange succeeding and the upload refused because the version already exists. That proves the registration and the OIDC claims. The first real publish through it would be the next version.

---

## Action Items

- [x] Workflow `publish-open-vsx.yml`, dispatch from `release.yml`, environment `open-vsx` with Jérémie as required reviewer - Owner: Purser (done 2026-10-13)
- [x] Register the trusted publisher at open-vsx.org (Settings, Trusted Publishers, namespace `jlumbroso`, GitHub Actions: owner `jlumbroso`, repository `porthole`, workflow `publish-open-vsx.yml`, environment `open-vsx`) - Owner: Jérémie (done 2026-10-13)
- [x] Rehearse with `gh workflow run publish-open-vsx.yml --ref main -f tag=v0.1.0`, approve it, and read the log - Owner: Purser starts it, Jérémie approves (done 2026-10-13, run 38350586673; result below)
- [x] Build `scripts/release.mjs` (state reader injected; the five steps; `--dry-run`) with tests, and the recipes `just release X.Y.Z` and `just release-status X.Y.Z` (`just publish` is now an alias) - Owner: Purser (done 2026-10-19, commit `2c43214`; 12 tests; `just release-status 0.4.0` reads that real release as fully done)
- [ ] Apply the GitHub settings listed under "The GitHub settings, as commands" below (two tag rulesets; the `open-vsx` environment without reviewers and restricted to `v*` tags) - Owner: Purser, **waiting for Jérémie's go**, since they change the repository's protections
- [x] Change the workflows: `publish-open-vsx.yml` refuses a commit not on `main` or without green tests, treats a live version as done, and no longer depends on an approval; `release.yml` still dispatches it - Owner: Purser (done 2026-10-19, same commit). **Until the GitHub settings below are applied, the `open-vsx` environment still requires a reviewer, so a dispatched run waits.**
- [ ] The first real release through this route proves the upload, with `OVSX_PAT` kept as the fallback; then QST-OVSX-PAT's conditional answer applies (revoke) - Owner: Purser and Jérémie
- [ ] Watch `microsoft/vscode-vsce#1275` and `microsoft/vsmarketplace#2121` for Marketplace trusted publishing; **decide by 2026-11-15** whether to try the Entra route; the PAT is retired on 2026-12-01 - Owner: Purser to watch, Jérémie to decide
- [ ] Update `docs/release/RELEASE-PLAN.md` and the feedback for Lintel with what the rehearsal showed - Owner: Purser

---

## Iterations

### Iteration 5 (2026-10-19)
- Trigger: Glazier asked for option D before 0.4.1.
- Contributors: Purser 5.5 (Claude Sonnet 5.5).
- Changes: `scripts/release.mjs`, its tests, `just release` and `just release-status`, and the workflow changes built; the GitHub settings written out as commands and left for Jérémie's go.
- Outcome: unchanged (Partially Implemented); the settings and the first real release are what remain.

### Iteration 4 (2026-10-14)
- Trigger: Jérémie answered QST-OVSX-GATE with D and asked that the idempotent release process be documented here.
- Contributors: Purser 5.5 (Claude Sonnet 5.5); Jérémie Lumbroso.
- Changes: Decision section gains "Decided 2026-10-14" with the guardrails, the process table, the rules learned from 0.1.0 and 0.2.0, and the test plan; action items replanned; status of QST-OVSX-GATE answered.
- Outcome: unchanged (Partially Implemented); the build is the next work.

### Iteration 3 (2026-10-14)
- Trigger: Glazier's brief (the founding-brief rule left in the CI comments and in this ADR), at Jérémie's request.
- Contributors: Purser 5.5 (Claude Sonnet 5.5).
- Changes: the "his act" wording corrected by provenance here and in both workflows' headers; QST-OVSX-GATE added.
- Outcome: unchanged (Partially Implemented).

### Iteration 2 (2026-10-13)
- Trigger: Jérémie registered the trusted publisher and approved the rehearsal; he answered both questions.
- Contributors: Purser 5.5 (Claude Sonnet 5.5); Jérémie Lumbroso.
- Changes: rehearsal result recorded (token issued, duplicate refused); the Marketplace research note written.
- Outcome: Draft → Partially Implemented.

### Iteration 1 (2026-10-13)
- Trigger: Jérémie's request to set up trusted publishing, after the first publish.
- Contributors: Purser 5.5 (Claude Sonnet 5.5).
- Changes: first draft; workflow and environment created; two questions opened.
- Outcome: Draft until the registration exists and the rehearsal passes.

---

## Links

- Related ADRs: [ADR-0017](0017-words-for-the-model-facing-surface.md) (verbs assert states), [ADR-0011](0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md) (the first release), [ADR-0009](0009-ship-as-a-personal-vsix.md) (the decision to publish)
- Related code: `.github/workflows/publish-open-vsx.yml`, `.github/workflows/release.yml`
- External: [Open VSX Trusted Publishing](https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing)
