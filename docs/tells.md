# Blowhorn Tells on blowhorn.ai

[Blowhorn Tells](https://tells.blowhorn.ai/) is the free "Am I a Bot?" check:
it runs in the reader's browser on page load, checks the bot-detection and
fingerprinting signals a website can read, explains each in plain words and
gives a verdict. The site promotes it in fixed places, all driven from one
data file.

## Where it lives

| What | File |
| --- | --- |
| Base URL, Tells pages, UTM parameters, placements, all copy | `data/tells.json` (schema: `schemas/tells.schema.json`) |
| The only place a Tells URL is built | `layouts/_partials/tells-link.html` |
| Whether a page may promote Tells (public pages, never `/internal/`) | `layouts/_partials/tells-show.html` |
| Styles | "Blowhorn Tells" in `assets/css/site.css`; the docs card in `assets/scss/_styles_project.scss` |
| Contract check | `.github/scripts/check_tells.py` (`make check-tells`, part of `site-check`) |

Build a link with the partial; never hard-code a Tells URL in a template:

```go-html-template
<a href="{{ partial "tells-link.html" (dict "placement" "home" "page" "checks") }}">What each check means</a>
```

`page` is `home` (default), `checks` (`/checks/`, "What each check means") or
`agents` (`/agents/`, "For AI agents and scripts"). `placement` becomes
`utm_content`; an unknown page or placement fails the build. Every link gets
`utm_source=blowhorn.ai&utm_medium=referral&utm_campaign=tells`.

## Placements

| Placement | Where | Template |
| --- | --- | --- |
| `bar` | Slim, dismissible bar: message + Am I a Bot?/Free CTA centered; dismiss far right; `text_short` below 720px | `tells-bar.html`, `tells-bar-head.html`, `assets/js/tells-bar.js` |
| `nav` | Resources menu entry (label); Free pill text for the announcement-bar CTA | `header.html`, `tells-bar.html` |
| `home` | Band after Trust on the Signal home page (Sleeper Cell art) | `home/tells.html` |
| `footer` | Free tools column | `footer.html` |
| `compare` | Callout before the FAQ on every `/compare/<slug>/` page, and the FAQ links that point at Tells | `tells-callout.html` in `versus.html` |
| `ai`, `agents` | Callout after the first section of `/ai/` and `/agents/` | `tells-callout.html` in `ai.html`, `agents.html` |
| `thanks` | Card after the install steps on `/download/thanks/` | `download-thanks.html` |
| `docs` | Card under the table of contents (1280px and up), else at the end of the page | `tells-docs-card.html` in `docs/baseof.html` |
| `404` | Line under the 404 message | `404.html` |

The docs card shares its spot with the support card: `docs-support-card.html`,
copy and address in `data/support.json` (schema: `schemas/support.schema.json`),
a Dispatch card so it never matches the Field-toned Tells card above it. Both
carry `docs-rail-card` plus `docs-rail-card-toc` or `-end`, and those rules in
`assets/scss/_styles_project.scss` decide which copy shows; a new rail card
takes the same classes. Its mailto subject names the page the reader was on.

The alternate home layouts (`/home-oil/`, `/home-reveille/`) do not render
`signal.html` and carry no band. Prose links in the docs (synced from the
product repository), the Field Manual, the Trust Center and the role and
solution FAQs stay untagged on purpose; `check_tells.py` ignores links without
UTM parameters.

## The announcement bar

The bar centers a group of the message text immediately followed by one CTA:
the "Am I a Bot?" label and the green Free pill share a single link to Tells
(`utm_content=bar`). Free appears only in the pill. The dismiss control is
pinned to the far right and kept clear of the CTA (equal side padding keeps
the group optically centered). Below 720px the bar shows `bar.text_short`
instead of `bar.text` on one line with the CTA; there is no wrap or ellipsis.

Dismissing the bar stores `dismissed` under `bar.storage_key`
(`bh-tells-bar-v1`) in localStorage. An inline script in the head
(`tells-bar-head.html`) sets `data-tells-bar="off"` on `<html>` before first
paint, so a returning reader never sees it flash or the header jump. To show
the bar again to everyone, bump the key (for example `bh-tells-bar-v2`). The
close button is hidden until the script runs, so without JavaScript the bar
simply stays. The bar scrolls away with the page; the mobile menu sheet sizes
itself from the header's real bottom edge (`--sheet-top`, `assets/js/nav.js`).

## Copy rules

Marketing placements say "browser", never "Chrome", and "computer", never
"Mac"; only the docs card says "Chrome profile" (docs are group (c) in
AGENTS.md). No prices, counts or em dashes. Do not claim more about Tells
than its own site says: free, runs in your browser, explains each signal,
verdict, Copy/Download JSON, an optional "prove you are human" drill, no
sign-up, keeps no copy and no logs, open source.
