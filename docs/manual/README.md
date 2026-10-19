# Porthole manual source

This directory is the editable source for the
[Porthole manual](https://jlumbroso.github.io/porthole-docs/).
Corrections, examples, and pull requests are welcome here in the Porthole
repository. You do not need access to any other repository to contribute
or preview your changes.

## Contributing

1. Edit a chapter in `content/*.html`. These are small HTML fragments;
   the same source generates the website and its Markdown exports.
2. Edit `content/chapters.json` for chapter titles, introductions,
   navigation labels, and margin notes.
3. Build and inspect the preview, then open a pull request against this
   repository. For a small wording change, the manual's **Edit on GitHub**
   link opens the chapter directly in GitHub's editor.

If you would rather describe the problem, use the
[documentation correction form](https://github.com/jlumbroso/porthole/issues/new?template=documentation.yml).
Include the page, the wording or missing topic, and a suggestion if you have
one. Bug reports about the extension can use the separate bug-report form.

Use a named Porthole release as the basis for instructions. Keep command
names, settings, permission scope, and known limitations accurate. Prefer
concrete instructions over self-praise. Preserve notes and limitations in
the Markdown exports and page-copy text. A command sent is not proof that
a window appeared.

## Preview

From the repository root, with Python 3.9 or later:

```sh
python3 docs/manual/scripts/build.py
python3 -m http.server 8080 --bind 127.0.0.1 --directory docs/manual/_site
```

Open `http://127.0.0.1:8080/`. The build checks links, anchors, the public
file list, and exact agreement between copied text and Markdown exports.
The manual CI job runs the same build for pull requests. Generated `_site/`
files are ignored and should not be committed.

There are no application dependencies: the builder uses Python's standard
library, and the website uses HTML, CSS, and native JavaScript. Do not
introduce React, JSX, MDX, Babel, or other Meta-origin tooling.

## Publication and fonts

This public directory is authoritative. The separate publishing workspace
imports an explicit file list from this repository and deploys only the
built website at its existing address. After merging a manual change, a
maintainer runs:

```sh
gh workflow run pages.yml --repo jlumbroso/porthole-docs
```

Merging a pull request does not itself deploy the manual. The maintainer
checks the deployment and the live pages before reporting publication.
Private editorial and coordination records are not part of this source
bundle or the website.

The preview loads Berkeley Mono from its existing hosted stylesheet.
Purchased font binaries are not in this repository and are not covered
by the repository's MIT license. If the stylesheet cannot load, the
preview uses a system monospace font. The retained image license is in
`assets/LICENSE.porthole`.
