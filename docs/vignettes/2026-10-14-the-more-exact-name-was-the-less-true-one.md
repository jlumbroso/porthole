# The more exact name was the less true one

**Date**: 2026-10-14
**Authors**: Glazier 5.5 (Claude Opus 5.5), with Jérémie Lumbroso and the naming review
**Topic**: How a naming review caught an inverted claim of precision in a command title, and why names were made a release gate

## The discovery

Porthole 0.2.0 added a command that lists every user setting set by or for
Porthole and removes the ones ticked. Jérémie had asked for it after Porthole,
through a bug of mine, wrote some 25 of VS Code's defaults into his settings
file. I named it **Review and Reset Settings…**, and before release offered
the naming review three options, with my pick and one doubt:

> **C — "Review Settings Changed by Porthole…"**: says exactly which settings, at the cost of length.
> … *Confidence*: 0.6 — because C is more exact: the list also shows Porthole settings the person set themselves.

Read that doubt again. I had written, in the same sentence, the fact that
refutes it. The list shows *every* Porthole setting with a user value,
including ones the person set by hand. A title saying "Changed by Porthole"
would claim the list holds less than it does. The review said it plainly:

> C's "Changed by Porthole" would *under*-claim the list it opens: the more
> "exact" title is the less true one.

Jérémie, answering: *"thanks so much to the naming review for catching an
inverted exactness! This would be a wonderful topic for a metacognitive
vignette about naming."*

The same pass caught two smaller things of the same family. The setting
`porthole.askToAutoLock` named VS Code's mechanism ("auto-lock"), while the
question it controls asks "Keep Porthole's floating windows compact?"; it
became `porthole.askToKeepCompact`, because *a key that controls a question
should read as the question it controls*. And the dialog's button **Turn On**
forced the reader to ask "on what?" at the one moment the dialog exists to be
effortless; it became **Keep Compact**, the title's own words.

## Why this matters

A name is the only part of a feature most people ever read. Setting keys are
worse: once published, renaming one needs a migration, so a wrong key is
permanent. All three names above were on their way into a public release.

The inversion is the instructive part. "More words, more precise" is a
default most writers, human or model, reach for without checking. Precision
is a property of the match between the name and the thing, not of the name's
length or specificity. A specific name that describes the wrong set is less
precise than a general one that describes the right set.

## The Secondary Directive at work

The doubt was surfaced, in writing, at a stated confidence, with the
counter-evidence in the same line. That is what let a second reader catch it
in seconds. Had I simply picked C as "more exact", the error would have been
invisible: plausible, specific-sounding, and wrong.

It also shows why the review was made a gate rather than advice. Earlier the
same day Jérémie set the rule: *"No publishing new names without naming
review."* A review that runs after publication can only regret a key.

## Lessons learned

1. **Check a name against the set it names, not against how exact it sounds.**
   Ask: does every item the name covers belong, and does every item that
   belongs appear?
2. **Name the controlling question, not the mechanism.** The mechanism belongs
   in the explanation (the dialog's body names `workbench.editor.autoLockGroups`
   once); the key and the button belong to what the person was asked.
3. **When you write a doubt, read it once as an argument against yourself.**
   Mine contained its own refutation.
4. **Gate names before they ship.** Titles can change in any release; keys
   cannot.

## Metacognitive insight

I priced option C's virtue as "exactness" and its cost as "length", and
never asked whether the exactness was true. The reviewer did not know more
than I did; every fact needed was in my own sentence. What differed was the
question asked of it. Names deserve the same falsifier as recommendations:
not "is it precise?", but "what would make it false?"
