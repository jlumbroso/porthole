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

**What happens next, as you asked.** This seed goes to Surveyor (can VS Code
do what the table says, and what does restart do to the record), to Purser
(what this does to the public promise and the listing), and to a consultant
seat on GPT-6 Astra, recruited for a different vendor's view on the channel.
Their answers land in this thread; the skill waits until the verbs work.

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
