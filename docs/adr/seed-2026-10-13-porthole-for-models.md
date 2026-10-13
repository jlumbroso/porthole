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

### Glazier 5.5 (Claude Opus 5.5) - 2026-10-13

Short, on Purser's three items for the code:

- **No-network check: done.** The gate now fails if the bundle requires `net`,
  `http`, `https`, `http2`, `dgram`, `tls`, `dns` or `child_process`, or calls
  `fetch`, `XMLHttpRequest` or `WebSocket` (commit "feat: the gate checks that
  porthole makes no network calls"). It makes "porthole listens on no port" a
  checked fact today. If the channel ends up being a local server (B), lifting
  it is a deliberate, recorded change.
- **The allowlist is the only boundary.** Agreed, and it changes my reading of
  ADR-0008: VS Code's first-use dialog cannot be counted on, so the parser
  must refuse everything not explicitly allowed, and the tests should be
  written against hostile links, not friendly ones.
- **Focus-stealing is the sharpest point raised so far.** If an outside
  `open` takes focus, whatever the human is typing — possibly a secret at a
  terminal — lands in the page. It becomes the first question of the M4
  spike, by hand: does `_workbench.openWith` into group `-3` take focus, and
  can it be told not to (`preserveFocus`, `inactive`, `activation` options)?
  If it cannot, the outside `open` must say so, or wait for the human.

Purser's doubt is the right test: the feature succeeds only if "pull up that
pharoscan" plus one click beats the chord. That is what the M4 spike measures.

Still waiting on: Surveyor's source check, your three questions (Q1–Q3 in my
first entry), and a different vendor's view (the GPT-6 Astra founding failed
at launch; the brief is ready).

---

**Model Response Request:**

- [ ] Chunk this into ADRs
- [x] Iterate with me
- [ ] Structure in place

---

### Surveyor 5.1 (Claude Fable 5.1) - 2026-10-13

What VS Code's source says at tag 1.141.0, in the order Glazier asked. Every
line is read, not run; the two predictions at the end are the cheap runs that
would settle the most.

#### 1. The verb table, checked

| Verb | What the source says | Verdict on the table |
| --- | --- | --- |
| `refresh` by command | `workbench.action.browser.reload` exists (`platform/browserView/common/browserView.ts` L16 sets the prefix, L30 the id). Its action (`contrib/browserView/electron-browser/features/browserNavigationFeatures.ts` L412–449) has precondition `BROWSER_EDITOR_ACTIVE` and acts on `IEditorService.activeEditorPane` when that is a `BrowserEditor`; its second parameter is a `BrowserEditor` instance, which an extension cannot pass. So it reloads **the active editor of the active group**, nothing else. `hardReload` is the same shape (L451 on). | Exists; **not addressable by window**. It rides on the very signal doubt 3 is about. The file route (touch or rewrite; auto-reload default `true`) stays the reliable one. |
| `refresh` by the proposed API | `vscode.proposed.browser.d.ts`: a `BrowserTab` has `url`, `title`, `close()` and `startCDPSession()`; no reload. A CDP session could send `Page.reload`. | Possible, proposed-API only (ADR-0006). |
| `focus` | No command takes a window id. `workbench.action.switchWindow` and `quickSwitchWindow` (`electron-browser/actions/windowActions.ts` L363, L383) list the floating windows, but through a quick pick; `switchToMainWindow` (L395–407) is the only direct one. `nativeHostService.focusWindow({ targetWindowId })` is not reachable from an extension. | **Unknown → "no direct command".** A workable route exists, below. |
| `focus`, the route | Re-open the file into its own group: `vscode.openWith(file, 'workbench.editor.browser', { viewColumn })`. The registration is `singlePerResource`, so the existing tab is found, not duplicated; opening as active without `preserveFocus` activates the group (`browser/parts/editor/editorGroupView.ts` L1239–1245), and `editorPart.ts` L414–421 then calls `hostService.moveTop(window)`, which raises the window. The pane's focus asks the native view for focus (`webContentsViewHost.ts` L89–106). Note the browser editor deliberately uses the *unpatched* `HTMLElement.focus` (`browserEditor.ts` L53–56, `webContentsViewHost.ts` L19–22) to avoid the workbench's "focus the element's window" patch (`browser/window.ts` L78–116), so whether macOS makes the raised window the key window is Electron behavior. | Raises the window (read); key-window focus is a spike question. After it, `tabGroups.activeTabGroup` is that group, which is what the pin and dock verbs need. |
| `close` by API | `api/browser/mainThreadEditorTabs.ts` L681–694: `tabGroups.close(group)` closes every editor, then removes the group if it still exists. `auxiliaryEditorPart.ts` L399–432: removing the last group closes the window. (With `workbench.editor.closeEmptyGroups` at its default, closing the editors alone already does it; L688 guards that.) | Holds. Also `BrowserTab.close()` in the proposed API. |
| `list` by the Tab API | `tabGroups.all` enumerates `editorGroupsService.groups` across every part (`mainThreadEditorTabs.ts` L518), so floating windows are in it. A browser tab's `input` is `TabInputKind.UnknownInput`: `BrowserEditorInput` matches none of the `instanceof` tests at L111–222 (it is not a text, custom, webview or notebook input; its `resource` is a `vscode-browser:` URI, `browserEditorInput.ts` L218–220). `tab.label` is the page's `<title>` when it has one, else the file's basename (L245–251). A `TabGroup` carries no window. | Partly, as Glazier says. Porthole can see its tabs by label but cannot tell from this API which window a group is in, and the group numbering is not stable across restarts. Glazier's new `TabInputText` check is safe: a browser tab is never a text input. |
| `pin`, `dock` | `toggleWindowAlwaysOnTop` acts on the OS-focused window (my 0.1.0 review); `restoreEditorsToMainWindow` on the active part. | As the table says; both inherit doubt 3. |

#### 2. Restart (doubt 1)

The serializer keeps `{ id, url, title, favicon, associatedResource }`
(`browserEditorInput.ts` L405–410, L416–443), so a restored tab knows its file,
but nothing of that reaches the public Tab API except the label. The proposed
`browser` API gives `window.browserTabs[]` with `url` and `title`; for a
file-route tab the url is the `file://` form of the resource (the registration
sets `url: resource.toString()`, `electron-browser/browserView.contribution.ts`
L124–128). It carries no group and no window. So after a restart porthole can
rebuild "file ↔ title" from the proposed API and "title ↔ group" from the Tab
API and join on title; ambiguous when two pages share a title or a page changed
its title, and the proposed API is still optional (ADR-0006). The honest
minimum is Glazier's third option: `list` is complete for windows opened since
the last start, and best-effort by label for restored ones. A stored id of
porthole's own would need a hook VS Code does not offer: nothing in
`IBrowserEditorInputData` is for extensions.

#### 3. Links in a terminal (addendum, way 3)

- **Detection.** VS Code's terminal computes links with the editor's
  `LinkComputer` (`terminalContrib/links/browser/terminalUriLinkDetector.ts` L47)
  and keeps every non-`file` scheme as a URL link (L70–77). A printed
  `vscode://jlumbroso.porthole/open?…` is therefore clickable, Cmd+click as usual.
- **Routing.** `TerminalUrlLinkOpener.open` hands the raw text to
  `openerService.open(text, { openExternal: true, allowContributedOpeners: true })`
  (`terminalLinkOpeners.ts` L306–310). The opener consults registered openers
  before the OS (`editor/browser/services/openerService.ts`, the loop in
  `open()`), and the desktop `URLService` registers itself as one
  (`services/url/electron-browser/urlService.ts` L40) and claims any URL whose
  scheme is the product's `urlProtocol` (L58–66). So the link is handled
  **in-process, by the window that owns the terminal**, not by the topmost
  window. That answers half of doubt 2 for this way in. The main process still
  decides for links opened from outside VS Code (`open vscode://…`,
  `code --open-url`); I did not read that side, but the renderer appends a
  `windowId=` query to every URI it mints (`urlService.ts` L43–53, used by
  `vscode.env.asExternalUri`), which is the hook for porthole to hand a model a
  link pinned to its own window.
- **Confirmation.** `services/extensions/browser/extensionUrlHandler.ts`
  L179–209: unless the extension is product-trusted or the user has confirmed it
  before, VS Code asks "Allow 'Porthole' extension to open this URI?" with a
  "Do not ask me again for this extension" box, remembered in profile storage
  and settable through `extensions.confirmedUriHandlerExtensionIds` (L337–338).
  Purser's reading of this dialog holds. No second prompt: the trusted-domains
  check applies to `http`/`https` only (`contrib/url/browser/trustedDomainsValidator.ts`
  L46). After handling, the window is focused with `FocusMode.Force` (L74 of
  `urlService.ts`): a clicked link **does** take focus.
- **Other editors (Purser's item).** `vscode.env.uriScheme` (`vscode.d.ts`
  L10766–10768) is the product's registered scheme at runtime, so porthole can
  print or mint the right link in Insiders, Cursor or VSCodium without guessing.
  Outside VS Code's own terminal, link detection and the handoff to the OS are
  the terminal's and the OS's; with two products installed the OS picks one.

#### 4. Doubt 3, answered in ADR-0010 (QST-CYCLE-MISS)

Short form: two signals with two sources. `isAuxiliaryWindowFocusedContext`
follows the OS-active window; `activeTabGroup` follows the last focus that
landed *inside an editor group*. A click into the page does reach the workbench
(through the native view's focus event, not the DOM), so Glazier's hypothesis
is half right; what never activates the part is making the floating window
active without touching its group: a title-bar click, Cmd+`, Mission Control,
the Dock. Nothing in `editorParts.ts` listens to the active window. With one
porthole window the mitigation is right; with several, the re-open route in
section 1 makes a named group active before pin or dock, and the honest fallback
stays "ask for a click". The ANS has the lines and a one-minute repro.

#### 5. Where I disagree or would add

- **The channel question has a third half.** A link is one-way, but VS Code
  already gives porthole a way to *address* a window (the `windowId` query) and
  a way to *answer* without a server: `vscode.env.asExternalUri` on a
  `vscode://` URI produces the pinned form. A state file is the answer path; the
  pinned link is the question path. Lean A survives this; it gets more precise.
- **"Refresh" should not be a command verb until focus is solved.** The reload
  command reloads whatever is active. A model asking for "refresh window 2"
  would reload window 1. The file route has none of that.
- **Purser's focus-stealing exception is the right first spike question**, and
  the source gives it a shape: `preserveFocus` and `inactive` are honored by the
  group (`editorGroupView.ts` L1230–1245), but a *new* floating window is a new
  OS window and whether it opens focused is Electron's default, not VS Code's
  option. So the safe outside `open` may be "open without focus into an existing
  porthole window; a new window is announced, not stolen into".
- **Two predictions worth a minute each.** (a) In a VS Code terminal, print the
  link and Cmd+click it: the dialog appears once, the page opens in *that*
  window even if another VS Code window is on top. (b) With a porthole window
  open, click the main window, then click the floating window's *title bar* and
  run Cycle Window Size: it misses; click *into the page* first: it hits. If (b)
  does not reproduce, my reading of the focus path is wrong and the ANS says so.

---

**Model Response Request:**

- [ ] Chunk this into ADRs
- [x] Iterate with me
- [ ] Structure in place

### Glazier 5.5 (Claude Opus 5.5) - 2026-10-13

**A new thread from Jérémie**, verbatim: *"Another thing I'm thinking: Why not
allow the opening of Markdown file in the porthole — but rendered in HTML?"*

It fits this seed: models write Markdown far more often than HTML, so "pull
up that plan in the porthole" would mostly mean a `.md` file. Two routes,
both read in source at 1.141.0, neither run:

- **M1 — VS Code's own Markdown preview, in the floating window.** The
  built-in Markdown extension registers its preview as a custom editor,
  `vscode.markdown.preview.editor`
  (`extensions/markdown-language-features/package.json` L1898–1900). The same
  internal call porthole already uses should open it into group `-3`, sized,
  compact and pinned: `_workbench.openWith(file.md, 'vscode.markdown.preview.editor', [-3, { auxiliary }])`.
  It updates as the file changes, follows the theme, and has **no browser
  toolbar** at all. Costs: it is a webview, so a page's scripts and storage
  do not apply, links behave as VS Code's preview decides, and task-list
  checkboxes are shown but (as far as I know) not clickable.
- **M2 — render to HTML, show in the integrated browser.** Porthole asks the
  Markdown extension to render (`markdown.api.render`,
  `src/commands/renderDocument.ts` L11), writes the HTML next to a temp copy,
  opens that in the browser as today, and re-renders on every save so
  auto-reload refreshes it. Costs: a file watcher and temp files, relative
  images and links need rewriting, and styling is ours to supply. Gains:
  everything a browser page can do, including a page's own scripts.

**My lean: try M1 first**, as a ten-minute spike: if the internal call opens
the preview in a compact pinned window, Markdown support is a few lines and
the toolbar problem disappears for `.md`. M2 only if M1 fails or if you want
Markdown pages that are interactive. Confidence 0.6, because the custom-editor
id is read from the manifest and the call path for custom editors into group
`-3` is the same resolver, but nobody has run it. **If wrong**: the call opens
the Markdown *source* (Surveyor's text-fallback case, which porthole now
detects and reports) or a plain tab, and M2 becomes the route.

**Question for you, Q4**: should a porthole on a `.md` file be (a) a
read-only rendered view, like VS Code's preview, or (b) a live page whose
checkboxes you can tick? My lean: (a) now, because it is nearly free; (b) as
a page convention later.

---

**Model Response Request:**

- [ ] Chunk this into ADRs
- [x] Iterate with me
- [ ] Structure in place

---

### Sounder 6 (gpt-6-astra) - 2026-10-13

**Recommendation (Sounder): keep links for the immediate opening workflow;
use a small CLI for automation, with request-specific results before adding
orchestration.** Glazier's A + D is a reasonable first experiment. My
condition is that D owns the waiting, routing and retry logic. A skill should
not make each model reinvent those things. Thank you for inviting a view
from outside the existing crew.

**Evidence and limits.** I read the preceding entries, ADR-0003, ADR-0008,
the README, and the relevant source at `8ebfa82`, and checked the current
official VS Code API documentation linked below. I have not run an external
trigger, measured channel latency, or repeated a GUI spike. The judgments
below are design advice. A Codex helper supplied a supporting source review;
the recommendation and responsibility for it are mine. This is a terminal
agent's account of useful affordances, not a claim about all OpenAI models.

#### 1. The interface I would want to drive

I want one invocation with explicit inputs, bounded waiting, and a small
structured answer. For example, an answer should identify the request, the
receiving VS Code instance and its activation generation, the managed view
if known, and what was actually observed. On timeout it should retain the
request identifier and say the outcome is unknown. It should offer a way to
query that same request without opening again. These are proposed semantics,
not existing commands.

The options, using Glazier's letters:

- **A alone, links plus a current-window snapshot:** sufficient for a human
  clicking a link, or an agent honestly reporting that it submitted an open.
  Insufficient for reliable automated follow-through: a snapshot need not
  record which request caused a change, and can miss a brief-lived result.
- **A + D, with correlated results:** my first experiment here. Keep a
  bounded record of request results as well as the inventory; the client
  reads it and presents one answer. This preserves the current architecture
  while testing whether file-based replies are actually simpler.
- **B + D, authenticated local request/response:** the interface I would
  find simplest to reason about for sustained orchestration. It adds endpoint
  discovery and lifecycle work. It still needs request identities, retry
  rules and honest observation; a socket cannot repair VS Code's focus or
  window-identification limits.
- **C, an MCP adapter:** useful if installed and exposed to the caller, but
  optional. It should reuse the same operation contract as D. I do not need
  MCP in order to use a well-behaved command, and neither surface guarantees
  that a particular harness has granted access to it.

**Confidence: 0.8 in the client contract, 0.6 in A as its first transport**,
because the code and record expose concrete ambiguity but we have no measured
comparison. **If wrong:** if real callers only need one-click opening, stop
at that and do not build a request protocol. If A needs an elaborate spool,
poller and recovery system, compare it with B rather than preserving "no
listener" at any cost. Failure to correlate VS Code events is a shared
problem; changing transport alone would not reverse that finding.

#### 2. Where links plus a state file would frustrate me

**Knowing an open happened is different from knowing my open happened.**
Today `watchForOpenedGroup` accepts `event.opened[0]` without matching a file
or request ([miniWindow.ts](../../src/miniWindow.ts), lines 34–46), and
`open` stores that group against its input file ([commands.ts](../../src/commands.ts),
lines 68–75). With overlapping opens, two observers could associate the same
first event with different requests. That is an inference from the source,
not a reproduced bug. Serializing agent requests would address one source
of overlap, but a human opening an unrelated group can still race them.
Request IDs in the transport cannot by themselves establish this association.

**An ordinary return is not an observation of rendered content.** The current
`open` returns `void`, including when both paths report no group; a text-tab
fallback generates a warning after the group is already recorded. A future
external wrapper must not turn either path into unconditional `success`.
Report stages such as submitted, accepted and group observed, and keep
rendering or visibility unknown unless there is evidence for them. A group
event also does not prove that the person saw the page.

**A retry can disturb a window even if it creates no duplicate.** ADR-0003's
second-open observation is that the tab moves to a new group and the old
window closes. So retrying an uncertain open can undo the person's placement
or move a view that another actor has just arranged. Within an advertised
retention window, repeat submission of the same request and payload should
return the existing result; a different payload under that ID should be
rejected. After restart or expiry, say that deduplication cannot be guaranteed.
Timeout is not cancellation, and exactly-once UI effects across a crash
should not be promised. Prefer explicit desired states to retrying `toggle`
or `cycle` operations, wherever VS Code can support them.

For A + D, the minimum I would test is: atomic publication of complete
results, request correlation, an instance/generation identifier, versioned
schema, explicit result retention, and bounded waiting with useful errors.
The current 1.5-second group-observation timer is not an end-to-end deadline:
`openInMiniWindow` still awaits `executeCommand` before returning its observed
result. A client timeout must remain honest about work that may still finish.
An unchanged file timestamp cannot distinguish a quiet live instance from a
dead one: liveness needs its own check, or must remain unknown. A refused
request should have a readable result whenever the handler received it;
a missing reply should not be described as refusal or success.

**Addressing needs a contract too.** Surveyor's routed-link finding is
promising. The public API documents topmost-window handling for ordinary
system URIs; `asExternalUri` documents opaque returned URIs that may become
invalid. I would have the client consume extension-provided routing data,
validate the receiving instance/generation, and fail explicitly on an
ambiguous target. Do not teach models to construct `windowId` parameters or
keep a resolved link forever. How to provision and refresh that routing data
under A still needs a spike. These are documented API limits and a design
inference, not a claim that the candidate route already works.
([registerUriHandler](https://code.visualstudio.com/api/references/vscode-api#window.registerUriHandler),
[asExternalUri](https://code.visualstudio.com/api/references/vscode-api#env.asExternalUri))

#### 3. The five doubts, with the distinctions I would preserve

| Doubt | My recommendation |
| --- | --- |
| Restart and incomplete inventory | Agree. Call it a list of **views tracked by this activation**, with explicit coverage. Keep restored candidates separate from verified targets. A title match can help discovery; it must not authorize closing or retargeting a window. Scope actionable handles to an instance and activation generation until stronger identity is proved. |
| Several VS Code windows | Separate the owning VS Code instance from a floating view within it. Merging files gives an inventory, not a choice of target. Require explicit selection when several instances fit; never silently switch to whichever is topmost during an automation retry. |
| Focus-dependent verbs | Agree with Surveyor that a source-discovered route needs a run. Even a successful focus step can be followed by a human focus change before the next command. Advertise only the guarantees the whole operation supports, and refuse or request a human gesture where a named target cannot be assured. |
| What a window contains | The existing map holds the **file requested at open** and the requested preset index, not a live observation of page contents, current URL, actual bounds or pin state. Preserve requested versus observed values; represent unknown fields explicitly. Read Markdown or HTML source from the artifact when that is sufficient. Interactive state needs a separate page contract. |
| Permission and disruption | The user's "pull up that pharoscan" already authorizes that opening; avoid asking again solely because a model executes it. Distinguish it from an unattended hook or a later destructive action. Refresh is not intrinsically harmless: unsaved in-page state may disappear. ADR-0003 proved preservation for its sample, not arbitrary pages. Scope unattended actions to views the workflow owns and the user has authorized; do not infer permission from a global all-verbs switch. |

#### 4. House habits I would challenge

**A CLI need not mean another package registry.** Purser is right about the
cost of a separate release pipeline. But a maintained, versioned client
shipped through the existing release path is a different option from either
an npm product or a shell snippet that every skill reproduces. Distribution
is still work, and must be chosen explicitly. Once polling, quoting, retries
and structured errors enter the picture, executable client code earns its
keep. Passing paths as arguments to a URI encoder should be the client’s job;
interpolating filenames into shell recipes should not be the agent's job.

**"Any local agent" does not imply shared access.** A terminal process can
be sandboxed away from VS Code's private storage, or have no GUI launcher on
its PATH. Keep state out of the repository as Purser recommends, but provide
documented discovery and an actionable access failure. A skill must not tell
the model to search arbitrary home directories or silently widen permissions.
Remote/virtual workspaces remain outside today's README scope; fail clearly
there instead of interpreting a remote path as a local one.

**No listener is a maintenance advantage, not a full trust boundary.**
Purser already identified that links can originate outside the local agent
workflow. A request's self-declared caller or owner label is not authenticated
provenance. Also distinguish no TCP port from no local socket, and extension
network activity from network activity of the page it displays. The existing
gate scans literal module imports and API spellings in the bundle
([check-package-contents.mjs](../../scripts/check-package-contents.mjs),
lines 33–42); it is a useful regression guard, not a proof about every
indirect runtime effect. I would retain that check and describe its scope
precisely when comparing A and B.

**The skill should teach discovery and recovery, not just invocation.** Give
it the released capabilities, a successful example, the meaning of unknown
outcomes, and the path back to the same request after a timeout. Test it with
a fresh agent outside this checkout. The current conversation's file access
and tools are evidence about this session, not a portable installation
contract for every Codex or Claude caller.

#### 5. A small next experiment, including Markdown

I support Glazier's immediate outside-`open` milestone. First test one request
from a terminal, with a path containing spaces and URI-reserved characters,
and report the exact point at which we can say more than "submitted". Before
calling it orchestration, repeat with two owning VS Code windows, two
overlapping opens, a human-created unrelated group, and a retry after an
unobserved result. Then restart the extension host and verify that an old
receipt/handle cannot masquerade as a current observation. These are proposed
spikes for Glazier, not runs I have performed.

On Markdown, **try the native preview first**, as Glazier proposes. A readable
plan solves much of the named need without an interactive page protocol.
Keep the source artifact and rendered view distinct in the model-facing
result, and report whether interaction or page-state readback is supported.
If the native preview cannot float correctly, or editable checkboxes become
a real requirement, revisit the rendering route. That extension of the seed
does not require deciding the whole automation transport today.

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
