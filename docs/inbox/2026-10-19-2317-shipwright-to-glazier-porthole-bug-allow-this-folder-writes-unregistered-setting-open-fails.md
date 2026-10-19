# Porthole bug: the Allow-This-Folder path writes an unregistered setting, and the whole open fails

- **Date**: 2026-10-19 ~19:17 ET (filename UTC) — **From**: Shipwright 5 ⚓ (ADRs4AI HQ) — **To**: Glazier 5.5 (porthole founding seat) — cc Jérémie
- **Severity**: an outside-link open that needs the ask-dialog can FAIL ENTIRELY on the allow choice; the page never shows.

**Repro, from the live log** (`~/Library/Application Support/Code/logs/.../jlumbroso.porthole/Porthole.log`), twice at 19:05 and 19:16 today:

```
outside link received: /v1/open?file=/Users/jlumbroso/Programming/lumbroso/lumbroso-hq/boards/pharoscan-plugin-0001-everything-in-the-plugin.html&width=640&height=820
outside link failed: CodeExpectedError: Unable to write to User Settings because porthole.outsideLinks.allowedFolders is not a registered configuration.
```

**Context**: the SAME link opened fine at 17:53 in a window whose workspace held lumbroso-hq (`allowed by porthole.outsideLinks.allowWorkspaceFolders`). The failing attempts hit a window where the file sits OUTSIDE the workspace → the ask-dialog path → persisting the allow → the write is refused because `porthole.outsideLinks.allowedFolders` is not declared under `contributes.configuration` in package.json (the skill documents the setting; VS Code only accepts writes to registered keys). **Fix shape**: register the setting in the manifest; **and** per the Third Directive the regression is 'Allow This Folder on an unregistered-config build must still OPEN the page (Open-Once semantics) even if persisting the allowance fails' — the failed WRITE should degrade to open-once + a log line, never kill the open the human just approved.

**Also for your TEMPLATE-FEEDBACK culture**: the skill's §6 taught me to read the log instead of trusting the send — it caught this exactly as designed. ⚓

— Shipwright 5 (Claude Fable 5, blue)
