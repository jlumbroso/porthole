<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Publish to Open VSX through trusted publishing, with the Marketplace token kept for now

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
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
- Status: unanswered
- Why asking: the point of trusted publishing is that no long-lived token exists. As long as `OVSX_PAT` stays valid in `.env`, a stolen copy of it can still publish to Open VSX. `just publish` (the local recipe) also still uses it for the Open VSX step today. The token only becomes safe to revoke once a publish has gone through the new route, which is not true yet.
- Need: pick a letter (or override: any shape answers)

Options:
- **A — revoke it after one successful trusted publish**: once a real release (or the rehearsal below) has been published by the workflow, delete the token at open-vsx.org (Settings, Access Tokens), remove `OVSX_PAT` from `.env`, and change `just publish` so it publishes only to the Marketplace. Nothing can publish to Open VSX except the approved workflow.
- **B — keep it as a fallback**: leave the token and the local Open VSX step in place in case the workflow breaks. Publishing to Open VSX keeps working from your machine, and the long-lived token stays exposed.
- **C — keep it for now, decide after two releases**: the same as B for a while, with a dated reminder to choose.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — revoke after one successful trusted publish.** *Rationale*: the token exists only because the first version had to be published the old way; its value is a single publish capability that the approved workflow now has. A fallback that is also an attack surface is worse than one more manual step if the workflow breaks (a token can be minted again in a minute). *Confidence*: 0.7 — because the argument is general and the workflow is not yet proven, so I have not seen the failure mode I am trading against. *If wrong*: if the first trusted publish fails in a way that takes more than a day to fix, this flips to B until it works.

**ANS:** (by [name])
[Fill this in]

---

### QST-MS-OIDC: Should I look into publishing to the VS Code Marketplace without a stored token too?
- Status: unanswered
- Why asking: the Marketplace still needs an Azure DevOps token (`VSCE_PAT`), which expires and is the more sensitive of the two. I believe `vsce` can authenticate with a Microsoft Entra identity (`--azure-credential`), which GitHub's OIDC can feed through a federated credential, but I have not read how, or tried it, and it needs an app registration in your Azure tenant, which is your account to change. I do not know what it would cost to set up or whether the Marketplace accepts such an identity as a publisher.
- Need: pick a letter (or override: any shape answers)

Options:
- **A — research first**: I read vsce's and Microsoft's documentation and write what it would take, with the steps that are yours, without changing anything in Azure. You then decide.
- **B — not now**: keep the token and its rotation by the dated-name rule, and revisit if Microsoft retires personal access tokens for the Marketplace.

**Recommendation**: (by Purser 5.5, Claude Sonnet 5.5, 2026-10-13)

**A — research first.** *Rationale*: a research note costs you nothing and changes nothing; the unknown is large (what the Marketplace accepts) and the benefit is the removal of the one token that expires. *Confidence*: 0.6 — because I know the feature exists in `vsce`'s command line but have not read it, and Azure account changes are where a surprise would hide. *If wrong*: if the research finds it needs paid Azure resources or tenant-wide permissions, this flips to B.

**ANS:** (by [name])
[Fill this in]

---

## Decision

### Context

porthole's first release used a classic Open VSX token. Trusted publishing is available and replaces it for later releases.

### Chosen: a separate publish workflow with an approval gate

- `.github/workflows/publish-open-vsx.yml` publishes the **`.vsix` attached to a GitHub Release** (downloaded by tag), using `ovsx publish --trusted-publishing`. What is attached is what goes live; the earlier release notes had to say the two were separately built.
- The job runs in a GitHub **environment named `open-vsx` that requires Jérémie's approval** (created 2026-10-13, required reviewer `jlumbroso`). The publish is therefore still his act: one click in GitHub, and no secret stored.
- `release.yml` dispatches the publish workflow after it creates a Release. The publish then waits for the approval.
- The registration on open-vsx.org names this workflow file and pins the environment: owner `jlumbroso`, repository `porthole`, workflow `publish-open-vsx.yml`, environment `open-vsx`. **Jérémie creates it** (it needs his Open VSX session).
- Not done: the VS Code Marketplace (no OIDC route in use; `just publish` keeps the token), and revoking `OVSX_PAT` (see QST-OVSX-PAT).

**Rationale**: the registry says a registration is trust in "this workflow file, run by anyone who can run it", so the file is protected by the approval gate and by being a separate, single-purpose file that is easy to review.

**Trade-offs accepted**: a second workflow to maintain; renaming it breaks publishing until the registration is redone; the Marketplace still needs its token.

### How it is rehearsed without a new version

0.1.0 is already on Open VSX, so a publish of it must fail, but the token exchange happens first. Running `gh workflow run publish-open-vsx.yml --ref main -f tag=v0.1.0` after the registration exists, and approving it, should end with the exchange succeeding and the upload refused because the version already exists. That proves the registration and the OIDC claims. The first real publish through it would be the next version.

---

## Action Items

- [x] Workflow `publish-open-vsx.yml`, dispatch from `release.yml`, environment `open-vsx` with Jérémie as required reviewer - Owner: Purser (done 2026-10-13)
- [ ] Register the trusted publisher at open-vsx.org (Settings, Trusted Publishers, namespace `jlumbroso`, GitHub Actions: owner `jlumbroso`, repository `porthole`, workflow `publish-open-vsx.yml`, environment `open-vsx`) - Owner: Jérémie
- [ ] Rehearse with `gh workflow run publish-open-vsx.yml --ref main -f tag=v0.1.0`, approve it, and read the log - Owner: Purser starts it, Jérémie approves
- [ ] Update `just publish` to publish only to the Marketplace once QST-OVSX-PAT is answered A - Owner: Purser
- [ ] Update `docs/release/RELEASE-PLAN.md` and the feedback for Lintel with what the rehearsal showed - Owner: Purser

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie's request to set up trusted publishing, after the first publish.
- Contributors: Purser 5.5 (Claude Sonnet 5.5).
- Changes: first draft; workflow and environment created; two questions opened.
- Outcome: Draft until the registration exists and the rehearsal passes.

---

## Links

- Related ADRs: [ADR-0011](0011-prepare-porthole-s-first-public-release-repo-hygiene-version-floor-terminology-listing.md) (the first release), [ADR-0009](0009-ship-as-a-personal-vsix.md) (the decision to publish)
- Related code: `.github/workflows/publish-open-vsx.yml`, `.github/workflows/release.yml`
- External: [Open VSX Trusted Publishing](https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing)
