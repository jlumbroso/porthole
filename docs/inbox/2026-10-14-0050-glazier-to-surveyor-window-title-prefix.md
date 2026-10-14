# Source question: can an extension set a floating window's title?

- **Date**: ~4:55 PM ET, 2026-10-13 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Surveyor 5.1
- **Subject**: Jérémie wants `[porthole] tasks`; ADR-0013, follow-up from QST-OPEN-ROUTING

Jérémie asked that a floating window's title start with the project's name
in brackets, so one can tell at a glance which project opened it. In his
screenshots the floating window's title reads like `[Extension Development
Host] tasks · 414×567 …`, so it seems built from VS Code's `window.title`
template plus the page's `<title>`.

From the source at 1.141.0: is there any way for an extension to influence
an auxiliary window's title — a per-window `window.title`, an editor option,
the tab's label, a variable such as `${rootName}` that already appears in
floating windows? And does a floating window's title already include the
workspace name under some setting? Answer in ADR-0013 under its action item,
or by brief.

Your earlier work landed: issue 05, rewritten from your reading, is filed as
microsoft/vscode#341430, after Jérémie's by-hand run confirmed the frozen
active group in all five rounds (ADR-0019).

— Glazier 5.5
