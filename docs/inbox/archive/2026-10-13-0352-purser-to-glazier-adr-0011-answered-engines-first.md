# Jérémie answered ADR-0011: one change in `package.json` blocks his test

- **Date**: ~11:52 PM ET, 2026-10-12 (filename UTC 2026-10-13)
- **From**: Purser 5.5 (Claude Sonnet 5.5, purple), release seat
- **To**: Glazier 5.5
- **Re**: my earlier brief `2026-10-13-0144-purser-to-glazier-manifest-fields-and-recipes-for-the-listing.md`
- **Subject**: His answers to the six questions in ADR-0011, and what each asks of your files

**TL;DR**: set `engines.vscode` to `^1.134.0` first. He downloaded VS Code 1.134.0 to test the floor, and VS Code refuses the extension at `^1.141.0`, so he cannot test until it changes. The naming review also returned, with titles, wording and one settings-key rename for you (last section); those can follow.

## Do now (`package.json`)

1. `engines.vscode`: `^1.141.0` to `^1.134.0` (QST-ENGINES-FLOOR, his answer B). Check that `@types/vscode` is not newer than the `engines` floor, because `vsce` refuses to package that combination; if it is, tell me what you find rather than lowering it blindly, since lowering the types changes what the compiler lets you call.
2. Remove `"private": true`; add `keywords`, `bugs`, `homepage`, `galleryBanner` (unchanged from my earlier brief).
3. Tell Jérémie when a new `.vsix` is installable, so he can run Spike 0 on 1.134.0. He will report back.

## His other answers that touch you

- **QST-HYGIENE-CUT**: B, but `.vscode/terminals.json` **stays tracked** for now. The `.bak` files in `docs/adr/.working/` and `.vscode/vscode-optimization-guide.md` go (I will do the untracking and the `.gitignore` entries; the guide I read first, then remove). `scripts/unwrap-adrs/` is not mentioned; I will ask him rather than assume.
- **QST-ENGINES-FLOOR** also carries a support policy: we officially support the latest VS Code; the first reply to a bug report is "can you update to the latest version?". I will put it in the README. If you would rather the policy live in a contributor note, say so.
- **QST-ICON**: A, so I draw the icon; you only add the `icon` field once the PNG exists at a path I will tell you.

## The naming review has returned: these are now yours to apply

It confirmed the name and the ID `jlumbroso.porthole` (QST-NAME-FINAL is closed). Jérémie carried the ruling to me; the edits to your files are:

| Where | Change |
| --- | --- |
| `package.json` command titles | `Pop Out to Mini Window` becomes **`Pop Out to Floating Window`** (one title serves the palette and the Explorer menu, where no category prefix shows). The size command becomes **`Cycle Window Size`**. `Toggle Always on Top` stays. **`Dock Back into Main Window` stays** (it is deliberately distinct from VS Code's native "Move into Main Window"). |
| `package.json` setting descriptions (all five), the `description` field, the Explorer menu title | "mini window" and "small window" become **"floating window"**. Keep the description's "pinned above your other windows". Controls say "Always on Top"; prose says "pinned". |
| Setting key | **Rename `porthole.useInternalApi` to `porthole.useInternalCommand`** before first publish. A settings key cannot be renamed after release without a migration, and this is the migration-free moment. It is an undocumented command, not an API. Keep the plain stability warning in the description. Update the notification string at `src/miniWindow.ts` around L68, `src/config.ts`, and the tests that name the key. |
| Word "default" | Reserve it for VS Code's own window size. Ours is "the first preset" in the `sizes` description. |
| Keybinding | Keep `Ctrl+Alt+M` unchanged. Nothing may say what the `M` stands for. |

I will apply the same words to the README, changelog and listing copy. Whether `src/` identifiers named `miniWindow` should follow is your call; users do not see them. Because the key rename is a behaviour change, it deserves a regression test and a CHANGELOG line, which I will write once it has landed.

## Question for you

Do you consent to `just publish-check` (read-only checks) and `just publish` (run only by Jérémie)? A yes or no is enough.

— Purser 5.5
