<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="static/assets/brand/logo/blowhorn-lockup-horizontal-on-dark.svg">
    <img alt="Blowhorn" src="static/assets/brand/logo/blowhorn-lockup-horizontal.svg" width="360">
  </picture>
</p>

# Blowhorn site and downloads

This repository is two things for **Layer5 Blowhorn**:

1. **The marketing site** at [blowhorn.ai](https://blowhorn.ai). It is a [Hugo](https://gohugo.io) site with [Docsy](https://www.docsy.dev) as a Hugo module, built like [docs.layer5.io](https://github.com/layer5io/docs) and deployed to GitHub Pages by [`site.yml`](.github/workflows/site.yml). The Pages custom domain is already blowhorn.ai, so the project URL <https://blowhorn-ai.github.io/blowhorn-site/> only redirects there; the site is reachable once the domain's DNS points at Pages, as [`docs/deploy.md`](docs/deploy.md) describes.
2. **Public downloads.** macOS disk images and their checksums are published as [GitHub Releases](https://github.com/blowhorn-ai/blowhorn-site/releases) on this repository. No release binary is committed here.

Blowhorn is a social media console that takes one message and broadcasts, reposts and amplifies it across every profile and platform your community runs, on autopilot. One message out, many ears in.

## Download

Download the current universal macOS build from [blowhorn.ai/download](https://blowhorn.ai/download/). (This repository also publishes blowhorn-axi releases, so GitHub's `latest` is not reliably the desktop release and no always-latest asset link is offered here.)

Every release carries a `SHA256SUMS.txt`. Check the image before you open it:

```bash
shasum -a 256 -c SHA256SUMS.txt
```

The Chrome extension ships through the Chrome Web Store, not from this repository.

## Where things live

| | |
|---|---|
| Site configuration | [`hugo.toml`](hugo.toml); the pinned toolchain is [`go.mod`](go.mod) (Docsy as a Hugo module), [`package.json`](package.json) (Hugo extended, postcss) and [`.nvmrc`](.nvmrc) (Node.js) |
| Pages | [`content/en/`](content/en/): the home page's front matter, the Trust Center and its privacy and terms pages ([`legal/`](content/en/legal/)), the onboarding pages and short redirect paths at the root (`welcome.md`, `signup.md`, ...), and the [`docs/`](content/en/docs/) section scaffold (landing, quadrant, group, and CLI indexes) in Markdown |
| Templates | [`layouts/`](layouts/): the home page ([`home.html`](layouts/home.html)), the shared shell ([`baseof.html`](layouts/baseof.html)), the Trust Center hub ([`trust-center.html`](layouts/trust-center.html)), the legal pages ([`legal.html`](layouts/legal.html)), the onboarding pages ([`onboarding.html`](layouts/onboarding.html)), the redirect pages ([`redirect.html`](layouts/redirect.html)), the 404 page, the header, footer and icon sprite partials, the `llms.txt` and Markdown outputs, and the Docsy-based docs shell ([`layouts/docs/`](layouts/docs/)) |
| Styles and script | [`assets/css/site.css`](assets/css/site.css) and [`assets/js/download.js`](assets/js/download.js) (the /download/ page); Hugo minifies and fingerprints both. The docs section's Blowhorn skin over Docsy is [`assets/scss/`](assets/scss/), with its sidebar toggle and offline search in [`assets/js/`](assets/js/) |
| Brand assets | [`static/assets/brand/`](static/assets/brand/), served at `/assets/brand/`: version 1 of the brand kit (logo system, Major Blowhorn, marketing art, `tokens.json`) and the three self-hosted fonts; attribution in [`LICENSES.md`](static/assets/brand/LICENSES.md) |
| How the site deploys and how the domain is wired | [`docs/deploy.md`](docs/deploy.md) |
| How releases are published | [`docs/distribution.md`](docs/distribution.md) |
| Release binaries | [Releases](https://github.com/blowhorn-ai/blowhorn-site/releases) on this repository |
| Product source and build pipeline | Private: [`blowhorn`](https://github.com/blowhorn-ai/blowhorn) |

**Reporting problems.** The product repository is private, so use [this repository's issues](https://github.com/blowhorn-ai/blowhorn-site/issues) for everything public: site content, a download that will not open, a wrong checksum, or a bug in the app. Maintainers triage app bugs into the product repository. The [Layer5 Slack](https://slack.layer5.io) works too.

## Working on the site

You need Go (Hugo modules), Node.js and npm (the pinned Hugo extended and postcss come from `package.json`), Python 3 and `make`. The build targets mirror the blowhorn repository's website targets; the [layer5io/docs](https://github.com/layer5io/docs/blob/master/Makefile) names (`build-production`, `build-internal`, `preview-internal`) are kept as aliases. `make help` lists every target.

```bash
make setup             # npm install: the pinned Hugo extended and postcss
make site              # serve at http://localhost:1313 with live reload
make serve             # serve once, without live reload
make build             # local build with draft, future and expired content
make site-build        # public production build into public/, what CI deploys
make site-internal-build # internal build into public-internal/ (needs ../blowhorn)
make check             # every check, against a fresh production build
make ci                # exactly what site.yml's check job runs, starting with npm ci
```

Every CI step that runs repository logic is a make target, and the workflow calls that target, so one `make` command reproduces any CI step:

| Target | What it runs | Run by |
|---|---|---|
| `setup-ci` | `npm ci` (the locked dependencies) | `site.yml` |
| `workflow-check` | actionlint on `site.yml`, `publish-dmg.yml`, `sync-docs.yml`, `cloud-auth-smoke.yml`, `product-ci.yml`, `internal-site.yml`, `internal-site-auto.yml` and `publish-blowhorn-axi.yml` | `site.yml` |
| `test-scripts` | unit tests for the check scripts in `.github/scripts/` | `site.yml` |
| `site-check` | one production build, then the checks below | `site.yml` |
| `check-schemas` | `data/hero.json`, `data/machines.json`, `data/home_ai.json`, `data/tells.json`, `data/roles.json`, `data/use_cases.json`, `data/solutions.json`, `data/themes.json`, `data/integrations.json`, `data/hero_demo.json`, `data/actions.json`, `data/action_examples.json`, `data/docs_events.json`, `data/activity_feed.sample.json` and `data/bookmarklet.json` validate against `schemas/`; role, use-case and solution schemas `$ref` shared `line`/`text`/`card` types in `schemas/defs/cast-page.schema.json`, and the docs events schema its payload types in `schemas/defs/docs-event.schema.json` (ajv `-r`, [docs/docs-attribution.md](docs/docs-attribution.md)) ([docs/hero-variants.md](docs/hero-variants.md)). The download page's bookmarklet must equal the code block in the content worksheet guide (`check_bookmarklet.py`). Every supported YAML action must have an example ([docs/action-examples.md](docs/action-examples.md)). Every action group in `data/actions.json` exists and holds an action (`check_action_matrix.py --source`) | `site-check` |
| `check-theme` | `/` uses `data/themes.json` default plus `content/en/_index.md` front matter (Signal). `/home-reveille/` keeps today's look. Counts in `data-count-*` spans match supported YAML actions. `?theme=` swaps tokens only, not layout. Fails a new theme-specific content file outside the approved `content/en/home-reveille.md` | `site-check` |
| `check-platform-docs` | Every supported platform has a docs page that renders the shared `supported-actions` table from YAML. Fails a missing page, a page that skips the shortcode, or a docs page that still carries a hand-written action list or Action / What it does table | `site-check` |
| `check-action-matrix` | The site action matrix (`/integrations/actions/`) and the docs all-actions table (`/docs/reference/platforms/actions/`, shortcode `all-actions`) hold exactly the cells `data/actions.json` plus `data/platforms/*.yaml` give, in order, with the right link. Status is shown by exception: fails a rendered "supported" label or check mark, a coming-soon column without its clock, or an exception label that drifts from `data/integrations.json` `matrix.exceptions`. Fails a dead page or `#action-<id>` anchor, a hand-written table, or a lost link from `/` or `/integrations/` | `site-check` |
| `validate-html` | html-validate on every built page | `site-check` |
| `check-links` | every local link, image, font and `srcset` reference resolves | `site-check` |
| `check-third-party` | no page, or stylesheet or script it loads, requests another host (except the disclosed GitHub release lookup) | `site-check` |
| `check-urls` | every published URL and anchor still exists | `site-check` |
| `check-no-internal` | the public build holds nothing from `/internal/`, and its offline search index exists and lists no `/internal/` page | `site-check` |
| `check-naming` | no page says Layer5 Cloud or Blowhorn Cloud, names Layer5 outside the footer and legal pages, says machines, or says Macs in marketing copy; the docs say Chrome profile and Chrome extension | `site-check` |
| `check-download-links` | no page or script links to `/releases/latest/download` | `site-check` |
| `check-feeds` | the Resources RSS feeds validate | `site-check` |
| `check-brand-kits` | the Brand page links only kit zips the build publishes, at their real sizes | `site-check` |
| `check-tells` | every Blowhorn Tells placement in `data/tells.json` is still on its page (header, bar, footer, home band, compare, `/ai/`, `/agents/`, thanks, docs, 404), and every tagged Tells link carries the right UTM parameters ([docs/tells.md](docs/tells.md)) | `site-check` |
| `check-api-reference` | once `params.apiReference.spec` is set: the API reference page holds exactly the spec's operations, keeps its "Not an HTTP API" notice and names nothing private. Passes and checks nothing while the param is empty, the shipped state ([docs/api-reference.md](docs/api-reference.md)) | `site-check` |
| `api-reference-export API_SPEC_SRC=...` | write the public API spec (only operations whose `x-internal` lists `public`, filtered and deterministic) from a local OpenAPI file; fetching the product schema is not wired | run by hand |
| `dmg-resolve`, `dmg-download`, `dmg-package`, `dmg-verify`, `dmg-release` | the five steps of publishing a DMG release, each reading its inputs from the environment ([docs/distribution.md](docs/distribution.md#local-checks)) | `publish-dmg.yml` |
| `dmg-check DMG=...` | sanity-check a disk image before publishing | `dmg-package` runs the same script (`check-dmg.sh`) |
| `dmg-sync-docs` | after a public release, start `sync-docs.yml` at the product tag `desktop-<version>` | `publish-dmg.yml` |
| `npm-fetch`, `npm-verify`, `npm-publish`, `npm-confirm` | the four steps of publishing blowhorn-axi to npm (blowhorn-mcp publishes from [its own repository](https://github.com/blowhorn-ai/blowhorn-mcp)), each reading its inputs from the environment ([docs/distribution.md](docs/distribution.md#local-checks)) | `publish-blowhorn-axi.yml` |
| `docs-cli-reference` | regenerate the CLI reference pages in the product checkout from its CLI schema and parser, before the sync ([docs/deploy.md](docs/deploy.md#product-docs-sync)) | `sync-docs.yml` |
| `docs-sync REF=...` | copy the product docs from a `blowhorn` checkout into `content/en/docs/` ([docs/deploy.md](docs/deploy.md#product-docs-sync)) | `sync-docs.yml` |
| `docs-sync-base` | check out the `docs-sync` branch on the open sync PR's head, or on `master` when none is open ([docs/deploy.md](docs/deploy.md#product-docs-sync)) | `sync-docs.yml` |
| `docs-sync-start-checks` | start `site.yml` on the `docs-sync` branch after a sync ([docs/deploy.md](docs/deploy.md#product-docs-sync)) | `sync-docs.yml` |
| `docs-sync-merge` | merge the sync pull request once its site checks pass, then start the `master` site run that deploys ([docs/deploy.md](docs/deploy.md#product-docs-sync)) | `sync-docs.yml` |
| `site-internal-poll` | decide whether to redeploy internal.blowhorn.ai: always on push or manual run; on schedule, only when blowhorn `master` changed a path the internal build mounts in the last 2 hours ([docs/deploy.md](docs/deploy.md#shipping-an-update)) | `internal-site-auto.yml` |
| `product-ci SUITE=python\|desktop` | run the private product repo's CI on a checkout of it, printing only step results and pass/fail counts (output stays in a private log; public logs never show product code) | `product-ci.yml` |
| `copilot-pr-handle PR_NUMBER=...` | mark a Copilot coding agent draft PR ready and approve pending workflow runs for its current head; requires `GH_TOKEN` and `GITHUB_REPOSITORY` | `copilot-pr-handler.yml` |

Each check target builds for production first, so it also runs on its own. `labeler.yml`, `label-commenter.yml` and `slack.yml` only call third-party actions and run no repository logic, so they have no target.

The site follows the brand kit exactly: every colour, type style, spacing, radius and shadow in `assets/css/site.css` is a token from `static/assets/brand/tokens.json`. Brand SVGs are used as files and never recoloured. The one-to-many hero illustration and the platform marks are inline SVG drawn in `currentColor`.

### Themes

A theme is presentation: tokens, CSS, and layout partials that read the **same** data and content. Reveille copy is approved. Signal and any future theme do not get their own copy of a page. Do not add `content/en/home-signal.md` or another theme-named content file; `make check-theme` fails those. The one approved exception is [`content/en/home-reveille.md`](content/en/home-reveille.md), which keeps today's homepage at `/home-reveille/` so we can still look at it.

Reveille is the site-wide default (light, dark follows the OS). Signal is a dark token layer on the public home page (`theme: signal` in `content/en/_index.md`). Homepage *layout* still comes from the theme's `home` field in `data/themes.json` (`layouts/_partials/home/signal.html` vs `reveille.html`); those partials consume `data/integrations.json`, `data/actions.json`, `data/platforms/*.yaml` and the same Markdown. `?theme=signal` and `?theme=reveille` swap the token layer on any page; they do not change homepage layout (`/` stays Signal, `/home-reveille/` stays today's look).

Nothing on the site loads from another host except Google Analytics 4: no CDN and no web fonts from elsewhere. The id is in `[services.googleAnalytics]` in `hugo.toml`. `layouts/_partials/analytics.html` loads gtag.js on every production page, enables analytics storage and keeps advertising storage denied. It renders only in production builds. The other request to another host while browsing is the download page's release lookup on GitHub's API (`assets/js/download.js`). The footer newsletter form posts to Blowhorn's own signup service only when submitted. The [privacy page](https://blowhorn.ai/privacy.html) discloses all three. The MCP connection guides send three consent-gated GA4 events through that same tag ([docs/docs-attribution.md](docs/docs-attribution.md)). `make site-check` fails a build that loads anything else from another host. The public URLs (`/`, `/privacy.html`, `/terms.html`, `/assets/brand/...`) and the home page's anchors (`#platforms`, `#how`, `#trust`, `#download`) are linked from outside this repository; the same check fails a build that loses one.

The site also publishes [`/llms.txt`](https://blowhorn.ai/llms.txt), [`/llms-full.txt`](https://blowhorn.ai/llms-full.txt) and a Markdown copy of every page (`/legal/privacy/index.md`), as docs.layer5.io does.

### CI

| Workflow | When | What it does |
|---|---|---|
| [`site.yml`](.github/workflows/site.yml) | Pull requests, pushes to `master`, manual runs | Lints the workflows, runs the check-script unit tests, builds the site with the pinned Hugo, Go and Node.js, runs `make site-check` and uploads the Pages artifact. On `master` it deploys the artifact to GitHub Pages. |
| [`publish-dmg.yml`](.github/workflows/publish-dmg.yml) | Manual, or `repository_dispatch` (`publish-dmg`) from product CI | Downloads a built DMG over HTTPS, checks it, verifies signing and notarization on a macOS runner (required for any public release), then creates the release with versioned assets, the `Blowhorn-mac.dmg` alias and checksums. Drafts by default; never overwrites. |
| [`sync-docs.yml`](.github/workflows/sync-docs.yml) | Manual, or `repository_dispatch` (`sync-docs`) from product CI | Checks out the product docs at the requested ref, opens or updates the `docs-sync` pull request (`docs: sync from <ref>`), starts the site checks on it itself (`gh workflow run site.yml`), merges it once those checks pass, and starts the `master` run that deploys. |
| [`internal-site.yml`](.github/workflows/internal-site.yml) | Manual (`make site-internal-deploy`), `repository_dispatch` (`deploy-internal-site`) from the product repo, or called by `internal-site-auto.yml` | Builds the internal site from a read-only checkout of the product repo and deploys it to internal.blowhorn.ai behind Cloudflare Access ([docs/deploy.md](docs/deploy.md#internal-site-hosting-internalblowhornai-cloudflare-access)). |
| [`internal-site-auto.yml`](.github/workflows/internal-site-auto.yml) | Pushes to `master` on the internal build's paths, every 15 minutes, manual runs | Calls `internal-site.yml` on a site-side push, or when its poll finds a product-repo change under the internal mounts. |
| [`copilot-pr-handler.yml`](.github/workflows/copilot-pr-handler.yml) | Copilot coding agent PRs opened, updated or reopened; manual runs | Marks a Copilot draft ready for review and approves pending workflow runs for its current head. It runs trusted `master` code under `pull_request_target`, never the PR head. |

<div>&nbsp;</div>

## Join the Layer5 community!

<a name="contributing"></a><a name="community"></a>
Our projects are community-built and welcome collaboration. 👍 Be sure to see the <a href="https://layer5.io/community/newcomers">Layer5 Community Welcome Guide</a> for a tour of resources available to you and jump into our <a href="http://slack.layer5.io">Slack</a>!

<p style="clear:both;">
<a href ="https://layer5.io/community/meshmates"><img alt="MeshMates" src=".github/readme/images/layer5-community-sign.png" style="margin-right:10px; margin-bottom:15px;" width="28%" align="left"/></a>
<h3>Find your MeshMate</h3>

<p>MeshMates are experienced Layer5 community members, who will help you learn your way around, discover live projects and expand your community network. 
Become a <b>Meshtee</b> today!</p>

Find out more on the <a href="https://layer5.io/community">Layer5 community</a>. <br />
<br /><br /><br /><br />
</p>

<div>&nbsp;</div>

<a href="https://slack.layer5.io">
  <picture align="right">
    <source media="(prefers-color-scheme: dark)" srcset=".github/readme/images//slack-dark-128.png"  width="110px" align="right" style="margin-left:10px;margin-top:10px;">
    <source media="(prefers-color-scheme: light)" srcset=".github/readme/images//slack-128.png" width="110px" align="right" style="margin-left:10px;padding-top:5px;">
    <img alt="Slack logo" src=".github/readme/images//slack-128.png" width="110px" align="right" style="margin-left:10px;padding-top:13px;">
  </picture>
</a>

<a href="https://layer5.io/community"><img alt="Layer5 Community" src=".github/readme/images//community.svg" style="margin-right:8px;padding-top:5px;" width="140px" align="left" /></a>

<p>
✔️ <em><strong>Join</strong></em> any or all of the weekly meetings on <a href="https://calendar.google.com/calendar/b/1?cid=bGF5ZXI1LmlvX2VoMmFhOWRwZjFnNDBlbHZvYzc2MmpucGhzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20">community calendar</a>.<br />
✔️ <em><strong>Watch</strong></em> community <a href="https://www.youtube.com/playlist?list=PL3A-A6hPO2IMPPqVjuzgqNU5xwnFFn3n0">meeting recordings</a>.<br />
✔️ <em><strong>Access</strong></em> the <a href="https://drive.google.com/drive/u/4/folders/0ABH8aabN4WAKUk9PVA">Community Drive</a> by completing a community <a href="https://layer5.io/newcomer">Member Form</a>.<br />
✔️ <em><strong>Discuss</strong></em> in the <a href="https://discuss.layer5.io">Community Forum</a>.<br />
✔️<em><strong>Explore more</strong></em> in the <a href="https://layer5.io/community/handbook">Community Handbook</a>.<br />
</p>
<p align="center">
<i>Not sure where to start?</i> Grab an open issue with the <a href="https://github.com/issues?q=is%3Aopen+is%3Aissue+archived%3Afalse+repo%3Ablowhorn-ai%2Fblowhorn-site+label%3A%22help+wanted%22">help-wanted label</a>.</p>
