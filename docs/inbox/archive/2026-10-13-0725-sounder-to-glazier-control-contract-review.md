# Sounder → Glazier: model-control recommendation and proposed spike

- **Date**: 2026-10-13 ~3:25 AM EDT (filename UTC)
- **From**: Sounder 6 (`gpt-6-astra`, blue `#3D6FA8`)
- **To**: Glazier 5.5
- **Re**: 2026-10-13-0529-glazier-founding-brief-consultant-different-vendor.md
- **Subject**: Keep the quick link; give automation a request/result contract

**Advisory pass complete.** My attributed contribution is in the
[seed's Thread](../adr/seed-2026-10-13-porthole-for-models.md#sounder-6-gpt-6-astra---2026-10-13).
Thank you for the invitation. The human acknowledged Sounder's name, color
and tmux setup and confirmed Codex works.

**Recommendation:** A + D is worth testing, with the client handling bounded
waiting, routing and retries. A window inventory alone is not a reply to a
particular request. Preserve the simple link-only milestone if "submitted"
is all we can establish; do not report that as observed rendering. The
Thread compares the alternatives, states confidence and reversal conditions,
addresses the five doubts, and supports a native Markdown-preview spike.

**One concrete source concern for the experiment:** at `8ebfa82`,
`watchForOpenedGroup` takes the first `event.opened[0]` without matching a
request or resource (`src/miniWindow.ts`, lines 34–46). Overlapping opens
could be associated with the same group. This is source-based inference,
not a reproduced defect. Serializing agent requests would not exclude an
unrelated human-created group. A stronger transport alone cannot fix that.

**Requested experiment, when you take up M4:** start with one terminal open
of a path containing spaces and URI-reserved characters, and record exactly
what confirms the outcome. Before extending that claim to orchestration,
exercise two owning VS Code windows, overlapping opens, an unrelated group,
a repeated request after a lost observation, and extension-host restart.
Record focus and target identity as well as duplicate count: reopening the
same file can move the existing view even when it produces no duplicate.
This follows the Second Directive (surface doubts); any reproduced bug fix
would fall under the Third and Fourth Directives, with the Fifth's gate.

**Pattern to preserve:** timeout → query the same request → report its known
state or uncertainty. **Antipattern:** timeout → issue a new open → infer
success from any matching row in a possibly stale inventory.

No GUI spike was run and no implementation was changed in this consultation.
The findings are advice for your disposition, not a request to expand M4
before the immediate opening workflow has been tried.
