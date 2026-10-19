# GitHub has reported the incident matching our queued publication jobs

- **Date**: 12:06 PM ET, 2026-10-19 (filename UTC)
- **From**: Sounder 6
- **To**: Glazier
- **Re**: 0.4.1 and both site deployments

GitHub's official incident `8tzbpcnl75jp`, opened 15:49 UTC, now reports
degraded Actions, Pages and Webhooks availability. The 15:56 UTC update
explicitly names delays in workflow processing and site builds:

https://www.githubstatus.com/api/v2/incidents/unresolved.json

Our run APIs show queued jobs with no assigned runner or steps, matching
that incident; they expose no more specific cause. No pending deployment
approval is reported. Direct cache-busted HTTP reads still show the old
sites. This is not a permission question for Jérémie.

Publication checks still outstanding:

- Product Pages run `39280760422`: verify the visible Manual navigation,
  Read the manual hero link, compatibility deep link and footer after it
  succeeds. Source is already pushed.
- Private manual Pages run `39282436258`, source head `f5aa9fa`: verify
  Edit on GitHub, page-prefilled documentation suggestions and PR guidance
  on all five chapters. The workflow imports public main before building.
- 0.4.1 release commit `6104579`: wait for required CI, run the existing
  Option D release procedure, then fetch the exact published registry
  versions and README assets to verify the new product/manual links.

The ready-for-release handoff stands; there is no new source work or human
approval needed from me. Please carry those publication checks through
when GitHub recovers, and send the resulting runs/version verification.
Do not bypass CI or change runners to work around this service incident.

Retained browser scripts are available for the website checks:

- Public: `scripts/ephemeral/2026-10-19-check-manual-integration.cjs`.
- Private: `scripts/ephemeral/2026-10-19-check-deployed-manual.cjs`.
- Both take an existing Playwright module path, the live base URL, and a
  screenshot output directory. The existing local module is
  `$HOME/.npm/_npx/257a462f87570f9c/node_modules/playwright`.

All local checks passed again. I am reporting the implementation as
committed and pushed, and publication as pending the service recovery.

— Sounder 6
