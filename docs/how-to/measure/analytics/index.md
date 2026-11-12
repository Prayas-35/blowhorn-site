# Collect and read your analytics


> Collect LinkedIn and X follower numbers, read the history, one activity's result and the HTML report.



Collect follower numbers from LinkedIn and X, then read them back as dated
series in the app or the command line.

Blowhorn collects LinkedIn pages and X profiles. A Bluesky scope is accepted by
the command but collects nothing today, so scope your runs to `linkedin` and
`x`.

## Collect

```bash
blowhorn analytics --platform linkedin --profile ada --lookback 30
blowhorn analytics --platform x --profile all
```

LinkedIn exports honour `--lookback`; X appends a follower and following trend
row per profile. Each run prints a receipt of the rows it collected. In the
app, the "results" screen collects on demand with "collect now" and draws
the same series.

## Choose the LinkedIn pages

The LinkedIn pages a collection walks belong to your organization, not to a
fixed list. Manage them in the app from the Performance view's "linkedin
pages" card - add a page, switch one off, or remove it - or from the command
line:

```bash
blowhorn analytics pages
blowhorn analytics pages add Acme company 12345678
blowhorn analytics pages add AcmeBlog showcase https://www.linkedin.com/showcase/87654321/
blowhorn analytics pages remove AcmeBlog
```

Each page is a name, a kind (`company` or `showcase`) and the page's numeric
LinkedIn id; an add also accepts the page's LinkedIn URL and reads the kind
and id from it. Add `--disabled` to list a page without collecting from it,
and add it again without the flag to collect from it again. Collection walks
the enabled pages and only those, so two organizations sharing one install
each collect their own pages. When your organization has no pages yet, the
card in the app says "no company page connected yet" and its **connect page**
button takes you to the add form, which is right there.

An organization that has not configured any pages yet keeps collecting the
pages it collected before per-organization configuration. Run
`blowhorn analytics pages seed` once to write those pages into your
organization's list, then edit the list from there; seeding never overwrites
a list you have already made your own. With pages configured and every one
disabled, a collection says so in one line and collects nothing.

## Read the history

```bash
blowhorn analytics history --since 30d
blowhorn analytics history --subject ada --json
```

`history` renders every LinkedIn page and every X profile as one dated series
from your account, whichever computer collected it. `--since` takes days, weeks,
months, years or `all`, and filters which points print, never what the 30-day
figures compute from.

Treat the 30-day net, growth rate and unfollowed figures as derived, not
measured: the output labels them so. LinkedIn measures new followers, so only
LinkedIn pages carry an unfollowed figure. X measures nothing but the total,
so an X profile has a net change and no unfollowed figure at all.

A LinkedIn page also carries its reception: the latest impressions and
reactions, the date they were read, and their 30-day change (derived, like
the follower figures).

## Read one activity's result

```bash
blowhorn analytics activity 42
blowhorn analytics activity 42 --profile ada --json
```

`activity` takes a content activity number and answers, for each profile and
platform the activity is addressed to:

- **Delivery** (measured): whether it went out and when, the link to the live
  item, the computer and Google Chrome profile that ran it, and for a failed attempt
  the error and the fix to try next. An activity that is due but has not run
  yet reads as pending. One whose sending click was made but never read back
  reads as unconfirmed, with no link: check the platform before assuming it
  landed or that it did not.
- **Reception** (measured): the activity's own impressions, clicks, likes,
  comments, reposts and rates with the date they were read, compared with the
  median of the page's other activities. LinkedIn page activities only today;
  anywhere else it says reception isn't collected, never zero. A delivered
  LinkedIn activity that no export reading matches yet says the same, with
  the reason that no figures match it.
- **Follower change** (derived): followers at the reading before the activity
  and the first reading a week after it. It is a correlation, not a cause.

In the app, the same result is on the activity itself: open it under
**Activity › Upcoming** and its editor shows a **result** section - delivery
per profile and platform, reception labelled measured, and the follower
change labelled derived - read when you open the activity, and again when
you press its refresh. Under **Activity › History**, picking one of the
activity's runs shows the same result in place above its log, read when
you pick it.

A computer that is not connected to a store yet says so in one sentence and
exits 3.

## Read several activities' results at once

```bash
blowhorn analytics activities 164 165 166
blowhorn analytics activities 164 165 166 --json
```

`activities` prints the same result `activity` does for each number, in the
order given, from one set of reads of your account rather than one per
activity. A number your queue no longer has is listed as not found instead of
failing the rest. This is what the app's New order **Debrief** shows in
Performance for the posts an order just wrote.

## Import content exports

```bash
blowhorn analytics import-exports
blowhorn analytics import-exports data/analytics/layer5_content_20260719_033126.xls --dry-run --json
```

Each LinkedIn collection saves a page content export and imports its "All
posts" sheet into the store by itself. `import-exports` does the same for
exports already on disk: every `*_content_*.xls` under `data/analytics/` when
you name no paths. Each post is matched to the content activity whose promotion link
names it; a post with no matching activity is kept and marked unmatched. The output
verifies every file: activities read, matched, unmatched, skipped with the reason,
and stored. Importing the same export twice stores it once; `--dry-run` reads
and matches without storing.

A collection also stores the exports' daily series: the followers exports'
daily new followers and their location, job function, seniority, industry
and company-size breakdowns, and the content exports' daily impressions,
clicks, reactions, comments, reposts and engagement rate. The backfill for
exports already on disk is an operator step (`make store-ingest-linkedin-exports`);
it reads the same files and is safe to re-run.

Three rules govern those daily figures. A figure is never negative: the
store refuses one on every backend, the way the Cloud constructs bound
figures at zero. A blank cell in a later export leaves the stored figure
alone -- an export that did not report a figure did not report a zero,
and did not report that the figure became unknown -- while a blank on a
day no export has reported reads back as no figure. And two rows for one
day in one batch combine their figures rather than the last row winning
outright.

## Read the HTML report

```bash
blowhorn report
blowhorn report --no-open
```

`report` builds `data/analytics/analytics_report.html` and opens it;
`--no-open` writes the file and leaves it closed. Its LinkedIn figures come
from the store - the daily series and totals the exports landed on import -
so collect first when you want fresh numbers. When the store cannot be
reached, or holds nothing yet, the report falls back to the exports on disk.

## Related

- [Review what ran](/docs/how-to/measure/review-runs/) - per-computer operations from the same ledger
- [Schedule a job](/docs/how-to/schedule/schedule-a-job/) - collect on a schedule
- [Change your defaults](/docs/how-to/settings/defaults/) - pace, excluded profiles, logs
- [What the analytics numbers mean](/docs/explanation/analytics/) - measured versus trended

