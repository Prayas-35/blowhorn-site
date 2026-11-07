# Platform pages

A platform product page (blowhorn-site#466) shows what Blowhorn does on one
platform, from your own computer: an activity selector and one call to action in the
hero, then **Only on your computer**, a local-action stage that explains how the
extension acts as you in your own signed-in browser. X is the first page, at the
noindex preview route **`/preview/platforms/x/`**.

## Figma delta (intentional)

The X frame in Figma (`mM9B4Zv9ON3pIyh3IvB4Il`, node `902:114`, on the shared contract
`902:111`) is the original draft-centred layout: a draft storyboard in the hero and a
try-on playground as section two. This preview deliberately supersedes it with a
local-action direction, requested by the product owner:

| Figma 902:114 (draft-centred) | This preview (local-action) |
|---|---|
| Hero storyboard of a draft, with write, review, track steps | Hero is copy, activity selector, the extension call to action and a decorative orbit (no draft) |
| Section two: a try-on playground (draft, starters, image picker) | Section two: **Only on your computer**, a stage of three scenes (amplify, follow with a local log, dry fire) |
| No account of what runs on the computer | Reach line from the platform YAML, a diagram of this computer, the extension and the signed-in sessions |

Figma was not edited, and this page does not claim parity with it. The matrix, rules
of engagement, Field Manual, setups and Activities sections are unchanged in content.
Reconcile the frame with this direction before the page leaves preview.

## Files

| What | Where |
|---|---|
| Shared contract and one record per page | `data/platform_pages.json` |
| Shape | `schemas/platform_page.schema.json` (`make check-schemas`) |
| Joins and build-time guards | `layouts/_partials/platform-page-data.html` |
| Template | `layouts/platform-page.html` |
| Styles, script | `assets/css/platform-page.css`, `assets/js/platform-page.js` |
| Cutouts (alpha channel only) | `static/assets/brand/cast/icons/` |
| Checks and DOM harness | `.github/scripts/check_platform_pages.py`, `platform_page_harness.js`, `test_platform_pages.py` |
| Page file | `content/en/preview-platform-<id>.md` |

## What is joined, and what is quoted

Facts that exist in the platform YAML are joined, never retyped:

- the reach line (`reach` in `data/platforms/x.yaml`);
- the amplify scene's line (the YAML's `behavior` for amplify);
- the follow scene's line (the YAML's `limits` for follow: 400 a day, 15 in 15
  minutes, counted from that profile's follow log on this computer).

Every other sourced fact quotes a public page verbatim, and the checker fails a
quote the page does not carry: the session boundary sentence
(`/docs/explanation/your-own-chrome/`), the amplify retweet-or-quote line
(`/docs/how-to/publish/amplify-a-post/`), the dry-fire line
(`/docs/reference/use-the-desktop-app/`, "checks the sign-in and stops before
composing"), the rules of engagement and the Field Manual.

## Behavior

### The hero

An activity selector (Post, Respond, Amplify) swaps the intent line and marks the
matrix rows bound to the type. One primary call to action installs the browser
extension from the download page's Web Store link, with nothing under it.

### Only on your computer

- A reach line, then three native radios (Amplify, Follow, Dry fire (desktop)). The first is
  checked at load.
- Each scene shows one text panel. The script hides the others and sets `data-scene`
  on the section, which the CSS reads to draw that scene's diagram (profiles lit,
  per-profile logs, the dry-fire gate).
- Each change plays the diagram once and announces the scene once, from the visitor's
  choice only. Choosing the scene already shown plays nothing. The replay button plays
  the diagram again and announces nothing. `data-pp-run` counts the plays.
- The diagram is decorative (`aria-hidden`), its nodes are HTML so names wrap, and its
  signal lines are one SVG path each (`pathLength`). It appears only once the script
  runs; without script the three panels show as stacked text.
- Motion (the local stage's CSS only): one finite draw of the signal and one fade-in of
  the relay, slips and outcome per play, under `prefers-reduced-motion: no-preference`
  only. The fade is opacity only, because those parts are positioned by their own
  transforms. The stage has no infinite animation (the checker fails one), so there is
  nothing to pause.
- Cutouts are the alpha-channel `icons/` set. The originals under
  `static/assets/brand/cast/` are opaque VP8 and would sit in a black box, so the
  checker fails any cutout without an alpha channel.

### No composer

The local stage has no text-entry field, no file input and no submission form in
`<main>`. Its radios (activity and scene) are native and named. The checker fails a
form, a text field or a file input anywhere in `<main>`. `assets/js/platform-page.js`
(the stage, the activity selector and the setups rail) makes no request and touches no
storage, cookie or extension API, and the checker fails a script that does. This promise
covers that script only: the site's own consent banner, newsletter form and other global
scripts are outside this page's scope.

### Visual direction (the "break free" pass)

- **Hero:** copy, the activity selector and Start stay in one column on a phone. On a
  desktop the copy sits left and a decorative orbit sits right: the laptop cutout on two
  rings with the platform logo on a white tile. The orbit is `aria-hidden`, carries no
  caption and follows Start in source order. It is never a draft or a composer.
- **Stage:** a near-black theatre (`--near-black`, checked by the build) with a radial
  relay glow and faint contour rings. The extension is the focal medallion; the computer
  sits left, the signed-in profiles fan out right from the relay, and the outcome lands at
  the bottom. Cutouts float on the route with no box behind them and no caption; the
  route names are the only labels.
- **Amplify:** four profile slips fan out at fixed per-child angles and lengths (CSS
  custom properties, never inline). **Follow:** the same slips straighten into a ledger
  with a log stroke each, and the mouse-marine cutout guards below. **Dry fire (desktop):**
  the shipped dry fire is the desktop app's, so this scene names the desktop app on the
  relay, drops the extension cutout, and shows an "Extension flow planned" tag beside the
  diagram. The fan dims and the route to the outcome breaks in coral at the stop. The
  panel repeats that the extension flow is planned, not shipped.
- **Phone:** a 480 px theatre with the relay and fan moved left and in, two narrow route
  nodes and no full-length stack of boxes; no page overflow at 320 px.
- **Motion:** finite only in the local stage (routes draw, spokes grow, the relay, slips
  and outcome fade in once per play; the ledger eases once on a scene change). Reduced
  motion removes all of it; high contrast solidifies the edges. The stage has no infinite
  animation (the checker fails one).
- **Rules of engagement** are an open numbered gauge (each row a source link and a bar
  for its daily figure), not a stamp card. **Field Manual** is one two-column briefing
  with a rule between the facts. Their source text and links are unchanged. The setups
  rail and Activities are unchanged.

### Rules of engagement colour and readable actions (#501)

Approved by the product owner for this preview (bands and scroll-continuity washes
were tried and then dropped on Lee's Nov 6 direction - keep colour on the gauge only):

- **Gauge.** The three rules-of-engagement levels are three horizontal bars, one per
  level: 01 blue, 02 green, 03 coral. Each row has a level dot and a bar filled in its
  level colour, longer at each level. There is no vertical rule. The colours are
  page values (`--pp-blue`, `--pp-green`, `--pp-coral`, scoped to `.pp`, with
  dark-ground lifts). The brand tokens have no blue or green step; coral is the
  brand's own.
- **Real actions at body-UI size.** Hero Start is 20px. The other actions are 18px:
  the section action links (`.pp-more`), the setup source links (`.pp-use-src`) and the
  "Keep reading" links in the matrix header (`.pp-related`). Captions (counts, type
  chips, the gauge's numbers) stay small.
- **No section bands.** Alternating blue/green washes, aligned gridlines, and diagonal
  color ribbons are not used. Sections keep the ordinary hairline separators.
- **The local stage stays near-black.** It is the deliberate dark beat in the page.
- **Accessibility.** Under `prefers-contrast: more` the gauge track uses a solid edge.
  Forced colours get CanvasText and Highlight for the gauge fill and level dot.
- **Scope.** The usage rail (#500 carousel) is unchanged apart from the larger
  source-link type. No composer, form, network or storage call was added.
- **Checks.** No check in `check_platform_pages.py` covers these visual rules. The
  rules are verified in a browser (computed font sizes, bar colours and widths,
  overflow at each width).

## Stage geometry checks

Check the stage in a real browser at 320, 390, 640, 820, 1039, 1040, 1280 and 1440 px,
in light and dark, in every scene (amplify, follow, dry fire). Measure with
`getBoundingClientRect` and the rendered height, not estimates:

- The page has no horizontal overflow: the document is no wider than the viewport.
- Every visible `.pp-slip`, `.pp-out`, `.pp-relay` and `.pp-crew-guard` lies inside
  `.pp-theatre`, which clips at its edges (`overflow: hidden`).
- The follow guard and the outcome do not overlap.
- Exactly one scene panel is visible, and it is the selected scene.

On a phone the outcome is anchored to the theatre's bottom edge, so taller text grows it
upward and never past the edge. The follow guard sits on the left edge, clear of the
relay and the outcome.

## Preview route rules

The page file sets `layout: platform-page`, `platform: <id>`,
`url: /preview/platforms/<id>/`, `noindex: true`, `exclude_search: true`,
`sitemap: {disable: true}` and `build: {list: never}`; `hugo.toml` excludes
`/preview/**` from llms.txt. Nothing in the navigation links to it.
`make check-platform-pages` fails if the built page is indexed, listed in the sitemap,
llms.txt, llms-full.txt or the search index, or linked from another page. It also fails
if any built page names the private product repository or its issue.

## Add the next platform

1. Confirm the platform is `supported` in `data/integrations.json`, its
   `data/platforms/<id>.yaml` lists the actions you want as types and as local scenes,
   and each has a `data/action_examples.json` entry.
2. Add a record to `pages` in `data/platform_pages.json`: route, two to four activity
   types bound to listed actions, the local stage (three scenes in the order amplify,
   follow, dry fire; joins from the YAML; sourced lines quoting public pages), the
   matrix copy, and sourced rules of engagement, Field Manual facts and setups.
   Leave the contract alone.
3. Add `content/en/preview-platform-<id>.md` with the front matter above.
4. Run `make check-schemas`, `make check-platform-pages` and `make test-scripts`, then
   check 1280 and 390 px in light and dark, and 320 px for overflow (`DESIGN.md`,
   `docs/deploy.md`).

Promoting a page out of preview is a deliberate change: the schema's `route` pattern
is preview-only, and a promoted page needs a new route, a navigation entry, sitemap and
search inclusion, removal of the reviewer note, and an update to these rules.

## Known limits and planned work

- **Planned, not shipped: a dry run from the extension.** Today the desktop app's dry
  fire checks the sign-in and stops before composing, and posts nothing
  (`/docs/reference/use-the-desktop-app/`). The stage marks the extension version as
  planned. Product tracking is the private product issue
  `blowhorn-ai/blowhorn#2178` (planned anonymous extension flow). That issue appears in
  this document only. It must never appear on a rendered page, and the built-page check
  enforces that.
- **The call to action installs the extension only.** The extension works with the
  Blowhorn desktop app; no link installs both or carries the picked platform and type.
  When one exists, change the label, `extensionHref` and the check together.
- **The Web Store link is written in several templates** (`layouts/download.html`,
  `download-thanks.html`, `_partials/header.html`, `footer.html`, `home/ways-in.html`,
  this page's data partial, `content/en/legal/terms.md`). The check ties this page to
  the download page's copy; the fix is one `data/extension.json`, as its own change.
- **No recording exists**, so the stage is an illustration. It says so in the
  reviewer note and never presents itself as footage.
- **One platform so far.** The schema allows more records; only X has one.
