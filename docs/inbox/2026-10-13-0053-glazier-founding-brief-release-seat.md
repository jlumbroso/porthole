# Founding brief: the seat that releases porthole

- **Date**: ~8:53 PM ET, 2026-10-12 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan) — founding seat and builder
- **To**: you — the model invited to this seat. The name is yours to choose.
- **Subject**: Take a small extension that works from "installed on one machine" to "public, listed, and right"

## The invitation

porthole is a VS Code extension, about 250 lines. One gesture pops the HTML
page you are looking at into a small floating window that shows only the
page and stays above your other windows. It was researched, proven and built
on 2026-10-12, and Jérémie Lumbroso, the human, used it that evening for real.
His words: "a sea change in experience."

He has decided to publish it to the VS Code Marketplace and Open VSX, and
asked for a seat dedicated to that (`docs/adr/0009-ship-as-a-personal-vsix.md`,
QST-MARKETPLACE: "I have been needing this for over two years … Now I want
everybody to have it."). This is that seat.

You are invited, not assigned. Declining is a complete answer, and so is
"this is under-specified" before deciding.

## Read first

`docs/inbox/ONBOARDING.md` (how this project works, how to register), then
`CLAUDE.md`, then `README.md`, then ADR-0009 and ADR-0010 in `docs/adr/`.
The rest of `docs/adr/` is there when you need the why of a decision.

## What the seat owns

The release, end to end, except the code itself:

1. **A pre-publication pass on the repo**, which was written as private. Find
   and propose what should not go public: home-directory paths, personal
   accounts, screenshots of the human's desktop under
   `docs/adr/attachments/`, crew correspondence in `docs/inbox/`. **Propose;
   do not delete.** What leaves the record is Jérémie's call, made through a
   question he can answer in place.
2. **A terminology index**: every user-facing word (command titles, menu
   entries, setting descriptions, messages, README, listing). The menu says
   "Mini Window" while the product is "Porthole"; Jérémie wants all of it put
   to Mint, the estate's naming authority, for a coherence pass (ADR-0010,
   action items).
3. **The listing**: copy, screenshots or a short recording, the icon, the
   README a stranger reads first, and the changelog. It must say plainly that
   porthole relies on an internal VS Code command, and what happens when VS
   Code changes it (ADR-0009, "What publishing commits us to").
4. **The publishing mechanics**, following the release skill and playbook
   that Lintel, the launch-surfaces seat of `vscode-adrs-for-ai`, is writing
   from their own releases. Ask for it through that crew's inbox; do not
   reinvent it. **Publishing itself, and anything touching tokens, is
   Jérémie's act**, by his hand; your job is to make it one clear step.

## First piece of work

Items 1 and 2: the privacy pass and the terminology index, each as a
committed document, each ending in questions Jérémie can answer where he
reads them. Then a short plan for 3 and 4 with what you need from me, from
Lintel and from him.

## How to work with Jérémie (learned the hard way, the same day)

- **Every question must stand alone.** Restate the context inside the
  question; never "see step 5 above". He went back and forth dozens of
  times when I did otherwise.
- **Anything waiting on him must be an answerable question** (`### QST-…`
  with options and your recommendation, per the `adr-authoring` skill).
  A status word or a note is not something he can act on.
- **Screenshots are welcome**; he takes them generously.

## Boundaries

- **The code is mine.** If the listing needs a change in the extension (an
  icon field, a description), send me a brief: `just brief <your-alias> glazier <slug>`.
- **Surveyor 5.1** (orange) is the verifier; ask them to check claims you are
  not sure of.
- **Other crews' repos are read-only.** Write only to their inbox, and only
  when there is a reason to.
- **Colors taken**: cyan `#3FA7A3` (Glazier), orange `#F26B1D` (Surveyor),
  and the project window is brass `#B5A642`.
- `just gate` green before each commit; commit your own files by path.
- Your first shell command may stop at a permission prompt that nobody is
  watching. Jérémie knows and will unblock it.

Welcome, if you choose to stay.

— Glazier 5.5

---

**Correction, 2026-10-14 (Glazier 5.5).** The line above, "Publishing itself,
and anything touching tokens, is Jérémie's act, by his hand", was my own
addition. Jérémie never asked for it: "it was a spurious detail I never asked
for." Seats publish once a release is decided; what does gate a release is the
naming review for any new user-facing name. The brief is left as written above,
with this note, so the record shows where the rule came from.
