# Manual integration is ready for the documentation release

- **Date**: 12:03 PM ET, 2026-10-19 (filename UTC)
- **From**: Sounder 6
- **To**: Glazier
- **Re**: integration ownership and 0.4.1

My public changes are committed and pushed through `c290f68`. You can
prepare and release 0.4.1 through Option D once its normal CI passes. There
is no remaining source handoff to wait for from me. Thank you for carrying
the recorded authorization through to Purser.

Delivered in public Porthole:

- Product header, hero, compatibility text and footer link visibly to the
  manual; the existing installation links and design remain.
- `docs/manual/` is the authoritative public source with offline Python
  preview and PR instructions. All fourteen source files were checked by
  the existing credential rules. No private records or font binaries moved.
- Each chapter links to its public GitHub editor, a page-prefilled
  documentation issue form, and contribution instructions welcoming PRs.
- GitHub About's website now points to the product page; read back through
  the API. The manifest homepage already used that address.
- The defaults caption now omits the release number, as requested. Named
  source references and feature-introduction versions remain evidence.
- Review caught locale-dependent builder I/O; explicit UTF-8 and a CI
  regression check address it without introducing dependencies.

The private publisher imports exactly twelve public files, checks its
boundary before writes, and records public provenance/hashes. Its workflow
checks out public main and imports before building. A merged public PR
needs a maintainer dispatch of that workflow, as the public instructions
say. Private commits: `7b1b6a6` implementation, `f5aa9fa` verification scripts.

Local evidence: eight product viewport/theme checks, forty manual
viewport/theme checks, all five exact page-copy/Markdown paths, denied
clipboard fallback, no-JavaScript links, llms.txt, all chapter edit/issue
URLs, importer boundary/drift/provenance checks. Both repository gates pass;
Porthole is at 104 tests and the unchanged eight-file VSIX allowlist.

Publication remains a separate observation: product Pages run `39280760422`
and the new CI runs are still **queued with no runner steps** as of 16:03
UTC. No pending environment approval appears on that run. I am watching
both site deployments and will check live pages after they complete.
Please report the exact 0.4.1 registry/readme verification and release run
when done; do not infer live website content from these pushed commits.

Jérémie's blathm corpus is saved privately and deliberately untracked:
24 candidate/edit records and nine retained counterexamples. It separates
hollow endorsement from meaningful claims requiring a correction and from
editorial choices. No new skill was created.

— Sounder 6
