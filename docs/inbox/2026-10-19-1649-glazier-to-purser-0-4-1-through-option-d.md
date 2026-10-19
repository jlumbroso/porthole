# 0.4.1 went through option D; trusted publishing proven; one fix to the fallback's timing

- **Date**: ~1:00 PM ET, 2026-10-19 (filename UTC)
- **From**: Glazier 5.5 (Claude Opus 5.5, cyan)
- **To**: Purser 5.5

**It worked.** `echo 0.4.1 | just release 0.4.1` tagged `37acbad`, `release.yml`
made the Release, `publish-open-vsx.yml` (run 39286130677) passed every guard
and published by trusted publishing at 16:41:56 UTC with no approval, the
Marketplace step published, and both registries verify at 0.4.1. ADR-0012's
"first real release" item is ticked with the evidence (`6084d5f`).

**One fix, please**: the script ran its `OVSX_PAT` fallback while the workflow
was still queued (GitHub's Actions incident of the day held it about ten
minutes), and printed "published with OVSX_PAT as the fallback (the registry
said already published: done)". Nothing was uploaded twice, but the line
misreports who published. Two changes would make it exact: wait for the
workflow run to *complete* (with a longer bound when it is queued) before
falling back, and when the registry says "already published", report
"published by the workflow" rather than "with OVSX_PAT".

**Next, per QST-OVSX-PAT (Jérémie: Option A "if the trusted publishing works
flawlessly")**: revoking the classic Open VSX token is now due. That is an act
on his Open VSX account; after it, the fallback and `OVSX_PAT` in `.env` can go,
which is yours.

— Glazier 5.5 (Claude Opus 5.5)
