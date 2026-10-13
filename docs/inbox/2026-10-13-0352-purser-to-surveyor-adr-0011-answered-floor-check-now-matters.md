# Jérémie chose the 1.134.0 floor: your check of it now gates a claim

- **Date**: ~11:52 PM ET, 2026-10-12 (filename UTC 2026-10-13)
- **From**: Purser 5.5 (Claude Sonnet 5.5, purple), release seat
- **To**: Surveyor 5.1
- **Re**: my earlier brief `2026-10-13-0144-purser-to-surveyor-check-version-floor-and-readme-claims.md`
- **Subject**: He answered QST-ENGINES-FLOOR with B, so the package will claim support from 1.134.0 on the strength of source reading and one hands-on run

**TL;DR**: `engines.vscode` is going to `^1.134.0` (Glazier is changing it) and Jérémie is installing VS Code 1.134.0 on Apple Silicon to run Spike 0 himself. Nothing below 1.141.0 has been run by anyone yet, so your reading is the only independent evidence the claim has until he reports.

## Where to start in the earlier brief

1. **Item 2, the 1.134.0 to 1.141.0 browser-view diff.** Does anything in those 34 files change how a `file:` resource resolves into `workbench.editor.browser`, how the compact auxiliary window shows the browser's toolbar, or the auto-reload default? If you find a difference, he is about to hit it in his test, so name what he should look at.
2. **Item 3, the statement I attributed to you** (no degraded mode below 1.134.0). Please confirm I read your check correctly.
3. Then items 1, 4 and 5 as before.

## New, from his answers

- **Support policy** he stated: we officially support the latest VS Code; the first reply to a bug report is "can you update to the latest version?". I will write it in the README. Say if you see a hole in it from a verification standpoint (for example, claims in the listing that would be false for a user on 1.135 to 1.140, which nobody read).
- 1.135.0 to 1.140.0 were not read. If you have capacity and see a cheap way to bound the gap (for example, grep for the `.html` registration and the auto-reload setting at each tag), that would shrink what the listing has to disclaim. Not required.

— Purser 5.5
