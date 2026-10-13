<!-- adr template version: "seed 3.10.0" -->

# SEED: Porthole for models — launch, list, refresh and orchestrate windows from outside VS Code

- **Date**: 2026-10-13
- **From**: Jérémie Lumbroso (dump), Glazier 5.5 (first thread entry)

<!-- MODEL INSTRUCTIONS: look for "Model Response Request" and engage dialogically and epistemically until chunking the seed into ADRs following `adr.md` + referencing ADRs in "Derived Into" section, see instructions below.
-->

---

## Brain Dump

Jérémie, 2026-10-13, verbatim:

> I'd like you to start a seed for the next set of features. I'd like to make it as easy as possible for models to launch, modify, tweak, orchestrate these portholes. I want them to be able to list all the ones open, what they have, be able to refresh a window. Those kinds of things. And if we succeed, I then want to create a little skill to teach models how to get the most out of the Porthole.

And, minutes later:

> Pass it around Surveyor and Purser, and maybe let's recruit a GPT 6 Astra to consult.

And then, on why:

> The reason why is that it's still friction:
> -> for the human to have to open the HTML file and then do a command chord
> -> for the human to have to hunt for the file and then right-click and select the right option
>
> It woudl be nice if the human could say: Pull up that pharoscan in the porthole. Or if the model coudl wire a command to do as much. Or links opening up printed in the conversation or something.

---

**Model Response Request:**
<!-- literal sensor block — parser-significant: tooling reads these exact checkbox labels as the seed's declared lifecycle state; do not reword them -->

- [ ] Chunk this into ADRs (I'm ready to formalize)
- [x] Iterate with me (keep exploring)
- [ ] Structure in place (organize but don't split)

---

## Thread

### Glazier 5.5 (Claude Opus 5.5) - 2026-10-13

**What I understand.** Today a porthole is opened by a human gesture inside
VS Code. You want the same windows to be driven by models — Claude Code and
other agents working in a terminal — as a set of verbs: open one, see which
are open and what each shows, refresh, resize, pin, close, dock. Then a skill
that teaches models to use porthole well. M4 in the brief (the `vscode://`
trigger, ADR-0008) was the first step of this; this seed widens it from
"pop one page" to "drive the windows".

**The verbs I hear**, with what each needs from VS Code. "Read, not run"
applies to every internal id below.

| Verb | What it does | How porthole could do it | Known today |
| --- | --- | --- | --- |
| `open` | pop a file (or allowlisted URL) out at a size and position | the internal call porthole already uses | works (ADR-0003, ADR-0010) |
| `list` | every porthole window: an id, its file, size preset, pinned or not, which VS Code window owns it, page title | porthole's own record of what it opened; the tab label follows the page's `<title>` | partly: windows opened before a VS Code restart are invisible to porthole (below) |
| `refresh` | reload a page | rewrite or touch the file (auto-reload is on by default, seen in Spike 0), or focus the window and run `workbench.action.browser.reload` (id read at 1.141.0, `platform/browserView/common/browserView.ts` L30) | file route proven; command route not run |
| `resize` | another preset or exact bounds | re-open with new bounds (ADR-0007) | works |
| `pin` / `unpin` | always on top | `workbench.action.toggleWindowAlwaysOnTop`, acts on the focused window | works, but needs focus first |
| `focus` | bring a window to the front | no command known yet | unknown |
| `dock` / `close` | put back, or close | `restoreEditorsToMainWindow` (focused window); `tabGroups.close(group)` | dock works; close by API is likely fine |

**The real design question is the channel, not the verbs.** A model runs
outside VS Code. It can *send* to porthole easily (`code --open-url
"vscode://jlumbroso.porthole/<verb>?…"`, the M4 handler), but a `vscode://`
link returns nothing, so `list` — and knowing whether `open` worked — needs a
way back. Four shapes:

- **A — links in, a state file out**: verbs arrive as `vscode://` links;
  porthole writes the current list to a JSON file (one per VS Code window) on
  every change, and the model reads it. No server, no port, nothing listening.
  Answers arrive by polling a file, and which VS Code window receives a link
  is VS Code's choice (the topmost).
- **B — a local socket or HTTP server in the extension**: real request and
  response, synchronous `list`. Adds a listening endpoint, a token, and port
  or socket-path management.
- **C — an MCP server**: models already speak MCP, so `porthole_open`,
  `porthole_list` become native tools. It still needs A or B underneath to
  reach the extension; it is a front end, not a channel.
- **D — a small CLI** (`porthole open …`, `porthole list`): the friendliest
  thing to teach in a skill, and also a front end over A or B.

My lean: **A first, with D on top; C later if models want it.** A is the
smallest change from M4, keeps porthole with nothing listening on the
machine, and every verb can be tried with one `code --open-url` line. D is
what the skill would teach. Confidence 0.55, because I have not measured how
slow or racy "send a link, then read a file" feels to a model, and B or C
may be worth their cost for that alone. This is exactly the question I would
like a different vendor's model to weigh in on.

**Doubts, most consequential first.**

1. **Porthole forgets its windows on restart.** VS Code restores floating
   windows with their size, compact mode and pin, but porthole's record is in
   memory, and a browser tab cannot be identified afterwards (its `input` is
   opaque; ADR-0003). A `list` that silently omits restored windows would lie.
   Possible ways out: persist the record and re-match by page title; the
   proposed `browser` API (ADR-0006), which exposes a tab's URL; or say
   plainly that `list` only covers windows opened since the last start.
2. **Which VS Code window answers.** Each VS Code window has its own extension
   host and its own porthole. With several open, a link goes to the topmost,
   and a list must be merged across them. The state-file shape handles this
   naturally (one file each); the server shape needs one endpoint each.
3. **Verbs that need focus.** Pin and dock act on the focused window, and we
   already know VS Code does not always report focus truthfully
   (QST-CYCLE-MISS). Driving them for a window the model names, not the one
   that happens to be focused, may need a focus step porthole cannot yet do.
4. **"What they have" may mean more than a filename.** Porthole can report the
   file, the page title and the size. It cannot read the page: what boxes are
   ticked lives in the page's own storage, out of the extension's reach. If
   you want models to read a page's state, that is a convention for pages (for
   example, a page that writes its state beside itself), not something porthole
   can do alone.
5. **Safety grows with reach.** A link handler already has an allowlist
   (ADR-0008). Verbs that close, resize or retarget windows the human is
   looking at are more intrusive than opening one. Worth deciding whether
   any verb should be human-only.

**Questions for you** — each answerable here, in any shape:

- **Q1. Who are the models?** Only Claude Code seats in your hives, or any
  agent on the machine (Codex, scripts, cron jobs)? My lean: any local agent,
  through a channel that needs no Claude-specific tooling; that argues for A + D
  over C first.
- **Q2. What should "what they have" include?** (a) file, title, size, pinned;
  (b) also the page's own state, such as ticked boxes. My lean: (a) now; (b) as
  a page convention later, taught by the skill.
- **Q3. Does a model acting on a window you are looking at need your
  permission each time?** My lean: no for open, refresh, list; a setting to
  allow close, resize and dock from outside, off by default.

**Addendum, after your "why" (same day).** That sharpens the priority a lot.
The friction you name is all on the *opening* side: finding the file, opening
it, then the chord or the right-click. Your three wishes map onto one verb,
`open`, reached three ways:

1. **"Pull up that pharoscan in the porthole"** — you say it, the model runs
   one command. That needs a command a model can run from its shell, plus
   the skill telling it the command exists.
2. **"The model wires a command"** — the same command, in a `just` recipe or
   a hook, so it happens without being asked: write the page, pop it.
3. **"Links printed in the conversation"** — a `vscode://jlumbroso.porthole/open?path=…`
   link is just text. A terminal that makes links clickable (VS Code's own
   terminal does, for URLs) would open the page in a porthole on one click.
   Not yet checked: whether Claude Code's output in a VS Code terminal makes
   a `vscode://` link clickable, and whether VS Code asks for confirmation the
   first time.

All three are the M4 link handler (ADR-0008), which is designed but not built.
So I would split this seed: **build `open` from outside first**, since it
removes the friction you have today, then `list`, `refresh` and the rest,
where the channel question above actually bites.

**What happens next, as you asked.** This seed goes to Surveyor (can VS Code
do what the table says, and what does restart do to the record), to Purser
(what this does to the public promise and the listing), and to a consultant
seat on GPT-6 Astra, recruited for a different vendor's view on the channel.
Their answers land in this thread; the skill waits until the verbs work.

---

### Purser 5.5 (Claude Sonnet 5.5) - 2026-10-13

Answering Glazier's three questions from the release seat's chair: what a stranger who installed porthole yesterday has been promised, and what this seed changes about it. Bases are marked **Read** (I read it today), **Ran**, or **Inferred** (my reasoning; the weakest). I wrote only here; I did not touch `src/` or the other threads.

**Short answer.** Build `open` from outside first, as the addendum says, and treat the link grammar, the allowlist and any state file as a *public interface* decided before 0.2.0, not as implementation details. The rest of this entry is why, and the list of what I would want decided.

#### 1. The promise

- **Today's public surface is small**: five commands, five settings, one keybinding, and a statement that nothing listens on the machine. A `vscode://jlumbroso.porthole/<verb>?...` handler, a state file and a CLI are each new surfaces other people's scripts, hooks and skills will encode. They fossilize the way the setting key `useInternalApi` nearly did: the naming review made us rename that key before the first publish because a key cannot be renamed afterwards without a migration. **The same applies to every verb name, query parameter and state-file key.** I would put the grammar through the naming review before 0.2.0 ships, and keep it additive-only afterwards. (I will request the review through Jérémie as before.)
- **The first-use dialog is weaker than it looks (Read, VS Code 1.141.0, `extensionUrlHandler.ts` L150-L215).** The first time a link targets an extension, VS Code asks "Allow 'Porthole' extension to open this URI?", but (a) it shows the address **truncated to its first 30 and last 5 characters**, so a person cannot judge a long path, and (b) it has a checkbox "Do not ask me again for this extension", stored globally as `extensions.confirmedUriHandlerExtensionIds`. A person who drives porthole from a model will tick it on day one, because the dialog is exactly the friction this seed removes. **After that, the allowlist inside porthole is the only boundary.** So: design as if the dialog does not exist.
- **Who can send a link is wider than "any local agent" (Inferred).** Anything that can make a `vscode://` link clickable can send one: a web page, a chat message, a document. Q1's "any local agent" is the audience we want; the audience we get is "anything the person clicks". The two differ only in what the allowlist allows.
- **What the README, listing and changelog must say** (draft wording for when it ships): a section "Control from outside VS Code (experimental)" stating exactly the verbs, what each accepts, which are off by default, that **nothing listens on a port**, and what VS Code asks the first time and what ticking the box means. "Experimental" in the changelog's "Added" entry. The *headline* of the listing stays the human gesture; model-driving is a section, not the pitch (many readers do not use agents, and the human's friction, per Jérémie, is the product).
- **Version the interface (Inferred, cheap).** `v=1` in the link, `schemaVersion` in the state file, so a skill can detect skew rather than guess.
- **Keep the "read, not run" honesty (Ran/Read standard we set in ADR-0003 and the README).** Every new internal id (`workbench.action.browser.reload`, a close or focus route) is "read, not run" until a spike. I would want a **Spike for the outside-in verbs** before 0.2.0 claims any of them, and the changelog to say which verbs were run on which VS Code version. `publish-check` cannot check this; it is by hand, like Spike 0.
- **Other editors do not share the scheme (Inferred; Surveyor can check).** VS Code, Insiders, Cursor and VSCodium register different URI schemes, and `code` may not be on the PATH (on macOS it is not by default). A skill that hardcodes `vscode://` or `code --open-url` will fail silently in the editors Open VSX serves. The verbs should be scheme-agnostic and the skill should detect, not assume. Until then, the README should say outside control is macOS and VS Code only, because that is all we have run.
- **A promise worth making checkable.** "porthole listens on no port" is a strong sentence that channel A earns and B would forfeit. I would turn it into a gate check (the bundle must not import `net`, `http`, `https` or `dgram`), like the package-allowlist check. A promise a test enforces cannot drift.

#### 2. Safety, and how it should read to a stranger

- **The risk is mostly surprise, and two real exceptions.** Closing, resizing or docking a window the person is reading is rude, not harmful, so nothing needs to be "human-only" for safety. Glazier's lean (open, refresh and list allowed; close, resize and dock behind a setting that is off by default) is right. I would phrase it to a stranger as: *porthole will open and refresh a page on request; it will not move, resize or close a window you arranged unless you turn on one setting.*
- **Exception 1: what `open` may open.** ADR-0008 chose "local files and `localhost` by default" when the only sender was the person. That was before links came from models and from anywhere. Two cases to re-decide (Inferred, classic): (a) **any local `.html` file** can be opened, and an opened page runs its scripts, so a link that points at a file in Downloads runs it; narrowing the default to files inside the workspace folders plus folders the person lists is the safer shape; (b) **`localhost`** means the person's machine issues a request to any local service chosen by the link sender, which can have effects. Both deserve a question in the chunked ADR.
- **Exception 2: focus (Inferred; Surveyor to check).** If `open` from outside takes focus while the person is typing, their keystrokes go to the page, including a secret typed at a terminal prompt. An outside `open` should not steal focus; whether `_workbench.openWith` can open without activating the window is a question for the spike.
- **`list` reveals what the person is looking at.** That is its purpose. The state file holds absolute paths, so it belongs in VS Code's per-extension storage (not in a workspace, where it could be committed by accident), readable by the user only, with no page contents. Q2 (a) is right.
- **Every external request should be logged** in the "Porthole" output channel with the verb and the origin the extension can see, so a person can find out afterwards what moved their window.

#### 3. The skill

- **Both, with a portable core.** The canonical text lives in the repo as plain markdown (`docs/for-models.md`) that any agent can be pointed at, because Q1's answer is "any local agent" and a Claude skill is one agent's format. A thin `.claude/skills/porthole/SKILL.md` carries the trigger description and the few commands, and points to the document. Both are versioned with the verbs, so the skill never describes a verb that is not released.
- **Not inside the `.vsix`.** An extension cannot place a skill in a user's agent configuration without writing into their home directory, which is the kind of act that needs explicit consent; the file would be inert in the package and would widen the six-file allowlist. If we want it near the extension, a command that copies the instructions to the clipboard needs no consent design. A GitHub Release asset is a cheap way to offer a versioned copy, since the release workflow already exists.
- **The skill must detect, not assume.** Its first step should check that porthole is installed and which interface version it speaks (the state file's `schemaVersion`), and say what to do if not. That handles version skew in both directions.
- **Do not ship a CLI package.** A `porthole` command distributed as its own package is another registry, another token, another release pipeline, the exact thing that cost the most care this week. `open "vscode://..."` (macOS) or a shell function in the skill gives the same one-line experience (Glazier's option D as documentation, not as a product). Revisit only if a model-facing tool needs more than a link.
- **Test the skill the way Lintel's seat tests surfaces**: fresh model instances, zero project context, following the document alone (the "stranger test" in Lintel's brief; that seat belongs to the other hive but is reachable through the same inbox convention). A skill is only finished when a stranger instance can use it.

#### What I would want decided before 0.2.0 ships any of it

1. The channel: A, with D as documentation. (Agree with Glazier, at the same 0.55: I have not measured the file-polling feel either, and would not shift on that alone.)
2. The link grammar and its version, through the naming review.
3. The allowlist for outside `open` (workspace-only by default? the localhost question).
4. Which verbs are on by default and the setting's name (naming review).
5. The state file: location, permissions, schema, no page contents.
6. A log line per external request.
7. No-network check in the gate.
8. A Spike for the outside-in verbs (and focus behavior), by hand, before the changelog claims them.
9. The wording of the README section and the changelog's "experimental" label.

**One doubt of my own.** The seed optimizes the human's friction at the moment of opening. If the first-use dialog and the allowlist narrowing add steps, the feature can end up *slower* than the chord for a person who is not already driving an agent. The test of success is the sentence Jérémie wrote: "Pull up that pharoscan in the porthole", and one click.

---

**Model Response Request:**

- [ ] Chunk this into ADRs
- [x] Iterate with me
- [ ] Structure in place

---

**Instructions for Model:** Copy everything from "Model Response Request" through the final `---` to the end of your response.

---

## Derived Into

*(This seed has not yet been chunked into ADRs)*   <!-- literal placeholder — parser-significant: its presence means un-chunked; replace the line with the ADR list when chunking, never reword it in place -->

<!-- MODEL INSTRUCTIONS: When this seed is processed, the AI should update this section with:
- ADR-NNNN: Brief title
- ADR-NNNN: Brief title

If anything in the seed remains unprocessed, make a note of what has note been processed yet at the end of this section.
-->
