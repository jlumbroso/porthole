# Porthole

Pop the HTML page you are looking at into a floating window in VS Code:
only the rendered page, pinned above your other windows.

If it is an HTML file and you want it in view while you work (for instance, a page of
task instructions, a checklist, a design mock-up or a local report), porthole puts it in
a window of its own instead of an editor tab that disappears behind whatever you open next.

> **Status: version 0.1.0.** Its author has used it since 2026-10-12.
> It has been used on **macOS with VS Code 1.141.0 and 1.134.0**. Windows and Linux
> are untested. A Marketplace and Open VSX listing is being prepared; until
> then, see [Install](#install).

## What it does

1. **Pops a page out.** One gesture turns an HTML file into a floating window showing
   only the rendered page: no tabs, breadcrumbs or status bar.
2. **Keeps it on top.** The window stays pinned above your other windows. Toggle that off
   and on whenever you like.
3. **Puts it back.** The same shortcut docks the page into your main window again.
4. **Resizes by preset.** Step through your own list of sizes (three by default).
5. **Stays live.** The page reloads when the file changes (VS Code's own
   auto-reload), and its checkboxes, buttons and stored state keep working.

## Using it

| To do this | Do this |
| --- | --- |
| Pop an HTML file out | `Ctrl+Alt+M` (`⌃⌥M` on macOS) with the file open, the window icon in the editor's title bar, or right-click the file in the Explorer → **Pop Out to Floating Window** |
| Put it back | `Ctrl+Alt+M` again, with the floating window focused, or **Porthole: Dock Back into Main Window** |
| Change its size | **Porthole: Cycle Window Size** with the floating window focused |
| Unpin or re-pin it | **Porthole: Toggle Always on Top** |

Settings live under `porthole.*`: the size presets (`porthole.sizes`; the first preset is
the size a new window opens at), where the window opens (`porthole.position`), and whether
it opens compact and always on top (`porthole.compact`, `porthole.alwaysOnTop`).

## Install

Not on the Marketplace yet. Until it is, from a clone of this repository:

```
just install-local
```

then reload the VS Code window. (That builds the extension, packages it, installs the
exact file, and prints what to do next. It needs [`just`](https://just.systems) and Node.)

## Requirements

- VS Code desktop **1.134.0 or later**. That is the first release whose integrated browser
  opens local HTML files, as read in VS Code's source. porthole has been **run** on 1.134.0
  and on 1.141.0; the versions in between were read in VS Code's source but not run
  ([details](docs/release/VERSION-FLOOR.md)).
- Local HTML files (`.html`, `.htm`). Remote and virtual workspaces are out of scope.

**Support.** The latest VS Code release is the one officially supported. If you report a
problem on an older version, the first answer will be "can you update to the latest version?".

## How it works, and what could break

porthole renders nothing itself. VS Code already has an integrated browser, floating
windows, a compact mode with no tabs or status bar, and always-on-top. What was missing
is a single gesture that combines them at a chosen size.

**That gesture is an internal VS Code command, not a documented API.** porthole calls
`_workbench.openWith`, which opens a file in the integrated browser, in a new floating
window, already sized, compact and pinned. VS Code can change or remove it in any update,
without notice.

If that call throws or opens no window, porthole falls back to public commands that do
the same thing: the window still opens, compact and pinned, but at VS Code's own default
size rather than your first preset. The output channel "Porthole" says when the fallback
ran. The setting `porthole.useInternalCommand` turns the internal call off if you would
rather never use it.

What has been checked, so you can weigh it:

- The internal call was traced through VS Code's source, checked independently against
  that source, and then run: on VS Code 1.141.0 it opened the window in five runs out of
  five ([ADR-0003](docs/adr/0003-spike-0-does-the-one-shot-call-hold.md)), and in the 15 pop-outs
  of its first hands-on test it never needed the fallback
  ([ADR-0010](docs/adr/0010-first-hands-on-test-of-porthole-0-1-0.md)).
- Each new VS Code release is a release question. The check to re-run is kept in
  [`spike/`](spike/); until it is re-run on a version, that version is not claimed.

One thing to expect: the floating window keeps its title bar and the integrated browser's own
toolbar. "Only the rendered page" means no tabs, breadcrumbs or status bar.

**Known limits, both VS Code's rather than porthole's** (traced in VS Code's source,
[ADR-0010](docs/adr/0010-first-hands-on-test-of-porthole-0-1-0.md), QST-PASTE):

- **Cmd+V does not paste into a page in the floating window** on macOS: VS Code disables its
  Edit menu while a floating window has focus. Right-click → **Paste** works.
- **Ctrl+A and Ctrl+E** (start and end of line) do nothing in a page's text field, in any
  integrated-browser tab.

## Not here yet

- Popping out a page that is already open in a browser tab (today it starts from the file).
- A trigger from outside VS Code, for example a coding agent opening the task page it has
  just written.

## Try the idea today, with no extension

1. Open an HTML file in the integrated browser.
2. Right-click its tab and choose **Move into New Window**.
3. In the new window's title bar, click the compact icon and the pin icon.

This gives you the experience porthole aims for, minus the one-gesture part and the exact size.

## The name

A porthole is a small, fixed window you look *through*; nothing lives in it. That is the
object this builds: the floating window is the porthole. The pages it shows are often served on localhost ports, which makes
the pun honest.

## How this is built

This project is built by a human and AI collaborators working through written records, so
decisions survive from one session to the next. The whole record is in the repository:
the decisions in [`docs/adr/`](docs/adr/), the briefs the collaborators sent each other in
[`docs/inbox/`](docs/inbox/), the screenshots from the first test under
[`docs/adr/attachments/`](docs/adr/attachments/).

| To do this | Use |
| --- | --- |
| Check the repo before committing | `just gate` |
| Try the extension without installing it | press F5, **Run Porthole** |
| Install it into your VS Code | `just install-local`, then reload the window |
| Record a decision or open a question | `just adr "<title>"` |
| See every recipe | `just` |

- [`CLAUDE.md`](CLAUDE.md) holds the working agreements and the current focus.
- [`docs/inbox/ONBOARDING.md`](docs/inbox/ONBOARDING.md) is where a new collaborator starts.
- The research that started it is [`docs/INITIAL-DESIGN-BRIEF.md`](docs/INITIAL-DESIGN-BRIEF.md).

## Credits and lineage

- Research brief: Claude Opus 5.5, from a prompt by Jérémie Lumbroso. The
  outside-VS-Code trigger was that session's own idea; the prompt did not ask for it.
- Built by Jérémie Lumbroso with Glazier 5.5 (Claude Opus 5.5); the release is prepared
  with Purser 5.5 (Claude Sonnet 5.5). The full roster is in
  [`docs/inbox/agent-sessions.json`](docs/inbox/agent-sessions.json).
- The repo's structure comes from the
  [ADRs4AI human-AI collaboration template](https://github.com/ADRs4AI/human-ai-collaboration-template-A).
  What was unclear while adopting it is recorded in
  [`docs/TEMPLATE-FEEDBACK.md`](docs/TEMPLATE-FEEDBACK.md).

## License

[MIT](LICENSE).
