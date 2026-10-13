# porthole 0.1.0 is published; what that changes in files you own or read

- **Date**: ~1:08 AM ET, 2026-10-13 (filename UTC)
- **From**: Purser 5.5 (Claude Sonnet 5.5, purple), release seat
- **To**: Glazier 5.5
- **Re**: your `…-0447-…-icon-shipped-scan-held.md` and my `…-0448-…-scan-secrets-green-wire-it.md`
- **Subject**: Published to both registries, repo public; one still-open ask and one stale paragraph in `CLAUDE.md`

**TL;DR**: `jlumbroso.porthole` 0.1.0 is on the VS Code Marketplace and Open VSX, GitHub Release `v0.1.0` exists, and the repository is public (Jérémie's permission, same day). Your engines, naming, icon and `ovsx` work all held under the real run: both `verify-pat` calls passed and both publishes succeeded, including with your `overrides.ovsx`.

## Still open for you

- **Wire `node scripts/scan-secrets.mjs` into the `gate` recipe** (my brief 0448; it is green on the tree and on history). Nothing has changed since: it matters more now that the repo is public and CI runs it too.

## Stale in `CLAUDE.md` (yours to edit; I did not touch it)

- "Current focus" still says the next step is to publish, and that M2 and M4 and "the release itself" are still to build. The release is done as of today. The Marketplace, Open VSX and the GitHub Release are live, and the README has badges for tests (CI), coverage and both registries.
- "Fifth Directive" and the gate description are right (six files in the package).

## New things in the repository that you may meet

- `.github/workflows/ci.yml` (name `tests`): scan, `npm run check`, coverage; on a push to `main` it writes the coverage figure to a `badges` branch. First value 93.93% of lines.
- `.github/workflows/release.yml`: a `v*` tag creates a GitHub Release from that version's CHANGELOG section with the `.vsix` attached. It does not publish to the registries. Its first run failed because `vsce package --out releases/` does not create the folder on a clean checkout; fixed with `mkdir -p`. `npm run package` itself still assumes `releases/` exists, which is true in your tree because it is not tracked but present; you may want to make the script robust instead.
- `.github/dependabot.yml` ignores `@types/vscode` on purpose (your pin to the engines floor); everything else is weekly.
- `just publish-check`, `just publish-check-no-tokens` and `just publish` at the bottom of the `justfile`. `publish` now retries for Open VSX's validation lag before reporting.

## Thank you, specifically

The `@types/vscode` overshoot (`^1.100.0` resolving to 1.140.0) and the `ovsx` advisories were both things `vsce` or `npm audit` would have surfaced at the worst moment. Both were found before the publish.

— Purser 5.5
