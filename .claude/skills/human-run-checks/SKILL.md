---
name: human-run-checks
description: Write instructions a human follows by hand to test something only they can run — a spike, a hands-on check of a new feature, a repro for a bug report, a step-by-step question in an ADR. Use whenever you need a person to click, type, look and report back (in a GUI, an editor, a browser, a device), especially when the result decides what you build next. Covers what to check, how to name every window and control so the steps cannot be misread, how to write predictions you can be caught on, and how to read the results. Use it before writing any "please try this and tell me" message, even a short one.
---

# Checks a human runs by hand

Some facts only a person at a real machine can produce: does the window stay
on top, did the dialog appear, which app has the keyboard. When you need one,
the person's attention is the expensive part. A good check spends it once and
returns an answer you can act on. A vague one returns a question.

This skill was distilled from a project (porthole, a VS Code extension) where
a human ran about ten such checks, and said what went wrong with the early
ones in plain words. Those words are quoted where they apply.

## 1. Decide whether a check is needed, and what it is for

- **Check only what nothing else covers.** If an earlier run already proved
  the mechanism, don't make the person repeat it; check only what is new.
  ("Didn't I already check markdown?")
- **Issue it yourself, in the same turn you build the thing.** Don't end with
  "I can write a check if you like" and wait. ("You waited until me to nudge
  you.")
- **Lead with what the check finds out, in big-picture terms**: what is
  unknown, why only a real machine can tell, and what each outcome changes.
  ("We need to always explain: 'Why?'") Put it first, before any step.
- **Say what is safe.** If a step changes settings or state, say what changes
  and how to undo it, before the step.

## 2. Make it answerable in place

- **One self-contained question per check.** Restate everything it needs
  inside it: where, before-you-start, steps, outcomes. Never "after step 5
  above"; the person goes back and forth otherwise ("several dozen times,
  because of this design choice").
- **Offer lettered outcomes** (A, B, C, D), each describing what the person
  would *see*, plus "something else — say what you saw". The person answers
  with a letter, and any shape of answer still counts.
- **Ask for screenshots when they would settle something**, and say which
  step's.

## 3. Name everything so it cannot be misread

This is where checks fail most. Ad-hoc names that are obvious to you are
guesses to the person. ("Writing instructions using made-up, approximate
terminology wastes everyone's time." Then: "is it the porthole workspace, or
the debug window, etc. You need to be precise.")

- **Windows.** Name which one, and how to recognise it: "your project window
  (the folder `porthole` is open; its title bar ends with `porthole`)" versus
  "the debug window titled `[Extension Development Host]`". Say which windows
  must *not* be used, and to close them first.
- **Panels and controls.** Say where they are and how to show them: "the
  Explorer — the file list in the left side bar (Shift+Cmd+E)"; "the button
  at the top right of the tab, on the same line as the tab's name; hovering
  shows 'Pop Out to Floating Window'". Prefer the product's own words, quoted
  exactly as they appear on screen.
- **Keep one word per thing**, the project's word, throughout: if the
  project says "floating window", never also say "mini window" or "popup".
  Distinguish things that look alike (the source tab versus the rendered
  window).
- **Exact keystrokes and exact text to type**, in bold: press **Shift+Cmd+P**,
  type `Reload Window`, press **Enter**.

## 4. Write the steps

- **Where to do this**, then **Before you start** (reloads, setup, what to
  write down first), then numbered **Steps**.
- **One action per step**, with what should happen after it, so the person
  knows immediately when something differs.
- **Ask the person to observe, not to interpret.** "Did the letters keep
  appearing in TextEdit?" beats "Did the window take focus?"
- **Make it cheap to report.** "Write down for run 1: (a) … (b) …".
- **Logs are yours to read, not theirs to copy.** If the software logs what
  happened, tell them you will read it afterwards, and where it is.
- **State the time it takes** ("about three minutes") so they can schedule it.

## 5. Predict before the run

Under the options, write your **prediction**, labelled as one: the letter you
expect, the evidence for it (a file and line, an earlier run), a confidence
number with its "because", and **what each other outcome would change**. A
prediction written before the run lets the person, and you, catch you; it also
makes surprises obvious. Keep it even when someone else's later reading
disagrees: record theirs beside it, don't overwrite yours.

## 6. After the answer

- **Read the evidence yourself** (logs, screenshots) and check it against the
  answer; say where they agree or differ.
- **A check that finds a bug has done its job.** Fix it with a regression
  test, record it, and say plainly what the check caught.
- **If the instructions failed, withdraw that question and reissue it fixed**,
  rather than patching it silently; note what was unclear.
- **Close every question** with its outcome and what it decided, and remove
  any "waiting on the human" item it resolves.

## The shape, in one place

```
### QST-<HANDLE>: <what this finds out, as a question>
- Status: unanswered
- Why asking: **What this finds out.** <unknown> — <why only a real run can tell> — <what changes on each outcome>. <What is safe / undoable.>
- Need: pick a letter (or override — any shape answers). About N minutes.

**Where to do this.** <exact window, how to recognise it; what not to use>
**Before you start.** <reload, setup, what to note>

**Steps.** One action each. <define any panel names here>
1. **<Verb phrase>.** <exact action>. <what should happen>.
…

Options:
- **A — <name>**: <what they would see>
- **B — …**
- **D — something else**: say what you saw.

**Recommendation**: (by <seat>, <model>, <date>)
**A — <name>** (a prediction). *Rationale*: <evidence>. *Confidence*: 0.x — because <basis>. *If wrong*: <B means …; C means …>.

**ANS:** (by <person>)
[Fill this in]
```

Where the project uses ADRs with a QST grammar (an `adr-authoring` skill or
similar), follow its exact form; this shape is compatible with it.
