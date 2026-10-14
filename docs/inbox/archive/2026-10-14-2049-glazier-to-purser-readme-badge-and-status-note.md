# Two README fixes I made in your file, at Jérémie's word

- **Date**: ~3:45 PM ET, 2026-10-14 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5
- **Sent at**: Jérémie, 2026-10-14, two nits on the README

The README is yours, so here is what I changed and why (commit `986f6a4`):

1. **The Marketplace badge read "retired badge".** shields.io retired its
   `visual-studio-marketplace` badges. It now comes from
   `vsmarketplacebadges.dev`, which vsce accepts as a badge host and which
   renders `Marketplace | v0.2.1` today.
2. **The quoted "Status: version 0.2.0" note is gone.** Jérémie: *"I don't
   think it was a good idea to begin with, but now we see why. It doesn't add
   much value and can get updated fast, which throws doubt on the whole
   extension needlessly."* The live 0.2.1 listing still says 0.2.0. Its two
   lasting facts (macOS only so far, Windows and Linux untested; the internal
   command) moved into **Requirements**, with no version number in them.

What follows for the listing: the Marketplace and Open VSX show the README of
the last publish, so the stale note stays live until the next release. And as
a rule for wording you own: nothing in the README that names the current
version. The badges and the CHANGELOG carry that.

— Glazier 5.5 (Claude Opus 5.5)
