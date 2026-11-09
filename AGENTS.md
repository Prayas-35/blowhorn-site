# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Worktrees, design, and writing

- Git worktree management: use Treehouse - https://github.com/kunchenguid/treehouse - for every Git worktree. Do not hand-roll git worktree commands or use another worktree tool unless Treehouse cannot do the job, and then say why.
- Design source of truth: Blowhorn Figma project - https://www.figma.com/design/mM9B4Zv9ON3pIyh3IvB4Il/Blowhorn - check the design there before changing layout, copy, or brand. For this site, DESIGN.md still governs layout and copy changes.
- UX audits: load the `ux-audit` skill (`.agents/skills/ux-audit/`) before reviewing or merging a change to `layouts/`, `assets/css/site.css` or a page's data file, and for any page or layout audit.
- Brand review: load the `brand-identity-review` skill (`.agents/skills/brand-identity-review/`) once at final review for changes to brand pages, marketing copy, logos, mascots or visual tokens; skip unrelated changes.
- Writing: never use an em dash. Use a hyphen instead, and replace any em dash found in this repo with a hyphen.

## Website, documentation, and feature updates

- Website and documentation updates: make them to the best of your ability, run `make check`, push, open the PR and merge it when ready. Never run them through No Mistakes (Lee, 6 Nov 2026).
- Code that is not the website (the `signup-worker/` and `internal-worker/` Workers, `.github/scripts/`, workflows, the Makefile): update its tests and its internal and external documentation, then run the change through No Mistakes at a maximum of three turns.

## Building the site locally

blowhorn.ai is Hugo with Docsy as a Hugo module, built like layer5io/docs. Run
`make setup` once (npm install) for the pinned toolchain (the dependency check
also accepts system `hugo` and `postcss`), install PyYAML for the script tests (README),
then `make site`
(live reload, http://localhost:1313) or `make site-build` (writes `public/`).
`make check` is exactly what CI runs. Go must be on PATH: Hugo fetches Docsy through it.

The marketing and legal pages do not use Docsy's templates: they render through
`layouts/home.html`, `layouts/trust-center.html` (the Trust Center hub at `/legal/`),
`layouts/legal.html` (each policy at `/legal/<name>/`), `layouts/brand.html` (the Brand page at `/brand/`) and `layouts/404.html` inside
`layouts/baseof.html`, with the header, footer and icon sprite in `layouts/_partials/`.

Themes are schema-driven (`data/themes.json`, `schemas/themes.schema.json`). A
theme is tokens, CSS and layout partials over the same data and content.
Reveille copy is approved; do not add a per-theme content file (`check_theme.py`
fails those except `content/en/home-reveille.md`). Site default is Reveille
(today's look: light, dark follows the OS). The public home page sets front
matter `theme: signal`. Docs, legal, pricing and download stay Reveille.
`?theme=` swaps the token layer only, not homepage layout. Homepage variants
live in `layouts/_partials/home/`. Platform counts and the platforms section
treatments come from `data/integrations.json` plus `data/platforms/*.yaml`;
the By role treatment and the "Who it's for" cards list every role in
`data/roles.json` by weight, and each role's `platforms` decides what it
highlights, so a new role appears on the home page without another edit.
The action vocabulary is `data/actions.json`; YAML rows use those ids.
Examples live in `data/action_examples.json` ([docs/action-examples.md](docs/action-examples.md)).
Platform docs pages render actions through `{{< supported-actions "id" >}}` (`layouts/_partials/supported-actions.html`); `make check-platform-docs` fails a missing page, a skipped table, or a hand-written action list.
The central action matrix (`/integrations/actions/`, `layouts/action-matrix.html`) and the docs all-actions table (`{{< all-actions >}}`, `layouts/_partials/action-table.html`) both render from `layouts/_partials/action-matrix.html`: rows are `data/actions.json` (grouped by its `groups`), columns are `data/integrations.json` platforms, page copy is `data/integrations.json` `matrix`. Status is shown by exception: no "Supported" label or check anywhere; a supported cell is a neutral dot, a coming-soon platform gets one clock on its logo. `make check-action-matrix` fails drift or a dead `#action-<id>` link.
The Signal hero demo is `data/hero_demo.json`.
The hero activity card renders the live public event feed (`GET <cloud_url>/api/events/feed`, shape EventFeedPage from meshery/schemas v1.3.117) and falls back to the bundled `data/activity_feed.examples.json`, labelled Examples, through `layouts/_partials/activity-feed.html` ([docs/activity-feed.md](docs/activity-feed.md)).
Platform product pages (`/preview/platforms/<id>/`, noindex, X first) render `data/platform_pages.json` (a shared contract plus one record per platform; actions, limits and the local stage's amplify and follow lines from the platform YAML and `data/action_examples.json`; every other fact quotes a public page, checked verbatim) through `layouts/platform-page.html`. The one primary call to action installs the browser extension (the download page's Web Store link), with no note under it; reviewer text is an annotation (coral, mono, marked), never a caption; the local-action stage is local only and has no composer or form. `make check-platform-pages` builds the page and runs its script ([docs/platform-pages.md](docs/platform-pages.md)).
Every link to Blowhorn Tells (the free "Am I a Bot?" check) is built by
`layouts/_partials/tells-link.html` from `data/tells.json`, with UTM tags and a
placement; never hard-code a Tells URL in a template. `make check-tells` fails a
lost placement or a mistagged link ([docs/tells.md](docs/tells.md)).
Every docs page also shows a contact-support card under the Tells card
(`docs-support-card.html`, `data/support.json`); both use the `docs-rail-card`
classes that show one copy per width ([docs/tells.md](docs/tells.md)).

Role pages (`/for/<slug>/`), use-case pages (`/use-cases/<slug>/`) and
solution pages (`/solutions/<slug>/`, one per category of tool replaced) are
schema-driven from `data/roles.json`, `data/use_cases.json` and
`data/solutions.json`. Shared `line`/`text`/`card` types live in
`schemas/defs/cast-page.schema.json` (`make check-schemas` loads it with ajv
`-r`). Kind labels live in `cast-kind.html`; lookups go through
`role-data.html` / `role-list.html`. Pages share
`layouts/_partials/cast-page.html` and the role-page CSS. A solution's
`compare` list renders the `/compare/` tiles (`versus-grid.html` `pages`)
instead of repeating their tables. `/solutions/` is the hub for all three
kinds (`solution-groups.html`, in the Solutions menu's order). Do not
duplicate those.

The `/compare/<slug>/` pages are edited here, in `content/en/compare/<slug>.md`
(JSON front matter). The product repository's `marketing/compare/data.py` is only
the seed they were first generated from; its generator is gone, so never
regenerate them. Claims on every page come from the product repository's
`marketing/brand/differentiators.md` in its wording rules.

## Rules the site holds

- **No third parties beyond the disclosed ones.** The privacy page discloses exactly four:
  Google Analytics 4 (`[services.googleAnalytics]` in `hugo.toml`;
  `layouts/_partials/analytics.html` loads gtag.js on every production page with
  analytics storage enabled and advertising storage denied), the download
  page's release lookup on api.github.com, the home hero activity card's feed request to `params.cloud_url` (`data-feed-url`) and its live avatars from `AVATAR_HOSTS` only ([docs/activity-feed.md](docs/activity-feed.md)), and the footer newsletter form, which posts to
  Blowhorn's own signup service at `api.blowhorn.ai`, an allowed host in `FORM_ACTION_HOSTS`. Never add another analytics or tracking tag, a
  CDN script or stylesheet, or web fonts from elsewhere, and never copy layer5io/docs' head,
  navbar or footer (Docsy's head would add a second, consent-less gtag). A new outside host needs a privacy
  page update first. `.github/scripts/check-third-party.py` fails the build.
- **Docs attribution events ride on GA4.** The MCP guides' `docs_guide_view`,
  `docs_snippet_copy` and `docs_outbound_click` come from `data/docs_events.json`
  through `assets/js/docs-attribution.js`, consent first; every other analytics page runs it
  only to store the first touch (`consent.js` clears it on withdrawal). Never add markup to synced docs
  for them. A renamed client heading needs its new id in `clients` ([docs/docs-attribution.md](docs/docs-attribution.md)).
- **Brand tokens only.** Every colour, type style, radius and shadow in
  `assets/css/site.css` is a token from `static/assets/brand/tokens.json`. Light is the
  default; dark follows the OS with no JavaScript. Brand SVGs are used as files, never
  recoloured. Platform logos are the owners' own files in `static/assets/platforms/`, unmodified, on white
  tiles (sources in `static/assets/brand/LICENSES.md`).
- **The brand kits are built, not edited.** `static/brand/blowhorn-brand-kit.zip` (the full
  kit), `static/brand/blowhorn-logo-kit.zip` and `data/brand_colors.json` come from the product
  repository's brand build (`tools/scripts/brand/build-brand-kit.py`, output in
  `marketing/brand/kit/`); copy them over unchanged, then set both sizes under `kits:` in
  `content/en/brand/_index.md` (`make check-brand-kits` fails a stale one).
- **The product name is Blowhorn.** "Outbox" is the product's old internal name; never put
  it on a public page.
- **Browser wording depends on the page.** Marketing and value pages (home, `/for`, `/ai`,
  `/agents`, `/pricing`, `/major`, `/welcome`, `/integrations`, their data files, and compare
  pages' descriptions of Blowhorn) stay general: "your own browser", "browser profile", "browser
  extension", never Mac or Google Chrome; a requirement note links to System requirements.
  Download and install pages (`/download`, `/download/thanks`, `docs/reference/requirements`,
  `docs/how-to/set-up/`) state the exact requirement: "Requires macOS 13 or newer and Google
  Chrome 142 or newer" (142 is the engine's `MINIMUM_CHROME_MAJOR`), never "for now". On
  `/download` each card also repeats its own minimum (`.download-req`; `download.js` keeps it
  when it refills the Mac card), so a floor change touches the cards, the requirements block
  and `/download/thanks`. Docs about
  using the app or CLI name Google Chrome and "Chrome profile", matching the app's labels ("Add to
  Chrome", "Show my Chrome profiles"). Competitor facts, Chrome Web Store, code, commands and URLs
  stay as they are. `check_naming.py` fails a "for now" requirement and "browser profile" or
  "browser extension" in the docs. Docs copy is synced from the product repository's `docs/`:
  change it there, then sync.
- **The product repository is private.** Never link its files, issues or pull requests
  from a page; every reader would get a 404.
- **Every Hugo run cleans its destination.** Each `hugo` invocation in `package.json`
  and the `Makefile` passes `--cleanDestinationDir`, builds and servers alike, so a
  stale file from an earlier build can never linger in `public/` or `public-internal/`
  and pass for current output. Hugo has no config-level default for this; the flag
  rides on the command line, so keep it on any new invocation.

## API reference

The public API reference (layout `rest-apis`, `layouts/_partials/rest-apis/`) renders only a spec exported by
`.github/scripts/openapi_export.py` and named by `params.apiReference.spec`; it is off while that is empty.
Only operations whose `x-internal` lists `public` ship, it never shows a server URL (the product has no HTTP
listener), and its page must be a site-only `_index.md` so the docs sync keeps it. Read
[docs/api-reference.md](docs/api-reference.md) before touching it. The fixture under `tests/openapi/` is
synthetic: never copy it into `content/` or `data/`.

## CI runs through make

Every CI step that runs repository logic is a Makefile target and the workflow calls it
(`site.yml`, and the `dmg-*` steps of `publish-dmg.yml` backed by `.github/scripts/publish-dmg/`).
When you add or change a CI step, put the logic behind a make target, call the target from
the workflow, and list it in the README's target table. `make ci` reproduces site.yml's check job.

## Keeping URLs and anchors alive

`/`, `/legal/`, `/legal/privacy/`, `/legal/terms/`, `/assets/brand/...` and the home
page's anchors (`#platforms`, `#how`, `#trust`, `#download`) are linked from outside this
repo, and the old `/privacy.html` and `/terms.html` must keep redirecting to their
`/legal/` pages. `.github/scripts/check-site-contract.py` lists every one and fails the
build when one disappears. When a page moves, add the dead path to the page's `aliases:`
front matter rather than leaving a 404 (GitHub Pages has no server redirects, so an alias
is a meta refresh with a canonical link) and list it in the script's `REDIRECTS`, and keep a renamed heading's old anchor with
`### New Wording {#old-anchor-slug}`. To prove nothing was lost, build master and your
branch to separate directories and diff the `id=` attributes across both trees.

Do not give a page in `content/en/` a `url:` ending in `.html`: `url` names one path for
every output format, so the page's Markdown output (`index.md` format) overwrites its HTML.
New pages go in a section (such as `content/en/legal/`), which gets pretty URLs; `uglyURLs`
in `hugo.toml` applies only to top-level pages, and the home page's public URL comes from
`layouts/_partials/canonical.html`.

The Trust Center's summaries (front matter of `content/en/legal/_index.md`) restate what
the policies and public docs already say. Never add a certification, sub-processor,
retention period, encryption detail or compliance claim that a policy does not make.

## Verifying a change

Check the built HTML in `public/`, not the source. Goldmark's typographer is off so quotes
stay straight; HTML is not minified so html-validate can check what ships. For a visual
change, follow the screenshot checklist in `docs/deploy.md` (390, 820 and 1440 px, light
and dark, no horizontal scroll from 320 px).

## Worktrees and landing a change

- **Work in a treehouse worktree, never in the main clone.** Other agent sessions and the
  no-mistakes pipeline share the main clone. Take a worktree with
  `treehouse get --lease -b <branch>` (it prints the path; `--base <branch>` starts it from
  another branch), work there, and release it with `treehouse return <path>` once the change
  has merged. `treehouse status` lists the pool. Never make one with `git worktree add` or a
  second clone.
- **Website and documentation changes skip no-mistakes.** Layouts, content, styles, data
  files and their schemas, and these docs: commit in the worktree, run `make check`, push the
  branch, open the pull request with `gh-axi pr create` and merge it. A pull request that also
  touches code outside the website follows the next rule.
- **Other code lands through no-mistakes, at most three runs per pull request.** Commit in
  the worktree, then run `no-mistakes axi run --intent "<goal>"` (a clone without a
  `no-mistakes` remote needs `no-mistakes init` once). `no-mistakes axi status` shows the step
  and its findings, and `no-mistakes axi respond` answers a review gate. The pipeline reviews,
  tests, pushes and opens the pull request. After the third run, merge the pull request as it
  stands and open an issue for anything still flagged. A run that stopped on a usage limit
  counts; one cancelled before it did anything does not.
- **`make check` locally needs PyYAML** for the script tests (`test_check_api_reference`).
  CI's runner has it and `make setup` does not install it; the install line, including the
  Homebrew variant (PEP 668 refuses a plain `pip install`), is in the README's
  [Working on the site](README.md#working-on-the-site).

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

## Design rules

Before any layout or copy change, follow [DESIGN.md](DESIGN.md) (whitespace tokens, concision rules and the PR checklist).
