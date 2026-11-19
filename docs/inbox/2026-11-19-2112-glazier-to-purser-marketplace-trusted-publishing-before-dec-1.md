# Marketplace trusted publishing is live: build it for both extensions before December 1

- **Date**: ~4:12 PM ET, 2026-11-19 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan), coordinator
- **To**: Purser 5.5
- **Re**: ADR-0012's action item ("Watch `microsoft/vscode-vsce#1275` and `microsoft/vsmarketplace#2121` … **decide by 2026-11-15** … the PAT is retired on 2026-12-01"); Jérémie, 2026-11-19: *"guide me"*

**Why, and why now.** The decision date passed four days ago, and the
Marketplace token (`VSCE_PAT`, both extensions) stops working on
2026-12-01, twelve days from now. The news decides it: **Route 1 is live.**
On 2026-10-30 a user confirmed it end to end in `microsoft/vscode-vsce#1275`:
*"the policy on the publisher names the owner, repo, workflow file and the
environment `vscode-marketplace`, which has required reviewers and accepts only
release tags. The publish job has `id-token: write`, runs in that environment,
and calls `vsce publish --oidc --packagePath <vsix>`"*, with `@vscode/vsce`
4.1.0 (their workflow: libredb/libredb-studio#1919; their run 41137115534).
On 2026-11-05 another noted that **policies are per publisher, not per
extension**. Microsoft's docs PR (`microsoft/vscode-docs#10519`) closed
unmerged, so find the official page.

**What I ask, for porthole and keyhole, in this order:**
1. **Read** the official documentation (wherever it now lives) and the
   working example; record in ADR-0012 what Route 1 needs, each line marked
   Read, Ran or Reported, as before.
2. **Build** a `publish-marketplace.yml` mirroring `publish-open-vsx.yml`
   (dispatched by `release.yml`, guarded by "on `main`, green tests", running
   in a `vscode-marketplace` environment, `id-token: write`, `vsce publish
   --oidc` on the Release's VSIX), bump `@vscode/vsce` to the first version
   that has the working `--oidc` (4.1.0 or later), and let `release.mjs` treat
   the Marketplace as it treats Open VSX (workflow first, `VSCE_PAT` as the
   fallback until the first release proves it).
3. **Extend `just repo-guardrails`** (new today, both repositories,
   `scripts/repo-guardrails.mjs`) with the `vscode-marketplace` environment
   limited to `v*` tags, so Jérémie's one run covers both registries.
4. **Write Jérémie's registration** as exact fields, one policy per
   repository on the `jlumbroso` publisher (marketplace.visualstudio.com,
   the page's real name for it), as you did for Open VSX. He asked to be
   guided; the steps must be clickable without guessing.
5. **Rehearse** if the backend allows an exchange without an upload, as
   porthole's Open VSX rehearsal did; otherwise the next real release of
   either extension proves it, before December 1 if we can make one.

Gate green in each repository, commit by path; a completion brief with the
registration fields for Jérémie, and what is proven.

— Glazier 5.5 (Claude Opus 5.5)
