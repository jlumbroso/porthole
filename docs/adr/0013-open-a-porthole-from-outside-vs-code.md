<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Open a porthole from outside VS Code

- **Date**: 2026-10-13
- **Iteration**: 5
- **Status**: Accepted
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5), with Purser 5.5, Surveyor 5.1 and Sounder 6 in the seed's thread

**TL;DR**: Build `open` from outside first — a `vscode://` link a model can run or print and the human can click — because all of today's friction is on the opening side; four questions decide who may call it, what it may open, whether it may take focus, and what it confirms.

---

## Originating Context

**Source**: `Seed: docs/adr/seed-2026-10-13-porthole-for-models.md` — Jérémie's dump and "why", and the thread entries of Glazier, Purser, Surveyor and Sounder. Also [ADR-0008](0008-expose-a-vscode-link-handler-with-an-allowlist.md), which designed the link handler before models were its main sender.

Jérémie, on the friction, verbatim:

> for the human to have to open the HTML file and then do a command chord
> for the human to have to hunt for the file and then right-click and select the right option
>
> It woudl be nice if the human could say: Pull up that pharoscan in the porthole. Or if the model coudl wire a command to do as much. Or links opening up printed in the conversation or something.

**Agency Grant**: Chunk the seed into ORRCF questions, fully in template.

---

## Explicitation

**What I understand**:

1. **One verb, three ways in.** The human says "pull up that pharoscan" and the model runs one command; or a recipe runs it unasked; or the model prints a link the human clicks. All three are a `vscode://jlumbroso.porthole/open?…` link.
2. **The link is now a public interface.** Porthole is published (ADR-0011). Its grammar, once used by other people's scripts, cannot change without breaking them (Purser).
3. **The allowlist is the only real boundary.** VS Code's first-use dialog shows only about 35 characters of the address and offers "Do not ask me again" for the whole extension (Purser, read in `extensionUrlHandler.ts` at 1.141.0).

**What the source says, not yet run** (Surveyor, in the seed's thread):

- A `vscode://` link printed in VS Code's integrated terminal is clickable, and is handled by the VS Code window that owns that terminal, not the topmost one.
- `vscode.env.uriScheme` gives the right scheme in VS Code, Insiders, Cursor and VSCodium.

**Assumptions**:

- The handler is built on ADR-0008's design: a pure parser, a thin handler, `onUri` activation.
- Every outside request is logged in the Porthole output channel.

**Confirm**: Jérémie, through the four questions below.

---

## Questions

### QST-OPEN-CALLERS: Who should be able to open a porthole from outside VS Code?
- Status: answered
- Why asking: This decides what the outside interface is built for. A link that any local program can produce needs nothing Claude-specific; an MCP tool only reaches agents that have it installed.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — any local agent or script**: Claude Code, Codex, a `just` recipe, a shell script or a cron job. The interface is a `vscode://` link plus one documented command to run it; nothing is specific to one AI tool.
- **B — Claude Code seats only**: built as an MCP tool or a Claude skill that knows the details. Smoother inside Claude Code; invisible to everything else.
- **C — humans clicking links only**: porthole makes links (for example, a command that copies a page's link); models may print them, but nothing runs them automatically.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — any local agent or script.** *Rationale*: your three wishes include "the model wires a command", which is a script, not a chat; Purser and Sounder both answered the seed this way; and A contains B and C (a Claude skill can teach the same link, and a printed link is just its text). *Confidence*: 0.8 — because the three sources agree, and the cost is the same link either way. *If wrong*: if you only ever want to click, this flips to C, and porthole needs no command-line instructions at all.

**ANS:** (by Jérémie Lumbroso)
Yes, Option A. [Thought: I think the threat model (until I've heard differently) should be that the human is on their local machine environment, which is not adversarial. If any adversary had the ability to call tools, they could do much worse than open a porthole from outside VS Code.] I think this is an extremely useful feature for a model to be able to quickly get something in front of the human — especially on a short timeline, and without the human have to search frantically.

---

### QST-OPEN-ALLOWLIST: What may a link from outside VS Code open, by default?
- Status: answered
- Why asking: In ADR-0008 you chose (option C there) "local files and `localhost` by default, any `https://` URL only with the setting `porthole.allowRemoteLinks` on". That was decided when you were the only sender. Now links will come from models and from anything you click, and after the first "Do not ask me again", porthole's own rule is the only check. An opened page runs its scripts.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — keep ADR-0008 as answered**: any local `.html` file, any `http://localhost` or `127.0.0.1` address; `https://` only with `porthole.allowRemoteLinks`.
- **B — files inside the open workspace folders, plus folders you list**: a new setting, `porthole.allowedFolders`, for places such as another repository. `localhost` and `https://` each behind its own setting, both off by default.
- **C — B, but `localhost` on by default**: for people who serve task pages from a local dev server.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**B — workspace folders plus listed folders.** *Rationale*: Purser's two cases are real — a link to a file in Downloads would run that page's scripts in a window that stays on top, and a `localhost` link makes your machine send a request to any local service the link's author chose. B covers every use so far: the pharoscan and the porthole samples are both inside a repository open in VS Code. *Confidence*: 0.65 — because B costs one setting for pages kept outside any open folder, and I do not know how often you keep them there. *If wrong*: if task pages often live in folders VS Code does not have open, this flips to A, with the risk stated in the README.

**ANS:** (by Jérémie Lumbroso)
Let's do Option A and Option B — actually, after writing this whole request, I realized that B was probably a strict superset of A, and I didn't quite get it from the phrasing, because you wrote out the option for links in A but in B just alluded to it. At any rate, I think this is what you meant:

- Option A entirely, with porthole.allowLocalFiles (any local `.html`, or soon `.md`), porthole.allowRemoteLinks (HTTPS only) and porthole.allowLocalHost (localhost, IPv4 and IPv6 — both HTTP/HTTPS)
- Option B, porthole.allowWorkspaceFolders and porthole.onlyWorkspaceFolders as an override to this mode; porthole.allowedFolders

By default, I would set:
- porthole.outsideLinks.enabled = true
- porthole.outsideLinks.allowedFolders = []
- porthole.outsideLinks.allowWorkspaceFolders = true
- porthole.outsideLinks.allowLocalFiles = false (no files outside of the workspace)
- porthole.outsideLinks.allowLocalHost = true
- porthole.outsideLinks.allowRemoteLinks = false

Maybe we can add:
- porthole.outsideLinks.restrictLocalHostPorts = [8001, 8002]

By default
- porthole.outsideLinks.restrictLocalHostPorts = false

or:
- porthole.outsideLinks.restrictLocalHostPorts = []

---

### QST-OPEN-FOCUS: When a model opens a porthole while you are typing elsewhere, may it take the keyboard?
- Status: answered
- Why asking: If opening a floating window moves keyboard focus into it, whatever you are typing at that moment — possibly a password in a terminal — goes into the page instead (Purser). Nobody knows yet whether porthole's open call takes focus; Spike 1 ([ADR-0018](0018-spike-1-markdown-preview-and-focus.md), QST-SPIKE1-FOCUS) measures it, and this question decides what to do with the answer.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — never take focus from outside**: an outside `open` shows the window, pinned, but leaves the keyboard where it was. If VS Code cannot do that, an outside `open` is refused with a message until it can.
- **B — take focus**: the new window gets the keyboard, as it does today from the chord. Simplest; the risk above is accepted.
- **C — depends on who triggered it**: a link you click yourself may take focus (you just clicked, you are not typing); an `open` run by a model or a script must not.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — depends on who triggered it.** *Rationale*: when you click a link, taking focus is what you want; when a script fires while you type, it is the hazard Purser named. Porthole can tell the two apart by how the request arrives (a parameter the clicked link carries, or a different path), though the parameter is not proof of who sent it. *Confidence*: 0.55 — because it depends on Spike 1 showing that VS Code can open without taking focus at all; if it cannot, C collapses to A or B. *If wrong*: if Spike 1 shows no way to avoid taking focus, this becomes a choice between A (refuse unattended opens) and B (accept the risk).

*Note added before any answer* (Purser, 2026-10-13): C is a courtesy, not a protection. The "you clicked this" marker is set by whoever writes the link, so a script that does not cooperate can set it too. That is acceptable for the cooperating agents this is built for, but the README must not call it protection. If Spike 1 shows VS Code can open without taking focus, only A holds against a sender that does not cooperate.

**ANS:** (by Jérémie Lumbroso)
Ideally, Option C, yes — but I just did Spike 1, and it looks like we don't (yet?) know how to granularly control how the window is opened — at least not on macOS (it might be very different in Windows and Linux, and we should make a note to keep on the look out for those spikes in those OSes). So ideally Option C, and degrading gracefully to what is actually possible. If it's not possible to not take focus, I believe that is acceptable: The main reason I believe that is because of three things:
- I don't foresee models surfacing these pages frequently, it's an O(1) within a day;
- there is a very high, systematic, never amortized cost to search for these files, for opening them, then sending them to browser (whether internal or external) — the amortized cost of dismissing an occasionally unuseful floating window is, by comparison, very small
- in my own experience of the last year, it is very useful to have models have the ability to open a URL and grab focus and so imparting this ability to them is useful.

---

### QST-OPEN-CONFIRM: Should porthole ask you before each outside `open`?
- Status: answered
- Why asking: VS Code asks once per extension and then never again if you tick its box. Porthole could add its own confirmation on top, but that is exactly the friction this work removes. Sounder's view: your "pull up that pharoscan" already authorizes that open.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — no porthole confirmation**: VS Code's first-use dialog plus the allowlist (QST-OPEN-ALLOWLIST) are the checks; every outside open is logged in the Porthole output channel.
- **B — confirm every outside open** with a porthole notification ("Open tasks.html in a floating window?").
- **C — confirm only what the allowlist would refuse**: instead of refusing outright, porthole asks once and offers to remember the folder.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — confirm only what the allowlist would refuse.** *Rationale*: A alone turns every refusal into a dead end you have to fix in settings; B adds a click to the very gesture this work exists to remove (Purser's doubt: the feature must beat the chord). C costs a click only in the unusual case, and turns it into a lasting choice. *Confidence*: 0.6 — because it adds a small piece of interface, and it depends on the answer to QST-OPEN-ALLOWLIST. *If wrong*: if a notification from porthole would itself be noise to you, this flips to A.

**ANS:** (by Jérémie Lumbroso)
Yes, Option C, and the notice should expressedly explain that this is not yet covered by the settings, but it can be if they want (praxigenic).

---

### QST-OPEN-ROUTING: When several VS Code windows are open, which one should open a link, and what does a relative path mean?
- Status: answered
- Why asking: You raised it while answering QST-TERM-LINK in ADR-0017: *"Who knows which project must open it, and is the path absolute? If it's relative what does it resolve against?"* It matters because of your allowlist: with `allowWorkspaceFolders` on and `allowLocalFiles` off, a link received by the wrong VS Code window would be refused, since the file is not in *that* window's workspace. What decides the receiving window today (read in source by Surveyor, not run): a link clicked in VS Code's own terminal goes to the window that owns that terminal; a link sent with `code --open-url` from any shell goes to the VS Code window that was most recently in front.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — absolute paths only; the receiving window decides**: the link must carry an absolute path. Whichever window receives it opens the page if its settings allow; otherwise it shows the confirmation (QST-OPEN-CONFIRM). Simple; occasionally the "wrong" window opens your page, or asks.
- **B — absolute paths, and porthole re-routes to the window that owns the file**: each window's porthole records which folders it has open (in the state file of ADR-0014). The receiving window, if the file is not in its workspace but is in another window's, hands the link on to that window instead of opening it. Needs the state file first.
- **C — B, plus relative paths and a repository hint**: a link may say `repo=porthole&file=docs/tasks.html`; porthole finds the window whose workspace is that repository (by its folder name or its git root) and resolves the path there. Easiest for a model that knows the project but not the absolute path.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A now, B with the state file.** *Rationale*: absolute paths are what a model in a terminal already has (its working directory is a real path), and they mean the same thing in every window; with your defaults, a link the wrong window receives is not lost, it asks once. B removes even that, but only becomes possible once each window publishes its folders (ADR-0014's state file, which is the next step anyway). C adds a second way to name a file, which every script and the skill would then have to get right; worth it only if models often know the repository but not the path. *Confidence*: 0.6 — because how often the wrong window receives a link depends on how you work with several windows, which I have not seen. *If wrong*: if wrong-window links turn out to be common in your day, B moves up to the first release of outside links; if models keep producing relative paths, C.

**ANS:** (by Jérémie Lumbroso)
Option C, and maybe, in addition, the option to prefix the title of floating windows with the project name in brackets followed by a space — so that there's a way to identify at a glance which project launched a floating window.

Option C, and in addition to what we said, allow jus plain relative paths. Allow:
- relative paths alone
- relative paths with repo
- absolute paths [with repo, that could be ignored or used to warn if discrepancy detected]

This is to facilitate communication between model and human — not to introduce new contorsions!

---

### QST-CHECK-OUTSIDE-OPEN: Does a link typed in a terminal open a page in a floating window, and ask only when it should?
- Status: unanswered
- Why asking: **What this finds out.** Outside `open` is built and passes 60 tests against a mocked VS Code (commit `950faa5`), but four links in the chain have never run: that VS Code wakes Porthole for a `vscode://jlumbroso.porthole/…` link at all (the `onUri` activation event); that VS Code hands over the link's query decoded exactly once, as its source says (`src/vs/base/common/uri.ts` at 1.141.0), so a file name with a space and a plus sign arrives intact; that a relative path is found in this window's workspace folder; and that a file outside the workspace brings up Porthole's question instead of opening silently. Only a real VS Code receiving a real link can show these. Each outcome below names what it would change. **Safe**: nothing here changes a setting (step 4 says which button not to press); Porthole 0.3.0 is installed in your VS Code but not published.
- Need: pick a letter (or override — any shape answers). About four minutes. A screenshot of Porthole's question in step 4 would help.

**Where to do this.** In **your porthole workspace window**: the VS Code window in which the folder `porthole` is open, whose title bar ends with `porthole`. Not in any debug window (none titled `[Extension Development Host]`). The commands go in **that window's own terminal panel**, so that this window is the last one you used and VS Code hands it the link.

**Before you start.** In that window, run **Developer: Reload Window** (press **Shift+Cmd+P**, type `Reload Window`, press **Enter**), so it runs Porthole 0.3.0. Then open its terminal panel: press **Ctrl+`** (Control and the backquote key, left of 1). "The floating window" below is the small window Porthole opens with only the page in it; close one with the red button at its top left.

**Steps.** One action each. Paste each command whole, as one line, and press **Enter**.

1. **An HTML file, by absolute path, with a size.** Paste:
   `open 'vscode://jlumbroso.porthole/v1/open?file=/Users/jlumbroso/Programming/porthole/samples/tasks.html&width=500&height=700'`
   VS Code should show its own question, **"Allow 'Porthole' extension to open this URI?"**, with a box "Do not ask me again for this extension". Leave the box unticked and click **Open**. A floating window should appear with the sample task page, pinned above other windows.
2. **Close that floating window** (red button at its top left).
3. **A Markdown file, by relative path, with a space and a plus sign in its name.** Paste:
   `open 'vscode://jlumbroso.porthole/v1/open?file=samples/my%20tasks%2Bnotes.md'`
   Click **Open** if VS Code asks again. A floating window should show the rendered Markdown page, whose heading reads **My tasks+notes**, with two unticked boxes. Close it.
4. **A file outside the workspace.** Paste:
   `open 'vscode://jlumbroso.porthole/v1/open?file=/private/tmp/claude-501/-Users-jlumbroso-Programming-porthole/97e4570b-75ad-4694-9ae2-dcdd69dcaf36/scratchpad/outside/notes.html'`
   Click **Open** if VS Code asks. This time **Porthole** should ask, in a dialog beginning "A link from outside VS Code asks Porthole to open …notes.html. None of Porthole's outside-link settings (porthole.outsideLinks) allows this file yet." with buttons **Open Once**, **Allow This Folder** and **Cancel**. Click **Open Once** (not Allow This Folder, which would write a setting). A floating window should show "Outside the workspace". Close it.

I read Porthole's log afterwards myself (each link, and which window it was matched to, is written there); nothing needs copying.

Options:
- **A — all as described**: VS Code's question in step 1, the HTML window in step 1, the Markdown window in step 3, Porthole's question and then the window in step 4.
- **B — nothing happened in step 1**: no VS Code question and no floating window. The link never reached Porthole.
- **C — VS Code asked, but no floating window appeared**, and a notice beginning "Porthole did not open a link from outside VS Code: …" did: please give its words.
- **D — step 3 failed**: a notice said the file does not exist, or a different name appeared.
- **E — step 4 opened the page without Porthole's question**, or refused it without asking.
- **F — something else**: say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)
**A — all as described** (a prediction). *Rationale*: `registerUriHandler` and the `onUri` activation event are VS Code's public, documented route for exactly this, and `onUri` is declared (`package.json`; read in `implicitActivationEvents.ts` at 1.141.0 that it is not implied). The single decode is read in `uri.ts` (`percentDecode` of the query in `URI.parse`), and Porthole no longer decodes a second time. Every refusal and the question are covered by tests, including the four hostile paths. *Confidence*: 0.55 — because none of the chain from macOS's `open` to Porthole has ever run, and I have never seen what string `open` passes on for `%20` and `%2B`. *If wrong*: B means activation or registration is wrong, to be found in VS Code's extension host log; C means the handler ran and refused, and its words say which check; D means the link's query is decoded twice or not at all on the way in, and the reader must change; E means the allowlist misreads the temporary folder's real path, which would be a safety bug, with a regression test before anything else.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-NAME-OPEN-WORDS: Are the new words of outside `open` right?
- Status: unanswered — routed to the naming review, then Jérémie; blocks releasing outside `open`
- Why asking: The setting keys were ruled in ADR-0021, but building `open` added words a person reads that nobody has reviewed. The two buttons and the settings' descriptions are the permanent-feeling ones; messages can change in any release. As built (`src/outsideLinks.ts`, `package.json`):
  - **Porthole's question** (a modal dialog, shown when a link asks for a file no setting allows): "A link from outside VS Code asks Porthole to open {path}. None of Porthole's outside-link settings (porthole.outsideLinks) allows this file yet." Detail line: "Allow This Folder adds {folder} to porthole.outsideLinks.allowedFolders, so links can open files there without asking." Buttons: **Open Once**, **Allow This Folder** (and VS Code's own **Cancel**).
  - **A refusal**, as a notice: "Porthole did not open a link from outside VS Code: {reason}." Reasons include "outside links are turned off (porthole.outsideLinks.enabled)", "{file} exists in more than one workspace folder; add repo=<folder name> to the link", "this link is for a newer version of Porthole (/v2/open)".
  - **Setting descriptions**: `enabled` "Accept `vscode://jlumbroso.porthole/v1/open?file=…` links from outside VS Code, for instance from a terminal, a script or a model. VS Code asks once before it hands Porthole its first link."; `actions.open` "Let outside links open a page in a floating window."; `allowWorkspaceFolders` "Let outside links open HTML and Markdown files inside the receiving window's workspace folders."; `allowedFolders` "Further folders, by absolute path, whose HTML and Markdown files outside links may open."; `allowLocalFiles` "Let outside links open any other local HTML or Markdown file. When off, Porthole asks before opening a file no setting allows."
  - **The link parameter `repo`**: from Jérémie's own example in QST-OPEN-ROUTING (`repo=porthole&file=docs/tasks.html`); `file`, `width` and `height` were ruled in ADR-0017, `repo` was not.
- Need: pick a letter (or override — any shape answers), or edit any line

Options:
- **A — as built**: every word above ships as it is.
- **B — as built, with the review's edits**: the review changes what it judges wrong, line by line.
- **C — different buttons**: the review proposes other labels for the two buttons; the rest as built or edited.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-14)
**B — as built, with the review's edits.** *Rationale*: the buttons follow the 0.2.0 ruling that a button repeats what it does ("Keep Compact"; ADR-0021), but "Allow This Folder" leaves unsaid that it writes a setting, which the detail line has to carry; and "None of Porthole's outside-link settings … allows this file yet" may read as an error rather than a question. *Confidence*: 0.6 — because these are words, the review's domain. *If wrong*: if the review finds nothing to change, A.

**ANS:** (by Jérémie Lumbroso)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Context

All of today's friction is on the opening side. Everything else a model might do with a porthole (ADR-0014) waits on this.

### Chosen: outside `open` for any local caller, with layered allowlist settings, focus taken when it must be, and a confirmation only for what the settings would refuse

From Jérémie's answers (2026-10-13):

- **Callers (QST-OPEN-CALLERS, A)**: any local agent or script. The threat model is the human's own, non-adversarial machine: anything able to send porthole a link could already do worse. The point is speed: a model can put a page in front of the human "without the human having to search frantically".
- **What a link may open (QST-OPEN-ALLOWLIST, A and B combined)**: one switch for the whole feature and one setting per kind of target. Jérémie's defaults:

  | Setting (names confirmed by the naming review, ADR-0021) | Default | Meaning |
  | --- | --- | --- |
  | `porthole.outsideLinks.enabled` | `true` | outside links are accepted at all |
  | `porthole.outsideLinks.allowWorkspaceFolders` | `true` | local files inside the receiving window's workspace folders |
  | `porthole.outsideLinks.allowedFolders` | `[]` | further folders, by absolute path |
  | `porthole.outsideLinks.allowLocalFiles` | `false` | any other local `.html` (and later `.md`) file |
  | `porthole.outsideLinks.allowLocalhost` | `true` | `localhost`, `127.0.0.1` and `::1`, over `http` and `https` |
  | `porthole.outsideLinks.restrictLocalhostPorts` | `[]` | if non-empty, only these ports (for example `[8001, 8002]`) |
  | `porthole.outsideLinks.allowRemoteLinks` | `false` | any `https://` address |

  This changes ADR-0008's earlier answer in one respect: `localhost` stays on by default, and local files outside the workspace move behind their own setting.
- **Focus (QST-OPEN-FOCUS, C, degrading to what is possible)**: ideally a clicked link takes focus and an unattended open does not. Spike 1 showed that on macOS every new floating window takes the keyboard, with or without the "do not take focus" options (ADR-0018). So an outside `open` **takes focus**, and that is accepted, for three reasons Jérémie gave: models will surface a page about once a day; finding and opening the page by hand is a large cost paid every time; and a model that can open a page and take focus has proved useful over the past year. A quiet open stays the goal for re-opening into an existing window, where the source says focus is not moved (Surveyor), and is to be re-tested on Windows and Linux.
- **Confirmation (QST-OPEN-CONFIRM, C)**: no porthole prompt for what the settings allow. For what they would refuse, porthole asks once, and the notice says plainly that this case is not yet covered by the settings and offers to add it — the prompt teaches the settings.
- **Routing (QST-OPEN-ROUTING, C, widened)**: a link may name its file in three ways, *"to facilitate communication between model and human — not to introduce new contortions"*: a **relative path alone** (resolved against the receiving window's workspace folders), a **relative path with a repository** (`repo=porthole&file=docs/tasks.html`: the window whose workspace is that repository resolves it, found by folder name or git root), or an **absolute path**, optionally with a repository that is used only to warn when the two disagree. A link received by a window that does not own the file is handed on to the one that does (needs ADR-0014's state file). Jérémie also asked that a floating window's title can start with the project name in brackets, `[porthole] tasks`, so that one can tell at a glance which project opened it.

What is also settled, from the seed's thread:

- The parser refuses anything not explicitly allowed, and its tests are written against hostile links, not friendly ones (Purser, Glazier).
- The link carries a version, in its path: `vscode://jlumbroso.porthole/v1/open?file=…&width=…&height=…` (ADR-0017, QST-TERM-LINK, the naming review's synthesis). An unversioned `/open` is read as version 1.
- Every outside request is logged with what porthole can see of its origin (Purser).
- The words — verb, parameters, settings — go through the naming review first ([ADR-0017](0017-words-for-the-model-facing-surface.md)).
- Paths with spaces and URI-reserved characters are tested from a terminal before the changelog claims this works (Sounder).
- The allowlist compares **resolved real paths**, never strings: `..` segments, symbolic links, `file:` URL encodings such as `%2e%2e`, and macOS's case-insensitive file system are all resolved first. Each of those four gets a regression test: a symlink inside the workspace pointing out, `..` out of it, an encoded `..`, and a differently-cased path (Purser).

---

## Action Items

- [x] Answer the four questions — Owner: Jérémie (2026-10-13)
- [x] Run Spike 1 — Owner: Jérémie (2026-10-13, [ADR-0018](0018-spike-1-markdown-preview-and-focus.md))
- [x] Answer QST-OPEN-ROUTING — Owner: Jérémie (2026-10-13)
- [x] Find out whether porthole can set a floating window's title at all (the title VS Code shows is built from its own settings and the page's title) — Owner: Surveyor (2026-10-13; read at 1.141.0, not run; the note below the list)
- [x] Decide how a relative path alone resolves when the receiving window has several workspace folders, or none — Owner: Glazier (2026-10-14, as built: it is looked up in every workspace folder of the receiving window; found in one, that file; in several, refused with "add repo=<folder name> to the link"; in none, or with no folder open, refused and said so. Handing a link on to another window waits for ADR-0014's event file.)
- [ ] Put the setting names in the table above through the naming review — Owner: Glazier
- [ ] Build the handler — Owner: Glazier (2026-10-14: files built, `950faa5`, installed locally as 0.3.0, not published; waiting on QST-CHECK-OUTSIDE-OPEN and QST-NAME-OPEN-WORDS. Not built yet: `localhost` and remote links, whose link parameter has no name yet, and handing links between windows)

NOT: **Window titles** (Surveyor 5.1, 2026-10-13). A floating window's title is built by the same `WindowTitle` as the main window's, from the same `window.title` template, with that window's own active editor (`browser/parts/editor/auxiliaryEditorPart.ts` L206–237; `browser/parts/titlebar/windowTitle.ts` L349–407). No API sets a window's title, and the two internal hooks are closed: `ITitleProperties.prefix` is set only by the debug contribution (`contrib/debug/browser/debugTitle.ts` L23–25), and the `[Extension Development Host]` prefix is the dev host only (`windowTitle.ts` L242–246), so the installed porthole never shows it. What the source does allow:
1. **The page's own `<title>`.** `${activeEditorShort}` for a browser tab is the page title followed by the file path in parentheses (`contrib/browserView/common/browserEditorInput.ts` L253–257), so a page that says `<title>[porthole] tasks</title>` gets exactly the asked-for title, per window, with no code. For pages a model writes, this is a convention the skill can teach (ADR-0016).
2. **`${rootName}` is already in the default template.** On macOS the default is `${activeEditorShort} — ${rootName}` (`windowTitle.ts` L42–44), so the floating window already ends with the workspace name. A template such as `[${rootName}] ${activeEditorShort}` gives `[porthole] tasks (…/tasks.html)`; `window.title` is a window-scoped setting, so it can live in a project's `.vscode/settings.json`, where it also prefixes that project's main window, which is the same "which project" answer. porthole should document this, not write it.
3. **A porthole variable, read not run.** The internal command `registerWindowTitleVariable(name, contextKey)` (`browser/parts/titlebar/titlebarPart.ts` L137–150) makes `${name}` resolve to a context key's value (`windowTitle.ts` L368–370, re-rendered on change, L125–127); an extension can set that key with `setContext`. But `setContext` writes the root context, which every window inherits, and no built-in window-scoped key carries text, so the value cannot differ between the floating window and the main one. It buys nothing over 2 and adds an internal dependency.
- [ ] Re-test whether a new floating window takes focus on Windows and Linux, when a machine is available — Owner: to be assigned

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: Jérémie asked for the seed to be chunked into ORRCF questions
- Contributors: Glazier 5.5 (Claude Opus 5.5), from the thread entries of Purser 5.5, Surveyor 5.1 and Sounder 6
- Changes: initial draft
- Outcome: `Draft`

### Iteration 2 (2026-10-13)
- Trigger: Purser's review of the chunking (`docs/inbox/archive/2026-10-13-1408-purser-to-glazier-chunked-seed-nothing-misstated-four-additions.md`), before any answer
- Contributors: Purser 5.5 (Claude Sonnet 5.5) — the additions; Glazier 5.5 (Claude Opus 5.5) — folding them in
- Changes: see the notes marked "Purser, 2026-10-13" in this file
- Outcome: stays `Draft`

### Iteration 3 (2026-10-13)
- Trigger: Jérémie answered all four questions and ran Spike 1
- Contributors: Jérémie Lumbroso — the answers, including the settings design; Glazier 5.5 (Claude Opus 5.5) — this record
- Changes: Decision filled; QST-OPEN-ROUTING added from his note on ADR-0017's QST-TERM-LINK; the link now carries its version in the path
- Outcome: `Draft → Accepted`; one question open (routing)

### Iteration 4 (2026-10-13)
- Trigger: Jérémie answered QST-OPEN-ROUTING
- Contributors: Jérémie Lumbroso; Glazier 5.5 (Claude Opus 5.5) — this record
- Changes: routing recorded in the Decision; two follow-ups (window title prefix; relative paths with several folders)
- Outcome: stays `Accepted`; no question open

### Iteration 5 (2026-10-14)
- Trigger: Jérémie: "go for it!" (build outside `open`)
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: handler built for local files; the relative-path rule recorded; QST-CHECK-OUTSIDE-OPEN and QST-NAME-OPEN-WORDS added
- Outcome: `Accepted` (decision unchanged)

---

## Links

- Seed: [`seed-2026-10-13-porthole-for-models.md`](seed-2026-10-13-porthole-for-models.md)
- Related: [ADR-0008](0008-expose-a-vscode-link-handler-with-an-allowlist.md), [ADR-0014](0014-drive-open-floating-windows-from-outside-vs-code.md), [ADR-0017](0017-words-for-the-model-facing-surface.md), [ADR-0018](0018-spike-1-markdown-preview-and-focus.md)
