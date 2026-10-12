# porthole

A VS Code extension that pops the HTML page you are looking at into a small
floating window: only the rendered page, pinned above your other windows.

> **Status, 2026-10-12: founding.** No extension code exists yet. This repo
> holds the research brief, the decision record, and the project's working
> agreements. The first code will be a spike that proves the core call on a
> real machine.

## What it is for

Task instructions often live in an HTML page, and VS Code's integrated browser
renders them well. But the page sits in an editor tab, surrounded by tabs,
sidebars and a status bar, and it disappears behind whatever you open next.
porthole should make it a small window that stays in view while you work.

The build passes when these five things are true:

1. **One gesture** turns the page into a small window showing only the
   rendered page, from the HTML file or from a page already open in the
   integrated browser.
2. The window can be **pinned above other windows**, and unpinned.
3. It is **easy to put back** into the main window, and easy to resize to a
   preset.
4. The page **stays live**: it reloads when the file changes, and its
   checkboxes, buttons and stored state keep working.
5. It can be **triggered from outside VS Code**, for example by a coding agent
   right after it writes a task page.

## How it is meant to work

porthole renders nothing itself. VS Code already has an integrated browser,
floating windows, a compact mode with no tabs or status bar, and always-on-top.
What is missing is a single gesture that combines them at a chosen size.

The plan is one internal VS Code command that opens a file in the integrated
browser, in a new floating window, already sized, compact and pinned. If that
call ever stops working, the extension falls back to a chain of public
commands that does the same thing at VS Code's default window size.

That internal call was traced through VS Code's source but **has not been
run**. Proving it is the first milestone. The full reasoning, with source
links, is in [`docs/INITIAL-DESIGN-BRIEF.md`](docs/INITIAL-DESIGN-BRIEF.md).

## Try the idea today, with no extension

1. Open an HTML file in the integrated browser.
2. Right-click its tab and choose **Move into New Window**.
3. In the new window's title bar, click the compact icon and the pin icon.

This gives you the experience porthole aims for, minus the one-gesture part
and the exact size.

## Requirements

- VS Code desktop **1.141 or later** (the brief was written against 1.141.0).
- Local HTML files. Remote and virtual workspaces are out of scope.
- It will be installed from a local `.vsix` file. It is not going on the
  Marketplace, because it calls an internal command.

## Working on it

This project is built by a human and AI collaborators working through written
records, so decisions survive from one session to the next.

| To do this | Use |
| --- | --- |
| Check the repo before committing | `just gate` |
| Record a decision or open a question | `just adr "<title>"` |
| See every recipe | `just` |

- [`CLAUDE.md`](CLAUDE.md) holds the working agreements and the current focus.
- [`docs/adr/`](docs/adr/) holds decisions and the questions still open.
- [`docs/inbox/ONBOARDING.md`](docs/inbox/ONBOARDING.md) is where a new
  collaborator starts.

## The name

A porthole is a small, fixed window you look *through*; nothing lives in it.
That is the object being built. The pages it shows are often served on
localhost ports, which makes the pun honest. The name is provisional and can
still change.

## Credits and lineage

- Research brief: Claude Opus 5.5, from a prompt by Jérémie Lumbroso. The
  outside-VS-Code trigger (test 5 above) was that session's own idea; the
  prompt did not ask for it.
- Built by Jérémie Lumbroso with Glazier 5.5 (Claude Opus 5.5); the full
  roster is in [`docs/inbox/agent-sessions.json`](docs/inbox/agent-sessions.json).
- The repo's structure comes from the
  [ADRs4AI human-AI collaboration template](https://github.com/ADRs4AI/human-ai-collaboration-template-A).
  What was unclear while adopting it is recorded in
  [`docs/TEMPLATE-FEEDBACK.md`](docs/TEMPLATE-FEEDBACK.md).

## License

[MIT](LICENSE).
