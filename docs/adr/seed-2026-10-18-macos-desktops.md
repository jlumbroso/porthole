<!-- adr template version: "seed 3.10.0" -->

# SEED: Which macOS desktop a floating window opens on

- **Date**: 2026-10-18
- **From**: Jérémie Lumbroso

<!-- MODEL INSTRUCTIONS: look for "Model Response Request" and engage dialogically and epistemically until chunking the seed into ADRs following `adr.md` + referencing ADRs in "Derived Into" section, see instructions below.
-->

---

## Brain Dump

Jérémie, 2026-10-18, in chat with Glazier, right after the outside-`open` check passed:

> "One open question is I wonder if we can control the macOS desktop on which it opens — and if we can find out which macOS desktop our VSCode workspace is, etc. — could be a seed. I could do the research on perplexity."

---

**Model Response Request:**
<!-- literal sensor block — parser-significant: tooling reads these exact checkbox labels as the seed's declared lifecycle state; do not reword them -->

- [ ] Chunk this into ADRs (I'm ready to formalize)
- [x] Iterate with me (keep exploring)
- [ ] Structure in place (organize but don't split)

---

## Thread

### Glazier 5.5 (Claude Opus 5.5) - 2026-10-18

**Why it matters.** Outside `open` (ADR-0013) lets a model put a page in front of you. "In front of you" assumes the window appears on the desktop you are looking at. macOS calls each desktop a **Space** (Mission Control, Control+Up). If VS Code sits on Desktop 2 while you work in a browser on Desktop 1, a link sent from a terminal could (a) open the floating window on Desktop 2, where you will not see it; (b) pull you over to Desktop 2; or (c) open it on Desktop 1. Which one happens decides whether outside `open` is useful when VS Code is not on your current desktop, and whether Porthole needs a setting for it.

**What I know, labelled by how I know it.**

- **Read (VS Code 1.141.0 source, today):** VS Code never calls Electron's `setVisibleOnAllWorkspaces`, the one call that makes a window appear on every Space (`git grep` over `src/` finds nothing). So a floating window today belongs to one Space, like any other window.
- **Inferred, unverified (my general knowledge, versions uncertain):**
  - macOS has **no public API** for Spaces. Apps such as yabai or Hammerspoon use private CoreGraphics/SkyLight functions (`CGSGetActiveSpace`, `CGSCopySpacesForWindows`, `CGSCopyManagedDisplaySpaces`) to *read* which Space is active and which Space a window is on. *Moving* a window to another Space has been restricted in recent macOS versions; yabai needs System Integrity Protection partly disabled for it.
  - macOS normally puts an app's new window on the **active** Space. A System Settings switch, *"When switching to an application, switch to a Space with open windows for the application"* (Desktop & Dock), can make macOS jump you to the Space that holds the app's other windows instead.
  - Electron's `setVisibleOnAllWorkspaces(true)` works on macOS and is the documented way to make a window follow you across Spaces; it is available to VS Code's own code, not to an extension.
- **Not known at all:** what a VS Code *floating* window does when it is created by a link while VS Code's main window is on another Space; whether that differs with the System Settings switch above; and whether "Always on Top" floating windows behave differently.

**What Porthole could do, in rough order of cost** (none decided):

1. **Nothing, documented**: the README says where the window appears (once a run has shown it) and how to change the System Settings switch.
2. **A pin-to-all-desktops option** would need VS Code to call `setVisibleOnAllWorkspaces` for its floating windows; an upstream issue in `docs/issues/vscode/`, like the four already filed.
3. **Reading which Space VS Code is on**, to tell a model "the window opened on another desktop", would need a private macOS API from outside VS Code (a small helper the client in ADR-0014 runs), never from inside the extension (the bundle check refuses process modules).

**Questions for your Perplexity research**, phrased to get dated, version-specific answers:

1. On macOS 15 and 26, is there any public API (AppKit, Accessibility, or Shortcuts/AppleScript) that reports which Space (desktop) is active, or which Space a given window is on? If only private APIs exist, which ones still work without disabling System Integrity Protection?
2. On those versions, can a process move another app's window to a different Space without disabling System Integrity Protection? What do yabai, Hammerspoon and AeroSpace currently document about this?
3. When an Electron app creates a new `BrowserWindow` while the app's existing windows are on another Space, on which Space does the new window appear, and how does the "When switching to an application, switch to a Space with open windows for the application" setting change that?
4. Does Electron's `setVisibleOnAllWorkspaces` still work on macOS 26, and does it interact with `setAlwaysOnTop` levels such as `floating` or `screen-saver`?

**A by-hand spike, once the research is in** (I will write it as a step-by-step QST in the ADR this chunks into): VS Code on Desktop 2, a terminal on Desktop 1, send one link, and say which desktop the floating window appears on, with the System Settings switch off and then on.

---

**Model Response Request:**

- [ ] Chunk this into ADRs
- [x] Iterate with me
- [ ] Structure in place

### Jérémie Lumbroso - [Date]

[Your response if continuing]

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
