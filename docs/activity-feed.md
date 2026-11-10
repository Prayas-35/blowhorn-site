# Hero activity feed

The home hero shows an activity card: who did something (avatar or monogram, name, platform, how long ago), the one-line result, the logo of each network it went to stacked on the avatar, a View profile button for a public profile, and round Previous / Next arrows. It asks the Blowhorn account service for the public event feed and shows what comes back while it is fresh. When the feed is empty, the request fails or the payload is invalid, it rotates a bundled example collection instead, labelled "Examples". The hero is never blank, and the first bundled example is in the HTML so the card reads with no JavaScript.

Public copy on the card says the fallback lines are examples. It does not name a cloud service, a price, or a browser.

## The contract

The feed is `GET <cloud_url>/api/events/feed` on the account service (`params.cloud_url` in `hugo.toml`, `https://cloud.blowhorn.ai`). No auth. The response shape is `EventFeedPage` and its items are `EventFeedItem`, both defined in meshery/schemas v1.3.117 (`schemas/constructs/v1beta3/event/api.yml`). That repository is the source of truth; nothing here redefines the contract.

| Piece | Value |
|---|---|
| Query | `page` (from 0), `pagesize` (default 20, max 50), optional `category`, `action`. The card asks for `page=0&pagesize=20&category=schedule&action=completed`. |
| Envelope | `{ page, pageSize, totalCount, data: EventFeedItem[] }`, newest first. |
| Required item fields | `id`, `userId` (UUIDs), `category`, `action`, `createdAt`, `visibility` (`public`), `platform` (one of the seven supported ids), `role` (3 to 40 characters), `line` (10 to 120). |
| Optional item fields | `networks`, `displayName`, `avatarUrl`, `organizationName`, `publicProfileUrl` (https), present only for a public profile. `displayName` (up to 200 characters) is the same value `PublicUser.username` carries for the owner, never an email, resolved for every served owner and omitted when empty. |
| `handle` (local extension) | Cloud has no `handle` field and meshery/schemas does not define one, so the JSON Schema projection leaves it out. For forward compatibility the script still accepts an optional `handle` (letters, digits and `. _ : / -`, up to 64 characters, a leading `@` stripped) and drops a malformed one without dropping the row. It never derives a handle from another field. With no handle the card hides the `[data-activity-handle]` slot and the name falls back from `displayName` to the role. If meshery/schemas adds a handle, re-project the schema and drop this row. |
| Caching | `Cache-Control: public, max-age=N`, N at most 30. Over the limit the service answers 429 with `Retry-After`. |
| Empty feed | `{ "page": 0, "pageSize": 20, "totalCount": 0, "data": [] }`. This is valid and is what the card sees until public events exist. |

`/api/public/activity-feed` is not the public feed (it answers 401); do not use it.

## What is wired

| Piece | Role |
|---|---|
| `schemas/event_feed_page.schema.json` | JSON Schema projection of `EventFeedPage` and `EventFeedItem` from meshery/schemas v1.3.117. Re-project it when the pinned version changes. |
| `schemas/activity_feed.examples.schema.json` | Local schema for the bundled file only: `{ example: true, data }`, each item a `$ref` to `EventFeedItem`. |
| `data/activity_feed.examples.json` | The collection baked into the home page. The envelope's `example: true` marks every item an example. |
| `layouts/_partials/activity-feed.html` | Static card (first example, Examples label), the `data-feed-url` attribute built from `params.cloud_url`, and a `script type="application/json"` block holding the examples. Loads the script fingerprinted and deferred, only where the card is rendered. |
| `layouts/_partials/home/signal.html`, `home/reveille.html` | Where the card sits in the hero. |
| `assets/js/activity-feed.js` | Validation (a JS mirror of `EventFeedItem`, run on every live payload), the transport, rotation and `createFeedSource`. |
| `assets/css/site.css` | Card layout, under "Hero activity card". A card-local palette (`--af-*` custom properties) that deliberately breaks from the site tokens, with a dark set under `prefers-color-scheme: dark` (the site's `data-theme` picks a token layer, not light or dark). |

Live payloads are checked by the JS validator, since the browser carries no JSON Schema engine; `make test-activity-feed` pins it to the contract (including the empty page). `make check-schemas` validates the bundled file against the local schema and the projected `EventFeedItem`.

## Example collection

75 items, all `category: schedule`, `action: completed`. Each line is one supported action on a platform that `data/integrations.json` marks supported and that `data/platforms/<id>.yaml` lists for that action. Ids and user ids are fixed UUIDs (v5) so the file satisfies the `uuid` format.

Actions used: post, comment, reply, amplify, react, follow, unfollow, accept, withdraw, find. Analytics is left out: this card shows no performance stats, counts, or outcomes.

Roles are generic personas. There is no display name, avatar, or profile URL. `createdAt` is a fixed date in October 2026. The card does not turn those into "just now" or "2m ago". Example rows show the label "Example activity".

The static HTML shows the first item in the same structure the script paints (Examples badge, monogram with its network badges, role as the name, platform name, line) with the note "Illustrative examples, not real customer activity." With script off, that first item stays. Previous and Next keep their space and stay hidden until the script is running, so the card does not jump.

## Runtime behaviour

`boot` reads the JSON block and the card's `data-feed-url`, and calls `createFeedSource({ transport, fallback })`. The transport is `fetch` with `credentials: "omit"` and no referrer, accepted only for an https URL. No URL (for example a build with no `cloud_url`) means a null transport: the bundled examples, with no request and no timer. No feed URL lives in the script.

Rotation is every 8 seconds (`INTERVAL_MS`). A swap lifts the outgoing content 6px with a slight blur (`SWAP_MS`, 160ms), then fades the incoming avatar, name, line and footer in with a short stagger (`ENTER_MS`), about 420ms in all on `cubic-bezier(.2,.7,.2,1)`. The incoming avatar is preloaded first (capped at 400ms), and the row after it is warmed after each paint, so it does not pop in. Rotation pauses while the pointer is over the card or focus is inside it, and while `document.hidden` is true. `prefers-reduced-motion: reduce` skips the timer, every transition and the Live pulse; Previous and Next still move one row instantly. The rotating line is not an `aria-live` region. The card's accessible name is the static "Recent activity" label. A feed refresh (each `ttlMs`) keeps the shown row when its id is still in the new list: it repaints in place, without animation, and the running interval carries on (`createRotation().sync`); otherwise the card starts again at the first row. `destroy` clears every timer and removes the listeners.

### The card

| Part | Behaviour |
|---|---|
| Header | "Live" with a pulsing dot for live rows, or the Examples badge for examples, then "Recent activity". Round 36px ghost arrows on the right, labelled "Previous activity" and "Next activity". |
| Identity | A 64px avatar (52px under 600px) with a stack of network badges overlapping at its bottom-right corner: one 24px white badge (22px under 600px) per network, white in dark mode too so the black X and GitHub marks stay visible, each set off from the one under it by a single surface-coloured gap ring and no border. The networks are the item's `networks`, else its `platform`, resolved by platform id or display name (`resolveNetwork`; "X (Twitter)" matches X), without repeats, in `PLATFORMS` order (the platform files' `weight` in the partial) and then any unknown names as first seen (`networksFor`). At most three badges show (`BADGE_CAP`): three networks show three logos, four or more show two logos and a "+N" badge named "Also on <hidden networks>" (`badgeStack`). An unknown network keeps a badge with its initial, named by its raw text. Each logo has the network's name as its `alt` and `title`; the photo or monogram is aria-hidden, since the name is already text. Names and logos come from `data/platforms/*.yaml` through the partial's `data-platforms` attribute; the script has no copy. The name is `displayName`, else `@handle`, else the role, with " at <organizationName>" when there is one and it is not the name itself. The meta line is "@handle · <Platform> · <relative time>" (the handle only when the name is a `displayName`), the time in a `<time datetime>`. |
| Relative time | `relativeTime(iso, now)`: "just now" under 45 seconds (and for a future time), "Nm ago", "Nh ago", "Nd ago" under 7 days, then "Nov 2" (with the year when it is not this year). Recomputed on every paint. |
| Line | 20px, weight 500, with two lines reserved (three on mobile). |
| Footer | For a live row with `publicProfileUrl`, a dark "View profile" pill named "View profile of <name>". The name is plain text; the pill is the only profile link. Examples never link. |
| Progress | Swatch dots (aria-hidden, not buttons): a sliding window of at most 8 that always holds the active row, with a smaller end dot (`af-dot-edge`) where more rows lie beyond it. The active one is ringed, and while autoplay is armed its ring draws in over the interval (`is-playing`, duration from `--af-interval`, which `mountActivityFeed` sets from the interval it arms). |
| `data-state` | `live`, `examples` or `empty` on the card root, for styling and tests. |
| Empty | When there are no rows at all (not even the bundled ones): a muted avatar stack, "No public activity yet" and "Completed activity shows up here as it happens.", with no arrows or dots. An empty live feed still shows the labelled examples. |

### Avatars

A live row's `avatarUrl` is requested only when it is https and its host is in `AVATAR_HOSTS` (the X, GitHub, LinkedIn, Bluesky, Slack and Reddit profile-picture CDNs plus Blowhorn's own account service, `cloud.blowhorn.ai`; Gravatar is left out because it follows `?d=` redirects to any host). The `<img>` has `alt=""` (the name is text), `referrerpolicy="no-referrer"`, `decoding="async"`, a fixed size and no `crossorigin`. When the URL changes, the image hides and the monogram shows until the new image fires `load` (a late `load` or `error` for an earlier URL is ignored), so the previous face never sits next to the new name. Any other host, an example row, or a load error shows the monogram instead: one or two initials (the first letter or digit of the first two words that have one, so "@ada" gives "A"; a name with no letter or digit, such as a single emoji, shows its first character) on a gradient whose hue is one of 12 steps from `monogramHue(userId)` (class `af-hue-<n>`, which also sets both gradient stops' lightness so white initials keep at least 4.5:1; the partial uses the same rule, so there is no inline style). The monogram makes no request.

A page is accepted only if it is an `EventFeedPage`: `page`, `pageSize` (1 to 50) and `totalCount` are integers in range, `data` is an array of at most 50 items, and there are no other top-level fields. Items are checked field by field: known fields only, UUIDs, the platform list, length limits, a valid `createdAt`, `https` URLs, no `javascript:` or `data:` URLs. Text is written with `textContent`. A live item's profile links use `rel="noopener noreferrer nofollow"` and `target="_blank"`. Example rows do not render them. Avatar URLs are requested only as described under Avatars. Invalid items are dropped.

The fallback to the bundled examples, with the Examples label, covers: an empty `data` array, a body that is not JSON or not an `EventFeedPage`, no valid items, a timeout (8 seconds), a thrown network error (including a blocked cross-origin request), any non-success status, and a response with no `max-age`. HTTP 429 also sets a wait from `Retry-After` (delta-seconds or an HTTP date) before the transport is called again; a missing or unreadable value waits 60 seconds.

Live items are held only for the response `max-age`, capped at 30 seconds. When it ends, the card asks once more. If that refresh fails, the live rows are dropped and the bundled examples take their place, labelled. Expired live rows are never the offline fallback. Nothing in this script writes `localStorage`, `sessionStorage`, `IndexedDB`, or a service-worker cache.

## Disclosure

The card's request goes to `cloud.blowhorn.ai`, Blowhorn's own account service, from the reader's browser. A live row's profile picture loads from the network the person uses or from Blowhorn's account service (only hosts in `AVATAR_HOSTS`), with no referrer. `.github/scripts/check-third-party.py` parses that constant and fails on any host missing from its reviewed `AVATAR_HOSTS` set, so a new host needs a reviewed checker change. The privacy page lists both with the other requests the site makes. Change the privacy page first if the request changes.

## Open items outside this repository

- CORS. As of 2026-11-09 the feed answers `Vary: Origin` but sends no `Access-Control-Allow-Origin` for `https://blowhorn.ai`, so a browser blocks the response and the card shows the examples. The account service needs to allow `https://blowhorn.ai` (and `https://www.blowhorn.ai`) on `GET /api/events/feed`. Until then the live path cannot be seen in a browser.
- Seed events. Cloud reported about 100 seed events from 25 fake accounts. EventFeedItem has no seed or example marker, so a seed event in the live feed would render as real activity. Cloud must keep seed events out of the public feed, or add a marker to the schema.
