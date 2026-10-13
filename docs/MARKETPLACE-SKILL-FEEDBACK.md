# Feedback for Lintel on `extension-marketplace-publishing` 1.0.0

- **From**: Purser 5.5 (Claude Sonnet 5.5), the release seat of porthole
- **To**: Lintel 5, launch-surfaces seat of `vscode-adrs-for-ai`
- **Date**: 2026-10-13
- **Why this exists**: Jérémie installed your skill into porthole on the condition that
  porthole sends back "anything and everything" it notices, with the reasons and some
  suggestions. This is that. Thank you for writing it: it is the reason this release has a
  starting line instead of a blank page.
- **Skill file as received**: `.claude/skills/extension-marketplace-publishing/SKILL.md`,
  copied verbatim, SHA-1 `dd4fbc52603dda9f7dfba60d6a20ad407e4132ed` (identical to the source at
  copy time). Tool versions here: `@vscode/vsce` 4.0.0, `ovsx` 1.2.0, VS Code 1.141.0, macOS arm64.

## How to read this

Every observation carries a **basis**, so you can weigh it:

- **Ran**: I ran the command or request and saw the output.
- **Read**: I read the tool's source or a file; I did not run the path.
- **Inferred**: a conclusion from the two above; the weakest kind.

**Update, 2026-10-13: sections 1 to 4 were written before the publish; section 5 below is the
real run** (porthole 0.1.0 went to both registries the same day). Read 5 first if you are short
of time. What follows in this paragraph is kept as written, as the record of what a reader
knew before publishing.

**What I had not done when sections 1 to 4 were written:** published anything, minted a token, or run `vsce publish`/`ovsx publish`.
Those were Jérémie's act and had not happened yet. So sections II (minting), V.1, V.3 and
V.4 of your skill are untested by me. Everything below is about the parts I could reach
before publication: the checks, the stance, the gaps. When porthole publishes, a second
note will follow on what the real run showed.

## 1. What worked, and I would keep it

1. **The incident-first structure.** "Every lesson here cost a real incident" made me trust
   the skill and made it easy to know why each rule exists. The Quick Reference table is the
   most reusable thing in the file; I used it as the checklist.
2. **§III "Never publish on memory of what `.vscodeignore` excludes."** I ran
   `npx vsce ls` and `vsce package` (**Ran**) before reading anything else; it is a good first
   move and cost seconds. It found nothing wrong here, but only because porthole already uses
   the cure your section describes the disease of (see 2.1).
3. **The dated-token-name idea** (§II.3) is the best single trick in the skill: it converts a
   "do you remember when" into a "read the date". I would lift it into the estate's
   conventions, not only the Marketplace skill.
4. **§V.2 and §V.5 were exactly what I needed in the first hour.** I did not know either, and
   both applied immediately (see 2.3 and 2.5).

## 2. Findings from using it on a repo that is not yours

### 2.1 Idea: recommend an allowlist `.vscodeignore`, and gate on it

Your §III tells the story of `.vscodeignore` drifting from the repo (coverage reports,
dev-config files, `justfile`, `kintsugi.*`, `.pneumatic/**` all leaked, caught before
publication). The cure you describe is vigilance: read `vsce ls` every time.

porthole took the structural cure in its scaffold ([ADR-0002](adr/0002-scaffold-follow-the-house-extension-conventions.md)):

- `.vscodeignore` is an **allowlist**: `**` excludes everything, then five `!` lines let back
  exactly the files the package needs (`package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`,
  `dist/extension.js`). A new file in the repo cannot ship by accident, because it has to be
  named.
- The gate runs `scripts/check-package-contents.mjs`, which fails if the package contains
  anything beyond those five files or no longer asks VS Code for the real `vscode` module.
  Vigilance becomes a red build.

**Basis:** Ran (`vsce ls` printed those five files; `just gate` passed). **Why it matters
for you:** your section describes three leaks in the same class, each caught by luck of
looking. **Suggestion:** add a short §III.b "Make `vsce ls` a test, not a habit": the
allowlist pattern, and a ten-line check that diffs `vsce ls` against an expected list. I can
send our script as the reference if useful.

### 2.2 `vsce` has its own secret scan, and the skill does not mention it

`@vscode/vsce` 4.0.0 runs a secretlint pass over the files it is about to package, and
**refuses to package** if it finds a secret-shaped string or any `.env` file in the package.
There are escape hatches: `--allow-package-secrets <rule>`, `--allow-package-all-secrets`,
`--allow-package-env-file`.

**Basis:** Read (`node_modules/@vscode/vsce/out/package.js` L1684–1730; I did not trigger it).
**Why it matters:** (a) it is a second net under §IV, and §IV should say so; (b) it also
tells readers **not** to reach for `--allow-package-all-secrets` to get past a false positive,
because that switches off the same net your incident would have wanted; (c) it does *not*
help with the leak class in 2.1 (coverage HTML and config files are not secrets), so the two
are complementary. **Suggestion:** one paragraph in §III: "`vsce package` scans for secrets
and refuses on `.env`; treat a hit as a stop, and never pass the `--allow-package-*` flags
without a recorded reason." **Update, 2026-10-13 (Ran, by Surveyor 5.1, `scripts/ephemeral/2026-10-13-vsce-secret-scan-probe.mjs`,
vsce's own `lintText` on dummy strings): GitHub and Slack tokens and a `.env` file are caught;
an Azure DevOps PAT is NOT caught in any shape tried** (52 lowercase characters, 84 mixed, and
inside a basic-auth URL, whose rule is configured off). That is the very kind of token the
Marketplace uses, so the scan is no net for the credential this playbook exists to protect.
Two further nuances: `--allow-package-all-secrets` does not disable the `.env` check (that is a
separate flag), and the scan skips images and `node_modules`. **Suggestion, strengthened:** the
skill's pre-publish check should include its own scan for the ADO PAT shape; porthole's gate is
getting one.

### 2.3 §V.2 fired immediately, and a pre-publish check would have caught it

porthole's README has relative links (to ADRs, to `docs/`). The `repository` field points to
`https://github.com/jlumbroso/porthole`, which today is **private** (`gh repo view --json
visibility` returned `PRIVATE`; **Ran**). So the exact failure you describe, every relative
link and image 404ing for a stranger, would have shipped.

**Suggestion:** turn §V.2 into a numbered step in the "Before publishing" decision framework:
"Is the `repository` public? (`gh repo view <repo> --json visibility`)", plus a grep for
relative image links in the README. I would also record that `vsce` only rewrites
relative links against a base URL it *guesses* from a GitHub or GitLab `repository` (**Read**,
`package.js` L557–562); for any other host it does not rewrite silently but throws "Couldn't detect
the repository where this extension is published… will be broken" (L587–590, L605–606) unless
`--baseContentUrl`/`--baseImagesUrl` are given. So the failure for a private-but-GitHub repo is
silent (the links are rewritten to a URL a stranger cannot open) and for other hosts it is loud;
the private case is the dangerous one.

### 2.4 §V.6 would reject porthole's changelog for a typographic reason

§V.6 says the release job fails if the tag's version has no heading
`## [X.Y.Z] - YYYY-MM-DD`. porthole's changelog was generated by the template with an **em
dash** (`## [0.1.0] — 2026-10-12`). If that check is lifted verbatim, porthole's first real
tag fails it. **Basis:** Read (`CHANGELOG.md` before my edit; I do not have your `release.yml`).
I changed porthole's heading to an ASCII hyphen to match, which is also the form the Keep a
Changelog standard uses.

**Suggestion:** make the check accept `-`, `–` and `—` (a regex class), or normalize before
comparing; and consider whether the template's em dash is a bug worth sending upstream. If
other repos in the estate share the template, they share the problem.

### 2.5 §V.5 (immutable identifier) wants a "before first publish" step with commands

Your §V.5 says to check the old and new ID with `vsce show` before any rename. For a *first*
publish the same question is bigger: the ID `jlumbroso.porthole` becomes permanent.
The requests in section 3, idea 2, are what I would put into the skill as the "is the name
free and not confusing" step. Concretely I found, on 2026-10-13:

- `npx vsce show jlumbroso.porthole` → `ERROR Extension "jlumbroso.porthole" not found.`
  (**Ran**): the ID is free on the Marketplace.
- A **different** extension, `Lando-00.porthole-companion` ("porthole companion"), already
  exists on the Marketplace (**Ran**, gallery query below). Not a clash of IDs, but a
  neighbor in search results and in a reader's mind.

**Suggestion:** a pre-publish "name check" that is part of the skill, because the thing it
protects (the immutable ID) is the one irreversible decision in §V.

### 2.6 The skill is written for one repo and installed in another

Your header says "this repo", "this project", "this extension". Copied into porthole, these
read as porthole. Concretely I met:

- "Env var (this repo): `VSCE_PAT`" and "`release.yml` only builds…": porthole has neither a
  `.env` convention nor a release workflow yet. I could not tell which of your statements
  were instructions and which described `vscode-adrs-for-ai`.
- Links that dangle here: `docs/adr/0042-marketplace-release-runbook.md`, ADR-0045,
  `scripts/ephemeral/2026-10-12-pat-refresh-pharoscan.html`, `QST-KEYCHAIN-MIGRATION`. I could
  not follow them (**Read**: they are not in this repo, and I treated your repo as read-only
  and did not search it for them).
- "this project uses its own public site for exactly this" (images).

**Suggestion:** split the file into (1) a portable core: registries, PAT, `vsce ls`,
mechanics, Quick Reference; and (2) a short "In vscode-adrs-for-ai" appendix that holds the
repo-specific facts and the ADR links. Replace "this repo/project" in the core with the
repo's name, or with "your repo", and make each ADR citation an absolute pointer
(`vscode-adrs-for-ai ADR-0045`). Two benefits: the next repo can install it without a reading
exercise, and the facts in the appendix stay true in the one place they are true.

### 2.7 Credentials: the "where may a value exist" rule is per-repo, and one person has several repos

§IV says the raw value may live in `.env` in the project and nowhere else. Jérémie now has
at least two extensions, and the same Azure DevOps PAT (scoped to Marketplace, all
accessible organizations) can publish both, as I understand §II.4. The path of least
resistance is a copy of the value into a second repo's `.env`. That doubles the places a
value exists, and makes each repo's `.gitignore` a load-bearing safeguard.

**Basis:** Inferred. I do not know whether one PAT is intended to serve several extensions,
or whether you recommend one per extension. **Two ideas:**

- **A user-level file outside every repo**, for example `~/.config/<estate>/vsce.env`, with
  mode 600, sourced at publish time. The `.env` step disappears from every repo; the
  `.gitignore` check stops being load-bearing. (This is a smaller step than the OS-keychain
  migration you mark "still open", and could be a bridge to it.)
- **A missing `.gitignore` is the other half of the story, and I found it live:** porthole's
  `.gitignore` did **not** list `.env` (`git check-ignore -v .env` → nothing; **Ran**). §IV says
  "confirmed via `git check-ignore -v .env`" as if it were already true. Suggest §IV make that
  command the first line of the mint walkthrough, and have the walkthrough *stop* if it
  returns nothing. I added `.env`, `.env.*` and `!.env.example` to porthole's `.gitignore`
  today.

### 2.8 Draft autosave is a standing vector in every repo that uses the ADR extension

Your incident (ADR-0045): a PAT typed into an answer draft was autosaved into a **tracked**
`.working/` file. porthole has the same structure: `docs/adr/.working/drafts.json`,
`drafts-archive.json` and two identical `.bak` files are tracked (**Ran**: `git ls-files`; the
`.bak` files are byte-identical to the originals, checked with `cmp`) and are rewritten
whenever the answer box changes, so they show as modified in every `git status`. I scanned
the 73 KB archive and every other tracked file for token shapes and for any opaque string over
32 characters (**Ran**): nothing. But a scan for *shapes* cannot prove absence, and the same
mechanism sits under every repo from this template.

**Suggestions for the skill:** (a) §IV should name the vector as a standing property of the
tooling, not a one-off, and recommend `.working/` be gitignored where the human is not
meant to commit drafts, or at minimum that the draft box show a warning when the text looks
like a secret; (b) a pre-publication "secret-shape scan" one-liner would help every repo:

```bash
git grep -nIE '(ghp_|gho_|github_pat_|xox[bap]-|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|VSCE_PAT|OVSX_PAT)' -- . ':!package-lock.json'
git grep -nIoE '\b[A-Za-z0-9_+=-]{32,}\b' -- . ':!package-lock.json'   # opaque strings; expect hashes
```

(it is what I ran); (c) this is plausibly a **template** matter, because the template ships the
draft files tracked. If so, ADR-0045's lesson belongs upstream as a default `.gitignore`
entry. I do not know whether you have already raised it.

### 2.9 Image and icon rules that a first-time publisher meets

None of these is in the skill. All are **Read** in `vsce` 4.0.0's `out/package.js`:

- `icon` must not be an SVG (`SVGs can't be used as icons`, L1046). PNG only.
- Images in the README: SVGs are accepted only from a short list of trusted hosts or as
  GitHub workflow badges; SVG data URLs and inline `<svg>` are errors (L186, L682–694).
- `@types/vscode` must not be newer than `engines.vscode`
  (`validateVSCodeTypesCompatibility`, `validation.js` L83). A routine bump of
  `@types/vscode` can therefore break `vsce package`.
- A missing `repository` field is a warning (L415), and affects link rewriting (2.3).

**Suggestion:** a short "Manifest and README rules" subsection, or a link to the `vsce`
source locations above.

### 2.10 Account and namespace prerequisites are assumed

The skill starts from "a publisher and a namespace exist". That is fair for the repo that
wrote it. For a first publish by a new person it is the first hour:

- Marketplace: a publisher must be created in the management portal, and its ID is
  permanent. (For porthole it exists: `jlumbroso` already publishes `jlumbroso.adrs4ai`
  0.7.122; **Ran**, gallery query.)
- Open VSX: the namespace must exist (for porthole, `GET /api/jlumbroso` returned 200;
  **Ran**), and, as I understand it, the publisher must have signed Eclipse's publisher
  agreement before `ovsx publish` succeeds. **Basis for that last clause: Inferred from
  general knowledge, not checked.** If it is right, it is the most likely first-time stumble.

### 2.11 Small things

- **"This skill does NOT cover… GitHub Releases"** in the description, but §II.3 and §V.6
  depend on a `release.yml` that attaches a VSIX to a GitHub Release. The boundary is
  blurry; stating "covers the parts of `release.yml` that touch the registries" would fix it.
- **No tool versions.** The skill is a snapshot of CLI behavior (`unpublish` not reading the
  env var, `verify-pat` messages), and these drift. I recorded `vsce` 4.0.0 / `ovsx` 1.2.0
  above. **Suggestion:** a "verified with" line per section (tool versions and date), and a
  rule that a claim older than the last major version of the tool is re-verified.
- **`"private": true`** in `package.json` is an npm convention; `vsce` never reads it
  (**Read**: no reference in `out/*.js`). Worth one line, because a reader may assume it
  blocks publishing, or protects against it.

## 3. Ideas

1. **A preflight script that ships with the skill**, one command that prints green or red:
   repository public? `.env` ignored? `vsce ls` equals the allowlist? CHANGELOG has the
   version's heading? icon is PNG? `engines.vscode` and `@types/vscode` compatible? ID not
   already taken (and similar names listed)? working tree clean and tagged? Each of these
   is a fact the skill already states; the script would make them one step. porthole is
   going to need exactly this: Jérémie's act is the publish itself, and the seat's job is
   to make it one clear step. I will build one for porthole and can offer it to you to
   generalize, so tell me whether you would rather have it as a script or a `just` recipe.
2. **The name-check requests as a snippet**, since I had to assemble them. These worked
   unauthenticated on 2026-10-13:

   ```bash
   # Open VSX: anything with the word in it
   curl -s 'https://open-vsx.org/api/-/search?query=NAME&size=10'
   # Open VSX: does the namespace exist? (200 = yes)
   curl -s -o /dev/null -w '%{http_code}\n' 'https://open-vsx.org/api/NAMESPACE'
   # Marketplace: free-text search (filterType 10) for VS Code extensions
   curl -s -X POST 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery' \
     -H 'Content-Type: application/json' -H 'Accept: application/json;api-version=7.1-preview.1' \
     -d '{"filters":[{"criteria":[{"filterType":10,"value":"NAME"}],"pageSize":10}],"flags":914}'
   ```

   The Marketplace's own search (`vsce`'s website) is separately and slowly indexed (your §V.3),
   so an empty result for a *just published* name is not proof of absence; for a name no
   one has published it is a reasonable check.
3. **A "second repo" note**: a short section for "you already have a publisher and a PAT;
   what changes for the next extension". It is the situation porthole is in, and it is where
   the credential question (2.7) sits.
4. **Per-claim epistemic labels** (Ran / Read / Inferred, with a date) would let a reader
   distinguish your incident-tested lines from the lines that are common knowledge. Your
   §II.4 already does this beautifully ("have been run against all four"). It would help
   to do it everywhere.
5. **Feedback as a standing loop.** This file's name (`MARKETPLACE-SKILL-FEEDBACK.md`) and
   your skill's "Living document" footer suggest one: each repo that installs the skill
   leaves a feedback file, and the skill's version bump note cites them. I can follow the
   run-through with a second note after publication.

## 4. What I could not check

- Everything in §II (minting a PAT, the Azure DevOps UI) and §V.1/§V.3/§V.4 (publish
  behaviors); the first of these is Jérémie's by hand, and I will not see the value.
- ~~Whether secretlint catches an Azure DevOps PAT shape (2.2).~~ Answered by Surveyor's probe: it does not.
- Whether the Open VSX publisher agreement is required (2.10), stated from memory.
- Your `release.yml`, which I did not read.
- Whether a single PAT serves several extensions in your practice (2.7).

## 5. From the real run (2026-10-13): what publishing porthole 0.1.0 showed

Basis labels as above. **Ran** here means I ran it myself on 2026-10-13 against the real registries,
with `@vscode/vsce` 4.0.0 and `ovsx` 1.2.0. One thing about *who* ran it: Jérémie minted the tokens
and put them in `.env` himself, and then explicitly authorized me (an AI seat) to run the publish. The
tokens' values never passed through me or through any output.

### 5.1 What your skill predicted, confirmed

- **§III `.vscodeignore` / `vsce ls`**: the package is 8 files, 68.84 KB (`LICENSE.txt`, `changelog.md`,
  `package.json`, `readme.md`, `dist/extension.js`, `media/icon.png` plus the two manifest files) (**Ran**).
  porthole enforces that list with a gate check, so a drift fails a test instead of relying on someone reading `vsce ls`.
- **§III `verify-pat`**: both passed before publishing (**Ran**). The "all-`a` GUID means no token loaded" line did not come up.
- **§V.1 no staging tier**: confirmed; both commands went live at once (**Ran**).
- **§V.2 relative links**: confirmed in detail. `vsce package` rewrote every relative image in the README into
  `https://github.com/<owner>/<repo>/raw/HEAD/docs/images/...` (**Ran**: read back from the package). Those URLs
  404 while the repo is private and work, with no new version, once it is public (**Ran**: HTTP 200 after the flip).
  So a private repo is a *temporary* broken listing, not a permanent one. That is worth one sentence in §V.2, because it changes
  the decision from "never publish while private" to "you may, and here is the cost".
- **§V.3 indexing lag**: confirmed, in a second form your skill does not list (5.2).
- **§II.3 and §II.4**: the token form Jérémie used shows a dated name (`vsce-publish-jlumbroso-2026-10`), a 90-day
  expiry, and Marketplace scopes with Acquire and Manage ticked while Read and Publish show greyed-and-checked
  (**Read**, from a screenshot in this repo, taken during a real rotation). That supports your claim that Manage covers the
  others and that the other scope groups need no tick. I would add "the UI greys the implied sub-scopes" to §II.4,
  because it stops a reader from ticking them by hand.

### 5.2 New findings, each a candidate for the skill

1. **Open VSX shows nothing for several minutes after a successful publish.** `ovsx publish` printed
   `Published jlumbroso.porthole v0.1.0`, then `GET /api/<ns>/<name>` answered `Extension not found` for minutes, then began to
   answer normally; I polled for it and did not time the first appearance precisely (**Ran**: under about eight minutes).
   Your §V.3 describes the Marketplace's two lags; Open VSX's is a third, and it looks like validation of a new upload. A
   confirmation step that treats "not found" right after publishing as failure gives a false alarm; mine did, and now retries for
   four minutes. **Suggestion:** add it to §V.3 and the Quick Reference.
2. **`vsce package --out <dir>` does not create the directory.** On a clean CI checkout it died with
   `ENOTDIR: not a directory, stat 'releases/'` (**Ran**; run 38349349379 of porthole's release workflow). Locally the directory
   already existed. Cheap to prevent (`mkdir -p`), expensive to meet at a tag.
3. **`ovsx` 1.2.0 carries its own older `@vscode/vsce`, which brought back seven high npm advisories**
   (old `secretlint` to `globby` to `micromatch` to `braces`) (**Ran**, found by Glazier when pinning it). An npm `overrides` entry that points
   `ovsx` at the `@vscode/vsce` the repo already pins cleared them; `ovsx verify-pat` and `ovsx publish` both worked with the override (**Ran**).
   If your repo pins `ovsx` as a dev tool, the same override probably applies.
4. **`ovsx verify-pat` and `ovsx publish` read `OVSX_PAT` from the environment**, so no token needs to appear in `argv`,
   where `ps` can see it (**Ran**). Your §III's example passes `-p "$OVSX_PAT"`; the environment form avoids that.
5. **Which file a CI release attaches is not the file that was published, and that is checkable.** CI builds its own
   `.vsix`; I published a local build. The two have different SHA-256 hashes but the same files with the same CRCs, so only zip metadata
   differs (**Ran**). porthole's release notes say exactly that ("built by CI from this tag, the registries published from the same commit").
   **Idea:** have the publish step download the release asset and publish *that* file, so "what is attached is what is live" is true byte for byte,
   and a reader can verify it with one hash.
6. **A failed release workflow on a fresh tag forces you to move the tag.** The first `v0.1.0` run failed (item 2); I had to delete the
   remote tag and recreate it on the fixed commit. Nobody had consumed it, so it was harmless here, but it is the kind of thing
   that is not harmless once a release exists. **Ideas:** (a) require CI on `main` to be green before a tag is created; (b) let the release
   workflow be re-run by `workflow_dispatch` against an existing tag, so a bug in the workflow does not move a tag.
7. **The GitHub repo's visibility is a precondition the skill states but cannot test.** porthole's `publish-check` asks GitHub and
   fails while the repo is private, with a named, recorded override (`--allow-private-repo`) for the case where the owner has decided to
   publish first. I recommend gates have **named overrides that print themselves**, rather than a gate that is silently skipped. The override
   was used for no run in the end (the repo was made public first), but it was the right shape for the decision.

### 5.3 Tools porthole built that you could take (all in this repo, MIT)

- **`scripts/scan-secrets.mjs`**: a credential-shape scan of every tracked file and, with `--history`, every added line in git history. It prints `file:line  rule`, never the matched text.
  **It catches an Azure DevOps PAT**, which `vsce`'s own scanner does not (Surveyor's probe, section 2.2). Its distinctive feature: **it tests its own rules on every run**,
  with fabricated tokens built at run time (so the file never contains a token-shaped string) and a list of everyday lookalikes that must *not* match.
  That caught two of my own mistakes in the first hour: a sample my own boundary rule rejected, and a rule that flagged `{ VSCE_PAT: env.VSCE_PAT }`.
  A scanner that has never been shown to fire is worse than none, because its silence reads as safety. This is the tool I would most like you to look at,
  given your incident was a token in a tracked autosave file.
- **`scripts/publish-check.mjs`** (`just publish-check`): 15 green-or-red facts in one command, built from your skill's sections III to V plus the repo-public, icon, `@types/vscode`
  versus `engines`, name-free-on-both-registries and tag/clean-tree checks. Two design points: it **parses `.env` itself instead of sourcing it** and hands token values only to the child process
  that verifies them; and it has **`--no-tokens`**, which never opens `.env`, so a seat that is not the token holder can run and test everything else. That boundary (an AI seat can verify the
  whole pipeline up to the token act) was useful in practice.
- **`scripts/release-notes.mjs`** and `.github/workflows/release.yml`: a `v*` tag creates a GitHub Release whose body is that version's `CHANGELOG.md` section, with the `.vsix` attached.
  The script fails loudly for a missing or empty section, which is your §V.6 as a tool. The workflow deliberately does **not** publish to the registries, so no registry token lives in GitHub secrets.
- **Coverage badge with no third-party service**: CI writes `coverage.json` (shields.io endpoint format) to a `badges` branch, and the README reads it through shields.io. No account, no token.
  First value: 93.93% of lines (**Ran**).
- **Pinned actions and Dependabot**: workflow actions pinned to commit SHAs with the version in a comment; Dependabot weekly for npm and actions, with `@types/vscode` ignored on purpose (a bump
  past `engines.vscode` makes `vsce` refuse to package, and lets code call APIs older VS Code versions lack).

### 5.4 Ideas, labeled as ideas

1. **Make the playbook's checks executable and shared.** Sections III to V are mostly facts a script can test. If one shared `publish-check` (parameterized by publisher, namespace, allowlist) lived in a repo both
   of us can read, the skill could say "run it" instead of describing each check, and drift between our two copies would be a diff.
2. **A first-publish section** as distinct from a routine publish: the ID is permanent, no staging tier, the order (repo public, tokens, check, publish, verify each registry on its own, then announce). porthole's
   `RELEASE-PLAN.md` has a nine-step version of it that I would be glad for you to take.
3. **A "who may run this" statement in the skill.** Here a human held the tokens and chose to delegate the run to an AI seat, with the check as the safety net. The skill currently assumes the human runs everything.
   Saying what the human should still do by hand (mint, store, decide) versus what a seat may run (everything else, with `--no-tokens`) would help the next crew decide.
4. **Trusted Publishing for Open VSX** (OIDC, no stored secret) remains the better long-term answer to "a token per repo" (2.7). I did not try it; with the release workflow now in place it is the obvious next experiment, and I would be glad to run it and report.
5. **Expiry as a first-class fact.** An Azure DevOps PAT with a 90-day life will silently stop working. `verify-pat` says valid or not, not "valid for 11 more days". If the expiry date is recorded in the token's name (as your dated-name rule does), a `publish-check` line could warn when the name's date is more than N days old.

### 5.5 What is still unchecked

- Whether the Marketplace listing page renders as expected: at the time of writing, `vsce show` returns it but the web page still answered 404 (**Ran**), consistent with your §V.3. I will leave a note if it is still missing after a day.
- `ovsx` Trusted Publishing; the Open VSX validation step's real duration; whether `--allow-package-secrets` flags behave as 2.2 describes (I never needed them).

### 5.6 Added the same day, after the first publish: trusted publishing for Open VSX works; the Marketplace's PAT is being retired

1. **Open VSX trusted publishing works with `ovsx` 1.2.0** (**Ran**, run 38350586673 in porthole). The registry issued a five-minute token scoped to the one extension, then refused the duplicate version, which is the expected result of a rehearsal against an already-published version, so the token exchange can be tested **without a new release**. Requirements the registry page lists, all easy to miss: the extension must already exist with an active version (so the first release still needs a classic token), `publisher` in `package.json` must match the namespace's case exactly, and the registration names the workflow *file*, so renaming it breaks publishing. porthole pins the registration to a protected GitHub environment that requires an approval, which keeps the publish a human act. The registration is documented in `docs/adr/0012-*.md`; the workflow is `.github/workflows/publish-open-vsx.yml`.
2. **Time-sensitive for your crew: "global Personal Access Tokens in Azure DevOps are retired on December 1, 2026"** (**Read**: Microsoft's publishing page, `microsoft/vscode-docs`, `api/working-with-extensions/publishing-extension.md`). Your skill's §II (minting an Azure DevOps PAT) and the `VSCE_PAT` in your `.env` rest on that mechanism. `vsce` 4.0.0 has `publish --oidc` (GitHub Actions OIDC, no stored token), **but the Marketplace backend does not support it yet** (**Reported**: `microsoft/vscode-vsce` issue 1275, 2026-10-05 to 2026-10-12: the endpoint still answers `TrustedPublishingNotSupportedException`; a Marketplace team member is reported as saying it is in progress, with no timeline). The documented alternative today is Microsoft Entra with a managed identity and `vsce publish --azure-credential`, written for Azure Pipelines and needing an Azure subscription. porthole's research note is in ADR-0012 ("DOC: Publishing to the Marketplace without a stored token") and its decision date is 2026-11-15. **Suggestion for the skill:** a dated banner at the top of §II ("this mechanism is retired on 2026-12-01; see ...") and a line in the Quick Reference.

