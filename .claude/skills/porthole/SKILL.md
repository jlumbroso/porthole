---
name: porthole
description: Put a page in front of the human, in a small floating window pinned above their other windows, with the Porthole VS Code extension — by sending one `vscode://jlumbroso.porthole/v1/open?file=…` link from a terminal. Use this whenever the human needs to keep something in view while they work elsewhere (step-by-step instructions, a checklist, a survey, links, a status page, a report you wrote for them), especially when chat would scroll it away or they cannot select text in it, and whenever you are about to tell them "open this file". Covers the link, every parameter, what opens without asking and what asks, what a repeat open does, how to update a page that is already showing, and how to tell whether it worked.
---

# Showing a page to the human with Porthole

Porthole is a VS Code extension. Given an HTML or Markdown file, it shows only
the rendered page in a small floating window, kept above the human's other
windows. You can ask for that from a terminal with one link. Use it when the
human must *keep something in view* while doing something else; chat is the
wrong surface for anything they must follow step by step, copy from, or tick
off, because it scrolls away.

## 1. Before the first use

- **Porthole 0.3.0 or later must be installed.** Outside links do not exist in
  0.2.x. Check: `code --list-extensions --show-versions | grep porthole`.
- **VS Code must be running**, with the project's folder open in a window.
- **The page must be a local file**: `.html`, `.htm`, `.md` or `.markdown`.
  Web addresses and `localhost` are not supported yet.
- **To keep this skill in a project**, so every session there has it: send
  `open 'vscode://jlumbroso.porthole/v1/install-skill'` (add `?repo=<folder>` when the
  window has several workspace folders), or ask the human to run **Porthole: Add the
  Skill for Models to This Project**. Porthole writes `.claude/skills/porthole/SKILL.md`,
  asks the human the first time in each project, and never overwrites a copy someone
  edited. (Coming in the release after 0.3.0.)

## 2. The link

```
vscode://jlumbroso.porthole/v1/open?file=<path>[&width=<px>&height=<px>][&repo=<folder>]
```

| Parameter | Meaning |
|---|---|
| `file` (required) | An absolute path, or a path relative to a workspace folder of the VS Code window that receives the link. |
| `width`, `height` | Both or neither, in whole pixels. Without them, the window uses the human's first size preset (420×640 unless they changed it). VS Code raises anything below 400×270. |
| `repo` | The name of a workspace folder, to say which one a relative path belongs to. Needed only when the same relative path exists in two folders of the window; Porthole refuses and says so. |

**Send it** with the operating system's link opener, the whole link in single
quotes so the shell leaves `&` and `?` alone:

```sh
open 'vscode://jlumbroso.porthole/v1/open?file=/Users/me/project/notes/steps.html&width=480&height=720'   # macOS (the only platform run so far)
xdg-open '…'   # Linux, not yet run
```

`code --open-url '…'` also exists in VS Code's source, but is undocumented
and has never been run with Porthole.

**Encode the path once.** Spaces become `%20`, `+` becomes `%2B`, `%` becomes
`%25`, `#` becomes `%23`, `?` becomes `%3F`. Keep `/` as it is. A file name
containing `&` followed by letters and `=` cannot be sent; rename it. In Python:
`urllib.parse.quote(path, safe="/")`. In JavaScript:
`path.split("/").map(encodeURIComponent).join("/")` (not `encodeURI`, which leaves
`+`, `&` and `?` alone).

**Which VS Code window receives it**: the one the human used last (VS Code's
behavior as observed; not read in its source). A relative
path is looked up only in that window's workspace folders. If the human may
be in another project's window, send an absolute path.

## 3. What opens without asking, and what asks

The human controls this, setting by setting; **never change these settings
yourself**. They decide how far you may interrupt them.

| Setting | Default | Effect |
|---|---|---|
| `porthole.outsideLinks.enabled` | on | Links are accepted at all. |
| `porthole.outsideLinks.actions.open` | on | Links may open pages. |
| `porthole.outsideLinks.allowWorkspaceFolders` | on | Files inside the receiving window's workspace folders open without asking. |
| `porthole.outsideLinks.allowedFolders` | `[]` | More folders, by absolute path, whose files open without asking. |
| `porthole.outsideLinks.allowLocalFiles` | off | Any other local file opens without asking. |

For a file no setting covers, Porthole asks the human: *"A link from outside
VS Code asks Porthole to open {path}. Open it?"*, with **Open Once** and
**Allow This Folder**. So:

- **Write pages inside the project's folder** when you can. They open at once.
- If you must write elsewhere, **say in chat that a question is waiting**, and
  do not send the link again while it is.
- Paths are compared after resolving `..`, symbolic links and letter case, so
  a path that only *looks* inside the workspace still asks.

## 4. Once a page is showing

- **Edit the file; that is the delivery.** The floating window follows the
  file: a Markdown preview updates as the file changes, and an HTML page
  reloaded by itself when its file changed (seen on VS Code 1.141.0). You do
  not need to send the link again after an edit.
- **Sending the same link again is safe** (built 2026-10-18; its hand check is
  porthole's ADR-0024, QST-CHECK-TWO-WINDOWS). Without a size, Porthole brings the
  existing window forward, where the human put it. With a size, it reopens the
  page at that size and closes the old window. Send again when the human closed
  the window, or when you cannot tell whether it is still open.
- **An open takes the keyboard.** A new floating window takes focus on macOS.
  Do not send links while the human is typing something else, unless the page
  is the point. Once at the start of a task is the normal rhythm.

## 5. Writing the page

- **Title it `[<project>] <name>`**, for example `<title>[porthole] release steps</title>`.
  VS Code shows the page's title in the floating window's title bar, so the
  human can tell which project's page it is.
- **Design for a small window**: about 420 to 640 pixels wide, readable
  without scrolling sideways, light and dark both if you can.
- **Markdown is read-only**: task-list boxes show, but cannot be ticked. If the
  human must tick, type or press buttons, write HTML. An HTML page runs its own
  scripts, and its `localStorage` survives reopening the same file, which makes
  a checklist that remembers its ticks easy to write.
- **One page per purpose**, kept up to date, beats a series of new files.

## 6. Did it work?

Porthole writes one line per step to its log, which you can read. On macOS:

```sh
ls -t ~/Library/Application\ Support/Code/logs/*/window*/exthost/jlumbroso.porthole/Porthole.log | head -1
```

Then look at the last lines of that file:

- `outside link received: …` means the link reached Porthole.
- `outside link: opening … (allowed by porthole.outsideLinks.<setting>)`, then
  `internal open: new window after … ms`, means it opened.
- `… is already in a floating window; brought it forward` means a repeat open
  found the window.
- `outside link refused: <reason>` means nothing opened, and the reason names
  the fix (a setting that is off, `repo=` to add, a file that does not exist).
- `… not opened; the person declined` means the human answered no.
- **No new line at all** means the link never arrived: VS Code was not
  running, the link was mistyped, or Porthole is older than 0.3.0.

Tell the human what you saw. Do not claim the page is in front of them
because you sent a link; the log is the evidence.

## 7. Not there yet

- Listing, refreshing, focusing, resizing, pinning, docking or closing windows
  from outside (designed in porthole's ADR-0014; not built).
- Web addresses and `localhost` pages.
- Handing a link to another VS Code window than the one that received it.
- Choosing which macOS desktop (Space) the window opens on: unknown, being
  researched (porthole's `docs/adr/seed-2026-10-18-macos-desktops.md`).
- Windows and Linux: never run.

---

*Written by Glazier 5.5 (Claude Opus 5.5), porthole's founding seat,
2026-10-18, at Jérémie Lumbroso's request: "a simple skill to teach models all
the possibilities and the granular control so they can use it exactly as it
should in every occasion." Everything in it was run on his machine on macOS
with VS Code 1.141.0 (porthole ADR-0008, ADR-0013, ADR-0024) or is labelled
as not run. Decided in ADR-0016.*
