---
name: extension-marketplace-publishing
description: >-
  Use when publishing, republishing, or rotating credentials for this VS Code
  extension on the VS Code Marketplace (vsce) and/or Open VSX (ovsx) — minting
  or scoping a PAT, verifying package contents before a publish, interpreting
  a `vsce`/`ovsx` error, or handling a leaked/revoked credential. Triggers on
  "vsce publish", "ovsx publish", "Marketplace", "Open VSX", "PAT", "personal
  access token", "verify-pat", ".vscodeignore". Does NOT cover npm package
  publishing, GitHub Releases, or the MCP server's own distribution — those
  are different credentials and different failure classes.
---
<!-- skill version: "extension-marketplace-publishing 1.0.0" — assembled 2026-10-13
     from ADR-0042 (first publish, Open VSX launch) and ADR-0045 (the leak,
     the rotation). Every lesson here cost a real incident; none is
     hypothetical. Bump deliberately with a note below on what changed. -->

# Extension Marketplace Publishing

**Authors:** Lintel 5 (Claude Sonnet 5) and Jérémie Lumbroso
**Created:** 2026-10-13, at Jérémie's direct request after rotating a leaked Azure DevOps PAT

---

## When to Use This Skill

**Trigger this skill when:**
- About to run `vsce publish`, `vsce package`, `vsce show`, `ovsx publish`, or `ovsx verify-pat`
- Minting, scoping, or rotating a Marketplace/Open VSX personal access token
- A `vsce`/`ovsx` command fails and the error isn't self-explanatory
- Reviewing whether `.vscodeignore` is still accurate before a release
- A credential tied to either registry is suspected or confirmed leaked

**Key concepts this skill provides:**
- The two registries are genuinely separate systems with separate credentials, separate failure modes, and no shared staging tier
- `.vscodeignore` never falls back to `.gitignore` — every excluded-from-git directory needs its own line, or it ships
- A credential's safety depends on *where it can be typed*, not just where it's stored

---

## I. The two registries, side by side

| | VS Code Marketplace | Open VSX |
|---|---|---|
| CLI | `vsce` (`@vscode/vsce`) | `ovsx` |
| Account | Microsoft/Azure DevOps | Eclipse Foundation |
| Credential | Azure DevOps PAT | Classic access token, *or* Trusted Publishing (OIDC, no secret) |
| Env var (this repo) | `VSCE_PAT` | `OVSX_PAT` |
| Verify command | `vsce verify-pat <publisher>` | `ovsx verify-pat <namespace> -p "$OVSX_PAT"` |
| Reach | Cursor, VS Code proper | Cursor, Windsurf, VSCodium, Gitpod, Theia |

**Why this matters:** publishing to one does nothing for the other. Every release that's meant to reach both needs both commands run, both verified independently — don't infer one succeeded from the other.

**How to apply:** after any publish you intend to ship to both, confirm each with its own `show`/API check (§III) before telling anyone it's live.

---

## II. Minting or rotating a PAT

### Azure DevOps (VS Code Marketplace)

1. **`https://dev.azure.com/<org>` — never `portal.azure.com`.** These are different Microsoft products. Trying to mint a Marketplace PAT from the Azure Portal produces `AADSTS50020`, which reads like an auth/subscription problem but is actually "wrong product" (ADR-0042 iter-3, the first time this cost real time).
2. User Settings → **Personal Access Tokens** → **+ New Token**.
3. **Name it dated: `<purpose>-YYYY-MM`.** Jérémie's own insight (ADR-0045, forwarded crew-wide): a dated name turns "is this due for rotation?" from a *stateful* question (recall when it was minted) into a *stateless* one (read the date). Same move as an oil-change sticker.
4. **Scope: Marketplace only — but it has four sub-scopes** (Read, Acquire, Publish, Manage; behind "Show more scopes" in the UI), not one toggle. `vsce publish/package/show/verify-pat` have been run against all four in this project's real usage; **never** grant Identity or Packaging scope for this purpose — those were minted once by mistake (ADR-0042 iter-5), flagged as excessive, and the lesson held.
5. Set a **bounded expiration** (90 days is what this project settled on) once rotation has a walked path — an indefinite PAT is exactly what sat exposed for two months before ADR-0045's incident.
6. Copy the value **once**, immediately. See §IV before it goes anywhere.

### Open VSX

1. `https://open-vsx.org` → sign in → profile icon → **Settings → Access Tokens**.
2. Generate a classic token, named with today's date (same reasoning as above).
3. **Trusted Publishing exists as an alternative** (OIDC via GitHub Actions — no long-lived secret at all; binds namespace + publisher + repo + `.github/workflows/<file>.yml`). As of this skill's writing, this repo has explored it but has **no workflow wired to use it** — `release.yml` only builds and attaches a VSIX to a GitHub Release, it doesn't publish anywhere. **Don't assume Trusted Publishing is live just because someone started the setup** — verify with `ovsx verify-pat` against the classic token, which is what's actually authenticating publishes today.

---

## III. Before every publish — verify, don't assume

**Never publish on memory of what `.vscodeignore` excludes.** Run the real command and read its output:

```bash
npx vsce ls   # exactly what ships — read every line
```

**Why this matters, concretely:** this project has shipped (caught pre-publish, not by a user report) a leaked `coverage/` HTML report, dev-config files (`tsconfig.integration.json`, `.vscode-test.mjs`) from unrelated harness work, and internal crew tooling (`justfile`, `kintsugi.*`, `.pneumatic/**`) — each time because `.vscodeignore` had drifted from what the repo actually contains. **`.vscodeignore` does not fall back to `.gitignore` once it exists** — a directory being gitignored (never committed) does *not* mean `vsce` will skip it; it has to be named again, explicitly, in `.vscodeignore`. The one standing exception in this project: `dist/` is gitignored *and* explicitly un-ignored (`!dist/**`) because it's the actual compiled output that must ship.

**Credentials loading check, before the real command:**
```bash
set -a && source .env && set +a
npx vsce verify-pat <publisher>              # confirms the token, not just its presence
npx ovsx verify-pat <namespace> -p "$OVSX_PAT"
```
A `vsce verify-pat` failure that cites an anonymous all-`a` GUID means *no token loaded*, not necessarily a bad token — check the shell environment before assuming the credential itself is broken.

---

## IV. Where a credential value is allowed to exist

**Never:** a chat message, a draft/answer box inside this extension's own UI, any file this project's tooling might commit (ADR-0045's entire incident was exactly this — a PAT typed into an ADR answer draft, autosaved by the draft-persistence feature into a *committed* `.working/` file, exposed when the repo briefly went public).

**Always:** paste directly into `.env` (gitignored, confirmed via `git check-ignore -v .env`) with a plain editor, sourced into the shell only at publish time. If guiding a human through rotation, build the walkthrough so the value never has to be typed anywhere you'd see it — see the Pharoscan pattern in `docs/adr/0045-azure-pat-exposure-via-committed-working-drafts.md` for a concrete instance (`scripts/ephemeral/2026-10-12-pat-refresh-pharoscan.html`).

**Still open, not yet done:** OS-keychain storage (named as the real fix since ADR-0042 iter-4, never executed) would remove the `.env`-file step entirely. Check `docs/adr/0042-marketplace-release-runbook.md` §1 and `docs/adr/0045-...md`'s `QST-KEYCHAIN-MIGRATION` for current status before assuming it's done.

---

## V. Publishing mechanics — what actually happens

1. **No staging tier, on either registry.** `vsce publish`/`ovsx publish` go instantly live — no draft, no review queue. A "dry run" must use a fully separate, throwaway extension ID; there is no safe way to "publish quietly and check first" under the real identifier.
2. **Relative links and images in README get rewritten against the `repository` field.** If that repo is private, every relative `[text](path)` or `![alt](path)` 404s for a stranger. Either keep everything absolute-URL (host images externally — this project uses its own public site for exactly this), or make sure the repo really is public before relying on relative paths.
3. **Indexing lag is normal, has two independent forms.** The direct listing page can 404 for a few minutes post-publish even on a real success — `vsce show`/the registry's own API is authoritative, not the webpage. Separately and more slowly: the Marketplace's *search* API can return zero results for a new extension for hours after a real, confirmed publish — budget for "installable by exact ID immediately, not found by search for a while," and don't treat an empty search result as a failed publish.
4. **`unpublish` doesn't inherit `publish`'s env-var auto-read.** Both `vsce unpublish` and `ovsx unpublish` have been seen needing an explicit `-p <token>` flag where `publish` picked up `VSCE_PAT`/`OVSX_PAT` from the environment automatically. Don't assume symmetry.
5. **The extension identifier is immutable after first publish.** Renaming `publisher.name` means unpublish-and-republish under a new ID — installs, reviews, and update paths do not migrate. Before any rename, check both the old and new ID with `vsce show` to confirm *neither* has ever actually been published.
6. **A version with no matching `CHANGELOG.md` entry should fail loud, not ship quiet.** This project's own `release.yml` hard-fails the release job if the pushed tag's version has no `## [X.Y.Z] - YYYY-MM-DD` heading in `CHANGELOG.md` — treat a missing entry as a blocker to fix, not a formality to skip.

---

## Decision Framework

**Before publishing:**
1. Did I run `vsce ls` and actually read the output, or am I trusting `.vscodeignore` from memory?
2. Does the version bump have a matching `CHANGELOG.md` entry?
3. Am I publishing to both registries, or just the one I'm thinking about? (They don't share state.)

**Before minting/rotating a credential:**
1. Does the scope match what's actually used (§II), or am I about to over-grant out of caution?
2. Is the name dated?
3. Where is the raw value about to be typed — and is that list exactly `{.env}`?

**After a suspected leak:**
1. Where, specifically, did it end up committed? (Don't assume `.env` — check every tracked file a free-text field could have autosaved into.)
2. Is the credential already dead (revoked)? If so, redaction of the current tracked files is a record-keeping act, not a security one — and this project's standing rule is to **never rewrite git history** to chase a dead secret (ADR-0045).
3. Rotate on both registries if there's any ambiguity about which credential was exposed — cheap insurance, not overreaction.

---

## Quick Reference

| Scenario | Action |
|---|---|
| `AADSTS50020` minting a PAT | Wrong product — use `dev.azure.com`, not `portal.azure.com` |
| `vsce verify-pat` fails with an all-`a` GUID | No token loaded in shell — check sourcing, not the token itself |
| Direct listing page 404s right after publish | CDN lag — trust `vsce show`/API, not the webpage |
| New extension doesn't show in Marketplace search | Separate, slower indexing cycle — not a failed publish |
| README image/link 404s for a stranger | Relative path rewritten against a private `repository` field — host externally or go public |
| `unpublish` ignores the env var that `publish` read fine | Pass `-p <token>` explicitly |
| A directory is gitignored but shows up in `vsce ls` | `.vscodeignore` needs its own line — gitignore status doesn't transfer |

---

## Meta-Note: This Skill's Structure

- **Hierarchical:** registries → credentials → pre-publish verification → storage discipline → publish mechanics, each independently readable.
- **Every claim here traces to a real incident**, not a hypothetical — ADR-0042 (first publish, Open VSX launch) and ADR-0045 (the leak, the rotation) are the receipts.
- **Size:** ~140 lines. **Purpose:** stop this project from re-paying the same specific costs twice.

---

*Living document — update when the next incident teaches something this version doesn't cover yet. Don't re-stamp past lessons when a new one arrives; add beside them.*
