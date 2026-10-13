<!-- adr template version: "adr 3.11.5" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs-for-ai
-->

# Spike 1: Markdown preview and focus

- **Date**: 2026-10-13
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Jérémie Lumbroso (human); Glazier 5.5 (Claude Opus 5.5)

**TL;DR**: Two by-hand checks, each a self-contained question with every step written out: can VS Code's own Markdown preview open in a compact pinned floating window, and does opening a floating window take the keyboard away from the app you are typing in.

---

## Originating Context

**Source**: [ADR-0015](0015-markdown-in-a-floating-window.md) (Markdown, route 1) and [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), QST-OPEN-FOCUS (Purser's point that an outside open could capture a password being typed). Jérémie asked that any spike be issued as questions he can follow step by step.

**Agency Grant**: Implement the spike as you see fit; stop before building further.

---

## Explicitation

**What was added for this spike**: four commands in the throwaway spike extension (`spike/extension.js`), all named "Porthole Spike: S1-…". They write a log to `spike/.run/spike.log`, which I read afterwards; you do not need to copy anything from it. They were walked once outside VS Code against a stub (`scripts/ephemeral/2026-10-12-smoke-spike-extension.js`, seven checks passed). **They have not been run in a real VS Code.**

**Each question below stands alone**: it repeats how to start the spike window, so you can answer either one first.

**What the source says, added before the run** (Surveyor 5.1, 2026-10-13, read at 1.141.0, not run): S1-A is not blocked by the spike window's disabled extensions, because built-in extensions such as Markdown are exempt; and S1-D will most likely still take the keyboard, because a *new* floating window is created without any "do not focus" option, while a quiet re-open into an *existing* floating window would not move focus. My predictions below are left as written.

**Confirm**: Jérémie, by answering the two questions.

---

## Questions

### QST-SPIKE1-MD: Does VS Code's own Markdown preview open in a compact, pinned floating window, and update when the file changes?
- Status: unanswered
- Why asking: If it does, porthole can open `.md` files rendered for the cost of a few lines, with no browser toolbar (ADR-0015, route 1). If it does not, porthole must render Markdown to HTML itself (route 2).
- Need: pick a letter (or override — any shape answers). About two minutes. A screenshot of what appears in step 4 would help.

**Steps.** One action each.

1. **Open the Run and Debug view** in the porthole VS Code window: press **Shift+Cmd+D** (or click the triangle-with-a-bug icon in the left bar).
2. **Choose the spike configuration.** At the top of that view is a drop-down list. Choose **Spike 0 — one-shot pop-out**. (Not "Run Porthole".)
3. **Start it.** Click the green ▶ button next to the drop-down. A second VS Code window opens; its title starts with `[Extension Development Host]`. Do the remaining steps in that second window.
4. **Run S1-A.** Press **Shift+Cmd+P**, type `S1-A`, and press **Enter** on "Porthole Spike: S1-A — Pop out a Markdown file as VS Code's preview". Look at what appears.
5. **Run S1-B.** Press **Shift+Cmd+P** again, type `S1-B`, and press **Enter** on "Porthole Spike: S1-B — Rewrite the Markdown file". This rewrites the file with the current time in the line "Written by the spike at …".
6. **Look at the window from step 4** without touching it: did the time in that line change by itself?
7. Close the second VS Code window.

Options:
- **A — rendered, floating, and live**: a small separate window, no tabs or status bar, staying in front of other apps, showing a heading "Sample notes", a list with two boxes (one ticked), and a small table; after step 5 the time changed by itself.
- **B — rendered, but not like a porthole**: the rendered notes appeared, but in a large window, or with tabs, or not staying in front, or as a tab inside the second VS Code window. Say which.
- **C — the source, not rendered**: you saw lines starting with `#` and `- [ ]` (the Markdown source), possibly with a message from porthole saying it opened as text.
- **D — nothing, or an error message.**

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**A — rendered, floating and live** (a prediction). *Rationale*: the preview is registered as an editor of its own, `vscode.markdown.preview.editor` (`extensions/markdown-language-features/package.json` L1898–1900 at tag 1.141.0), and porthole's internal call opens any registered editor into a floating window the same way; VS Code's preview already refreshes when the file changes. *Confidence*: 0.6 — because the call path for this kind of editor into a floating window has not been run, and the spike window starts with your other extensions disabled, which I believe leaves VS Code's built-in Markdown extension on but have not checked. *If wrong*: B means the preview works but needs different window options; C or D means route 2, rendering to HTML, becomes the way (ADR-0015, QST-MD-MODE flips to B).

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-SPIKE1-FOCUS: When a floating window opens while you are typing in another app, do your keystrokes stay in that app?
- Status: unanswered
- Why asking: A model may open a floating window while you are typing elsewhere, perhaps a password. If opening takes the keyboard, your keystrokes land in VS Code instead (ADR-0013, QST-OPEN-FOCUS). This checks the normal open, and an open that asks VS Code not to take focus.
- Need: pick a letter (or override — any shape answers). About three minutes. Type only harmless letters.

**Steps.** One action each.

1. **Open TextEdit** (press Cmd+Space, type `TextEdit`, press Enter, then choose **New Document**). Place it so you can see it beside VS Code.
2. **Start the spike window**, if it is not already open: in the porthole VS Code window press **Shift+Cmd+D**, choose **Spike 0 — one-shot pop-out** in the drop-down at the top, and click the green ▶. A second window titled `[Extension Development Host]` opens.
3. **Run S1-C** in that second window: **Shift+Cmd+P**, type `S1-C`, press **Enter** on "Porthole Spike: S1-C — Pop out in 5 seconds". A notice says the page pops out in 5 seconds.
4. **Within those 5 seconds, click into the TextEdit document and start typing** a long line of a single harmless letter, such as `aaaaaaaa…`, and keep typing until 3 or 4 seconds after a small floating window has appeared.
5. **Write down for S1-C**: after the floating window appeared, did the letters keep appearing in TextEdit (yes), or did they stop appearing there (no)?
6. **Close the floating window** with its red close button, top left.
7. **Repeat steps 3 to 5 with S1-D** instead of S1-C: type `S1-D` and press **Enter** on "Porthole Spike: S1-D — Pop out in 5 seconds, asking VS Code not to take focus". Write down the same yes or no.
8. Close the second VS Code window. TextEdit can be closed without saving.

Options:
- **A — neither took the keyboard**: letters kept appearing in TextEdit after both S1-C and S1-D.
- **B — only the normal open took it**: after S1-C the letters stopped appearing in TextEdit; after S1-D they kept appearing.
- **C — both took it**: after both, the letters stopped appearing in TextEdit.
- **D — something else**: for example, no floating window appeared, or TextEdit came back to the front by itself. Say what you saw.

**Recommendation**: (by Glazier 5.5, Claude Opus 5.5, 2026-10-13)

**C — both took the keyboard** (a guess, stated as one). *Rationale*: a new window on macOS normally becomes the active one when it is shown, and I have not found anything in VS Code's floating-window code that shows a window without activating it; the "do not take focus" options (`preserveFocus`, `inactive`) are documented for editors inside a window, not for creating one. *Confidence*: 0.4 — because this is a guess from absence; nobody has read that path closely or run it. *If wrong*: A or B means porthole can open a floating window without taking the keyboard, so ADR-0013's QST-OPEN-FOCUS can keep option C (depends on who triggered it); C, if it holds, means that option collapses to A or B there.

**ANS:** (by Jérémie)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Chosen: pending the two runs

---

## Action Items

- [ ] Run both checks and answer — Owner: Jérémie
- [ ] Read `spike/.run/spike.log` and record the results here — Owner: Glazier

---

## Iterations

### Iteration 1 (2026-10-13)
- Trigger: the seed was chunked; Jérémie asked for spikes as step-by-step questions
- Contributors: Glazier 5.5 (Claude Opus 5.5)
- Changes: initial draft, with the four spike commands
- Outcome: `Draft`

---

## Links

- Related: [ADR-0013](0013-open-a-porthole-from-outside-vs-code.md), [ADR-0015](0015-markdown-in-a-floating-window.md), [ADR-0003](0003-spike-0-does-the-one-shot-call-hold.md) (Spike 0)
- Code: `spike/extension.js` ("Spike 1" section), `spike/package.json`
