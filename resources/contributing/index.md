# Contributing to Resources


> How to add an article, a tip or a video to the Blowhorn Resources center: content locations, front matter, templates, tagging rules and feed implications.


Resources is the customer-facing learning center at `/resources/`. It holds
articles, tips and videos on one shared collection platform: every collection
page has pagination, a search box and tag filtering, and every resource is
syndicated through RSS feeds. This guide covers how to add one. It is part of
blowhorn-site issue #253, phase 4.

## Where things live

- Articles and tips: `content/en/resources/articles/<slug>.md`. A tip is an
  article in short form, not a separate content type.
- Videos: `content/en/resources/videos/<category>/<slug>.md`, inside the
  category folder the video belongs to. Each category also has an `_index.md`
  page that names it.
- Tag pages: `content/en/resources/tags/<tag>.md`. These are feed pages, not
  articles: they carry the tag's feed, and they are excluded from the sitemap.
- Templates: `content/en/resources/articles/template-article.md` and
  `content/en/resources/videos/template-video.md`. Both are drafts and never
  publish. Copy one, rename it to the new slug, fill in every field, and set
  `draft` to false (articles use `draft: true` in the template front matter;
  the video template is a draft file for the same reason).

Do not move Field Manual or Dispatches content into Resources, and do not
add comments, reactions or per-user feeds. The feeds are public and identical
for everyone; personalization happens in the desktop app, not in the feed.

## Articles: front matter

Copy `template-article.md`. Every field in it is required:

- `title`: the headline, shown on cards and on the article page.
- `summary`: one or two sentences. This is the card text, the search text
  and the RSS item description, so write it for a reader deciding whether to
  click. The first paragraph of the body should open the argument, not
  repeat the summary.
- `date`: publication date, `YYYY-MM-DD`. Feeds and sorting use it.
- `author`: the byline, normally "Blowhorn team".
- `layout`: always `article`.
- `tags`: at least one tag. See the tagging rules below.
- `column`: exactly one of `desk-of-the-general` (From the Desk of the
  General - direction and strategy), `boot-camp` (From Boot Camp -
  Major Blowhorn's drill instruction) or `from-the-field` (From the
  Field - reports from active use). Every tip and every dated resource
  carries one; the feeds carry it as a `column:<value>` category
  element, and the desktop app labels pieces by it.

### Tips: two more required fields

A tip (an article tagged `tips`) also carries:

- `tipOrder`: its place in the bundled curriculum the desktop app
  teaches - the next free positive integer. Tips are bundled into the
  app and shown in this order, each one once.
- `video`: a tip never publishes without a video. Self-hosted files
  under `static/assets/video/tips/`: an `mp4`, a `webm`, and a 16:9
  `poster` image, plus a `duration` in `m:ss`. Keep tip videos short -
  one idea, under a minute. The tip page plays the video above the
  text, and the desktop bundle carries the same reference.
  `check_tips.py` (part of `make check`) fails a published tip with
  no video, a missing file, or a duplicated `tipOrder`, and fails any
  published article or video with no column or an unknown one.

Write the body in Markdown, short paragraphs, headings at `##` level, and
advice a reader can act on today. The article layout adds a Keep reading rail
from the same collection; there is nothing to configure for it.

## Videos: front matter

Copy `template-video.md` into a category folder. Every required field is
annotated in the template:

- `title`, `description` (one or two sentences, used on cards, search and
  feeds), `date` (`YYYY-MM-DD`; this site's model requires a date because
  feeds and recency sorting need one), `layout` (always `video`),
  `duration` (`m:ss`, shown on the card).
- `videoType`: `local` for a file the site hosts itself, with `mp4` and
  `webm` paths under `assets/video/` and a 16:9 poster image. `youtube` is
  reserved: YouTube embeds and YouTube-hosted poster images are new outside
  hosts, so the first embedded video ships with a privacy-page update in the
  same change, per the site's third-party rule. Self-hosted videos need no
  privacy update, and their posters are the site's own files.
- `column`: exactly one of `desk-of-the-general`, `boot-camp` or
  `from-the-field`, as for articles above.
- `categories`: the display name of the category folder the file lives in.
  The folder is the category; keep them equal. There is deliberately no
  categories taxonomy: a video's categories stay a plain parameter.
- `tags`: lowercase slugs; they become tag pages and filter chips.
- `featured` (optional): `true` puts the video at the top of the videos
  landing. One featured video at a time.

The videos landing shows category tabs, a tag filter and a search box, and a
card grid; clicking a card opens the player in a dialog, and the video also
has its own page. The detail page shows related videos, scored +1 per shared
tag and +2 per shared category. Body text under the player is optional:
notes, links or a transcript.

## Tagging rules

- Reuse an existing tag before inventing a new one. The current set is the
  set of files under `content/en/resources/tags/`.
- Tag slugs are lowercase. Add one topic tag before inventing a new one, and
  keep the tag list short: series membership plus one topic tag covers most
  pieces.
- A new tag needs its own tag page at `content/en/resources/tags/<tag>.md`,
  in the shape of the existing ones: `type: tagfeed`, `layout: tagfeed`,
  `feedTag: <tag>`, `outputs: ["resourcesfeed"]`, and sitemap disabled.
  Without that page the tag has a filter chip but no feed.
- Two tags are published contracts, not free text:
  - `in-product-intelligence` is the Product intelligence series. Its feed
    is read by the desktop homepage, so never rename the slug, and never
    tag an article with it unless it is part of that series.
  - `tips` marks a short tip, the pieces the desktop app rotates. Keep tips
    short and single-idea; a piece that needs a full argument is an article,
    not a tip.

## Feeds: what publishing triggers

Publishing a resource puts it in the feeds automatically:

- `/resources/feed.xml`: everything in Resources, newest first.
- `/resources/tags/<tag>/feed.xml`: one feed per tag.
- Feed items carry `title`, `link`, `description` (the article summary or
  video description), `pubDate` (from `date`), the item's tags as
  `category` elements, and its column as one more category element,
  `column:<value>`.

The Tips section at `/resources/tips/` lists every in-product
intelligence piece - the tips in `tipOrder` order, then the dated
Product intelligence pieces, newest first - each with its column, and
its column chips filter the list.

The desktop contract is `https://blowhorn.ai/resources/tags/in-product-intelligence/feed.xml`.
Any change to that URL or to the item shape must be flagged on the desktop
homepage issue before it ships. The script check in
`.github/scripts/check_feeds.py` runs as part of `make check`: it fails the
build on a missing or malformed feed, a missing item field, an unparseable
date, or a foreign item in the contract feed. This guide page itself is
excluded from the main feed with `resourcesFeed: false`, because a
contributor page is not a resource a reader subscribes to.

## Series cadence

The Product intelligence series launched with one article a week for the
first eight weeks, then reassessment. The briefs, in order, are: reading your
results, the scheduling craft, when a platform changes the rules, pace as a
feature, failed posts as data, one subscription with five ways in, the
activities you have not tried yet, and measuring a month of posting. A new
series article takes the next brief in order and the next weekly date; it
does not jump the queue or reuse a brief already published.

## Before the change lands

Site changes merge directly, without waiting for review, but the checks
still have to pass:

1. Run `make check` and fix what it flags, including the feed check above.
2. Check the built HTML in `public/`, not the source, for the new pages.
3. Screenshot the new pages at 390, 820 and 1440 pixels wide, in light and
   dark, with no horizontal scroll from 320 pixels wide.
4. If the change adds a new outside host (the first YouTube embed is the
   known case), update the privacy page in the same change.
5. In the change description, name the new pages and the feeds they appear
   in, so the next contributor can find them without re-reading this guide.

