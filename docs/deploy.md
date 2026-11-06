# Deploying the site

How the Hugo site in this repository becomes blowhorn.ai: the build, the
GitHub Pages deployment, the custom domain, the DNS records the registrar
needs, and how to verify a deployment.

## What deploys, and when

[`site.yml`](../.github/workflows/site.yml) runs on every pull request and on
every push to `master`:

1. It installs the pinned toolchain: Go from [`go.mod`](../go.mod) (Hugo
   fetches Docsy as a Hugo module), Node.js from [`.nvmrc`](../.nvmrc), and
   Hugo extended and postcss from [`package.json`](../package.json) with
   `npm ci`. The checkout has full history so each page's last-modified date
   (sitemap, `llms-full.txt`) comes from git.
2. `make workflow-check` lints the workflows with actionlint, and
   `make test-scripts` runs the unit tests for the check scripts below.
   Every step is a make target (`make setup-ci` installs the dependencies);
   `make ci` runs the whole job locally in the same order.
3. `make site-check` builds for production into `public/` once
   (`hugo --cleanDestinationDir --minify --gc`, which cleans stale files out
   of the destination, minifies CSS and JavaScript and leaves HTML
   readable), then checks that output:
   - `make validate-html`: html-validate on every page;
   - `make check-links`: every local link, image, font and `srcset` reference
     resolves ([`check-site-links.py`](../.github/scripts/check-site-links.py));
   - `make check-third-party`: no page, stylesheet or script it loads
     requests anything from another host ([`check-third-party.py`](../.github/scripts/check-third-party.py)),
     because the privacy page promises it. The one exception is the Download
     section's release lookup on `api.github.com` (`assets/js/download.js`),
     which the privacy page discloses; it is the only host besides github.com
     (links) that a script may name;
   - `make check-urls`: every public URL and every anchor the site has
     published still exists
     ([`check-site-contract.py`](../.github/scripts/check-site-contract.py)).
4. `public/` is uploaded as the Pages artifact.
5. On `master` only (a push or a manual run), the `deploy` job publishes that
   artifact with `actions/deploy-pages` under the `github-pages` environment.
   The job needs `pages: write` and `id-token: write`, which it declares itself.

A pull request never deploys. Its run still uploads the built site as the
`github-pages` artifact, which you can download from the run to inspect.

## Relationship to layer5io/docs workflows

The site borrows workflow patterns from `layer5io/docs`, but only where they
match Blowhorn's build and hosting model. The comparison for issue #425 made
these decisions:

- Keep `site.yml` as the only production build and deployment workflow.
  Layer5's `hugo.yaml` is not copied: `site.yml` already uses the repository's
  pinned Go, Node.js and Hugo toolchain, runs the repository checks, uploads a
  Pages artifact and deploys it from `master` with GitHub's Pages actions.
- Keep the existing `label-commenter.yml`, `labeler.yml` and `slack.yml`
  workflows instead of adding copies from Layer5.
- Do not port `cloud-release-docs.yml`,
  `meshery-extension-release-docs.yml`, `discussion-data-files-update.yml`,
  `feature-list.yml`, `generate-keys.yml` or `generate-pricing-list.yml`.
  They dispatch Meshery and Kanvas release notes, fetch Meshery discussion
  data or generate Meshery documentation from Google Sheets, and have no
  Blowhorn equivalent.
- `copilot-pr-handler.yml` adapts Layer5's Copilot pull-request handler with a
  Blowhorn repository guard, the `copilot-swe-agent[bot]` author check and
  pinned actions.
- Treat the Layer5 pull-request preview workflows as a pattern, not a direct
  port. They publish to a `gh-pages` branch, while this repository publishes
  Pages from a workflow artifact. Preview publication therefore waits for a
  maintainer-selected host; the production deployment model stays unchanged.

### Copilot pull-request handler

[`copilot-pr-handler.yml`](../.github/workflows/copilot-pr-handler.yml) runs
when `copilot-swe-agent[bot]` opens, updates or reopens a pull request against
`master`. It marks a draft ready for review, then approves any workflow runs
waiting for approval at that pull request's exact head SHA. A maintainer can
also run it manually with a pull request number.

The handler needs `actions: write` to approve runs, `pull-requests: write` to
mark a draft ready and `contents: read` to check out its helper. It uses the
run's `GITHUB_TOKEN`; this repository does not need a separate access-token
secret. Because `pull_request_target` is privileged, its checkout is pinned to
`master`, credentials are not persisted, and it never checks out or executes
the pull request head. Repository logic lives in
`.github/scripts/copilot_pr_handler.py`, runs through
`make copilot-pr-handle PR_NUMBER=<number>` and is covered by
`make test-scripts`.

### Verify a deployment

```bash
gh-axi run list -R blowhorn-ai/blowhorn-site --workflow site.yml
```

The newest run on `master` should show both jobs green. The deployment is live
at the Pages URL within a minute of the `deploy` job finishing:

- <https://blowhorn.ai/> once DNS points at GitHub Pages (below).
- <https://blowhorn-ai.github.io/blowhorn-site/> is the project URL. Because the
  custom domain is already set on Pages, GitHub redirects this URL to
  `https://blowhorn.ai/`, so nothing is reachable there until the DNS records
  below are in place. The artifact itself deploys fine either way.

## Pages configuration

Pages is configured to publish from GitHub Actions (`build_type: workflow`),
not from a branch. The one-time setup, done with an account that administers
the repository:

```bash
gh-axi api -X POST repos/blowhorn-ai/blowhorn-site/pages --field build_type=workflow
# or, if Pages already exists:
gh-axi api -X PUT repos/blowhorn-ai/blowhorn-site/pages --field build_type=workflow
```

This was done on 2026-10-08: Pages exists with `build_type: workflow` and the
custom domain `blowhorn.ai`. HTTPS enforcement is set once GitHub issues the
certificate, which needs the DNS records below.

`static/CNAME` (published as `/CNAME`) carries `blowhorn.ai` for completeness. With a workflow
deployment GitHub ignores the file; the custom domain is the one set through
the API or Settings > Pages, below.

## Custom domain: blowhorn.ai (the apex)

The site is published under **blowhorn.ai**. `www.blowhorn.ai` is optional:
when its record also points at GitHub, Pages redirects it to the apex.

blowhorn.ai is registered at Porkbun and its DNS is served by Cloudflare. Only
the domain's owner can change records. Today the apex resolves to Cloudflare's
proxy addresses and answers HTTP 526: the record is proxied, so GitHub cannot
verify the origin or issue a certificate. Those records are what the ones
below replace.

### Step 1: the apex records (do this first)

Pick one of the two forms. Either way the record is **DNS only** (grey cloud):
keep the Cloudflare proxy off at least until GitHub has issued the certificate,
because the proxy hides the origin from GitHub's certificate check.

Form A, a flattened CNAME (Cloudflare resolves it to GitHub's addresses itself):

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `blowhorn-ai.github.io` | DNS only |

Form B, GitHub Pages' fixed addresses:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

Wait until the apex resolves to GitHub:

```bash
dig +short A blowhorn.ai        # expect the four 185.199.* addresses
dig +short AAAA blowhorn.ai     # expect the four 2606:50c0:* addresses
```

The Pages custom domain is already `blowhorn.ai`. Confirm it, watch the
certificate, and enforce HTTPS once GitHub reports it issued (Settings > Pages
shows "Enforce HTTPS" as available):

```bash
gh-axi api repos/blowhorn-ai/blowhorn-site/pages --jq '.cname, .https_certificate.state'
printf '{"https_enforced":true}' | gh-axi api -X PUT repos/blowhorn-ai/blowhorn-site/pages --input -
```

If the custom domain ever has to be set again:

```bash
gh-axi api -X PUT repos/blowhorn-ai/blowhorn-site/pages --field cname=blowhorn.ai
```

Certificate issuance usually takes a few minutes and can take up to a day. If
it stalls, the usual cause is the Cloudflare proxy being on for the record.

### Step 2: the www record (optional)

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `www` | `blowhorn-ai.github.io` | DNS only |

With `blowhorn.ai` as the Pages custom domain and this record in place, GitHub
answers `www.blowhorn.ai` with a redirect to `https://blowhorn.ai/`.

```bash
dig +short CNAME www.blowhorn.ai   # expect: blowhorn-ai.github.io.
curl -sI https://www.blowhorn.ai   # expect 301 to https://blowhorn.ai/
```

## URLs

Every page and asset reference is root-relative (`/css/site.<hash>.css`,
`/assets/brand/...`), built from `baseURL` in [`hugo.toml`](../hugo.toml)
(`https://blowhorn.ai/`). That is what lets `404.html` work for any missing
path, nested ones included. A build with a different base URL
(`make site-build BASE_URL=...` or `make build-preview`) prefixes every
reference with that URL's path. The project URL
`blowhorn-ai.github.io/blowhorn-site/` redirects to blowhorn.ai, so nothing is
served under that path in production.

The public URLs are a contract, checked by `make site-check`:

- `/`, and the Trust Center: `/legal/`, `/legal/privacy/` and `/legal/terms/`
  (`content/en/legal/`), with Markdown copies at `/legal/index.md`,
  `/legal/privacy/index.md` and `/legal/terms/index.md`.
- The old `/privacy.html` and `/terms.html` redirect to their `/legal/` pages.
  GitHub Pages cannot send a server redirect, so each is a Hugo alias page (the
  pages' `aliases:` front matter, rendered by `layouts/alias.html`): a meta refresh
  plus a canonical link to the new URL. `/privacy.md` and `/terms.md` are
  static notes pointing at the new Markdown copies.
- The home page's anchors: `#platforms`, `#how`, `#trust`, `#download`.
- The onboarding page `/welcome/` (opened by the Chrome extension on install,
  `layouts/onboarding.html`), and the short paths `/download/`, `/install/`,
  `/signup/`, `/login/` and `/early-access/`, each a meta refresh rendered by
  `layouts/redirect.html`. `/signup/`, `/login/` and `/early-access/` go to
  Blowhorn (no early-access form: anyone without a plan starts the beta
  there), whose URL is `params.cloud_url` in `hugo.toml` alone. None of these
  is listed in `sitemap.xml` or `llms.txt`.
- `/assets/brand/...` (from `static/assets/brand/`), `/assets/brand/cards.css`
  (the card variants, published from `assets/css/cards.css` for tells.blowhorn.ai;
  [DESIGN.md](../DESIGN.md), Cards), `/favicon.ico`, `/CNAME`.
- The two brand kits on `/brand/`: `/brand/blowhorn-brand-kit.zip` (the full kit,
  the URL the kit has always had) and `/brand/blowhorn-logo-kit.zip`.
- Generated: `/sitemap.xml`, `/robots.txt` (which names the sitemap),
  `/llms.txt`, `/llms-full.txt` and `/index.md`.

The canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt` name
`https://blowhorn.ai/`. A build with `HUGO_PREVIEW=true` marks every page
`noindex, nofollow` and its `robots.txt` disallows everything.

Docsy's own static files (Font Awesome webfonts, its favicons and a few
scripts) are published too because Docsy is imported as a module, as in
layer5io/docs; no page loads them.

## Local checks and evidence

```bash
make setup         # once: npm install
make check         # production build, html-validate, link, third-party and contract checks, check-script tests, actionlint: what CI runs
make site          # http://localhost:1313 with live reload
```

## API reference

The reference page for the product's operations (`/docs/reference/api/`) is built but not enabled; see [api-reference.md](api-reference.md). `make check-api-reference` runs in `site-check` and does nothing while `params.apiReference.spec` is empty.

## Product docs sync

The user docs under `/docs/` live in the private product repository
(`blowhorn`, `docs/{tutorials,how-to,reference,explanation}`
and `docs/README.md`) and are mirrored into `content/en/docs/` by
[`sync-docs.yml`](../.github/workflows/sync-docs.yml). The private
repository runs no moderate or heavy Actions of its own, so the work runs
here, on the public site repository.

1. The workflow checks out the product repository at the requested ref
   (a tag, branch or SHA; `master` by default) read-only with the existing
   `DMG_SOURCE_TOKEN` secret (no new secret), the way `publish-dmg.yml`
   handles it. `make docs-cli-reference` then regenerates the product's
   CLI reference pages (`docs/reference/cli/*.md` and the command table in
   `docs/reference/cli.md`) at that ref with the product's own
   `release/scripts/cli_reference/build.py`, which reads its CLI schema, so
   a page is never published stale. The workflow then runs
   `make docs-sync REF=...`, which is
   [`.github/scripts/sync-docs.py`](../.github/scripts/sync-docs.py)
   (tested by `make test-scripts`). The script copies the four public
   sections and rewrites each page for the site: relative `.md` links
   become root-relative site URLs, `reference/cli.md` becomes the
   `reference/cli/` section index, a missing title is derived from the
   first H1, aliases colliding with a published URL are dropped, and
   headings whose auto id would not begin with a letter get an explicit
   `{#anchor}`. "Blowhorn Cloud" and "Layer5 Cloud" in prose become
   "Blowhorn" (the naming rule `check_naming.py` enforces; fenced code is
   left alone), and each rename is reported as a converter warning. `docs/internal/`, `docs/gtm/` and any path listed in the
   product's `internal-paths.txt` (when it exists: `release/internal-paths.txt` in the product's current layout, else `docs/` or the product root) are never copied.
2. The product is the only source for `content/en/docs/`: the docs
   landing comes from the product's `docs/_index.md` and each section
   landing from that section's `_index.md`. `docs/README.md` is the
   product's GitHub index and is not copied. Edit docs pages in the
   product, never here: the next sync overwrites a hand edit. A site
   `_index.md` landing with no product source is kept as is and reported
   in the sync warnings; every other synced page is the product's file
   converted. Pages carrying `draft: true` stay
   unpublished until the product ungates them.
3. The workflow commits the result signed off (DCO) to the `docs-sync`
   branch (`make docs-sync-base` builds it on the open sync PR's head, or
   afresh on `master` when none is open, so a branch left by a merged PR
   is replaced), opens or updates the one `docs: sync from <ref>` pull
   request, and starts the normal site checks on it itself
   (`make docs-sync-start-checks`, which runs
   `gh workflow run site.yml --ref docs-sync` via `workflow_dispatch`):
   pushes and pull requests made with `github.token` never start
   `pull_request` or `push` workflows, so `site.yml` would otherwise stay
   silent on the sync PR, while a `workflow_dispatch` run started with that
   same token is allowed and attaches to the branch head, showing as the
   PR's check. Once those checks pass the workflow merges the PR itself
   (`make docs-sync-merge`, squash): `master` has no branch protection,
   so GitHub's own auto-merge would have no required checks to wait for
   and would merge before the dispatched run finished. The merge is made
   with `github.token`, whose pushes start no workflows, so the workflow
   then starts `site.yml` on `master` by the same dispatch, and that run
   deploys. If a check fails, nothing merges and the PR stays open for a
   human. The workflow never pushes to `master` directly.

A public release starts the sync by itself: `publish-dmg.yml`'s last job
runs `make dmg-sync-docs`, which starts `sync-docs.yml` at the product tag
`desktop-<version>`. A draft release starts nothing; run the sync by hand
once the release is published.

When a synced page breaks a check, fix the converter or the site-side
rendering it drives (`layouts/alias.html`, `layouts/_markup/`,
`hugo.toml` markup settings), never the product docs: the next sync
would overwrite a product-side edit anyway. A product-doc defect the
converter cannot fix (a link outside the published tree, a reference to
the private repository) goes in the sync pull request's description, to
be fixed upstream and re-synced.

Run the same flow locally from a product checkout at `./product`
(or pass `SOURCE_DIR` for a checkout elsewhere):

```bash
git clone git@github.com:blowhorn-ai/blowhorn.git product
make docs-sync REF=master   # or a tag, branch or SHA
make check                  # what the sync pull request runs
```

Before a visual change ships, build for production and serve `public/`, then
take screenshots at 390, 820 and 1440 px wide in both colour schemes and
confirm there is no horizontal scroll from 320 to 1440 px. With
chrome-devtools-axi:

```bash
make site-build && python3 -m http.server 8080 --directory public
chrome-devtools-axi open http://localhost:8080/
chrome-devtools-axi resize 390 844
chrome-devtools-axi emulate --color-scheme dark
chrome-devtools-axi screenshot /path/to/evidence/home-390-dark.png --full-page
chrome-devtools-axi eval 'document.documentElement.scrollWidth > document.documentElement.clientWidth'   # must be false
```

Two capture gotchas. Headless Chrome will not shrink a window below 500 px, so
`resize 390 844` silently shoots at 500: use
`emulate --viewport "390x844x2,mobile"` for phone widths and check
`innerWidth`. The ambient background is a `position: fixed` layer, so a
`--full-page` shot taller than the viewport shows a hard seam where the layer
ends; set the viewport height to `document.documentElement.scrollHeight`
before shooting instead.

## Internal section (Hugo segments and module mounts)

`/internal/` is the internal Blowhorn site. Its source never enters this
repository, which is public: it lives in the private blowhorn
repository, and only the internal environment mounts it.

### Builds and local servers

| Target | What it does | Output |
| --- | --- | --- |
| `make site-build` | Public build (`hugo`, production environment, `renderSegments = ["public"]`), what CI deploys | `public/`, no `/internal/` |
| `make site-internal-build` | Internal build (`hugo --environment internal`, `renderSegments = ["internal"]`) with the blowhorn clone mounted; renders only `/internal/`, with its own header, footer and navigation, and Docsy offline search over those internal pages only; the output's root page redirects to `/internal/` | `public-internal/`: `/internal/` pages, and `offline-search-index.json` at the output root |
| `make site` / `make site-internal` | Live-reload servers for the two builds (the internal one renders in memory) | http://localhost:1313 |

The internal targets need a blowhorn clone at `BLOWHORN_DIR`
(default `../blowhorn`, beside this clone) and fail with a clear error when it
is missing. blowhorn's Makefile has the same four targets
(`site`, `site-internal`, `site-build`, `site-internal-build`), which run
these with `BLOWHORN_SITE_DIR` (default `../blowhorn-site`).

### Mounts

`hugo.toml` declares Hugo's default project mounts explicitly
(`content/en`, `data`, `layouts`, `i18n`, `archetypes`, `assets`, `static`),
since declaring any mount drops the defaults. `config/internal/hugo.toml`
adds a module import, `github.com/blowhorn-ai/blowhorn`, with its own mounts:

```toml
[[module.imports]]
  path = "github.com/blowhorn-ai/blowhorn"
  ignoreConfig = true
  [[module.imports.mounts]]
    source = "marketing/strategy/hugo/strategy"
    target = "content/internal/strategy"
  [[module.imports.mounts]]
    source = "marketing/strategy/hugo/finance"
    target = "content/internal/finance"
  [[module.imports.mounts]]
    source = "marketing/strategy/finance/blowhorn-breakeven-model.xlsx"
    target = "content/internal/finance/blowhorn-breakeven-model.xlsx"
  [[module.imports.mounts]]
    source = "marketing/strategy/finance/blowhorn-breakeven.html"
    target = "assets/internal/finance/blowhorn-breakeven.html"
  [[module.imports.mounts]]
    source = "marketing/strategy/finance/build"
    target = "assets/internal/finance/build"
  [[module.imports.mounts]]
    source = "marketing/capability-comparison/compare-assistants.csv"
    target = "assets/internal/compare-assistants.csv"
    source = "marketing/capability-comparison/compare-personas.csv"
    target = "assets/internal/compare-personas.csv"
    source = "marketing/capability-comparison/compare-segments.csv"
    target = "assets/internal/compare-segments.csv"
  [[module.imports.mounts]]
    source = "marketing/brand/hugo/assets"
    target = "content/internal/assets"
  [[module.imports.mounts]]
    source = "marketing/assets.manifest.json"
    target = "static/internal/marketing-assets/assets.manifest.json"
  [[module.imports.mounts]]
    source = "marketing/cast"
    target = "static/internal/marketing-assets/cast"
    files = ["**/*-640.webp"]
  [[module.imports.mounts]]
    source = "internal/engineering/hugo/engineering"
    target = "content/internal/engineering"
  [[module.imports.mounts]]
    source = "internal/design/hugo/design"
    target = "content/internal/design"
  [[module.imports.mounts]]
    source = "internal/design"
    target = "content/internal/design"
    excludeFiles = ["hugo/**", "README.md"]
  [[module.imports.mounts]]
    source = "internal/specs/hugo/specs"
    target = "content/internal/specs"
  [[module.imports.mounts]]
    source = "internal/specs"
    target = "content/internal/specs"
    excludeFiles = ["hugo/**", "README.md"]
  [[module.imports.mounts]]
    source = "internal/plans/hugo/plans"
    target = "content/internal/plans"
  [[module.imports.mounts]]
    source = "internal/plans"
    target = "content/internal/plans"
    excludeFiles = ["hugo/**", "README.md"]
  [[module.imports.mounts]]
    source = "internal/research/hugo/research"
    target = "content/internal/research"
  [[module.imports.mounts]]
    source = "internal/research"
    target = "content/internal/research"
    excludeFiles = ["hugo/**", "README.md"]
```

Four sections render the blowhorn repository's own document folders as
they are: `internal/design`, `internal/specs`, `internal/plans` and
`internal/research` mount directly into `/internal/<area>/`, so the plans,
designs, specs and research that live only in the repository are on the
internal site without moving or copying a file. Each area's `hugo/<area>/`
folder carries only the section scaffold (`_index.md`: title, weight,
description); the raw mount excludes that folder and the area's root
`README.md`, which is the folder's GitHub index, not a site page. The
Each document carries only `title` (its own first heading) and
`layout: internal` as front matter, added in place in the repository;
nothing else about the documents changes. Relative links between
documents keep their repository shape and resolve in the repository, not
in the site.

`make site-internal-build` points the import at the clone with
`HUGO_MODULE_REPLACEMENTS="github.com/blowhorn-ai/blowhorn -> <abs BLOWHORN_DIR>"`,
so nothing is downloaded, copied or vendored. Because the import lives
only in the internal environment, the public build never reads the private
repository. Hugo replaces `module.imports` per environment instead of
merging it, so `config/internal/hugo.toml` repeats the two Docsy imports;
the project's own mounts from `hugo.toml` carry over (`hugo config mounts
-e internal` lists both). The comparison CSV mounts into `assets/`, not
`data/`, because Hugo's data directory does not read CSV; the
`internal-compare` shortcode unmarshals it. The shortcode sizes each column
from its cells, never its name, so a column the CSV gains needs no template
change: all-status columns stay narrow, a column with any cell over 100
characters gets a reading width, and the table scrolls sideways in its own
region at the page's full width. The break-even report is wrapped
by `marketing/strategy/hugo/finance/report/index.md` (layout `internal-raw`),
and the finance page lists the XLSX and the generator scripts as downloads.

The user docs under `content/en/docs/` stay on the committed docs-sync copy
(`make docs-sync`) rather than a mount of the blowhorn repository's `docs/`: a
mount would make every public build, including this repository's public CI,
need a token for the private repository.

### Segments and checks

- `public`: every page except `/internal` and `/internal/**`.
- `internal`: only `/internal` and `/internal/**`.
- `all`: every page. Used by the internal build.

The internal section's committed `content/en/internal/_index.md` is
`build: {list: never}` itself and cascades `build: {list: local}` and
`type: docs` to every internal page. Internal pages stay out of the
site-wide collections (menus, llms.txt, the sitemap and related lists),
even in the internal build, but stay in their parents' `.Pages`, so they
render in the docs shell (`layouts/docs/baseof.html` with
`layouts/docs/internal.html`) with the docs sidebar, breadcrumb, table of
contents and prev/next built from the `/internal/` section tree. Page order
is each page's `weight`. Docsy's offline index reads `.Site.AllPages`, which
those `list` settings leave empty of internal pages, so the internal build
does not use it. It publishes its own index,
`public-internal/offline-search-index.json`, by walking the `/internal/`
section (`.Pages` recursively,
`assets/json/offline-search-index-internal.json`). That file is generated
only in the internal environment. The public build keeps Docsy's index and
never lists an `/internal/` page, title or passage. The public build never
renders any internal page.

`make check-no-internal` (part of `make site-check`, and a step in
`site.yml`) fails when `public/internal` exists, a public page links to
`/internal/` or names an internal file, the public offline search index is
missing or contains `/internal/`, or git tracks anything under
`content/en/internal/` other than `_index.md`.

### Where the internal build runs

The internal build and Worker deploy run in this repository's Actions
(`.github/workflows/internal-site.yml`), started by hand, by
`internal-site-auto.yml`, or by `repository_dispatch`. The private product
checkout is sparse, never uploaded, and removed before the job ends; build
and wrangler output stay suppressed because this repository is public. There
is no private host and no artifact of `public-internal/`.

### Footguns

- A `--renderSegments` flag on the command line overrides the config.
  `hugo --renderSegments all` renders whatever is mounted.
- `hugo server` honours `renderSegments`, but without `--renderToMemory` it
  also writes to `public/` and serves stale files from there; an internal
  server run that way leaves `/internal/` pages in `public/`. Use
  `make site-internal`.
- A segment name that is not defined renders nothing, with no error.
- `renderSegments = ["public", "internal"]` does not render `/internal/` in
  Hugo 0.158: the `public` segment's excludes win. Use `all`.
- `hugo config` with no `-e` reports a different environment's mounts than
  `hugo` builds with; pass `-e production` or `-e internal` when checking.

## Internal site hosting (internal.blowhorn.ai, Cloudflare Access)

The internal build is served by the `blowhorn-internal` Cloudflare Worker
(`internal-worker/`) at https://internal.blowhorn.ai/, behind a Cloudflare
Access application. Nobody reaches a page, asset or file there without
signing in to Access as someone the allow list admits: anyone at an allowed
email domain (layer5.io), a named team member, or an extra address from the
`INTERNAL_ACCESS_EXTRA_EMAILS` secret. See "Who can read it" below. The one
exception is a request from a trusted network in `bypass_ip_ranges`, which
reaches the site without signing in; see "Trusted networks" below.

| Layer | What it enforces |
| --- | --- |
| Access application (self-hosted, the whole hostname) | Login required; one reusable `allow` policy whose only rules are the email domains, named emails and extras, and the login methods in `allowed_idps`. When `bypass_ip_ranges` is not empty, one reusable `bypass` policy whose only rules are those IP ranges comes first (precedence 1, the allow policy 2). Anything not allowed is denied. |
| Worker (`internal-worker/src/worker.js`, `run_worker_first`) | Every request, assets included, must carry an Access token signed by the team's keys, for this application's audience, unexpired, for an email the Worker admits: a named address, or an address whose domain is exactly one of `ALLOWED_EMAIL_DOMAINS` (no subdomain or look-alike match). The only exception is a request whose `CF-Connecting-IP` (set by Cloudflare's edge, not the client) is inside `ALLOWED_IP_RANGES`, the same `bypass_ip_ranges`. Otherwise 403. A missing or misconfigured Access application, or an empty allow list, fails closed. |
| `wrangler.json` | Custom domain only: `workers_dev` and `preview_urls` are off, so no other hostname serves the Worker. `verify-worker` confirms it after each deploy. |

The root (`/`) serves the `/internal/` page, whose table of contents
(`layouts/_partials/internal-contents.html`) is generated from the content
tree on every build. Locally, `make site-internal` still redirects `/` to
`/internal/`.

### Who can read it

The allow list has three sources, all read by `.github/scripts/internal_access.py`
so the Access policy and the Worker's allow list always match:

- **Email domains.** `allowed_email_domains` in `internal-worker/access.json`
  (today `layer5.io`) admits every address at that domain. The match is exact:
  `sub.layer5.io` and `layer5.io.example.com` are not admitted.
- **Named emails in the repository.** `allowed_emails` in the same file. This
  repository is public, so list only the team's own addresses, each at an
  allowed domain (a test in `.github/scripts/test_internal_access.py` checks it).
- **Extra people, from a secret.** The `INTERNAL_ACCESS_EXTRA_EMAILS` repository
  secret holds addresses outside the domains, one per line or comma-separated.
  Set it from a file, never on the command line or in the repository:

  ```sh
  gh secret set INTERNAL_ACCESS_EXTRA_EMAILS -R blowhorn-ai/blowhorn-site < extras.txt
  ```

  The secret's name is in `extra_emails_env`. The deploy fails unless it is set,
  so an unconfigured secret can never silently drop teammates. Under Actions each
  address is masked before any output, and the scripts print only counts. A
  malformed entry fails the run by count, without echoing it.

A change to the secret takes effect on the next deploy. To apply it now, run
`make site-internal-deploy` by hand.

### Trusted networks

`bypass_ip_ranges` in `internal-worker/access.json` lists the networks that
reach the site without signing in, as CIDRs with no host bits set (a single
address is `/32` for IPv4 or `/128` for IPv6). Client operating systems often
rotate temporary IPv6 addresses inside the same `/64` (privacy extensions),
so a home network should be listed as that `/64` rather than one `/128`.
It is the one place to edit them. From it:

- `internal_access.py ensure` creates or updates the reusable `bypass` policy
  named `bypass_policy_name`, whose only rules are those IP ranges, and
  attaches it to the application before the allow policy. Access issues no
  token for a bypassed request.
- `internal-deploy.sh` passes the same list to the Worker as
  `ALLOWED_IP_RANGES`, so the Worker serves those networks without a token.

The verification fails unless the application has exactly the bypass policy
then the allow policy, and the bypass policy holds exactly the configured
ranges and nothing else (no Everyone, no email rule). Empty the list, or
remove the key, to drop the bypass: the next deploy detaches the policy.
Addresses in this file are public, so add only networks you are happy to
name. `make site-internal-verify` probes from a GitHub runner, which is not a
trusted network, so it still expects the Access login.

To change the list, edit `bypass_ip_ranges` in a pull request and merge; the
push to `master` redeploys (see "Shipping an update").

### Login methods

`allowed_idps` lists the login methods on the Access login page, by Cloudflare
identity provider type. Automatic redirect to one method is off, so the page
shows every method allowed. Each type must match exactly one login method on
the account. `internal_access.py` resolves the types to ids at run time, and
the deploy fails, naming the type, when there are none or more than one.

- **One-time PIN** (`onetimepin`): Access emails a code to the address signing
  in. This is how the allowed addresses sign in today. If it is missing from
  Zero Trust > Settings > Authentication > Login methods, add it there.
- **Google** (`google`): add it before listing it, because the deploy fails on
  an `allowed_idps` type with no login method behind it.
  1. In Google Cloud Console, create an OAuth 2.0 client ID of type Web
     application. Set the authorized redirect URI to
     `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback` and the
     authorized JavaScript origin to `https://<team>.cloudflareaccess.com`
     (`<team>` is the Zero Trust team name).
  2. Set the OAuth consent screen to user type External, publishing status In
     production, with only the `openid`, `email` and `profile` scopes.
  3. Add it in Zero Trust > Settings > Authentication > Login methods > Add new
     > Google, with the client ID and secret. Or send `POST
     /accounts/{account_id}/access/identity_providers` with `type` `google` and
     `config` holding `client_id` and `client_secret`.
  4. In a pull request, add `"google"` to `allowed_idps` in `access.json`, then
     merge. The client secret stays in Cloudflare, never in the repository.

Any Cloudflare identity provider type can be listed the same way.

### Shipping an update

`.github/workflows/internal-site.yml` builds and deploys. It redeploys on its
own after a change to anything the internal build is made from:

- **Site side (this repository).** `.github/workflows/internal-site-auto.yml`
  calls it on every push to `master` that touches `config/internal/**`,
  `internal-worker/**`, `static-internal/**`, `layouts/**`, `assets/**`,
  `.github/scripts/internal*`, either internal workflow, the `Makefile`, or
  the toolchain (`package.json`, `package-lock.json`, `.nvmrc`, `go.mod`,
  `go.sum`, `hugo.toml`, `postcss.config.js`).
- **Product side (blowhorn-ai/blowhorn), polled.** Every 15 minutes the same
  workflow runs `make site-internal-poll`, which asks the GitHub API, with
  `DMG_SOURCE_TOKEN`, whether blowhorn `master` has a commit in the last 30
  minutes under a mounted path (`marketing/strategy/**`,
  `marketing/capability-comparison/**`, `marketing/brand/**` including the
  asset catalog, `marketing/cast/**`, `marketing/assets.manifest.json`, or
  `internal/{engineering,design,specs,plans,research,features}/**`). If so it deploys
  that `master` SHA. The run fails, rather than skipping, when
  `DMG_SOURCE_TOKEN` is missing or cannot read the repository. Polling keeps
  the work on this public repository's free minutes; the private repository
  spends none. A change is redeployed on each poll for about 30 minutes, which
  rides out one delayed or dropped scheduled run without eight repeats.
- **Product side, pushed.** A client with a token that can dispatch on this
  repository sends `repository_dispatch` with event type
  `deploy-internal-site` and optional
  `client_payload: {"blowhorn_ref": "<sha-or-master>"}`:

  ```sh
  gh api repos/blowhorn-ai/blowhorn-site/dispatches \
    -f event_type=deploy-internal-site -f 'client_payload[blowhorn_ref]=master'
  ```

  blowhorn's `.github/workflows/internal-site-dispatch.yml` does this on a
  merge under the mounted paths, with the repository secret
  `SITE_DISPATCH_TOKEN` (a token with Contents: write on
  blowhorn-ai/blowhorn-site, which `repository_dispatch` requires). Without
  that hook, the poll still picks the change up within about 15-45 minutes.
- **By hand.** From a blowhorn-ai/blowhorn clone (or here):
  `make site-internal-deploy` (`REF=<branch|tag|sha>` to build something other
  than master, `WATCH=0` to not wait) runs the workflow by
  `workflow_dispatch`. Actions > Internal site (auto) > Run workflow runs the
  auto path by hand.

Deploys queue on the workflow's `internal-site` concurrency group, so an
automatic deploy waits for a running one instead of cancelling it.

The workflow, in order (each step is a make target):

1. Fails unless `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `INTERNAL_ACCESS_EXTRA_EMAILS` and the `BLOWHORN_INTERNAL_READ_KEY`
   environment secret are set.
2. `site-internal-access-check`: read-only probe of the token's permissions,
   including the login methods.
3. `site-internal-access`: creates or updates the Access policy, application
   and login methods, reads them back, and fails unless they are exactly the
   managed default-deny pair with the configured domains, emails and login
   methods. This runs before any private content reaches the runner.
4. Checks out blowhorn-ai/blowhorn (sparse: `marketing/strategy`,
   `marketing/capability-comparison`, `marketing/brand`, `marketing/cast`,
   `marketing/assets.manifest.json`, `internal/engineering`,
   `internal/design`, `internal/specs`, `internal/plans`,
   `internal/research`, `internal/features`) with the read-only deploy key.
5. `site-internal-build` with `BASE_URL=https://internal.blowhorn.ai/`, output
   suppressed.
6. `site-internal-worker-deploy`: `wrangler deploy` with a filtered summary,
   then `verify-worker` (workers.dev and previews off).
7. `site-internal-verify`: unauthenticated probes of `/`, a deep link, an
   asset and a guessed URL must all redirect to the Access login. A 2xx
   deletes the Worker and fails the run.

### Dynamic pages (signups, fleet stats)

Two pages are rendered by the Worker per request from D1, after the same
Access check as every static page, so their data changes without a build:

- `/internal/signups/` and `/internal/signups/export`: the `SIGNUPS_DB`
  binding (`blowhorn-signups`), written by the public signup worker.
- `/engineering/fleet/` (moved from `/internal/fleet/`, which now 301s here), plus `data.json`, `workload.csv` and `disk.csv` beside
  it (each takes `?days=N`, default 7, at most 90): the `FLEET_DB` binding
  (`blowhorn-fleet-stats`). A zero-token cron on Bastion writes teammate
  workload every hour and machine disk free every 6 hours into its
  `snapshots` table (`kind`, `collected_at`, JSON `body`). The teammate workload table defaults to Done 24h descending (highest first, numeric); clicking a column header still sorts, and that choice is kept across refreshes. The collector, its
  schedule and its least-privilege D1 token live in koopverse/firstmate
  `fleet/fleet-stats/` (koopverse/firstmate#72).

`.github/scripts/resolve-d1.sh` swaps every placeholder `database_id` in
`wrangler.json` for the real one, creating a database that does not exist yet.

### This repository is public

Its Actions logs are world-readable. The workflow uploads no artifact,
prints no build or wrangler output beyond an allow-listed summary, never uses
`set -x`, `tree`, `ls` or `find` on the build, and removes the private
checkout after building. Keep it that way in any change to the workflow or
`.github/scripts/internal-*`. Debug a failed build locally with
`make site-internal-build`, never by adding output to the workflow.

### Credentials

- `CLOUDFLARE_API_TOKEN` (repository secret) needs: Account > Workers
  Scripts > Edit; Account > Account Settings > Read; Zone (blowhorn.ai) >
  Workers Routes > Edit; Account > Access: Apps and Policies > Edit;
  Account > Access: Organizations, Identity Providers, and Groups > Read
  (the last also reads the login methods that `allowed_idps` names).
- `CLOUDFLARE_ACCOUNT_ID` (repository secret).
- `INTERNAL_ACCESS_EXTRA_EMAILS` (repository secret): the extra addresses
  allowed to sign in, one per line or comma-separated. Set with `gh secret set`
  from a file; see "Who can read it". The deploy fails without it.
- `BLOWHORN_INTERNAL_READ_KEY` (secret of the `internal-site` environment,
  which deploys from master only): the private half of an SSH deploy key
  added read-only to blowhorn-ai/blowhorn. It can read that one repository and
  cannot write to it or reach any other. Rotate it by adding a new deploy key
  and replacing the secret; revoke it by deleting the deploy key.
- `DMG_SOURCE_TOKEN` (repository secret, shared with `publish-dmg.yml`,
  `sync-docs.yml` and `product-ci.yml`): read access to blowhorn-ai/blowhorn.
  `internal-site-auto.yml` passes it only to the scheduled poll, which sends
  it only to the GitHub API.
- `SITE_DISPATCH_TOKEN` (secret on blowhorn-ai/blowhorn, not here): lets the
  product repository send `deploy-internal-site`.

### Changing who can read it

Edit `allowed_email_domains`, `allowed_emails` or `allowed_idps` in
`internal-worker/access.json` in a pull request (so the change is reviewed)
and merge; the push to `master` redeploys. The workflow updates the Access
policy, the login methods and the Worker's allow list together. Extra people
change through the `INTERNAL_ACCESS_EXTRA_EMAILS` secret, not the repository.
Do not edit the policy or login methods in the Cloudflare dashboard: the next
deploy resets them, and a mismatch fails verification.
